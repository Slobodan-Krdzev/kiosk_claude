// Tap rescue: down + up on the same enabled button and no native click → the kiosk clicks it once; a native
// click (on time or late) never makes it act twice; scrolls, moves, long presses and disabled buttons are left alone.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RESCUE_MS, startTapRescue } from './tapRescue'

const pe = (type: string, el: Element, init: Partial<PointerEventInit> = {}) =>
  el.dispatchEvent(new (window.PointerEvent ?? MouseEvent)(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, clientX: 100, clientY: 100, pointerType: 'touch', ...init } as PointerEventInit))

describe('tap rescue', () => {
  let btn: HTMLButtonElement
  let label: SVGElement
  let onClick: ReturnType<typeof vi.fn<() => void>>
  let stop: () => void
  let log: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = '<button data-a="toPay">Afrekenen <svg></svg></button><button id="other">x</button>'
    btn = document.querySelector('button')!
    label = btn.querySelector('svg')!
    onClick = vi.fn<() => void>()
    btn.addEventListener('click', onClick)
    log = vi.fn()
    stop = startTapRescue(document, log)
  })
  afterEach(() => {
    stop()
    vi.useRealTimers()
  })

  it('down and up on the label with no native click → the button is clicked once, and logged', () => {
    pe('pointerdown', label)
    pe('pointerup', label)
    vi.advanceTimersByTime(RESCUE_MS + 5)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith('tap.rescued', expect.objectContaining({ button: 'toPay' }))
  })

  it('a native click on time → nothing extra', () => {
    pe('pointerdown', label)
    pe('pointerup', label)
    btn.click()
    vi.advanceTimersByTime(RESCUE_MS + 5)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(log).not.toHaveBeenCalled()
  })

  it('a late native click after the rescue is swallowed (the tap acts once)', () => {
    pe('pointerdown', label)
    pe('pointerup', label)
    vi.advanceTimersByTime(RESCUE_MS + 5)
    btn.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('scroll (pointercancel), a moved finger, a long press, another button or a disabled button → no rescue', () => {
    pe('pointerdown', label)
    pe('pointercancel', label)
    pe('pointerup', label)
    pe('pointerdown', label)
    pe('pointerup', label, { clientX: 160 })
    pe('pointerdown', label)
    vi.advanceTimersByTime(900)
    pe('pointerup', label)
    pe('pointerdown', label)
    pe('pointerup', document.getElementById('other')!)
    vi.advanceTimersByTime(RESCUE_MS + 5)
    btn.disabled = true
    pe('pointerdown', label)
    pe('pointerup', label)
    vi.advanceTimersByTime(RESCUE_MS + 5)
    expect(onClick).not.toHaveBeenCalled()
  })
})
