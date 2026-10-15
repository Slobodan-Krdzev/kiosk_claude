# Kiosk API Documentation

Oct 14, 2026 · @Aleksander Dolstra

## Overview

The Kiosk is a React 18 + Vite + TypeScript single-page app (`Kiosk/src`) that talks to **two backends**: one GET that loads the whole menu and theme on startup, and a small set of calls to the local kiosk API for stock checks, order creation with PIN payment, payment polling and abort. There is no authentication, no token and no API key anywhere in the app; every call is a plain `fetch` with no headers except `Content-Type` on the POST.

| Setting | Where it lives | Value / behaviour |
| --- | --- | --- |
| Base URL (production) | `config.js`, loaded by `index.html` as `window.kioskConfig.api` | `https://kioskapi.dev.revelapps.com/api` (a dev host, hard-coded; no `.env` in the repo) |
| Base URL (test mode) | `src/Query/Get.ts` | `https://my.tabletmenukaart.nl/service/kioskTestModeResources?menu=<menuId>` |
| `?testMode=true` URL param | `StepContextProvider` | Switches the menu GET to the test endpoint, skips every stock check (always available), skips the order POST, and shows order number `1` on the finish screen |
| `?menuId=<n>` URL param | `Get.ts`, `DataContextProvider` | Menu number for the test endpoint (default 2408). Menu 2490 ("Dadawan") swaps the theme text colours |
| Receipt e-mail endpoint | `Finish.tsx` | Hard-coded LAN address `http://192.168.1.129:9988/api/sendkioskbillonemail` |
| HTTP client | `@tanstack/react-query` v5 over native `fetch` | One `useQuery` for the menu, `useMutation` for stock check and order POST, raw `fetch` for abort, payment poll and receipt e-mail |

**Where the API code sits.** All calls are in four places: `src/Query/Get.ts` (menu), `src/Query/CheckAvailability.ts` (stock), `src/Query/SendOrder.ts` (order + payment), and inline fetches in `OrderContextProvider.tsx` (abort), `Payment.tsx` (payment poll) and `Finish.tsx` (receipt e-mail). The response is held in React context (`DataContext`) and every screen reads from there; nothing is refetched after startup.

**Screen flow.** `StepContext.step` drives which view renders: start → lang (actually the Dine In / Takeaway chooser) → order → checkout → payment → finnish → confirmation → start. `paymentErr` and `outOfService` are side exits. The upsale wizard opens as a slide-up modal on the order screen rather than as its own step.

## Endpoint inventory

Seven HTTP calls exist in the code. Six are live; the receipt e-mail call is wired to a dead-code button path. `{api}` means `window.kioskConfig.api`.

| # | Method | URL | Called from | When | Response used |
| --- | --- | --- | --- | --- | --- |
| 1 | GET | `{api}/getfullresources` | `Query/Get.ts` via `useQuery(['data'])` in `DataContextProvider` | Once at app start. Shows `Loading` while pending, `PaymentError` screen on failure. Never refetched. | Whole `RootData` object: `ThemeResponse`, `TMKData[]`, `Settings` |
| 1b | GET | `https://my.tabletmenukaart.nl/service/kioskTestModeResources?menu={menuId}` | same | Replaces #1 when `?testMode=true` | Same shape as #1 |
| 2 | GET | `{api}/checkProductAvailable?idProduct={ProductId}` | `Query/CheckAvailability.ts` via `useMutation` in `MealCard` and `MealInfo` | Every tap on a product card, on the info button, and on the add button in the detail sheet. Skipped in test mode. | Bare boolean. `false` hides the card and shows a SweetAlert "Out Of Stock" |
| 3 | POST | `{api}/CreateKioskOrderWithPinPayment?skip=false` | `Query/SendOrder.ts` via `useSendOrder()` in `Checkout` | Tap Next on checkout (not in test mode). Starts the PIN terminal payment and prints. | `IsSuccess`, `ResponseMessage`, `Data.AdditionalData` (order number), `Data.IdOrder` |
| 3b | POST | `{api}/CreateKioskOrderWithPinPayment?skip=true` | same, from `Payment` | Tap Yes in the "continue without printing?" modal after a `Printing problem` response | Same as #3 |
| 4 | GET | `{api}/abortRequest` | `OrderContextProvider.abortRequest` | Back arrow or Cancel → Yes on the payment screen | Ignored (only awaited) |
| 5 | GET | `{api}CheckKioskPayment?reference={reference}` | `Payment.tsx` `checkAvailability` polled every 10 s | Only while `orderReferenceData.reference` is set. **Never fires today**: the reference is no longer stored (see Payments). Note the missing `/` before the path. | `Message`, `IsSuccess`, `Data.AdditionalData`, `Data.IdOrder` |
| 6 | POST | `http://192.168.1.129:9988/api/sendkioskbillonemail` | `Finish.tsx` `sendEmailForReceipt` | Tap Finish, but only if the e-mail input has a value. The input is commented out, so this never sends. | Logged only |

**Non-API network traffic.** Country flag SVGs are loaded from `purecatamphetamine.github.io` (plain `http`), fonts from Google Fonts, cdnfonts, onlinewebfonts and fontapi.ir, and all product, option, cover and logo images come from the URLs inside the menu response. A custom `public/service-worker.js` is registered that deletes every cache on activate and passes all fetches straight to the network with cache as fallback, so nothing from the API is cached offline.

## Data flow: what renders from what

Everything on screen comes from the single `getfullresources` response, reshaped once in `DataContextProvider`. The app uses a small slice of what the API returns.

**How the response is reduced.** `TMKData` is an array with one entry per language. The provider picks the entry whose `Language` matches the current i18n language (from `localStorage.i18nextLng`, default `nl`), else the first one. From that entry it takes **only `MainCategories[0]`**; its `SubCategories` become the left-hand category rail and all their `Products` are flattened into `allProducts`. Theme colours come from that same main category (`BackgroundColor`, `TextColor`, `TextColorActive`). Other main categories, `Agendas`, `ServiceCalls`, `Screensaver`, `AdditionalItems` and `Settings` are typed but never read.

| Screen / component | Response fields rendered | Notes |
| --- | --- | --- |
| Start screen | `ThemeResponse.CoverImage.Url` (top background), `ThemeResponse.RestaurantName` (logo alt text only), `ThemeResponse.LanguagesList[].Locale` (flag buttons) | Logo image, headline "Worldly Food, Small Town Prices" and art are static files in `public/`, not from the API |
| Dine In / Takeaway chooser (`ChooseLang`) | `CoverImage.Url`, `RestaurantName` | Choice is kept in `StepContext.finalInfo.orderType` and **is not sent to the API** |
| Order screen, category rail | `SubCategories[].SubCategoryId`, `.Name` | Icon is a static egg SVG; colours are hard-coded, not the `SubcategoryHeaderBackgroundColor` fields |
| Order screen, promo banner | Shown only if any product has `IsPromotion === true` | The slides themselves are the hard-coded `dummyPromotions` array in `Order.tsx`, not API data |
| Product card (`MealCard`) | `Product.Name`, `.Price`, `.SmallPictureUrl`, `.OutOfStock`, `.HasUpsaleCollection`, `.UpsaleCollectionId`, `.NoInteraction` | Cards with `OutOfStock === true` are filtered out before render. A live `checkProductAvailable` result of `false` also removes the card |
| Product detail sheet (`MealInfo`) | `ProductDetails.ProductPictureUrl` (fallback `SmallPictureUrl`, then `ThemeResponse.LogoImage.Url`), `Name`, `Price`, `ProductDetails.MenuItems[Name=="Description"].HtmlContent` (rendered with `dangerouslySetInnerHTML`), `MenuItems[Name=="Allergens"].AllergensScreen.Allergens[]` (`AllergenTypeId`, `IsActive`) | The four badges Pregnancy / Vegan / Spicy / Vegetarian are rendered unconditionally (`{true && ...}`) and ignore `IsSpicy`, `IsVegan`, `IsVegetarian`, `IsPregnancyNotSuitable` |
| Upsale wizard (`Upsale`, Dual/Multi option) | `tmkData.UpsaleColletions[Id == product.UpsaleCollectionId]` → `UpsaleSteps[step]` `.Name`, `.MinSelection`, `.MaxSelection`, `Options[]` `.Id`, `.ProductId`, `.Name`, `.Price`, `.PictureUrl`, `.MaxSelection`, `.Finish` | Dual layout when a step has 2 or fewer options, otherwise Multi. `Finish === true` on a selected option ends the wizard early. `NextStepId` / `OverrideNextStepId` are not used; steps always advance by +1. Context is fixed at 5 step slots |
| Price display (`PricePreviewer`, `BottomOrderInfo`, option selectors) | `ThemeResponse.CurrencySettings.CurrencySymbol` | `ShowCurrency` and `ShowPrice` are ignored |
| Checkout card | Cart item: `product.Name`, `product.SmallPictureUrl` or first upsale option `PictureUrl`, computed `totalPrice`, `quantity`, `note`, upsale option `Name` + `Price` | Totals are computed client-side: `product.Price + Σ(option.Price × qty)` per item, times item quantity |
| Finish screen | `orderNum` = `Data.AdditionalData` from the order POST | Shows `1` in test mode. QR image is a static placeholder |
| Out-of-service screen | `CoverImage.Url` | No step ever navigates here today |
| Payment error screen | none | Also used as the fallback when the menu GET fails |

**Order type and notes stay local.** Dine In / Takeaway, the order-level note and the `tableNumber` are held in context; only the per-item `Note` makes it into the POST payload.

## Write operations

The app has one real write: the order POST. The payload is built by `formulateMealsForPostRequest` in `Checkout.tsx` from the cart in `OrderContext.orders`.

**POST `{api}/CreateKioskOrderWithPinPayment?skip=false|true`** with header `Content-Type: application/json`.

```json
{
  "Order": {
    "OrderGuid": "",
    "SessionGuid": "",
    "Items": [
      {
        "Item": {
          "Id": 1234,
          "PluCode": "",
          "Image": "<Product.SmallPictureUrl>",
          "Name": "<Product.Name>",
          "Price": 9.5
        },
        "Variants": [],
        "UpsaleCollection": [
          {
            "UpsaleStepOptionModel": {
              "ProductId": 5678,
              "Name": "<Option.Name>",
              "Price": 1.5
            },
            "Quantity": 1
          }
        ],
        "Quantity": 2,
        "ItemGuid": "",
        "CoursePosition": 0,
        "Note": "<per-item note or empty>"
      }
    ]
  },
  "tableNumber": "9",
  "deviceSessionId": ""
}
```

| Field | Source in the app | Remark |
| --- | --- | --- |
| `Item.Id` | `Product.ProductId` |  |
| `Item.PluCode` | always `""` | `Product.IdOtherPos` exists in the response but is not mapped |
| `Item.Price` | `Product.Price` | Base price only; line total is left to the server |
| `Variants` | always `[]` | `ModifierWizards` from the response are never surfaced in the UI |
| `UpsaleCollection[]` | flattened `upsale[].stepData[]` of the cart item | `ProductId` is `Option.ProductId`, which the type marks optional |
| `Quantity` | cart item quantity |  |
| `ItemGuid` | always `""` | A `uuid` is generated into `itemGUI` in context but not copied into the payload |
| `CoursePosition` | always `0` |  |
| `Note` | per-item note from the checkout card | The order-level note and Dine In / Takeaway choice are **not** sent |
| `tableNumber` | hard-coded `"9"` |  |
| `OrderGuid`, `SessionGuid`, `deviceSessionId` | always `""` |  |

**Response handling** (`useSendOrder.onSuccess`). Non-2xx responses are not thrown; they are converted to `{ IsSuccess: false, ResponseMessage: <body> }` so everything lands in `onSuccess`:

- `IsSuccess === true`: store `Data.AdditionalData` as the display order number and `Data.IdOrder`, go to the finish screen.
- `ResponseMessage === "Aborted"`: go back to the order screen (customer cancelled on the terminal).
- `ResponseMessage === "Printing problem"`: set `shouldContinueWithoutPrinting`, which opens a modal on the payment screen offering to resend with `?skip=true`.
- Anything else: logged only. The `paymentErr` navigation is commented out, so the kiosk stays on the payment screen with no feedback.

**Other writes.** `GET {api}/abortRequest` carries no body or parameters; it tells the terminal to cancel the pending payment. The receipt e-mail POST sends `{ IdOrder, email }` without a `Content-Type` header, to a fixed LAN IP, and is unreachable because its input field is commented out.

## Payments

Payment is **PIN terminal only** and is driven entirely by the backend. The kiosk makes one POST (`CreateKioskOrderWithPinPayment`) that blocks until the terminal has a result; there is no payment provider SDK, no QR flow and no polling in the live path. The commit history calls this the **CCV integration** (October 2025), replacing an earlier `CreateKioskOrder` + QR-code flow.

&#91;embedded content: PIN payment flow · 1 POST, 4 outcomes\]

The POST is fired from the checkout screen and the app moves to the payment screen at the same time; the user sees a static "pay on the terminal" page while the request is pending. Cancel or Back sends `GET abortRequest`, after which the still-open POST resolves with `Aborted` and the kiosk returns to the order screen.

**What the response carries.** `Data.AdditionalData` is used as the customer-facing order number on the finish screen; `Data.IdOrder` is kept for the receipt e-mail. `ResponseMessage` is matched against two literal strings, `Aborted` and `Printing problem`. Any other text falls into a branch that only logs, so a declined card, a terminal timeout or a 500 leaves the kiosk sitting on the payment screen with the Cancel button as the only exit.

**Payment methods in the menu response are ignored.** `ThemeResponse.PaymentMethods` (`Pin`, `Cash`, `QRCode`, `Visa`, `MasterCard`, `GPay`, `IPay`) is typed but never read. `Settings.SendOrderRetryCount` is also never read.

**Leftover QR flow.** `Payment.tsx` still contains a 10-second `setInterval` that calls `{api}CheckKioskPayment?reference=...` and reads `Data.AdditionalData` / `Data.IdOrder` from it. It only runs when `orderReferenceData.reference` is set, and the line that set it from the old response (`data.Reference`, `data.QRImage`) is commented out, so this code is dead. The URL is also missing a `/` between the base and the path, so it would 404 if revived as is.

**Test mode.** With `?testMode=true` the checkout Next button skips the POST entirely and goes straight to the payment screen, where nothing happens until Cancel; the finish screen is only reachable in test mode by other means.

## Other integrations, timers, error handling and open questions

**Languages.** Six locale files are bundled (`nl`, `en`, `de`, `es`, `fr`, `tr`) and loaded by i18next with the browser language detector, which persists the choice in `localStorage.i18nextLng`. The same value selects which `TMKData[]` entry (menu translation) is shown. The flag buttons are built from `ThemeResponse.LanguagesList`, so a locale the API offers but the app has no JSON for falls back to Dutch UI strings over translated menu data. `i18next-http-backend` is installed but not used.

**PWA and caching.** `vite-plugin-pwa` is configured with `selfDestroying: true`, and a hand-written `public/service-worker.js` deletes every cache on activate and forwards all requests to the network. Net effect: the kiosk has no offline mode and API responses are never cached. Build output file names get a random 5-digit suffix per build to defeat browser caching.

| Timer | Where | Length | Effect |
| --- | --- | --- | --- |
| Inactivity | `App.tsx` | 1,000,000 ms (about 16.7 min) | Shows a 5 s countdown overlay; when it ends the cart is cleared and the kiosk returns to start |
| Finish screen | `Finish.tsx` | 15 s | Auto-finishes, clears cart, returns to start |
| Confirmation screen | `Confirmation.tsx` | 5 s | Returns to start |
| Payment poll | `Payment.tsx` | every 10 s | Dead code (see Payments) |
| Quantity button auto-close | `MealCard.tsx` | 8 s | UI only |

**Error handling by call.**

- Menu GET fails: the provider renders the `PaymentError` screen in place of the app. Its button sets the step to start, but the provider still has `isError`, so the screen cannot be left without a reload.
- Stock check fails (network or non-2xx): caught, returns `null`, which the card treats as out of stock and shows the SweetAlert.
- Order POST non-2xx: converted to `IsSuccess: false` and handled as described under Payments. Order POST network error: `onError` logs only.
- Abort GET fails: the promise is not awaited or caught, so it becomes an unhandled rejection; the step still changes to order.

**Open questions and things worth fixing.**

| Item | Where | Why it matters |
| --- | --- | --- |
| Base URL points at `kioskapi.dev.revelapps.com` | `config.js` | Production builds ship with the dev API unless the file is swapped at deploy time |
| `tableNumber` is `"9"`, Dine In / Takeaway and the order note are never sent | `Checkout.tsx`, `Payment.tsx` | Kitchen cannot tell takeaway from dine-in, and the order-level note is lost |
| `ItemGuid`, `OrderGuid`, `SessionGuid`, `deviceSessionId`, `PluCode` all empty | payload builder | A `uuid` per item is generated but not sent; `IdOtherPos` is available for PLU |
| Only `MainCategories[0]` is shown | `DataContextProvider` | Menus with several main categories lose everything after the first |
| `ModifierWizards` / `HasModifiers` ignored, `Variants` always `[]` | whole app | Products with modifiers can be ordered without choosing them |
| Dietary badges always shown | `MealInfo.tsx` | `IsVegan`, `IsSpicy`, etc. from the API are not used |
| Promo carousel is hard-coded dummy data | `Order.tsx` | `IsPromotion` only toggles visibility |
| Silent failure on unexpected payment response | `SendOrder.ts` | `paymentErr` navigation is commented out |
| Dead `CheckKioskPayment` poll with malformed URL | `Payment.tsx` | Remove or fix before anyone re-enables the reference |
| Receipt e-mail posts to `192.168.1.129:9988` | `Finish.tsx` | Hard-coded LAN IP; input is commented out |
| Flags loaded over plain `http` from GitHub Pages | language selectors | Mixed-content block on an `https` kiosk page |
| Full menu response and cart logged to console on every render | several files | Noise and a data leak on shared devices |
