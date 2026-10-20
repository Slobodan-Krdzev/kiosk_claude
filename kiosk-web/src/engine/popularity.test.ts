// Per-device "Popular" tally (2026-10-20): accepted orders add their product lines; the five most sold lead;
// the tally lives in localStorage (survives a reload), never in session storage; one order counts once.

import { beforeEach, describe, expect, it } from 'vitest'
import { POPULARITY_KEY, popularPids, popularityStats, recordAcceptedOrder, reloadPopularity, resetPopularity } from './popularity'

const order = (orderId: string, lines: [string, number, string?][]) => ({ orderId, lines: lines.map(([productId, qty, kind]) => ({ kind: kind ?? 'item', productId, qty })) })

describe('popularity tally', () => {
  beforeEach(() => {
    localStorage.clear()
    resetPopularity()
  })

  it('counts quantities per product over accepted orders and ranks them', () => {
    recordAcceptedOrder(order('O1', [['a', 2], ['b', 1]]))
    recordAcceptedOrder(order('O2', [['b', 3], ['c', 1, 'cross-sell'], ['g', 5, 'gift']]))
    expect(popularPids()).toEqual(['b', 'a', 'c']) // gifts never count
    expect(popularityStats()).toMatchObject({ products: 3, orders: 2 })
  })

  it('the same order id counts once; the limit and a visibility filter apply', () => {
    recordAcceptedOrder(order('O1', [['a', 1]]))
    recordAcceptedOrder(order('O1', [['a', 1]]))
    expect(popularityStats().orders).toBe(1)
    for (let i = 0; i < 8; i++) recordAcceptedOrder(order(`P${i}`, [[`p${i}`, i + 1]]))
    expect(popularPids()).toHaveLength(5)
    expect(popularPids(5)[0]).toBe('p7')
    expect(popularPids(5, (pid) => pid !== 'p7')[0]).toBe('p6')
  })

  it('persists in localStorage, not session storage, and survives a reload of the module state', () => {
    recordAcceptedOrder(order('O1', [['a', 4]]))
    expect(JSON.parse(localStorage.getItem(POPULARITY_KEY)!)).toMatchObject({ v: 1, counts: { a: 4 }, orders: 1 })
    expect(sessionStorage.getItem(POPULARITY_KEY)).toBeNull()
    reloadPopularity()
    expect(popularPids()).toEqual(['a'])
    localStorage.setItem(POPULARITY_KEY, '{"v":1,"counts":{"z":9,"bad":"x","neg":-1},"orders":3}')
    reloadPopularity()
    expect(popularPids()).toEqual(['z'])
    expect(popularityStats().orders).toBe(3)
  })

  it('a broken or foreign value in storage is ignored', () => {
    localStorage.setItem(POPULARITY_KEY, 'not json')
    reloadPopularity()
    expect(popularPids()).toEqual([])
    localStorage.setItem(POPULARITY_KEY, '{"v":2,"counts":{"a":1}}')
    reloadPopularity()
    expect(popularPids()).toEqual([])
  })

  it('reset clears the tally and the storage', () => {
    recordAcceptedOrder(order('O1', [['a', 1]]))
    resetPopularity()
    expect(popularPids()).toEqual([])
    expect(JSON.parse(localStorage.getItem(POPULARITY_KEY)!).counts).toEqual({})
  })
})
