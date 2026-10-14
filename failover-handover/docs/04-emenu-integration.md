# 04 — eMenu integration (native Kotlin, 8-inch tablets, 2 GB RAM)

## 1. Must survive every transition and every restart [REQ §6]
| State | Where it lives today **[VERIFY]** | Required behaviour |
|---|---|---|
| Table identity + session (`sessionId`, generation) | ? | Persisted; bound atomically via `SessionGuard` |
| Active arrangement incl. AYCE (rounds, timers, limits) | ? | Persisted; server is authoritative for rounds; after a switch revalidate with `arrangementVersion` |
| Cart: products, options, modifiers, quantities | ? | Room; never cleared by connectivity events |
| Session-specific pricing | ? | Kept with the version it was priced with; re-priced on `PRICE_STALE` with guest confirmation |
| Language | ? | Kept |
| Loyalty/member association | ? | Kept; loyalty session handling unchanged |
| Discounts and promotions applied | ? | Kept; revalidated server-side at submit |
| Orders awaiting acknowledgement | — (new) | Outbox `PENDING / IN_FLIGHT / UNKNOWN` |
| Checkout / payment-recovery state | ? | Payment attempt store (`06-payment-and-kitchen.md`) |

If any of these currently live only in memory (ViewModel), move them to the existing persistence layer (Room / DataStore) **without changing the UI**.

## 2. Integration points
1. **Network:** replace the static base URL with `ActiveEndpointInterceptor`; add `EpochHeaderInterceptor` to the shared client. No Retrofit rebuild, no Activity recreation.
2. **Order submit:** the existing "send order" use case writes to the outbox and observes the record; the UI shows *sending → accepted* only on `CONFIRMED`. `UNKNOWN` shows "We are confirming your order with the restaurant" (guest) and appears in staff diagnostics.
3. **AYCE rounds:** a round submission is an outbox operation with its own key; round counters update only from server confirmation. During `NoAuthority`, the next round is queued, not counted.
4. **Realtime** (order status, table events, menu updates): through `RealtimeSwitcher`; events with an older epoch or older session generation are ignored.
5. **Menu cache:** keep showing the cached menu during transitions; revalidate versions after a switch (C7); disable items the new writer reports unavailable (existing unavailable UI).
6. **Status indicator:** subtle, per `07-status-ui.md`; no popups unless ordering or payment is actually affected.

## 3. Acceptance (eMenu)
- Kill the active node during browsing and during order submission: no restart, no cart loss, no duplicate order, correct final state (tests 1, 2, 6, 7, 10, 12, 19, 20).
- App process killed with a pending order → after restart the order is still `PENDING/UNKNOWN` and reconciles correctly.
- AYCE session continues on the new writer without losing rounds or allowing an extra round.
- Memory on the 2 GB reference tablet: no measurable growth over a 1-hour soak with 100 switches (or reported as unmeasured).
