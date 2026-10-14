// Shared domain types. Money is always integer minor units (cents).

export type Lang = 'nl' | 'en' | 'mk'
export type L10n = Record<Lang, string>

export type ServiceMode = 'eat-in' | 'takeaway'

// ---------- Catalog ----------

export interface Catalog {
  version: number
  venue: { id: string; name: string; currency: string }
  categories: Category[]
  products: Product[]
}

export interface Category {
  id: string
  name: L10n
  icon?: string
  sort: number
}

export interface Product {
  id: string // eMenu id
  categoryId: string
  image?: string
  priceCents: number
  available: boolean
  name: L10n
  description?: L10n
  allergens: string[]
  tags?: string[]
  servings: Serving[]
  choiceGroups: ChoiceGroup[]
  extras: Extra[]
}

export interface Serving {
  id: string
  name: L10n
  priceDeltaCents: number
  love?: boolean // default serving
}

export interface ChoiceGroup {
  id: string
  name: L10n
  req: boolean
  min: number
  max: number
  options: ChoiceOption[]
}

export interface ChoiceOption {
  id: string
  name: L10n
  priceDeltaCents: number
}

export interface Extra {
  id: string
  name: L10n
  priceCents: number
  maxQuantity: number
}

export interface CatalogCurrent {
  version: number
  prices: Record<string, number> // productId -> cents
  variants: Record<string, number> // priceVariantId -> cents
  disabled: string[]
}

// ---------- CMS / upsell ----------

export interface Cms {
  brand: { name: string; tagline: L10n; money: { currency: string; locale: string } }
  badges: Record<string, L10n>
  allergens: Record<string, L10n>
  upsell: {
    menuUpgrade: MenuUpgradeConfig
    crossSells: CrossSellConfig[]
    premiumDrinks: PremiumDrinksConfig
  }
}

export interface MenuUpgradeConfig {
  id: string
  enabled: boolean
  priority: number
  target: { cats: string[] }
  priceCents: number
  priceVariantId: string
  sidePid: string
  sideServingId: string
  drinkPids: string[]
  title: L10n
  subtitle: L10n
}

export interface CrossSellConfig {
  id: string
  enabled: boolean
  priority: number
  target: { cats: string[] }
  pid: string
  servingId: string
  choices: Record<string, string[]>
  priceVariantId: string
  priceCents: number
  conflictsWith: string[]
  title: L10n
  subtitle: L10n
}

export interface PremiumDrinksConfig {
  id: string
  enabled: boolean
  priority: number
  fromPids: string[]
  toPid: string
  toServingId: string
  title: L10n
  subtitle: L10n
}

// ---------- Cart ----------

export type LineKind = 'item' | 'menu-upgrade' | 'cross-sell' | 'gift'

export interface CartLine {
  lineId: string
  productId: string
  servingId: string
  choices: Record<string, string[]> // groupId -> optionIds
  extras: Record<string, number> // extraId -> qty
  qty: number
  kind: LineKind
  /** Fixed price for upsell variants (cents per unit). Overrides catalog pricing. */
  priceVariantId?: string
  fixedUnitPriceCents?: number
  /** Links upsell lines to the line they belong to. */
  groupId?: string
  sourceLineId?: string
  /** Menu upgrade: the chosen drink. */
  menuDrink?: { productId: string; servingId: string; choices: Record<string, string[]> }
}

// ---------- Order tag ----------

export type OrderTagMode = 'none' | 'pager' | 'table' | 'name'

export interface OrderTag {
  type: 'table' | 'pager' | 'name'
  value: string
}

export interface OrderTagConfig {
  mode: OrderTagMode
  takeawayMode?: OrderTagMode | null
  required: boolean
  min: number
  max: number
  table?: { min: number; max: number }
  pager?: { min: number; max: number }
  nameMin: number
  nameMax: number
  nameBlocklist: string[]
}

// ---------- Config ----------

export interface Timeouts {
  paymentStart: number
  paymentStatus: number
  paymentCancel: number
  posSubmit: number
  print: number
  availability: number
  health: number
}

export interface GuestitConfig {
  venueId: string
  tenantId: string
  venueName: string
  currency: string
  locale: string
  defaultLang: Lang
  languages: Lang[]
  mode: 'demo' | 'production'
  staffPin?: string
  orderTag: OrderTagConfig
  timeouts: Timeouts
  uncertainMs: number
  idle: { warnAfterMs: number; countdownMs: number }
  doneAutoResetMs: number
  sessionTtlMs: number
}

// ---------- Order snapshot (frozen at payment start) ----------

export interface SnapshotLine {
  lineId: string
  productId: string
  productName: string // English, for KDS/receipt
  servingId: string
  servingName: string
  choices: { groupId: string; optionIds: string[] }[]
  extras: { extraId: string; qty: number }[]
  qty: number
  unitPriceCents: number
  lineTotalCents: number
  kind: LineKind
  priceVariantId?: string
  groupId?: string
  sourceLineId?: string
  menuDrink?: { productId: string; servingId: string; choices: Record<string, string[]> }
  menuSideId?: string
  removes?: string[]
}

export interface OrderSnapshot {
  orderId: string
  startedAt: string
  paidAt?: string | null
  lines: SnapshotLine[]
  service: ServiceMode
  lang: Lang
  tag: OrderTag | null
  totals: { subtotalCents: number; discountCents: number; totalCents: number; count: number }
  loyalty: { memberId: string } | null
  pricedWith: { catalogVersion: number }
}

export interface LoyaltyMember {
  id: string
  name: string
  points: number
}
