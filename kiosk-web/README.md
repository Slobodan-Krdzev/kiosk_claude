# Guestit Kiosk (web)

React + TypeScript self-service kiosk. Built against the rules in `../failover-handover/` and the v36 kiosk
reference (payment state machine, durable paid-order record, idempotent POS submit, order tag).

Today it runs on **static JSON fixtures** (`public/mock/*.json`) behind an adapter interface. Later the same UI
runs inside the Guestit Launcher (Kotlin WebView) which injects `window.GuestitAdapters`, or against an HTTP
backend. Nothing in the UI talks to a backend directly.

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (pick another port with --port if taken)
npm test           # unit tests (payment state machine, cart, order tag, persistence)
npm run build      # production bundle in dist/ (relative paths, ES2018 for older WebViews)
```

Staff panel: tap the logo 5 times within 3 seconds, PIN is `staffPin` in `public/mock/config.json` (demo: 2468).
The **Simulation** tab switches terminal / POS / printer / health outcomes, hangs, connectivity scenarios,
unavailable products and price changes. The **Status** tab shows the payment record, idempotency key, recovery
reference and connection state. Simulation is never evidence of production behaviour.

## Layout

```
src/
  adapters/        GuestitAdapters interface (+ withTimeout); static/ = JSON fixtures + simulated terminal/POS/printer
  domain/          pure logic: types, cart pricing, upsell offers, order tag validation, ids, connectivity state
  payment/         v36 state machine: states.ts (tables), controller.ts (logic), persistence.ts (durable record)
  store/           zustand kiosk store; usePayState() bridges the controller into React
  app/             runtime (singletons), boot + screen routing (App.tsx), checkout preflight, session persistence
  screens/         Attract/Service, Menu (+ProductSheet), Cart, Upsell, OrderTag, Payment, Confirmation, StaffPanel
  components/      ui primitives, IdleGuard
  i18n/            strings EN / NL / MK
public/mock/       config.json, catalog.json, cms.json (upsell), availability.json, catalog-current.json, members.json
```

## Guarantees implemented on the client (see `../failover-handover/CLAUDE.md`)

- The paid-order record is written **before** the terminal is called; if the write fails, no payment starts.
- One `attemptId` per attempt; approval is applied exactly once; late/duplicate answers are ignored.
- A timeout is **unknown**: the guest is never asked to pay again automatically; status lookup resolves it.
- The idempotency key `IDEMP-<orderId>` never changes across retries, resend or restart.
- The success screen appears only after the POS returned an `orderNo`; the cart is cleared only then.
- Paid but not accepted → `recovery-required` with a staff reference, survives restart, resend with the same key.
- Inactivity reset never clears an uncertain or paid state.
- Payment is blocked unless the connection state is `connected` (authority comes from the backend/Launcher).

## Replacing the fixtures

Implement `GuestitAdapters` (`src/adapters/types.ts`) and either inject it as `window.GuestitAdapters` from the
Launcher before the page loads, or add an `HttpAdapters` implementation and select it in `src/adapters/index.ts`.
In `production` mode the kiosk refuses to run on the static simulation.
