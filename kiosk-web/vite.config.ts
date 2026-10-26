import type { Connect, Plugin } from 'vite'
import { execSync } from 'node:child_process'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Image proxy (decision 2026-10-15): the kiosk API serves menu images over plain http, which an https
// kiosk page would block. GET /img-proxy?u=<http url> fetches the image server-side.
// Only the API's image hosts and local-network servers (a venue's own backend, e.g. 192.168.0.2:9091 —
// 2026-10-21) are allowed, so this is not an open proxy.
const IMG_HOSTS = new Set(['my.tabletmenukaart.nl', 'kioskapi.dev.revelapps.com'])
const isLanHost = (h: string): boolean =>
  h === 'localhost' || /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
const IMG_MAX_BYTES = 8 * 1024 * 1024

const imgProxy: Connect.NextHandleFunction = async (req, res, next) => {
  if (!req.url?.startsWith('/img-proxy')) return next()
  let target: URL
  try {
    target = new URL(new URL(req.url, 'http://local').searchParams.get('u') || '')
  } catch {
    res.statusCode = 400
    return res.end('bad url')
  }
  if (!/^https?:$/.test(target.protocol) || !(IMG_HOSTS.has(target.hostname) || isLanHost(target.hostname))) {
    res.statusCode = 403
    return res.end('host not allowed')
  }
  try {
    const up = await fetch(target, { signal: AbortSignal.timeout(15000) })
    const type = up.headers.get('content-type') || ''
    if (!up.ok || !type.startsWith('image/')) {
      res.statusCode = up.ok ? 415 : up.status
      return res.end()
    }
    const body = Buffer.from(await up.arrayBuffer())
    if (body.length > IMG_MAX_BYTES) {
      res.statusCode = 413
      return res.end()
    }
    res.setHeader('Content-Type', type)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.end(body)
  } catch {
    res.statusCode = 502
    res.end()
  }
}

const imgProxyPlugin = (): Plugin => ({
  name: 'guestit-img-proxy',
  configureServer: (server) => void server.middlewares.use(imgProxy),
  configurePreviewServer: (server) => void server.middlewares.use(imgProxy),
})

// Relative base so the built bundle can be served from any folder
// (dev server, static host, or the Guestit Launcher WebView later).
/** Build stamp shown in the staff panel and the boot log, so a device can say which build it runs. */
function buildStamp(): { sha: string; at: string } {
  let sha = 'unknown'
  try {
    sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    /* no git on the build machine */
  }
  return { sha, at: new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z' }
}

export default defineConfig({
  plugins: [react(), imgProxyPlugin()],
  base: './',
  define: { __KIOSK_BUILD__: JSON.stringify(buildStamp()) },
  build: {
    target: 'es2018', // older Android WebViews on 2–4 GB kiosks
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
