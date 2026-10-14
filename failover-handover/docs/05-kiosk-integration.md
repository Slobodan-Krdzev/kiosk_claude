# 05 — Kiosk integration

**First question for the audit:** which kiosk is in production?
- **(N) Native Kotlin kiosk** — integrate like the eMenu (same core, same interceptors, outbox, session guard).
- **(W) HTML kiosk inside the Guestit Launcher** (Kotlin WebView shell, JS bridge pattern `window.GuestitLauncher.*`) — the HTML kiosk prototype v36 (`guestit-kiosk-handover`) already has a payment state machine, durable paid-order record and idempotent POS submit. The Kotlin core then lives in the Launcher and the HTML kiosk talks to it through a bridge.

Both may exist; record the answer in the assessment.

## 1. Must survive [REQ §6]
Cart · product/variant selections · modifiers · upsell selections · loyalty identification (QR / Como session) · promotions and vouchers · order tag (table sign / pager / name, v35–v36) · active checkout state · payment attempt identity · order confirmation state.

## 2. Native kiosk (N)
Same integration points as the eMenu (`04-emenu-integration.md` §2), plus:
- Checkout = **persist, then pay, then submit** — the v36 reference order: lock the cart snapshot, persist it (with `orderId`, `idempotencyKey`, `paymentAttemptId`, order tag, loyalty data), *then* start the terminal (`docs/reference/kiosk-payment-and-recovery-v36.md`).
- Payment approved → outbox `ORDER_SUBMIT` (same key on every retry). Success screen only after `CONFIRMED`.
- Approved but order `UNKNOWN`/failed → `PAID_ORDER_PENDING`: protected state, no reset by inactivity, staff assistance with reference, automatic reconciliation via C4 when authority returns.
- `setPaymentInProgress(true)` while the terminal is active → no voluntary endpoint switch.
- Loyalty (Como): session end calls keep working; `commit` after POS acceptance uses its own idempotency key (`LTY-<orderId>`) through the outbox.

## 3. HTML kiosk in the Launcher (W)
The HTML kiosk already abstracts the backend behind `window.GuestitAdapters` (`payment`, `pos`, `printer`, `availability`, `catalog`, `auth`, `loyalty`, `analytics`). The Launcher implements those adapters natively on top of the core:

```
HTML kiosk (v36)                     Guestit Launcher (Kotlin)
window.GuestitAdapters.pos.submit ─► JS bridge ─► OrderOutbox.enqueue(key = snapshot idempotencyKey)
                                                ◄─ result when CONFIRMED / REJECTED / UNKNOWN
window.GuestitAdapters.availability ► bridge ─► GET via ActiveEndpointInterceptor
window.GuestitConnectivity.state    ◄─ bridge ─ ConnectionState (for the status indicator)
```
Bridge rules:
- **Promise-based, request IDs, timeouts.** Every call carries a request ID; responses are matched by ID; a page reload never re-triggers a submit (the outbox is in Kotlin, keyed).
- `pos.submit` resolves with `{ orderNo }` **only** on `CONFIRMED`; `UNKNOWN` resolves to a typed "uncertain" result that the v36 state machine already treats as `recovery-required` (no new client logic needed beyond the mapping).
- The HTML `localStorage` paid-order record stays as the UI's recovery record; the Kotlin outbox is the source of truth for submission. On WebView restart, the page asks the bridge for the outbox state of its `idempotencyKey` before doing anything else.
- `production` mode still blocks if the bridge/adapters are missing (existing v36 rule).
- Bridge input is validated in Kotlin (types, lengths, allowed values); the WebView only loads the allowed origin(s); no arbitrary URL navigation.

## 4. Acceptance (kiosk)
- Test 11 (checkout interrupted by failover) and test 8 (payment completes during primary failure) pass with evidence: one charge, one order, correct kitchen delivery, correct guest screen.
- Inactivity reset never clears `PAID_ORDER_PENDING` or an uncertain payment (existing v36 rule).
- Loyalty session ends exactly once per kiosk session, also across a switch.
