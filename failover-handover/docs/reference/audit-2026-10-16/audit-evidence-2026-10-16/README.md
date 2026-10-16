# Audit evidence — 2026-10-16

Target commit: `85a3ff728db5445413c4183b700fbff661eb2fdb`.

`audit.latest.test.tsx` is an audit-only regression suite. Copy it into `kiosk-web/src/audit.latest.test.tsx` in an isolated checkout of that commit, run `npm ci` in `kiosk-web`, then `npx vitest run src/audit.latest.test.tsx --reporter=verbose`.

Expected at the reviewed commit: **8 failures exposing defects; 2 passing checks for earlier fixes**. Assertions express desired behavior. Do not count the failures as failures of the original 62-test suite or commit this suite to a production branch without reviewing it. The test doubles intentionally avoid real payment/POS writes.

`regression-results.txt` contains the final test output. `startup-metrics.json` contains three measured desktop samples. `startup-probe.js` was injected into a copy of the generated `dist/index.html` named `audit-probe.html`; it only exposes Performance API metrics in a hidden DOM element. The production JavaScript bundle was unchanged. Open the probe with Vite preview, read `#audit-metrics`, and reload for repeated samples. These measurements are not cold-start, p95, Lighthouse, real-terminal, or 2 GB WebView results.

Browser observations also covered: the empty API home page, mixed venue/brand identity, category and cart flow, table-number entry, simulated payment/POS/receipt completion, inactivity reset, keyboard focus escaping an allergen dialog, and a 404 for an observed HTTP image-proxy URL when serving `dist` with a plain static server. No real payment was made and no real POS order was submitted.
