# Phase 2 status — Design parity with the Guestit kiosk engine v36 (DADAWAN)

**Date:** 2026-10-14 · **Branch:** `feature/hybrid-failover` · **Build:** PASS (`npm run build`: tsc + vite) · **Tests:** 39 passed / 0 failed / backend scenarios BLOCKED (no backend)

## Done
- Extracted the reference kiosk (`dadawan-kiosk-v36 (1).html`): engine script and stylesheet to `docs/reference/kiosk-v36-source/`, fonts and 56 photos to `kiosk-web/public/brand/`, all data literals to `kiosk-web/public/mock/dadawan/*.json` (prices normalised to cents, allergens normalised, promos and premium extras included).
- Ported the engine logic as pure TypeScript (`kiosk-web/src/engine/`): servings/sizes, option groups, premium extras, menu upgrade with included and premium drinks, cross-sells with the menu conflict rule, price variants, draft validation and block reasons, cart lines (product / cross-sell, linked-line removal policy, merge rule), order-value reward gift, price revalidation, summaries, i18n (EN/NL/MK, 445 keys) and money format.
- Rebuilt every screen in React with the engine's markup and class names on the verbatim stylesheet: attract (hero slider, language pills, rewards pill, voucher), home (promo hero, popular, new), category pages (visual, compact and wide size cards, filter chips, CMS category-finish block), R44 product page (sizes with grams, option groups, extras accordion, menu offer → menu summary + drink picker, pairing chips, customize step, price breakdown sheet, allergen sheet), cart (lines, linked lines, reward gift, cart-inspire block), order tag (table/pager/name with keypad/keyboard), payment (terminal rings, every uncertain/recovery state) and success (tag chip, order number, auto restart), overlays (idle, availability failure, price change, delete-linked, discard, cancel), connection banner, staff panel.
- 1080×1920 canvas with the engine's fluid kiosk mode on portrait panels and the scaled-device preview on landscape screens.
- Verified in Chrome: full flow (attract → menu → product with menu upgrade and cross-sell → cart → table sign → simulated terminal → POS → success), category pages, compact grid, wide size cards, reward progress pill, basket bar note.

## Capability classification
| Capability | IMPLEMENTED | INTEGRATED_AND_TESTED | NOT_VERIFIED_ON_REAL_INFRA | BLOCKED_BACKEND | NOT_IMPLEMENTED |
|---|---|---|---|---|---|
| Engine pricing / cart / CMS logic | ✓ | ✓ (unit tests on the real data) | | | |
| Screens in reference design | ✓ | manual | | | |
| Payment core (unchanged) | ✓ | ✓ (unit) | ✓ (simulated terminal/POS) | C3/C5 | |
| Loyalty (Como wallet, gifts, punch cards) | partial (member code login, points shown) | | | real loyalty provider | wallet/gifts/benefits UI |
| Remote hero/sidebar media | ✓ (embedded fallbacks) | | | asset CDN | |
| Container-transform animation (card → page) | | | | | ✓ (snap open; engine's choreography not ported) |
| Tablet layout mode | | | | | ✓ (kiosk fluid + desktop preview only) |

## Deviations from the handover (and why)
See `DEVIATIONS.md` #8–#12.

## Next
1. Decide the data source: HTTP adapters against the Guestit backend, or the Kotlin Launcher bridge first.
2. Loyalty: port the Como wallet / gifts UI when the loyalty adapter contract is known.
3. Port the product-page open/close choreography and the tablet layout mode if the hardware needs them.
