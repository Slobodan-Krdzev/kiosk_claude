# Production-readiness assessment

**Verdict:** NOT READY / READY FOR PILOT (venue …) / READY — one sentence why.

## Acceptance criteria (brief §18)
| Criterion | Status | Evidence |
|---|---|---|
| Both apps use the same verified failover contract as POS | | |
| Automatic switching between authorised endpoints | | |
| Local operation remains the normal mode | | |
| Carts and guest sessions survive transitions | | |
| No duplicate orders after a lost acknowledgement | | |
| No double charge because of failover | | |
| Cloud-confirmed orders reach the correct kitchen, or a safe failure state is shown | | |
| No obsolete server can accept conflicting writes | | |
| Failback controlled and reconciled | | |
| No ordering/loyalty/promotion/arrangement feature lost | | |
| Android builds pass | | |
| Physical-device performance measured (or reported unverified) | | |
| All safety-critical fault scenarios tested | | |

## Recovery-point guarantees (actual numbers)
## Open backend dependencies (from docs/09)
## Known risks and mitigations
## Rollout and rollback plan (feature flag, pilot venue, monitoring)
