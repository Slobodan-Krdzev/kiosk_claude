// Cart model: pure functions over an array of lines (the reference mutates S.cart; we return new arrays).

import { alHidden, byId, modItem, mustId, servingIx, servingOf, servingsOf, pname } from './catalog'
import { cmsById, priceOf } from './cms'
import { canMergeCartLine, cfgKey, clampQty, defChoice, exQty, newDraft, unitPrice, validateDraft, validateLineStructure, type Issue } from './draft'
import { E, L, checkProducts, t } from './state'
import { MAX_LINE_QTY, type CartLine, type CmsItem, type CrossSellSel, type Draft, type Product } from './types'

let uid = 1
let gid = 1

export function nextLid(): string {
  return 'L' + uid++
}
export function nextGid(): string {
  return 'G' + gid++
}
/** After restoring a cart from storage, continue numbering above the restored ids. */
export function bumpIds(cart: CartLine[]): void {
  for (const l of cart) {
    uid = Math.max(uid, Number(String(l.lid).slice(1)) + 1 || uid)
    gid = Math.max(gid, Number(String(l.groupId || 'G0').slice(1)) + 1 || gid)
  }
}

export const line = (cart: CartLine[], lid: string | null | undefined): CartLine | undefined => cart.find((l) => l.lid === lid)
export const lineUnit = (l: CartLine): number => (l.reward ? 0 : typeof l.unitPrice === 'number' ? l.unitPrice : unitPrice(l))
export const cartCount = (cart: CartLine[]): number => cart.reduce((a, l) => a + l.qty, 0)
export const cartGross = (cart: CartLine[]): number => cart.reduce((a, l) => a + lineUnit(l) * l.qty, 0)
export const cartTotal = (cart: CartLine[]): number => Math.max(0, cartGross(cart))
export const baseTotal = (cart: CartLine[]): number => cart.reduce((a, l) => a + (l.reward ? 0 : lineUnit(l) * l.qty), 0)
export const xsLinesOf = (cart: CartLine[], lid: string): CartLine[] => cart.filter((l) => l.lineType === 'cross-sell' && l.sourceLineId === lid)
export const hasLinked = (cart: CartLine[], lid: string): boolean => xsLinesOf(cart, lid).length > 0
export const obLines = (cart: CartLine[], p: Product): CartLine[] => cart.filter((l) => l.pid === p.id && l.lineType === 'product' && !l.reward)
export const obConfigs = (cart: CartLine[], p: Product): number => new Set(obLines(cart, p).map((l) => l.key)).size
export const obSizeQty = (cart: CartLine[], p: Product, i: number): number => obLines(cart, p).filter((l) => servingIx(p, l) === i).reduce((a, l) => a + l.qty, 0)
export const hasCat = (cart: CartLine[], cat: string): boolean => cart.some((l) => byId(l.pid)?.cat === cat)
export const rewardClaimed = (cart: CartLine[]): boolean => cart.some((l) => l.reward)

/** Count on a card: normal card = all lines of the product; wide card = the open size only. */
export function obQty(cart: CartLine[], p: Product, wide: boolean, sizeIx: number): number {
  return wide && servingsOf(p) ? obSizeQty(cart, p, sizeIx) : obLines(cart, p).reduce((a, l) => a + l.qty, 0)
}

/** The line "+"/"−" act on: wide → last line of the open size; otherwise the LAST line. */
export function obLine(cart: CartLine[], p: Product, wide: boolean, sizeIx: number): CartLine | undefined {
  const ls = obLines(cart, p)
  const f = wide && servingsOf(p) ? ls.filter((l) => servingIx(p, l) === sizeIx) : ls
  return f[f.length - 1]
}

export function addToCart(cart: CartLine[], d: Draft): { cart: CartLine[]; line: CartLine } {
  const { crossSells: _xs, _more, _xsAsk, ...main } = d
  void _xs
  void _more
  void _xsAsk
  const k = cfgKey(main as Draft)
  if (canMergeCartLine(d)) {
    const ex = cart.find((l) => l.key === k && l.lineType === 'product' && l.mergeable && l.qty < MAX_LINE_QTY)
    if (ex) {
      const merged = { ...ex, qty: clampQty(ex.qty + main.qty) }
      return { cart: cart.map((l) => (l === ex ? merged : l)), line: merged }
    }
  }
  const l: CartLine = {
    ...(JSON.parse(JSON.stringify(main)) as Draft),
    crossSells: [],
    key: k,
    lid: nextLid(),
    groupId: nextGid(),
    lineType: 'product',
    mergeable: canMergeCartLine(d),
    unitPrice: unitPrice(main as Draft),
    priceCheckedAt: Date.now(),
  }
  return { cart: [...cart, l], line: l }
}

/** Independent cross-sell line, linked to its originating product line. */
export function addCrossSellLine(cart: CartLine[], v: CmsItem, src: CartLine, sel: CrossSellSel | undefined): CartLine[] {
  const p = mustId(v.pid!)
  const l: CartLine = {
    lid: nextLid(),
    groupId: src.groupId,
    pid: v.pid!,
    qty: Math.max(1, (sel?.quantity ?? 1) | 0),
    lineType: 'cross-sell',
    xsId: v.id,
    unitPrice: priceOf(v),
    priceVariantId: v.priceVariantId || null,
    priceCheckedAt: Date.now(),
    sourceLineId: src.lid,
    sourceProductId: src.pid,
    extraPortion: !!sel?.extraPortion,
    key: 'xs:' + v.id + ':' + src.lid,
    choices: {},
    extras: [],
    removes: [],
    extraQty: {},
    crossSells: [],
    menu: false,
    drink: null,
    station: p.station || 'kitchen',
    taxGroup: p.taxGroup || 'food-low',
    prepMin: p.prepMin || 4,
  } as CartLine & { station: string; taxGroup: string; prepMin: number }
  return [...cart, l]
}

/** Reconcile the draft's cross-sell selection with the existing lines of one source line (edit). */
export function syncCrossSells(cart: CartLine[], d: Draft, src: CartLine): CartLine[] {
  const have = xsLinesOf(cart, src.lid)
  let next = cart
  for (const l of have) {
    const sel = (d.crossSells || []).find((x) => x.id === l.xsId)
    if (!sel) next = next.filter((x) => x !== l)
    else next = next.map((x) => (x === l ? { ...x, extraPortion: sel.extraPortion, qty: Math.max(1, sel.quantity | 0) } : x))
  }
  for (const sel of d.crossSells || []) {
    if (!have.some((l) => l.xsId === sel.id)) {
      const v = cmsById(sel.id)
      if (v) next = addCrossSellLine(next, v, src, sel)
    }
  }
  return next
}

/** Linked-line removal policy: product with linked lines → withLinked (all) | unlink (sides stay) ; cross-sell → itself. */
export function removeLine(cart: CartLine[], lid: string, { withLinked = false, unlink = false }: { withLinked?: boolean; unlink?: boolean } = {}): CartLine[] {
  const l = line(cart, lid)
  if (!l) return cart
  if (l.lineType === 'product') {
    const linked = xsLinesOf(cart, lid)
    if (withLinked) return cart.filter((x) => x !== l && !linked.includes(x))
    return cart
      .filter((x) => x !== l)
      .map((x) => (unlink && linked.includes(x) ? { ...x, sourceLineId: null, sourceProductId: null, groupId: nextGid(), key: 'xs:' + x.xsId + ':' + x.lid } : x))
  }
  return cart.filter((x) => x !== l)
}

export function setLineQty(cart: CartLine[], lid: string, qty: number): CartLine[] {
  return cart.map((l) => (l.lid === lid ? { ...l, qty: clampQty(qty) } : l))
}

/** Apply an edited draft onto its line (the edited group is configured by definition). */
export function applyEdit(cart: CartLine[], lid: string, d: Draft): CartLine[] {
  const { crossSells: _xs, _more, _xsAsk, ...main } = d
  void _xs
  void _more
  void _xsAsk
  let next = cart.map((l) =>
    l.lid === lid ? { ...l, ...(JSON.parse(JSON.stringify(main)) as Draft), crossSells: [], key: l.reward ? 'RW' : cfgKey(main as Draft), unitPrice: l.reward ? 0 : unitPrice(main as Draft), mergeable: false } : l,
  )
  const src = line(next, lid)!
  next = syncCrossSells(next, d, src)
  return next
}

// ---------- reward (order-value gift) ----------

export function giftLine(p: Product): CartLine {
  const d = newDraft(p)
  const brand = E().brand
  Object.assign(d.choices, brand.reward?.variant?.choices || {})
  ;(p.choice || []).forEach((g) => {
    if (!d.choices[g]) d.choices[g] = defChoice(g) || E().mods[g].items[0]?.id || null
  })
  return { ...d, qty: 1, extras: [], removes: [], crossSells: [], key: 'RW', lid: nextLid(), lineType: 'product', reward: true, fixed: true, unitPrice: 0, mergeable: false, groupId: nextGid(), priceCheckedAt: Date.now() }
}

export type RewardChange = { added: true; name: string } | { removed: true; name: string } | null

export function syncReward(cart: CartLine[], dismissed: boolean): { cart: CartLine[]; change: RewardChange } {
  const brand = E().brand
  const p = brand.reward ? byId(brand.reward.pid) : undefined
  const has = cart.find((l) => l.reward)
  const earned = !!p && !!brand.reward && baseTotal(cart) >= brand.reward.threshold && cart.some((l) => !l.reward) && !alHidden(p) && !checkProducts([p.id]).length
  if (earned && !has && !dismissed) return { cart: [giftLine(p!), ...cart], change: { added: true, name: pname(p!) } }
  if (!earned && has) return { cart: cart.filter((l) => !l.reward), change: { removed: true, name: pname(p || mustId(has.pid)) } }
  if (has && cart[0] !== has) return { cart: [has, ...cart.filter((l) => l !== has)], change: null }
  return { cart, change: null }
}

export const rewardLeft = (cart: CartLine[]): number => Math.max(0, (E().brand.reward?.threshold || 0) - baseTotal(cart))

// ---------- summaries ----------

export function lineSummaryBody(cart: CartLine[], l: CartLine): string {
  const d = E()
  const bits: string[] = []
  if (l.lineType === 'cross-sell') {
    const v = (l.xsId && cmsById(l.xsId)) || ({} as Partial<CmsItem>)
    if (l.extraPortion) bits.push(`${t('extraPortion')} · ${v.qtyLabel ? L(v.qtyLabel) : ''}`.replace(/ · $/, ''))
    else if (v.qtyLabel) bits.push(L(v.qtyLabel))
    const src = l.sourceLineId ? line(cart, l.sourceLineId) : undefined
    bits.push(src ? `${t('xsWith')} ${pname(mustId(src.pid))}` : t('xsLoose'))
    return bits.join(' · ')
  }
  if (l.reward) bits.push('🎁 ' + t('rw_gift'))
  if (l.menu && l.drink) bits.push(`${t('summaryCombo')} · ${L(d.menuDeal.sideLabel)} + ${pname(mustId(l.drink))}`)
  for (const [g, cid] of Object.entries(l.choices || {})) {
    const grp = d.mods[g]
    const it = cid ? modItem(g, cid) : null
    if (it && grp.items.length > 1) bits.push(grp.req ? L(it.name) : `${L(grp.label)}: ${L(it.name)}`)
  }
  ;(l.extras || []).forEach(([g, id]) => {
    const q = exQty(l, g, id)
    bits.push('+ ' + (q > 1 ? q + '× ' : '') + L(modItem(g, id).name))
  })
  ;(l.removes || []).forEach(([g, id]) => bits.push(L(modItem(g, id).name)))
  return bits.join(' · ')
}

export function lineSummary(cart: CartLine[], l: CartLine): string {
  const p = mustId(l.pid)
  const sv = servingOf(p, l)
  if (sv) {
    const rest = lineSummaryBody(cart, l)
    return rest ? L(sv.short) + ' · ' + rest : L(sv.short)
  }
  return lineSummaryBody(cart, l)
}

// ---------- validation and prices ----------

export function validateCart(cart: CartLine[]): Issue[] {
  const issues: Issue[] = []
  for (const l of cart) {
    if (l.lineType === 'cross-sell') {
      if (!(Number.isInteger(l.qty) && l.qty >= 1 && l.qty <= MAX_LINE_QTY)) issues.push({ code: 'qty', lid: l.lid })
      if (checkProducts([l.pid]).length) issues.push({ code: 'unavailable', lid: l.lid, pid: l.pid })
      continue
    }
    validateDraft(l).forEach((i) => issues.push({ ...i, lid: l.lid }))
  }
  revalidatePrices(cart).forEach((c) => issues.push({ code: 'price-changed', lid: c.lid }))
  return issues
}

export const currentPriceOf = (l: CartLine): number => (l.reward ? 0 : l.lineType === 'cross-sell' ? priceOf((l.xsId && cmsById(l.xsId)) || { pid: l.pid }) : unitPrice(l))

export interface PriceChange {
  lid: string
  name: string
  old: number
  now: number
}

/** A line whose product or options no longer exist in the menu (e.g. the menu changed since the session was saved). */
const priceable = (l: CartLine): boolean => !l.reward && validateLineStructure(l).length === 0

export function revalidatePrices(cart: CartLine[]): PriceChange[] {
  // Lines that are no longer in the menu are reported by validateDraft ('product-missing' / 'invalid-…') and shown as invalid.
  return cart
    .filter(priceable)
    .map((l) => ({ lid: l.lid, name: pname(mustId(l.pid)), old: lineUnit(l), now: currentPriceOf(l) }))
    .filter((c) => c.old !== c.now)
}

export function applyRevalidatedPrices(cart: CartLine[]): CartLine[] {
  return cart.map((l) => (!priceable(l) ? l : { ...l, unitPrice: currentPriceOf(l), priceCheckedAt: Date.now() }))
}

export const priceStamp = (ch: PriceChange[]): string => JSON.stringify(ch.map((c) => [c.lid, c.now]).sort())

export function cartProductIds(cart: CartLine[]): string[] {
  return [...new Set(cart.flatMap((l) => [l.pid, ...(l.menu ? [E().menuDeal.side, l.drink].filter((x): x is string => !!x) : [])]))]
}

export function cartClashes(cart: CartLine[]): string[] {
  return [...new Set(cart.filter((l) => alHidden(byId(l.pid))).map((l) => pname(mustId(l.pid))))]
}
