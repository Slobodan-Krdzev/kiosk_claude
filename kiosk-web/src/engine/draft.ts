// Draft (product configuration) model: creation, pricing, validation. Port of the v36 engine.

import { alHidden, byId, mustId, modItem, servingOf, servingsOf, servingIx } from './catalog'
import { cmsById, drinkUp, priceOf } from './cms'
import { E, L, checkProducts, t, tf } from './state'
import { MAX_LINE_QTY, type CrossSellSel, type Draft, type Product } from './types'

export const clampQty = (n: number): number => Math.max(1, Math.min(MAX_LINE_QTY, n | 0))

export function defChoice(g: string): string | null {
  const grp = E().mods[g]
  if (grp.req) return null
  if (grp.def) return grp.def
  const z = grp.items.find((i) => i.price === 0)
  return (z || grp.items[0]).id
}

export function newDraft(p: Product, { menu = false }: { menu?: boolean } = {}): Draft {
  const choices: Record<string, string | null> = {}
  ;(p.choice || []).forEach((g) => (choices[g] = defChoice(g)))
  return { pid: p.id, qty: 1, menu: menu && !!p.canMenu, drink: 'cola', choices, extras: [], removes: [], extraQty: {}, crossSells: [] }
}

export function cloneDraft(d: Draft): Draft {
  return JSON.parse(JSON.stringify(d)) as Draft
}

// ---------- extras (product enhancements live in the premX group) ----------

export const exKey = (g: string, id: string): string => g + ':' + id

export function exQty(d: Draft, g: string, id: string): number {
  return (d.extras || []).some(([gg, ii]) => gg === g && ii === id) ? Math.max(1, ((d.extraQty || {})[exKey(g, id)] | 0) || 1) : 0
}

export function exMax(id: string): number {
  const v = cmsById(id)
  return Math.max(1, v?.maxQuantity || 1)
}

export function exSet(d: Draft, g: string, id: string, n: number): number {
  d.extraQty = d.extraQty || {}
  n = Math.max(0, Math.min(exMax(id), n | 0))
  const i = (d.extras || []).findIndex(([gg, ii]) => gg === g && ii === id)
  if (n <= 0) {
    if (i >= 0) d.extras.splice(i, 1)
    delete d.extraQty[exKey(g, id)]
    return 0
  }
  if (i < 0) d.extras.push([g, id])
  d.extraQty[exKey(g, id)] = n
  return n
}

// ---------- cross-sells (draft.crossSells = [{id, quantity, extraPortion}]) ----------

export const xsSel = (d: Draft, id: string): CrossSellSel | undefined => (d.crossSells || []).find((x) => x.id === id)
export const xsSelected = (d: Draft, id: string): boolean => !!xsSel(d, id)
export const xsPortion = (d: Draft, id: string): boolean => !!xsSel(d, id)?.extraPortion

export function xsSet(d: Draft, id: string, patch?: Partial<CrossSellSel>): CrossSellSel {
  d.crossSells = d.crossSells || []
  let e = xsSel(d, id)
  if (!e) {
    e = { id, quantity: 1, extraPortion: false }
    d.crossSells.push(e)
  }
  Object.assign(e, patch || {})
  e.quantity = Math.max(1, e.quantity | 0)
  return e
}

export function xsRemove(d: Draft, id: string): void {
  d.crossSells = (d.crossSells || []).filter((x) => x.id !== id)
}

export function xsConflicts(v: { id: string }, d: Draft): boolean {
  const mu = E().upsell.menuUpgrade
  return !!(d.menu && mu && (mu.conflictsWithCrossSells || []).includes(v.id))
}

export function xsVisible(v: { id: string }, d: Draft): boolean {
  return !(xsConflicts(v, d) && E().upsell.menuUpgrade.conflictMode === 'hide' && !xsSelected(d, v.id))
}

export function xsTitle(v: { id: string; title?: Product['desc'] }, d: Draft, portion?: boolean): string {
  return portion || (xsConflicts(v, d) && xsSelected(d, v.id) && xsPortion(d, v.id)) ? `${t('extraPortion')} ${L(v.title).toLowerCase()}` : L(v.title)
}

export const xsKey = (d: Draft): string =>
  (d.crossSells || [])
    .map((x) => x.id + ':' + x.quantity + (x.extraPortion ? 'p' : ''))
    .sort()
    .join(',')

export function xsSum(d: Draft): number {
  return (d.crossSells || []).reduce((a, x) => {
    const v = cmsById(x.id)
    return a + (v ? priceOf(v) * x.quantity : 0)
  }, 0)
}

// ---------- pricing ----------

export function unitPrice(d: Draft): number {
  if (d.reward) return 0
  const p = mustId(d.pid)
  const sv = servingOf(p, d)
  let n = sv ? sv.price : p.price
  const mods = E().mods
  for (const [g, cid] of Object.entries(d.choices || {})) if (cid && mods[g] && mods[g].items.some((i) => i.id === cid)) n += modItem(g, cid).price
  ;(d.extras || []).forEach(([g, id]) => (n += modItem(g, id).price * exQty(d, g, id)))
  if (d.menu) n += E().menuDeal.price + drinkUp(d.drink)
  return n
}

export const draftCombined = (d: Draft): number => unitPrice(d) * d.qty + xsSum(d)
export const pdpTotal = (d: Draft): number => (d.reward ? 0 : draftCombined(d))
export const extrasSum = (p: Product, d: Draft): number => unitPrice(d) - p.price
export const menuTotalOf = (p: Product, d: Draft): number => {
  const sv = servingOf(p, d)
  return (sv ? sv.price : p.price) + E().menuDeal.price
}

/** Full itemised calculation for the price sheet: [label, cents, isAddition]. */
export function priceLines(p: Product, d: Draft): [string, number, boolean][] {
  const d0 = E()
  const rows: [string, number, boolean][] = [[p.name, p.price, false]]
  const sv = servingOf(p, d)
  if (sv && sv.price !== p.price) rows.push([L(sv.short), sv.price - p.price, true])
  if (d.menu) {
    rows.push([L(d0.upsell.menuUpgrade.title), d0.menuDeal.price, true])
    const up = drinkUp(d.drink)
    if (up && d.drink) rows.push([mustId(d.drink).name, up, true])
  }
  for (const [g, cid] of Object.entries(d.choices || {})) {
    if (!cid) continue
    const it = modItem(g, cid)
    if (it.price) rows.push([L(it.name), it.price, true])
  }
  ;(d.extras || []).forEach(([g, id]) => {
    const it = modItem(g, id)
    const q = exQty(d, g, id)
    rows.push([q > 1 ? `${q}× ${L(it.name)}` : L(it.name), it.price * q, true])
  })
  return rows
}

// ---------- keys ----------

export function cfgKey(d: Draft): string {
  const p = mustId(d.pid)
  return JSON.stringify([
    d.pid,
    servingsOf(p) ? servingIx(p, d) : -1,
    d.menu,
    d.menu ? d.drink : '',
    Object.entries(d.choices || {}).sort(),
    (d.extras || []).slice().sort(),
    Object.entries(d.extraQty || {}).sort(),
    (d.removes || []).slice().sort(),
  ])
}

export const stepKey = (d: Draft): string =>
  JSON.stringify({
    x: (d.extras || []).map(([g, i]) => g + ':' + i).sort(),
    r: (d.removes || []).map(([g, i]) => g + ':' + i).sort(),
    c: Object.entries(d.choices || {})
      .filter(([, v]) => v)
      .map(([g, v]) => g + ':' + v)
      .sort(),
    q: d.qty,
  })

export const hasMeaningfulChoices = (d: Draft): boolean =>
  Object.entries(d.choices || {}).some(([g, cid]) => cid && cid !== defChoice(g) && E().mods[g].items.length > 1)

export const canMergeCartLine = (d: Draft): boolean =>
  !d.menu && !(d.crossSells && d.crossSells.length) && !(d.extras && d.extras.length) && !(d.removes && d.removes.length) && !hasMeaningfulChoices(d)

// ---------- validation ----------

export interface Issue {
  code: string
  group?: string
  pid?: string
  xs?: string
  lid?: string
}

export const includedPids = (d: Draft): string[] => [
  d.pid,
  ...(d.menu ? [E().menuDeal.side, d.drink].filter((x): x is string => !!x) : []),
  ...((d.crossSells || []).map((x) => cmsById(x.id)?.pid).filter((x): x is string => !!x) as string[]),
]

export function validateLineStructure(d: Draft): Issue[] {
  const issues: Issue[] = []
  const p = byId(d.pid)
  if (!p) return [{ code: 'product-missing', pid: d.pid }]
  const mods = E().mods
  for (const [g, cid] of Object.entries(d.choices || {})) {
    if (!cid) continue
    if (!(p.choice || []).includes(g) || !mods[g] || !mods[g].items.some((i) => i.id === cid)) issues.push({ code: 'invalid-choice', group: g })
  }
  for (const [g, id] of d.extras || []) {
    if (!mods[g] || !mods[g].items.some((i) => i.id === id)) issues.push({ code: 'invalid-extra', group: g })
  }
  return issues
}

export function validateDraft(d: Draft, { availability = true }: { availability?: boolean } = {}): Issue[] {
  const p = byId(d.pid)
  const issues: Issue[] = []
  if (!p || p.disabled) return [{ code: 'product-missing', pid: d.pid }]
  issues.push(...validateLineStructure(d))
  const mods = E().mods
  ;(p.choice || []).forEach((g) => {
    if (mods[g].req && !d.choices[g]) issues.push({ code: 'required-choice', group: g })
  })
  if (d.menu && !d.drink) issues.push({ code: 'menu-drink' })
  if (!(Number.isInteger(d.qty) && d.qty >= 1 && d.qty <= MAX_LINE_QTY)) issues.push({ code: 'qty' })
  ;(d.crossSells || []).forEach((x) => {
    if (!Number.isInteger(x.quantity) || x.quantity < 1 || x.quantity > MAX_LINE_QTY) issues.push({ code: 'qty', xs: x.id })
  })
  if (availability) {
    const na = checkProducts(includedPids(d))
    na.forEach((pid) => issues.push({ code: pid === d.pid ? 'unavailable' : 'unavailable-included', pid }))
  }
  return issues
}

export const draftValid = (d: Draft): boolean => validateDraft(d).length === 0

export const firstIncomplete = (d: Draft): string | null => {
  const p = mustId(d.pid)
  const mods = E().mods
  return (p.choice || []).find((g) => mods[g].req && !d.choices[g]) || null
}

export interface UnavailPart {
  pid: string
  role: 'main' | 'menu-side' | 'menu-drink' | 'cross-sell'
  name: string
  id?: string
  fix?: 'menu' | 'drink' | 'xs'
}

export function unavailParts(d: Draft): UnavailPart[] {
  const na = new Set(checkProducts(includedPids(d)))
  const out: UnavailPart[] = []
  const md = E().menuDeal
  if (na.has(d.pid)) out.push({ pid: d.pid, role: 'main', name: mustId(d.pid).name })
  if (d.menu && na.has(md.side)) out.push({ pid: md.side, role: 'menu-side', name: mustId(md.side).name, fix: 'menu' })
  if (d.menu && d.drink && na.has(d.drink)) out.push({ pid: d.drink, role: 'menu-drink', name: mustId(d.drink).name, fix: 'drink' })
  ;(d.crossSells || []).forEach((x) => {
    const v = cmsById(x.id)
    const pid = v?.pid
    if (pid && na.has(pid)) out.push({ pid, role: 'cross-sell', id: x.id, name: mustId(pid).name, fix: 'xs' })
  })
  return out
}

export function blockReason(d: Draft): string {
  const iss = validateDraft(d)
  if (iss.some((i) => i.code.startsWith('unavailable'))) return tf('blockedUnavail', { list: unavailParts(d).map((x) => x.name).join(', ') })
  if (iss.some((i) => i.code === 'required-choice')) {
    const g = firstIncomplete(d)
    return g ? tf('r44Need', { group: L(E().mods[g].label) }) : t('blockedChoice')
  }
  if (iss.some((i) => i.code === 'menu-drink')) return t('r44NeedDrink')
  if (iss.some((i) => i.code === 'qty')) return t('blockedQty')
  return iss.length ? t('reqHint') : ''
}

export function lineNeedsChoice(d: Draft): boolean {
  return firstIncomplete(d) !== null
}

export function cmsHidden(p: Product | undefined): boolean {
  return alHidden(p)
}
