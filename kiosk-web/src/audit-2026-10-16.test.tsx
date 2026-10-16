// Regression tests for the audit of 2026-10-16 (failover-handover/docs/reference/audit-2026-10-16/).
// Each test states the DESIRED behaviour; the audit's A01–A08 reproduced the defects on commit 85a3ff7.
// Fakes only: no real payment, POS or network.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import configRaw from '../public/mock/config.json'
import { fetchMenu } from './adapters/http/catalogSource'
import { htmlToText, mapTmkToEngine } from './adapters/http/tmkMapper'
import type { TmkRoot } from './adapters/http/tmk'
import { createStaticAdapters } from './adapters/static/staticAdapters'
import { catalogRefresh, toPay } from './app/checkout'
import { createRuntime } from './app/runtime'
import type { GuestitConfig } from './domain/types'
import { addToCart, revalidatePrices } from './engine/cart'
import { finalizeEngineData } from './engine/data'
import { grpSet, newDraft, priceLines, unavailParts, validateDraft } from './engine/draft'
import { homeHasContent, pname, venueMenu, venueName } from './engine/catalog'
import { E, setAllergenFilter, setDisabled, setEngine, setLang, setUnavailable } from './engine/state'
import type { EngineData } from './engine/types'
import { PaymentController } from './payment/controller'
import { MemoryPaidRecordStore } from './payment/persistence'
import { useEngine } from './store/engine'
import { attachPayState } from './store/payment'
import { deferred, FakePayment, FakePos, FakePrinter, snapshotInput, TEST_TIMEOUTS } from './test/fakes'
import { Overlays } from './ui/Overlays'
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

describe('F06 — selected upsell options take part in stock validation', () => {
  const sample = (): TmkRoot => JSON.parse(readFileSync(resolve(process.cwd(), '../failover-handover/docs/reference/api-samples/testmode-2490.json'), 'utf8'))
  it('A05: a sold-out product behind a picked option blocks the line; removing the option clears it', () => {
    const d = mapTmkToEngine(sample(), pack(), { img: (u) => u })
    setEngine(d)
    const p = d.products.find((x) => x.id === '469180')!
    const g = 'up9_8'
    const item = d.mods[g].items[0]
    expect(item.pid).toBeTruthy()
    const draft = newDraft(p)
    grpSet(draft, g, item.id, 1)
    expect(validateDraft(draft)).toHaveLength(0)
    setUnavailable([item.pid!])
    const issues = validateDraft(draft)
    expect(issues.some((i) => i.code === 'unavailable-included' && i.pid === item.pid)).toBe(true)
    expect(unavailParts(draft)).toEqual([expect.objectContaining({ role: 'option', group: g, id: item.id, fix: 'option' })])
    grpSet(draft, g, item.id, 0)
    // the step is required (min 1): the guest must now pick another option
    expect(validateDraft(draft).map((i) => i.code)).toEqual(['required-choice'])
  })
})

describe('F07 — a late loyalty reply never reaches the next guest', () => {
  function identifyPending() {
    const rt = runtime()
    const pending = deferred<{ id: string; name: string; points: number } | null>()
    rt.adapters.loyalty.identify = () => pending.promise
    useEngine.getState().voucher()
    render(<Overlays />)
    fireEvent.change(screen.getByPlaceholderText('123456'), { target: { value: '123456' } })
    return { rt, pending }
  }
  it('A07: reset while identification is pending → the reply is discarded', async () => {
    const { pending } = identifyPending()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: nl().cm_apply }))
    })
    await act(async () => {
      useEngine.getState().newOrderReset()
    })
    await act(async () => {
      pending.resolve({ id: 'previous-guest', name: 'Audit guest', points: 1 })
    })
    expect(useEngine.getState().member).toBeNull()
  })
  it('closing the sheet while pending also discards the reply; the same session applies it', async () => {
    const a = identifyPending()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: nl().cm_apply }))
    })
    expect(screen.getByRole('button', { name: nl().cm_wait })).toBeDisabled()
    await act(async () => {
      useEngine.getState().closeSheet()
    })
    await act(async () => {
      a.pending.resolve({ id: 'closed-guest', name: 'X', points: 1 })
    })
    expect(useEngine.getState().member).toBeNull()
    cleanup()
    const b = identifyPending()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: nl().cm_apply }))
    })
    await act(async () => {
      b.pending.resolve({ id: 'this-guest', name: 'Y', points: 2 })
    })
    expect(useEngine.getState().member?.id).toBe('this-guest')
    expect(useEngine.getState().sheet).toBeNull()
  })
  it('a timeout shows the error and leaves the guest without a member', async () => {
    identifyPending()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: nl().cm_apply }))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9_000)
    })
    expect(screen.getByText(nl().cm_err)).toBeTruthy()
    expect(useEngine.getState().member).toBeNull()
  })
})

describe('F11 — price variants are part of the live price check', () => {
  it('A08: a changed premium-drink variant is detected for a configured meal', async () => {
    const rt = runtime()
    const draft = newDraft(E().products.find((p) => p.id === 'salmonpoke')!)
    draft.menu = true
    draft.drink = 'lychee'
    const { cart } = addToCart([], draft)
    rt.adapters.catalog.current = async () => ({ version: 37, prices: {}, variants: { 'lychee-menu-upgrade': 999 }, disabled: [] })
    expect(await catalogRefresh()).toBe(true)
    const changes = revalidatePrices(cart)
    expect(changes).toHaveLength(1)
    expect(changes[0].now - changes[0].old).toBe(999 - 150)
  })
})

describe('F09 — product names follow the selected language', () => {
  const sample = (): TmkRoot => JSON.parse(readFileSync(resolve(process.cwd(), '../failover-handover/docs/reference/api-samples/testmode-2490.json'), 'utf8'))
  it('A06: a bilingual menu shows the English name after switching, everywhere the name is rendered', () => {
    const raw = sample()
    const nlT = raw.TMKData.find((x) => x.Language === 'nl')!
    const enT = raw.TMKData.find((x) => x.Language === 'en')!
    const np = nlT.MainCategories[0].SubCategories[0].Products[0]
    const ep = enT.MainCategories.flatMap((m) => m.SubCategories).flatMap((s) => s.Products).find((p) => p.ProductId === np.ProductId)!
    np.Name = 'Nederlandse naam'
    ep.Name = 'English name'
    const d = mapTmkToEngine(raw, pack(), { img: (u) => u })
    setEngine(d)
    const p = d.products.find((x) => x.id === String(np.ProductId))!
    setLang('nl')
    expect(pname(p)).toBe('Nederlandse naam')
    setLang('en')
    expect(pname(p)).toBe('English name')
    expect(p.name).toBe('Nederlandse naam') // default-language name kept for KDS / receipt
    // the cart summary and the price sheet use the same resolution
    const draft = newDraft(p)
    grpSet(draft, 'up9_8', d.mods['up9_8'].items[0].id, 1)
    const { cart } = addToCart([], draft)
    expect(revalidatePrices(cart)).toEqual([])
    expect(priceLines(p, draft)[0][0]).toBe('English name')
    setLang('mk') // not offered by this menu → the engine's fallback (English), never an empty name
    expect(pname(p)).toBe('English name')
  })
})

describe('F08 / F10 — API menus open on a useful screen with one venue identity', () => {
  const sample = (): TmkRoot => JSON.parse(readFileSync(resolve(process.cwd(), '../failover-handover/docs/reference/api-samples/getfullresources.json'), 'utf8'))
  it('without promotions or badges the home screen is skipped: start → first category', () => {
    const raw = sample()
    // menu 2408 has one IsPromotion product; this case is the menu without it
    for (const s of raw.TMKData[0].MainCategories[0].SubCategories) for (const p of s.Products) p.IsPromotion = false
    setEngine(mapTmkToEngine(raw, pack(), { img: (u) => u }))
    expect(homeHasContent()).toBe(false)
    expect(venueMenu()).toBe(true)
    expect(venueName()).toBe('Tapas Mainstreet')
    useEngine.getState().startWith('eatin')
    const s = useEngine.getState()
    expect(s.screen).toBe('menu')
    expect(s.cat).toBe(E().cats[0].id)
    useEngine.getState().home()
    expect(useEngine.getState().screen).toBe('menu')
  })
  it("the venue's live promotion gives the home screen content: start → home", () => {
    setEngine(mapTmkToEngine(sample(), pack(), { img: (u) => u }))
    expect(homeHasContent()).toBe(true)
    useEngine.getState().startWith('eatin')
    expect(useEngine.getState().screen).toBe('home')
  })
  it('the brand pack still opens on the home screen', () => {
    expect(homeHasContent()).toBe(true)
    expect(venueMenu()).toBe(false)
    useEngine.getState().startWith('eatin')
    expect(useEngine.getState().screen).toBe('home')
  })
})

describe('F12 — dialogs hold keyboard focus and make the background inert', () => {
  it('the voucher sheet takes focus, wraps Tab, blocks the background and restores focus on close', async () => {
    runtime()
    const opener = document.createElement('button')
    opener.textContent = 'opener'
    document.body.appendChild(opener)
    opener.focus()
    useEngine.getState().voucher()
    const { container } = render(<Overlays />)
    const dialog = container.querySelector('[role="dialog"]')!
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(opener.hasAttribute('inert')).toBe(true)
    const focusables = [...dialog.querySelectorAll<HTMLElement>('button,input')]
    focusables[focusables.length - 1].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(focusables[0])
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(focusables[focusables.length - 1])
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    expect(useEngine.getState().sheet).toBeNull()
    expect(opener.hasAttribute('inert')).toBe(false)
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
})

describe('polish — HTML entities in descriptions', () => {
  it('named and numeric entities are decoded', () => {
    expect(htmlToText('<p>Stokbroodje fazant pat&eacute; met cranberry&nbsp;compote &amp; ui &#233;n knoflook &#x2013; lekker&hellip;</p>')).toBe('Stokbroodje fazant paté met cranberry compote & ui én knoflook – lekker…')
    expect(htmlToText('&unknownthing; blijft')).toBe('&unknownthing; blijft')
  })
})
