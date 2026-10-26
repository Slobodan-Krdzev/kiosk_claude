// Data model of the Guestit white-label kiosk engine (v36), as loaded from public/mock/dadawan/*.json.
// All money is in integer minor units (cents).

export type Lang = 'nl' | 'en' | 'mk'
export type L10n = string | { en: string; nl?: string; mk?: string }

export interface Serving {
  short: L10n
  label?: L10n
  sub?: string
  price: number
  compareAt?: number
  love?: boolean
}

export interface Allergens {
  contains: string[]
  traces: string[]
  removable: string[]
  unknown: boolean
  /** Dietary marks shown with the allergens (API ids 19–22: pregnancy, spicy, vegan, vegetarian); never filtered on. */
  info?: string[]
}

export interface Product {
  id: string
  cat: string
  /** Default-language name (also used for KDS / receipt). Display uses pname(): names in the current language. */
  name: string
  names?: L10n
  price: number
  servings?: Serving[]
  kcal?: number
  tags?: string[]
  badges: string[]
  img?: string
  em?: string
  tint?: string
  tint2?: string
  cut?: boolean
  z?: string
  canMenu?: boolean
  choice?: string[]
  mods?: string[]
  allergens: Allergens
  desc: L10n
  sub?: L10n
  flavour?: L10n[]
  disabled?: boolean
  station?: string
  taxGroup?: string
  prepMin?: number
  experience?: { flowType?: 'visual-upsell' | 'modification' }
  /** Upsell steps shown on the product page; steps[0] is the entry of the chain. */
  steps?: string[]
  /** POS article code (API IdOtherPos). */
  plu?: string
  /** Picture URL as the API sent it (`img` may be the proxy URL); sent back with the order. */
  apiImg?: string
  /** Per-line quantity cap from the catalog (API MaxAmountInAgenda); the engine's MAX_LINE_QTY still applies. */
  maxQty?: number
  /** Information only (API NoInteraction): visible, opens the product page, cannot be added. */
  infoOnly?: boolean
}

export interface ModItem {
  id: string
  name: L10n
  price: number
  em?: string
  sub?: L10n
  allergens?: { contains?: string[]; traces?: string[] }
  /** Backend product id of this option (API catalog), sent with the order. */
  pid?: string
  img?: string
  /** 'step' groups: how often this one option may be taken (default 1). */
  maxQty?: number
  /** 'step' groups: picking this option jumps to that step instead of the group's `next`. */
  next?: string | null
  /** 'step' groups: picking this option ends the upsell chain after this step. */
  finish?: boolean
}

/**
 * choice  – exactly one option (draft.choices)
 * extra / remove – the v36 customize step (draft.extras / draft.removes)
 * step    – one step of an upsell collection on the product page (draft.extras), chained by `next`
 */
export interface ModGroup {
  label: L10n
  type: 'choice' | 'extra' | 'remove' | 'step'
  req?: boolean
  def?: string
  items: ModItem[]
  /** step: minimum and maximum number of different options picked in this step. */
  min?: number
  max?: number
  /** step: the step that follows (null = last). */
  next?: string | null
  /** step: 'chips' renders the options as the choice-group chip grid (no pictures) — API modifier wizards. */
  ui?: 'chips'
}

export interface Cat {
  id: string
  icon: string
  filters?: string[]
  two?: boolean
  /** Display name from the API catalog; the Dadawan pack uses i18n key cat_<id> instead. */
  name?: L10n
  sub?: L10n
}

export interface MenuDeal {
  price: number
  side: string
  sideLabel: L10n
  drinks: string[]
}

export type CmsRole = 'product-enhancement' | 'cross-sell' | 'premium-drink-upgrade' | 'menu-upgrade'

export interface CmsTarget {
  cats?: string[]
  products?: string[]
  canMenu?: boolean
}

export interface CmsItem {
  id: string
  role: CmsRole
  enabled?: boolean
  recommended?: boolean
  priority?: number
  target?: CmsTarget
  pid?: string
  priceVariantId?: string
  price?: number
  img?: string
  em?: string
  tint?: string
  tint2?: string
  cut?: boolean
  shadows?: [string, string][]
  badge?: L10n | null
  minSelections?: number
  maxSelections?: number
  maxQuantity?: number
  title?: L10n
  qtyLabel?: L10n
  description?: L10n
}

export interface MenuUpgradeCms {
  id: string
  role: 'menu-upgrade'
  enabled?: boolean
  priority?: number
  target?: CmsTarget
  title: L10n
  incl: L10n
  badge?: L10n
  includedProducts?: unknown[]
  conflictsWithCrossSells?: string[]
  conflictMode?: 'extra-portion' | 'hide'
}

export interface UpsellSettings {
  enabled?: boolean
  showMenuUpgrade?: boolean
  maxProductEnhancementsVisible?: number
  maxCrossSellsVisible?: number
  showAllEnhancementsAction?: boolean
  showAllCrossSellsAction?: boolean
  showPriceSummary?: boolean
  crossSellDisplay?: { mode: 'compact-horizontal' | 'collapsed' | 'grid'; maxVisible?: number }
  targetOrderValue?: { minimum: number; maximum: number }
}

export interface UpsellCms {
  upsellSettings: UpsellSettings
  sections: { enhancements: Record<string, { title: L10n }>; crossSells: Record<string, { title: L10n }> }
  menuUpgrade: MenuUpgradeCms
  productEnhancements: CmsItem[]
  crossSells: CmsItem[]
  premiumDrinks: CmsItem[]
}

export interface CmsBlock {
  id: string
  role: 'category-finish' | 'cart-inspire'
  enabled?: boolean
  priority?: number
  target?: { cats: string[] }
  title: L10n
  subtitle?: L10n
  display?: { mode?: string; maxVisible?: number }
  items?: { pid: string }[]
  link?: { cat: string; label: L10n }
}

export interface GuestitCms {
  version: number
  brand: { money: { symbol: string; decimals: string }; controls: { shape: string; radius: number } }
  badges: Record<string, { label: string; icon?: string; color?: string }>
  categories: Record<string, { presentation?: { card?: 'visual' | 'compact'; columns?: Record<string, number>; variantCards?: 'top' | 'all' | 'off' } }>
  upsell: { blocks: CmsBlock[] }
}

export interface Promo {
  pid: string
  menu?: boolean
  img?: string
  cut?: boolean
  em?: string
  tint?: string
  tint2?: string
  flag: L10n
  title: L10n
  sub: L10n
}

export interface Brand {
  id: string
  name: string
  logoImg: string
  logoFilter?: string
  brandGraphic?: string
  colors: Record<string, string>
  radiusBtn: string
  typography: { displayFont: string; bodyFont: string; accentFont: string }
  layout: {
    sidebarWidth: number
    basketOverlap: number
    contentPadding: number
    gridColumns: number
    gridGap: number
    heroHeight: number
    promoHeight?: number
    productImageHeight: number
    basketBottom: number
    basketHeight: number
  }
  motion: Record<string, number>
  hero: { mode: 'image' | 'slider' | 'video'; interval?: number; height?: number; contentFocalPoint: { x: number; y: number }; textSafeWidth: number; images: string[]; video?: string }
  copy: { headline: L10n; sub: L10n; logoTagline: string; sideNote: string; tagline: string; subIcon?: string }
  languages: Lang[]
  defaultLanguage: Lang
  orderTypes: string[]
  defaultOrderType: string
  features: { voucher?: boolean; visualUpsells?: boolean; loyalty?: boolean }
  sidebar: {
    backgroundType: 'image' | 'color'
    backgroundImage?: string
    backgroundColor?: string
    backgroundPosition?: string
    focalPoint?: { x: number; y: number }
    overlayColor?: string
    overlayOpacity?: number
  }
  reward?: { threshold: number; pid: string; variant?: { choices?: Record<string, string> } }
  sessionSettings: { inactivityTimeoutMs: number; inactivityWarningMs: number }
  adminPin?: string
  serviceModes?: Record<string, { delivery: string }>
  paymentSettings: Record<string, number>
  promos: Promo[]
  pdpR44?: boolean
}

export interface CrossSellSel {
  id: string
  quantity: number
  extraPortion: boolean
}

/** A product being configured (product page) — also the shape of a cart line's configuration. */
export interface Draft {
  pid: string
  qty: number
  menu: boolean
  drink: string | null
  serving?: number
  choices: Record<string, string | null>
  extras: [string, string][]
  removes: [string, string][]
  extraQty: Record<string, number>
  crossSells: CrossSellSel[]
  reward?: boolean
  _more?: { enh?: boolean; xs?: boolean; enhOpen?: boolean }
  _xsAsk?: string | null
}

export interface CartLine extends Draft {
  lid: string
  groupId: string
  key: string
  lineType: 'product' | 'cross-sell'
  mergeable?: boolean
  unitPrice: number
  priceCheckedAt: number
  xsId?: string
  priceVariantId?: string | null
  sourceLineId?: string | null
  sourceProductId?: string | null
  extraPortion?: boolean
  fixed?: boolean
}

/** One slide of the venue's screensaver (API TMKData[].Screensaver.Slides[]). */
export interface Slide {
  img: string
  /** Shown only between these local times ("HH:MM", may wrap past midnight). */
  time?: { from: string; to: string }
  /** Linked product / subcategory (kept for later; not wired to a tap yet). */
  pid?: string
  cat?: string
}

export interface Screensaver {
  /** Time per slide (API SlideTimer, seconds → ms). */
  intervalMs: number
  /** Idle time before the screensaver starts (API ActivationTime, seconds → ms). Not used yet. */
  idleMs: number
  /** Slide opacity (API Transparency); 0 or missing = fully visible. */
  opacity: number
  /** Slides per language, in display order. */
  slides: Partial<Record<Lang, Slide[]>>
}

/** Venue identity from the API menu (ThemeResponse). */
export interface Venue {
  name?: string
  logoImg?: string
}

export interface EngineData {
  /** Venue screensaver from the API menu; absent on the static brand pack. */
  screensaver?: Screensaver
  venue?: Venue
  brand: Brand
  cats: Cat[]
  products: Product[]
  mods: Record<string, ModGroup>
  menuDeal: MenuDeal
  cms: GuestitCms
  upsell: UpsellCms
  priceVariants: Record<string, { pid: string; price: number }>
  i18n: Record<Lang, Record<string, string>>
  alg: Record<string, L10n>
  algIcon: Record<string, string>
  /** Allergen icon images (API menus: the kiosk's own allergen PNGs); algIcon is the fallback. */
  algImg?: Record<string, string>
  /** Allergens offered in the allergen filter, in order (default: every key of alg). */
  algFilter?: string[]
  catsub: Record<string, L10n>
  comp: Record<string, string[]>
  compAll: Record<string, string>
  flags: Record<string, string>
  locales: Record<string, string>
  bdg: Record<string, [string, string]>
  icons: Record<string, string>
  obwInfo: Record<string, { sub?: L10n; flavour?: L10n[] }>
  obwDefault: Record<string, 'top' | 'all' | 'off'>
  cmsCatAlias: Record<string, string[]>
  roleGroup: Record<string, string>
  allergenPolicy: { disclaimer: L10n; traces?: Record<string, string[]>; removable?: Record<string, string[]>; verifiedFree?: string[] }
}

export const MAX_LINE_QTY = 20
