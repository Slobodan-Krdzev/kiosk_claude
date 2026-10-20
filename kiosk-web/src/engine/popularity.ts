// "Popular" on the home screen, simulated on the device (2026-10-20, Alex): the backend has no ordering
// statistics, so the kiosk counts what it sells. Every accepted order adds its product lines (quantity) to a
// per-device tally in localStorage; the home shows the five most ordered products that are visible right now.
// Not session storage: the tally survives restarts and new guest sessions. Not evidence of anything backend-side.

import { useSyncExternalStore } from 'react'

export const POPULARITY_KEY = 'guestit.popular.v1'
export const POPULAR_LIMIT = 5

interface Tally {
  v: 1
  counts: Record<string, number>
  orders: number
  updatedAt: string | null
}

const EMPTY: Tally = { v: 1, counts: {}, orders: 0, updatedAt: null }

function read(): Tally {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(POPULARITY_KEY) : null
    if (!raw) return { ...EMPTY, counts: {} }
    const j = JSON.parse(raw) as Partial<Tally>
    if (!j || j.v !== 1 || typeof j.counts !== 'object' || !j.counts) return { ...EMPTY, counts: {} }
    const counts: Record<string, number> = {}
    for (const [k, v] of Object.entries(j.counts)) if (typeof v === 'number' && v > 0 && Number.isFinite(v)) counts[k] = v
    return { v: 1, counts, orders: typeof j.orders === 'number' ? j.orders : 0, updatedAt: typeof j.updatedAt === 'string' ? j.updatedAt : null }
  } catch {
    return { ...EMPTY, counts: {} }
  }
}

let tally: Tally = read()
let version = 0
const subs = new Set<() => void>()

function write(next: Tally): void {
  tally = next
  version++
  try {
    localStorage.setItem(POPULARITY_KEY, JSON.stringify(next))
  } catch {
    /* storage full or blocked: the in-memory tally still serves this session */
  }
  subs.forEach((f) => f())
}

/** Lines of an accepted order that count: products the guest ordered (items and cross-sells), not gifts or options. */
export function recordAcceptedOrder(snapshot: { orderId: string; lines: { kind: string; productId: string; qty: number }[] }): void {
  if (recorded.has(snapshot.orderId)) return
  recorded.add(snapshot.orderId)
  const counts = { ...tally.counts }
  let any = false
  for (const l of snapshot.lines) {
    if (l.kind !== 'item' && l.kind !== 'cross-sell') continue
    const q = Math.max(0, l.qty | 0)
    if (!q) continue
    counts[l.productId] = (counts[l.productId] || 0) + q
    any = true
  }
  if (!any) return
  write({ v: 1, counts, orders: tally.orders + 1, updatedAt: new Date().toISOString() })
}
const recorded = new Set<string>()

/** Product ids by times ordered, most ordered first; ties keep insertion order. */
export function popularPids(limit = POPULAR_LIMIT, keep?: (pid: string) => boolean): string[] {
  return Object.entries(tally.counts)
    .filter(([pid]) => !keep || keep(pid))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([pid]) => pid)
}

export const popularityStats = (): { products: number; orders: number; updatedAt: string | null } => ({ products: Object.keys(tally.counts).length, orders: tally.orders, updatedAt: tally.updatedAt })

export function resetPopularity(): void {
  recorded.clear()
  write({ ...EMPTY, counts: {} })
}

/** Test / storage-change support: re-read the tally from localStorage. */
export function reloadPopularity(): void {
  tally = read()
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

/** Re-renders the caller when the tally changes. */
export function usePopularityVersion(): number {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
