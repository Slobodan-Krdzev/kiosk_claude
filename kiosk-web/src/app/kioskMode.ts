// Fullscreen from the first tap (2026-10-21, Alex: "make the app go full screen upon the first click — either the
// language menu or the bottom buttons").
//
// Browsers only allow fullscreen inside a user gesture, so the kiosk cannot enter it at load. The first tap anywhere
// (language pill, "Hier eten" / "Meenemen", voucher …) enters fullscreen, and the tap still does its normal job.
// If anything leaves fullscreen later, the next tap re-enters it. Staff who leave on purpose with the 3 s logo hold
// pause this until the next start.

type Log = (event: string, data?: Record<string, unknown>) => void

let paused = false
export const pauseStickyFullscreen = (): void => {
  paused = true
}
export const resumeStickyFullscreen = (): void => {
  paused = false
}

/** Enter fullscreen on a tap whenever the kiosk is not fullscreen. Returns the cleanup. */
export function startStickyFullscreen(doc: Document = document, log: Log = () => {}): () => void {
  const supported = !!doc.fullscreenEnabled && typeof doc.documentElement.requestFullscreen === 'function'
  if (!supported) return () => {}
  const onTap = () => {
    if (paused || doc.fullscreenElement) return
    void doc.documentElement
      .requestFullscreen({ navigationUI: 'hide' })
      .then(() => log('kiosk.fullscreen', { via: 'tap' }))
      .catch((e: unknown) => log('kiosk.fullscreenRefused', { error: e instanceof Error ? e.message : String(e) }))
  }
  // click covers mouse and touch; touchend covers touch screens whose browser drops the click (tapRescue.ts).
  doc.addEventListener('click', onTap, true)
  doc.addEventListener('touchend', onTap, true)
  return () => {
    doc.removeEventListener('click', onTap, true)
    doc.removeEventListener('touchend', onTap, true)
  }
}
