# START HERE — Guestit Unified Hybrid Failover (POS 9.4.1 · eMenu · Kiosk)

**Package version:** 1.0 · 13 October 2026 · **Owner:** Alex (Guestit)
**Purpose:** everything a development team (working with Claude Code inside the real repositories) needs to implement production-grade hybrid failover — LOCAL_PRIMARY → LOCAL_SECONDARY → CLOUD_ACTIVE — in the native Kotlin eMenu and the self-service kiosk, consistent with Guestit POS 9.4.1.

> **Read this first.** This package was written **without access to the source code** of POS 9.4.1, the eMenu or the kiosk.
> Everything that describes an existing system is a **question to verify**, not a fact.
> Every endpoint, payload or table in this package is a **proposed contract**: use it only if the Phase 0 audit shows nothing equivalent exists *and* the backend owner agrees. If the backend capability is missing, the affected work is **BLOCKED** — it is never simulated on the client.

## Contents

| File | What it is | Audience |
|---|---|---|
| `CLAUDE.md` | Permanent rules for Claude Code. **Copy into the root of every repository** (merge with an existing `CLAUDE.md`). | Claude Code, every developer |
| `CLAUDE-CODE-PROMPT.md` | The start prompt — paste it as the first message of the Claude Code session. | Whoever starts the session |
| `docs/00-original-brief.md` | The original assignment, unchanged (source of requirements). | Everyone |
| `docs/01-architecture.md` | Target architecture: roles, authority model, state machine, failover/failback sequences, recovery-point guarantees, security. | Architects, backend, Android |
| `docs/02-contracts.md` | Required backend contracts, each marked **VERIFY** or **PROPOSED**. | Backend, Android |
| `docs/03-kotlin-core-design.md` | Design of the shared module `GuestitConnectivityCore`. | Android |
| `docs/04-emenu-integration.md` | What the eMenu must preserve and where the core plugs in. | Android (eMenu) |
| `docs/05-kiosk-integration.md` | Kiosk integration — native Kotlin kiosk **or** HTML kiosk inside the Guestit Launcher. | Android (kiosk) |
| `docs/06-payment-and-kitchen.md` | Payment continuity, printing and KDS delivery across failover. | Android, backend, POS |
| `docs/07-status-ui.md` | Guest and staff status signals with copy (EN/NL/MK). | Android, UX |
| `docs/08-test-plan.md` | The 20 required fault scenarios: setup, fault injection, expected result, evidence. | QA, Android, backend |
| `docs/09-backend-dependencies.md` | Backend components the clients depend on (status filled in during the audit). | Backend, management |
| `docs/adr/` | Decisions that are already fixed. | Everyone |
| `docs/reference/` | Existing kiosk reference v36: payment state machine and backend requirements (Dutch). | Kiosk |
| `templates/` | Templates Claude Code fills in: compatibility assessment, phase status, test matrix, deviations, production readiness. | Claude Code |

## How to start

1. **Workspace.** Clone the repositories side by side so one Claude Code session can read all of them:
   ```
   guestit-workspace/
     pos/                  # Guestit POS 9.4.1 Core (+ backend / control plane / print service / KDS)
     emenu-android/        # native Kotlin eMenu
     kiosk-android/        # native Kotlin kiosk OR guestit-launcher (+ kiosk HTML)
     failover-handover/    # this package
   ```
2. **Rules.** Copy `CLAUDE.md` into the root of `emenu-android/`, `kiosk-android/` and (if it will be changed) `pos/`. If a `CLAUDE.md` already exists, merge; the stricter rule wins.
3. **Branches.** Create `feature/hybrid-failover` in every repository that will change.
4. **Start Claude Code** in `guestit-workspace/` and paste the full contents of `CLAUDE-CODE-PROMPT.md` as the first message.
5. **Phase 0 is audit only.** Claude Code produces `COMPATIBILITY-ASSESSMENT.md` (template in `templates/`) and stops. Review it, answer the open decisions, then reply "Proceed with Phase 1".
6. **After every phase:** a status note (`templates/PHASE-STATUS.md`), a passing build, passing tests and a commit on the feature branch. Nothing merges to `main` without human review.

## The five rules that are never broken (summary of `CLAUDE.md`)

1. **No client-side promotion.** Only the backend decides which node may write (monotonic epoch + fencing). Devices follow signed routing; they never choose a writer.
2. **No duplicate order, no double charge.** One idempotency key per order and one attempt ID per payment, persisted *before* sending. A timeout means *unknown*, never *failed*.
3. **No false success.** "Order accepted", "Paid" and "Sent to kitchen" appear only after confirmation by the authoritative source.
4. **No lost guest state.** Cart, session, loyalty, AYCE and checkout survive every switch and every process restart.
5. **No fake evidence.** Unit tests and mocked indicators are not proof of working failover. Every capability is reported as *Implemented · Integrated and tested · Not verified against real infrastructure · BLOCKED · Not implemented*.

## Expected end result

- One shared Kotlin module (`GuestitConnectivityCore`) consumed by both apps — not two copies.
- Integration in eMenu and kiosk without UI redesign (only the subtle status indicator and the staff diagnostics screen are added).
- Backend changes, or exact backend requirements where capabilities are missing (affected tests marked BLOCKED).
- Unit, integration and fault-injection tests; a test matrix with real evidence (PASS / FAIL / BLOCKED).
- Short architecture note, open backend dependencies, production-readiness assessment, measured (or explicitly unmeasured) performance on a 2 GB device.
