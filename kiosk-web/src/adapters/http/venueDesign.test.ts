// @vitest-environment node
// Venue design layer on API menus (decision D2 closed 2026-10-16): the API's own promotion flag, name-based
// category icons, and the per-venue design file keyed by API ids. Runs on the captured real responses.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it, vi } from 'vitest'
import { addToCart, syncCrossSells } from '../../engine/cart'
import { byId, homeHasContent, prodsIn } from '../../engine/catalog'
import { cmsBlocks, cmsById, cmsFinishBlock, experienceFor, priceOf } from '../../engine/cms'
import { finalizeEngineData } from '../../engine/data'
import { includedPids, newDraft, xsSet } from '../../engine/draft'
import { setAllergenFilter, setEngine, setLang, setUnavailable } from '../../engine/state'
import type { EngineData } from '../../engine/types'
import { designFor, designUrl, fetchDesign } from './catalogSource'
import type { TmkRoot } from './tmk'
import { mapTmkToEngine } from './tmkMapper'
import { EMPTY_DESIGN, iconForCategory, normalizeVenueDesign, promoActive, type VenueDesign } from './venueDesign'

const SAMPLES = resolve(process.cwd(), '../failover-handover/docs/reference/api-samples')
const sample = (f: string): TmkRoot => JSON.parse(readFileSync(resolve(SAMPLES, f), 'utf8'))
const FULL = sample('getfullresources.json')
const TEST = sample('testmode-2490.json')
const VENUE_2408 = JSON.parse(readFileSync(resolve(process.cwd(), 'public/venue/2408.json'), 'utf8'))

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
const PACK = pack()
const KNOWN = { badges: Object.keys(PACK.bdg), icons: Object.keys(PACK.icons) }
const NOW = Date.parse('2026-10-16T12:00:00')
const map = (raw: TmkRoot, design?: VenueDesign) => mapTmkToEngine(raw, pack(), { img: (u) => u, design, now: NOW })
const use = (d: EngineData) => {
  setEngine(d)
  setLang('nl')
  setUnavailable([])
  setAllergenFilter(new Set())
}
const design2408 = () => designFor(VENUE_2408, PACK)

describe('what the API itself carries', () => {
  it('IsPromotion within PromotionFrom..PromotionTo → promo card on the home + "deal" badge (menu 2408: De Keuken)', () => {
    const d = map(FULL)
    use(d)
    expect(d.brand.promos).toHaveLength(1)
    const pr = d.brand.promos[0]
    expect(pr.pid).toBe('454444')
    expect(pr.img).toBe(byId('454444')!.img)
    expect(pr.flag).toEqual({ en: 'Promotion', nl: 'Aanbieding', mk: 'Промоција' })
    expect(pr.title).toBe('De Keuken')
    expect(byId('454444')!.badges).toContain('dea')
    expect(homeHasContent()).toBe(true)
    expect(map(TEST).brand.promos).toEqual([]) // menu 2490 promotes nothing
  })
  it('the promotion window is respected; a missing bound is open', () => {
    const p = { IsPromotion: true, PromotionFrom: '2025-10-09T11:40:00', PromotionTo: '2031-08-06T11:40:00' }
    expect(promoActive(p, NOW)).toBe(true)
    expect(promoActive(p, Date.parse('2025-01-01T00:00:00'))).toBe(false)
    expect(promoActive(p, Date.parse('2032-01-01T00:00:00'))).toBe(false)
    expect(promoActive({ IsPromotion: true, PromotionFrom: null, PromotionTo: null }, NOW)).toBe(true)
    expect(promoActive({ IsPromotion: true, PromotionFrom: 'garbage', PromotionTo: null }, NOW)).toBe(true)
    expect(promoActive({ IsPromotion: false, PromotionFrom: null, PromotionTo: null }, NOW)).toBe(false)
    const expired = map(FULL, undefined)
    const d = mapTmkToEngine(FULL, pack(), { img: (u) => u, now: Date.parse('2032-01-01T00:00:00') })
    expect(expired.brand.promos).toHaveLength(1)
    expect(d.brand.promos).toEqual([])
    expect(d.products.find((p) => p.id === '454444')!.badges).not.toContain('dea')
  })
  it('sidebar icons follow the subcategory name; unknown names fall back to "dish"', () => {
    const d = map(FULL)
    expect(d.cats.map((c) => [c.name, c.icon])).toEqual([
      ['MAANDSPECIALS', 'star'],
      ['KOUDE GERECHTEN', 'plate'],
      ['VEGA GERECHTEN', 'heart'],
      ['SUSHI', 'sushi'],
      ['VLEES GERECHTEN', 'plate'],
      ['VIS GERECHTEN', 'plate'],
      ['NAGERECHTEN', 'cake'],
    ])
    expect(map(TEST).cats.map((c) => c.icon)).toEqual(['cup', 'skewer', 'cup']) // Frisdranken, ASIAN BITES, Wijnen
    for (const [n, i] of [['Warme dranken', 'cup'], ['SOEPEN', 'ramen'], ['SALADS & COLD DISHES', 'heart'], ['KOREAN NOODLES', 'ramen'], ['Kadobonnen', 'gift'], ['AFHAAL', 'bag'], ['Crème Brûlée & Co', 'cake'], ['Tester', 'dish'], ['', 'dish']]) {
      expect(iconForCategory(n), n).toBe(i)
    }
    expect(KNOWN.icons).toEqual(expect.arrayContaining(['star', 'plate', 'heart', 'sushi', 'cake', 'cup', 'skewer', 'ramen', 'gift', 'bag', 'bowl', 'curry', 'dish']))
  })
})

describe('venue design file', () => {
  it('the dev venue file validates and only references ids of menu 2408', () => {
    const { design, problems } = design2408()
    expect(problems).toEqual([])
    const d = map(FULL)
    const pids = new Set(d.products.map((p) => p.id))
    const sids = new Set(d.cats.map((c) => c.id.slice(1)))
    for (const pid of Object.keys(design!.badges)) expect(pids.has(pid), 'badge pid ' + pid).toBe(true)
    for (const sid of [...Object.keys(design!.icons), ...Object.keys(design!.catsub)]) expect(sids.has(sid), 'subcategory ' + sid).toBe(true)
    for (const x of design!.crossSells) {
      expect(pids.has(x.pid), 'cross-sell ' + x.pid).toBe(true)
      for (const c of x.cats || []) expect(sids.has(c), 'cross-sell cat ' + c).toBe(true)
    }
    for (const f of design!.finish) {
      for (const c of f.cats) expect(sids.has(c)).toBe(true)
      for (const p of f.pids) expect(pids.has(p)).toBe(true)
    }
    for (const p of design!.inspire!.pids) expect(pids.has(p)).toBe(true)
  })

  it('malformed or unknown entries are dropped and reported; the menu never fails on the design file', () => {
    expect(normalizeVenueDesign(null, KNOWN)).toEqual({ design: EMPTY_DESIGN, problems: [] })
    expect(normalizeVenueDesign('nope', KNOWN).problems).toEqual(['design file is not an object'])
    const { design, problems } = normalizeVenueDesign(
      {
        badges: { 454992: ['pop', 'glitter'], '': ['new'], 1: 'pop', 2: ['new', 'new'] },
        icons: { 54992: 'star', 54926: 'unicorn' },
        catsub: { 54992: 'Specials', 54926: { nl: 'x' }, 54941: 7 },
        promos: [{ pid: 454444, flag: 'Deal' }, { title: 'no pid' }],
        crossSells: [{ pid: '443437', cats: [54943, 'x'] }, { cats: ['54943'] }],
        finish: [{ cats: ['54943'], pids: ['443437'], maxVisible: '3' }, { cats: [], pids: ['1'] }, 'junk'],
        inspire: { pids: [], linkCat: 54946 },
        reward: { threshold: 25.5, pid: '443490' },
      },
      KNOWN,
    )
    expect(design.badges).toEqual({ '454992': ['pop'], '2': ['new'] })
    expect(design.icons).toEqual({ '54992': 'star' })
    expect(design.catsub).toEqual({ '54992': 'Specials', '54926': { en: 'x', nl: 'x' } })
    expect(design.promos).toEqual([{ pid: '454444', flag: 'Deal' }])
    expect(design.crossSells).toEqual([{ pid: '443437', cats: ['54943', 'x'] }])
    expect(design.finish).toEqual([{ cats: ['54943'], pids: ['443437'], maxVisible: 3 }]) // numeric strings are accepted
    expect(design.inspire).toEqual({ pids: [], linkCat: '54946' })
    expect(design.reward).toBeUndefined()
    expect(problems).toEqual([
      'badges.454992: unknown badge "glitter"',
      'icons.54926: unknown icon "unicorn"',
      'catsub.54941: not a text',
      'promos[1]: missing pid',
      'crossSells[1]: missing pid',
      'finish[1]: needs cats and pids',
      'finish[2]: not an object',
      'reward: needs pid and an integer threshold in cents',
    ])
  })

  it('badges and subtitles by API id; the home shows Popular / New rows; a bogus id is ignored', () => {
    const d = map(FULL, { ...EMPTY_DESIGN, badges: { '454992': ['pop', 'new'], '443448': ['pop'], '999': ['pop'] }, catsub: { '54942': { en: 'Fresh', nl: 'Vers' } } })
    use(d)
    expect(byId('454992')!.badges).toEqual(expect.arrayContaining(['pop', 'new']))
    expect(prodsIn('popular').map((p) => p.id).sort()).toEqual(['443448', '454992'])
    expect(prodsIn('new').map((p) => p.id)).toEqual(['454992'])
    expect(d.catsub.s54942).toEqual({ en: 'Fresh', nl: 'Vers' })
    expect(d.catsub.s54926).toBeUndefined()
    // API-derived badges are kept next to the design ones
    const spicy = TEST.TMKData[0].MainCategories.flatMap((m) => m.SubCategories).flatMap((s) => s.Products).find((p) => p.IsSpicy)!
    expect(spicy).toBeDefined()
  })

  it('icons from the file override the name rule', () => {
    const d = map(FULL, { ...EMPTY_DESIGN, icons: { '54926': 'bowl' } })
    expect(d.cats.find((c) => c.id === 's54926')!.icon).toBe('bowl')
    expect(d.cats.find((c) => c.id === 's54942')!.icon).toBe('sushi')
  })

  it('a promo entry in the file completes the API promotion: product texts and image by default, own texts when given', () => {
    const d = map(FULL, { ...EMPTY_DESIGN, promos: [{ pid: '454992', flag: { en: 'Chef', nl: 'Chef' } }, { pid: '454444', title: 'Our kitchen' }, { pid: 'nope' }] })
    expect(d.brand.promos.map((p) => p.pid)).toEqual(['454992', '454444']) // file order first, API promotion once
    expect(d.brand.promos[0].flag).toEqual({ en: 'Chef', nl: 'Chef' })
    expect(d.brand.promos[0].title).toBe('Herten carpaccio')
    expect(d.brand.promos[0].img).toBe(byId('454992')!.img)
    expect(d.brand.promos[1].title).toBe('Our kitchen')
  })

  it('cross-sells target API categories, cost the product menu price, and become orderable lines with the API ProductId', () => {
    const d = map(FULL, design2408().design)
    use(d)
    const steak = byId('443457')! // VLEES GERECHTEN
    const xp = experienceFor(steak, new Set(), new Set())
    expect(xp.flowType).toBe('visual-upsell')
    expect(xp.allCrossSells.map((v) => v.pid)).toEqual(['443437', '443438', '443490'])
    const v = cmsById('xs443437')!
    expect(v.title).toBe('Kaaskroketjes')
    expect(v.img).toBe(byId('443437')!.img)
    expect(v.priceVariantId).toBeUndefined()
    expect(priceOf(v)).toBe(byId('443437')!.price)
    expect(v.qtyLabel).toEqual({ en: '4 pieces', nl: '4 stuks', mk: '4 парчиња' })
    // not offered on its own page, nor on categories it does not target
    expect(experienceFor(byId('443437')!, new Set(), new Set()).allCrossSells.map((v) => v.pid)).not.toContain('443437')
    expect(experienceFor(byId('443490')!, new Set(), new Set()).allCrossSells.map((v) => v.pid)).toEqual([]) // dessert: no cross-sells
    expect(xp.menuUpgrade).toBeNull()
    // picking one creates a cross-sell line that carries the API product id (what the order and the availability check use)
    const dr = newDraft(steak)
    xsSet(dr, 'xs443437')
    const added = addToCart([], dr)
    const cart = syncCrossSells(added.cart, dr, added.line) // as the store does after addToCart
    const xs = cart.find((l) => l.lineType === 'cross-sell')!
    expect(xs.pid).toBe('443437')
    expect(xs.unitPrice).toBe(byId('443437')!.price)
    expect(includedPids(dr)).toEqual(expect.arrayContaining(['443457', '443437']))
  })

  it('finish strips and the cart block use the engine texts unless the file gives its own', () => {
    const d = map(FULL, design2408().design)
    use(d)
    const fin = cmsFinishBlock('s54943')!
    expect(fin.role).toBe('category-finish')
    expect(fin.items!.map((i) => i.pid)).toEqual(['443437', '443438', '443439', '443444'])
    expect(fin.title).toEqual({ en: 'Complete your meal', nl: 'Maak het helemaal af', mk: 'Заврши го оброкот' })
    expect(cmsFinishBlock('s54926')!.items!.map((i) => i.pid)).toEqual(['443490', '443491', '443493'])
    expect(cmsFinishBlock('s54992')).toBeUndefined()
    const insp = cmsBlocks('cart-inspire')[0]
    expect(insp.items!.map((i) => i.pid)).toEqual(['443493', '443491', '443495'])
    expect(insp.title).toEqual({ en: 'Anything else?', nl: 'Nog iets erbij?', mk: 'Уште нешто?' })
    expect(insp.link!.cat).toBe('s54946')
    const own = map(FULL, { ...EMPTY_DESIGN, finish: [{ cats: ['54943'], pids: ['443437'], title: 'Erbij?', maxVisible: 2 }], inspire: { pids: ['443437'], title: { en: 'More?' } } })
    expect(own.cms.upsell.blocks[0].title).toBe('Erbij?')
    expect(own.cms.upsell.blocks[0].display!.maxVisible).toBe(2)
    expect(own.cms.upsell.blocks[1].title).toEqual({ en: 'More?' })
    expect(own.cms.upsell.blocks[1].link).toBeUndefined()
  })

  it('the order-value reward points at an API product or is off', () => {
    expect(map(FULL, { ...EMPTY_DESIGN, reward: { threshold: 2500, pid: '443490' } }).brand.reward).toEqual({ threshold: 2500, pid: '443490' })
    expect(map(FULL, { ...EMPTY_DESIGN, reward: { threshold: 2500, pid: 'gyoza' } }).brand.reward).toBeUndefined()
    expect(map(FULL, design2408().design).brand.reward).toBeUndefined()
  })

  it('entries that point at nothing on this menu are skipped (same file, other menu)', () => {
    const d = map(TEST, design2408().design)
    expect(d.upsell.crossSells).toEqual([])
    expect(d.cms.upsell.blocks).toEqual([])
    expect(d.products.every((p) => !p.badges.includes('pop'))).toBe(true)
    expect(d.catsub).toEqual({})
  })
})

describe('loading the design file', () => {
  it('default location is venue/<menuId>.json under the page base; config can point elsewhere', () => {
    const s = { source: 'api' as const, apiBase: 'https://x/api', testUrl: 'https://t/', menuId: 2408 }
    expect(designUrl(s, '/')).toBe('/venue/2408.json')
    expect(designUrl(s, './')).toBe('./venue/2408.json')
    expect(designUrl({ ...s, designUrl: 'https://cdn/x.json' }, '/')).toBe('https://cdn/x.json')
  })
  it('404 = no design, no error; other failures are reported, never thrown', async () => {
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    try {
      f.mockResolvedValueOnce(new Response('', { status: 404 }))
      expect(await fetchDesign('/venue/1.json')).toEqual({ raw: null })
      f.mockResolvedValueOnce(new Response('{"badges":{}}', { status: 200 }))
      expect(await fetchDesign('/venue/1.json')).toEqual({ raw: { badges: {} } })
      f.mockResolvedValueOnce(new Response('oops', { status: 500 }))
      expect((await fetchDesign('/venue/1.json')).error).toMatch(/HTTP 500/)
      f.mockResolvedValueOnce(new Response('{not json', { status: 200 }))
      expect((await fetchDesign('/venue/1.json')).error).toMatch(/design/)
      f.mockRejectedValueOnce(new TypeError('network down'))
      expect((await fetchDesign('/venue/1.json')).error).toMatch(/network down/)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
