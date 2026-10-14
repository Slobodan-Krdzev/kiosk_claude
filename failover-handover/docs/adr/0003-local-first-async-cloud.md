# ADR 0003 — Local-first; cloud replication is asynchronous unless proven otherwise

**Status:** Accepted as the starting assumption (brief §11) · 2026-10-13 · re-assess after the audit

## Decision
- Normal operation is local (LOCAL_PRIMARY), including during a WAN outage. Local latency and offline operation must not get worse.
- Until the audit proves otherwise we assume local → cloud replication is **asynchronous**: the cloud may be **behind** on transactions already acknowledged locally.
- CLOUD_ACTIVE may accept writes only when the backend explicitly authorises it (new epoch) and the control plane knows the replication watermark. In that window the cloud must not silently confirm operations that depend on possibly missing local state (e.g. a table bill that may be incomplete).
- Device-side journals (outbox) cover operations started by devices. POS-side operations on a lost node are reconciled at failback.
- Synchronous cloud durability is **not** introduced without measuring local latency and WAN-outage behaviour (decision for Alex).

## Consequences
- Recovery-point guarantees are stated per category (`01-architecture.md` §6), never as "zero data loss".
