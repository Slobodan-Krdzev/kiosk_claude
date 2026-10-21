// Parked uncertain payments: the guest's "Start from the top" keeps every identifier for staff (localStorage,
// not session storage), the list survives a reload, duplicates of one attempt collapse, staff can remove one.

import { beforeEach, describe, expect, it } from 'vitest'
import type { PayState } from './controller'
import { PARKED_KEY, parkPayment, parkedFrom, parkedPayments, reloadParked, removeParked } from './parked'

const state = (over: Partial<PayState> = {}): PayState =>
  ({
    status: 'assistance',
    orderId: 'K1-abc',
    attempt: 1,
    attemptId: 'K1-abc-A1',
    txRef: 'TX-1',
    submitKey: 'IDEMP-1',
    recoveryRef: 'R-1',
    orderNo: null,
    uncertainReason: 'timeout',
    snapshot: { totals: { totalCents: 1150, count: 2 }, tag: { type: 'table', value: '12' } },
    ...over,
  }) as unknown as PayState

describe('parked payments', () => {
  beforeEach(() => {
    localStorage.clear()
    reloadParked()
  })

  it('a parked record carries the identifiers, the amount and the table', () => {
    const p = parkedFrom(state(), new Date('2026-10-21T10:00:00.000Z'))
    expect(p).toMatchObject({ parkedAt: '2026-10-21T10:00:00.000Z', reason: 'guest-start-over', status: 'assistance', orderId: 'K1-abc', attemptId: 'K1-abc-A1', txRef: 'TX-1', submitKey: 'IDEMP-1', totalCents: 1150, count: 2, tag: 'table 12' })
  })

  it('parks in localStorage (never session storage), survives a reload, one entry per attempt', () => {
    parkPayment(parkedFrom(state()))
    parkPayment(parkedFrom(state()))
    parkPayment(parkedFrom(state({ orderId: 'K2-def', attemptId: 'K2-def-A1' })))
    expect(parkedPayments()).toHaveLength(2)
    expect(sessionStorage.getItem(PARKED_KEY)).toBeNull()
    reloadParked()
    expect(parkedPayments().map((x) => x.orderId)).toEqual(['K1-abc', 'K2-def'])
  })

  it('staff can remove one; broken storage is ignored', () => {
    parkPayment(parkedFrom(state()))
    removeParked('K1-abc', 'K1-abc-A1')
    expect(parkedPayments()).toEqual([])
    localStorage.setItem(PARKED_KEY, 'nonsense')
    reloadParked()
    expect(parkedPayments()).toEqual([])
  })
})
