// Regression tests for the audit of 2026-10-16 (failover-handover/docs/reference/audit-2026-10-16/).
// Each test states the DESIRED behaviour; the audit's A01–A08 reproduced the defects on commit 85a3ff7.
// Fakes only: no real payment, POS or network.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import configRaw from '../public/mock/config.json'
import { fetchMenu } from './adapters/http/catalogSource'
import { createStaticAdapters } from './adapters/static/staticAdapters'
import { toPay } from './app/checkout'
import { createRuntime } from './app/runtime'
import type { GuestitConfig } from './domain/types'
import { addToCart } from './engine/cart'
import { finalizeEngineData } from './engine/data'
import { newDraft } from './engine/draft'
import { E, setAllergenFilter, setDisabled, setEngine, setLang, setUnavailable } from './engine/state'
import type { EngineData } from './engine/types'
import { PaymentController } from './payment/controller'
import { MemoryPaidRecordStore } from './payment/persistence'
import { useEngine } from './store/engine'
import { attachPayState } from './store/payment'
import { deferred, FakePayment, FakePos, FakePrinter, snapshotInput, TEST_TIMEOUTS } from './test/fakes'
import { Pay } from './ui/Pay'

const FILES: Record<keyof EngineData, string> = {
  brand: 'BRAND', cats: 'CATS', products: 'PRODUCTS', mods: 'MODS', menuDeal: 'MENU_DEAL', cms: 'GUESTIT_CMS', upsell: 'UPSELL_CMS', priceVariants: 'PRICE_VARIANTS', i18n: 'I18N', alg: 'ALG', algIcon: 'ALG_ICON', catsub: 'CATSUB', comp: 'COMP', compAll: 'COMP_ALL', flags: 'FLAGS', locales: 'LOCALES', bdg: 'BDG', icons: 'P', obwInfo: 'OBW_INFO', obwDefault: 'OBW_DEFAULT', cmsCatAlias: 'CMS_CAT_ALIAS', roleGroup: 'ROLE_GROUP', allergenPolicy: 'ALLERGEN_POLICY',
} as Record<keyof EngineData, string>
function pack(): EngineData {
  const dir = resolve(process.cwd(), 'public/mock/dadawan')
  const d = Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, JSON.parse(readFileSync(resolve(dir, f + '.json'), 'utf8'))])) as unknown as EngineData
  return finalizeEngineData(d)
}

const connected = { kind: 'connected', role: 'LOCAL_PRIMARY', nodeId: 'local', epoch: 1 } as const
const cfg = structuredClone(configRaw) as unknown as GuestitConfig
const ctrls: PaymentController[] = []

function ctrl(store = new MemoryPaidRecordStore()) {
  const payment = new FakePayment()
  const pos = new FakePos()
  const c = new PaymentController({
    adapters: { payment, pos, printer: new FakePrinter() },
    store,
    timeouts: TEST_TIMEOUTS,
    uncertainMs: 120_000,
    currency: 'EUR',
    deviceId: 'AUDIT',
    newOrderId: () => 'AUDIT-1',
    onAccepted: () => {},
  })
  ctrls.push(c)
  return { c, payment, pos, store }
}

function runtime() {
  const h = createStaticAdapters()
  const payment = new FakePayment()
  h.adapters.payment = payment
  h.adapters.availability.check = vi.fn(async () => ({ unavailableIds: [] }))
  h.adapters.catalog.current = vi.fn(async () => ({ version: 36, prices: {}, variants: {}, disabled: [] }))
  const rt = createRuntime({ adapters: h.adapters, staticHandle: null }, cfg)
  ctrls.push(rt.controller)
  return { ...rt, payment, adapters: h.adapters }
}

const nl = () => E().i18n.nl

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  sessionStorage.clear()
  setEngine(pack())
  setLang('nl')
  setUnavailable([])
  setDisabled([])
  setAllergenFilter(new Set())
  useEngine.setState(useEngine.getInitialState(), true)
  useEngine.getState().setReady(cfg, 'nl')
  useEngine.getState().setConn(connected)
  useEngine.getState().setCart(addToCart([], newDraft(E().products.find((p) => p.id === 'gyoza')!)).cart)
  useEngine.getState().setScreen('tag')
})
afterEach(() => {
  cleanup()
  ctrls.splice(0).forEach((c) => c.dispose())
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('F01 — an order is submitted only after a confirmed payment', () => {
  it('A01: a restored "starting" record with unknown status → assistance; submitRetry sends nothing', async () => {
    const first = ctrl()
    void first.c.start(snapshotInput())
    first.c.dispose()
    const next = ctrl(first.store)
    await next.c.restore()
    expect(next.c.state.status).toBe('assistance')
    expect(next.c.state.paymentConfirmed).toBe(false)
    expect(next.c.canSubmitOrder()).toBe(false)
    await next.c.submitRetry()
    await next.c.submitOrder()
    expect(next.pos.submits).toHaveLength(0)
    expect(next.c.state.status).toBe('assistance')
    expect(next.store.peek()?.submissionState).toBe('starting') // record kept for reconciliation
  })
  it('an unreadable record → assistance; nothing is submitted and no charge can start', async () => {
    const { c, pos, payment, store } = ctrl()
    store.seed('{"not":"a record"}')
    await c.restore()
    expect(c.state.status).toBe('assistance')
    await c.submitRetry()
    expect(pos.submits).toHaveLength(0)
    expect(await c.start(snapshotInput())).toBe(false)
    expect(payment.startCalls).toHaveLength(0)
  })
  it('a record written after approval resubmits with the SAME idempotency key (PAID_ORDER_PENDING stays recoverable)', async () => {
    const first = ctrl()
    first.pos.mode = 'hang'
    const p = first.c.start(snapshotInput())
    await vi.advanceTimersByTimeAsync(0)
    first.payment.lastStart.resolve({ result: 'approved', txRef: 'TX-9' })
    await p
    await vi.advanceTimersByTimeAsync(0)
    expect(first.store.peek()?.submissionState).toBe('submitting')
    first.c.dispose()
    const next = ctrl(first.store)
    await next.c.restore()
    expect(next.c.state.paymentConfirmed).toBe(true)
    expect(next.pos.submits).toHaveLength(1)
    expect(next.pos.submits[0].idempotencyKey).toBe('IDEMP-AUDIT-1')
    expect(next.pos.submits[0].txRef).toBe('TX-9')
    expect(next.c.state.status).toBe('done')
  })
})

describe('F04 — staff entry on every payment / recovery screen', () => {
  it('A02: the assistance screen offers a (PIN-protected) staff entry with the identifiers', async () => {
    const { c, store } = ctrl()
    store.seed('invalid')
    await c.restore()
    attachPayState(c)
    render(<Pay />)
    const btn = screen.getByRole('button', { name: nl().staffEntry })
    expect(useEngine.getState().staffOpen).toBe(false)
    fireEvent.click(btn)
    expect(useEngine.getState().staffOpen).toBe(true)
  })
})

describe('F03 — authority is re-validated after the asynchronous preflight', () => {
  it('A03: authority lost while availability is pending → no payment attempt, re-resolve dialog', async () => {
    const rt = runtime()
    const pending = deferred<{ unavailableIds: string[] }>()
    rt.adapters.availability.check = () => pending.promise
    const start = vi.spyOn(rt.controller, 'start').mockResolvedValue(false)
    const p = toPay()
    useEngine.getState().setConn({ kind: 'no-authority', reason: 'simulated', retryAt: 0 })
    pending.resolve({ unavailableIds: [] })
    await p
    expect(start).not.toHaveBeenCalled()
    expect(useEngine.getState().confirm).toBe('authChanged')
  })
  it('a new writer (other epoch) during the preflight also stops the attempt', async () => {
    const rt = runtime()
    const pending = deferred<{ unavailableIds: string[] }>()
    rt.adapters.availability.check = () => pending.promise
    const start = vi.spyOn(rt.controller, 'start').mockResolvedValue(false)
    const p = toPay()
    useEngine.getState().setConn({ kind: 'connected', role: 'CLOUD_ACTIVE', nodeId: 'cloud', epoch: 2 })
    pending.resolve({ unavailableIds: [] })
    await p
    expect(start).not.toHaveBeenCalled()
  })
})

describe('F02 — every new charge attempt runs the same preflight', () => {
  async function declined() {
    const rt = runtime()
    const pending = rt.controller.start(snapshotInput())
    await vi.advanceTimersByTimeAsync(0)
    rt.payment.lastStart.resolve({ result: 'declined' })
    await pending
    expect(rt.controller.state.status).toBe('declined')
    return rt
  }
  it('A04: "Try again" after a decline checks availability and prices before the next attempt', async () => {
    const rt = await declined()
    const check = vi.spyOn(rt.adapters.availability, 'check')
    const start = vi.spyOn(rt.controller, 'start').mockResolvedValue(false)
    render(<Pay />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: nl().payRetry }))
    })
    expect(check).toHaveBeenCalledTimes(1)
    expect(rt.adapters.catalog.current).toHaveBeenCalled()
    expect(start).toHaveBeenCalledTimes(1)
  })
  it('a price change between decline and retry asks for confirmation instead of charging', async () => {
    const rt = await declined()
    const gyoza = E().products.find((p) => p.id === 'gyoza')!
    rt.adapters.catalog.current = async () => ({ version: 37, prices: { gyoza: gyoza.price + 50 }, variants: {}, disabled: [] })
    const start = vi.spyOn(rt.controller, 'start').mockResolvedValue(false)
    render(<Pay />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: nl().payRetry }))
    })
    expect(start).not.toHaveBeenCalled()
    const c = useEngine.getState().confirm
    expect(typeof c === 'object' && c?.type === 'priceChanged').toBe(true)
  })
  it('without writable authority the retry button is disabled', async () => {
    await declined()
    useEngine.getState().setConn({ kind: 'resolving', attempt: 1 })
    render(<Pay />)
    expect(screen.getByRole('button', { name: nl().payRetry })).toBeDisabled()
  })
})

describe('F05 — the remote menu request is bounded', () => {
  it('a hanging menu service rejects after the timeout and the request is aborted', async () => {
    let aborted = false
    vi.stubGlobal(
      'fetch',
      vi.fn((_: string, init?: RequestInit) => new Promise<Response>((_res, rej) => init?.signal?.addEventListener('abort', () => {
        aborted = true
        rej(new DOMException('aborted', 'AbortError'))
      }))),
    )
    const p = fetchMenu({ source: 'api', apiBase: 'https://example.invalid/api', testUrl: '', menuId: 1 }, 5_000)
    const result = p.then(() => 'resolved', (e: Error) => e.message)
    await vi.advanceTimersByTimeAsync(5_000)
    expect(await result).toContain('timed out after 5000 ms')
    expect(aborted).toBe(true)
    vi.unstubAllGlobals()
  })
})
