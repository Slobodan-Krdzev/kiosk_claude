# Compatibility assessment — Phase 0 (filled in by Claude Code)

**Date:** · **Commits inspected:** pos `…` · emenu `…` · kiosk/launcher `…` · backend `…`

## 1. Summary (max 10 lines)
- Can automatic failover be implemented safely with today's backend? YES / PARTIAL / NO — why.
- Biggest blockers (dependency IDs from docs/09):
- Decisions needed from Alex (numbered, each with options + recommendation):

## 2. POS 9.4.1 failover — what really exists
| Mechanism | Found where (file:line) | Classification | Notes |
|---|---|---|---|
| Endpoint resolution / server list | | IMPLEMENTED / MOCK / UI-ONLY / MISSING | |
| Health monitoring (what is checked?) | | | |
| Active-writer authority / epoch / lease | | | |
| Fencing of old writer | | | |
| Replication assumptions (sync/async, watermark) | | | |
| Transaction handling during switch | | | |
| Failback | | | |
| Cloud fallback | | | |

## 3. eMenu (Kotlin)
| Topic | Found | Notes |
|---|---|---|
| Module layout / Gradle / min SDK / Kotlin version | | |
| DI (Hilt/Koin/manual) | | |
| Networking (Retrofit/OkHttp/Ktor), base URL handling | | |
| Realtime (WebSocket/SSE/polling) | | |
| Persistence (Room/DataStore), what is persisted today | | |
| Order submission flow + idempotency today | | |
| Session / table / AYCE model | | |
| Payment integration | | |
| Loyalty, promotions | | |
| Tests and CI | | |

## 4. Kiosk
- Which kiosk is in production: native Kotlin / HTML in Guestit Launcher / both:
- Same table as §3 for the relevant codebase(s):

## 5. Backend contracts
Map C1–C10 (docs/02) → EXISTS / PARTIAL / MISSING with file references.

## 6. Packaging decision for GuestitConnectivityCore
Option A / B / C (docs/03 §1) — reason:

## 7. Risks and open questions
