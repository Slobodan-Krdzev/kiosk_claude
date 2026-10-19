// Guest prompt used by the API order adapter (tmkOrder.ts) while payment.start() is pending:
// the backend answered "Printing problem" → the old kiosk asked "continue without printing?" and, on Yes,
// re-sent the same order with ?skip=true (kiosk-payment-flow.md). The answer is given through the
// 'printProblem' confirm dialog (Overlays.tsx). Only one prompt can be open at a time.

import { useEngine } from '../store/engine'

let pending: ((go: boolean) => void) | null = null

/** Open the dialog and resolve with the guest's answer. A second call while one is open answers the first with false. */
export function askContinueWithoutReceipt(): Promise<boolean> {
  if (pending) pending(false)
  return new Promise<boolean>((resolve) => {
    pending = resolve
    useEngine.getState().setConfirm('printProblem')
  })
}

function answer(go: boolean): void {
  const r = pending
  pending = null
  if (useEngine.getState().confirm === 'printProblem') useEngine.getState().setConfirm(null)
  r?.(go)
}

/** "Continue without receipt": the same order is sent again with skip=true. */
export const printSkipYes = (): void => answer(true)
/** "Cancel": abortRequest, nothing more is sent. */
export const printSkipNo = (): void => answer(false)
/** True while the dialog waits for the guest. */
export const printPromptOpen = (): boolean => pending !== null
