// Draft (product configuration) model: creation, pricing, validation. Port of the v36 engine.

import { alHidden, byId, mustId, modItem, servingOf, servingsOf, servingIx } from './catalog'
import { cmsById, drinkUp, priceOf } from './cms'
import { E, L, checkProducts, t, tf } from './state'
import { MAX_LINE_QTY, type CrossSellSel, type Draft, type ModGroup, type Product } from './types'

export const clampQty = (n: number): number => Math.max(1, Math.min(MAX_LINE_QTY, n | 0))

export function defChoice(g: string): string | null {
  const grp = E().mods[g]
  if (grp.def) return grp.def
  if (grp.req) return null
  const z = grp.items.find((i) => i.price === 0)
  return (z || grp.items[0]).id
}

/** Upsell 'step' groups keep their selections in draft.extras, counted against min..max. */
export const isStep = (g: string): boolean => E().mods[g]?.type === 'step'

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

export function exMax(id: string, g?: string): number {
  if (g && isStep(g)) return Math.max(1, E().mods[g].items.find((i) => i.id === id)?.maxQty || 1)
  const v = cmsById(id)
  return Math.max(1, v?.maxQuantity || 1)
}

export function exSet(d: Draft, g: string, id: string, n: number): number {
  d.extraQty = d.extraQty || {}
  n = Math.max(0, Math.min(exMax(id, g), n | 0))
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

// ---------- upsell steps (selection rules from the API collection) ----------

/**
 * Number of DIFFERENT options picked in an upsell step. The group's min/max count options, not items;
 * how often one option is taken is capped by that option's maxQty (old kiosk rule, Kiosk Upsale Flow doc, 2026-10-15).
 */
export function grpCount(d: Draft, g: string): number {
  return new Set((d.extras || []).filter(([gg]) => gg === g).map(([, id]) => id)).size
}

export const grpMin = (g: string): number => Math.max(0, E().mods[g]?.min ?? 0)
export const grpMax = (g: string): number => Math.max(1, E().mods[g]?.max ?? Number.MAX_SAFE_INTEGER)

/** The upsell steps currently on the page: the chain from steps[0], following picked options. */
export function activeSteps(p: Product, d: Draft): string[] {
  const mods = E().mods
  const out: string[] = []
  const seen = new Set<string>()
  let g: string | null | undefined = (p.steps || [])[0]
  while (g && mods[g] && !seen.has(g)) {
    seen.add(g)
    out.push(g)
    const grp: ModGroup = mods[g]
    const sel = grp.items.filter((it) => exQty(d, g!, it.id) > 0)
    if (sel.some((it) => it.finish)) break
    const jump = sel.find((it) => it.next != null)
    g = jump ? jump.next : grp.next
  }
  return out
}

/** Drop selections of steps that are no longer on the page. */
export function pruneSteps(d: Draft): void {
  const p = byId(d.pid)
  if (!p?.steps?.length) return
  const on = new Set(activeSteps(p, d))
  const mods = E().mods
  const gone = (d.extras || []).filter(([g]) => mods[g]?.type === 'step' && !on.has(g))
  gone.forEach(([g, id]) => exSet(d, g, id, 0))
}

/**
 * Set one option of an upsell step to n (capped by the option's maxQty).
 * Picking a NEW option when the group already has `max` different options is refused, except in a group
 * with max 1, which behaves as a radio: the new option replaces the old one. Returns false when refused.
 */
export function grpSet(d: Draft, g: string, id: string, n: number): boolean {
  const max = grpMax(g)
  const cur = exQty(d, g, id)
  n = Math.max(0, Math.min(exMax(id, g), n | 0))
  if (n > cur && stepLocked(d, g)) return false
  if (cur === 0 && n > 0 && grpCount(d, g) >= max) {
    if (max !== 1) return false
    ;(d.extras || []).filter(([gg, ii]) => gg === g && ii !== id).forEach(([gg, ii]) => exSet(d, gg, ii, 0))
  }
  exSet(d, g, id, n)
  pruneSteps(d)
  return true
}

/**
 * An upsell step is locked (greyed out, no new picks) while an earlier step on the page is required and not
 * finished yet — the product-page form of the old wizard's "choose first, then Next" (2026-10-15).
 * Picks already made in a step that becomes locked are kept.
 */
export function stepLocked(d: Draft, g: string): boolean {
  const p = byId(d.pid)
  if (!p || !isStep(g)) return false
  for (const s of activeSteps(p, d)) {
    if (s === g) return false
    if (grpCount(d, s) < grpMin(s)) return true
  }
  return false
}

/** Groups whose rules apply to the draft right now: modifiers and the active upsell steps. */
export const ruleGroups = (p: Product, d: Draft): string[] => [...(p.choice || []), ...activeSteps(p, d)]

function groupUnmet(d: Draft, g: string): boolean {
  const grp = E().mods[g]
  if (isStep(g)) return grpCount(d, g) < grpMin(g)
  return !!grp.req && !d.choices[g]
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

/** Selected upsell-step options that are backed by a product (API catalog): [group, optionId, productId]. */
export const stepOptionPids = (d: Draft): [string, string, string][] =>
  (d.extras || []).flatMap(([g, id]) => {
    if (!isStep(g)) return []
    const pid = E().mods[g]?.items.find((i) => i.id === id)?.pid
    return pid ? [[g, id, pid] as [string, string, string]] : []
  })

/** Every product a configured line depends on: main product, menu parts, cross-sells and upsell options (audit F06). */
export const includedPids = (d: Draft): string[] => [
  d.pid,
  ...stepOptionPids(d).map(([, , pid]) => pid),
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
  const live = new Set(ruleGroups(p, d))
  for (const g of new Set((d.extras || []).map(([gg]) => gg))) {
    if (!mods[g] || !isStep(g)) continue
    if (!live.has(g) || grpCount(d, g) > grpMax(g)) issues.push({ code: 'invalid-extra', group: g })
  }
  return issues
}

export function validateDraft(d: Draft, { availability = true }: { availability?: boolean } = {}): Issue[] {
  const p = byId(d.pid)
  const issues: Issue[] = []
  if (!p || p.disabled) return [{ code: 'product-missing', pid: d.pid }]
  issues.push(...validateLineStructure(d))
  ruleGroups(p, d).forEach((g) => {
    if (groupUnmet(d, g)) issues.push({ code: 'required-choice', group: g })
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
  return ruleGroups(p, d).find((g) => groupUnmet(d, g)) || null
}

export interface UnavailPart {
  pid: string
  role: 'main' | 'menu-side' | 'menu-drink' | 'cross-sell' | 'option'
  name: string
  id?: string
  group?: string
  fix?: 'menu' | 'drink' | 'xs' | 'option'
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
  stepOptionPids(d).forEach(([g, id, pid]) => {
    if (na.has(pid)) out.push({ pid, role: 'option', id, group: g, name: L(modItem(g, id).name), fix: 'option' })
  })
  return out
}

/** An upsell option whose product is sold out / disabled cannot be picked (and is shown as such). */
export function optionUnavailable(g: string, id: string): boolean {
  const pid = E().mods[g]?.items.find((i) => i.id === id)?.pid
  return !!pid && checkProducts([pid]).length > 0
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
