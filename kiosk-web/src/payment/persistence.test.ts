import { describe, expect, it } from 'vitest'
import { snapshotInput } from '../test/fakes'
import { LocalStoragePaidRecordStore, PAID_RECORD_KEY, isValidRecord, type PaidRecord } from './persistence'

function record(over: Partial<PaidRecord> = {}): PaidRecord {
  return {
    schemaVersion: 3,
    deviceId: 'K1',
    orderId: 'K1-abc-12345678',
    orderSessionId: 'S1',
    paymentAttemptId: 'K1-abc-12345678-A1-xyz123',
    transactionReference: null,
    idempotencyKey: 'IDEMP-K1-abc-12345678',
    startedAt: '2026-10-14T10:00:00.000Z',
    paidAt: null,
    snapshot: { ...snapshotInput(), orderId: 'K1-abc-12345678', startedAt: '2026-10-14T10:00:00.000Z', paidAt: null },
    recoveryReference: null,
    submissionState: 'starting',
    accepted: false,
    orderNo: null,
    savedAt: '2026-10-14T10:00:00.000Z',
    ...over,
  }
}

describe('paid record validation', () => {
  it('accepts a well-formed schema-3 record', () => {
    expect(isValidRecord(record())).toBe(true)
  })
  it('rejects wrong schema, mismatched key or unknown submission state', () => {
    expect(isValidRecord(record({ schemaVersion: 2 as never }))).toBe(false)
    expect(isValidRecord(record({ idempotencyKey: 'IDEMP-other' }))).toBe(false)
    expect(isValidRecord(record({ submissionState: 'weird' as never }))).toBe(false)
    expect(isValidRecord(null)).toBe(false)
    expect(isValidRecord('x')).toBe(false)
  })
})

describe('LocalStoragePaidRecordStore', () => {
  it('write-verifies, reads back, flags invalid content and clears', () => {
    const store = new LocalStoragePaidRecordStore()
    store.clear()
    expect(store.read()).toEqual({ kind: 'none' })
    expect(store.write(record())).toBe(true)
    const r = store.read()
    expect(r.kind).toBe('ok')
    localStorage.setItem(PAID_RECORD_KEY, '{not json')
    expect(store.read().kind).toBe('invalid')
    store.clear()
    expect(store.read()).toEqual({ kind: 'none' })
  })
})
