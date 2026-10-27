// Copy to <web root>/config.js next to index.html. Full URL, ending in /api, no trailing slash.
window.kioskConfig = {
  api: "https://<this-location-backend>/api",
  // Optional: public origin for menu pictures that the backend links on a local-network address (e.g. http://192.168.0.2:9091).
  // imageBase: "http://<public-host>:9091"
}
