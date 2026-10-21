// Design rules derived from the kiosk API data itself (nothing per venue, nothing from a file — Alex, 2026-10-20:
// "the design is coded within the kiosk app"): promotion windows → promo cards, subcategory names → sidebar icons.

import type { TmkProduct } from './tmk'

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
/** The sidebar icon of every API subcategory until the backend carries icon data (Alex, 2026-10-21). */
export const CATEGORY_ICON = 'forkBottle'

/**
 * The API has no icon per subcategory. Guessing one from the name gave wrong icons (2026-10-21), so every
 * subcategory gets the same neutral fork-and-bottle glyph until the backend provides icons (B6).
 */
export function iconForCategory(_name: string): string {
  return CATEGORY_ICON
}
