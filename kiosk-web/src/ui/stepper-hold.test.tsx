// Hold-to-remove on the cart stepper (2026-10-19): holding the minus button arms it as a remove button;
// the release of the hold is not a tap; a tap then removes the whole line; a plain tap still lowers by one.

import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOLD_TO_REMOVE_MS, Stepper } from './primitives'

vi.mock('../engine/state', () => ({
  E: () => ({ cms: { brand: { controls: { radius: 12 } } }, icons: { minus: 'M5 12h14', plus: 'M12 5v14M5 12h14', trash: 'M3 6h18' } }),
  L: (v: unknown) => String(v),
  t: (k: string) => k,
  tf: (k: string, p: Record<string, unknown>) => `${k}:${JSON.stringify(p)}`,
}))
vi.mock('../store/engine', () => ({ useEngine: () => ({}) }))
vi.mock('../engine/money', () => ({ fmt: (c: number) => String(c) }))

describe('Stepper hold-to-remove', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  function mount(qty = 3) {
    const onDelta = vi.fn()
    const onRemove = vi.fn()
    const r = render(<Stepper qty={qty} onDelta={onDelta} onRemove={onRemove} name="Ramen" />)
    const minus = r.getAllByRole('button')[0]
    return { minus, onDelta, onRemove }
  }

  it('a plain tap lowers the quantity by one', () => {
    const { minus, onDelta, onRemove } = mount()
    fireEvent.pointerDown(minus)
    fireEvent.pointerUp(minus)
    fireEvent.click(minus)
    expect(onDelta).toHaveBeenCalledWith(-1)
    expect(onRemove).not.toHaveBeenCalled()
    expect(minus.className).not.toContain('del')
  })

  it('holding arms the button; the release is swallowed; the next tap removes the whole line', () => {
    const { minus, onDelta, onRemove } = mount()
    fireEvent.pointerDown(minus)
    act(() => {
      vi.advanceTimersByTime(HOLD_TO_REMOVE_MS + 10)
    })
    expect(minus.className).toContain('del')
    expect(minus.getAttribute('aria-label')).toContain('removeA')
    fireEvent.pointerUp(minus)
    fireEvent.click(minus) // the click that ends the hold
    expect(onDelta).not.toHaveBeenCalled()
    expect(onRemove).not.toHaveBeenCalled()
    fireEvent.pointerDown(minus)
    fireEvent.pointerUp(minus)
    fireEvent.click(minus)
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onDelta).not.toHaveBeenCalled()
    expect(minus.className).not.toContain('del')
  })

  it('a short press never arms', () => {
    const { minus, onDelta } = mount()
    fireEvent.pointerDown(minus)
    act(() => {
      vi.advanceTimersByTime(HOLD_TO_REMOVE_MS - 100)
    })
    fireEvent.pointerUp(minus)
    fireEvent.click(minus)
    expect(minus.className).not.toContain('del')
    expect(onDelta).toHaveBeenCalledWith(-1)
  })

  it('an armed button goes back to minus after a while', () => {
    const { minus } = mount()
    fireEvent.pointerDown(minus)
    act(() => {
      vi.advanceTimersByTime(HOLD_TO_REMOVE_MS + 10)
    })
    fireEvent.pointerUp(minus)
    fireEvent.click(minus)
    expect(minus.className).toContain('del')
    act(() => {
      vi.advanceTimersByTime(4100)
    })
    expect(minus.className).not.toContain('del')
  })

  it('without onRemove a hold does nothing special', () => {
    const onDelta = vi.fn()
    const r = render(<Stepper qty={3} onDelta={onDelta} />)
    const minus = r.getAllByRole('button')[0]
    fireEvent.pointerDown(minus)
    act(() => {
      vi.advanceTimersByTime(HOLD_TO_REMOVE_MS + 10)
    })
    fireEvent.pointerUp(minus)
    fireEvent.click(minus)
    expect(minus.className).not.toContain('del')
    expect(onDelta).toHaveBeenCalledWith(-1)
  })
})
