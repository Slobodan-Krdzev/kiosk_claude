# ADR 0001 — The backend owns write authority; devices follow signed routing

**Status:** Accepted (brief §2, §5) · 2026-10-13

## Context
POS, eMenu and kiosk must always write to one logical active writer per ordering domain (venue). A device only sees part of the network: a kiosk that cannot reach LOCAL_PRIMARY cannot tell whether the primary is down or its own Wi-Fi is. If devices chose a writer, two groups of devices could write to two nodes (split brain).

## Decision
- A backend **control plane** decides the active writer and publishes a **routing descriptor**: venue, domain, active writer (node ID, role, base URLs), **authority epoch** (monotonic 64-bit), lease expiry, signature.
- Nodes **fence** themselves: a node accepts writes only while it holds a valid lease for the current epoch, and rejects requests carrying an older epoch.
- Devices **never promote**. They fetch the descriptor from any reachable node or the cloud, verify the signature, accept only an epoch ≥ the known one, and send their epoch with every write.
- Leader election lives in the backend (e.g. a witness/arbiter so LOCAL_PRIMARY, LOCAL_SECONDARY and CLOUD form a quorum). The concrete mechanism is decided by the backend team after the audit.

## Consequences
- If the control plane does not exist, automatic failover is **BLOCKED**: clients still implement detection, preservation, outbox and status UI, but stay in `DEGRADED / NO_AUTHORITY` instead of switching on their own.
- Failback is always a backend decision (a new epoch), never "the primary answers again".
