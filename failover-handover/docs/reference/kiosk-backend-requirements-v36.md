# BACKEND-REQUIREMENTS — contracten die de backend moet leveren

Het prototype praat uitsluitend via `window.GuestitAdapters`. Productie vervangt die door echte services met **exact** deze semantiek. Tijd-outs betekenen altijd "uitkomst onbekend", nooit "mislukt".

## 1. Catalogus en CMS
- `GET /catalog` → producten met **eMenu-ids**, categorieën, `servings` (≥1, `love` = standaard), keuzegroepen (`req`), extra's (prijs, `maxQuantity`), allergenen, beschikbaarheid, prijzen in **centen**.
- `GUESTIT_CMS` (gedeeld met de eMenu): `brand.money`, `brand.controls`, `badges`, `categories.*.presentation`, `upsell.blocks[]` (`id, role, enabled, priority, target{cats}, title, subtitle, display, items[{pid}], link`). Titels meertalig `{nl,en,mk}`.
- Kiosk-upsellconfig: `menuUpgrade`, `productEnhancements`, `crossSells` (met `priceVariantId`, `conflictsWith`), `premiumDrinks`, secties per categorie.
- Eén gedeelde categorielijst (vervangt de kiosk-aliastabel eMenu→kiosk).

## 2. Beschikbaarheid en prijzen
- `POST /availability/check {productIds}` → `unavailableIds[]`; verplicht vóór elke betaling; timeout (8 s) blokkeert betalen.
- `GET /catalog/current` → `{prices:{pid:cents}, variants:{id:cents}, disabled:[pid]}`; nooit toegepast op een gestart snapshot.

## 3. Betaling (terminal)
- `payment.start {attemptId, orderId, amountMinor, currency}` → `{result: approved|declined|cancelled|timeout|terminal-offline, txRef}`.
- `payment.status {attemptId, orderId}` → `{result: approved|not-charged|unknown, txRef}` — **gezaghebbend**, idempotent, beschikbaar na herstart.
- `payment.cancel {attemptId}` → `{result: cancelled|unknown}` (verzoek, geen garantie).
- Eén attemptId = hoogstens één afschrijving. Late callbacks voor een gefinaliseerde poging worden genegeerd.

## 4. Order (POS/KDS)
- `POST /orders {idempotencyKey, orderId, attemptId, txRef, snapshot}` → `{orderNo, duplicate}`.
- **Duurzame idempotentie** (≥ 7 dagen): dezelfde key geeft altijd dezelfde order terug (`duplicate:true`), nooit een tweede order.
- Zonder bruikbaar `orderNo` geldt het als niet-geaccepteerd → kiosk gaat naar recovery.
- Snapshot bevat: regels (product, variant, keuzes, extra's met aantallen, menu+drank, cross-sells met groupId/sourceLineId, cadeau), service (eat-in/takeaway), taal, totalen in centen.
- **v35:** snapshot bevat ook `tag`: `{type:'table'|'pager'|'name', value:string}` of `null`. Tonen op KDS, bon en uitgifte-/afroepscherm; bij `name` is `value` persoonsgegeven (niet naar analytics, niet langer bewaren dan de order).

## 5. Bestelling-herkenning per kiosk/locatie (v35)
Instelling uit de backend, aan de kiosk geleverd als `window.GuestitConfig.orderTag` (of via de config-endpoint die dat object vult):
```
orderTag: {
  mode:         'none' | 'pager' | 'table' | 'name',   // standaard 'none'
  takeawayMode: null | 'none' | 'pager' | 'name',      // optioneel; standaard gelijk aan mode, behalve 'table' → 'none'
  required:     true,                                  // false → knop "Overslaan"
  min: 1, max: 99,                                     // standaard nummerbereik voor beide typen
  table: { min: 1, max: 40 },                          // v36: eigen bereik bordjes (optioneel)
  pager: { min: 1, max: 150 },                         // v36: eigen bereik piepers (optioneel)
  nameMin: 2, nameMax: 16,                             // naamlengte
  nameBlocklist: ['…']                                 // v36: extra geblokkeerde woorden per organisatie (bovenop de ingebouwde lijst)
}
```
- Onbekende `mode` → kiosk valt veilig terug op `none` en meldt een client-error.
- De vraag komt na "Afrekenen" en vóór de terminal; de waarde zit in de vergrendelde en opgeslagen order (ook na een herstart).
- **Waar instellen:** in de Guestit-backend per kiosk of locatie (scherm nog te bouwen in de CMS). De kiosk toont de actieve modus en de bereiken read-only in het medewerkersmenu (5× op het logo, pincode). Alleen in demo kan de modus daar worden gewisseld.
- **Naamfilter (v36):** de kiosk blokkeert ongepaste namen (hele woorden; hoofdletters, accenten en uitgerekte letters tellen niet). De backend moet dezelfde controle herhalen op de ontvangen `tag.value` (nooit alleen op de client vertrouwen) en mag de lijst per organisatie uitbreiden.

### 5a. Pieper automatisch laten afgaan (besluit Alex, 10-10-2026)
- Zodra de bestelling op de KDS op **klaar** wordt gezet, stuurt de backend automatisch het piepernummer (`tag.value` bij `tag.type:'pager'`) naar het piepersysteem van de locatie. Geen handeling van personeel nodig.
- Nodig: een pager-adapter per leverancier (lokaal basisstation of cloud-API), met retry en een zichtbare status op de KDS als het oproepen mislukt ("Pieper 7 niet bereikt — roep handmatig om").
- Open: welk piepersysteem Sojubar gebruikt (merk/model, koppeling).

### 5b. Bordje op de kassa-plattegrond (besluit Alex, 10-10-2026)
- Bij locaties met **open tafels** verschijnt een kioskbestelling met `tag.type:'table'` als rekening met het **bordjesnummer** op de plattegrond van de kassa, zodat bediening ziet waar de bestelling heen moet en er later iets aan kan toevoegen.
- Nodig in de POS: een rekening koppelen aan een bordjesnummer (los van een vaste tafel), weergeven op de plattegrond (bijv. een zone "Bordjes" of het bordje op de tafel waar het staat), status *betaald via kiosk* en *geserveerd*.
- Open: zijn bordjesnummers gelijk aan tafelnummers, of los? Mag een gast later bijbestellen op dezelfde rekening (en hoe betaalt die dan)?

## 6. Overig
- `printer.print {orderNo, snapshot}` — los, niet blokkerend.
- `auth.verify {pin}` — medewerkerspaneel (vervangt demo-PIN).
- `GET /health` — bepaalt of betalen mag.
- `analytics.send(events[])` — geen kaart- of persoonsgegevens; events o.a. `upsell_offered/accepted`, `order_accepted`, `order_abandoned`, `staff_assist`, `feedback {rating, tags, text, orderId}`.
- Tijd-outs (client): start 90 s · status/cancel 12 s · submit 15 s · print 10 s · availability 8 s · health 5 s.

## 7. Niet-functioneel
- Assets met content-hash, `Cache-Control: immutable`; HTML `no-cache`.
- Referentiehardware: Android-kiosk 1024×1920, 2–4 GB, oudere WebView; zie `PERFORMANCE.md`.
