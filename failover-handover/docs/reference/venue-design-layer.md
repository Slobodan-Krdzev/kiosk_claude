# Venue design layer for API menus

**Why.** The kiosk API (`getfullresources`) carries the menu but none of the design data the v36 engine shows:
popular / new badges, sidebar icons, category subtitles, cross-sells ("Lekker erbij"), "finish" strips under a
category, the cart's "anything else?" block and the order-value reward. The old kiosk showed hard-coded
placeholders for these. Decision D2 (2026-10-15) left them empty; closed 2026-10-16 with this layer
(`status/DEVIATIONS.md` 32–35, `status/BACKEND-DEPENDENCIES.md` B6).

**What the API itself provides** (used first, no file needed):

| API field | Kiosk |
| --- | --- |
| `IsPromotion` within `PromotionFrom`..`PromotionTo` (local time, missing bound = open) | Promo card on the home screen with the product's picture, name and first description line; badge "Deal" |
| `IsVegan`, `IsVegetarian`, `IsSpicy`, allergen marks 20–22 | Badges "Vega" / "Pittig" |
| `SubCategories[].Name` | Sidebar icon by keyword (`venueDesign.ts` `iconForCategory`), `dish` when nothing matches |
| `ThemeResponse.LogoImage`, `RestaurantName`, `Screensaver` | Venue identity and first screen (audit F10) |

**The file.** One JSON file per venue, `kiosk-web/public/venue/<menuId>.json`, or any URL in
`config.json → catalogSource.designUrl` (the Launcher can inject it with `window.GuestitConfig`). Loaded in
parallel with the menu, bounded by `timeouts.menuLoad`; a missing file (404) is normal, any other failure is
logged (`design.loadFailed`) and the kiosk shows API data alone. Entries that are malformed, point at unknown
badges / icons, or at ids not on this menu are dropped and logged (`design.ignored`). All ids are the API's
`ProductId` / `SubCategoryId` as strings or numbers. Texts are a string or `{ "nl", "en", "mk" }`.
**Prices never come from this file**: a cross-sell costs the product's menu price.

```json
{
  "badges":  { "<ProductId>": ["pop", "new", "hal"] },
  "icons":   { "<SubCategoryId>": "sushi" },
  "catsub":  { "<SubCategoryId>": { "nl": "Vers gerold", "en": "Freshly rolled" } },
  "promos":  [{ "pid": "<ProductId>", "flag": "…", "title": "…", "sub": "…", "img": "https://…" }],
  "crossSells": [{ "pid": "<ProductId>", "cats": ["<SubCategoryId>"], "products": ["<ProductId>"], "qtyLabel": "4 stuks" }],
  "finish":  [{ "cats": ["<SubCategoryId>"], "pids": ["<ProductId>"], "title": "…", "subtitle": "…", "maxVisible": 4 }],
  "inspire": { "pids": ["<ProductId>"], "title": "…", "subtitle": "…", "linkCat": "<SubCategoryId>" },
  "reward":  { "threshold": 2500, "pid": "<ProductId>" }
}
```

| Key | Meaning | Defaults |
| --- | --- | --- |
| `badges` | Extra badges per product; keys of `BDG.json` (`pop`, `new`, `veg`, `spc`, `dea`, `hal`). `pop` / `new` also fill the home rows | — |
| `icons` | Sidebar icon per subcategory; keys of `P.json` (`star bowl plate sushi ramen curry skewer cup cake dish gift heart bag …`) | Name rule |
| `catsub` | Subtitle under the category title | none |
| `promos` | Promo cards in this order, before the API promotions. Only `pid` is required. `"title": ""` / `"sub": ""` / `"flag": ""` blank that overlay text (for banner pictures that already carry their text) | Product picture, name, description; flag "Aanbieding" |
| `crossSells` | Offered on the product page of products in `cats` or listed in `products`; neither = every product. Never on its own page. One per guest pick, price = menu price | Product picture and name |
| `finish` | Strip under the grid of the listed categories; products of the same category are skipped by the engine | Texts "Maak het helemaal af · Vaak samen besteld", 4 visible |
| `inspire` | Cart block showing the first listed product not yet in the cart, with an optional "see all" link | Texts "Nog iets erbij? · Vaak samen besteld" |
| `reward` | Free product once the order reaches `threshold` cents | off |

**Not covered, by design:** menu deal ("make it a menu"), product enhancements and premium drinks of the v36
engine have no API counterpart (the venue's combos are its upsale collections, shown as steps on the product
page) and would put prices in the order that are not menu prices. They are off on API menus.

**Dev venue.** `kiosk-web/public/venue/2408.json` is a demo for menu 2408 ("Tapas Mainstreet"): the values were
picked by RevelApps so the layer can be seen and tested; the venue decides the real ones. Tests:
`kiosk-web/src/adapters/http/venueDesign.test.ts` (validates that file against the captured menu).
