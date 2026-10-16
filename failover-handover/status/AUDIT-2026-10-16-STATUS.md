# Audit 2026-10-16 — status of the findings

Audited commit: `85a3ff7` (main). Fixes on branch `audit-fixes-2026-10-16`. Evidence: `src/audit-2026-10-16.test.tsx`
(the audit's A01–A08 as desired behaviour plus the positive paths), `npm test`, `tsc -b`, `vite build`, `oxlint`.
Browser check (Vite dev server, Chrome, dev API menu): boot → first category with the venue identity, allergen sheet
focus / inert / Escape, payment screen staff entry, simulated payment to the success screen.

| # | Finding | Status | Where |
|---|---|---|---|
| F01 | Unknown payment recovery could submit an order | **Fixed** | `payment/controller.ts` (`paymentConfirmed`, `canSubmitOrder`), `payment/states.ts` |
| F02 | Retry bypassed price / availability / authority checks | **Fixed** | `app/checkout.ts` (`retryPay` → `toPay`), `ui/Pay.tsx` |
| F03 | Authority not re-validated after the async preflight | **Fixed** | `app/checkout.ts` (`connKey`, `startPay`, `priceConfirm`) |
| F04 | No staff entry on the assistance screen | **Fixed** | `ui/Pay.tsx` (`StaffEntry`), `ui/StaffPanel.tsx` |
| F05 | Unbounded menu request blocked payment recovery | **Fixed** | `app/App.tsx` (boot order, `retryMenu`), `adapters/http/catalogSource.ts` (`fetchMenu`) |
| F06 | API upsell options escaped stock validation | **Fixed** | `engine/draft.ts` (`stepOptionPids`, `optionUnavailable`), `ui/Pdp.tsx` |
| F07 | Late loyalty reply attached the previous guest | **Fixed** | `ui/Overlays.tsx` (`VoucherSheet`), `store/engine.ts` (`sessionGen`) |
| F08 | Empty API home page | **Fixed (minimal)** — first category when nothing to show; decision D2 (badges / promos) still open | `engine/catalog.ts` (`homeHasContent`), `store/engine.ts`, `ui/shell.tsx` |
| F09 | Product names not translated | **Fixed** | `engine/catalog.ts` (`pname`), mapper, UI |
| F10 | Venue identity changed between screens | **Fixed** | `ui/shell.tsx`, `app/App.tsx`, `ui/Attract.tsx` |
| F11 | Price-variant updates ignored | **Fixed** | `app/checkout.ts` (`catalogRefresh`) |
| F12 | Dialogs did not contain focus | **Fixed** | `ui/useModal.ts`, applied to sheets, dialogs, idle dialog, staff panel |
| — | `&eacute;` in descriptions | Fixed | `tmkMapper.ts` (`decodeEntities`) |
| — | Duplicated idle timing | Fixed — `config.idle` is the single source; `BRAND.sessionSettings` no longer read | `ui/Overlays.tsx` |
| — | README outdated | Fixed | `kiosk-web/README.md` |
| — | 17 lint warnings | Fixed (0) | — |

## Still NOT_VERIFIED_ON_REAL_INFRA / NOT_IMPLEMENTED (unchanged by this branch)

- Availability, current prices, payment, POS, printer, loyalty: static simulation only.
- Authority fencing, failover, backend deduplication: no real-node tests.
- `/img-proxy` exists only in the Vite dev/preview server; the production host / Launcher must provide it.
- 2 GB Android WebView performance: not measured.
