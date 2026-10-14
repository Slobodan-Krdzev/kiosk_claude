# CLAUDE.md — Guestit hybrid failover (applies to POS, eMenu, kiosk repositories)

These rules are permanent for every session in this repository. If this repository already has rules, the stricter rule wins.
Background and design: `failover-handover/` (START-HERE.md, docs/).

## 1. Truth before code
1. **Inspect before you assume.** Read the real code, build files, DI graph, network stack, persistence and backend contracts before proposing or writing anything. The POS 9.4.1 behaviour is the reference; its UI is not proof that a mechanism works.
2. **Never invent** API endpoints, payload fields, database tables, payment protocols, printer protocols or infrastructure. The contracts in `failover-handover/docs/02-contracts.md` are *proposals*: implement a client against them only after the audit shows nothing equivalent exists **and** the backend owner has accepted them (record that in `DEVIATIONS.md` / the assessment).
3. **Missing backend capability = BLOCKED.** Write the exact requirement in `BACKEND-DEPENDENCIES.md`, implement the client side behind the interface, and mark the affected tests BLOCKED. Do not work around it with client-only logic that *looks* like failover.
4. **Classify every capability** as one of: `IMPLEMENTED` · `INTEGRATED_AND_TESTED` · `NOT_VERIFIED_ON_REAL_INFRA` · `BLOCKED_BACKEND` · `NOT_IMPLEMENTED`. Never round up.

## 2. Authority and routing
5. **Devices never promote a server.** The writable target comes only from backend-issued, signed routing information with a monotonic **authority epoch**. Accept a new routing descriptor only if its signature is valid, venue/tenant match and its epoch is ≥ the current one (equal epoch = same writer).
6. **Every write carries the epoch** the device believes in. A server that is not the current writer, or sees a stale epoch, must reject the write (fencing). The client treats such a rejection as "authority changed" → re-resolve, never as a reason to try another node blindly.
7. **HTTP 200 is not health.** A node is usable for writes only when readiness reports: application + database ready, `writable=true`, epoch = descriptor epoch, compatible API version, correct tenant/venue, acceptable replication/recovery state.
8. **Preference order** LOCAL_PRIMARY → LOCAL_SECONDARY → CLOUD_ACTIVE is a *preference*; the backend's descriptor decides. A node with independent (unsynchronised) data is never promoted automatically — manual recovery only.
9. **Hysteresis.** Bounded timeouts + failure thresholds to leave a node; minimum dwell time before any further switch; failback only when the backend issues a new epoch. Do not switch while a guest is mid-payment unless the current node is confirmed dead.

## 3. Transactions
10. **Durable outbox first.** Persist the operation (with its idempotency key) *before* the first network attempt. Keys are stable across retries, node switches, restarts, cloud failover and failback.
11. **Timeout ≠ failure.** States: `DRAFT → PENDING → IN_FLIGHT → (CONFIRMED | REJECTED | UNKNOWN) → RECONCILED`. An `UNKNOWN` operation is retried against another node only after the reconciliation contract proves it was not committed (including replication coverage, see docs/01 §6).
12. **No success screen** until the authoritative backend confirms durable acceptance. Kitchen delivery is shown as delivered only when the print/KDS path confirms it; otherwise show the explicit pending/uncertain state.
13. **Payments:** one payment-attempt ID per attempt, persisted before the terminal/PSP is touched; never start a second charge automatically after an uncertain result; reconcile with the PSP/terminal; dedupe callbacks; paid-but-order-unconfirmed is a durable, recoverable state (`PAID_ORDER_PENDING`). No cardholder data is stored.
14. **Stale responses never touch new sessions.** Cart/session mutations are serialised per session (Mutex/actor) and tagged with a session generation; responses for an older generation are discarded.

## 4. Preservation
15. **No feature loss.** Existing ordering, loyalty (QR / Como), promotions, vouchers, arrangements/AYCE, upsell, languages, printing and payment integrations keep working exactly as before. No UI redesign; only the subtle connection indicator and a staff diagnostics screen are added.
16. **Never discard the cart, never restart the app, never reload the UI** because of a connectivity transition.
17. **Use the existing stacks** (DI framework, Retrofit/OkHttp/Ktor, Room, WorkManager, logging). Add a dependency only with a written reason.

## 5. Quality bar
18. **2 GB devices.** One lightweight monitor per process, shared HTTP client, bounded queues and caches, structured concurrency, lifecycle-aware collection, nothing on the main thread.
19. **Security.** No secrets in the APK; authenticated device identity; venue + tenant binding; TLS (pinning for cloud); signed routing; log every administrative override.
20. **Evidence.** Fault-injection tests against real backend nodes are the only acceptable evidence for failover behaviour. Record commands, logs, DB/outbox dumps and order counts in the test matrix.
21. **Small, reviewable steps.** Work per phase (see the start prompt), one commit per coherent change on `feature/hybrid-failover`, build + tests green before every commit, a `PHASE-STATUS.md` note at the end of each phase. Never push to `main`, never force-push, never rewrite history.
22. **Ask, don't guess,** when a decision is irreversible or changes money, orders or data ownership. Record the question in the assessment and stop.
