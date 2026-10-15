// Loads the engine data bundle (public/mock/dadawan/*.json) and applies the engine's load-time defaults.

import type { OrderTagConfig } from '../domain/types'
import type { Brand, EngineData } from './types'

const FILES = {
  brand: 'BRAND',
  cats: 'CATS',
  products: 'PRODUCTS',
  mods: 'MODS',
  menuDeal: 'MENU_DEAL',
  cms: 'GUESTIT_CMS',
  upsell: 'UPSELL_CMS',
  priceVariants: 'PRICE_VARIANTS',
  i18n: 'I18N',
  alg: 'ALG',
  algIcon: 'ALG_ICON',
  catsub: 'CATSUB',
  comp: 'COMP',
  compAll: 'COMP_ALL',
  flags: 'FLAGS',
  locales: 'LOCALES',
  bdg: 'BDG',
  icons: 'P',
  obwInfo: 'OBW_INFO',
  obwDefault: 'OBW_DEFAULT',
  cmsCatAlias: 'CMS_CAT_ALIAS',
  roleGroup: 'ROLE_GROUP',
  allergenPolicy: 'ALLERGEN_POLICY',
} as const

export async function fetchEngineData(base: string): Promise<EngineData> {
  const root = base.endsWith('/') ? base : base + '/'
  const entries = await Promise.all(
    Object.entries(FILES).map(async ([key, file]) => {
      const res = await fetch(`${root}mock/dadawan/${file}.json`, { cache: 'no-cache' })
      if (!res.ok) throw new Error(`fetch ${file}.json: HTTP ${res.status}`)
      return [key, await res.json()] as const
    }),
  )
  const d = Object.fromEntries(entries) as unknown as EngineData
  rebaseAssets(d, root)
  return finalizeEngineData(d)
}

/** The data refers to embedded assets as '/brand/…'; rewrite them relative to the page so a sub-folder host works. */
function rebaseAssets(o: unknown, root: string, seen = new Set<object>()): void {
  if (!o || typeof o !== 'object' || seen.has(o)) return
  seen.add(o)
  const rec = o as Record<string, unknown>
  for (const k of Object.keys(rec)) {
    const v = rec[k]
    if (typeof v === 'string') {
      if (v.startsWith('/brand/')) rec[k] = root + v.slice(1)
    } else if (v && typeof v === 'object') rebaseAssets(v, root, seen)
  }
}

/** Load-time normalisation the engine performs after the data literals. */
export function finalizeEngineData(d: EngineData): EngineData {
  const b = d.brand as Brand & { promos?: Brand['promos'] }
  b.promos = b.promos || []
  // Offline-safe media: the embedded photos replace remote hero/sidebar URLs when they are not reachable.
  const localHero = (b.logoImg || '').replace(/brand\/.*$/, 'brand/') + 'img/hero.webp'
  if (!b.hero.images?.length) b.hero.images = [localHero]
  // Premium extras group mirrors the CMS product enhancements (price read from the CMS item).
  if (d.mods.premX) {
    d.mods.premX.items = d.upsell.productEnhancements.map((v) => ({ id: v.id, name: v.title!, price: typeof v.price === 'number' ? v.price : 0 }))
  }
  return d
}

/** Order-tag defaults as the engine applies them (BRAND.orderTag ← window.GuestitConfig.orderTag). */
export function resolveOrderTagConfig(cfg: Partial<OrderTagConfig> | undefined): OrderTagConfig {
  const o: OrderTagConfig = { mode: 'none', takeawayMode: null, required: true, min: 1, max: 99, nameMin: 2, nameMax: 16, nameBlocklist: [], ...(cfg || {}) }
  const int = (v: unknown, lo: number, hi: number, dflt: number) => {
    const n = Number(v)
    return Number.isInteger(n) && n >= lo && n <= hi ? n : dflt
  }
  if (!['none', 'pager', 'table', 'name'].includes(o.mode)) o.mode = 'none'
  if (o.takeawayMode != null && !['none', 'pager', 'table', 'name'].includes(o.takeawayMode)) o.takeawayMode = null
  o.min = int(o.min, 0, 9999, 1)
  o.max = int(o.max, 1, 9999, 99)
  if (o.max < o.min) o.max = o.min
  o.nameMin = int(o.nameMin, 1, 10, 2)
  o.nameMax = int(o.nameMax, 4, 30, 16)
  o.required = o.required !== false
  const rng = (r: { min?: number; max?: number } | undefined, dmin: number, dmax: number) => {
    const min = int(r?.min ?? dmin, 0, 9999, dmin)
    const max = int(r?.max ?? dmax, 1, 9999, dmax)
    return { min, max: Math.max(min, max) }
  }
  o.table = rng(o.table, o.min, o.max)
  o.pager = rng(o.pager, o.min, o.max)
  o.nameBlocklist = Array.isArray(o.nameBlocklist) ? o.nameBlocklist.filter((w) => typeof w === 'string' && w.trim() && w.length <= 40).slice(0, 1000) : []
  return o
}
