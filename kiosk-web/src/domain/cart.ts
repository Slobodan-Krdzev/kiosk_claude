import type {
  CartLine,
  Catalog,
  CatalogCurrent,
  Lang,
  LoyaltyMember,
  OrderSnapshot,
  OrderTag,
  Product,
  ServiceMode,
  SnapshotLine,
} from './types'

export function productById(catalog: Catalog, id: string): Product | undefined {
  return catalog.products.find((p) => p.id === id)
}

/** Unit price of a line from the catalog (or its fixed upsell price). */
export function lineUnitPrice(line: CartLine, catalog: Catalog): number {
  if (typeof line.fixedUnitPriceCents === 'number') return line.fixedUnitPriceCents
  const p = productById(catalog, line.productId)
  if (!p) return 0
  let cents = p.priceCents
  const serving = p.servings.find((s) => s.id === line.servingId)
  if (serving) cents += serving.priceDeltaCents
  for (const g of p.choiceGroups) {
    const picked = line.choices[g.id] ?? []
    for (const optId of picked) {
      const opt = g.options.find((o) => o.id === optId)
      if (opt) cents += opt.priceDeltaCents
    }
  }
  for (const e of p.extras) {
    const qty = line.extras[e.id] ?? 0
    cents += qty * e.priceCents
  }
  return Math.max(0, cents)
}

export function lineTotal(line: CartLine, catalog: Catalog): number {
  return lineUnitPrice(line, catalog) * line.qty
}

export interface CartTotals {
  subtotalCents: number
  discountCents: number
  totalCents: number
  count: number
}

export function cartTotals(lines: CartLine[], catalog: Catalog): CartTotals {
  let subtotal = 0
  let count = 0
  for (const l of lines) {
    subtotal += lineTotal(l, catalog)
    if (l.kind === 'item') count += l.qty
  }
  return { subtotalCents: subtotal, discountCents: 0, totalCents: subtotal, count }
}

/** Two lines are mergeable when product, serving, choices, extras and kind match. */
export function sameConfig(a: CartLine, b: CartLine): boolean {
  if (a.productId !== b.productId || a.servingId !== b.servingId || a.kind !== b.kind) return false
  if (a.priceVariantId !== b.priceVariantId) return false
  if (a.sourceLineId || b.sourceLineId) return false // upsell lines are bound to a parent
  return (
    JSON.stringify(normalizeChoices(a.choices)) === JSON.stringify(normalizeChoices(b.choices)) &&
    JSON.stringify(normalizeExtras(a.extras)) === JSON.stringify(normalizeExtras(b.extras))
  )
}

function normalizeChoices(c: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const k of Object.keys(c).sort()) {
    const v = [...(c[k] ?? [])].sort()
    if (v.length) out[k] = v
  }
  return out
}

function normalizeExtras(e: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const k of Object.keys(e).sort()) {
    if ((e[k] ?? 0) > 0) out[k] = e[k]
  }
  return out
}

/** Validation of a configured line against its product. Returns i18n keys of problems. */
export function validateLine(line: CartLine, product: Product): string[] {
  const problems: string[] = []
  if (!product.servings.some((s) => s.id === line.servingId)) problems.push('product.pickServing')
  for (const g of product.choiceGroups) {
    const picked = (line.choices[g.id] ?? []).filter((id) => g.options.some((o) => o.id === id))
    if (g.req && picked.length < Math.max(1, g.min)) problems.push(`choice:${g.id}`)
    if (picked.length > g.max) problems.push(`choice:${g.id}`)
  }
  for (const e of product.extras) {
    if ((line.extras[e.id] ?? 0) > e.maxQuantity) problems.push(`extra:${e.id}`)
  }
  return problems
}

/** Default configuration for a product: the "love" serving and no choices. */
export function defaultServingId(product: Product): string {
  const love = product.servings.find((s) => s.love)
  return (love ?? product.servings[0])?.id ?? ''
}

export interface PriceChange {
  productId: string
  oldCents: number
  newCents: number
}

/**
 * Compare the cart's catalog prices against GET /catalog/current.
 * Never applied to a started snapshot — only before payment starts.
 */
export function detectPriceChanges(lines: CartLine[], catalog: Catalog, current: CatalogCurrent): PriceChange[] {
  const changes: PriceChange[] = []
  const seen = new Set<string>()
  for (const l of lines) {
    if (l.kind !== 'item') continue
    const p = productById(catalog, l.productId)
    if (!p || seen.has(p.id)) continue
    seen.add(p.id)
    const cur = current.prices[p.id]
    if (typeof cur === 'number' && cur !== p.priceCents) {
      changes.push({ productId: p.id, oldCents: p.priceCents, newCents: cur })
    }
  }
  return changes
}

export function applyPriceChanges(catalog: Catalog, changes: PriceChange[]): Catalog {
  if (!changes.length) return catalog
  const map = new Map(changes.map((c) => [c.productId, c.newCents]))
  return {
    ...catalog,
    products: catalog.products.map((p) => (map.has(p.id) ? { ...p, priceCents: map.get(p.id)! } : p)),
  }
}

export function buildSnapshot(input: {
  orderId: string
  lines: CartLine[]
  catalog: Catalog
  service: ServiceMode
  lang: Lang
  tag: OrderTag | null
  member: LoyaltyMember | null
  now?: Date
}): OrderSnapshot {
  const { catalog } = input
  const lines: SnapshotLine[] = input.lines.map((l) => {
    const p = productById(catalog, l.productId)
    const serving = p?.servings.find((s) => s.id === l.servingId)
    const unit = lineUnitPrice(l, catalog)
    return {
      lineId: l.lineId,
      productId: l.productId,
      productName: p?.name.en ?? l.productId,
      servingId: l.servingId,
      servingName: serving?.name.en ?? l.servingId,
      choices: Object.entries(l.choices)
        .filter(([, v]) => v.length)
        .map(([groupId, optionIds]) => ({ groupId, optionIds: [...optionIds] })),
      extras: Object.entries(l.extras)
        .filter(([, q]) => q > 0)
        .map(([extraId, qty]) => ({ extraId, qty })),
      qty: l.qty,
      unitPriceCents: unit,
      lineTotalCents: unit * l.qty,
      kind: l.kind,
      ...(l.priceVariantId ? { priceVariantId: l.priceVariantId } : {}),
      ...(l.groupId ? { groupId: l.groupId } : {}),
      ...(l.sourceLineId ? { sourceLineId: l.sourceLineId } : {}),
      ...(l.menuDrink ? { menuDrink: JSON.parse(JSON.stringify(l.menuDrink)) } : {}),
    }
  })
  const totals = cartTotals(input.lines, catalog)
  return {
    orderId: input.orderId,
    startedAt: (input.now ?? new Date()).toISOString(),
    paidAt: null,
    lines,
    service: input.service,
    lang: input.lang,
    tag: input.tag ? { ...input.tag } : null,
    totals,
    loyalty: input.member ? { memberId: input.member.id } : null,
    pricedWith: { catalogVersion: catalog.version },
  }
}
