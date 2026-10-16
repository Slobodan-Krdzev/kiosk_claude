// Maps the kiosk API menu (getfullresources) onto the engine data model.
//
// Decisions (Alex, 2026-10-15):
// - The menu is MainCategories[0] of the TMKData entry for the current language (fallback: the first entry);
//   its SubCategories are the sidebar categories.
// - Design-only data the API does not carry (badges popular/new, promos, hero copy, category icons, menu deal,
//   CMS cross-sells) stay as in the brand pack for now; anything that points at brand-pack products is emptied.
// - Modifiers (Products[].ModifierWizards) are not used, as in the old kiosk (decision 2026-10-15).
// - Upsell collections are shown on the product page, one section per step.
// - Products priced 0 show their 0 price.
// - http image URLs go through the image proxy (imgUrl).

import type { Allergens, Cat, EngineData, L10n, Lang, ModGroup, ModItem, Product, Screensaver, Slide } from '../../engine/types'
import type { TmkLangData, TmkProduct, TmkRoot, TmkSlide, TmkUpsaleCollection } from './tmk'

const SUPPORTED: Lang[] = ['nl', 'en', 'mk']

/**
 * TMK AllergenTypeId → allergen key, label and icon, from docs/reference/product-allergen-map.md (2026-10-15).
 * 1–18 are allergens (filterable); 19–22 are dietary marks shown with them (`info`).
 * `file` is the kiosk's own icon in public/allergens/; `em` is the fallback when that file is missing.
 */
export const ALLERGENS: { id: number; key: string; file: string; em: string; name: { en: string; nl: string; mk: string } }[] = [
  { id: 1, key: 'gluten', file: '01.png', em: '🌾', name: { en: 'Gluten', nl: 'Gluten', mk: 'Глутен' } },
  { id: 2, key: 'soy', file: '06.png', em: '🫘', name: { en: 'Soybeans', nl: 'Soja', mk: 'Соја' } },
  { id: 3, key: 'nuts', file: '08.png', em: '🌰', name: { en: 'Nuts', nl: 'Noten', mk: 'Јаткасти плодови' } },
  { id: 4, key: 'peanuts', file: '05.png', em: '🥜', name: { en: 'Peanuts', nl: "Pinda's", mk: 'Кикирики' } },
  { id: 5, key: 'sesame', file: '011.png', em: '⚪', name: { en: 'Sesame seeds', nl: 'Sesamzaad', mk: 'Сусам' } },
  { id: 6, key: 'milk', file: '07.png', em: '🥛', name: { en: 'Milk', nl: 'Melk', mk: 'Млеко' } },
  { id: 7, key: 'egg', file: '03.png', em: '🥚', name: { en: 'Eggs', nl: 'Eieren', mk: 'Јајца' } },
  { id: 8, key: 'fish', file: '04.png', em: '🐟', name: { en: 'Fish', nl: 'Vis', mk: 'Риба' } },
  { id: 9, key: 'shell', file: '02.png', em: '🦐', name: { en: 'Crustaceans', nl: 'Schaaldieren', mk: 'Ракови' } },
  { id: 10, key: 'celery', file: '09.png', em: '🥬', name: { en: 'Celery', nl: 'Selderij', mk: 'Целер' } },
  { id: 11, key: 'sulphites', file: '012.png', em: '🍷', name: { en: 'Sulphur dioxide and sulphites', nl: 'Zwaveldioxide en sulfiet', mk: 'Сулфур диоксид и сулфити' } },
  { id: 12, key: 'mustard', file: '010.png', em: '🟡', name: { en: 'Mustard', nl: 'Mosterd', mk: 'Сенф' } },
  { id: 13, key: 'lupin', file: '013.png', em: '🌼', name: { en: 'Lupin', nl: 'Lupine', mk: 'Лупина' } },
  { id: 14, key: 'molluscs', file: '014.png', em: '🐚', name: { en: 'Molluscs', nl: 'Weekdieren', mk: 'Мекотели' } },
  { id: 15, key: 'onion', file: '015.png', em: '🧅', name: { en: 'Onion', nl: 'Ui', mk: 'Кромид' } },
  { id: 16, key: 'garlic', file: '016.png', em: '🧄', name: { en: 'Garlic', nl: 'Knoflook', mk: 'Лук' } },
  { id: 17, key: 'wheat', file: '017.png', em: '🌾', name: { en: 'Wheat', nl: 'Tarwe', mk: 'Пченица' } },
  { id: 18, key: 'alcohol', file: '018.png', em: '🍸', name: { en: 'Alcohol', nl: 'Alcohol', mk: 'Алкохол' } },
  { id: 19, key: 'pregnancy', file: '019.png', em: '🤰', name: { en: 'Not suitable in pregnancy', nl: 'Niet geschikt tijdens zwangerschap', mk: 'Не е соодветно за бремени' } },
  { id: 20, key: 'spicy', file: '020.png', em: '🌶️', name: { en: 'Spicy', nl: 'Pittig', mk: 'Луто' } },
  { id: 21, key: 'vegan', file: '021.png', em: '🌱', name: { en: 'Vegan', nl: 'Veganistisch', mk: 'Веганско' } },
  { id: 22, key: 'vegetarian', file: '022.png', em: '🥦', name: { en: 'Vegetarian', nl: 'Vegetarisch', mk: 'Вегетаријанско' } },
]
const ALG_BY_ID = new Map(ALLERGENS.map((a) => [a.id, a]))
const DIET_IDS = new Set([19, 20, 21, 22])

export interface TmkMapOptions {
  /** Rewrites an image URL from the API (e.g. through the image proxy). */
  img: (url: string) => string
  /** Resolves a file shipped with the kiosk (public/…) against the page base. */
  asset?: (path: string) => string
  /** Preferred language; the TMKData entry for it defines the menu structure. */
  lang?: Lang
}

export const cents = (euros: number | null | undefined): number => Math.round((Number(euros) || 0) * 100)

// Named HTML entities seen in menu texts: Latin-1 (160–255, in code-point order) plus the usual typographic ones.
const LATIN1 = 'nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml'.split(' ')
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", euro: '€', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bull: '•', trade: '™', OElig: 'Œ', oelig: 'œ' }
LATIN1.forEach((n, i) => (ENTITIES[n] = String.fromCharCode(160 + i)))

/** Decode numeric and named HTML entities (`pat&eacute;` → `paté`); unknown names are left as they are. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([A-Za-z][A-Za-z0-9]*);/g, (m, n) => ENTITIES[n] ?? m)
}

/** Description HTML → plain text (the kiosk never injects API HTML). */
export function htmlToText(html: string | null | undefined): string {
  const txt = decodeEntities(
    String(html || '')
      .replace(/<(br|\/p|\/h\d|\/li|\/div)\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, ''),
  )
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
  return txt === '.' ? '' : txt
}

/** The API fills empty pictures with its own placeholders (…/DefaultDetailsMainProductImage.png etc.). */
export const isPicture = (u: string | null | undefined): boolean => !!u && !/\/Default[^/]*$/i.test(u)

const byOrder = <T extends { DisplayOrder: number }>(a: T, b: T) => a.DisplayOrder - b.DisplayOrder

/** One value per language → L10n (a plain string when every language says the same). */
function l10n(vals: Partial<Record<Lang, string>>, primary: Lang): L10n {
  const base = vals[primary] ?? ''
  const out: { en: string; nl?: string; mk?: string } = { en: vals.en || base }
  if (vals.nl !== undefined || primary === 'nl') out.nl = vals.nl || base
  if (vals.mk !== undefined) out.mk = vals.mk || base
  const all = Object.values(out)
  return all.every((v) => v === all[0]) ? all[0] : out
}

/** Text lookups for the non-primary languages, keyed by stable API ids. */
interface Translations {
  sub: Map<number, string>
  prod: Map<number, { name: string; desc: string }>
  step: Map<string, string>
  opt: Map<string, string>
}

function indexLanguage(t: TmkLangData): Translations {
  const tr: Translations = { sub: new Map(), prod: new Map(), step: new Map(), opt: new Map() }
  for (const s of t.MainCategories[0]?.SubCategories || []) {
    tr.sub.set(s.SubCategoryId, s.Name)
    for (const p of s.Products || []) {
      tr.prod.set(p.ProductId, { name: p.Name, desc: descOf(p) })
    }
  }
  for (const c of t.UpsaleColletions || []) {
    for (const s of c.UpsaleSteps) {
      tr.step.set(stepKey(c.Id, s.Id), s.Name)
      for (const o of s.Options) tr.opt.set(stepKey(c.Id, s.Id) + '/' + o.Id, o.Name)
    }
  }
  return tr
}

const stepKey = (cid: number, sid: number) => `up${cid}_${sid}`

function descOf(p: TmkProduct): string {
  const it = (p.ProductDetails?.MenuItems || []).find((m) => m.Name === 'Description' && m.Active !== false)
  return htmlToText(it?.HtmlContent)
}

function allergensOf(p: TmkProduct): { allergens: Allergens; diet: Set<number> } {
  const scr = (p.ProductDetails?.MenuItems || []).find((m) => m.Name === 'Allergens' && m.Active !== false)?.AllergensScreen
  const ids = [...new Set((scr?.Allergens || []).filter((a) => a.IsActive && ALG_BY_ID.has(a.AllergenTypeId)).map((a) => a.AllergenTypeId))].sort((a, b) => a - b)
  const diet = new Set(ids.filter((id) => DIET_IDS.has(id)))
  const contains = ids.filter((id) => !DIET_IDS.has(id)).map((id) => ALG_BY_ID.get(id)!.key)
  const info = [...diet].map((id) => ALG_BY_ID.get(id)!.key)
  // No allergen screen at all = the venue did not declare allergens: unknown, never "free of".
  return { allergens: { contains, traces: [], removable: [], unknown: !scr, ...(info.length ? { info } : {}) }, diet }
}

function slideOf(s: TmkSlide, img: (u: string) => string): Slide {
  return {
    img: img(s.ImageUrl),
    ...(s.UseTime ? { time: { from: s.TimeFrom, to: s.TimeTo } } : {}),
    ...(s.IdProductInMenu != null ? { pid: String(s.IdProductInMenu) } : {}),
    ...(s.IdSubcategoryInMenu != null ? { cat: 's' + s.IdSubcategoryInMenu } : {}),
  }
}

/**
 * Screensaver slides per language (the first screen shows them).
 * UseActivation / UseRound are eMenu tablet conditions with no kiosk meaning: those slides are left out.
 */
export function screensaverOf(trees: TmkLangData[], primary: TmkLangData, img: (u: string) => string): Screensaver | undefined {
  const ss = primary.Screensaver
  if (!ss) return undefined
  const slides: Partial<Record<Lang, Slide[]>> = {}
  for (const t of trees) {
    if (!SUPPORTED.includes(t.Language as Lang)) continue
    slides[t.Language as Lang] = [...(t.Screensaver?.Slides || [])]
      .filter((s) => isPicture(s.ImageUrl) && !s.UseActivation && !s.UseRound)
      .sort(byOrder)
      .map((s) => slideOf(s, img))
  }
  const sec = (n: number, dflt: number) => (Number(n) > 0 ? Number(n) : dflt) * 1000
  return { intervalMs: sec(ss.SlideTimer, 7), idleMs: sec(ss.ActivationTime, 30), opacity: Math.max(0, Math.min(1, ss.Transparency ?? 1)), slides }
}

export function mapTmkToEngine(raw: TmkRoot, pack: EngineData, opts: TmkMapOptions): EngineData {
  const trees = (raw.TMKData || []).filter((t) => t && Array.isArray(t.MainCategories))
  if (!trees.length) throw new Error('getfullresources: TMKData is empty')
  const apiLangs = trees.map((t) => t.Language as Lang).filter((l) => SUPPORTED.includes(l))
  const want = opts.lang && apiLangs.includes(opts.lang) ? opts.lang : apiLangs.includes(pack.brand.defaultLanguage) ? pack.brand.defaultLanguage : apiLangs[0]
  const primaryTree = trees.find((t) => t.Language === want) ?? trees[0]
  const primary = (SUPPORTED.includes(primaryTree.Language as Lang) ? primaryTree.Language : 'nl') as Lang
  const others = new Map<Lang, Translations>()
  for (const t of trees) if (t !== primaryTree && SUPPORTED.includes(t.Language as Lang)) others.set(t.Language as Lang, indexLanguage(t))
  const tr = (pick: (x: Translations) => string | undefined, base: string): L10n => {
    const vals: Partial<Record<Lang, string>> = { [primary]: base }
    for (const [l, x] of others) {
      const v = pick(x)
      if (v) vals[l] = v
    }
    return l10n(vals, primary)
  }
  const img = (u: string | null | undefined): string | undefined => (isPicture(u) ? opts.img(u!) : undefined)

  const main = primaryTree.MainCategories[0]
  const subs = [...(main?.SubCategories || [])].sort(byOrder)
  const upsale = new Map<number, TmkUpsaleCollection>((primaryTree.UpsaleColletions || []).map((c) => [c.Id, c]))

  const cats: Cat[] = []
  const products: Product[] = []
  const mods: Record<string, ModGroup> = {}
  const stepsOf = new Map<number, string[]>()

  const collectionSteps = (cid: number): string[] => {
    if (stepsOf.has(cid)) return stepsOf.get(cid)!
    const c = upsale.get(cid)
    const keys: string[] = []
    if (c) {
      const own = new Set(c.UpsaleSteps.map((s) => s.Id))
      for (const s of [...c.UpsaleSteps].sort(byOrder)) {
        const k = stepKey(c.Id, s.Id)
        keys.push(k)
        const items: ModItem[] = [...s.Options]
          .sort((a, b) => a.OptionOrder - b.OptionOrder)
          .map((o) => ({
            id: 'u' + o.Id,
            name: tr((x) => x.opt.get(k + '/' + o.Id), o.Name),
            price: cents(o.Price),
            ...(o.ProductId != null ? { pid: String(o.ProductId) } : {}),
            ...(o.PictureUrl ? { img: img(o.PictureUrl) } : {}),
            maxQty: Math.max(1, o.MaxSelection || 1),
            ...(o.Finish ? { finish: true } : {}),
            // The API repeats the option's own step id here when there is no override (seen in menu 2490).
            ...(o.OverrideNextStepId != null && o.OverrideNextStepId !== s.Id && own.has(o.OverrideNextStepId) ? { next: stepKey(c.Id, o.OverrideNextStepId) } : {}),
          }))
        const min = Math.max(0, s.MinSelection | 0)
        mods[k] = {
          label: tr((x) => x.step.get(k), s.Name),
          type: 'step',
          req: min > 0,
          min,
          max: Math.max(1, s.MaxSelection | 0, min),
          next: s.NextStepId != null && own.has(s.NextStepId) ? stepKey(c.Id, s.NextStepId) : null,
          items,
        }
      }
    }
    stepsOf.set(cid, keys)
    return keys
  }

  for (const s of subs) {
    const cid = 's' + s.SubCategoryId
    cats.push({ id: cid, icon: 'dish', name: tr((x) => x.sub.get(s.SubCategoryId), s.Name) })
    for (const p of [...(s.Products || [])].sort(byOrder)) {
      const pid = String(p.ProductId)
      const { allergens, diet } = allergensOf(p)
      const badges = new Set<string>()
      if (p.IsVegan || p.IsVegetarian || diet.has(21) || diet.has(22)) badges.add('veg')
      if (p.IsSpicy || diet.has(20)) badges.add('spc')

      const steps = p.HasUpsaleCollection && p.UpsaleCollectionId != null ? collectionSteps(p.UpsaleCollectionId) : []
      const desc = descOf(p)
      const names = tr((x) => x.prod.get(p.ProductId)?.name.trim(), p.Name.trim())
      products.push({
        id: pid,
        cat: cid,
        name: p.Name.trim(),
        ...(typeof names === 'string' ? {} : { names }),
        price: cents(p.Price),
        badges: [...badges],
        img: img([p.ProductDetails?.ProductPictureUrl, p.SmallPictureUrl].find(isPicture)),
        em: '🍽',
        allergens,
        desc: tr((x) => x.prod.get(p.ProductId)?.desc, desc),
        ...(steps.length ? { steps } : {}),
        ...(p.IdOtherPos ? { plu: p.IdOtherPos } : {}),
        // OutOfStock: never shown (as the old kiosk). NoInteraction: not orderable.
        ...(p.OutOfStock || p.NoInteraction ? { disabled: true } : {}),
      })
    }
  }

  const languages = apiLangs.length ? apiLangs : [primary]
  const asset = opts.asset || ((path: string) => path)
  const alg = Object.fromEntries(ALLERGENS.map((a) => [a.key, a.name]))
  const algIcon = Object.fromEntries(ALLERGENS.map((a) => [a.key, a.em]))
  const algImg = Object.fromEntries(ALLERGENS.map((a) => [a.key, asset('allergens/' + a.file)]))
  const algFilter = ALLERGENS.filter((a) => !DIET_IDS.has(a.id)).map((a) => a.key)
  const premX: Record<string, ModGroup> = pack.mods.premX ? { premX: { ...pack.mods.premX, items: [] } } : {}

  return {
    ...pack,
    screensaver: screensaverOf(trees, primaryTree, opts.img),
    venue: {
      ...(raw.ThemeResponse?.RestaurantName ? { name: raw.ThemeResponse.RestaurantName } : {}),
      ...(isPicture(raw.ThemeResponse?.LogoImage?.Url) ? { logoImg: opts.img(raw.ThemeResponse.LogoImage!.Url) } : {}),
    },
    brand: {
      ...pack.brand,
      languages,
      defaultLanguage: languages.includes(pack.brand.defaultLanguage) ? pack.brand.defaultLanguage : primary,
      promos: [],
      reward: undefined,
    },
    cats,
    products,
    mods: { ...premX, ...mods },
    cms: { ...pack.cms, categories: {}, upsell: { blocks: [] } },
    upsell: { ...pack.upsell, productEnhancements: [], crossSells: [], premiumDrinks: [] },
    priceVariants: {},
    alg,
    algIcon,
    algImg,
    algFilter,
    catsub: {},
    obwInfo: {},
    obwDefault: {},
    cmsCatAlias: {},
  }
}
