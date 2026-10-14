# Betalingen en herstel — referentie `reference/index.html`

Alle onderstaande regels zijn **[FEIT]** uit de code tenzij anders gemarkeerd. Kernobjecten: `PAY`, `PAY_T`,
`PAY_ACTIVE`, `PAY_UNCERTAIN`, `PAY_LOCKED_ACTIONS`, `FINALIZED`, functies `payStart`, `payApprove`,
`payApproveOnce`, `payCancel`, `payCancelFinal`, `payUncertain`, `payLookup`, `submitOrder`, `payDone`,
`persistPaid`, `persistClear`, `restorePaidSnapshot`, `payReset`, `newOrderReset`.

## 1. Statussen
| Status | Betekenis | Klasse |
|---|---|---|
| `idle` | geen poging | — |
| `connecting` | terminal wordt aangesproken | actief |
| `waiting-for-card` | wacht op kaart | actief |
| `processing` | terminal verwerkt | actief + **onzeker** |
| `cancel-requested` | gast vroeg annulering; provider moet bevestigen | onzeker |
| `approved` | betaling goedgekeurd (door provider) | actief + onzeker |
| `submitting` | order wordt naar POS/KDS gestuurd | actief + onzeker |
| `order-submit-failed` → `recovery-required` | betaald, POS accepteerde (nog) niet | onzeker |
| `done` | POS heeft de order geaccepteerd | beschermd tegen reset (tot *Nieuwe bestelling*) |
| `declined` / `cancelled` / `terminal-offline` | definitief: niets afgeschreven | — |
| `timeout` | uitkomst onbekend (terminaltimeout, onbekend antwoord, adapterfout) | onzeker |
| `lookup` | statuscontrole bij de betaalservice loopt | actief + onzeker |
| `status-check` | na herstart: statuscontrole vóór alles | onzeker |
| `assistance` | herstelrecord ongeldig of langdurig onzeker → medewerker | onzeker |

`PAY_ACTIVE = {connecting, waiting-for-card, processing, approved, submitting, lookup}`
`PAY_UNCERTAIN = {processing, approved, submitting, order-submit-failed, recovery-required, lookup, timeout, assistance, status-check, cancel-requested}`
`paymentMayHaveSucceeded() = !!PAY.snapshot || state ∈ {processing, approved, submitting, order-submit-failed, recovery-required, lookup, timeout, done, assistance}`

## 2. Toegestane overgangen (`PAY_T`, afgedwongen door `payGo()`; illegale overgang = no-op + console.warn)
| van | naar |
|---|---|
| idle | connecting |
| connecting | waiting-for-card · terminal-offline · cancelled · cancel-requested |
| waiting-for-card | processing · cancelled · timeout · cancel-requested |
| processing | approved · declined · timeout · **cancelled** (definitieve providerbevestiging) |
| cancel-requested | cancelled · approved · timeout · processing |
| approved | submitting |
| submitting | done · order-submit-failed |
| order-submit-failed | recovery-required |
| recovery-required | submitting |
| declined | idle · connecting |
| cancelled | idle |
| terminal-offline | connecting · idle |
| timeout | lookup · idle |
| lookup | approved · idle · timeout |
| status-check | approved · idle · assistance · recovery-required |
| assistance | submitting · lookup |
| done | idle |

## 3. Gebeurtenissen → afhandeling
| Gebeurtenis | Voorwaarde | Effect |
|---|---|---|
| `ACT.toPay` | online, cart geldig, verse beschikbaarheidscheck, geen prijswijziging, geen actieve/onzekere poging, cart ongewijzigd tijdens check | `payStart()` |
| `payStart` | — | `orderId` (eenmalig per order), `attempt++`, nieuwe `attemptId`, snapshot bevroren, `submitKey='IDEMP-'+orderId`, **`persistPaid('starting')` vóór de terminal** (faalt → geen start, `payStoreFail`), `connecting`, adapter `payment.start()` |
| voortgangstimers | zelfde sessie+poging | `connecting→waiting-for-card→processing` (cosmetisch; nooit een uitkomst) |
| guard-timer (`terminalTimeoutMs`) | nog actief, niet approved/submitting | `timeout`, `persistPaid('timeout')` |
| `start` resolves `approved` | actuele poging | `payApproveOnce` (ook na cancel-requested/timeout) |
| `start` resolves `cancelled` | actuele poging, niet gefinaliseerd | `payCancelFinal` (uit connecting/waiting/processing/cancel-requested) → `cancelled`, snapshot+record gewist |
| `start` resolves `declined` | actuele poging, niet cancel-requested | `declined`, snapshot+record gewist |
| `start` resolves `terminal-offline` | idem | `terminal-offline`, gewist |
| `start` resolves `timeout` | idem | `payUncertain('terminal-timeout')` → `timeout`, alles bewaard |
| `start` resolves onbekend / `{}` / `null` / ongeldig | idem | `payUncertain('unknown-result')` → `timeout`, alles bewaard |
| `start` rejects | idem | `timeout`, alles bewaard |
| antwoord met andere `attemptId`, andere sessie, na finalisatie, na `timeout`/`cancelled` | — | genegeerd |
| gast: *Annuleren* (`ACT.cancelPay`) | connecting/waiting-for-card | `payCancel()` → `cancel-requested`, record `cancel-requested`; adapter `payment.cancel()` (of `status()`); `cancelled/not-charged` → `payCancelFinal`; `approved` → `payApproveOnce`; onbekend/timeout → `timeout` |
| gast: *Annuleren* | declined/cancelled/terminal-offline/idle | terug naar cart, record gewist |
| gast: *Opnieuw proberen* (`payRetry`) | `canRetryPayment()` = idle/declined/cancelled/terminal-offline zonder snapshot | `payStart()` (nieuwe attemptId) |
| gast: *Controleer betalingsstatus* (`payLookup`) | `timeout` | `lookup` → adapter `payment.status()`: `approved` → `payApproveOnce`; `not-charged` → `idle`, snapshot/record/assistentie gewist; anders/timeout → `timeout` + assistentie |
| `payApprove` | — | `txRef`, snapshot met `paidAt`, `persistPaid('approved')`, `approved`, `submitOrder()` |
| `submitOrder` | approved/recovery-required | `submitting`, adapter `pos.submit()` (timeout 15 s) → `payDone(orderNo)`; fout/timeout → `order-submit-failed` → `recovery-required` (`recoveryRef` GUE-xxxxx, record) |
| `payDone` | — | `accepted=true`, `S.orderNo`, `done`, record `accepted`, cart pas nú geleegd, printer (`receipt: printing→printed|failed`), record gewist na printstap |
| *Bestelling opnieuw versturen* (`paySubmitRetry`) | recovery-required | `submitOrder()` met **dezelfde** `submitKey` |
| inactiviteit / `newOrderReset` / navigatie / Escape | `PAY_UNCERTAIN` of `paymentMayHaveSucceeded()` | geweigerd (`PAY_LOCKED_ACTIONS`-wrapper, `idleExempt`, `newOrderReset`-guard); onzekerheid > `uncertainMs` → assistentiescherm |
| *Nieuwe bestelling* (`newOrder`) | done/idle | `newOrderReset()` |

## 4. Identifiers en levensduur
| Naam | Aanmaak | Levensduur | Gebruik |
|---|---|---|---|
| `DEVICE_ID` | eenmalig per apparaat (localStorage `guestit.deviceId`) | permanent | prefix van orderId |
| `PAY.orderId` | eerste `payStart` van een bestelling (`DEVICE-<tijd36>-<uuid8>`) | tot `newOrderReset` | order-/idempotentie-identiteit |
| `PAY.attemptId` | elke `payStart` (`orderId-A<n>-<rand6>`) | per poging | callback-/timer-guard, `FINALIZED` |
| `PAY.txRef` | provider bij approved (fallback gegenereerd) | met de order | referentie op bon/scherm |
| `PAY.submitKey` | `IDEMP-<orderId>` | per order, nooit hergenereerd | POS-idempotentie |
| `PAY.recoveryRef` | bij submit-fout / herstel (`GUE-xxxxx`) | tot done | medewerkerreferentie |
| `ORDER_SESSION` | `newOrderReset` | per gastsessie | bindt alle timers/callbacks |

## 5. Persistentie (`localStorage['guestit.paidOrder.v3']`, schema 3)
Velden: schemaVersion, deviceId, orderId, orderSessionId, paymentAttemptId, transactionReference,
idempotencyKey, startedAt, paidAt, cart (snapshotregels), total, count, service, lang, recoveryReference,
submissionState (`starting|cancel-requested|timeout|approved|submitting|order-submit-failed|accepted`),
accepted, orderNo, savedAt. Geen kaart- of persoonsgegevens.

| Moment | Actie |
|---|---|
| `payStart` | schrijven `starting` (write-verify; mislukt → geen betaling) |
| cancel-requested / timeout / approved / submitting / order-submit-failed / accepted | overschrijven met die staat |
| definitief niets afgeschreven (`cancelled`, `declined`, `terminal-offline`, `not-charged`) | `persistClear()` |
| `payDone` | `accepted`, gewist na de printstap |
| **nooit** | bij onbekende uitkomst, tijdens cancel-requested, bij herstart |

**Herstart (`restorePaidSnapshot()`, in `bootSequence` vóór de verbinding):** ongeldig record → `assistance`
(ruw record in `PAY.rawRecovery`); `accepted` → `done`; `approved/submitting/order-submit-failed` →
`recovery-required` (hernieuwde verzending met dezelfde key); `starting/timeout/cancel-requested` →
`status-check` → `payment.status()`: `approved` → afronden, `not-charged` → schone start, anders `assistance`.
Lokale opslag is **nooit** bewijs van betaling. De korte-onderbrekingssessie (`sessionStorage['guestit.session']`,
TTL 3 min) is iets anders: die herstelt alleen een onbetaalde cart binnen dezelfde onderbreking.

## 6. Annuleringsverzoek vs definitieve annulering
- **Verzoek** (`payCancel`): alleen uit `connecting/waiting-for-card`; staat `cancel-requested`; snapshot, ids,
  key en record blijven; scherm *Betaling wordt geannuleerd…* zonder knoppen.
- **Definitief** (`payCancelFinal(att)`): alleen voor de actuele, niet-gefinaliseerde poging uit
  `connecting/waiting-for-card/processing/cancel-requested` → `cancelled`, gegevens gewist, scherm met
  *Opnieuw proberen* en *Terug naar bestelling*. Nooit na `approved` (`FINALIZED`-guard).

## 7. Late, dubbele en verouderde antwoorden; statuscontrole tijdens andere antwoorden
- `payApproveOnce(att)`: voegt `att` toe aan `FINALIZED`; tweede goedkeuring = no-op; goedkeuring na
  cancel-requested/timeout wordt verwerkt (order wordt betaald afgerond).
- Elke callback/timer controleert `ORDER_SESSION` én `attemptId`; antwoorden met expliciet andere `attemptId`
  worden genegeerd; na finalisatie kan geen `cancelled/declined/unknown` de staat nog veranderen
  (`payCancelFinal`/`payUncertain` weigeren).
- Lookup terwijl `start` nog loopt: beide monden uit in `payApproveOnce` (één keer) of in een definitieve
  staat; `lookup`-antwoorden voor een oudere poging worden genegeerd.

## 8. Timeouts en terminalproblemen (`ADAPTER_TIMEOUT_MS`)
`paymentStart 90 s` (guard) · `paymentStatus 12 s` · `paymentCancel 12 s` · `posSubmit 15 s` · `print 10 s` ·
`availability 8 s` · `health 5 s`. Timeout = **onbekend** (`withTimeout` → `AdapterTimeout`): status/cancel →
`timeout` + assistentie; submit → `recovery-required` (zelfde key); print → `receipt:'failed'` (order en
betaling onaangetast); availability → betalen geblokkeerd. `terminal-offline` → *Opnieuw verbinden*/terug.

## 9. Wat de backend moet garanderen (contract) vs. frontend
| Backend/hardware (verplicht) | Frontend (bewaakt) |
|---|---|
| `payment.status(attemptId)` is gezaghebbend en idempotent | nooit betalen uit onzekere staat; nooit twee pogingen tegelijk |
| `payment.cancel(attemptId)` geeft een definitief `cancelled` of `unknown` | cancel = verzoek; wissen alleen na definitieve bevestiging |
| `pos.submit(idempotencyKey)` slaat de key **duurzaam** op en geeft bij herhaling dezelfde order | één key per order; hernieuwde verzending nooit met nieuwe key; cart pas leeg na acceptatie |
| `pos.health()` weerspiegelt echte bereikbaarheid | offline → geen betaling, order bewaard |
| printer bevestigt daadwerkelijk printen | "bon geprint" alleen na bevestiging |
| server valideert prijzen/totalen opnieuw bij ontvangst | prijssnapshot + hervalidatie vóór betalen |

**Simulatie in de referentie:** `PAY.submittedKeys` (in geheugen) simuleert de duurzame key-opslag; dit biedt
géén productie-idempotentie. `DEMO_ADAPTERS` beantwoorden via `SIM.paymentResult` / `SIM.hang` / `SIM.printer`.

## 10. Bevindingen / onvolledigheden (concreet)
1. De cosmetische voortgangstimers zetten `waiting-for-card→processing` op tijd, niet op terminalevents; een echte
   terminal-adapter kan dit beter sturen (geen functionele consequentie, wel documentatie).
2. `payStart` accepteert `r.result==='approved'` ook zonder `txRef` (genereert er dan zelf één, prefix `TX-`); in
   productie moet de provider-referentie verplicht zijn (open punt).
3. `status-check` na herstart wacht niet op de verbinding (`connBoot` loopt erna); als de betaalservice offline is,
   valt het terug op `assistance` — bedoeld gedrag, maar de medewerker moet dan handmatig `Opnieuw verbinden`
   gebruiken.
4. `receipt` wordt niet in het record bewaard vóór de printstap; na een crash tijdens printen toont de herstart
   `done` zonder bonstatus (bon moet dan handmatig).
5. `assistance` kent geen medewerker-"afsluiten"-actie behalve via het technische paneel (reload) — bewust:
   productie vereist auth-adapter en een POS-zijdige afhandeling.
