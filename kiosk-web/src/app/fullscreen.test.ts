// Fullscreen by gesture: hold the logo 3 s. Touch grants no activation for a long press, so the direct attempt
// is refused and the pill appears; a tap on the pill (a real click) succeeds. Mouse: the direct attempt works.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FS_PROMPT_MS, HOLD_SLOP_PX, LOGO_HOLD_MS, fsStore, hidePrompt, startLogoHoldWatch, toggleFullscreen } from './fullscreen'

vi.mock('./runtime', () => ({ getRuntime: () => ({ log: () => {} }) }))

function pe(type: string, target: Element, init: Partial<PointerEventInit> = {}) {
  const ev = new (window.PointerEvent ?? MouseEvent)(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, clientX: 100, clientY: 100, ...init } as PointerEventInit)
  target.dispatchEvent(ev)
}

describe('logo hold → fullscreen', () => {
  let logo: HTMLImageElement
  let request: ReturnType<typeof vi.fn>
  let stop: () => void
  let fsElement: Element | null = null

  beforeEach(() => {
    vi.useFakeTimers()
    fsElement = null
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, get: () => true })
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => fsElement })
    request = vi.fn()
    ;(document.documentElement as unknown as { requestFullscreen: unknown }).requestFullscreen = request
    ;(document as unknown as { exitFullscreen: unknown }).exitFullscreen = vi.fn().mockResolvedValue(undefined)
    document.body.innerHTML = '<div class="hero-lockup"><img alt="logo" /></div><button data-a="cardInc">+</button>'
    logo = document.querySelector('img')!
    stop = startLogoHoldWatch()
  })
  afterEach(() => {
    stop()
    hidePrompt()
    vi.useRealTimers()
  })

  it('touch: refused at the 3 s mark → pill; a tap on the pill enters fullscreen', async () => {
    request.mockRejectedValueOnce(new TypeError('Permissions check failed')).mockResolvedValueOnce(undefined)
    pe('pointerdown', logo, { pointerType: 'touch' })
    await vi.advanceTimersByTimeAsync(LOGO_HOLD_MS + 5)
    expect(request).toHaveBeenCalledTimes(1)
    expect(fsStore.get().prompt).toBe(true)
    const ok = await toggleFullscreen() // the pill's click handler
    expect(ok).toBe(true)
    expect(request).toHaveBeenCalledTimes(2)
    expect(fsStore.get().prompt).toBe(false)
  })

  it('mouse: the direct attempt succeeds and no pill is shown', async () => {
    request.mockResolvedValueOnce(undefined)
    pe('pointerdown', logo, { pointerType: 'mouse' })
    await vi.advanceTimersByTimeAsync(LOGO_HOLD_MS + 5)
    expect(request).toHaveBeenCalledTimes(1)
    expect(fsStore.get().prompt).toBe(false)
  })

  it('an early release or a pan cancels the hold', async () => {
    pe('pointerdown', logo, { pointerType: 'touch' })
    await vi.advanceTimersByTimeAsync(1000)
    pe('pointerup', logo, { pointerType: 'touch' })
    await vi.advanceTimersByTimeAsync(LOGO_HOLD_MS)
    expect(request).not.toHaveBeenCalled()
    pe('pointerdown', logo, { pointerType: 'touch' })
    await vi.advanceTimersByTimeAsync(1000)
    pe('pointermove', logo, { pointerType: 'touch', clientX: 100 + HOLD_SLOP_PX + 5, clientY: 100 })
    await vi.advanceTimersByTimeAsync(LOGO_HOLD_MS)
    expect(request).not.toHaveBeenCalled()
  })

  it("Chrome's long-press pointercancel without travel does not cancel the hold", async () => {
    request.mockRejectedValueOnce(new TypeError('no activation'))
    pe('pointerdown', logo, { pointerType: 'touch' })
    await vi.advanceTimersByTimeAsync(600)
    pe('pointercancel', logo, { pointerType: 'touch' })
    await vi.advanceTimersByTimeAsync(LOGO_HOLD_MS)
    expect(request).toHaveBeenCalledTimes(1)
    expect(fsStore.get().prompt).toBe(true)
  })

  it('a hold on anything else does nothing; the pill goes away by itself', async () => {
    const btn = document.querySelector('button')!
    pe('pointerdown', btn, { pointerType: 'touch' })
    await vi.advanceTimersByTimeAsync(LOGO_HOLD_MS + 5)
    expect(request).not.toHaveBeenCalled()
    request.mockRejectedValueOnce(new TypeError('no activation'))
    pe('pointerdown', logo, { pointerType: 'touch' })
    await vi.advanceTimersByTimeAsync(LOGO_HOLD_MS + 5)
    expect(fsStore.get().prompt).toBe(true)
    await vi.advanceTimersByTimeAsync(FS_PROMPT_MS + 5)
    expect(fsStore.get().prompt).toBe(false)
  })
})
