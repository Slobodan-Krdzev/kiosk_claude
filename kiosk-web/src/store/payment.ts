import { useSyncExternalStore } from 'react'
import type { PaymentController, PayState } from '../payment/controller'

const EMPTY: PayState = {
  status: 'idle',
  orderSession: '',
  orderId: null,
  attempt: 0,
  attemptId: null,
  txRef: null,
  txRefGenerated: false,
  submitKey: null,
  recoveryRef: null,
  snapshot: null,
  orderNo: null,
  accepted: false,
  duplicate: false,
  receipt: 'none',
  uncertainReason: null,
  assistanceNeeded: false,
  rawRecovery: null,
  storeFailed: false,
  restored: false,
  lastError: null,
}

// React components may subscribe before the runtime (and its controller) exists.
// Listeners are kept here and forwarded once the controller is attached.
const listeners = new Set<() => void>()
let attached: PaymentController | null = null
let detach: (() => void) | null = null

export function attachPayState(controller: PaymentController): void {
  detach?.()
  attached = controller
  detach = controller.subscribe(() => {
    for (const l of listeners) l()
  })
  for (const l of listeners) l()
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function snapshot(): PayState {
  return attached ? attached.state : EMPTY
}

export function usePayState(): PayState {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}
