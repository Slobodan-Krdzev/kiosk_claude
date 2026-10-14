# ADR 0002 — Durable outbox and idempotency keys on every device

**Status:** Accepted (brief §7) · 2026-10-13

## Decision
- Every transactional operation (order, order addition, payment link, voucher/loyalty commit, session close) is written to a **Room outbox** with its **idempotency key** *before* the first network attempt.
- The key is generated once (UUID v4/v7; the existing kiosk format `IDEMP-<orderId>` stays valid) and never changes — not on retry, node switch, app restart, cloud failover or failback.
- The server stores keys durably (≥ 7 days) **and replicates them together with the order**, so any node that can become writer recognises an already-committed key.
- `UNKNOWN` (sent, no answer) is a real state. Retrying on another node first requires a **lookup by key** whose answer states its replication coverage (`02-contracts.md` C4). With insufficient coverage the operation stays `UNKNOWN` and is visible to staff.

## Consequences
- No duplicate kitchen order after a lost acknowledgement — *provided* the server deduplicates by key (verify in the audit; otherwise BLOCKED).
- The outbox is bounded (`03-kotlin-core-design.md` §7) and survives process death and reboot.
