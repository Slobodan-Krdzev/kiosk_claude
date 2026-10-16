import { E, L, checkProducts, getAllergenFilter, t } from './state'
import type { Allergens, Cat, Draft, ModItem, Product, Serving } from './types'

export function byId(id: string | null | undefined): Product | undefined {
  if (!id) return undefined
  return E().products.find((p) => p.id === id)
}

export function mustId(id: string): Product {
  const p = byId(id)
  if (!p) throw new Error('unknown product ' + id)
  return p
}

/** Product name in the current language (API menus carry per-language names; the brand pack has one). Audit F09. */
export function pname(p: Pick<Product, 'name' | 'names'>): string {
  return (p.names ? L(p.names) : '') || p.name
}

export function catOf(id: string): Cat | undefined {
  return E().cats.find((c) => c.id === id)
}

/** Category name: from the API catalog when present, else the brand pack's i18n key. */
export function catLabel(id: string): string {
  const c = catOf(id)
  return c?.name ? L(c.name) : t('cat_' + id)
}

export function servingsOf(p: Product | undefined | null): Serving[] | null {
  return Array.isArray(p?.servings) && p!.servings!.length ? p!.servings! : null
}

export function defServingIx(p: Product): number {
  const sv = servingsOf(p)
  if (!sv) return -1
  const i = sv.findIndex((x) => x.love)
  return i >= 0 ? i : 0
}

export function servingIx(p: Product, d: { serving?: number } | null | undefined): number {
  const sv = servingsOf(p)
  if (!sv) return -1
  const i = d && Number.isInteger(d.serving) ? (d.serving as number) : defServingIx(p)
  return Math.max(0, Math.min(sv.length - 1, i))
}

export function servingOf(p: Product, d: { serving?: number } | null | undefined): Serving | null {
  const sv = servingsOf(p)
  return sv ? sv[servingIx(p, d)] : null
}

/** 2–3 sizes to show on a card. */
export function obSizes(p: Product): Serving[] | null {
  const sv = servingsOf(p)
  return sv && sv.length > 1 ? sv : null
}

export function obHasReq(p: Product): boolean {
  return (p.choice || []).some((g) => E().mods[g]?.req)
}

export function obNeedsDetail(p: Product): boolean {
  // API catalog: upsell steps are chosen on the product page.
  return obHasReq(p) || !!obSizes(p) || !!p.steps?.length
}

/** May show its sizes in a WIDE card. */
export function obVarCard(p: Product): boolean {
  const sv = obSizes(p)
  return !!sv && sv.length <= 3 && !obHasReq(p)
}

export function modItem(g: string, id: string): ModItem {
  const it = E().mods[g]?.items.find((i) => i.id === id)
  if (!it) throw new Error('unknown option ' + g + ':' + id)
  return it
}

export function alContains(p: Product | undefined): string[] {
  return p?.allergens?.contains || []
}

/** Allergen filter hides "contains" only. */
export function alHidden(p: Product | undefined | null): boolean {
  if (!p) return false
  const f = getAllergenFilter()
  if (!f.size) return false
  const c = alContains(p)
  return [...f].some((a) => c.includes(a))
}

export function alUnknown(p: Product): boolean {
  return !!p.allergens?.unknown
}

/** ONE filter for every product list. */
export function visible(list: Product[]): Product[] {
  return list.filter((p) => !p.disabled && !checkProducts([p.id]).length && !alHidden(p))
}

export function gtcSoldOut(p: Product): boolean {
  return checkProducts([p.id]).length > 0
}

export type Blocked = 'filter' | 'na' | null

export function obBlocked(p: Product): Blocked {
  return alHidden(p) ? 'filter' : gtcSoldOut(p) ? 'na' : null
}

/** True when the menu comes from the kiosk API: the venue's identity replaces the brand pack's on every screen (audit F10). */
export const venueMenu = (): boolean => !!E().venue
export const venueName = (): string => E().venue?.name || ''

/** Promotions or popular / new products to show on the home screen; without them the kiosk opens on the first category (audit F08). */
export function homeHasContent(): boolean {
  const d = E()
  const promos = (d.brand.promos || []).filter((pr) => byId(pr.pid) && !alHidden(byId(pr.pid)))
  if (promos.length) return true
  return visible(d.products.filter((p) => p.badges.includes('pop') || p.badges.includes('new'))).length > 0
}

export function prodsIn(cat: string): Product[] {
  const d = E()
  if (cat === 'popular') return visible(d.products.filter((p) => p.badges.includes('pop')))
  if (cat === 'new') return visible(d.products.filter((p) => p.badges.includes('new')))
  return visible(d.products.filter((p) => p.cat === cat))
}

/** Products shown as cards in a category (every visible product of that category). */
export function prodsInCards(cat: string): Product[] {
  return prodsIn(cat)
}

export function composedAllergens(d: Draft, cmsPidOf: (id: string) => string | undefined): Allergens & { unknownNames: string[] } {
  const p = mustId(d.pid)
  const c = new Set(alContains(p))
  const tr = new Set(p.allergens?.traces || [])
  const unknownNames: string[] = []
  const add = (q: Product | undefined) => {
    if (!q) return
    if (alUnknown(q)) unknownNames.push(q.name)
    alContains(q).forEach((a) => c.add(a))
    ;(q.allergens?.traces || []).forEach((a) => tr.add(a))
  }
  if (d.menu) {
    add(byId(E().menuDeal.side))
    add(byId(d.drink))
  }
  ;(d.crossSells || []).forEach((x) => add(byId(cmsPidOf(x.id))))
  ;(d.extras || []).forEach(([g, id]) => {
    const it = modItem(g, id)
    if (it.allergens) {
      ;(it.allergens.contains || []).forEach((a) => c.add(a))
      ;(it.allergens.traces || []).forEach((a) => tr.add(a))
    } else unknownNames.push(typeof it.name === 'string' ? it.name : it.name.en)
  })
  return { contains: [...c], traces: [...tr].filter((a) => !c.has(a)), removable: p.allergens?.removable || [], unknown: unknownNames.length > 0, unknownNames, ...(p.allergens?.info?.length ? { info: p.allergens.info } : {}) }
}
