// @vitest-environment node
// Runs the mapper and the engine on the real API responses captured on 2026-10-15
// (failover-handover/docs/reference/api-samples). Static captures: shape evidence only, not live verification.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { addToCart, validateCart } from '../../engine/cart'
import { obNeedsDetail, visible } from '../../engine/catalog'
import { finalizeEngineData } from '../../engine/data'
import { activeSteps, blockReason, draftValid, exQty, firstIncomplete, grpCount, grpSet, newDraft, stepLocked, unitPrice, validateDraft } from '../../engine/draft'
import { setAllergenFilter, setEngine, setLang, setUnavailable } from '../../engine/state'
import type { EngineData, Product } from '../../engine/types'
import { currentSlides, slideOn } from '../../engine/slides'
import { catalogUrl, proxiedImg, resolveCatalogSource } from './catalogSource'
import type { TmkRoot } from './tmk'
import { htmlToText, mapTmkToEngine } from './tmkMapper'
import { buildOrderPayload } from './tmkOrder'
import { buildSnapshot } from '../../app/checkout'

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

const img = (u: string) => proxiedImg('/', u)
const map = (raw: TmkRoot) => mapTmkToEngine(raw, pack(), { img })
const prod = (d: EngineData, id: number): Product => d.products.find((p) => p.id === String(id))!

/** The same response with another main category first (the kiosk only renders MainCategories[0]). */
function withMainFirst(raw: TmkRoot, mainId: number): TmkRoot {
  const c = structuredClone(raw)
  for (const t of c.TMKData) {
    const i = t.MainCategories.findIndex((m) => m.MainCategoryId === mainId)
    t.MainCategories.unshift(...t.MainCategories.splice(i, 1))
  }
  return c
}

function use(d: EngineData) {
  setEngine(d)
  setLang('nl')
  setUnavailable([])
  setAllergenFilter(new Set())
}

/** The same response without any ModifierWizards: for tests that are about the upsell steps alone. */
function noMods(raw: TmkRoot): TmkRoot {
  const c = structuredClone(raw)
  for (const t of c.TMKData) for (const m of t.MainCategories) for (const sc of m.SubCategories) for (const p of sc.Products || []) delete p.ModifierWizards
  return c
}
const NM = () => noMods(TEST)

describe('menu structure (decision 1: SubCategories of MainCategories[0])', () => {
  it('sidebar categories are the subcategories of the first main category, in display order', () => {
    const d = map(FULL)
    const main = FULL.TMKData[0].MainCategories[0]
    expect(d.cats.map((c) => c.id)).toEqual([...main.SubCategories].sort((a, b) => a.DisplayOrder - b.DisplayOrder).map((s) => 's' + s.SubCategoryId))
    expect(d.cats[0].name).toBe('MAANDSPECIALS')
    expect(d.products).toHaveLength(main.SubCategories.reduce((a, s) => a + s.Products.length, 0))
    expect(d.products.every((p) => d.cats.some((c) => c.id === p.cat))).toBe(true)
  })
  it('the TMKData entry for the language defines the menu; other languages are joined by id', () => {
    const d = map(TEST)
    expect(d.brand.languages).toEqual(['nl', 'en'])
    const nlNames = TEST.TMKData.find((t) => t.Language === 'nl')!.MainCategories[0].SubCategories.map((s) => s.Name)
    const names = d.cats.map((c) => (typeof c.name === 'string' ? c.name : c.name!.nl))
    expect(names.sort()).toEqual([...nlNames].sort())
  })
  it('prices become integer cents and 0 stays 0 (decision 5)', () => {
    const d = map(FULL)
    const raw = FULL.TMKData[0].MainCategories[0].SubCategories.flatMap((s) => s.Products)
    for (const r of raw) expect(prod(d, r.ProductId).price).toBe(Math.round(r.Price * 100))
    expect(d.products.some((p) => p.price === 0)).toBe(true)
  })
  it('without a venue design file nothing points at brand-pack products (decision 2: promos only from the API flag)', () => {
    const d = map(FULL)
    expect(d.brand.promos.map((p) => p.pid)).toEqual(['454444']) // the one IsPromotion product of menu 2408
    expect(d.brand.reward).toBeUndefined()
    expect(d.upsell.crossSells).toEqual([])
    expect(d.upsell.productEnhancements).toEqual([])
    expect(d.upsell.premiumDrinks).toEqual([])
    expect(d.cms.upsell.blocks).toEqual([])
    expect(d.menuDeal.drinks).toEqual([])
    expect(d.products.every((p) => !p.canMenu)).toBe(true)
    expect(Object.keys(d.mods).every((k) => k === 'premX' || k.startsWith('mw') || k.startsWith('up'))).toBe(true)
    expect(map(TEST).brand.promos).toEqual([])
  })
  it('out-of-stock products are disabled and never listed', () => {
    const c = structuredClone(FULL)
    const first = c.TMKData[0].MainCategories[0].SubCategories[0].Products[0]
    first.OutOfStock = true
    const d = map(c)
    use(d)
    expect(prod(d, first.ProductId).disabled).toBe(true)
    expect(visible(d.products).some((p) => p.id === String(first.ProductId))).toBe(false)
  })
})

describe('images (decision 6: proxy)', () => {
  it('http image URLs go through /img-proxy, https stays direct', () => {
    expect(proxiedImg('./', 'http://my.tabletmenukaart.nl/a b.png')).toBe('./img-proxy?u=' + encodeURIComponent('http://my.tabletmenukaart.nl/a b.png'))
    expect(proxiedImg('./', 'https://kioskapi.dev.revelapps.com/x.png')).toBe('https://kioskapi.dev.revelapps.com/x.png')
    const d = map(TEST)
    expect(prod(d, 465447).img).toContain(encodeURIComponent('dc294c57')) // detail picture is a Default placeholder → small picture
    expect(d.products.every((p) => !decodeURIComponent(p.img || '').includes('/Default'))).toBe(true)
    const withImg = d.products.filter((p) => p.img)
    expect(withImg.length).toBeGreaterThan(0)
    expect(withImg.every((p) => !p.img!.startsWith('http://'))).toBe(true)
  })
})

describe('product details', () => {
  it('descriptions are plain text, never HTML', () => {
    expect(htmlToText('<h2>Met Rucola,&nbsp;hazelnoten</h2><p>truffel &amp; olie</p>')).toBe('Met Rucola, hazelnoten\ntruffel & olie')
    expect(htmlToText('<p>.</p>')).toBe('')
    const d = map(FULL)
    for (const p of d.products) expect(JSON.stringify(p.desc)).not.toMatch(/<[a-z]/i)
  })
  it('allergens map to engine keys; a product without an allergen screen is "unknown"', () => {
    const raw = withMainFirst(TEST, 56051)
    const d = map(raw)
    const withAlg = d.products.filter((p) => p.allergens.contains.length)
    expect(withAlg.length).toBeGreaterThan(0)
    expect(withAlg.flatMap((p) => p.allergens.contains).every((k) => !!d.alg[k])).toBe(true)
    expect(withAlg.every((p) => !p.allergens.unknown)).toBe(true)
    const r = raw.TMKData[0].MainCategories[0].SubCategories.flatMap((s) => s.Products).find((p) => String(p.ProductId) === withAlg[0].id)!
    r.ProductDetails!.MenuItems = (r.ProductDetails!.MenuItems || []).filter((m) => m.Name !== 'Allergens')
    expect(prod(map(raw), r.ProductId).allergens).toMatchObject({ contains: [], unknown: true })
  })
})

describe('modifiers (D3 revived 2026-10-20): max 1 → choice group, max > 1 → step group, every option with its ProductId', () => {
  it('menu 2408: a mandatory 1/1 wizard is a required choice group; an optional 0/4 wizard is a step group', () => {
    const d = map(withMainFirst(FULL, 54949)) // FRISDRANKEN
    use(d)
    const wine = prod(d, 443538) // "Aantal glazen", mandatory, 1/1, 4 options
    expect(wine.choice).toHaveLength(1)
    expect(wine.steps).toBeUndefined()
    const g = d.mods[wine.choice![0]]
    expect(g.type).toBe('choice')
    expect(g.req).toBe(true)
    expect(g.def).toBeUndefined()
    expect(g.items.map((i) => i.pid)).toEqual(['444511', '444512', '444513', '444514'])
    expect(g.items.every((i) => Number.isInteger(Number(i.pid)) && !i.sub)).toBe(true) // Description "." is no sub line
    expect(obNeedsDetail(wine)).toBe(true)
    const d2 = map(withMainFirst(FULL, 54995)) // KINDERMENU
    const dessert = prod(d2, 443961) // "Extra", optional, 0/4
    expect(dessert.choice).toBeUndefined()
    const e = d2.mods[dessert.steps![0]]
    expect([e.type, e.req, e.min, e.max]).toEqual(['step', false, 0, 4])
    expect(e.ui).toBe('chips') // modifier steps: chip grid, no pictures; upsell steps keep their tiles
    expect(map(TEST).mods['up9_8'].ui).toBeUndefined()
  })
  it('a required choice blocks the order until picked; the pick reaches the cart line and the order POST as UpsaleCollection', () => {
    const d = map(withMainFirst(FULL, 54949))
    use(d)
    const wine = prod(d, 443538)
    const g = wine.choice![0]
    const dr = newDraft(wine)
    expect(dr.choices[g]).toBeNull()
    expect(firstIncomplete(dr)).toBe(g)
    expect(blockReason(dr)).not.toBe('')
    const opt = d.mods[g].items[2] // "4 Glazen"
    dr.choices[g] = opt.id
    expect(draftValid(dr)).toBe(true)
    const { cart } = addToCart([], dr)
    const snap = buildSnapshot(cart, 'eat-in', 'nl', { type: 'table', value: '4' }, null)
    expect(snap.lines[0].choices).toEqual([{ groupId: g, optionIds: [opt.id], productId: opt.pid, name: expect.any(String), priceCents: 0 }])
    expect(snap.lines[0].extras).toEqual([])
    const body = buildOrderPayload({ ...snap, orderId: 'K1-x-1', startedAt: '2026-10-20T10:00:00.000Z', paidAt: null }, '9')
    expect(body.Order.Items[0].Item.Id).toBe(443538)
    expect(body.Order.Items[0].UpsaleCollection).toEqual([{ UpsaleStepOptionModel: { ProductId: Number(opt.pid), Name: expect.any(String), Price: 0 }, Quantity: 1 }])
  })
  it('menu 2490: the 1/1 wizard is a choice, the 0/5 wizard a step before the upsell steps, as one chain', () => {
    const d = map(TEST)
    use(d)
    const p = prod(d, 469180) // wizards "Test" (0/5) + "Something" (1/1) and upsell collection 9
    expect(p.choice).toHaveLength(1)
    expect(d.mods[p.choice![0]].type).toBe('choice')
    const md = p.steps!.filter((k) => k.startsWith('md'))
    expect(md).toHaveLength(1)
    expect(p.steps!.slice(md.length)).toEqual(['up9_8', 'up9_9', 'up9_10'])
    expect(d.mods[md[0]].next).toBe('up9_8')
    const dr = newDraft(p)
    expect(activeSteps(p, dr)).toEqual(p.steps)
    const plain = prod(d, 465452) // "Test" mandatory 1/5, no upsell: one step group
    expect(plain.choice).toBeUndefined()
    expect(plain.steps!.every((k) => k.startsWith('md'))).toBe(true)
    expect(obNeedsDetail(plain)).toBe(true)
  })
  it('an option without a ProductId is never offered (the order POST needs the id)', () => {
    const raw = withMainFirst(FULL, 54949)
    const p = raw.TMKData[0].MainCategories[0].SubCategories.flatMap((s) => s.Products || []).find((x) => x.ProductId === 443538)!
    p.ModifierWizards![0].ModifierItemElements[0].ProductId = null
    const d = map(raw)
    const g = d.mods[prod(d, 443538).choice![0]]
    expect(g.items.map((i) => i.pid)).toEqual(['444512', '444513', '444514'])
    p.ModifierWizards![0].ModifierItemElements.forEach((e) => (e.ProductId = null))
    const d2 = map(raw)
    expect(prod(d2, 443538).choice ?? []).toEqual([])
    expect(prod(d2, 443538).steps ?? []).toEqual([])
  })
})

describe('upsell on the product page (decision 4)', () => {
  it('collection 9: three chained steps are all on the page by NextStepId', () => {
    const d = map(NM())
    use(d)
    const p = prod(d, 465447)
    expect(p.steps).toEqual(['up9_8', 'up9_9', 'up9_10'])
    expect(activeSteps(p, newDraft(p))).toEqual(['up9_8', 'up9_9', 'up9_10'])
  })
  it('collection 12: OverrideNextStepId equal to its own step is "no override" (as sent by the API)', () => {
    const d = map(withMainFirst(NM(), 57071))
    use(d)
    const p = prod(d, 465550)
    const dr = newDraft(p)
    expect(d.mods['up12_11'].items.every((it) => !it.next)).toBe(true)
    grpSet(dr, 'up12_11', d.mods['up12_11'].items[0].id, 3)
    expect(activeSteps(p, dr)).toEqual(['up12_11', 'up12_12', 'up12_13'])
    expect(exQty(dr, 'up12_11', d.mods['up12_11'].items[0].id)).toBe(3)
    expect(grpCount(dr, 'up12_11')).toBe(1) // one different option
  })
  it('step limits count DIFFERENT options; each option is capped by its own MaxSelection (old kiosk rule)', () => {
    const d = map(NM())
    use(d)
    const p = prod(d, 465447) // collection 9, step 8: 6 coffees, step max 6, each coffee max 2
    const g = 'up9_8'
    const its = d.mods[g].items
    const dr = newDraft(p)
    for (const it of its) {
      expect(grpSet(dr, g, it.id, 2)).toBe(true)
      expect(grpSet(dr, g, it.id, 3)).toBe(true) // clamped to the option max
      expect(exQty(dr, g, it.id)).toBe(2)
    }
    expect(grpCount(dr, g)).toBe(6)
    expect(validateDraft(dr).filter((i) => i.group === g)).toEqual([]) // 12 coffees, valid
    expect(unitPrice(dr)).toBe(p.price + its.reduce((a, it) => a + it.price * 2, 0))
  })
  it('a full step refuses a new option but still lets a picked option go up; min counts different options', () => {
    const c = NM()
    for (const t of c.TMKData) for (const u of t.UpsaleColletions || []) if (u.Id === 9) Object.assign(u.UpsaleSteps.find((s) => s.Id === 8)!, { MinSelection: 2, MaxSelection: 2 })
    const d = map(c)
    use(d)
    const p = prod(d, 465447)
    const g = 'up9_8'
    const [a, b, x] = d.mods[g].items
    const dr = newDraft(p)
    grpSet(dr, g, a.id, 2)
    expect(validateDraft(dr).some((i) => i.code === 'required-choice' && i.group === g)).toBe(true) // 2 of one coffee ≠ 2 different
    grpSet(dr, g, b.id, 1)
    expect(validateDraft(dr).some((i) => i.group === g)).toBe(false)
    expect(grpSet(dr, g, x.id, 1)).toBe(false) // a third different coffee
    expect(grpSet(dr, g, b.id, 2)).toBe(true) // more of a picked one
    expect([exQty(dr, g, a.id), exQty(dr, g, b.id), exQty(dr, g, x.id)]).toEqual([2, 2, 0])
  })
  it('later steps are locked until every earlier required step is finished; picks there are refused', () => {
    const d = map(withMainFirst(NM(), 57071))
    use(d)
    const p = prod(d, 465550) // collection 12: Flavors (min 1) → Side dish (min 1) → Drinks (optional)
    const dr = newDraft(p)
    expect(['up12_11', 'up12_12', 'up12_13'].map((g) => stepLocked(dr, g))).toEqual([false, true, true])
    expect(grpSet(dr, 'up12_12', d.mods['up12_12'].items[0].id, 1)).toBe(false)
    grpSet(dr, 'up12_11', d.mods['up12_11'].items[0].id, 1)
    expect(['up12_11', 'up12_12', 'up12_13'].map((g) => stepLocked(dr, g))).toEqual([false, false, true])
    grpSet(dr, 'up12_12', d.mods['up12_12'].items[0].id, 1)
    expect(stepLocked(dr, 'up12_13')).toBe(false)
    grpSet(dr, 'up12_13', d.mods['up12_13'].items[0].id, 2)
    // un-finishing step 1 locks the rest again but keeps their picks
    grpSet(dr, 'up12_11', d.mods['up12_11'].items[0].id, 0)
    expect(['up12_12', 'up12_13'].map((g) => stepLocked(dr, g))).toEqual([true, true])
    expect(exQty(dr, 'up12_13', d.mods['up12_13'].items[0].id)).toBe(2)
    expect(firstIncomplete(dr)).toBe('up12_11')
  })
  it('a real override jumps to its step', () => {
    const c = withMainFirst(NM(), 57071)
    for (const t of c.TMKData) for (const u of t.UpsaleColletions || []) if (u.Id === 12) u.UpsaleSteps.find((s) => s.Id === 11)!.Options[0].OverrideNextStepId = 13
    const d = map(c)
    use(d)
    const p = prod(d, 465550)
    const dr = newDraft(p)
    grpSet(dr, 'up12_11', d.mods['up12_11'].items[0].id, 1)
    expect(activeSteps(p, dr)).toEqual(['up12_11', 'up12_13'])
  })
  it('an option with Finish ends the chain; picks in steps that left the page are dropped', () => {
    const c = NM()
    for (const t of c.TMKData) for (const u of t.UpsaleColletions || []) if (u.Id === 9) u.UpsaleSteps.find((s) => s.Id === 8)!.Options[0].Finish = true
    const d = map(c)
    use(d)
    const p = prod(d, 465447)
    const dr = newDraft(p)
    const [fin, other] = d.mods['up9_8'].items
    grpSet(dr, 'up9_8', other.id, 1)
    grpSet(dr, 'up9_9', d.mods['up9_9'].items[0].id, 2)
    expect(exQty(dr, 'up9_9', d.mods['up9_9'].items[0].id)).toBe(2)
    grpSet(dr, 'up9_8', fin.id, 1)
    expect(activeSteps(p, dr)).toEqual(['up9_8'])
    expect(dr.extras.some(([g]) => g === 'up9_9')).toBe(false)
    expect(draftValid(dr)).toBe(true)
  })
})

describe('menu changed under a restored cart', () => {
  it('lines whose product is gone are reported, not crashed on', () => {
    const d = map(TEST)
    use(d)
    const { cart } = addToCart([], newDraft(prod(d, 465455)))
    use(map(FULL)) // another venue / a newer menu without product 465455
    let issues: ReturnType<typeof validateCart> = []
    expect(() => (issues = validateCart(cart))).not.toThrow()
    expect(issues.map((i) => i.code)).toContain('product-missing')
  })
})

describe('catalog source', () => {
  it('config default, overridden by ?source / ?testMode / ?menuId', () => {
    expect(resolveCatalogSource(undefined, '').source).toBe('static')
    expect(resolveCatalogSource({ source: 'api' }, '').source).toBe('api')
    const t = resolveCatalogSource(undefined, '?testMode=true&menuId=2490')
    expect(t).toMatchObject({ source: 'test', menuId: 2490 })
    expect(catalogUrl(t)).toBe('https://my.tabletmenukaart.nl/service/kioskTestModeResources?menu=2490')
    expect(catalogUrl(resolveCatalogSource(undefined, '?source=api'))).toBe('https://kioskapi.dev.revelapps.com/api/getfullresources')
  })
})

describe('first screen: screensaver slides', () => {
  it('slides come from TMKData[].Screensaver per language, in display order, through the image proxy', () => {
    const d = map(TEST)
    const ss = d.screensaver!
    expect(ss.intervalMs).toBe(15000)
    expect(ss.opacity).toBe(1)
    expect(ss.slides.nl).toHaveLength(5)
    expect(ss.slides.en).toHaveLength(5)
    expect(ss.slides.nl![0].img).toBe(proxiedImg('/', TEST.TMKData[0].Screensaver!.Slides[0].ImageUrl))
    expect(ss.slides.nl![1]).toMatchObject({ pid: '458266', cat: 's56321' })
    const full = map(FULL).screensaver!
    expect(full.intervalMs).toBe(20000)
    expect(full.slides.nl!.map((s) => s.img)).toEqual(FULL.TMKData[0].Screensaver!.Slides.map((s) => s.ImageUrl)) // https: no proxy
  })
  it('time windows, eMenu-only conditions and the language fallback', () => {
    const c = structuredClone(FULL)
    const [a, b] = c.TMKData[0].Screensaver!.Slides
    Object.assign(a, { UseTime: true, TimeFrom: '22:00', TimeTo: '02:00' })
    Object.assign(b, { UseRound: true })
    const ss = map(c).screensaver!
    expect(ss.slides.nl).toHaveLength(1)
    const at = (h: number) => new Date(2026, 9, 15, h, 30)
    expect(currentSlides(ss, 'nl', at(23))).toHaveLength(1)
    expect(currentSlides(ss, 'nl', at(1))).toHaveLength(1)
    expect(currentSlides(ss, 'nl', at(12))).toHaveLength(0)
    expect(currentSlides(ss, 'en', at(23))).toHaveLength(1) // no English slides → first language that has some
    expect(slideOn({ img: 'x', time: { from: '19:20', to: '19:20' } }, at(3))).toBe(true) // from === to: all day
    expect(currentSlides(undefined, 'nl', at(12))).toEqual([])
  })
})

describe('first screen: venue identity', () => {
  it('logo comes from ThemeResponse.LogoImage (proxied when http), idle time from Screensaver.ActivationTime', () => {
    expect(map(FULL).venue).toEqual({ name: 'Tapas Mainstreet', logoImg: FULL.ThemeResponse.LogoImage!.Url })
    expect(map(TEST).venue).toEqual({ logoImg: proxiedImg('/', TEST.ThemeResponse.LogoImage!.Url) })
    expect(map(TEST).screensaver!.idleMs).toBe(30000)
  })
})

describe('allergens (docs/reference/product-allergen-map.md)', () => {
  it('rows from the doc: TMK ids → keys in TMK order, 19–22 as dietary marks, the kiosk icon files', () => {
    const d = map(TEST)
    expect(prod(d, 465452).allergens).toMatchObject({ contains: ['gluten', 'shell'], info: ['vegan'], unknown: false }) // Pepsi
    expect(prod(d, 465461).allergens.contains).toEqual(['sulphites']) // Lipton Green Tea
    expect(prod(d, 465473).allergens.contains).toEqual(['sulphites']) // Glas Droge Witte Wijn
    const nigiri = prod(map(withMainFirst(TEST, 54968)), 443766) // all 22
    expect(nigiri.allergens.contains).toEqual(['gluten', 'soy', 'nuts', 'peanuts', 'sesame', 'milk', 'egg', 'fish', 'shell', 'celery', 'sulphites', 'mustard', 'lupin', 'molluscs', 'onion', 'garlic', 'wheat', 'alcohol'])
    expect(nigiri.allergens.info).toEqual(['pregnancy', 'spicy', 'vegan', 'vegetarian'])
    expect(d.algImg).toMatchObject({ gluten: 'allergens/01.png', soy: 'allergens/06.png', peanuts: 'allergens/05.png', shell: 'allergens/02.png', sulphites: 'allergens/012.png', vegetarian: 'allergens/022.png' })
    expect(d.algFilter).toHaveLength(18)
    expect(d.algFilter).not.toContain('vegan')
    expect(Object.keys(d.alg)).toHaveLength(22)
  })
})
