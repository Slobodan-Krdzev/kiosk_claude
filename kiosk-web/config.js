// Per-location kiosk configuration. This copy points at the f.revelapps.com backend and is served by the dev server only;
// `npm run build` does not include it. An installer writes this file next to index.html on the kiosk host.
window.kioskConfig = {
  api: "http://f.revelapps.com:9543/api/",
  // Pictures: the menu links them on the venue's local address (192.168.0.2:9091); load them from here instead.
  imageBase: "http://f.revelapps.com:9091"
}
