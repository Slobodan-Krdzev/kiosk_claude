// Fullscreen by gesture (2026-10-19). Browsers only allow fullscreen with a user activation. A mouse gets that
// activation on press, so a 3 s hold can call requestFullscreen() directly. Touch screens get it only for a
// completed TAP (Chrome: gesture tap after touchend); a long press never grants it, which is why a pure hold
// cannot work on a kiosk panel. So: hold the logo 3 s → a "Volledig scherm" pill appears → one tap on it
// requests fullscreen from inside the click. The direct attempt at the 3 s mark is still made (mouse, and any
// browser that grants activation on press); if it succeeds the pill never shows.

import { useSyncExternalStore } from 'react'
import { pauseStickyFullscreen, resumeStickyFullscreen } from './kioskMode'
import { getRuntime } from './runtime'

export const LOGO_HOLD_MS = 3000
/** The pill goes away by itself after this long. */
export const FS_PROMPT_MS = 8000
/** A finger that travels further than this is a pan, not a hold. */
export const HOLD_SLOP_PX = 40
/** Elements that take the hold: the attract hero logo and the rail logo button. */
export const LOGO_SEL = '.hero-lockup img, [data-a="attract"]'

type FsState = { prompt: boolean; on: boolean }

const fsOn = (): boolean => typeof document !== 'undefined' && !!document.fullscreenElement
let state: FsState = { prompt: false, on: fsOn() }
const subs = new Set<() => void>()
let promptTimer: ReturnType<typeof setTimeout> | null = null

function set(p: Partial<FsState>): void {
  state = { ...state, ...p }
  subs.forEach((f) => f())
}

const log = (event: string, data?: Record<string, unknown>): void => {
  try {
    getRuntime().log(event, data)
  } catch {
    /* before boot */
  }
}

export function fullscreenSupported(): boolean {
  return typeof document !== 'undefined' && !!document.fullscreenEnabled && typeof document.documentElement.requestFullscreen === 'function'
}

export const fsStore = {
  subscribe(cb: () => void): () => void {
    subs.add(cb)
    return () => {
      subs.delete(cb)
    }
  },
  get: (): FsState => state,
}

export function useFullscreenState(): FsState {
  return useSyncExternalStore(fsStore.subscribe, fsStore.get, fsStore.get)
}

export function showPrompt(): void {
  if (promptTimer) clearTimeout(promptTimer)
  promptTimer = setTimeout(hidePrompt, FS_PROMPT_MS)
  set({ prompt: true })
}

export function hidePrompt(): void {
  if (promptTimer) clearTimeout(promptTimer)
  promptTimer = null
  if (state.prompt) set({ prompt: false })
}

/** Enter when not fullscreen, leave when fullscreen. Resolves true when the browser did it. */
export async function toggleFullscreen(): Promise<boolean> {
  try {
    if (document.fullscreenElement) {
      // Staff left fullscreen on purpose: sticky fullscreen stays off until the next start (kioskMode.ts).
      pauseStickyFullscreen()
      await document.exitFullscreen()
      log('fullscreen.exit')
    } else {
      resumeStickyFullscreen()
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      log('fullscreen.enter')
    }
    hidePrompt()
    return true
  } catch (err) {
    log('fullscreen.refused', { error: err instanceof Error ? err.message : String(err) })
    return false
  }
}

/**
 * Installs the hold watcher on the document. Returns the cleanup. Hold = pointerdown on a logo, no release and
 * no travel beyond HOLD_SLOP_PX for LOGO_HOLD_MS. At the mark: direct attempt; if refused (touch), the pill.
 * A pointercancel without travel (Chrome's long-press handling) does not cancel the hold; a pan does.
 */
export function startLogoHoldWatch(): () => void {
  if (!fullscreenSupported()) return () => {}
  let timer: ReturnType<typeof setTimeout> | null = null
  let start: { x: number; y: number; id: number } | null = null
  const clear = () => {
    if (timer) clearTimeout(timer)
    timer = null
    start = null
  }
  const isLogo = (t: EventTarget | null) => t instanceof Element && !!t.closest(LOGO_SEL)
  const onDown = (e: PointerEvent) => {
    if (!isLogo(e.target) || !e.isPrimary) return
    clear()
    start = { x: e.clientX, y: e.clientY, id: e.pointerId }
    timer = setTimeout(() => {
      timer = null
      start = null
      log('fullscreen.hold')
      void toggleFullscreen().then((ok) => {
        if (!ok) showPrompt()
      })
    }, LOGO_HOLD_MS)
  }
  const onMove = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > HOLD_SLOP_PX) clear()
  }
  const onUp = (e: PointerEvent) => {
    if (start && e.pointerId === start.id) clear()
  }
  const onCancel = (e: PointerEvent) => {
    // Only a pan cancels. Chrome may cancel the pointer stream when it recognises a long press even though
    // the finger has not moved; the hold timer keeps running in that case.
    if (start && e.pointerId === start.id && Math.hypot(e.clientX - start.x, e.clientY - start.y) > HOLD_SLOP_PX) clear()
  }
  const onContext = (e: Event) => {
    if (isLogo(e.target)) e.preventDefault()
  }
  const onFsChange = () => {
    set({ on: fsOn(), prompt: false })
    if (promptTimer) clearTimeout(promptTimer)
    promptTimer = null
  }
  document.addEventListener('pointerdown', onDown, true)
  document.addEventListener('pointermove', onMove, true)
  document.addEventListener('pointerup', onUp, true)
  document.addEventListener('pointercancel', onCancel, true)
  document.addEventListener('contextmenu', onContext, true)
  document.addEventListener('fullscreenchange', onFsChange)
  return () => {
    clear()
    hidePrompt()
    document.removeEventListener('pointerdown', onDown, true)
    document.removeEventListener('pointermove', onMove, true)
    document.removeEventListener('pointerup', onUp, true)
    document.removeEventListener('pointercancel', onCancel, true)
    document.removeEventListener('contextmenu', onContext, true)
    document.removeEventListener('fullscreenchange', onFsChange)
  }
}
