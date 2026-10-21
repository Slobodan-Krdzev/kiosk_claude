// Kiosk mode in the browser (PWA, 2026-10-21, Alex: "start and always stay in full screen mode").
//
// - Installed as a PWA, the manifest's `display: fullscreen` starts the kiosk fullscreen with no browser UI.
// - In a plain browser tab, browsers forbid fullscreen without a user gesture, so "always" is enforced from the
//   first touch on: every tap re-enters fullscreen if the kiosk is not in it (sticky fullscreen). A staff member who
//   leaves fullscreen with the logo hold pauses this until the next start.
// - The screen is kept awake (Screen Wake Lock, re-taken after the page becomes visible again) and portrait is locked
//   where the browser allows it. Both need a secure context (https or localhost); on plain http they are skipped.

type Log = (event: string, data?: Record<string, unknown>) => void

let paused = false
export const pauseStickyFullscreen = (): void => {
  paused = true
}
export const resumeStickyFullscreen = (): void => {
  paused = false
}
export const stickyPaused = (): boolean => paused

export function displayMode(): 'fullscreen' | 'standalone' | 'browser' {
  const mm = (q: string) => typeof window !== 'undefined' && !!window.matchMedia?.(`(display-mode: ${q})`).matches
  return mm('fullscreen') ? 'fullscreen' : mm('standalone') ? 'standalone' : 'browser'
}

async function lockPortrait(log: Log): Promise<void> {
  const o = (screen as Screen & { orientation?: ScreenOrientation & { lock?: (o: string) => Promise<void> } }).orientation
  try {
    await o?.lock?.('portrait')
  } catch (e) {
    log('kiosk.orientationLock', { error: e instanceof Error ? e.message : String(e) })
  }
}

/** Re-enter fullscreen on every tap while the kiosk is not fullscreen. Returns the cleanup. */
export function startStickyFullscreen(doc: Document = document, log: Log = () => {}): () => void {
  const supported = !!doc.fullscreenEnabled && typeof doc.documentElement.requestFullscreen === 'function'
  if (!supported) return () => {}
  const onTap = () => {
    if (paused || doc.fullscreenElement) return
    void doc.documentElement
      .requestFullscreen({ navigationUI: 'hide' })
      .then(() => {
        log('kiosk.fullscreen', { via: 'tap' })
        void lockPortrait(log)
      })
      .catch((e: unknown) => log('kiosk.fullscreenRefused', { error: e instanceof Error ? e.message : String(e) }))
  }
  doc.addEventListener('click', onTap, true)
  doc.addEventListener('touchend', onTap, true)
  return () => {
    doc.removeEventListener('click', onTap, true)
    doc.removeEventListener('touchend', onTap, true)
  }
}

/** Keep the screen on. Returns the cleanup. */
export function startWakeLock(log: Log = () => {}): () => void {
  const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock
  if (!wl) {
    log('kiosk.wakeLockUnavailable', { secure: typeof isSecureContext !== 'undefined' ? isSecureContext : null })
    return () => {}
  }
  let lock: { release: () => Promise<void> } | null = null
  const take = async () => {
    if (document.visibilityState !== 'visible') return
    try {
      lock = await wl.request('screen')
    } catch (e) {
      log('kiosk.wakeLockRefused', { error: e instanceof Error ? e.message : String(e) })
    }
  }
  const onVis = () => void take()
  void take()
  document.addEventListener('visibilitychange', onVis)
  return () => {
    document.removeEventListener('visibilitychange', onVis)
    void lock?.release().catch(() => undefined)
  }
}
