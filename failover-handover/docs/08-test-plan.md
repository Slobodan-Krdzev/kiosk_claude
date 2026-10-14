# 08 — Test plan: fault injection and evidence [REQ §16]

## 1. Test levels
| Level | What it proves | Counts as failover evidence? |
|---|---|---|
| Unit (JVM) | State machine, descriptor validation, outbox transitions, hysteresis maths | **No** |
| Instrumented (device/emulator + MockWebServer) | Room persistence across process death, interceptor switching, UI does not reset | **No** (only client behaviour) |
| **Lab integration with real nodes** | Real routing, authority, fencing, durability, reconciliation, kitchen delivery | **Yes** |

## 2. Lab setup (build in Phase 9; adapt to the real stack)
- Real POS 9.4.1 backend as **LOCAL_PRIMARY (A)**, **LOCAL_SECONDARY (B)** and **CLOUD (C)** — containers or VMs, each with its own DB and the real replication between them **[VERIFY]**.
- Control plane / witness (real, or BLOCKED).
- Print/KDS gateway + at least one network printer (or the vendor's printer emulator) + one KDS screen.
- Devices: ≥ 2 eMenu tablets (one 2 GB reference), ≥ 2 kiosks (or emulators for scale), 1 POS terminal.
- Fault injection: **Toxiproxy** between devices and each node (latency, timeout, reset), `iptables`/`tc` for partitions, `docker stop/kill` / `systemctl stop` for node death, DB stop for "app up, DB down", clock skew via `faketime`, WAN cut by blocking the cloud route.
- Payment: real terminal in test mode or the PSP sandbox — never a client-side stub for evidence.
- Evidence collection per run: device logs (structured), outbox DB dump (`adb shell run-as … sqlite3`), server order table count per key, payment provider report, print-gateway job log, screenshots/video of guest screens, timestamps.

## 3. The 20 required scenarios
Each scenario: **Setup → Fault → Expected → Evidence**. Status: PASS / FAIL / BLOCKED (with the blocking dependency).

| # | Scenario | Fault injection | Expected result | Evidence |
|---|---|---|---|---|
| 1 | Primary fails, synchronised standby healthy | Kill A app+DB during browsing and during a submit | Devices switch to B (new epoch) within target; cart intact; in-flight order confirmed once | Descriptor epochs, order count per key = 1, detection/switch times |
| 2 | Both local nodes down, cloud eligible | Kill A and B | Control plane authorises C; devices switch; orders accepted with coverage rules | Epochs, coverage values, orders in C |
| 3 | Primary returns during active cloud orders | Restart A while orders flow to C | A stays fenced until synced; controlled handover; no lost/duplicated orders; no switch mid-payment | A readiness `writable=false` until new epoch; counts |
| 4 | WAN failure, local healthy | Cut cloud route | No switch; ordering continues locally; cloud sync resumes later | State stays Connected(LOCAL_PRIMARY) |
| 5 | All endpoints unavailable | Kill A, B, block C | `NoAuthority`; carts kept; no confirmations; queued orders sent after recovery, once | Outbox states, UI screenshots |
| 6 | Ack lost after commit | Toxiproxy drops the response of POST /orders | Outbox `UNKNOWN` → lookup → `CONFIRMED`; no second order | Server count per key = 1 |
| 7 | Duplicate retries after failover | Lost ack on A, then failover to B | Lookup on B finds the order (or proves absence) → exactly one order | Count per key = 1 across A/B/C after reconciliation |
| 8 | Payment completes during primary failure | Kill A right after terminal approval | `PAID_ORDER_PENDING` → order submitted on B with the same key; one charge | PSP report: 1 charge; 1 order |
| 9 | Delayed / duplicate payment callback | Replay callback twice, out of order | Applied once; no state regression | Event log, final state |
| 10 | Server change during AYCE | Failover between rounds and during a round submit | Round counters correct; no extra/lost round | Session data on writer |
| 11 | Kiosk checkout interrupted | Failover during card wait / processing / submitting | No double charge; order once; correct screen | PSP + order counts, video |
| 12 | eMenu cart after app restart | Force-stop app with cart + pending order | Cart restored; pending order reconciles | Room dump before/after |
| 13 | Stale server tries to write | Restore old A with old epoch, point a device at it | Writes rejected (`STALE_EPOCH`); device re-resolves | Server logs, device log |
| 14 | Cloud and local both claim authority | Partition A from control plane while A still alive | A's lease expires → A fences before C/B gets a lease; devices accept only the higher signed epoch | Lease timestamps, rejected writes |
| 15 | Cloud order reaches correct kitchen | Order on C with products routed to 2 stations | Tickets on the correct printers/KDS in the venue via the gateway | Gateway log, physical tickets |
| 16 | Duplicate / ambiguous print ack | Drop gateway ack, then switch writer | Job deduped by `jobId`; if unknowable → `UNCERTAIN` shown to staff; no auto reprint | Gateway log, KDS/POS view |
| 17 | Cloud replica behind | Stop replication, create orders on A, kill A+B | C refuses to confirm dependent state without coverage; device orders stay `UNKNOWN` where unprovable | Coverage values, UI |
| 18 | Venue config change during failover | Change prices/menu on the writer during the switch | Version mismatch → re-price + guest confirmation; no order with stale prices | `PRICE_STALE` responses |
| 19 | Rapid repeated interruptions | Flap A every 2–5 s for 5 min | Hysteresis: bounded switching; no duplicates; no memory growth | Switch count, heap graph |
| 20 | Many devices fail over at once | 20+ devices (mix real/emulated) during A kill | All converge on the same writer/epoch; no thundering herd (jitter) | Per-device epoch timeline |

## 4. Additional checks
- Process death at every outbox transition (kill between persist and send, between send and response).
- Clock skew ±2 min on a device and on a node (leases must use server time).
- Security: forged descriptor (bad signature), descriptor for another venue, lower epoch replay, plain HTTP endpoint → all rejected.
- Performance on the 2 GB reference device: memory overhead, CPU of the monitor, time-to-detect, time-to-switch, frame drops during a switch.

## 5. Reporting
Fill `templates/TEST-MATRIX.csv` per run: scenario, app(s), build/commit, date, status, evidence links, notes. A scenario that depends on a missing backend capability is **BLOCKED** with the dependency ID from `09-backend-dependencies.md` — never PASS on mocks.
