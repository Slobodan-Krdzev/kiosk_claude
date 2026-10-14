// Durable paid-order record — v36 reference §5. Schema 3.
// Local storage is NEVER proof of payment; it only tells the kiosk what to verify after a restart.

import type { OrderSnapshot } from '../domain/types'
import type { SubmissionState } from './states'

export const PAID_RECORD_KEY = 'guestit.paidOrder.v3'

export interface PaidRecord {
  schemaVersion: 3
  deviceId: string
  orderId: string
  orderSessionId: string
  paymentAttemptId: string
  transactionReference: string | null
  idempotencyKey: string
  startedAt: string
  paidAt: string | null
  snapshot: OrderSnapshot
  recoveryReference: string | null
  submissionState: SubmissionState
  accepted: boolean
  orderNo: string | null
  savedAt: string
}

const SUBMISSION_STATES: SubmissionState[] = ['starting', 'cancel-requested', 'timeout', 'approved', 'submitting', 'order-submit-failed', 'accepted']

export function isValidRecord(x: unknown): x is PaidRecord {
  if (!x || typeof x !== 'object') return false
  const r = x as Record<string, unknown>
  return (
    r.schemaVersion === 3 &&
    typeof r.deviceId === 'string' &&
    typeof r.orderId === 'string' &&
    r.orderId.length > 0 &&
    typeof r.orderSessionId === 'string' &&
    typeof r.paymentAttemptId === 'string' &&
    r.paymentAttemptId.length > 0 &&
    typeof r.idempotencyKey === 'string' &&
    r.idempotencyKey === `IDEMP-${r.orderId}` &&
    typeof r.startedAt === 'string' &&
    !!r.snapshot &&
    typeof r.snapshot === 'object' &&
    Array.isArray((r.snapshot as Record<string, unknown>).lines) &&
    typeof r.submissionState === 'string' &&
    SUBMISSION_STATES.includes(r.submissionState as SubmissionState) &&
    typeof r.accepted === 'boolean'
  )
}

export type ReadResult = { kind: 'none' } | { kind: 'ok'; record: PaidRecord } | { kind: 'invalid'; raw: string }

export interface PaidRecordStore {
  /** Write and read back (write-verify). Returns false when storage is unusable. */
  write(record: PaidRecord): boolean
  read(): ReadResult
  clear(): void
}

export class LocalStoragePaidRecordStore implements PaidRecordStore {
  write(record: PaidRecord): boolean {
    try {
      const json = JSON.stringify(record)
      localStorage.setItem(PAID_RECORD_KEY, json)
      return localStorage.getItem(PAID_RECORD_KEY) === json
    } catch {
      return false
    }
  }

  read(): ReadResult {
    let raw: string | null
    try {
      raw = localStorage.getItem(PAID_RECORD_KEY)
    } catch {
      return { kind: 'none' }
    }
    if (raw === null || raw === '') return { kind: 'none' }
    try {
      const parsed: unknown = JSON.parse(raw)
      if (isValidRecord(parsed)) return { kind: 'ok', record: parsed }
      return { kind: 'invalid', raw }
    } catch {
      return { kind: 'invalid', raw }
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(PAID_RECORD_KEY)
    } catch {
      /* ignore */
    }
  }
}

/** In-memory store for tests and for the write-failure path. */
export class MemoryPaidRecordStore implements PaidRecordStore {
  private value: string | null = null
  failWrites = false

  write(record: PaidRecord): boolean {
    if (this.failWrites) return false
    this.value = JSON.stringify(record)
    return true
  }

  read(): ReadResult {
    if (this.value === null) return { kind: 'none' }
    try {
      const parsed: unknown = JSON.parse(this.value)
      return isValidRecord(parsed) ? { kind: 'ok', record: parsed } : { kind: 'invalid', raw: this.value }
    } catch {
      return { kind: 'invalid', raw: this.value }
    }
  }

  clear(): void {
    this.value = null
  }

  /** Test helper: inject a raw record. */
  seed(raw: string | object): void {
    this.value = typeof raw === 'string' ? raw : JSON.stringify(raw)
  }

  peek(): PaidRecord | null {
    const r = this.read()
    return r.kind === 'ok' ? r.record : null
  }
}
