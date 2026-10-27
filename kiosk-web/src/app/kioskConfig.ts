// `config.js` — the per-location backend address (handover "Kiosk config.js Setup", Alex, 2026-10-20; saved as
// failover-handover/docs/reference/kiosk-config-js-setup.md). The installer puts a plain script next to index.html:
//
//   window.kioskConfig = { api: "https://<this-location-backend>/api" }
//
// It is not part of the build (project root, not public/), so one build ships everywhere and only this file
// differs. When present, `api` replaces `catalogSource.apiBase` from config.json and selects the API menu;
// `?testMode=true` and `?source=static` still win, as in the old kiosk. When absent, config.json applies and the
// staff log says so (the old kiosk went blank instead).

export interface KioskConfigRead {
  /** Backend base URL, trailing slashes removed; null when config.js is missing or unusable. */
  api: string | null
  /** 'config.js' when the file provided the address, else 'config.json'. */
  origin: 'config.js' | 'config.json'
  /** Anything an installer should know (logged, shown in the staff panel). */
  problems: string[]
}

declare global {
  interface Window {
    kioskConfig?: { api?: unknown; imageBase?: unknown }
  }
}

export function readKioskConfig(w: Pick<Window, 'kioskConfig'> & { location?: { protocol: string } } = window): KioskConfigRead {
  const problems: string[] = []
  const kc = w.kioskConfig
  if (kc === undefined) return { api: null, origin: 'config.json', problems: ['config.js missing or not loaded: config.json apiBase applies'] }
  if (!kc || typeof kc !== 'object' || typeof kc.api !== 'string' || !kc.api.trim()) {
    return { api: null, origin: 'config.json', problems: ['config.js has no usable `api` string: config.json apiBase applies'] }
  }
  let api = kc.api.trim()
  if (/\/+$/.test(api)) {
    problems.push('config.js api had a trailing slash (removed)')
    api = api.replace(/\/+$/, '')
  }
  if (!/^https?:\/\//i.test(api)) {
    return { api: null, origin: 'config.json', problems: [`config.js api is not an http(s) URL (${api}): config.json apiBase applies`] }
  }
  if (!/\/api$/i.test(api)) problems.push('config.js api does not end in /api (the kiosk still uses it as given)')
  if (/^http:\/\//i.test(api) && w.location?.protocol === 'https:') problems.push('config.js api is http:// on an https:// kiosk page: browsers block that (mixed content)')
  return { api, origin: 'config.js', problems }
}

/** Host shown to staff ("kioskapi.dev.revelapps.com"), never the full URL with a path. */
export function apiHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

/**
 * Optional `imageBase` in config.js (2026-10-27): the public origin that serves the menu's pictures, e.g.
 * "http://f.revelapps.com:9091". The venue backend sends picture links on its local-network address
 * (http://192.168.0.2:9091/…), which a device outside that network cannot reach. With imageBase set, a picture link
 * on a private-network host is loaded from imageBase instead (same path). Unset or not an http(s) URL → links as sent.
 */
export function readImageBase(w: Pick<Window, 'kioskConfig'> = window): string | null {
  const v = w.kioskConfig?.imageBase
  if (typeof v !== 'string') return null
  const t = v.trim().replace(/\/+$/, '')
  return /^https?:\/\/[^/]+$/i.test(t) ? t : null
}
