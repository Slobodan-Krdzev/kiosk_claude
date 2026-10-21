// Parked uncertain payments (2026-10-21, Alex: "Start from the top" on the assistance screen).
//
// Rule 13 of the handover keeps a possibly-charged payment on screen until a person decides. Alex asked for a
// guest button that returns to the start screen instead. The compromise: the guest may leave, but the record is
// never dropped — it is parked here (localStorage, never session storage) with every identifier staff need, listed
// in the staff panel until staff mark it done, and the departure is logged. Nothing in this file talks to a backend.

import { useSyncExternalStore } from 'react'
import type { PayState } from './controller'

export const PARKED_KEY = 'guestit.parkedPayments.v1'
const MAX_PARKED = 50

export interface ParkedPayment {
  parkedAt: string
  reason: 'guest-start-over'
  status: PayState['status']
  orderId: string | null
  attempt: number
  attemptId: string | null
  txRef: string | null
  submitKey: string | null
  recoveryRef: string | null
  orderNo: string | null
  uncertainReason: string | null
  totalCents: number | null
  count: number | null
  tag: string | null
}

function read(): ParkedPayment[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(PARKED_KEY) : null
    const j = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(j) ? (j.filter((x) => x && typeof x === 'object' && typeof (x as ParkedPayment).parkedAt === 'string') as ParkedPayment[]) : []
  } catch {
    return []
  }
}

let list: ParkedPayment[] = read()
let version = 0
const subs = new Set<() => void>()

function write(next: ParkedPayment[]): void {
  list = next.slice(-MAX_PARKED)
  version++
  try {
    localStorage.setItem(PARKED_KEY, JSON.stringify(list))
  } catch {
    /* storage blocked: the in-memory list still serves this session */
  }
  subs.forEach((f) => f())
}

/** Snapshot of the controller's state as a parked record. */
export function parkedFrom(s: PayState, now = new Date()): ParkedPayment {
  const tag = s.snapshot?.tag
  return {
    parkedAt: now.toISOString(),
    reason: 'guest-start-over',
    status: s.status,
    orderId: s.orderId,
    attempt: s.attempt,
    attemptId: s.attemptId,
    txRef: s.txRef,
    submitKey: s.submitKey,
    recoveryRef: s.recoveryRef,
    orderNo: s.orderNo,
    uncertainReason: s.uncertainReason,
    totalCents: s.snapshot?.totals.totalCents ?? null,
    count: s.snapshot?.totals.count ?? null,
    tag: tag ? `${tag.type} ${tag.value}` : null,
  }
}

export function parkPayment(p: ParkedPayment): void {
  write([...list.filter((x) => !(x.orderId && x.orderId === p.orderId && x.attemptId === p.attemptId)), p])
}

export const parkedPayments = (): ParkedPayment[] => list

/** Staff marked one as handled at the POS / terminal. */
export function removeParked(orderId: string | null, attemptId: string | null): void {
  write(list.filter((x) => !(x.orderId === orderId && x.attemptId === attemptId)))
}

/** Test support: re-read from storage. */
export function reloadParked(): void {
  list = read()
  version++
  subs.forEach((f) => f())
}

const store = {
  subscribe(cb: () => void): () => void {
    subs.add(cb)
    return () => {
      subs.delete(cb)
    }
  },
  get: (): number => version,
}
export function useParkedVersion(): number {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
