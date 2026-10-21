// @vitest-environment node
// Design rules from the API data itself (the per-venue design file was withdrawn 2026-10-20): the promotion
// window makes the promo card, the subcategory name picks the sidebar icon, nothing points at brand-pack products.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { byId, homeHasContent, prodsIn } from '../../engine/catalog'
import { finalizeEngineData } from '../../engine/data'
import { setAllergenFilter, setEngine, setLang, setUnavailable } from '../../engine/state'
import type { EngineData } from '../../engine/types'
import type { TmkRoot } from './tmk'
import { mapTmkToEngine } from './tmkMapper'
import { CATEGORY_ICON, iconForCategory, promoActive } from './tmkRules'

const SAMPLES = resolve(process.cwd(), '../failover-handover/docs/reference/api-samples')
const sample = (f: string): TmkRoot => JSON.parse(readFileSync(resolve(SAMPLES, f), 'utf8'))
const FULL = sample('getfullresources.json')
const TEST = sample('testmode-2490.json')

function pack(): EngineData {
  const dir = resolve(process.cwd(), 'public/mock/dadawan')
  const j = (f: string) => JSON.parse(readFileSync(resolve(dir, f + '.json'), 'utf8'))
  return finalizeEngineData({
    brand: j('BRAND'), cats: j('CATS'), products: j('PRODUCTS'), mods: j('MODS'), menuDeal: j('MENU_DEAL'), cms: j('GUESTIT_CMS'), upsell: j('UPSELL_CMS'),
    priceVariants: j('PRICE_VARIANTS'), i18n: j('I18N'), alg: j('ALG'), algIcon: j('ALG_ICON'), catsub: j('CATSUB'), comp: j('COMP'), compAll: j('COMP_ALL'),
    flags: j('FLAGS'), locales: j('LOCALES'), bdg: j('BDG'), icons: j('P'), obwInfo: j('OBW_INFO'), obwDefault: j('OBW_DEFAULT'), cmsCatAlias: j('CMS_CAT_ALIAS'),
    roleGroup: j('ROLE_GROUP'), allergenPolicy: j('ALLERGEN_POLICY'),
  })
}
const NOW = Date.parse('2026-10-16T12:00:00')
const map = (raw: TmkRoot, now = NOW) => mapTmkToEngine(raw, pack(), { img: (u) => u, now })
const use = (d: EngineData) => {
  setEngine(d)
  setLang('nl')
  setUnavailable([])
  setAllergenFilter(new Set())
}

describe('what the API itself carries', () => {
  it('IsPromotion within PromotionFrom..PromotionTo → promo card on the home + "dea" badge (menu 2408: De Keuken)', () => {
    const d = map(FULL)
    use(d)
    expect(d.brand.promos.map((p) => p.pid)).toEqual(['454444'])
    expect(byId('454444')!.badges).toContain('dea')
    expect(byId('454444')!.infoOnly).toBe(true) // NoInteraction: a banner, not an orderable deal
    expect(homeHasContent()).toBe(true)
    const t = map(TEST)
    expect(t.brand.promos).toEqual([])
  })
  it('the promotion window is respected; a missing bound is open', () => {
    const p = { IsPromotion: true, PromotionFrom: '2025-10-09T11:40:00', PromotionTo: '2031-08-06T11:40:00' }
    expect(promoActive(p, NOW)).toBe(true)
    expect(promoActive(p, Date.parse('2025-01-01T00:00:00'))).toBe(false)
    expect(promoActive(p, Date.parse('2032-01-01T00:00:00'))).toBe(false)
    expect(promoActive({ IsPromotion: true, PromotionFrom: null, PromotionTo: null }, NOW)).toBe(true)
    expect(promoActive({ IsPromotion: false, PromotionFrom: null, PromotionTo: null }, NOW)).toBe(false)
    expect(map(FULL, Date.parse('2032-01-01T00:00:00')).brand.promos).toEqual([])
  })
  it('every API subcategory gets the neutral fork-and-bottle icon until the backend carries icons (2026-10-21)', () => {
    for (const n of ['SUSHI', 'Nagerechten', 'Frisdranken', 'Vega gerechten', 'Zomaar iets']) expect(iconForCategory(n)).toBe(CATEGORY_ICON)
    const d = map(FULL)
    expect(d.cats.map((c) => c.icon)).toEqual(d.cats.map(() => CATEGORY_ICON))
    expect(Object.keys(d.icons)).toContain(CATEGORY_ICON) // the glyph exists in the icon set
  })
  it('nothing on an API menu points at brand-pack content: no cross-sells, finish strips, cart block, reward, subtitles', () => {
    const d = map(FULL)
    use(d)
    expect(d.upsell.crossSells).toEqual([])
    expect(d.cms.upsell.blocks).toEqual([])
    expect(d.brand.reward).toBeUndefined()
    expect(d.catsub).toEqual({})
    expect(prodsIn('new')).toEqual([]) // "new" badges only ever came from the design file
  })
})
