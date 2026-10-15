// Chooses where the menu comes from (static brand pack, kiosk API, or the API's test-mode menu) and loads it.

import type { CatalogSourceConfig } from '../../domain/types'
import { fetchEngineData } from '../../engine/data'
import type { EngineData, Lang } from '../../engine/types'
import type { TmkRoot } from './tmk'
import { mapTmkToEngine } from './tmkMapper'

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

export async function loadEngineData(base: string, s: CatalogSourceConfig, lang?: Lang): Promise<EngineData> {
  const pack = await fetchEngineData(base)
  if (s.source === 'static') return pack
  const url = catalogUrl(s)
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`menu ${url}: HTTP ${res.status}`)
  const raw = (await res.json()) as TmkRoot
  const root = base.endsWith('/') ? base : base + '/'
  return mapTmkToEngine(raw, pack, { img: (u) => proxiedImg(base, u), asset: (path) => root + path, lang })
}
