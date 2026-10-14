import { describe, expect, it } from 'vitest'
import { applyPriceChanges, buildSnapshot, cartTotals, detectPriceChanges, lineUnitPrice, sameConfig, validateLine } from './cart'
import type { CartLine, Catalog } from './types'

const catalog: Catalog = {
  version: 1,
  venue: { id: 'V', name: 'Test', currency: 'EUR' },
  categories: [{ id: 'burgers', name: { nl: 'B', en: 'B', mk: 'B' }, sort: 1 }],
  products: [
    {
      id: 'p1',
      categoryId: 'burgers',
      priceCents: 1000,
      available: true,
      name: { nl: 'Burger', en: 'Burger', mk: 'Burger' },
      allergens: [],
      servings: [
        { id: 's', name: { nl: 'S', en: 'S', mk: 'S' }, priceDeltaCents: 0, love: true },
        { id: 'l', name: { nl: 'L', en: 'L', mk: 'L' }, priceDeltaCents: 300 },
      ],
      choiceGroups: [
        {
          id: 'g',
          name: { nl: 'G', en: 'G', mk: 'G' },
          req: true,
          min: 1,
          max: 1,
          options: [
            { id: 'a', name: { nl: 'a', en: 'a', mk: 'a' }, priceDeltaCents: 0 },
            { id: 'b', name: { nl: 'b', en: 'b', mk: 'b' }, priceDeltaCents: 50 },
          ],
        },
      ],
      extras: [{ id: 'x', name: { nl: 'x', en: 'x', mk: 'x' }, priceCents: 150, maxQuantity: 2 }],
    },
  ],
}

const line = (over: Partial<CartLine> = {}): CartLine => ({
  lineId: 'L1',
  productId: 'p1',
  servingId: 'l',
  choices: { g: ['b'] },
  extras: { x: 2 },
  qty: 2,
  kind: 'item',
  ...over,
})

describe('cart pricing', () => {
  it('adds serving, choice and extra deltas in cents', () => {
    expect(lineUnitPrice(line(), catalog)).toBe(1000 + 300 + 50 + 300)
    expect(cartTotals([line()], catalog)).toEqual({ subtotalCents: 3300, discountCents: 0, totalCents: 3300, count: 2 })
  })

  it('uses the fixed price for upsell variants and does not count them as items', () => {
    const xs = line({ lineId: 'L2', kind: 'cross-sell', fixedUnitPriceCents: 100, qty: 1, sourceLineId: 'L1' })
    expect(lineUnitPrice(xs, catalog)).toBe(100)
    expect(cartTotals([line(), xs], catalog).count).toBe(2)
    expect(cartTotals([line(), xs], catalog).totalCents).toBe(3400)
  })

  it('merges identical configurations only', () => {
    expect(sameConfig(line(), line({ lineId: 'L9', qty: 1 }))).toBe(true)
    expect(sameConfig(line(), line({ choices: { g: ['a'] } }))).toBe(false)
    expect(sameConfig(line(), line({ extras: { x: 1 } }))).toBe(false)
    expect(sameConfig(line(), line({ sourceLineId: 'L0' }))).toBe(false)
  })

  it('validates required choices and extra maxima', () => {
    expect(validateLine(line(), catalog.products[0])).toEqual([])
    expect(validateLine(line({ choices: {} }), catalog.products[0])).toEqual(['choice:g'])
    expect(validateLine(line({ extras: { x: 3 } }), catalog.products[0])).toEqual(['extra:x'])
  })

  it('detects and applies price changes from /catalog/current', () => {
    const changes = detectPriceChanges([line()], catalog, { version: 2, prices: { p1: 1100 }, variants: {}, disabled: [] })
    expect(changes).toEqual([{ productId: 'p1', oldCents: 1000, newCents: 1100 }])
    const updated = applyPriceChanges(catalog, changes)
    expect(lineUnitPrice(line(), updated)).toBe(1650 + 100)
    expect(detectPriceChanges([line()], catalog, { version: 1, prices: { p1: 1000 }, variants: {}, disabled: [] })).toEqual([])
  })

  it('builds a snapshot with English names, totals in cents and the order tag', () => {
    const snap = buildSnapshot({
      orderId: 'O1',
      lines: [line()],
      catalog,
      service: 'takeaway',
      lang: 'mk',
      tag: { type: 'pager', value: '12' },
      member: { id: 'M1', name: 'x', points: 1 },
    })
    expect(snap.lines[0]).toMatchObject({ productName: 'Burger', servingName: 'L', unitPriceCents: 1650, lineTotalCents: 3300, qty: 2 })
    expect(snap.lines[0].choices).toEqual([{ groupId: 'g', optionIds: ['b'] }])
    expect(snap.lines[0].extras).toEqual([{ extraId: 'x', qty: 2 }])
    expect(snap.totals.totalCents).toBe(3300)
    expect(snap.tag).toEqual({ type: 'pager', value: '12' })
    expect(snap.loyalty).toEqual({ memberId: 'M1' })
    expect(snap.pricedWith.catalogVersion).toBe(1)
  })
})
