// Tap rescue (2026-10-21, Alex: "if you click on the text or icon the button doesn't trigger").
//
// On some touch panels a tap that lands on a button's label never becomes a `click`, although pointerdown and
// pointerup both reach the button. Rather than depend on the browser for that, the kiosk watches every press:
// finger down and up on the same enabled button, short, without moving → if no native click arrives within
// RESCUE_MS, the kiosk clicks the button itself. A native click that still arrives late is swallowed, so a tap
// can never act twice. Scrolls (pointercancel, travel) and long presses are left alone.

export const RESCUE_MS = 350
const MAX_PRESS_MS = 700
const SLOP_PX = 18
const LATE_CLICK_MS = 1000

type Log = (event: string, data?: Record<string, unknown>) => void

const SEL = 'button, [role="button"], a[href]'

function target(e: Event): HTMLElement | null {
  const el = e.target instanceof Element ? e.target : null
  return (el?.closest(SEL) as HTMLElement | null) ?? null
}

function enabled(b: HTMLElement): boolean {
  return b.isConnected && !(b as HTMLButtonElement).disabled && b.getAttribute('aria-disabled') !== 'true'
}

export function startTapRescue(doc: Document = document, log: Log = () => {}): () => void {
  let down: { btn: HTMLElement; id: number; x: number; y: number; t: number } | null = null
  let pending: { btn: HTMLElement; timer: ReturnType<typeof setTimeout> } | null = null
  let rescued: { btn: HTMLElement; t: number } | null = null
  let synthetic = false

  const clearPending = () => {
    if (pending) clearTimeout(pending.timer)
    pending = null
  }

  const onDown = (e: PointerEvent) => {
    if (!e.isPrimary) return
    const btn = target(e)
    down = btn && enabled(btn) ? { btn, id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now() } : null
  }

  const onUp = (e: PointerEvent) => {
    const d = down
    down = null
    if (!d || e.pointerId !== d.id) return
    const btn = target(e)
    const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y) > SLOP_PX
    if (btn !== d.btn || moved || Date.now() - d.t > MAX_PRESS_MS) return
    clearPending()
    pending = {
      btn,
      timer: setTimeout(() => {
        pending = null
        if (!enabled(btn)) return
        log('tap.rescued', { button: btn.getAttribute('data-a') || btn.id || btn.tagName.toLowerCase(), text: (btn.textContent || '').trim().slice(0, 24), pointerType: e.pointerType })
        rescued = { btn, t: Date.now() }
        synthetic = true
        try {
          btn.click()
        } finally {
          synthetic = false
        }
      }, RESCUE_MS),
    }
  }

  const onCancel = () => {
    down = null
  }

  const onClick = (e: MouseEvent) => {
    if (synthetic) return
    const btn = target(e)
    if (pending && btn === pending.btn) clearPending() // the browser delivered it: nothing to do
    if (rescued && btn === rescued.btn && Date.now() - rescued.t < LATE_CLICK_MS) {
      // A native click after our rescue: the tap already acted once.
      e.stopImmediatePropagation()
      e.preventDefault()
      rescued = null
    }
  }

  doc.addEventListener('pointerdown', onDown, true)
  doc.addEventListener('pointerup', onUp, true)
  doc.addEventListener('pointercancel', onCancel, true)
  doc.addEventListener('click', onClick, true)
  return () => {
    clearPending()
    doc.removeEventListener('pointerdown', onDown, true)
    doc.removeEventListener('pointerup', onUp, true)
    doc.removeEventListener('pointercancel', onCancel, true)
    doc.removeEventListener('click', onClick, true)
  }
}
