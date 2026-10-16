// Commercial CMS model: roles decide the renderer. Port of experienceFor() and the cms* helpers.

import { alHidden, byId, mustId, obHasReq } from './catalog'
import { E, checkProducts } from './state'
import type { CmsBlock, CmsItem, CmsTarget, MenuUpgradeCms, ModGroup, Product, UpsellSettings } from './types'


export function cmsTargets(v: { target?: CmsTarget }, p: Product): boolean {
  const g = v.target || {}
  if (g.products && !g.products.includes(p.id)) return false
  if (g.cats && !g.cats.includes(p.cat)) return false
  if (g.canMenu && !p.canMenu) return false
  return !!(g.products || g.cats || g.canMenu)
}

export function cmsList(arr: CmsItem[] | undefined, p: Product): CmsItem[] {
  return (arr || [])
    .filter((v) => v.enabled !== false && v.pid !== p.id && cmsTargets(v, p) && !(v.pid && alHidden(byId(v.pid))))
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
}

export function cmsById(id: string): CmsItem | undefined {
  const u = E().upsell
  return [...u.productEnhancements, ...u.crossSells, ...u.premiumDrinks].find((v) => v.id === id)
}

export function cmsPidOf(id: string): string | undefined {
  return cmsById(id)?.pid
}

export function cmsBlocks(role: CmsBlock['role']): CmsBlock[] {
  return ((E().cms.upsell || {}).blocks || []).filter((b) => b.enabled && b.role === role).sort((a, b) => (a.priority || 0) - (b.priority || 0))
}

/** Kiosk category ids that a shared block's eMenu category names target. */
export function cmsCatsFor(target: { cats?: string[] } | undefined): string[] {
  const alias = E().cmsCatAlias
  return (target?.cats || []).flatMap((c) => alias[c] || [c])
}

export function cmsFinishBlock(cat: string): CmsBlock | undefined {
  return cmsBlocks('category-finish').find((b) => cmsCatsFor(b.target).includes(cat))
}

export function cmsAddable(p: Product | undefined): p is Product {
  return !!p && !p.disabled && !alHidden(p) && !obHasReq(p) && !checkProducts([p.id]).length
}

export function presentationFor(cat: string): { card: 'visual' | 'compact'; columns: number } {
  const d = E()
  const p = (d.cms.categories || {})[cat]?.presentation || {}
  const cols = p.columns || {}
  return { card: p.card || 'visual', columns: cols.kiosk || d.brand.layout.gridColumns }
}

export function obwMode(cat: string): 'top' | 'all' | 'off' {
  const d = E()
  const p = (d.cms.categories || {})[cat]?.presentation || {}
  const m = p.variantCards || d.obwDefault[cat] || 'off'
  return m === 'top' || m === 'all' ? m : 'off'
}

export interface Experience {
  flowType: 'visual-upsell' | 'modification'
  modificationGroups: { id: string; label: ModGroup['label']; required: boolean; options: ModGroup['items'] }[]
  menuUpgrade: MenuUpgradeCms | null
  allEnhancements: CmsItem[]
  allCrossSells: CmsItem[]
  productEnhancements: CmsItem[]
  crossSells: CmsItem[]
  premiumDrinks: CmsItem[]
  upsellSettings: UpsellSettings
  sectionEnh: { title: ModGroup['label'] }
  sectionXs: { title: ModGroup['label'] }
}

/**
 * The ONLY place product-specific decisions are made.
 * `orderedPids` = products already in the order (cross-sells are not pushed again), minus the line being edited.
 * `selectedXs` = cross-sell ids currently selected in the draft (stay visible).
 */
export function experienceFor(p: Product, orderedPids: Set<string>, selectedXs: Set<string>): Experience {
  const d = E()
  const st = d.upsell.upsellSettings
  const on = st.enabled !== false && d.brand.features.visualUpsells !== false
  const groups = (p.choice || []).map((g) => ({ id: g, label: d.mods[g].label, required: !!d.mods[g].req, options: d.mods[g].items }))
  const allEnh = on ? cmsList(d.upsell.productEnhancements, p) : []
  const allXs = on ? cmsList(d.upsell.crossSells, p).filter((v) => !orderedPids.has(v.pid!) || selectedXs.has(v.id)) : []
  const drinks = on ? cmsList(d.upsell.premiumDrinks, p) : []
  const mu = d.upsell.menuUpgrade
  const menuUpgrade = on && st.showMenuUpgrade && mu && mu.enabled !== false && p.canMenu && cmsTargets(mu, p) && !alHidden(byId(d.menuDeal.side)) ? mu : null
  const explicit = p.experience?.flowType
  const flowType = explicit || (menuUpgrade || allEnh.length || allXs.length ? 'visual-upsell' : 'modification')
  return {
    flowType,
    modificationGroups: groups,
    menuUpgrade,
    allEnhancements: allEnh,
    allCrossSells: allXs,
    productEnhancements: allEnh.slice(0, st.maxProductEnhancementsVisible || allEnh.length),
    crossSells: allXs.slice(0, st.maxCrossSellsVisible || allXs.length),
    premiumDrinks: drinks,
    upsellSettings: st,
    sectionEnh: d.upsell.sections.enhancements[p.cat] || d.upsell.sections.enhancements.default,
    sectionXs: d.upsell.sections.crossSells[p.cat] || d.upsell.sections.crossSells.default,
  }
}

/** CMS item → validated price from the catalog. */
export function resolvePrice(v: CmsItem | { pid?: string; price?: number; priceVariantId?: string; id?: string }): number {
  const d = E()
  if (v.priceVariantId) {
    const pv = d.priceVariants[v.priceVariantId]
    if (!pv || pv.pid !== v.pid) throw new Error('invalid price variant ' + v.priceVariantId + ' for ' + v.pid)
    return pv.price
  }
  if (v.pid) return mustId(v.pid).price
  if (typeof v.price === 'number') return v.price
  throw new Error('no price source for ' + String(v.id))
}

export const priceOf = resolvePrice

export function drinkUp(id: string | null): number {
  if (!id) return 0
  const v = E().upsell.premiumDrinks.find((x) => x.pid === id)
  return v ? priceOf(v) : 0
}

/** A menu drink is valid when it is an included drink OR a paid upgrade drink offered for this product. */
export function menuDrinkOk(l: { pid: string; drink: string | null }): boolean {
  const d = E()
  if (!l.drink) return false
  return d.menuDeal.drinks.includes(l.drink) || cmsList(d.upsell.premiumDrinks, mustId(l.pid)).some((v) => v.pid === l.drink)
}
