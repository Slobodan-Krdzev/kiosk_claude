# Backend dependencies (kiosk)

Capabilities the kiosk needs from the Guestit backend that do not exist yet or need a decision from the backend
owner (CLAUDE.md rule 3). The client side is implemented behind the adapter interface; the affected behaviour is
classified honestly, never rounded up.

| # | Capability | What exists today | Requirement | Client status | Classification |
|---|---|---|---|---|---|
| B1 | **Live prices / price validation** | None. Prices come from the startup menu (`getfullresources`). The old kiosk sends the unit prices it computed in `POST CreateKioskOrderWithPinPayment` and performs no check (`docs/reference/kiosk-product-checks.md`, "Prices"). | Either (a) the backend validates the order's unit prices against the current menu and rejects a mismatch with a distinguishable response, or (b) a cheap "current prices / menu version" call the kiosk can run before charging. Confirm (a) or provide (b). | `CatalogAdapter.current()` on the API returns no changes and stamps the menu load time as the catalog version (`src/adapters/http/tmkLive.ts`). The price-change dialog therefore never fires on API menus. | `BLOCKED_BACKEND` |
| B2 | **Batch availability** | `GET checkProductAvailable?idProduct=<id>`: one product per request, bare boolean. | Optional: one request for several ids. Not blocking — the kiosk checks one product on tap and only the cart's products before charging (bounded to 4 in flight). | `src/adapters/http/tmkLive.ts` fans out per product. | `IMPLEMENTED` (client) |
| B3 | **Out-of-stock test data** | The dev menu (2408) has no out-of-stock product; `checkProductAvailable` returned `true` for every id tried, HTTP 500 for an unknown id. | A product on the dev menu that answers `false`, so the sold-out path can be verified live. | Sold-out handling is covered by tests on a mocked adapter only. | `NOT_VERIFIED_ON_REAL_INFRA` |
| B4 | **Order submission idempotency** | `POST CreateKioskOrderWithPinPayment` is one blocking call that starts the PIN payment and prints; it has no idempotency key (`docs/reference/kiosk-api-documentation.md`). | A stable idempotency key per order attempt accepted by the backend (same key on resend returns the same result), or a lookup by the kiosk's order id. Needed before the payment/order adapter is built (rules 10–13). | Payment controller persists `IDEMP-<orderId>` and resends with the same key; no HTTP adapter yet. | `BLOCKED_BACKEND` |
| B5 | **Image proxy in production** | Product images are plain `http://`; the Vite dev/preview server proxies them at `/img-proxy?u=`. | The production host or the Launcher serves the same route (or the API serves https images). | `src/adapters/http/catalogSource.ts` `proxiedImg`. | `NOT_IMPLEMENTED` (production) |

Open questions for the backend owner (also listed in `docs/reference/api-samples/README.md`):

- Upsell options with `ProductId: null` (menu 2490, collection 12): what does the order payload carry for them?
- Does the backend reject an order whose unit prices differ from the current menu (B1a)?
