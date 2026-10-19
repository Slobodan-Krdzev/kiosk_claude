# Guestit Kiosk (web) — v36 design

React + TypeScript self-service kiosk that reproduces the Guestit white-label kiosk engine v36 (DADAWAN design)
on top of the failover-safe payment core from `../failover-handover/`.

The **menu comes from the kiosk API** (`getfullresources`, see `../failover-handover/docs/reference/api-samples/README.md`),
selected with `public/mock/config.json → catalogSource` or `?source=api|test|static` / `?testMode=true&menuId=<n>`.
On an API menu, **product availability is checked live** (`checkProductAvailable`, one request per product: on the
first add or product-page open, and again for the whole cart before any charge; `src/adapters/http/tmkLive.ts`,
`src/app/availability.ts`). The API has no price endpoint, so prices are never re-checked client-side
(`../failover-handover/status/BACKEND-DEPENDENCIES.md`). Design data the API does not carry (popular/new badges,
sidebar icons, subtitles, cross-sells, finish strips, reward) comes from the **venue design file**
`public/venue/<menuId>.json` (`src/adapters/http/venueDesign.ts`, format in
`../failover-handover/docs/reference/venue-design-layer.md`); promo cards come from the API's `IsPromotion` window.
On an API menu **order + payment go through the API's one blocking POST** `CreateKioskOrderWithPinPayment`
(`src/adapters/http/tmkOrder.ts`): it backs the payment, POS and printer adapters of the payment controller
(`../failover-handover/docs/reference/order-payment-integration.md`). Test mode and the static menu keep the
simulated terminal. Everything else (loyalty,
connectivity) still runs on the **static simulation** in `src/adapters/static/` behind the `GuestitAdapters`
interface — that is a development stand-in, not a production integration. Later the same UI runs inside the Guestit Launcher (Kotlin WebView), which injects
`window.GuestitAdapters`, or against the HTTP backend.

## Run

```bash
npm install
npm run dev        # open the printed URL; a portrait window shows the kiosk edge to edge, landscape shows the scaled device
npm test           # unit tests: payment state machine, engine pricing/cart, API menu mapper, audit regressions, order tag, persistence
npm run build      # dist/ (relative paths, ES2018 for older WebViews)
```

Staff panel: tap the brand logo 5 times within 3 seconds, PIN `staffPin` from `public/mock/config.json` (demo 2468).

Fullscreen: the small button bottom-right of the viewport enters fullscreen on a tap and hides while fullscreen (browsers do not allow fullscreen without a gesture; for true startup fullscreen launch Chrome with `--kiosk --app=<url>`, or run inside the Launcher, where the button never renders).
Simulation tab: terminal / POS / printer / health outcomes, hangs, connectivity scenarios, sold-out products, price changes.

## Where things live

```
public/brand/            fonts.css + woff2 (Inter, Bebas Neue, Caveat, IBM Plex Mono), img/<key>.webp (56 photos), logos
public/mock/dadawan/     engine data as JSON (PRODUCTS, MODS, CATS, MENU_DEAL, UPSELL_CMS, GUESTIT_CMS, I18N, BRAND, P icons …) — money in cents
public/mock/config.json  kiosk config: orderTag, timeouts, idle, staffPin (later: window.GuestitConfig)
src/reference.css        the engine stylesheet verbatim (tokens, compiled Tailwind utilities, component styles)
src/engine/              pure port of the engine logic: catalog, pricing, draft/validation, CMS experience, cart, i18n, money
src/store/engine.ts      kiosk state + actions (the engine's S / ACT) on Zustand
src/ui/                  screens as JSX with the engine's class names: Attract, shell (rail/home/menu), cards, Pdp (R44), Cart, Tag, Pay, Overlays, Stage, StaffPanel
src/payment/             PaymentController (v36 state machine), durable paid-order record
src/adapters/            GuestitAdapters interface; http/ = kiosk API menu (catalog source, mapper, image proxy URL); static/ = fixtures + simulated terminal, POS, printer, connectivity
src/app/                 boot (App.tsx: payment recovery before the menu), checkout preflight (one path for every charge), runtime singletons, session persistence, order-tag logic
```

## Design parity rules

- Copy markup and class strings from the matching `SCR.*` / render function in
  `../failover-handover/docs/reference/kiosk-v36-source/engine.js`; do not invent new styles.
- Brand values come from `BRAND.json`; `applyBrand()` writes them as `--c-*` CSS variables.
- The canvas is 1080×1920 design px. Portrait devices use the engine's fluid rule (CSS `zoom`), landscape previews scale the device.

## Guarantees kept from the payment core

Persist before pay · one attempt id per charge · timeout = unknown · same idempotency key on retry and restart ·
success only after the POS returned an order number · paid-but-unconfirmed is a protected, recoverable state.

## Replacing the fixtures

Implement `GuestitAdapters` (`src/adapters/types.ts`) and inject it as `window.GuestitAdapters` from the Launcher, or add
an HTTP implementation and select it in `src/adapters/index.ts`. Engine data is loaded in `src/engine/data.ts`
(`fetchEngineData`) — point it at the backend's catalog/CMS endpoints. In `production` mode the kiosk refuses to run on the simulation.
