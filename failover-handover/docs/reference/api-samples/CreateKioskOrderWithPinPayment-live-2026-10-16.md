# Live runs of `POST CreateKioskOrderWithPinPayment` against the dev backend — 2026-10-16

Authorised by Alex ("test it live against the dev backend"). Kiosk at `http://localhost:5173/?source=api`
(menu 2408, "Tapas Mainstreet"), Chrome, the real guest flow: quick-add → cart → table 5 → pay.
Request and response bodies were not captured on the wire (the extension's fetch hook does not reach page
scripts); the status comes from Chrome's network log, the message from the kiosk's own log line `order.result`.

## Request (as built by `buildOrderPayload`, identical in both runs except `OrderGuid`)

```
POST https://kioskapi.dev.revelapps.com/api/CreateKioskOrderWithPinPayment?skip=false
Content-Type: application/json
```
```json
{
  "Order": {
    "OrderGuid": "KBX30YK-mvb8cfxs-9a86367f",
    "SessionGuid": "",
    "Items": [
      {
        "Item": { "Id": 443491, "PluCode": "", "Image": "https://kioskapi.dev.revelapps.com/Shared/Images/e7322535-d71d-49e1-b39e-cda4daea573d.png", "Name": "Dame Blanche", "Price": 6 },
        "Variants": [],
        "UpsaleCollection": [],
        "Quantity": 1,
        "ItemGuid": "",
        "CoursePosition": 0,
        "Note": ""
      }
    ]
  },
  "tableNumber": "5",
  "deviceSessionId": ""
}
```

## Responses

| Run | Sent (kiosk log) | Answered | HTTP | Body | Kiosk |
| --- | --- | --- | --- | --- | --- |
| 1 | 19:14:2x | 19:14:24 | **409** | `"Printing problem"` (a JSON string) | classified as HTTP error → outcome UNKNOWN ("no answer from the terminal", check status) |
| 2 | 19:16:47 (`connecting` → `waiting-for-card`) | 19:16:48 | **409** | `"Printing problem"` | same; `order.result … "message":"order: HTTP 409 Printing problem"` |

Observations:

- The documented shape `{ IsSuccess: false, ResponseMessage: "Printing problem" }` is **not** what the backend
  sends: the message is the body of a **409**. The old kiosk never noticed because it converted every non-2xx
  into `{ IsSuccess: false, ResponseMessage: <body> }` first. The kiosk's `classify()` now does the same.
- The answer came back **about one second** after the request. A PIN payment cannot complete in that time, so on
  this backend "Printing problem" is produced **before** any terminal contact — most likely a printer check that
  fails because the dev environment has no printer. Therefore "Printing problem" without an order number is
  treated as outcome UNKNOWN, never as paid, until the backend owner confirms the state of the payment at that
  answer (order-payment-integration.md question 2).
- No terminal was reached and no order number was returned in either run. The success and the `Aborted` paths
  therefore remain `NOT_VERIFIED_ON_REAL_INFRA`.
- The old kiosk's way forward here was the "continue without printing?" modal → the same order again with
  `?skip=true`. Whether that may ever charge twice depends on B4 (de-duplication on `OrderGuid`). Not implemented;
  decision requested from Alex.
- Side finding: a payment record left by the *simulated* terminal from an earlier session was restored at boot
  and, with the API adapter's `status()` answering unknown, correctly ended on the assistance screen (B7 in action).

Stale records were removed from the browser's storage after the runs (dev machine only).

## Later runs the same evening (resend with `skip=true`, Alex: "build the resend with skip=true like the old kiosk")

The kiosk now logs the raw body of every answer (`order.result … raw`). Exact bytes seen:

| Run (kiosk clock) | Request | HTTP | Raw body | Δt |
| --- | --- | --- | --- | --- |
| 20:08:01, 20:08:28, 20:10:50 | `?skip=false` | 409 | `"Printing problem"` — char codes `34,80,114,105,110,116,105,110,103,**160**,112,114,111,98,108,101,109,34`: a **NO-BREAK SPACE (U+00A0)** between the words, not a space | ~1 s |
| 20:12:47 | `?skip=false` | 409 | same | ~1 s |
| 20:12:58 (after "Doorgaan zonder bon") | `?skip=true`, same body, same `OrderGuid` | 200 | `{"ResponseMessage":null,"StatusCode":200,"PopupResponseMessage":false,"IsSuccess":true,"Data":null}` | ~1 s |
| 20:15:44 / 20:15:45 | `?skip=false` → `?skip=true` | 409 → 200 | same two bodies | ~1 s each |
| 20:17:02 / 20:17:03 | `?skip=false` → `?skip=true` | 409 → 200 | same; kiosk reached the thank-you screen | ~1 s each |

Findings:

- **The message contains U+00A0.** `classify()` collapses all whitespace before matching; without that the kiosk
  never recognised "Printing problem" (runs 2–4 above landed on "no answer from the terminal").
- **Success is `IsSuccess: true` with `Data: null`.** No `AdditionalData` (order number) and no `IdOrder`,
  contrary to the handover document. The kiosk shows its own short reference (last 6 characters of its order
  id, e.g. `C3497F`) as the order number and says the receipt was not printed. Whether the backend stored an
  order at all is an open question (BACKEND-DEPENDENCIES B9).
- **Both answers arrive in about one second.** No terminal was involved in any run: the dev backend either has
  no terminal and approves immediately, or a simulator auto-approves. The terminal-driven paths
  (waiting at the terminal, `Aborted` after `abortRequest`, a declined card) remain unexercised.
- The "continue without receipt?" dialog needed one UI change: confirm dialogs are suppressed during an active
  payment; this one is now allowed through (`Overlays.tsx`).

Final run, kiosk screen: "Bedankt! Eet smakelijk · Pieper 55 · Jouw bestelnummer C3497F · ✓ Betaling geslaagd ·
✓ Bestelling geaccepteerd · ⚠ Bon kon niet worden geprint — toon je nummer aan de balie".
