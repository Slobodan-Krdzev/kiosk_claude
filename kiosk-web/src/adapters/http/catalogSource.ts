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

export function mapMenu(raw: TmkRoot, pack: EngineData, base: string, lang?: Lang): EngineData {
  const root = base.endsWith('/') ? base : base + '/'
  // Pictures load from the full URL the backend sends (ImageUrl, PictureUrl, Url …), unchanged (Alex, 2026-10-27).
  return mapTmkToEngine(raw, pack, { img: (u) => u, asset: (path) => root + path, lang })
}

export async function loadEngineData(base: string, s: CatalogSourceConfig, lang?: Lang, timeoutMs?: number): Promise<EngineData> {
  const pack = await fetchEngineData(base)
  if (s.source === 'static') return pack
  return mapMenu(await fetchMenu(s, timeoutMs), pack, base, lang)
}
