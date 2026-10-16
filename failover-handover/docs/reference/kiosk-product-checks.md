# Kiosk: what the app checks

Source: handed over by Alex (Guestit) in chat on 2026-10-16, describing the old kiosk (`Kiosk/src`).
Stored verbatim as the contract reference for the availability feature (see `api-samples/README.md`).

Scope: stock, availability, visibility and price checks that exist in the Kiosk code today
(`Kiosk/src`, checked on 16 October 2026). Only checks that actually run are described here.

All product data comes from one menu request made at startup:

| Mode | Request |
| --- | --- |
| Normal | `GET {api}/getfullresources` (`{api}` = `window.kioskConfig.api` from `config.js`) |
| Test mode (`?testMode=true`) | `GET https://my.tabletmenukaart.nl/service/kioskTestModeResources?menu={menuId}` |

---

## 1. Out-of-stock flag from the menu (`Product.OutOfStock`)

**Where:** `src/Components/View/Order/Order.tsx`

**When:** Every time the product grid for a subcategory is built, on first load and on each category change.

**Rule:** Only products with `OutOfStock === false` are shown. Products with `OutOfStock === true` are not rendered.

```ts
allProducts.filter(p =>
  p.SubCategoryId === selectedCategory &&
  p.OutOfStock === false &&
  !outOfStockProducts.includes(p.ProductId)   // see check 2
)
```

**Data source:** The menu snapshot loaded at startup. It is not refreshed on a timer. React Query uses its
defaults, with no options passed to `new QueryClient()` in `src/main.tsx`, so it can refetch when the window
regains focus or the network reconnects. When it does, the grid is rebuilt with the new flags.

---

## 2. Live availability check (`checkProductAvailable`)

**Request:**

```
GET {api}/checkProductAvailable?idProduct={ProductId}
```

**Code:** `src/Query/CheckAvailability.ts`, called through `useMutation` in:

- `src/Components/Reusables/OrderPage/MealCard/MealCard.tsx` (product card)
- `src/Components/Reusables/MealInfo/MealInfo.tsx` (product detail sheet)

**Response used:** A bare boolean. `true` means available and `false` means not available.

**When it runs:**

| Trigger | Component |
| --- | --- |
| Tap on a product card | `MealCard` |
| Tap on the card image or its info button, which opens the detail sheet | `MealCard` |
| Tap on the add button in the detail sheet | `MealInfo` |

**What happens on the result:**

| Result | Effect |
| --- | --- |
| `true` | The normal flow continues: add to cart, open the upsale wizard, or open the detail sheet |
| `false` | The card is greyed out with an "out of stock" label. A SweetAlert shows "Out Of Stock: Sorry, {Name} is currently out of stock.", and the product is not added |
| Request fails (network error or non-2xx) | The error is caught and the result is `null`, which is handled the same as `false` |

**Hiding after a negative result.** A tap on the product card that returns `false` also adds the product ID
to `outOfStockProducts` in `Order.tsx`. The card is then hidden from the grid, using the filter in check 1.
This list is held in the order screen's state, so it lasts until that screen is left, for example by going to
checkout.

**Test mode.** With `?testMode=true` the result is overridden to `true`, so every product is treated as
available. The card's info button still sends the request but ignores its result.

---

## 3. Quantity cap in the detail sheet (`Product.MaxAmountInAgenda`)

**Where:** `src/Components/Reusables/QuantityBtns/QuantityBtns.tsx`, used only in `MealInfo`.

**Rule:** The + button is disabled when the chosen quantity equals `MaxAmountInAgenda`.

```tsx
disabled={quantity === product.MaxAmountInAgenda}
```

**Applies to:** The quantity selector in the detail sheet only. It shows for products that are not yet in the
cart and have no upsale collection.

---

## 4. No-interaction products (`Product.NoInteraction`)

**Where:** `MealCard.tsx` and `MealInfo.tsx`

**Rule:** If `NoInteraction === true`, a tap does not add the product to the cart. The app stores the product
for information display and switches the step to `mealInfo`. The stock check in check 2 still runs first.

---

## 5. Promotion banner (`Product.IsPromotion`)

**Where:** `src/Components/View/Order/Order.tsx`

**Rule:** If at least one product in the shown main category has `IsPromotion === true`, the promotions
banner is shown at the top of the order screen. The flag only switches the banner on or off. The slides in
the banner are fixed placeholder content.

---

## 6. Upsale wizard selection rules

**Where:** `src/Components/Reusables/UpsaleSteps/*`

These rules check the guest's choices, not stock:

| Field | Rule |
| --- | --- |
| `UpsaleStep.MinSelection` | The Next or Add button is disabled until enough options are picked. With 2 or fewer options on a step, at least `MinSelection` must be picked. With more options, at least one pick is needed when `MinSelection > 0` |
| `UpsaleStep.MaxSelection` | With 3 or more options, other options are locked once the number of different picked options reaches the max. When the max is 1, a new pick replaces the old one |
| `Option.MaxSelection` | The + button for that option stops at this quantity |

---

## Prices

The kiosk performs **no price check**. Prices are read from the startup menu snapshot (`Product.Price`,
`Option.Price`), totals are computed in the browser, and those unit prices are sent as they are in
`POST {api}/CreateKioskOrderWithPinPayment`. Any price validation would have to happen on the backend.

---

## Summary

| # | Check | Source | Live call? | Applies at |
| --- | --- | --- | --- | --- |
| 1 | `OutOfStock` flag | Menu snapshot | No | Building the product grid |
| 2 | `checkProductAvailable` | Kiosk API | Yes | Product tap, info, detail-sheet add |
| 3 | `MaxAmountInAgenda` quantity cap | Menu snapshot | No | Detail-sheet quantity selector |
| 4 | `NoInteraction` | Menu snapshot | No | Product tap |
| 5 | `IsPromotion` banner switch | Menu snapshot | No | Order screen header |
| 6 | Upsale min/max selection | Menu snapshot | No | Upsale wizard steps |
| – | Prices | Menu snapshot | No check | – |
