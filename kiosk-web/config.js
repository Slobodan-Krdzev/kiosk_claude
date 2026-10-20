// Per-location kiosk configuration. This copy points at the DEV backend and is served by the dev server only;
// `npm run build` does not include it. An installer writes this file next to index.html on the kiosk host.
window.kioskConfig = {
  api: "https://kioskapi.dev.revelapps.com/api"
}
