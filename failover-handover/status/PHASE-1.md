# Phase 1 status — New web kiosk: full guest flow on static fixtures

**Date:** 2026-10-14 · **Branch / commits:** no git repository yet (`Kiosk_2026/` is not under version control) · **Build:** PASS (`npm run build` in `kiosk-web/`: tsc + vite, 52 modules) · **Tests:** 36 passed / 0 failed / all backend-dependent scenarios BLOCKED (no backend)

> This phase replaces the handover's Phase 0/1 by decision of Alex (see `DEVIATIONS.md` #1–#3). It is a greenfield
> React + TypeScript kiosk on static JSON fixtures; the Kotlin Launcher wrapper and the real backend come later.

## Done
- Project `kiosk-web/` (Vite, React 19, TypeScript strict, Zustand, Vitest). Relative base path and ES2018 target for older WebViews.
- Adapter boundary `GuestitAdapters` (payment, pos, printer, availability, catalog, auth, loyalty, analytics, connectivity) with the v36 semantics (timeout = unknown). Static implementation with a simulated terminal (one charge per attemptId), simulated durable POS idempotency, printer, availability, price changes and a connectivity scenario player.
- Payment controller implementing the v36 state machine: transition table, FINALIZED guard, persist-before-terminal with write-verify, guard timer, cancel request vs. final cancel, lookup, recovery-required with reference, status-check on restart, assistance, idle locking, staff override (logged).
- Durable paid-order record (schema 3) in localStorage; short-interruption session (sessionStorage, TTL 3 min) for unpaid carts.
- Guest flow: attract → eat-in/takeaway → menu (categories, servings, required choice groups, extras with max) → cart (edit, quantities, loyalty code) → upsell (menu upgrade with drink choice, cross-sells with conflicts, premium drink swap) → order tag (table/pager/name per service type, ranges, name blocklist with normalisation, skip when not required) → preflight (health, availability, price change confirmation, cart-unchanged check, connection state) → terminal → POS submit → confirmation (order no, tag message, receipt state, auto reset) → recovery / assistance screens.
- Status indicator and guest copy per docs/07 (EN/NL/MK), payment blocked unless `connected`.
- Staff panel (5 taps, PIN): device, connection (role/node/epoch, re-resolve), payment record and keys, order-tag config read-only, logged override, simulation controls, ledgers, structured log and analytics.
- Unit tests: 23 controller scenarios (happy path, store failure, declined/retry, cancel paths, duplicate approval, timeout/lookup, guard timer, late approval, POS failure/timeout/no-orderNo, restart from every record state, invalid record), cart pricing/merging/validation/price changes/snapshot, order tag resolution/validation, record validation/store.
- Manual verification in Chrome against the dev server: full happy path (order 101, table 12, total 24.95 incl. upsells), paid-but-POS-failed → recovery screen → restart keeps the same reference → POS back → auto resubmit with the same key → exactly one order per key, two charges for two orders; staff panel; simulated failover plays suspect → resolving → switching → reconciling → connected(LOCAL_SECONDARY, epoch 42).

## Capability classification
| Capability | IMPLEMENTED | INTEGRATED_AND_TESTED | NOT_VERIFIED_ON_REAL_INFRA | BLOCKED_BACKEND | NOT_IMPLEMENTED |
|---|---|---|---|---|---|
| Guest ordering flow (catalog, cart, upsell, order tag) | ✓ | ✓ (unit + manual, fixtures) | ✓ (fixture data only) | | |
| Payment state machine, persist-before-pay, one charge per attempt | ✓ | ✓ (unit, simulated terminal) | ✓ | real terminal / PSP (C5, D9) | |
| Idempotent order submit, same key on resend/restart | ✓ (client) | ✓ (unit, simulated POS) | ✓ | durable server idempotency (C3, D5) | |
| Restart recovery (status-check, recovery-required, assistance) | ✓ | ✓ (unit + manual reload) | ✓ | authoritative payment status (C5) | |
| PAID_ORDER_PENDING protected against inactivity reset | ✓ | ✓ | | | |
| Connection state observed; writes blocked unless connected | ✓ (observe only) | manual (simulation) | ✓ | routing descriptor, readiness, epochs (C1, C2, D1–D4) | |
| Outbox / reconciliation by key (C4) | | | | D6 | ✓ not implemented (no second node to reconcile against; single durable record instead) |
| Kitchen delivery states (C6) | | | | D10 | ✓ ("kitchen is being notified" qualified copy only) |
| Data versions / PRICE_STALE (C7) | partial (price re-check + guest confirmation before pay) | ✓ (unit) | ✓ | server-side rejection D11 | |
| Loyalty identify + idempotent commit | ✓ (client) | manual | ✓ | real loyalty provider | |
| Staff diagnostics + logged override | ✓ | manual | ✓ | real staff auth (C9/D13) | |
| Status UI copy EN/NL/MK | ✓ | manual | | | |
| Kotlin Launcher / JS bridge | | | | | ✓ (next milestone) |
| Performance on 2 GB device | | | unverified | | |

## Deviations from the handover (and why)
See `DEVIATIONS.md` #1–#7.

## Next phase / decisions needed
1. **Data source next:** HTTP adapters against the Guestit backend (which endpoints exist?) or the Kotlin Launcher bridge first? The adapter interface is ready for either.
2. **Branding / venue:** fixture catalog is a demo; replace `public/mock/*.json` with real catalog/CMS exports when available.
3. **Order tag per venue:** config is read-only on the kiosk by design; the CMS screen to set it still has to exist (reference v36 §5).
4. **Git:** initialise a repository for `Kiosk_2026/` so phase commits can start (handover rule 21).
5. **Design pass:** the UI uses a neutral palette and emoji product images; swap for Guestit brand assets and photography.
