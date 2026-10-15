# Product Allergen Map

Oct 15, 2026 · @Aleksander Dolstra

143 products across the two TabletMenuKaart (TMK) test menus carry allergen data. 142 are in menu 2490 and 1 is in menu 2408. Each one is listed below with its allergens and the **correct** icon for every TMK allergen ID.

The data comes from `ProductDetails.MenuItems[Name = "Allergens"].AllergensScreen.Allergens[].AllergenTypeId` in the live test-mode responses of `kioskTestModeResources`, downloaded on 15 October 2026. Menu 2490's Dutch and English entries have identical allergens, so each product appears once under its Dutch name and category. The icons are the kiosk's own files from `public/allergens/`, re-pointed to TMK numbering.

## Icon legend

| TMK ID | Icon | Allergen | Kiosk file to use |
| --- | --- | --- | --- |
| 1 | &#91;image: Gluten\] | Gluten | `01.png` |
| 2 | &#91;image: Soybeans\] | Soybeans | `06.png` |
| 3 | &#91;image: Nuts\] | Nuts | `08.png` |
| 4 | &#91;image: Peanuts\] | Peanuts | `05.png` |
| 5 | &#91;image: Sesame seeds\] | Sesame seeds | `011.png` |
| 6 | &#91;image: Milk\] | Milk | `07.png` |
| 7 | &#91;image: Eggs\] | Eggs | `03.png` |
| 8 | &#91;image: Fish\] | Fish | `04.png` |
| 9 | &#91;image: Crustaceans\] | Crustaceans | `02.png` |
| 10 | &#91;image: Celery\] | Celery | `09.png` |
| 11 | &#91;image: Sulphites\] | Sulphur dioxide and sulphites | `012.png` |
| 12 | &#91;image: Mustard\] | Mustard | `010.png` |
| 13 | &#91;image: Lupin\] | Lupin | `013.png` |
| 14 | &#91;image: Molluscs\] | Molluscs | `014.png` |
| 15 | &#91;image: Onion\] | Onion | `015.png` |
| 16 | &#91;image: Garlic\] | Garlic | `016.png` |
| 17 | &#91;image: Wheat\] | Wheat | `017.png` |
| 18 | &#91;image: Alcohol\] | Alcohol | `018.png` |
| 19 | &#91;image: Pregnancy\] | Not suitable in pregnancy | `019.png` |
| 20 | &#91;image: Spicy\] | Spicy | `020.png` |
| 21 | &#91;image: Vegan\] | Vegan | `021.png` |
| 22 | &#91;image: Vegetarian\] | Vegetarian | `022.png` |

## Menu 2408

One of 942 products in this menu has allergens set. It is not in the first main category, so the kiosk does not show it today.

### Food To Share

| Subcategory | Product ID | Product | Allergens |
| --- | --- | --- | --- |
| Voorgerechtjes | 449035 | Bruchetta Burrata 2st | &#91;image: Vegetarian\] Vegetarian |

## Menu 2490

142 products in this menu have allergens set, across 8 main categories. Only the first main category, Julekaart, is shown by the kiosk today. Allergens are listed in TMK ID order. Several entries are clearly test data, such as gluten and crustaceans on Pepsi. The table reflects what is set in the TMK back office, not real recipes.

### Julekaart

| Subcategory | Product ID | Product | Allergens |
| --- | --- | --- | --- |
| Frisdranken | 465455 | Pepsi Light Cola | &#91;image: Gluten\] &#91;image: Crustaceans\] &#91;image: Vegan\] Gluten, Crustaceans, Vegan |
| Frisdranken | 465452 | Pepsi | &#91;image: Gluten\] &#91;image: Crustaceans\] &#91;image: Vegan\] Gluten, Crustaceans, Vegan |
| Frisdranken | 465461 | Lipton Green Tea | &#91;image: Sulphites\] Sulphites |
| Frisdranken | 465449 | Lipton Ice Tea | &#91;image: Sulphites\] Sulphites |
| Wijnen | 465473 | Glas Droge Witte Wijn | &#91;image: Sulphites\] Sulphites |
| Wijnen | 465467 | Fles Droge Witte Wijn | &#91;image: Sulphites\] Sulphites |
| Wijnen | 465469 | Glas Rosé (Grenache Rosé) | &#91;image: Sulphites\] Sulphites |
| Wijnen | 465464 | Fles Rosé Wijn | &#91;image: Sulphites\] Sulphites |
| Wijnen | 465472 | Glas Rode Wijn | &#91;image: Sulphites\] Sulphites |
| Wijnen | 465465 | Fles Rode Wijn | &#91;image: Sulphites\] Sulphites |
| Wijnen | 465468 | Glas Zoete Witte Wijn | &#91;image: Sulphites\] Sulphites |
| Wijnen | 465474 | Fles Zoete Witte Wijn | &#91;image: Sulphites\] Sulphites |

### Menukaart Deluxe

| Subcategory | Product ID | Product | Allergens |
| --- | --- | --- | --- |
| SALADS & COLD DISHES | 455457 | 1. Wakame Salade | &#91;image: Gluten\] &#91;image: Nuts\] &#91;image: Peanuts\] &#91;image: Eggs\] &#91;image: Fish\] &#91;image: Crustaceans\] &#91;image: Sulphites\] &#91;image: Mustard\] &#91;image: Garlic\] Gluten, Nuts, Peanuts, Eggs, Fish, Crustaceans, Sulphites, Mustard, Garlic |
| SUSHI | 455461 | 25. Nigiri Mix 4st. | &#91;image: Gluten\] &#91;image: Soybeans\] &#91;image: Nuts\] &#91;image: Peanuts\] &#91;image: Sesame\] &#91;image: Milk\] &#91;image: Eggs\] &#91;image: Fish\] &#91;image: Crustaceans\] &#91;image: Celery\] &#91;image: Sulphites\] &#91;image: Mustard\] &#91;image: Lupin\] &#91;image: Molluscs\] &#91;image: Onion\] &#91;image: Garlic\] &#91;image: Wheat\] &#91;image: Alcohol\] &#91;image: Pregnancy\] &#91;image: Spicy\] &#91;image: Vegan\] &#91;image: Vegetarian\] Gluten, Soybeans, Nuts, Peanuts, Sesame, Milk, Eggs, Fish, Crustaceans, Celery, Sulphites, Mustard, Lupin, Molluscs, Onion, Garlic, Wheat, Alcohol, Pregnancy, Spicy, Vegan, Vegetarian |

### Menukaart

| Subcategory | Product ID | Product | Allergens |
| --- | --- | --- | --- |
| SALADS & COLD DISHES | 443730 | 2. Thaise Gamba Salade | &#91;image: Pregnancy\] &#91;image: Spicy\] &#91;image: Vegan\] &#91;image: Vegetarian\] Pregnancy, Spicy, Vegan, Vegetarian |
| SALADS & COLD DISHES | 443731 | 2. Thaise Gamba Salade | &#91;image: Pregnancy\] Pregnancy |
| SOEPEN | 443763 | 10. Romige Kreeftensoep Romige Kreeftensoep Romige Kreeftensoep | &#91;image: Pregnancy\] &#91;image: Spicy\] &#91;image: Vegan\] &#91;image: Vegetarian\] Pregnancy, Spicy, Vegan, Vegetarian |
| SUSHI | 443766 | 25. Nigiri Mix 4st. | &#91;image: Gluten\] &#91;image: Soybeans\] &#91;image: Nuts\] &#91;image: Peanuts\] &#91;image: Sesame\] &#91;image: Milk\] &#91;image: Eggs\] &#91;image: Fish\] &#91;image: Crustaceans\] &#91;image: Celery\] &#91;image: Sulphites\] &#91;image: Mustard\] &#91;image: Lupin\] &#91;image: Molluscs\] &#91;image: Onion\] &#91;image: Garlic\] &#91;image: Wheat\] &#91;image: Alcohol\] &#91;image: Pregnancy\] &#91;image: Spicy\] &#91;image: Vegan\] &#91;image: Vegetarian\] Gluten, Soybeans, Nuts, Peanuts, Sesame, Milk, Eggs, Fish, Crustaceans, Celery, Sulphites, Mustard, Lupin, Molluscs, Onion, Garlic, Wheat, Alcohol, Pregnancy, Spicy, Vegan, Vegetarian |
| FISH | 443739 | 46. Korean BBQ Fish | &#91;image: Pregnancy\] &#91;image: Spicy\] &#91;image: Vegan\] &#91;image: Vegetarian\] Pregnancy, Spicy, Vegan, Vegetarian |
