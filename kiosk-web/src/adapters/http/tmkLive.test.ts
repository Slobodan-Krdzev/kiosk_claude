// @vitest-environment node
// Live availability adapter against a mocked fetch. The captured responses in api-samples/ are shape evidence
// (bare boolean body, HTTP 500 for an unknown id); they are not live verification.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it, vi } from 'vitest'
import type { CatalogSourceConfig } from '../../domain/types'
import type { GuestitAdapters } from '../types'
import { AllAvailable, TmkAvailability, availabilityUrl, withLiveAdapters } from './tmkLive'

const SAMPLES = resolve(process.cwd(), '../failover-handover/docs/reference/api-samples')
const API = 'https://kioskapi.dev.revelapps.com/api/'

type Script = Record<string, { status?: number; body?: string; throws?: boolean; hang?: boolean }>
function fetchFor(script: Script, seen: string[] = [], inFlight = { now: 0, max: 0 }): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const id = new URL(url).searchParams.get('idProduct')!
    seen.push(id)
    const s = script[id] || {}
    inFlight.now++
    inFlight.max = Math.max(inFlight.max, inFlight.now)
    try {
      await new Promise((r) => setTimeout(r, 2))
      if (s.hang) {
        await new Promise((_, rej) => init?.signal?.addEventListener('abort', () => rej(new Error('aborted'))))
      }
      if (s.throws) throw new TypeError('network down')
      return new Response(s.body ?? 'true', { status: s.status ?? 200, headers: { 'content-type': 'application/json' } })
    } finally {
      inFlight.now--
    }
  }) as unknown as typeof fetch
}

describe('checkProductAvailable (kiosk-product-checks.md §2)', () => {
  it('one GET per product, ?idProduct=<ProductId>, under the configured API base', () => {
    expect(availabilityUrl(API, '454992')).toBe('https://kioskapi.dev.revelapps.com/api/checkProductAvailable?idProduct=454992')
    expect(availabilityUrl('https://x/api', 'a b')).toBe('https://x/api/checkProductAvailable?idProduct=a%20b')
  })

  it('captured dev response is a bare boolean; an unknown id answers HTTP 500', () => {
    expect(JSON.parse(readFileSync(resolve(SAMPLES, 'checkProductAvailable-454992.json'), 'utf8'))).toBe(true)
    expect(readFileSync(resolve(SAMPLES, 'checkProductAvailable-1.headers.txt'), 'utf8')).toMatch(/HTTP\/2 500/)
  })

  it('true → available, false → sold out, 500 / network error / non-boolean body → unknown (never "available")', async () => {
    const seen: string[] = []
    const a = new TmkAvailability(API, { fetch: fetchFor({ ok: {}, out: { body: 'false' }, err: { status: 500, body: '{"Message":"An error has occurred."}' }, net: { throws: true }, odd: { body: '{"a":1}' } }, seen) })
    const r = await a.check(['ok', 'out', 'err', 'net', 'odd', 'ok'])
    expect(r.unavailableIds).toEqual(['out'])
    expect([...(r.unknownIds ?? [])].sort()).toEqual(['err', 'net', 'odd'])
    expect(seen.sort()).toEqual(['err', 'net', 'odd', 'ok', 'out']) // duplicates are checked once
  })

  it('a request that hangs is aborted after timeoutMs and counts as unknown', async () => {
    const a = new TmkAvailability(API, { fetch: fetchFor({ slow: { hang: true } }), timeoutMs: 30 })
    const r = await a.check(['slow', 'fast'])
    expect(r).toEqual({ unavailableIds: [], unknownIds: ['slow'] })
  })

  it('fans out with bounded concurrency', async () => {
    const inFlight = { now: 0, max: 0 }
    const ids = Array.from({ length: 9 }, (_, i) => 'p' + i)
    const a = new TmkAvailability(API, { fetch: fetchFor({}, [], inFlight), concurrency: 3 })
    const r = await a.check(ids)
    expect(r.unavailableIds).toEqual([])
    expect(inFlight.max).toBeLessThanOrEqual(3)
    expect(inFlight.max).toBeGreaterThan(1)
  })

  it('test mode answers "available" without a request (old kiosk testMode override)', async () => {
    expect(await new AllAvailable().check()).toEqual({ unavailableIds: [], unknownIds: [] })
  })
})

describe('withLiveAdapters', () => {
  const base = (kind: GuestitAdapters['kind']) =>
    ({
      kind,
      availability: { check: async () => ({ unavailableIds: ['sim'] }) },
      catalog: { config: async () => ({}), load: async () => ({}), cms: async () => ({}), current: async () => ({ version: 1, prices: { a: 1 }, variants: {}, disabled: ['a'] }) },
    }) as unknown as GuestitAdapters
  const src = (source: CatalogSourceConfig['source']): CatalogSourceConfig => ({ source, apiBase: API, testUrl: 'https://t/', menuId: 1 })

  it('API menu on the simulation: live availability, no-op prices stamped with the menu version', async () => {
    const live = withLiveAdapters(base('static'), src('api'), () => 4242)
    expect(live.availability).toBeInstanceOf(TmkAvailability)
    expect(await live.catalog.current()).toEqual({ version: 4242, prices: {}, variants: {}, disabled: [] })
  })
  it('test-mode menu: every product available, no request', () => {
    expect(withLiveAdapters(base('static'), src('test'), () => 1).availability).toBeInstanceOf(AllAvailable)
  })
  it('static menu or injected Launcher adapters: untouched', () => {
    const s = base('static')
    expect(withLiveAdapters(s, src('static'), () => 1)).toBe(s)
    const b = base('bridge')
    expect(withLiveAdapters(b, src('api'), () => 1)).toBe(b)
  })
})
