// Venue design layer for API menus (closes decision D2 of 2026-10-15; see docs/reference/venue-design-layer.md).
//
// The kiosk API (getfullresources) carries the menu but none of the engine's design-only data: popular / new
// badges, sidebar icons, category subtitles, cross-sells ("Lekker erbij"), "finish" strips, the cart's
// "anything else?" block and the order-value reward. The old kiosk showed placeholder content for these.
// Here they come from ONE optional JSON file per venue, keyed by the API's own ids (ProductId, SubCategoryId):
//   public/venue/<menuId>.json   — or config catalogSource.designUrl (the Launcher can point elsewhere)
// Everything in it is presentation. Prices never come from this file: a cross-sell costs the product's menu price,
// so the order payload only ever carries menu prices (BACKEND-DEPENDENCIES B1).
// What the API does carry is used first: IsPromotion + PromotionFrom/To → promo card and "deal" badge;
// IsVegan / IsVegetarian / IsSpicy → badges (tmkMapper); the subcategory name → sidebar icon (iconForCategory).

import type { L10n } from '../../engine/types'
import type { TmkProduct } from './tmk'

export interface VenuePromo {
  /** API ProductId. Missing texts default to the product's name / description, the image to the product's. */
  pid: string
  flag?: L10n
  title?: L10n
  sub?: L10n
  img?: string
}

export interface VenueCrossSell {
  /** API ProductId of the product offered. */
  pid: string
  /** Offered on the products of these API SubCategoryIds … */
  cats?: string[]
  /** … or on exactly these ProductIds. Neither = offered on every product. */
  products?: string[]
  /** Portion text under the name ("2 stuks"). */
  qtyLabel?: L10n
}

export interface VenueFinish {
  /** Strip shown under the product grid of these API SubCategoryIds. */
  cats: string[]
  /** API ProductIds offered (products of the same category are skipped by the engine). */
  pids: string[]
  title?: L10n
  subtitle?: L10n
  maxVisible?: number
}

export interface VenueInspire {
  /** API ProductIds; the first one not yet in the cart is shown. */
  pids: string[]
  title?: L10n
  subtitle?: L10n
  /** API SubCategoryId of the "see all" link. */
  linkCat?: string
}

export interface VenueDesign {
  /** ProductId → badge keys (pop, new, hal, dea …: keys of BDG.json). */
  badges: Record<string, string[]>
  /** SubCategoryId → icon key (P.json). */
  icons: Record<string, string>
  /** SubCategoryId → subtitle under the category title. */
  catsub: Record<string, L10n>
  promos: VenuePromo[]
  crossSells: VenueCrossSell[]
  finish: VenueFinish[]
  inspire?: VenueInspire
  /** Order-value gift: `threshold` in cents, `pid` the product given. */
  reward?: { threshold: number; pid: string }
}

export const EMPTY_DESIGN: VenueDesign = { badges: {}, icons: {}, catsub: {}, promos: [], crossSells: [], finish: [] }

// ---------- validation of the venue file (hand-edited JSON: never trust a field) ----------

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const idOf = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : typeof v === 'number' && Number.isInteger(v) ? String(v) : null)
const ids = (v: unknown): string[] => (Array.isArray(v) ? v.map(idOf).filter((x): x is string => !!x) : [])
function l10n(v: unknown): L10n | undefined {
  if (typeof v === 'string') return v.trim() || undefined
  if (!isObj(v)) return undefined
  const en = typeof v.en === 'string' ? v.en : typeof v.nl === 'string' ? v.nl : undefined
  if (!en) return undefined
  return { en, ...(typeof v.nl === 'string' ? { nl: v.nl } : {}), ...(typeof v.mk === 'string' ? { mk: v.mk } : {}) }
}
const l10nOpt = (o: Record<string, unknown>, k: string) => {
  const v = l10n(o[k])
  return v ? { [k]: v } : {}
}
/** Like l10nOpt, but an explicit "" is kept: a promo whose picture already carries the text can blank its overlay. */
const l10nOptBlank = (o: Record<string, unknown>, k: string) => (o[k] === '' ? { [k]: '' } : l10nOpt(o, k))

export interface Known {
  badges: string[]
  icons: string[]
}

/**
 * Turns the venue file into a VenueDesign, dropping anything malformed or unknown. `problems` lists what was
 * dropped (logged at boot) — a broken entry never breaks the menu.
 */
export function normalizeVenueDesign(raw: unknown, known: Known): { design: VenueDesign; problems: string[] } {
  const problems: string[] = []
  const d: VenueDesign = { badges: {}, icons: {}, catsub: {}, promos: [], crossSells: [], finish: [] }
  if (!isObj(raw)) {
    if (raw != null) problems.push('design file is not an object')
    return { design: d, problems }
  }
  const badgeOk = new Set(known.badges)
  const iconOk = new Set(known.icons)

  if (isObj(raw.badges)) {
    for (const [k, v] of Object.entries(raw.badges)) {
      const pid = idOf(k)
      const list = Array.isArray(v) ? v.filter((b): b is string => typeof b === 'string') : []
      const keep = list.filter((b) => badgeOk.has(b))
      list.filter((b) => !badgeOk.has(b)).forEach((b) => problems.push(`badges.${k}: unknown badge "${b}"`))
      if (pid && keep.length) d.badges[pid] = [...new Set(keep)]
    }
  }
  if (isObj(raw.icons)) {
    for (const [k, v] of Object.entries(raw.icons)) {
      const sid = idOf(k)
      if (!sid) continue
      if (typeof v === 'string' && iconOk.has(v)) d.icons[sid] = v
      else problems.push(`icons.${k}: unknown icon "${String(v)}"`)
    }
  }
  if (isObj(raw.catsub)) {
    for (const [k, v] of Object.entries(raw.catsub)) {
      const sid = idOf(k)
      const txt = l10n(v)
      if (sid && txt) d.catsub[sid] = txt
      else problems.push(`catsub.${k}: not a text`)
    }
  }
  if (Array.isArray(raw.promos)) {
    raw.promos.forEach((p, i) => {
      const pid = isObj(p) ? idOf(p.pid) : null
      if (!pid) return problems.push(`promos[${i}]: missing pid`)
      const o = p as Record<string, unknown>
      d.promos.push({ pid, ...l10nOptBlank(o, 'flag'), ...l10nOptBlank(o, 'title'), ...l10nOptBlank(o, 'sub'), ...(typeof o.img === 'string' && o.img ? { img: o.img } : {}) })
    })
  }
  if (Array.isArray(raw.crossSells)) {
    raw.crossSells.forEach((x, i) => {
      const pid = isObj(x) ? idOf(x.pid) : null
      if (!pid) return problems.push(`crossSells[${i}]: missing pid`)
      const o = x as Record<string, unknown>
      const cats = ids(o.cats)
      const products = ids(o.products)
      d.crossSells.push({ pid, ...(cats.length ? { cats } : {}), ...(products.length ? { products } : {}), ...l10nOpt(o, 'qtyLabel') })
    })
  }
  if (Array.isArray(raw.finish)) {
    raw.finish.forEach((f, i) => {
      if (!isObj(f)) return problems.push(`finish[${i}]: not an object`)
      const cats = ids(f.cats)
      const pids = ids(f.pids)
      if (!cats.length || !pids.length) return problems.push(`finish[${i}]: needs cats and pids`)
      const max = Number(f.maxVisible)
      d.finish.push({ cats, pids, ...l10nOpt(f, 'title'), ...l10nOpt(f, 'subtitle'), ...(Number.isInteger(max) && max > 0 ? { maxVisible: max } : {}) })
    })
  }
  if (isObj(raw.inspire)) {
    const pids = ids(raw.inspire.pids)
    const linkCat = idOf(raw.inspire.linkCat)
    if (pids.length || linkCat) d.inspire = { pids, ...l10nOpt(raw.inspire, 'title'), ...l10nOpt(raw.inspire, 'subtitle'), ...(linkCat ? { linkCat } : {}) }
    else problems.push('inspire: needs pids or linkCat')
  }
  if (isObj(raw.reward)) {
    const pid = idOf(raw.reward.pid)
    const threshold = Number(raw.reward.threshold)
    if (pid && Number.isInteger(threshold) && threshold > 0) d.reward = { threshold, pid }
    else problems.push('reward: needs pid and an integer threshold in cents')
  }
  return { design: d, problems }
}

// ---------- what the API itself carries ----------

/** A promotion is live between PromotionFrom and PromotionTo (local time, no zone); a missing or unparsable bound is open. */
export function promoActive(p: Pick<TmkProduct, 'IsPromotion' | 'PromotionFrom' | 'PromotionTo'>, now = Date.now()): boolean {
  if (p.IsPromotion !== true) return false
  const from = Date.parse(p.PromotionFrom || '')
  const to = Date.parse(p.PromotionTo || '')
  if (!Number.isNaN(from) && now < from) return false
  if (!Number.isNaN(to) && now > to) return false
  return true
}

/**
 * Sidebar icon from the subcategory name (the API has no icon per subcategory; MainCategory pictures are not
 * shown because the kiosk renders the subcategories of one main category). Order matters: the first matching
 * row wins, the venue file (`icons`) overrides. Keys are the engine's icon set (P.json).
 */
const ICON_RULES: [string, RegExp][] = [
  ['star', /special|actie|aanbieding|deal|promo|favor|popul|uitgelicht|chef|maand|month|season|seizoen/],
  ['gift', /kado|cadeau|gift|voucher|bon\b|bonnen/],
  ['cup', /drank|drink|frisdrank|soda|koffie|coffee|thee|\btea\b|bier|beer|wijn|wine|cocktail|likeur|liqueur|soju|sake|\bsap\b|juice|water|alcohol|glas|glazen|statiegeld/],
  ['cake', /dessert|nagerecht|\bijs\b|ice|sweet|zoet|taart|cake|gebak|mochi|brownie|brulee|pudding/],
  ['sushi', /sushi|maki|nigiri|sashimi|gunkan|tataki|\broll|poke/],
  ['ramen', /ramen|noodle|noedel|soep|soup|stew|\bpho\b|udon|bibimbap/],
  ['curry', /curry|\bwok\b|thai|indi(a|sch)|masala/],
  ['heart', /vega|vegan|veggie|vegetari|healthy|salad|salade/],
  ['skewer', /spies|skewer|grill|bbq|satay|sate|bites|hapje|tapas|snack|fried|frituur|side|bij\b|borrel/],
  ['bowl', /bowl|\bkom\b|rijst|\brice\b/],
  ['bag', /afhaal|takeaway|take away|to go|meenemen/],
  ['plate', /vlees|meat|\bvis\b|fish|hoofd|main|dish|gerecht|kip|chicken|burger|pizza|steak|diner|dinner|lunch|ontbijt|breakfast|koud|cold|warm|menu/],
]

export function iconForCategory(name: string): string {
  const n = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  for (const [icon, re] of ICON_RULES) if (re.test(n)) return icon
  return 'dish'
}
