# 02 — Backend contracts the clients need

Every contract below is **PROPOSED**. In Phase 0, Claude Code maps each one to what already exists in POS 9.4.1 / the backend:

| Mapping result | What to do |
|---|---|
| **EXISTS** (same meaning, maybe other names) | Use the existing contract. Record the mapping in the assessment. Do not rename anything. |
| **PARTIAL** | Use what exists; write the missing part as a backend requirement (`09-backend-dependencies.md`). |
| **MISSING** | Do not invent a server. Implement the client against the interface; mark dependent tests **BLOCKED**. |

Conventions (proposed): JSON, UTC ISO-8601 timestamps, money in integer minor units, `X-Guestit-Device`, `X-Guestit-Epoch`, `X-Guestit-Api: <major.minor>` on every request; errors as `{ code, message, retryable, currentEpoch? }`.

---

## C1 — Routing descriptor (authority)
`GET /api/routing?venueId=…&domain=ordering` — served by **every** node (and by the cloud control plane), returns the latest descriptor that node knows.
```json
{ "venueId":"V12", "tenantId":"T3", "domain":"ordering", "epoch":4711,
  "writer":{ "nodeId":"V12-B", "role":"LOCAL_SECONDARY", "baseUrls":["https://10.0.0.12:8443"], "wsUrl":"wss://10.0.0.12:8443/rt" },
  "standby":[{ "nodeId":"V12-A", "role":"LOCAL_PRIMARY", "state":"RECOVERING" }],
  "leaseUntil":"2026-10-13T12:40:05Z", "handoverAt":null,
  "issuedAt":"2026-10-13T12:39:35Z", "keyId":"cp-2026-1", "signature":"base64(ed25519)" }
```
Client rule: verify signature → tenant/venue → `epoch` ≥ current. **[VERIFY]** how POS 9.4.1 resolves its server today (static IP? mDNS? config service?) and whether it has any epoch/lease concept.

## C2 — Readiness (not liveness)
`GET /api/health/ready`
```json
{ "nodeId":"V12-B", "role":"LOCAL_SECONDARY", "epoch":4711, "writable":true,
  "app":"ok", "db":"ok", "apiVersion":"9.4", "minClientApi":"9.4",
  "venueIds":["V12"], "replication":{ "state":"caught-up", "lagMs":40, "watermark":"2026-10-13T12:39:34.950Z" },
  "configVersion":88, "menuVersion":312, "time":"2026-10-13T12:39:36Z" }
```
Usable for writes only if `writable && epoch == descriptor.epoch && app==ok && db==ok && compatible API && venue matches`. Plain `GET /health` returning 200 is **not** enough [REQ §4].

## C3 — Idempotent order submit
`POST /api/orders` with header `Idempotency-Key: <key>` (or the existing field — the kiosk uses `idempotencyKey` = `IDEMP-<orderId>`).
- Same key + same payload → returns the original order (`200`, `duplicate:true`), never a second order.
- Same key + different payload → `422 IDEMPOTENCY_CONFLICT`.
- Wrong epoch / not writer → `409 STALE_EPOCH` / `503 NOT_WRITER` (**nothing committed**).
- Stale prices/arrangement → `409 PRICE_STALE` / `ARRANGEMENT_EXPIRED` (nothing committed).
- Keys stored durably ≥ 7 days **and replicated with the order** to every node that can become writer.
Response: `{ orderId, orderNo, acceptedAt, epoch, nodeId, kitchen:{ state:"QUEUED|DISPATCHED|UNCERTAIN|FAILED", jobIds:[…] } }`.

## C4 — Lookup by key (reconciliation)
`GET /api/orders/by-key/{key}`
```json
{ "found": false,
  "coverage": { "complete": false, "sources":[ { "nodeId":"V12-A", "replicatedUpTo":"2026-10-13T12:31:07.200Z" } ] } }
```
- `found:true` → returns the order (client marks CONFIRMED).
- `found:false` + `coverage.complete:true` (or `replicatedUpTo` ≥ the operation's first attempt time on that node) → proven absent → resubmit with **the same key**.
- Otherwise → **stay UNKNOWN**; no resubmit. Re-check after failback/reconciliation.

## C5 — Payment status (PSP / terminal / backend)
**[VERIFY]** the real payment architecture: local terminal SDK, cloud PSP, or a Guestit payment service. Needed:
- Start with a client-generated `paymentAttemptId` (idempotent at the PSP/backend).
- `GET status(paymentAttemptId)` → `APPROVED | DECLINED | CANCELLED | PENDING | UNKNOWN`, plus `transactionRef`.
- Callbacks/events carry `eventId` + `paymentAttemptId` + a monotonic sequence or timestamp; duplicates and out-of-order events must be safe.
- Linking a payment to an order: `POST /api/orders/{orderId}/payments` (idempotent on `paymentAttemptId`), or payment inside C3 — follow the existing contract.

## C6 — Print / KDS delivery
**[VERIFY]** today's path (POS service → printers? separate print server? KDS via WebSocket?). Needed regardless of path:
- Job created by the writer with a durable `jobId` (derived from orderId + destination + revision).
- Gateway dedupes on `jobId` (re-dispatch after a switch must not print twice).
- States per job: `QUEUED → DISPATCHED → PRINTED | UNCERTAIN | FAILED`. `UNCERTAIN` = sent but no physical confirmation; never shown to guests as "in the kitchen" [REQ §9].
- Cloud → venue over an outbound authenticated connection from the gateway (WebSocket/MQTT/long-poll).
- `GET /api/orders/{id}/kitchen` → job states, for device reconciliation.

## C7 — Data versions
- Menu/config/prices/arrangements endpoints return `version` (+ ETag). Orders send the versions they were priced with.
- `GET /api/versions?venueId=…` → `{ menuVersion, priceListVersion, configVersion, arrangementVersion }` for cheap revalidation after a switch.

## C8 — Sessions (eMenu tables, AYCE)
**[VERIFY]** the existing table-session model. Needed: `sessionId` + `sessionGeneration` (incremented on close/reopen/move). Every eMenu write carries both; the server rejects old generations with `409 SESSION_STALE`.

## C9 — Device enrollment and credentials
**[VERIFY]** existing device registration. Needed: per-device credential bound to tenant + venue; provisioning of base URLs per role (local A, local B, cloud) and control-plane public keys; rotation; revocation.

## C10 — Diagnostics (optional)
`POST /api/devices/{deviceId}/diagnostics` — periodic summary (state, active node, epoch, outbox counts per state, last failure reason). No personal or card data.
