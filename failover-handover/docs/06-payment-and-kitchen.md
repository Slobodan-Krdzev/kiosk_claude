# 06 — Payment continuity, printing and KDS

## 1. Payment rules [REQ §8]
1. Payment transport (terminal SDK / PSP) is **separate** from ordering routing. A server switch never touches an ongoing terminal transaction.
2. `paymentAttemptId` is created and **persisted before** the terminal/PSP call; the same ID is used for every status check and retry of that attempt.
3. **Never auto-start a second charge** after `UNKNOWN`/timeout. Resolve via status lookup (C5); only an explicit `DECLINED`/`CANCELLED`/`NOT_CHARGED` allows a new attempt (new ID).
4. Callbacks/events: dedupe on `eventId`; ignore transitions that go backwards (e.g. `PENDING` after `APPROVED`); an approval is applied exactly once per attempt (v36 rule `FINALIZED`).
5. Keep `transactionRef` and terminal references; never store PAN/track/CVV or other cardholder data.
6. **Paid, order not confirmed** → `PAID_ORDER_PENDING` (durable; survives restart): resubmit the order with the original key when authority returns (C4 rules); staff see it in diagnostics with the reference; the guest sees "Payment received — your order is being confirmed" (never "failed", never a second payment prompt).
7. PSP unreachable → the payment is not completed; the guest is told no payment was taken (only if the provider confirms that) or that staff will check (if unknown).
8. A success screen requires **both** payment `APPROVED` and order `CONFIRMED`.

## 2. Order ↔ payment consistency across switches
| Situation | Outcome |
|---|---|
| Payment approved, order submit timed out on A, A dies | Order `UNKNOWN` → after the switch, lookup on B/cloud (C4) → found = done; proven absent = resubmit same key; not provable = `PAID_ORDER_PENDING` + staff |
| Payment approved, order confirmed, link-payment call lost | Outbox `PAYMENT_LINK` (idempotent on `paymentAttemptId`) |
| Duplicate PSP callback after the switch | Deduped by `eventId` / `paymentAttemptId` at device and server |
| Guest abandons during switch | Inactivity never clears uncertain payments (v36) |

## 3. Printing and KDS [REQ §9]
- **Audit first:** where do jobs originate (POS service, print server, KDS service), how are routing rules stored (product → printer/station), how is a ticket acknowledged?
- Required properties (C6): durable `jobId`; dedupe at the gateway; explicit `UNCERTAIN`; the writer node (local A/B or cloud) creates jobs; the on-prem gateway executes them; cloud → venue via an outbound authenticated channel; local-secondary can take over print routing.
- **Physical uncertainty:** "no ack" does not mean "not printed". On re-dispatch after a switch the gateway must recognise the `jobId`; if it cannot know whether paper came out, mark `UNCERTAIN` and show it on KDS/POS for staff ("check whether order 1234 was printed — reprint?"). No automatic reprint of `UNCERTAIN` jobs.
- **Guest messaging:** the device shows "Order accepted" on `CONFIRMED`. "Your order is being prepared" only when kitchen state is `DISPATCHED`/`PRINTED`; otherwise "Order accepted — the kitchen is being notified" (qualified) [REQ §9: no unqualified kitchen-delivery state without a verified path].
- **Pager / table sign (v35–v36):** the order tag travels with the order; the pager trigger on "ready" and the table-sign display on the POS floor plan are backend/KDS features (`docs/reference/kiosk-backend-requirements-v36.md` §5a–5b) and must work on whichever node is writer.
