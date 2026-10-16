# Order + payment: integrating `CreateKioskOrderWithPinPayment` into the kiosk's payment controller

Proposal 2026-10-16, branch `order-payment-api`. Source of the contract: `kiosk-payment-flow.md` (Alex's handover)
and `kiosk-api-documentation.md`.

**Status 2026-10-16 (same day, "go ahead and build it"):** implemented as described in §2–§5 in
`kiosk-web/src/adapters/http/tmkOrder.ts` (`buildOrderPayload`, `classify`, `TmkOrderPayment`), selected by
`withLiveAdapters` on API menus, snapshot fields added (`basePriceCents`, `image`, `plu`, option `productId` /
`name` / `priceCents`), `PaymentStartRequest.snapshot`. Tests: `tmkOrder.test.ts` (16: payload from menu 2490,
every response row, cancel race, timeout, and the whole controller run for approve / cancel / unknown / printing
problem / late approval). **No request was sent to the dev backend**: an order POST starts a real terminal
payment, so the live run waits for question 4. Classification per §6. Deviations 37–40, dependencies B4, B7, B8.

## 1. The two shapes

| | Old kiosk (API) | New kiosk (`src/payment/controller.ts`) |
| --- | --- | --- |
| Steps | **One blocking POST** does terminal + order + receipt | Three adapters in sequence: `payment.start` → `pos.submit` (idempotency key) → `printer.print` |
| Cancel | `GET abortRequest` (no parameters); the open POST then answers `Aborted` | `payment.cancel()` must answer cancelled / not-charged / approved / unknown |
| Status after restart | none (`CheckKioskPayment?reference=` is dead) | `payment.status()` is required for restart recovery and "check payment status" |
| Timeout | none, the POST waits forever | `timeouts.paymentStart` guard → UNKNOWN; a late approval is still applied once |
| Retry after print failure | re-POST the whole order with `skip=true`, `OrderGuid` empty | `submitRetry()` with the **same** idempotency key, never a second charge |
| Outcome mapping | `IsSuccess`, `ResponseMessage` ∈ {`Aborted`, `Printing problem`, other}, `Data.AdditionalData` (order no), `Data.IdOrder` | `approved` / `declined` / `cancelled` / `timeout` / `terminal-offline`; anything else = UNKNOWN |

## 1a. Both flows stay (Alex, 2026-10-16: "we need to keep this new kiosk flow as well")

The new kiosk's flow — terminal, then order submit with a durable idempotency key, then print, with
restart recovery and status lookup — is the controller and is **not** replaced. The old API's one-POST flow is
added as one more implementation of the same three adapter interfaces, chosen per kiosk:

| Adapters in use | Payment flow | When |
| --- | --- | --- |
| Static simulation (`kind: 'static'`, static menu) | three steps against the simulated terminal / POS / printer | development, `?source=static`, `?testMode=true` |
| `TmkOrderPayment` (`kind: 'static'` + API menu) | one POST `CreateKioskOrderWithPinPayment`, mapped onto the three steps (§2) | today's Guestit backend (`?source=api`) |
| Launcher-injected `window.GuestitAdapters` (`kind: 'bridge'` / `'http'`) | three steps against the real terminal, POS and printer of the hybrid-failover backend (`docs/02-contracts.md`) | the target architecture; never overridden by the kiosk |

The selection is the existing `withLiveAdapters` rule (`src/adapters/http/tmkLive.ts`); nothing else in the
kiosk knows which flow is behind the interfaces.

## 2. Integration: the POST becomes `payment.start()`, the order number is handed through

One HTTP class `TmkOrderPayment` (`src/adapters/http/tmkOrder.ts`) implements **all three** adapter interfaces
and is selected by `withLiveAdapters` on API menus, exactly like `TmkAvailability`. The controller, the Pay
screen, persistence and recovery stay untouched; every invariant keeps holding:

| Controller step | HTTP adapter does |
| --- | --- |
| `persist('starting')` → `connecting` | (unchanged) record written before any network call |
| `payment.start(req)` | builds the payload from the **frozen snapshot**, `POST {api}/CreateKioskOrderWithPinPayment?skip=false`, `Content-Type: application/json`, `AbortController` bound to `timeouts.paymentStart`; reports `waiting-for-card` through `onProgress` at once (the POST is opaque while the guest pays) |
| response → `PaymentStartResult` | see §4; on success the adapter **keeps** `Data.AdditionalData` and `Data.IdOrder` for this `attemptId` |
| `pos.submit({ idempotencyKey, attemptId })` | **no network call**: the POST already created the order; returns `{ orderNo: AdditionalData, duplicate: false }` for the attempt it remembers, throws for any other attempt (→ `recovery-required`, never a silent success) |
| `printer.print()` | no network call: `{ printed: true }`, or `{ printed: false }` when the POST answered `Printing problem` |
| `payment.cancel({ attemptId })` | `GET {api}/abortRequest`, then **waits for the open POST** (bounded by `timeouts.paymentCancel`): `Aborted` → `cancelled`; `IsSuccess` → `approved` (money moved, the controller applies it once); anything else / timeout → `unknown` → the controller goes to `timeout` and the late POST answer is still honoured |
| `payment.status()` | **no endpoint** → `unknown`. Restart with a pending record and "check payment status" land on the assistance screen. `BLOCKED_BACKEND` (B7) |

Why not a new "combined" adapter and a controller branch: the controller's states are what the Pay screen,
the staff panel, persistence and 60 tests are built on. Mapping the POST onto `start()` keeps "persist before
pay, one attempt = at most one charge, timeout = unknown, no success screen before the order number" without
a second code path.

## 3. Payload from the snapshot

| API field | From the snapshot / catalog | Note |
| --- | --- | --- |
| `Order.OrderGuid` | `snapshot.orderId` (stable per order, same on every retry) | Old kiosk sent `""`; this is the hook for de-duplication (B4). Backend confirms it reads it |
| `Order.SessionGuid`, `deviceSessionId`, `ItemGuid`, `Variants`, `CoursePosition` | `""`, `""`, `""`, `[]`, `0` | as the old kiosk |
| `Items[]` | one per snapshot line of kind `item` and `cross-sell` | cross-sells are ordinary products for the API |
| `Item.Id` | `productId` as number | |
| `Item.PluCode` | `""` (old kiosk) — `Product.plu` (`IdOtherPos`) is available if the backend wants it | question |
| `Item.Image` | product `SmallPictureUrl` (original URL, not the proxy URL) | snapshot gains `image` |
| `Item.Name` | product name in the default language | |
| `Item.Price` | **base product price** in euros | snapshot line gains `basePriceCents`; `unitPriceCents` includes options and must not be sent |
| `UpsaleCollection[]` | every picked step option: `ProductId` (option `pid`), `Name`, `Price` (euros), `Quantity` (`extras[].qty`) | snapshot extras gain `productId`, `name`, `priceCents`. Options with `ProductId: null` are an open question |
| `Quantity` | `qty` | |
| `Note` | `""` | the kiosk has no per-item note |
| `tableNumber` | order tag value when the tag is a table number; otherwise `""`? | old kiosk hard-coded `"9"`; question |
| not sent | eat-in / takeaway, loyalty member, gift lines | gift (reward) lines do not exist on API menus unless the design file enables them; keep them off until the backend says how a 0-priced product is handled |

Money: cents → euros with two decimals (`Math.round(c) / 100`). Prices are the menu's; the backend re-prices or
rejects (B1).

## 4. Response → outcome

| POST answers | `PaymentStartResult` | Kiosk shows |
| --- | --- | --- |
| 2xx, `IsSuccess: true` | `approved`, `txRef = Data.IdOrder`; order no = `Data.AdditionalData` | approved → submitting (instant) → **done** with the order number, receipt printed |
| 2xx, `IsSuccess: false`, `ResponseMessage: "Aborted"` | `cancelled` | cancelled, nothing charged, back to the cart |
| 2xx, `IsSuccess: false`, `ResponseMessage: "Printing problem"` | **depends on the answer to Q2.** If the payment is captured and the order stored: `approved` with the order number, `printed: false` → done + "receipt could not be printed". If the order is not stored: `approved` without order number → `recovery-required` ("paid, order pending"); *Resend* re-POSTs with `skip=true` and the same `OrderGuid` — only once B4 is confirmed | |
| 2xx, `IsSuccess: false`, any other message | **UNKNOWN** (`timeout` state) until the backend's message catalogue says which messages mean "nothing charged" (declined card, terminal offline, terminal timeout) → then `declined` / `terminal-offline` | "payment outcome unknown, check status / assistance" |
| non-2xx | UNKNOWN | the kiosk cannot tell whether the terminal ran |
| network error / `AbortController` timeout | UNKNOWN; a late answer is still applied once (`approveOnce`) | |

The old kiosk's gap (customer stuck on "pay at the terminal") does not exist here: every row ends in a state
with a screen and a next action.

## 5. Config

- `timeouts.paymentStart` is 90 s; a PIN payment can take longer. Proposal: 180 s on API menus, since a late
  approval is still applied. `timeouts.paymentCancel` 12 s covers `abortRequest` + the POST closing.
- `?testMode=true` keeps the simulated terminal (static adapters); the old kiosk never reached Finish in test mode.
- Production: the Launcher may still inject `window.GuestitAdapters`; the HTTP class is only used on the simulation.

## 6. Classification after implementation

| Path | Classification |
| --- | --- |
| approve → order number → done; cancel → Aborted | `IMPLEMENTED`, `NOT_VERIFIED_ON_REAL_INFRA` until run against the dev backend with a CCV terminal (Q4) |
| status lookup / restart recovery | `BLOCKED_BACKEND` (B7: no status endpoint keyed by `OrderGuid` or `IdOrder`) |
| resend after "Printing problem" | `BLOCKED_BACKEND` (B4: de-duplication on `OrderGuid`) |
| declined / terminal-offline as distinct outcomes | `BLOCKED_BACKEND` (B8: message catalogue) |

## 7. Questions for the backend owner (gate the rows marked above)

1. **B4** Does the backend read `Order.OrderGuid` and de-duplicate on it (same guid → same order, no second charge)?
2. **Printing problem**: at that response, is the card charged, and is the order stored with an `IdOrder`? Does `Data` carry the order number then?
3. **Message catalogue** of `ResponseMessage` for: declined card, terminal offline / unreachable, terminal timeout, validation error before the terminal was started. Which of them guarantee "nothing charged"?
4. Is there a **status lookup** (`CheckKioskPayment?reference=` or other) keyed by `OrderGuid` / `IdOrder`, usable after a kiosk restart? Does the dev backend have a CCV terminal (or a simulator) to test against?
5. `abortRequest` has no parameters: which transaction does it cancel when several kiosks share one backend?
6. `tableNumber`: send the kiosk's order tag (table / pager number) or a fixed per-device value? `PluCode`: send `IdOtherPos`?
7. Upsell options with `ProductId: null` (menu 2490, collection 12): what goes in `UpsaleStepOptionModel.ProductId`?
