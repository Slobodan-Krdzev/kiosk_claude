<!-- Source: "Kiosk Payment Flow.md" handed over by Alex (Guestit) on 2026-10-16; the old kiosk app is the source of truth for the API contract. Copied verbatim below. -->

# Kiosk Payment Flow

Oct 16, 2026 · @Aleksander Dolstra

## Overview

Payment is one blocking POST. The kiosk sends the full order to `CreateKioskOrderWithPinPayment`. The backend starts the CCV PIN terminal and waits for the customer to pay. It then creates the order, prints the receipt and answers with the order number. The kiosk never talks to the terminal itself and never polls for payment status. Everything it shows depends on that one response.

| Piece | Where | Role |
| --- | --- | --- |
| Payload builder | `Components/View/Checkout/Checkout.tsx` → `formulateMealsForPostRequest` | Turns the cart into `Items[]` |
| Order POST | `Query/SendOrder.ts` → `SendOrder` + `useSendOrder` (React Query `useMutation`) | Sends the order, routes on the response |
| Payment screen | `Components/View/Payment/Payment.tsx` | “Pay at the terminal” screen, Back, Cancel, the “continue without printing” modal |
| Abort | `Contexts/OrderContext/OrderContextProvider.tsx` → `abortPayment` / `abortRequest` | Asks the backend to cancel the terminal transaction |
| Success screen | `Components/View/Finish/Finish.tsx` | Shows the order number, 15 s auto-reset |
| Thank-you screen | `Components/View/Confirmation/Confirmation.tsx` | 5 s, then back to start |
| Error screen | `Components/View/PaymentError/PaymentError.tsx` | Exists and is rendered for step `paymentErr`, but no live code sends the kiosk there |

## Flow

&#91;embedded content: payment flow · one POST, four outcomes\]

The red box is the gap. Any response other than success, “Aborted” or “Printing problem” leaves the customer on the Payment screen.

1. **Checkout.** Tapping Pay builds the payload, fires the POST with `skip=false` and switches to the Payment screen at once, without waiting for the response.
2. **Payment screen.** The POST stays open while the backend runs the CCV terminal. The customer pays at the PIN device, or taps Back or Cancel, which call `abortRequest`.
3. **Response.** `useSendOrder.onSuccess` routes on `IsSuccess` and `ResponseMessage` (see the API section).
4. **Finish.** Shows `Data.AdditionalData` as the order number. Tapping Finish, or waiting 15 s, goes to Confirmation and clears the cart.
5. **Confirmation.** Shows a thank-you for 5 s, then returns to Start.

## API: CreateKioskOrderWithPinPayment

`POST {kioskConfig.api}/CreateKioskOrderWithPinPayment?skip=false|true` with `Content-Type: application/json`. No auth header and no fetch timeout are set. The request stays open for as long as the customer takes at the terminal.

| Query param | Sent from | Meaning |
| --- | --- | --- |
| `skip=false` | Checkout “Pay” button | Normal order: charge and print |
| `skip=true` | Payment screen “continue without printing” → Yes | Re-send the same order without printing the receipt |

### Request body (`Types/SendOrderTypes.ts`)

```json
{
  "Order": {
    "OrderGuid": "",
    "SessionGuid": "",
    "Items": [
      {
        "Item": { "Id": 123, "PluCode": "", "Image": "<SmallPictureUrl>", "Name": "Poke bowl", "Price": 12.5 },
        "Variants": [],
        "UpsaleCollection": [
          { "UpsaleStepOptionModel": { "ProductId": 456, "Name": "Extra avocado", "Price": 1.5 }, "Quantity": 1 }
        ],
        "Quantity": 2,
        "ItemGuid": "",
        "CoursePosition": 0,
        "Note": "no onion"
      }
    ]
  },
  "tableNumber": "9",
  "deviceSessionId": ""
}
```

| Field | Source | Notes |
| --- | --- | --- |
| `Item.Id` | `product.ProductId` |  |
| `Item.Price` | `product.Price` from the startup menu | Unit price, base product only. The client does not send a total. |
| `Item.Image` | `product.SmallPictureUrl` |  |
| `UpsaleCollection[]` | Every option picked in every upsale step, flattened | `ProductId`, `Name`, `Price`, `Quantity` per option |
| `Quantity` | Cart line quantity |  |
| `Note` | Per-item note |  |
| `Variants`, `PluCode`, `ItemGuid`, `OrderGuid`, `SessionGuid`, `deviceSessionId` | Hard-coded empty |  |
| `CoursePosition` | Hard-coded `0` |  |
| `tableNumber` | Hard-coded `"9"` | Same for every kiosk |

Not sent: the order-level note typed at checkout, and Dine In / Takeaway.

### Response handling (`useSendOrder`)

| Response | Kiosk does |
| --- | --- |
| `IsSuccess: true` | Stores `Data.AdditionalData` as the order number and `Data.IdOrder`, then goes to **Finish** |
| `IsSuccess: false`, `ResponseMessage: "Aborted"` | Back to **Order** (cart kept) |
| `IsSuccess: false`, `ResponseMessage: "Printing problem"` | Shows the “continue without printing?” modal on the Payment screen |
| `IsSuccess: false`, any other message | Logs it and stays on the Payment screen. The `paymentErr` step change is commented out. |
| HTTP error (non-2xx) | Turned into `{ IsSuccess: false, ResponseMessage: <error body> }`, so it falls into the row above: stays on Payment |
| Network failure / exception | `onError` logs it and stays on Payment |

## Cancel, abort and timeouts

Cancelling is a separate GET to the backend; the open order POST then comes back with `ResponseMessage: "Aborted"`.

| Action on the Payment screen | Calls | Then |
| --- | --- | --- |
| Back (chevron) | `abortPayment()` → `GET {api}/abortRequest` | Goes straight to **Order**, cart kept |
| Cancel order → Yes | `abortPayment()` | Goes to **Order**, cart kept (the `cancelOrder()` call that would empty the cart is commented out) |
| Cancel order → Back | Nothing | Closes the modal |
| Printing problem → Yes | Re-sends the whole order with `skip=true` | Same response handling as the first send |
| Printing problem → No | `abortPayment()` | Goes to **Order** |

- `abortRequest` takes no parameters, so the backend must know which terminal and transaction to cancel on its own. The kiosk does not wait for its result before leaving the screen.
- A non-2xx answer from `abortRequest` throws, and nothing catches it.

### Timers

| Timer | Where | Length | Effect |
| --- | --- | --- | --- |
| Inactivity overlay | `App.tsx` | 1,000,000 ms (about 16.7 min) | Shows the countdown overlay on any step except Start |
| Finish auto-reset | `Finish.tsx` → `Counter start={15}` | 15 s | Back to Start, cart and upsale cleared |
| Confirmation auto-reset | `Confirmation.tsx` → `Counter start={5}` | 5 s | Back to Start, cart and upsale cleared |
| Payment request | `SendOrder.ts` | none | The fetch waits as long as the backend keeps it open |

### Dead code

- **`CheckKioskPayment` poll** (`Payment.tsx`). It runs every 10 s only when `orderReferenceData.reference` is set. Nothing sets it in the current flow, so it never fires. Its URL is also missing a `/` (`…/apiCheckKioskPayment`). It is left over from the old QR payment flow.
- **Receipt e-mail** (`Finish.tsx` → `sendEmailForReceipt`). It posts to the LAN address `http://192.168.1.129:9988/api/sendkioskbillonemail`. The e-mail input is commented out, so it returns early every time.

## Test mode and config

In test mode (`?testMode=true`), Checkout goes to the Payment screen without sending the order. Nothing ever moves it forward from there, so the tester has to press Back or Cancel. That still calls the real `abortRequest`. The Finish screen shows order number `1` in test mode, but test mode never reaches it.

| Setting | Value | Where |
| --- | --- | --- |
| API base | `window.kioskConfig.api` = `https://kioskapi.dev.revelapps.com/api` | `config.js (project root)` |
| Test mode flag | `?testMode=true` in the URL, read once at startup | `StepContextProvider.tsx` |
| Table number | `"9"` | `Checkout.tsx`, `Payment.tsx` |

## Known issues and recommendations

The main risk is a customer stuck on the Payment screen with no message. Any failure except “Aborted” or “Printing problem” leaves them there.

| # | Issue | Impact | Recommendation |
| --- | --- | --- | --- |
| 1 | Unknown errors, HTTP errors and network failures stay on Payment | Customer sees “pay at terminal” forever, until the 16.7 min overlay | Route them to `paymentErr` (re-enable the commented line, and add it to `onError`) |
| 2 | Printing problem → No calls `abortRequest` after the payment may already have gone through | Possible charge with no order | Confirm with the backend what state the payment is in at “Printing problem” |
| 3 | Printing problem → Yes re-sends the full order, and `OrderGuid` is empty | The backend cannot tell it is a retry, so there is a risk of a duplicate order or charge | Send a stable `OrderGuid` per order; the backend should de-duplicate on it |
| 4 | No timeout on the order POST | A hung backend means a hung kiosk | Add an `AbortController` timeout, then abort and show an error |
| 5 | Order-level note and Dine In / Takeaway are never sent | Kitchen loses that information | Add them to the payload once the API supports the fields |
| 6 | `tableNumber` is hard-coded to `"9"` | All kiosks look the same to the backend | Move it to `config.js` per device |
| 7 | Prices come from the client | The backend must not trust them | Backend should re-price from its own data (see Kiosk Checks) |
| 8 | Test mode stops on the Payment screen and still calls the real `abortRequest` | Testers cannot see Finish | Fake a success response in test mode |
| 9 | Dead `CheckKioskPayment` poll and LAN e-mail POST | Confusing to read | Remove both |

Open question: which terminal and transaction does `abortRequest` cancel when several kiosks share one backend?
