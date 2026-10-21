// Kiosk service worker (PWA, 2026-10-21). Plain script, no dependencies. __BUILD__ is replaced at build time.
//
// Rules (money and orders are never served from a cache):
// - API calls (menu, availability, order POST, abortRequest) and anything that is not a GET: not touched.
// - config.js and the menu JSON fixtures: network first, cache only as an offline fallback.
// - The page (navigation): network first, cached copy when the network is down.
// - Hashed build assets, fonts, icons: cache first (a new build has new file names).
// - Menu pictures (any origin): cache first, bounded — this is what makes pictures appear instantly after a restart.
// Updates: a new worker waits; the page tells it to take over only while no guest is ordering (sw-register.ts).

const BUILD = '__BUILD__'
const SHELL = `kiosk-shell-${BUILD}`
const IMAGES = 'kiosk-images-v1'
const MAX_IMAGES = 1500
const PRECACHE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).catch(() => undefined))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, IMAGES])
      for (const name of await caches.keys()) if (!keep.has(name)) await caches.delete(name)
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

const isApi = (url) => /\/api\//i.test(url.pathname) || /\/service\//i.test(url.pathname)

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const res = await fetch(request)
    if (res && res.ok) await cache.put(request, res.clone())
    return res
  } catch (e) {
    const hit = await cache.match(request, { ignoreSearch: request.mode === 'navigate' })
    if (hit) return hit
    throw e
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(request)
  if (hit) return hit
  const res = await fetch(request)
  if (res && res.ok) await cache.put(request, res.clone())
  return res
}

// Menu pictures: cache first. Hosts that allow cross-origin reads (my.tabletmenukaart.nl does) are fetched in cors
// mode and stored; a host that does not (opaque response) is passed through and left to the browser's HTTP cache,
// because opaque entries count ~7 MB each against the storage quota.
async function imageFirst(request) {
  const cache = await caches.open(IMAGES)
  const hit = await cache.match(request.url)
  if (hit) return hit
  const url = new URL(request.url)
  if (url.origin === self.location.origin) return cacheFirst(request, SHELL)
  let res
  try {
    res = await fetch(request.url, { mode: 'cors', credentials: 'omit' })
  } catch {
    return fetch(request)
  }
  if (res.ok && res.type !== 'opaque') {
    await cache.put(request.url, res.clone())
    const keys = await cache.keys()
    for (let i = 0; i < keys.length - MAX_IMAGES; i++) await cache.delete(keys[i])
  }
  return res
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (isApi(url)) return
  const sameOrigin = url.origin === self.location.origin

  if (req.destination === 'image') {
    event.respondWith(imageFirst(req).catch(() => fetch(req)))
    return
  }
  if (!sameOrigin) return
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, SHELL))
    return
  }
  if (/\/config\.js$/.test(url.pathname) || /\/mock\//.test(url.pathname) || /\/sw\.js$/.test(url.pathname)) {
    event.respondWith(networkFirst(req, SHELL))
    return
  }
  event.respondWith(cacheFirst(req, SHELL))
})
