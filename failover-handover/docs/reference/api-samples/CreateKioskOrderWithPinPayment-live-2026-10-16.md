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
