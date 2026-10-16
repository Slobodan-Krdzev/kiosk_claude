// Live checks against the kiosk API, as the old kiosk performs them (docs/reference/kiosk-product-checks.md, 2026-10-16).
// Only `checkProductAvailable` exists; there is no price endpoint, so current() reports no price changes.

import type { CatalogCurrent, CatalogSourceConfig } from '../../domain/types'
import type { AvailabilityAdapter, AvailabilityResult, CatalogAdapter, GuestitAdapters } from '../types'
import { TmkOrderPayment, type TmkOrderOptions } from './tmkOrder'

export const DEFAULT_AVAILABILITY_TIMEOUT_MS = 8_000
const DEFAULT_CONCURRENCY = 4

/** GET {api}/checkProductAvailable?idProduct=<ProductId> → bare JSON boolean (captured: api-samples/checkProductAvailable-*.json). */
export function availabilityUrl(apiBase: string, productId: string): string {
  return `${apiBase.replace(/\/+$/, '')}/checkProductAvailable?idProduct=${encodeURIComponent(productId)}`
}

export interface TmkAvailabilityOptions {
  /** Per-request bound; the request is aborted after this. */
  timeoutMs?: number
  /** Requests in flight at once (the API has one product per call). */
  concurrency?: number
  fetch?: typeof fetch
}

/**
 * One request per product. `true` → available, `false` → sold out; a non-2xx response, a network error, a timeout
 * or a body that is not a boolean → UNKNOWN. Unknown is reported separately and never counted as "available"
 * (the old kiosk treated it as sold out; our callers decide: checkout refuses to charge, a tap says "try again").
 */
export class TmkAvailability implements AvailabilityAdapter {
  private readonly apiBase: string
  private readonly timeoutMs: number
  private readonly concurrency: number
  private readonly fetchFn: typeof fetch

  constructor(apiBase: string, opts: TmkAvailabilityOptions = {}) {
    this.apiBase = apiBase
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_AVAILABILITY_TIMEOUT_MS
    this.concurrency = Math.max(1, opts.concurrency ?? DEFAULT_CONCURRENCY)
    this.fetchFn = opts.fetch ?? ((input, init) => fetch(input, init))
  }

  async checkOne(productId: string): Promise<boolean | null> {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), this.timeoutMs)
    try {
      const res = await this.fetchFn(availabilityUrl(this.apiBase, productId), { cache: 'no-store', signal: ctl.signal })
      if (!res.ok) return null
      const body: unknown = await res.json()
      return typeof body === 'boolean' ? body : null
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  async check(productIds: string[]): Promise<AvailabilityResult> {
    const ids = [...new Set(productIds)]
    const unavailableIds: string[] = []
    const unknownIds: string[] = []
    let next = 0
    const worker = async () => {
      while (next < ids.length) {
        const id = ids[next++]
        const r = await this.checkOne(id)
        if (r === false) unavailableIds.push(id)
        else if (r === null) unknownIds.push(id)
      }
    }
    await Promise.all(Array.from({ length: Math.min(this.concurrency, ids.length) }, worker))
    return { unavailableIds, unknownIds }
  }
}

/** Test mode (`?testMode=true`): the old kiosk overrides every result to "available" and sends no request. */
export class AllAvailable implements AvailabilityAdapter {
  async check(): Promise<AvailabilityResult> {
    return { unavailableIds: [], unknownIds: [] }
  }
}

/**
 * The kiosk API has no "current prices" call: prices come from the startup menu and the backend validates the
 * order (kiosk-product-checks.md, "Prices"). So current() reports no changes and only stamps the menu version
 * (BLOCKED_BACKEND for live prices — see status/BACKEND-DEPENDENCIES.md).
 */
export function liveCatalog(base: CatalogAdapter, menuVersion: () => number): CatalogAdapter {
  return {
    config: () => base.config(),
    load: () => base.load(),
    cms: () => base.cms(),
    async current(): Promise<CatalogCurrent> {
      return { version: menuVersion(), prices: {}, variants: {}, disabled: [] }
    },
  }
}

/**
 * Replace the simulated availability / current-price adapters with the live API ones when the menu comes from
 * the API. Everything else (payment, POS, printer, loyalty…) stays as resolved. Injected Launcher adapters
 * (kind !== 'static') are never overridden: the Launcher owns those calls then.
 */
export function withLiveAdapters(adapters: GuestitAdapters, source: CatalogSourceConfig, menuVersion: () => number, opts: TmkAvailabilityOptions = {}, order?: TmkOrderOptions): GuestitAdapters {
  if (adapters.kind !== 'static' || source.source === 'static') return adapters
  const availability = source.source === 'test' ? new AllAvailable() : new TmkAvailability(source.apiBase, opts)
  const live = { ...adapters, availability, catalog: liveCatalog(adapters.catalog, menuVersion) }
  // Test mode keeps the simulated terminal (the old kiosk never sent an order in test mode either).
  if (source.source !== 'api' || !order) return live
  // One POST does terminal + order + receipt: one instance serves payment, POS and printer (docs/reference/order-payment-integration.md).
  const op = new TmkOrderPayment(source.apiBase, { ...order, tableNumber: order.tableNumber ?? source.tableNumber })
  return { ...live, payment: op, pos: op, printer: op }
}
