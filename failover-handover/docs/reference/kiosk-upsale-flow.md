# Kiosk Upsale Flow

Oct 15, 2026 · @Aleksander Dolstra

## Summary

Upsale is a step-by-step wizard that opens when a guest taps a product with `HasUpsaleCollection: true`. It walks through the steps of one upsale collection from the menu response, such as choose your side and then choose your drink. Each choice adds options with their own price on top of the base product. The finished product, with all chosen options, goes into the cart as one line. It is sent to the API in the `UpsaleCollection` array of that item.

The wizard has no API call of its own. All data comes from the startup `getfullresources` response, and all state lives in React context until the order POST.

| Part | File | Role |
| --- | --- | --- |
| Wizard state | `src/Contexts/UpsaleContext/UpsaleContentProvider.tsx` | Selected options per step, active collection id, edit mode, modal open flag |
| Wizard shell | `src/Components/View/Upsale/Upsale.tsx` | Finds the collection, keeps the current step index, picks Dual or Multi layout |
| Layouts | `UpsaleSteps/DualUpsaleOption`, `UpsaleSteps/MultiUpsaleOption` | Render one step, the Next and Back buttons, and the step price |
| Option tiles | `DualOptionSelector`, `MultiOptionselector` | Select, deselect and set quantity per option |
| Entry points | `OrderPage/MealCard/MealCard.tsx`, `MealInfo/MealInfo.tsx`, `CheckoutPage/CheckoutCard.tsx` | Open the wizard for a new product or to edit a cart line |
| Cart and price | `src/Contexts/OrderContext/OrderContextProvider.tsx` | `placeMealInOrders` adds the product with its upsale and computes the price |
| Payload | `formulateMealsForPostRequest` in `View/Checkout/Checkout.tsx` | Flattens the chosen options into `UpsaleCollection[]` |

## API data

The link from a product to its wizard is `Product.UpsaleCollectionId`, which is matched against `UpsaleColletions[].Id`. The collections are read from the `TMKData` entry for the current language. Steps and options are used in the order the API returns them, and nothing is sorted.

```text
TMKData[lang]
├─ MainCategories[0].SubCategories[].Products[]
│    ├─ HasUpsaleCollection   true → tapping opens the wizard
│    └─ UpsaleCollectionId    → which collection
└─ UpsaleColletions[]           (spelled with this typo in the API)
     ├─ Id
     └─ UpsaleSteps[]           one wizard screen each
          ├─ Name, MinSelection, MaxSelection
          └─ Options[]
               └─ Id, ProductId, Name, Price, PictureUrl, MaxSelection, Finish
```

| Object | Field | Used? | What the app does with it |
| --- | --- | --- | --- |
| Product | `HasUpsaleCollection` | Yes | Decides between opening the wizard and adding straight to the cart. Also shows the edit pen on the checkout card |
| Product | `UpsaleCollectionId` | Yes | Picks the collection. If it is missing, the last-used id stays active |
| Product | `Price`, `Name`, `SmallPictureUrl` | Yes | Header of every wizard step and the base price |
| UpsaleColletion | `Id` | Yes | Lookup key |
| UpsaleColletion | `CollectionName`, `NumberOfSteps` | No | Step count comes from the length of `UpsaleSteps` |
| UpsaleStep | `Name` | Yes | Step title, shown as "Choose your {Name}" in the Multi layout |
| UpsaleStep | `MinSelection` | Yes | Gates the Next button, with different rules in each layout. See Selection rules |
| UpsaleStep | `MaxSelection` | Yes | Limits how many different options can be picked. It also sets the "only one" or "multiple choice" subtitle |
| UpsaleStep | `Id`, `NextStepId`, `DisplayOrder`, `PictureUrl` | No | Steps always go 0, 1, 2 in array order. Branching is not supported |
| Option | `Id` | Yes | Identity for select and deselect |
| Option | `Name`, `Price`, `PictureUrl` | Yes | Tile content. Price is added to the line total |
| Option | `MaxSelection` | Yes | Above 1, the tile gets a minus and plus quantity control capped at this value |
| Option | `Finish` | Dual layout only | If a selected option has `Finish: true`, Next ends the wizard early. The Multi layout ignores it |
| Option | `ProductId` | Yes | Sent in the POST as `UpsaleStepOptionModel.ProductId`. The type marks it optional, and if it is absent the key is dropped from the JSON |
| Option | `OverrideNextStepId`, `OptionOrder` | No |  |

## Flow

Every entry point ends up in the same wizard. The wizard loops one step at a time until the last step, or until a `Finish` option in the Dual layout. It then writes a single cart line.

&#91;embedded content: upsale flow · 4 entry points, 1 loop\]

The two amber entry points are the buggy ones described under Gaps. Closing the sheet with the X or by tapping outside it at any step behaves like Back on step 0.

## Selection rules

Each step is drawn in one of two layouts, chosen by how many options the step has. The two layouts do not enforce the same rules.

| Rule | Dual layout (2 or fewer options) | Multi layout (3 or more options) |
| --- | --- | --- |
| Tile | Large side-by-side cards. The second card is scaled 1.08×. An option with `MaxSelection > 1` falls back to the Multi tile | List of tiles with an expanding minus and plus control |
| Tap an unselected option | Selects it with quantity 1 | Selects it with quantity 1. If `Option.MaxSelection > 1`, the quantity control opens and auto-closes after 8 s |
| Tap a selected option | Deselects it | Deselects it if `Option.MaxSelection` is 1, otherwise reopens the quantity control |
| Step `MaxSelection` is 1 | A new pick replaces the previous one | A new pick replaces the previous one |
| Step `MaxSelection` above 1 | Picks are added. Nothing stops a pick beyond the max | Once the number of different options picked reaches the max, the other tiles are greyed out and cannot be tapped |
| Next enabled when | Number of picked options ≥ `MinSelection` | `MinSelection` is 0, or at least one option is picked. A `MinSelection` of 2 is met by one pick |
| `Finish: true` on a picked option | Next adds to cart and closes the wizard | Ignored |
| Last step, Next | Adds to cart, closes the wizard, resets state | Same |
| Back on step 0 | Closes the wizard and discards picks. In edit mode it restores the original cart line | Same |
| Back on a later step | Goes one step back. Picks on every step are kept | Same |

**Quantities.** `MaxSelection` on a step counts different options, not the total quantity. An option's own `MaxSelection` caps how many of that one option can be added. With a step max of 2 and option maxes of 3, a guest can therefore add up to 6 items.

**Pricing.** The bottom bar of each step shows "Plus {currency} x". Here x is the sum of `Option.Price × quantity` for the current step only, not a running total. When the item is placed in the cart:

```text
line price  = Product.Price + Σ over all steps ( Option.Price × quantity )
line total  = line price × cart quantity      (on later + / − in the cart)
```

The whole price is computed on the client. The POST sends the base `Item.Price` and each option `Price` separately, so the backend can recompute it.

**State shape.** Picks are stored as a fixed array of five step slots:

```ts
upsaleData = [
  { step: 0, stepData: [{ option: Option, quantity: number }, ...] },
  { step: 1, stepData: [] },
  ... // up to step: 4
]
```

A collection with more than five steps would crash on step six, because that slot does not exist.

## Checkout display, editing and the POST

**Checkout card.** A cart line with an upsale uses the picture of the first option picked on step 0 as its image, falling back to the product picture. Under the name, a swipeable strip lists every picked option as "Name {currency} Price × quantity". The amount is not rounded, so floating-point results such as 0.30000000000000004 can show.

**Edit (pen button).** The pen shows only when the product has `HasUpsaleCollection`. Tapping it does the following:

1. Saves a copy of the cart line as `copyOfEditingItem` and switches on edit mode.
2. Clears the wizard state and sets the collection id from the product.
3. Removes the line from the cart.
4. Moves to the order screen and opens the wizard on step 0.

The previous picks are not loaded into the wizard, so the guest starts again from an empty wizard. If they finish, a new line is added. If they back out on step 0 or close the sheet, the saved copy is put back in the cart.

**Into the order POST.** `formulateMealsForPostRequest` flattens every step's picks into one list on the item:

```json
{
  "Item": { "Id": 101, "PluCode": "", "Image": "...", "Name": "Burger menu", "Price": 9.5 },
  "Variants": [],
  "UpsaleCollection": [
    { "UpsaleStepOptionModel": { "ProductId": 201, "Name": "Fries", "Price": 0 },   "Quantity": 1 },
    { "UpsaleStepOptionModel": { "ProductId": 305, "Name": "Cola",  "Price": 1.5 }, "Quantity": 2 }
  ],
  "Quantity": 1,
  "ItemGuid": "",
  "CoursePosition": 0,
  "Note": ""
}
```

- **No step information.** The payload does not say which step or collection an option came from. The option `Id` is not sent, only its `ProductId`.
- **Per-unit quantities.** Option `Quantity` is per one unit of the main item. Item `Quantity` multiplies the whole bundle, so the backend has to multiply option quantities by the item quantity.
- **Duplicate lines.** The same product with the same upsale added twice becomes two separate lines, because each pass through the wizard adds a new line.

## Gaps and known issues

These come from reading the code, not from testing on a kiosk. Items marked "likely" should be confirmed on a device.

| Issue | Where | Effect |
| --- | --- | --- |
| The detail sheet never sets the collection id | `MealInfo.tsx`, add button | Adding an upsale product from its detail sheet opens whichever collection was used last. On a fresh session it shows "Upsale Data is missing" |
| A second add of an upsale product uses a different screen | `MealCard.tsx` | If the product is already in the cart, it switches to the full-screen `menuUpgrade` step instead of the slide-up sheet. Finish and Back only close the sheet, so the guest is likely stuck on that screen |
| Branching is not supported | `Upsale.tsx` | `NextStepId` and `OverrideNextStepId` are ignored, and steps always go +1 |
| `Finish` only works in the Dual layout | `MultiUpsaleOption.tsx` | An early-exit option on a step with 3 or more options does nothing |
| `MinSelection` is checked differently | Dual vs Multi | In the Multi layout, one pick is enough whatever the minimum is |
| Step max not enforced in Dual | `DualOptionSelector` | With step `MaxSelection` 1 the pick is replaced correctly. Above 1, nothing caps it |
| Fixed five step slots | `UpsaleContentProvider` | A sixth step crashes the wizard |
| Edit starts from empty picks | `CheckoutCard.tsx` | Guests must redo every choice to change one |
| Edit loses quantity and note | `placeMealInOrders` | Both a finished and a cancelled edit put the line back with the note cleared. A finished edit also resets quantity to 1. A cancelled edit keeps the quantity but prices the line for one unit |
| Debug text shown to guests | `MealCard.tsx` | If `UpsaleColletions` is empty, a modal shows an internal developer note, not in any guest language. Its Close button jumps to the Dine In / Takeaway screen |
| Missing collection modal does not close | `Upsale.tsx` | Its Close button sets the step to order but leaves the sheet open. The guest has to tap outside it |
| Option price not rounded | `UpsaleSlider.tsx` | Checkout can show long decimals |
| No step or collection in the POST | payload builder | The backend cannot tell which step an option belongs to |
| No sorting | everywhere | Steps and options show in API array order. `DisplayOrder` and `OptionOrder` are ignored |
