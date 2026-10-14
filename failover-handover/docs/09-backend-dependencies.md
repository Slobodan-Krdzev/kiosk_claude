# 09 — Backend dependencies (fill in during Phase 0)

Status per item: `EXISTS` · `PARTIAL` · `MISSING` · `UNKNOWN`. Every `MISSING`/`PARTIAL` item gets an owner and the list of tests it blocks.

| ID | Capability | Needed for | Contract | Status | Evidence / location in code | Blocks tests |
|---|---|---|---|---|---|---|
| D1 | Control plane: writer election per venue, leases, monotonic epoch, witness/arbiter | Any automatic switch | C1 | UNKNOWN | | 1, 2, 3, 13, 14, 20 |
| D2 | Signed routing descriptor + key distribution/rotation | Safe endpoint switching | C1, C9 | UNKNOWN | | 1, 2, 3, 13, 14 |
| D3 | Node-side fencing (reject writes without lease / stale epoch) | Split-brain prevention | C1, C3 | UNKNOWN | | 13, 14 |
| D4 | Readiness endpoint with writable/epoch/db/replication/version | Health beyond HTTP 200 | C2 | UNKNOWN | | 1–5, 19 |
| D5 | Idempotent order submit, keys durable + replicated | No duplicates | C3 | UNKNOWN (kiosk v36 assumes it) | | 6, 7, 8, 11 |
| D6 | Lookup by key with replication coverage | Safe retry on another node | C4 | UNKNOWN | | 6, 7, 8, 17 |
| D7 | Local A↔B replication (sync?) and local→cloud (async?) with watermark | RPO statements, promotion safety | — | UNKNOWN | | 1, 2, 17 |
| D8 | Cloud authorised for production writes per venue | Cloud takeover | C1 | UNKNOWN | | 2, 15, 17 |
| D9 | Payment status lookup + idempotent start + callback dedupe | Payment continuity | C5 | UNKNOWN | | 8, 9, 11 |
| D10 | Print/KDS gateway with durable jobId, dedupe, UNCERTAIN state, outbound cloud channel | Kitchen delivery from any writer | C6 | UNKNOWN | | 15, 16 |
| D11 | Data versions (menu/prices/config/arrangement) + stale-price rejection | No orders with invalid pricing | C7 | UNKNOWN | | 10, 18 |
| D12 | Session generation for table sessions / AYCE | No stale updates into new sessions | C8 | UNKNOWN | | 10, 12 |
| D13 | Device enrollment, per-device credential, tenant/venue binding | Security | C9 | UNKNOWN | | security checks |
| D14 | Controlled failback (fenced recovery, catch-up, drain, handover) | Failback | C1 | UNKNOWN | | 3 |
| D15 | Reconciliation of POS-side operations from a lost node at failback | No lost history | — | UNKNOWN | | 3, 17 |
| D16 | Pager trigger on "ready" + table sign on POS floor plan (kiosk v36 §5a–5b) on every writer | Kiosk order tag | — | UNKNOWN | | 15 (extended) |

For every MISSING item, write: the exact requirement (endpoint/behaviour), why the client needs it, the tests it blocks, and a suggested owner. Do not implement a client-side substitute.
