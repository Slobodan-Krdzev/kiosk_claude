// Chooses where the menu comes from (static brand pack, kiosk API, or the API's test-mode menu) and loads it.

import type { CatalogSourceConfig } from '../../domain/types'
import { fetchEngineData } from '../../engine/data'
import type { EngineData, Lang } from '../../engine/types'
import type { TmkRoot } from './tmk'
import { mapTmkToEngine } from './tmkMapper'

export const DEFAULT_SOURCE: CatalogSourceConfig = {
  source: 'static',
  // Default backend for production too (Alex, 2026-10-26); a config.js next to index.html still overrides it.
  apiBase: 'http://f.revelapps.com:9543/api',
  testUrl: 'https://my.tabletmenukaart.nl/service/kioskTestModeResources',
  menuId: 2408,
}

/** config.json catalogSource, overridden by ?source=static|api|test and ?menuId=<n> (as in the old kiosk). */
export function resolveCatalogSource(cfg: Partial<CatalogSourceConfig> | undefined, search: string): CatalogSourceConfig {
  const out = { ...DEFAULT_SOURCE, ...(cfg || {}) }
  const q = new URLSearchParams(search)
  const src = q.get('source')
  if (src === 'static' || src === 'api' || src === 'test') out.source = src
  if (q.get('testMode') === 'true') out.source = 'test'
  const menu = Number(q.get('menuId'))
  if (Number.isInteger(menu) && menu > 0) out.menuId = menu
  return out
}

export function catalogUrl(s: CatalogSourceConfig): string {
  if (s.source === 'test') return `${s.testUrl}?menu=${encodeURIComponent(String(s.menuId))}`
  return `${s.apiBase.replace(/\/+$/, '')}/getfullresources`
}

/**
 * Plain-http menu images (the test menu's my.tabletmenukaart.nl serves all of them as http://).
 * - Development (`vite` dev/preview server): fetched through the server's /img-proxy route (vite.config.ts).
 * - Production build: the same image over https. No proxy route exists on a venue's web server (images were
 *   missing on the test server, 2026-10-21), and both image hosts answer https (checked 2026-10-21); an https
 *   kiosk page would block or auto-upgrade http images anyway.
 */
export function proxiedImg(base: string, url: string, dev: boolean = import.meta.env.DEV, pageProtocol: string = typeof location !== 'undefined' ? location.protocol : 'https:'): string {
  if (!/^http:\/\//i.test(url)) return url
  // Production: an http kiosk page (e.g. a venue's local server http://192.168.0.2:9544) loads the image exactly
  // as the menu gives it; only an https page upgrades it, because browsers block http images there.
  if (!dev) return pageProtocol === 'https:' ? url.replace(/^http:\/\//i, 'https://') : url
  const root = base.endsWith('/') ? base : base + '/'
  return `${root}img-proxy?u=${encodeURIComponent(url)}`
}

export const DEFAULT_MENU_TIMEOUT_MS = 20_000

/**
 * Fetch the remote menu, bounded: the request is aborted after `timeoutMs` (audit F05, 2026-10-16).
 * A hanging or failing menu service must never block payment recovery, so boot runs this in parallel
 * with the brand pack and only awaits it after the payment controller was restored.
 */
export async function fetchMenu(s: CatalogSourceConfig, timeoutMs = DEFAULT_MENU_TIMEOUT_MS): Promise<TmkRoot> {
  const url = catalogUrl(s)
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { cache: 'no-cache', signal: ctl.signal })
    if (!res.ok) throw new Error(`menu ${url}: HTTP ${res.status}`)
    return (await res.json()) as TmkRoot
  } catch (e) {
    if (ctl.signal.aborted) throw new Error(`menu ${url}: timed out after ${timeoutMs} ms`)
    throw e
  } finally {
    clearTimeout(timer)
  }
}

/** A private-network host (10/8, 172.16/12, 192.168/16, 127/8, localhost). */
export const isPrivateHost = (h: string): boolean =>
  h === 'localhost' || /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)

/** config.js imageBase (kioskConfig.readImageBase): picture links on a private-network host move to this origin. */
let imageBase: string | null = null
export const setImageBase = (v: string | null): void => {
  imageBase = v
}

export function rehostImg(url: string, base: string | null = imageBase): string {
  if (!base) return url
  try {
    const u = new URL(url)
    return isPrivateHost(u.hostname) ? base + u.pathname + u.search : url
  } catch {
    return url
  }
}

export function mapMenu(raw: TmkRoot, pack: EngineData, base: string, lang?: Lang): EngineData {
  const root = base.endsWith('/') ? base : base + '/'
  return mapTmkToEngine(raw, pack, { img: (u) => proxiedImg(base, rehostImg(u)), asset: (path) => root + path, lang })
}

export async function loadEngineData(base: string, s: CatalogSourceConfig, lang?: Lang, timeoutMs?: number): Promise<EngineData> {
  const pack = await fetchEngineData(base)
  if (s.source === 'static') return pack
  return mapMenu(await fetchMenu(s, timeoutMs), pack, base, lang)
}
