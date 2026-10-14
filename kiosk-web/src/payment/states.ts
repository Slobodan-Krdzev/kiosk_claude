// Payment state machine tables — v36 reference §1–§2
// (failover-handover/docs/reference/kiosk-payment-and-recovery-v36.md).

export type PayStatus =
  | 'idle'
  | 'connecting'
  | 'waiting-for-card'
  | 'processing'
  | 'cancel-requested'
  | 'approved'
  | 'submitting'
  | 'order-submit-failed'
  | 'recovery-required'
  | 'done'
  | 'declined'
  | 'cancelled'
  | 'terminal-offline'
  | 'timeout'
  | 'lookup'
  | 'status-check'
  | 'assistance'

/** Allowed transitions. Anything else is a no-op with a warning. */
export const PAY_T: Record<PayStatus, PayStatus[]> = {
  idle: ['connecting'],
  connecting: ['waiting-for-card', 'terminal-offline', 'cancelled', 'cancel-requested'],
  // Deviation from v36: terminal-offline also allowed here so a late "offline" answer is not lost.
  'waiting-for-card': ['processing', 'cancelled', 'timeout', 'cancel-requested', 'terminal-offline'],
  processing: ['approved', 'declined', 'timeout', 'cancelled'],
  'cancel-requested': ['cancelled', 'approved', 'timeout', 'processing'],
  approved: ['submitting'],
  submitting: ['done', 'order-submit-failed'],
  'order-submit-failed': ['recovery-required'],
  'recovery-required': ['submitting'],
  declined: ['idle', 'connecting'],
  cancelled: ['idle', 'connecting'],
  'terminal-offline': ['connecting', 'idle'],
  timeout: ['lookup', 'idle'],
  lookup: ['approved', 'idle', 'timeout'],
  'status-check': ['approved', 'idle', 'assistance', 'recovery-required'],
  assistance: ['submitting', 'lookup'],
  done: ['idle'],
}

export const PAY_ACTIVE: ReadonlySet<PayStatus> = new Set<PayStatus>(['connecting', 'waiting-for-card', 'processing', 'approved', 'submitting', 'lookup'])

export const PAY_UNCERTAIN: ReadonlySet<PayStatus> = new Set<PayStatus>([
  'processing',
  'approved',
  'submitting',
  'order-submit-failed',
  'recovery-required',
  'lookup',
  'timeout',
  'assistance',
  'status-check',
  'cancel-requested',
])

/** Statuses in which money may have moved. */
export const MAY_HAVE_SUCCEEDED: ReadonlySet<PayStatus> = new Set<PayStatus>([
  'processing',
  'approved',
  'submitting',
  'order-submit-failed',
  'recovery-required',
  'lookup',
  'timeout',
  'done',
  'assistance',
])

/** Final "nothing charged" statuses. */
export const NOTHING_CHARGED: ReadonlySet<PayStatus> = new Set<PayStatus>(['declined', 'cancelled', 'terminal-offline'])

export type SubmissionState = 'starting' | 'cancel-requested' | 'timeout' | 'approved' | 'submitting' | 'order-submit-failed' | 'accepted'
