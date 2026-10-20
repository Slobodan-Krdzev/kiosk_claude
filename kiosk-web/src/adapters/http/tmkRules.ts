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
