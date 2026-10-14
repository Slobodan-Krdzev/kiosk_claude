import { lineUnitPrice, productById } from './cart'
import { newLineId } from './ids'
import type { CartLine, Catalog, Cms, CrossSellConfig, MenuUpgradeConfig, PremiumDrinksConfig, Product } from './types'

export type Offer =
  | { id: string; kind: 'menu-upgrade'; forLineId: string; cfg: MenuUpgradeConfig; priority: number }
  | { id: string; kind: 'cross-sell'; cfg: CrossSellConfig; priority: number }
  | { id: string; kind: 'premium-drink'; forLineId: string; cfg: PremiumDrinksConfig; deltaCents: number; priority: number }

function catOf(catalog: Catalog, productId: string): string | undefined {
  return productById(catalog, productId)?.categoryId
}

/** Default configuration for a product used as an upsell: love serving + first option of each required group. */
export function defaultConfig(p: Product): { servingId: string; choices: Record<string, string[]> } {
  const serving = p.servings.find((s) => s.love) ?? p.servings[0]
  const choices: Record<string, string[]> = {}
  for (const g of p.choiceGroups) {
    if (g.req && g.options.length) choices[g.id] = [g.options[0].id]
  }
  return { servingId: serving?.id ?? '', choices }
}

export function computeOffers(cart: CartLine[], catalog: Catalog, cms: Cms): Offer[] {
  const offers: Offer[] = []
  const items = cart.filter((l) => l.kind === 'item')
  const u = cms.upsell

  // Menu upgrade: one offer per eligible item line without an upgrade yet.
  if (u.menuUpgrade?.enabled) {
    const side = productById(catalog, u.menuUpgrade.sidePid)
    const drinks = u.menuUpgrade.drinkPids.map((id) => productById(catalog, id)).filter((p): p is Product => !!p && p.available)
    if (side?.available && drinks.length) {
      for (const line of items) {
        const cat = catOf(catalog, line.productId)
        if (!cat || !u.menuUpgrade.target.cats.includes(cat)) continue
        if (cart.some((l) => l.kind === 'menu-upgrade' && l.sourceLineId === line.lineId)) continue
        offers.push({ id: `${u.menuUpgrade.id}:${line.lineId}`, kind: 'menu-upgrade', forLineId: line.lineId, cfg: u.menuUpgrade, priority: u.menuUpgrade.priority })
      }
    }
  }

  // Cross-sells: once per config, when a target category is in the cart and no conflicts.
  for (const xs of u.crossSells ?? []) {
    if (!xs.enabled) continue
    const p = productById(catalog, xs.pid)
    if (!p?.available) continue
    const triggered = items.some((l) => xs.target.cats.includes(catOf(catalog, l.productId) ?? ''))
    if (!triggered) continue
    if (cart.some((l) => l.productId === xs.pid)) continue
    if (xs.conflictsWith.some((pid) => cart.some((l) => l.productId === pid))) continue
    offers.push({ id: xs.id, kind: 'cross-sell', cfg: xs, priority: xs.priority })
  }

  // Premium drink swap: for each standard drink line.
  if (u.premiumDrinks?.enabled) {
    const to = productById(catalog, u.premiumDrinks.toPid)
    if (to?.available) {
      for (const line of items) {
        if (!u.premiumDrinks.fromPids.includes(line.productId)) continue
        const cfgTo = defaultConfig(to)
        const toLine: CartLine = { lineId: 'tmp', productId: to.id, servingId: u.premiumDrinks.toServingId || cfgTo.servingId, choices: cfgTo.choices, extras: {}, qty: 1, kind: 'item' }
        const delta = lineUnitPrice(toLine, catalog) - lineUnitPrice({ ...line, qty: 1 }, catalog)
        if (delta <= 0) continue
        offers.push({ id: `${u.premiumDrinks.id}:${line.lineId}`, kind: 'premium-drink', forLineId: line.lineId, cfg: u.premiumDrinks, deltaCents: delta, priority: u.premiumDrinks.priority })
      }
    }
  }

  return offers.sort((a, b) => a.priority - b.priority)
}

/** Apply an accepted offer to the cart. Returns the new cart. */
export function applyOffer(cart: CartLine[], catalog: Catalog, offer: Offer, choice?: { drinkPid?: string }): CartLine[] {
  switch (offer.kind) {
    case 'menu-upgrade': {
      const parent = cart.find((l) => l.lineId === offer.forLineId)
      if (!parent) return cart
      const drinkPid = choice?.drinkPid ?? offer.cfg.drinkPids[0]
      const drink = productById(catalog, drinkPid)
      if (!drink) return cart
      const dc = defaultConfig(drink)
      const upgrade: CartLine = {
        lineId: newLineId(),
        productId: offer.cfg.sidePid,
        servingId: offer.cfg.sideServingId,
        choices: {},
        extras: {},
        qty: parent.qty,
        kind: 'menu-upgrade',
        priceVariantId: offer.cfg.priceVariantId,
        fixedUnitPriceCents: offer.cfg.priceCents,
        groupId: parent.groupId ?? parent.lineId,
        sourceLineId: parent.lineId,
        menuDrink: { productId: drink.id, servingId: dc.servingId, choices: dc.choices },
      }
      const idx = cart.indexOf(parent)
      const next = [...cart]
      next.splice(idx + 1, 0, upgrade)
      return next
    }
    case 'cross-sell': {
      const p = productById(catalog, offer.cfg.pid)
      if (!p) return cart
      const dc = defaultConfig(p)
      const line: CartLine = {
        lineId: newLineId(),
        productId: p.id,
        servingId: offer.cfg.servingId || dc.servingId,
        choices: { ...dc.choices, ...offer.cfg.choices },
        extras: {},
        qty: 1,
        kind: 'cross-sell',
        priceVariantId: offer.cfg.priceVariantId,
        fixedUnitPriceCents: offer.cfg.priceCents,
        groupId: offer.cfg.id,
      }
      return [...cart, line]
    }
    case 'premium-drink': {
      const to = productById(catalog, offer.cfg.toPid)
      if (!to) return cart
      const dc = defaultConfig(to)
      return cart.map((l) =>
        l.lineId === offer.forLineId
          ? { ...l, productId: to.id, servingId: offer.cfg.toServingId || dc.servingId, choices: dc.choices, extras: {} }
          : l,
      )
    }
  }
}
