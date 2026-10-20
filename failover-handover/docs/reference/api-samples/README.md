# Real API samples: catalog (`getfullresources`)

Captured 2026-10-15 with plain `curl`, no headers, no auth. Both hosts are Microsoft-IIS / ASP.NET and reply `Cache-Control: no-cache`.

| File | Request | Result |
| --- | --- | --- |
| `getfullresources.json` | `GET https://kioskapi.dev.revelapps.com/api/getfullresources` | 200, 415 KB, 2.3 s. Venue "Tapas Mainstreet", 1 language (nl), 10 main categories, 246 products, 0 upsale collections |
| `testmode-2490.json` | `GET https://my.tabletmenukaart.nl/service/kioskTestModeResources?menu=2490` | 200, 3.6 MB, 5.1 s. No `RestaurantName`; 2 languages (nl, en), 17 main categories, 916 products, 3 upsale collections, 8 agendas |

**CORS:** both hosts echo the `Origin` header back (`Access-Control-Allow-Origin: http://localhost:5173`, `Allow-Credentials: true`), so the web kiosk can call them directly from the browser.

**Menu 2490 is not the Dadawan poké menu from our fixtures.** It is a sushi / all-you-can-eat test menu (MENUKAART, MENUKAART DELUXE, MODIFIERS, AFHAAL, Test…) that mentions "Dadawan" in a few texts. Our `public/mock/dadawan/*.json` data has no API counterpart.

Status of everything below: `NOT_IMPLEMENTED`; the samples are evidence of the response shape only.

## Observed facts that drive the mapping

- `TMKData[]` holds one full menu tree per language. `ProductId`s are identical across languages (checked on 2490), so translations can be joined by id.
- Money is a float in euros (`3.6`). The engine uses integer cents, so the mapper multiplies by 100 and rounds. 680 of the 916 products in 2490 have price `0` (AYCE items and modifier products).
- Image URLs on 2490 are `http://my.tabletmenukaart.nl/...`. 503 of the 916 products have no picture. A kiosk served over https would block these images as mixed content.
- Allergens use 22 fixed `AllergenTypeId`s: 1–18 are the EU allergens plus onion/garlic/wheat/alcohol, and 19–22 are Pregnancy / Spicy / Vegan / Vegetarian. The API has no "traces" or "removable" lists.
- Modifiers (2026-10-20): the test menu's wine wizard "Maak uw keuze:" (products 465464/465465/465467/465474) lists every option twice with distinct `ProductId`s (437083 and 437087 are both "Geen Glas", …, 14 elements for 7 names). The kiosk shows what the API sends — two different POS products with one name are the venue's data to fix, not something the kiosk should merge. Menu 2408's "Aantal glazen" (4 elements) is clean.
- Modifiers: 59 products have `ModifierWizards` (`Title`, `IsMandatory`, `SelectionMin/Max`, `ListType` 0|1, items with `Price` and `ProductId`). Observed min/max pairs: 1/1, 1/5, 0/2, 0/5, 3/3, 2/2, 4/4.
- Upsell is a **step wizard** (`UpsaleColletions[].UpsaleSteps[]`), linked through `NextStepId` and per-option `OverrideNextStepId` / `Finish`. Our v36 engine instead shows enhancements and cross-sells on the product page.
- `ProductsTags` is almost always empty (one tag, "Taste: sweet").
- The API carries no badges (popular/new), sizes/servings, kcal, emoji/tint/cut-out images, menu-deal flag, promos, hero copy or category icons.

## Mapping: API → EngineData

| Engine field | API source | Status |
| --- | --- | --- |
| `cats[]` (`id`, label) | `SubCategories[]` (`SubCategoryId`, `Name`) of the chosen main categories | maps; **which main categories** is decision D1 |
| `cats[].icon` | none | gap: default icon, or a local per-venue map |
| `products[].id/cat/name/price` | `ProductId`, `SubCategoryId`, `Name`, `Price`×100 | maps |
| `products[].img` | `ProductDetails.ProductPictureUrl` → `SmallPictureUrl` → none | maps (http issue, D6) |
| `products[].desc` | `MenuItems[Name="Description"].HtmlContent` (HTML) | maps; the HTML must be sanitised or stripped |
| `products[].allergens.contains` | `MenuItems[Name="Allergens"].AllergensScreen.Allergens[IsActive]` ids 1–18 → our keys | maps; `traces`/`removable` are empty |
| `products[].badges` / `tags` | `IsVegan`, `IsVegetarian`, `IsSpicy`, `IsPregnancyNotSuitable` (+ allergen ids 19–22) | partial; no "popular"/"new" |
| `products[].disabled` | `OutOfStock`, `NoInteraction`, `AvailableFrom/ToTime` | maps |
| `products[].mods` + `mods{}` | `ModifierWizards[]` → `ModGroup` (`label`=`Title`, `req`=`IsMandatory`, `items`) | partial: min/max counts above 1 (2/2, 3/3, 1/5) don't fit `choice`/`extra`; meaning of `ListType` unknown (D3) |
| `products[].servings`, `kcal`, `em`, `tint`, `cut`, `canMenu` | none | gap |
| `upsell` (CMS enhancements / cross-sells / menu upgrade) | `UpsaleColletions` step wizard | different model (D4) |
| `menuDeal`, `cms.upsell.blocks`, `brand.promos` | none (`IsPromotion` flag only) | gap |
| `brand.name`, `logoImg`, hero image | `RestaurantName`, `LogoImage.Url`, `CoverImage.Url` | maps |
| `brand.colors` | `ActiveColor`, category `BackgroundColor/TextColor` | partial; we keep the Dadawan design tokens |
| `brand.languages` | `LanguagesList[].Locale` | maps; our `Lang` type is `nl|en|mk` only |
| money symbol | `CurrencySettings.CurrencySymbol` | maps |
| AYCE (`Agendas`, rounds, `MaxItemsAllowed`) | present | out of scope for the kiosk flow unless asked |

## Decisions (Alex, 2026-10-15) and how they are implemented

| # | Decision | Implementation |
| --- | --- | --- |
| D1 | Render every SubCategory of `MainCategories[0]` of the TMKData entry for the current language (fallback `TMKData[0]`); the sidebar lists the subcategories | `mapTmkToEngine` (`kiosk-web/src/adapters/http/tmkMapper.ts`). The nl tree defines the structure; other languages are joined by id |
| D2 | ~~Leave design-only data (badges popular/new, promos, hero copy, category icons, menu deal, cross-sells) for now~~ **Closed 2026-10-16** | Promo cards from the API's `IsPromotion` window; icons from the subcategory name; badges, subtitles, cross-sells, finish strips, cart block and reward from the per-venue design file `kiosk-web/public/venue/<menuId>.json` (`docs/reference/venue-design-layer.md`, DEVIATIONS 32–35). Hero copy was already replaced by the venue's screensaver and logo (audit F10). Menu deal, enhancements and premium drinks stay off (no API counterpart) |
| D3 | Modifiers look like the v36 design; picking rules per product. ~~Revised 2026-10-15: not used~~ **Revived 2026-10-20 (Alex: "revert them back on … but the POST calls must work at all times")** | `Products[].ModifierWizards` → one group per wizard (`md<ProductId>_<ModifierId>`): max 1 → `choice` group (the engine's product-page layout: numbered header, "Verplicht", chip grid, price difference, sub line from `Description`, `DefaultSelected` → default), max > 1 → `step` group chained in `DisplayOrder` before the product's upsell steps; mandatory ⇒ required / min ≥ 1; max falls back to 1 (`ListType` 1) or all; an option is offered only with an integer `ProductId`; picks go out in the order POST as `UpsaleCollection` entries (`ProductId`, `Name`, `Price`, `Quantity`), the same carrier as upsell picks, because the old kiosk never sent modifiers (`Variants` always `[]`) and `UpsaleCollection` is the one documented carrier for option products. **Not yet proven live:** a non-empty collection has never been accepted by the dev backend — on 2026-10-20 (afternoon) every order POST, with or without options, answered HTTP 500 `{"Message":"An error has occurred."}` (B10, live note 2026-10-20) |
| D4 | Upsell fitted into the product page | Each `UpsaleSteps` entry is a `step` section on the product page (v36 enhancement tiles, stepper when an option may be taken more than once). Steps follow `NextStepId`, an option's `OverrideNextStepId`, and stop at `Finish`; picks in steps that leave the page are dropped. Link and counting rules as in the old kiosk (`docs/reference/kiosk-upsale-flow.md`): only `HasUpsaleCollection` + `UpsaleCollectionId` → `UpsaleColletions[].Id`; step `Min/MaxSelection` count **different options**, each option capped by its own `MaxSelection` (2026-10-15). Steps/options sorted by `DisplayOrder`/`OptionOrder` (same as array order in the samples) |
| D5 | Show 0 prices | Prices map 1:1 (euros → cents), 0 shows as 0,00 |
| D6 | Proxy the images for now | `GET /img-proxy?u=<http url>` in the Vite dev/preview server, allowlisted to the two API hosts. **A production host / the Launcher must offer the same route.** |

Select the source with `config.json` → `catalogSource` (default `api` since 2026-10-15), or per kiosk with `?source=static`, `?source=test&menuId=2490` or `?testMode=true&menuId=2490` (as in the old kiosk).

### First screen (2026-10-15)

The attract screen shows `TMKData[].Screensaver.Slides` of the current language (fallback: the first language with slides), in `DisplayOrder`, each for `SlideTimer` seconds, at `Transparency` opacity. A slide with `UseTime` shows only between `TimeFrom`–`TimeTo` (may wrap past midnight). Slides with `UseActivation` / `UseRound` (eMenu tablet conditions) are left out. `IdProductInMenu` / `IdSubcategoryInMenu` are kept on the slide but not wired to a tap yet; `ActivationTime` is kept for a later idle screensaver. The original slides (embedded hero + `BRAND.hero.images`) are commented out in `kiosk-web/src/ui/Attract.tsx`; the static source therefore shows no slides.

On API menus the brand overlay (headline, tagline, top/left shading) is hidden and the logo at the top is `ThemeResponse.LogoImage.Url` (no colour filter). The bottom controls (loyalty pill, "how do you want to order", Dine in / Takeaway, voucher) fade out after `Screensaver.ActivationTime` seconds without a touch and return on the next touch; the revealing touch never starts an order. The static source keeps the original Dadawan first screen apart from the slides.

### Allergens (2026-10-15)

Mapping and icons follow `docs/reference/product-allergen-map.md`: TMK `AllergenTypeId` 1–18 are allergens (product sheet "Bevat", allergen filter), 19–22 (pregnancy, spicy, vegan, vegetarian) are shown in a separate "Dieet & goed om te weten" section and never filtered on (vegan/vegetarian/spicy also keep their card badge). Labels nl/en/mk for all 22. Icons are the kiosk's own files `kiosk-web/public/allergens/<file>.png` per the doc's legend; **the files are not in the repo yet**, so the design's emoji show as fallback. API menus carry no traces, so the traces section only appears when there are some.

## Findings while integrating (from the real data)

- `OverrideNextStepId` repeats the option's **own** step id when there is no override (collection 12). Treated as "no override".
- Empty pictures are filled with the API's placeholders (`…/DefaultDetailsMainProductImage.png`). These are treated as "no picture"; the card falls back to `SmallPictureUrl`, which usually holds the real photo.
- Some upsell options have `ProductId: null` (collection 12). Order submission will need a rule for them (old payload sent `UpsaleStepOptionModel.ProductId` as optional).
- Collection 9 step 1 is mandatory (`MinSelection 1`), so products carrying it cannot be ordered without a coffee. The kiosk follows the data.
- `NoInteraction` products: first treated as hidden (assumption). Resolved 2026-10-16 by `kiosk-product-checks.md` §4: they are visible, open the product page and cannot be ordered (`Product.infoOnly`).
- Product **names** follow the default language (the engine keeps names as plain strings); category names and descriptions are translated.
- Products without an allergen screen are marked "allergens unknown", never "free of".
- Menu 2490 is 3.6 MB and takes ~5 s to download at boot.

## Availability and product checks (2026-10-16)

Reference: `../kiosk-product-checks.md` (handed over by Alex, 2026-10-16). Captured from the dev API with
`curl -H 'Origin: http://localhost:5173'`:

| File | Request | Result |
|---|---|---|
| `checkProductAvailable-454992.json` | `GET {api}/checkProductAvailable?idProduct=454992` (Herten carpaccio) | HTTP 200, body `true` |
| `checkProductAvailable-454444.json` | same, 454444 (the `NoInteraction` product "De Keuken") | HTTP 200, body `true` |
| `checkProductAvailable-1.json` | same, unknown id 1 | HTTP 500 `{"Message":"An error has occurred."}` |
| (not stored) | `GET {api}/checkProductAvailable` without the parameter | HTTP 404 |

The body is a bare JSON boolean; CORS allows `http://localhost:5173`. **No product on the dev menu is out of stock, so a
`false` body has not been observed.** The adapter treats `false` as sold out and everything that is not a boolean
2xx body (500, network error, timeout) as UNKNOWN.

How it is implemented (`kiosk-web/src/adapters/http/tmkLive.ts`, `src/app/availability.ts`, `src/store/engine.ts`):

- One GET per product, at most 4 in flight, per-request timeout `timeouts.availability` (8 s). `?testMode=true`
  answers "available" without a request (the old kiosk's test-mode override). Wired at boot by `withLiveAdapters`
  when the menu is the API or test menu and the adapters are the static simulation; Launcher-injected adapters
  (`window.GuestitAdapters`) are never overridden.
- When: once per product per guest session, before the first add or product-page open (card tap, size tap,
  product page add); then the whole cart (lines, picked upsell options, menu parts, cross-sells) before any charge
  via `catalogRefresh(cartPids)`. The old kiosk's "every tap" is not repeated for increments of a product already
  in the cart (DEVIATIONS 28).
- Results: sold out → dialog "Sorry, {name} is sold out right now", nothing added, the product leaves every list
  (engine rule `visible()`, the same hiding the old kiosk did) and an existing cart line is blocked; UNKNOWN →
  toast "could not check, try again", nothing added, product not marked (DEVIATIONS 26); at checkout UNKNOWN →
  "could not verify" dialog and no payment attempt.
- `MaxAmountInAgenda` → `Product.maxQty` → `lineMax(p)`, applied to card stepper, product page, cart and
  validation, within the engine's 20 (DEVIATIONS 27). `NoInteraction` → `Product.infoOnly` (DEVIATIONS 31).
- `IsPromotion` + `PromotionFrom/To`: the promoted product is a promo card on the home while the window is open
  (DEVIATIONS 32). Menu 2408 has one (454444 "De Keuken", 2025-10-09 → 2031-08-06); menu 2490 has none.
  `ProductsTags` is empty on 1161 of 1162 products, `SuggestionsScreen` always null → design file, see D2.
- Prices: the API has no price endpoint. The live `catalog.current()` reports no changes and stamps the menu load
  time as the catalog version; price validation is the backend's job → `status/BACKEND-DEPENDENCIES.md` B1.

Status: catalog over HTTP = `NOT_VERIFIED_ON_REAL_INFRA` (runs against the dev API and the test endpoint; tests run
on the captured samples). Availability client = `IMPLEMENTED`; exercised against the dev API for the "available"
and the HTTP 500 paths only, so the sold-out path is `NOT_VERIFIED_ON_REAL_INFRA` until a product can be set out of
stock on the dev menu. Live prices = `BLOCKED_BACKEND`. Order + payment over `CreateKioskOrderWithPinPayment`
(`kiosk-web/src/adapters/http/tmkOrder.ts`, mapping in `docs/reference/order-payment-integration.md`): client
`IMPLEMENTED`; live on 2026-10-16 (`CreateKioskOrderWithPinPayment-live-2026-10-16.md`): every order answers
**HTTP 409 `"Printing problem"` (with a NO-BREAK SPACE) in ~1 s**, the kiosk asks "continue without receipt?",
and the resend with `?skip=true` answers **`IsSuccess: true, Data: null`** in ~1 s — thank-you screen reached,
order number shown as the kiosk's own short reference because the backend returns none (B9). No terminal was
involved in any run, so the terminal-driven paths (waiting, `Aborted`, declined) are `NOT_VERIFIED_ON_REAL_INFRA`;
status lookup, de-duplication of the resend and declined-as-distinct-outcome = `BLOCKED_BACKEND` (B7, B4, B8).
