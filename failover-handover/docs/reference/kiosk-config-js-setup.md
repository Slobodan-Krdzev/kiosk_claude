# Kiosk config.js Setup

Oct 20, 2026 · @Aleksander Dolstra

## What config.js is

`config.js` is the only file that tells an installed kiosk which backend to talk to. It is **not part of the build**. Each location gets its own copy, placed next to `index.html` by whoever installs the kiosk. Without it the app cannot load the menu, check stock or take payments.

The whole file is one setting:

```javascript
window.kioskConfig = {
    api: "https://kioskapi.dev.revelapps.com/api"
}
```

| Key | Type | Meaning | Rules |
| --- | --- | --- | --- |
| `api` | string | Base URL of the kiosk backend for this location | Full URL with `https://` (or `http://` for a local server), ending in `/api`, **no trailing slash** |

The value in the repo (`kioskapi.dev.revelapps.com`) is the **dev** backend. A live location must point at its own production or local backend instead.

**Why a separate file:** `index.html` loads `config.js` with a plain `<script src="./config.js">` before the app starts. Vite does not bundle it, so the same build can ship to every location and only this file changes. Changing the backend needs no rebuild: edit the file and reload the kiosk.

## Installing at a location

The installer copies the build, adds `config.js` beside `index.html`, and checks two URLs in a browser.

1. **Get the build.** On a dev machine run `npm run build`. The output is the `dist/` folder. `dist/` does **not** contain `config.js`, because it lives in the project root and is not bundled.
2. **Copy `dist/` to the kiosk's web server.** Copy the whole folder content (`index.html`, `index<hash>.js`, `index<hash>.css`, images, `allergens/`, `service-worker.js` and so on) to the folder the server serves.
3. **Create `config.js` in the same folder as `index.html`.** The filename is exact and case-sensitive.

   ```javascript
   window.kioskConfig = {
       api: "https://<this-location-backend>/api"
   }
   ```

   Use the backend address for this location. No trailing slash after `/api`.
4. **Check the file is served.** Open `https://<kiosk-host>/config.js` in a browser. It must show the file content, not a 404 and not the app's HTML.
5. **Check the backend answers.** Open `<api>/getfullresources` in a browser. It must return JSON with the menu.
6. **Start the kiosk.** Open `https://<kiosk-host>/` on the device. The start screen should show this location's menu and colours.

Folder after install:

```
<web root>/
├── index.html          ← from dist
├── config.js           ← added by the installer, per location
├── index<hash>.js      ← from dist
├── index<hash>.css     ← from dist
├── allergens/          ← from dist
└── ...                 ← rest of dist
```

**Updating the app later:** copy the new `dist/` over the old one, but **keep `config.js`**. A new build never overwrites it, because the build has none. Do not delete the folder first unless you back up `config.js`.

**Changing the backend later:** edit `config.js` and reload the kiosk page. No rebuild is needed. If the old address still shows, the server or browser has cached the file; do a hard reload or clear the browser cache.

Do not add `?testMode=true` to a live kiosk URL: test mode loads a test menu and never sends orders. `?menuId=` is not needed for a live kiosk, with one exception: Dadawan (menu 2490) needs `?menuId=2490` for its text colours to swap correctly.

## How the app uses it later

&#91;embedded content: how config.js is used · 1 setting, 4 live endpoints\]

The app never stores the address anywhere else. Every request joins `window.kioskConfig.api` and an endpoint path at the moment it is sent, so all four live calls go to the backend named in `config.js`.

| Endpoint | Built in | When it runs |
| --- | --- | --- |
| `GET {api}/getfullresources` | `src/Query/Get.ts` | Once at start-up (and again on window focus or network reconnect, by React Query default) |
| `GET {api}/checkProductAvailable?idProduct=<id>` | `src/Query/CheckAvailability.ts` | Each product card tap, info tap and add in the detail sheet |
| `POST {api}/CreateKioskOrderWithPinPayment?skip=false\|true` | `src/Query/SendOrder.ts` | Checkout Pay, and “continue without printing” |
| `GET {api}/abortRequest` | `src/Contexts/OrderContext/OrderContextProvider.tsx` | Back or Cancel on the Payment screen |

The type is declared in `src/env.d.ts` (`window.kioskConfig: { api: string }`). The app has no fallback value: the default in `src/main.tsx` is commented out.

Two addresses do **not** come from `config.js`: the test-mode menu (`https://my.tabletmenukaart.nl/service/kioskTestModeResources`, only with `?testMode=true`) and the dead receipt e-mail call (`http://192.168.1.129:9988`). Product images come from the URLs inside the menu data.

## Troubleshooting

A missing or wrong `config.js` shows up as a kiosk that never gets past loading or never takes an order.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Blank screen or endless loading; console says `Cannot read properties of undefined (reading 'api')` | `config.js` missing, wrong name, or in the wrong folder | Put `config.js` next to `index.html`; check `https://<kiosk-host>/config.js` opens |
| `/config.js` opens the app's HTML instead of the file | Server rewrites every unknown path to `index.html`, so the file is not where the server looks | Place the file in the served root, or exclude `config.js` from the rewrite |
| Menu loads from the wrong location | `api` points at another location's backend (or the dev backend) | Fix the `api` value, reload |
| Network errors in console with `//getfullresources` or `//CreateKioskOrderWithPinPayment` | Trailing slash after `/api` | Remove the trailing slash |
| Menu fails, console shows CORS or mixed-content errors | Kiosk served over `https` but `api` is `http`, or the backend does not allow this origin | Use `https` for the API, or allow the kiosk origin on the backend |
| Products tap fine but every one says “Out Of Stock” | `checkProductAvailable` cannot be reached; a failed check counts as out of stock | Check the backend is up and reachable from the kiosk network |
| Payment screen never moves on | `CreateKioskOrderWithPinPayment` failed; the app shows no error for this (see Kiosk Payment Flow) | Check the backend and the PIN terminal connection |
| Old backend still used after editing the file | Cached `config.js` | Hard reload or clear the browser cache on the kiosk |
