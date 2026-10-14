# Claude Code start prompt — Guestit Unified Hybrid Failover

> Paste everything below the line as the first message of a Claude Code session started in `guestit-workspace/`
> (containing `pos/`, `emenu-android/`, `kiosk-android/` and `failover-handover/`).
> Adjust the paths in **Workspace** if your folders are named differently.

---

You are acting as Principal Android/Kotlin Engineer, Distributed Systems Architect and Hospitality POS Reliability Engineer for Guestit.

## Mission
Implement production-grade hybrid failover — LOCAL_PRIMARY → LOCAL_SECONDARY → CLOUD_ACTIVE, with DEGRADED/NO_AUTHORITY as the safe fallback — in **both** native Guestit applications (eMenu/tablet ordering and the self-service kiosk), consistent with the failover behaviour and contracts of **Guestit POS 9.4.1 Core**. This is an implementation assignment in the real source code, not a prototype or a mock failover switch. Preserve all existing features, UI/UX, business logic and API integrations.

## Workspace
- `pos/` — Guestit POS 9.4.1 Core and backend services (behaviour and contract reference)
- `emenu-android/` — native Kotlin eMenu
- `kiosk-android/` — native Kotlin kiosk and/or the Guestit Launcher hosting the HTML kiosk
- `failover-handover/` — the handover package: read `START-HERE.md`, `CLAUDE.md`, `docs/00-original-brief.md` (the full requirements) and `docs/01`–`09`, `docs/adr/`, `docs/reference/`

Read `failover-handover/CLAUDE.md` now and follow it for the whole session. If a repository has its own `CLAUDE.md`, follow both; the stricter rule wins.

## Non-negotiables (from the brief — see CLAUDE.md for the full list)
1. Devices never promote a server; authority comes only from backend-issued, signed routing with a monotonic epoch; nodes fence stale writers.
2. Persist before you send: durable outbox + stable idempotency keys; a timeout means UNKNOWN; reconcile before retrying elsewhere; never a duplicate kitchen order.
3. Never a second charge because of failover; payment attempt IDs persisted before the terminal/PSP call; PAID_ORDER_PENDING is a recoverable state.
4. Never discard the cart, restart the app or reload the UI on connectivity changes; stale responses never modify a new session.
5. No success / "in the kitchen" state without authoritative confirmation.
6. Never invent endpoints, tables or protocols. Missing backend capability → exact requirement + tests marked BLOCKED.
7. Report every capability as IMPLEMENTED · INTEGRATED_AND_TESTED · NOT_VERIFIED_ON_REAL_INFRA · BLOCKED_BACKEND · NOT_IMPLEMENTED. A passing unit test is not proof of failover.

## How to work
- Create branch `feature/hybrid-failover` in each repository you change. Never push to `main`, never force-push.
- Use a task list for the phases below. Keep commits small and coherent; build and tests must pass before each commit.
- At the end of every phase write `failover-handover/status/PHASE-<n>.md` from `templates/PHASE-STATUS.md`.
- Use the existing DI, networking, persistence, WorkManager and logging stacks. New dependencies only with a written reason.
- Use subagents for broad read-only searches across the repositories; do the design and the code yourself.
- If a decision is irreversible or affects money, orders or data ownership and the code does not answer it: record it as a numbered decision in the assessment and stop for an answer.

## Phase 0 — Audit only (no production code changes)
1. **POS 9.4.1:** find the failover manager, endpoint resolution, server-health monitoring, replication assumptions, active-writer authority (epoch/lease/fencing), transaction handling during a switch and failback. For each, classify: implemented · mock/simulated · UI-only · unverified integration · missing. Do not assume that what the POS UI shows actually works.
2. **eMenu and kiosk:** modules, Gradle setup, min/target SDK, Kotlin version, DI, networking and base-URL handling, realtime channels, Room/DataStore usage, order submission and current idempotency, session/table/AYCE model, checkout and payment integration, loyalty/promotions, existing tests and CI. Determine whether the production kiosk is native Kotlin, the HTML kiosk in the Guestit Launcher, or both (see `docs/05-kiosk-integration.md`).
3. **Backend contracts:** map C1–C10 from `docs/02-contracts.md` to what exists (EXISTS / PARTIAL / MISSING, with file references). Fill `docs/09-backend-dependencies.md` (status, evidence, blocked tests).
4. **Packaging:** choose how `GuestitConnectivityCore` is shared (docs/03 §1) and why.
5. Write `failover-handover/status/COMPATIBILITY-ASSESSMENT.md` from the template: a short summary first, then the tables, the numbered decisions needed and the risks.
6. **Stop.** Present the summary and the decisions. Wait for "Proceed with Phase 1".

## Phase 1 — Shared module foundation
Create `GuestitConnectivityCore` per the chosen packaging; wire it into both apps' builds and DI without changing behaviour (feature flag `hybridFailover`, default off). Public API per `docs/03` §3, adapted to repository conventions. Build both apps. Unit-test the skeleton.

## Phase 2 — Authority, health and transport switching
Routing descriptor fetch + signature/tenant/epoch validation + persistence; readiness probe (C2 semantics, not HTTP 200); failure detector with thresholds, hysteresis, circuit breaker and payment guard (docs/01 §4); `ActiveEndpointInterceptor` + `EpochHeaderInterceptor` on the shared client; realtime switching; `ConnectionState` StateFlow. Handle `STALE_EPOCH`/`NOT_WRITER` by re-resolving. Unit tests for every state transition; instrumented test that switching does not recreate the UI.

## Phase 3 — Durable outbox, idempotency and reconciliation
Room outbox (docs/03 §7), processor (in-process + WorkManager), state machine DRAFT→PENDING→IN_FLIGHT→CONFIRMED|REJECTED|UNKNOWN→RECONCILED, lookup-by-key reconciliation with coverage rules (docs/01 §6, C4). Process-death tests at every transition.

## Phase 4 — eMenu integration
Route order/round submission through the outbox; persist everything in `docs/04` §1; SessionGuard with generations; AYCE continuity; menu-cache revalidation with versions; status indicator. Tests per `docs/04` §3.

## Phase 5 — Kiosk integration
Native: persist → pay → submit through the outbox; PAID_ORDER_PENDING; payment guard; loyalty commit through the outbox. Launcher/HTML: implement `window.GuestitAdapters` on the core through a validated, promise-based JS bridge (docs/05 §3) without changing the HTML kiosk's behaviour. Tests per `docs/05` §4.

## Phase 6 — Payment continuity, printing and KDS
Payment attempt store, status reconciliation, callback dedupe (docs/06 §1–2). Kitchen delivery states from the server (C6); qualified guest messaging; staff view of UNCERTAIN jobs. Backend/print-gateway work only where it exists or is approved; otherwise write the requirement and mark BLOCKED.

## Phase 7 — Failback, data versions, caches
Controlled failback handling (handoverAt, drain, no switch mid-payment), epoch-driven cache revalidation, PRICE_STALE / ARRANGEMENT_EXPIRED handling with guest re-confirmation.

## Phase 8 — Status UI and diagnostics
Subtle indicator and inline guest copy (docs/07, EN/NL/MK, existing i18n system); staff diagnostics screen behind the existing staff authentication; structured logs without personal or card data.

## Phase 9 — Fault-injection lab and evidence
Build the lab described in `docs/08` §2 against real backend nodes (or document exactly what is missing). Run all 20 scenarios plus the additional checks; fill `TEST-MATRIX.csv` with PASS / FAIL / BLOCKED and real evidence (logs, DB/outbox dumps, order counts per key, PSP reports, gateway logs, screenshots). Measure memory/CPU/detect/switch times on the 2 GB reference tablet or report them as unverified.

## Phase 10 — Documentation and readiness
Write: a short architecture note (endpoint authority, order durability, failover, failback, actual recovery-point guarantees with numbers), the final backend-dependency list (no invented workarounds), `DEVIATIONS.md`, `PRODUCTION-READINESS.md`, and a summary of build and test output for both apps. Do not mark cloud failover complete until real transaction routing, authority, durability, reconciliation and kitchen delivery have been demonstrated.

## Definition of done
All acceptance criteria in `docs/00-original-brief.md` §18 are met with evidence, or the remaining gaps are explicitly listed as BLOCKED with their backend dependency. Both Android builds pass. No existing ordering, loyalty, promotion or arrangement feature is lost.

Start with Phase 0 now.
