// Chooses where the menu comes from (static brand pack, kiosk API, or the API's test-mode menu) and loads it.

import type { CatalogSourceConfig } from '../../domain/types'
import { fetchEngineData } from '../../engine/data'
import type { EngineData, Lang } from '../../engine/types'
import type { TmkRoot } from './tmk'
import { mapTmkToEngine } from './tmkMapper'
import { normalizeVenueDesign, type VenueDesign } from './venueDesign'

export const DEFAULT_SOURCE: CatalogSourceConfig = {
  source: 'static',
  apiBase: 'https://kioskapi.dev.revelapps.com/api',
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
 * Image proxy (decision 2026-10-15): plain-http images from the API are fetched through the kiosk host
 * so an https kiosk does not block them as mixed content. Served by the Vite dev/preview server
 * (vite.config.ts); the production host or the Launcher must provide the same /img-proxy route.
 */
export function proxiedImg(base: string, url: string): string {
  if (!/^http:\/\//i.test(url)) return url
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

/** The venue design file: `catalogSource.designUrl`, else `venue/<menuId>.json` under the page base. */
export function designUrl(s: CatalogSourceConfig, base: string): string {
  if (s.designUrl) return s.designUrl
  const root = base.endsWith('/') ? base : base + '/'
  return `${root}venue/${encodeURIComponent(String(s.menuId))}.json`
}

/**
 * Fetch the venue design file, bounded like the menu. A missing file (404) is normal: the kiosk then shows the
 * API data alone. Any other failure is reported in `error` and treated the same way — design never blocks the menu.
 */
export async function fetchDesign(url: string, timeoutMs = DEFAULT_MENU_TIMEOUT_MS): Promise<{ raw: unknown; error?: string }> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { cache: 'no-cache', signal: ctl.signal })
    if (res.status === 404) return { raw: null }
    if (!res.ok) return { raw: null, error: `design ${url}: HTTP ${res.status}` }
    return { raw: await res.json() }
  } catch (e) {
    return { raw: null, error: ctl.signal.aborted ? `design ${url}: timed out after ${timeoutMs} ms` : `design ${url}: ${String(e)}` }
  } finally {
    clearTimeout(timer)
  }
}

/** Validate a fetched design file against the pack's badge and icon sets. */
export function designFor(raw: unknown, pack: EngineData): { design: VenueDesign | undefined; problems: string[] } {
  if (raw == null) return { design: undefined, problems: [] }
  const { design, problems } = normalizeVenueDesign(raw, { badges: Object.keys(pack.bdg), icons: Object.keys(pack.icons) })
  return { design, problems }
}

export function mapMenu(raw: TmkRoot, pack: EngineData, base: string, lang?: Lang, design?: VenueDesign): EngineData {
  const root = base.endsWith('/') ? base : base + '/'
  return mapTmkToEngine(raw, pack, { img: (u) => proxiedImg(base, u), asset: (path) => root + path, lang, design })
}

export async function loadEngineData(base: string, s: CatalogSourceConfig, lang?: Lang, timeoutMs?: number): Promise<EngineData> {
  const pack = await fetchEngineData(base)
  if (s.source === 'static') return pack
  const [raw, dz] = await Promise.all([fetchMenu(s, timeoutMs), fetchDesign(designUrl(s, base), timeoutMs)])
  return mapMenu(raw, pack, base, lang, designFor(dz.raw, pack).design)
}
