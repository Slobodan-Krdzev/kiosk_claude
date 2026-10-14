# 07 — Connection status UI [REQ §15] (Guestit UIX guide applies)

Principles: no employee interaction in normal operation · no popups unless ordering or payment is affected · never close the cart · subtle, stable indicator (reserved space, no layout shift) · guest copy non-technical, staff detail on a diagnostics screen.

## 1. Indicator states (staff-visible; guest sees only when it affects them)
| State | Indicator (staff) | Guest-facing | When |
|---|---|---|---|
| Connected · LOCAL_PRIMARY | none / small dot | nothing | normal |
| Connected · LOCAL_SECONDARY | small "standby" dot | nothing | after failover |
| Connected · CLOUD_ACTIVE | small "cloud" dot | nothing | cloud fallback |
| Reconnecting (SUSPECT/RESOLVING/SWITCHING) | "Reconnecting…" | only if the guest tries to submit: inline note on the button area | ≤ a few seconds |
| No authority | "Unable to confirm orders" | inline message at submit (below) | no writer |

## 2. Guest copy (inline, next to the primary action — no modal)
| Key | EN | NL | MK |
|---|---|---|---|
| `conn.waitSubmit` | We're reconnecting. Your order is saved and will be sent automatically. | We maken opnieuw verbinding. Je bestelling is bewaard en wordt automatisch verstuurd. | Повторно се поврзуваме. Нарачката е зачувана и ќе се испрати автоматски. |
| `conn.noAuthority` | Orders can't be confirmed right now. Your order is saved — please ask a staff member. | Bestellingen kunnen nu niet worden bevestigd. Je bestelling is bewaard — vraag een medewerker. | Нарачките моментално не можат да се потврдат. Нарачката е зачувана — прашајте вработен. |
| `conn.confirming` | We're confirming your order with the restaurant. | We bevestigen je bestelling bij het restaurant. | Ја потврдуваме нарачката со ресторанот. |
| `conn.paidPending` | Payment received. Your order is being confirmed — no need to pay again. | Betaling ontvangen. Je bestelling wordt bevestigd — je hoeft niet opnieuw te betalen. | Плаќањето е примено. Нарачката се потврдува — не плаќајте повторно. |
| `conn.kitchenPending` | Order accepted — the kitchen is being notified. | Bestelling ontvangen — de keuken wordt op de hoogte gebracht. | Нарачката е примена — кујната се известува. |

Each message answers: what happened · consequence · what to do (UIX guide §16).

## 3. Staff diagnostics screen (behind the existing staff PIN)
Active role + node ID + epoch · last verified readiness (time, fields) · last failure reason · last switch (from → to, duration) · outbox counts per state · list of `UNKNOWN` and `PAID_ORDER_PENDING` items with order reference, age and a "check now" action (runs C4/C5; never forces a resubmit) · print/KDS jobs in `UNCERTAIN` · button "Re-resolve server" (never a free-form "use this server" unless the backend supports a signed manual override, logged with staff ID).
