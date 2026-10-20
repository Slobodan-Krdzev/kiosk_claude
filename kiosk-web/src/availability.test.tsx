// Live product checks (docs/reference/kiosk-product-checks.md, 2026-10-16) on the real API samples.
// The availability adapter is mocked; the store, gate and checkout code paths are the real ones.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import configRaw from '../public/mock/config.json'
import { mapTmkToEngine } from './adapters/http/tmkMapper'
import type { TmkRoot } from './adapters/http/tmk'
import { createStaticAdapters } from './adapters/static/staticAdapters'
import { liveGate } from './app/availability'
import { cartPids, catalogRefresh, toPay } from './app/checkout'
import { createRuntime } from './app/runtime'
import type { GuestitConfig } from './domain/types'
import { addToCart, validateCart } from './engine/cart'
import { lineMax, obNeedsDetail, prodsIn, visible } from './engine/catalog'
import { finalizeEngineData } from './engine/data'
import { clampQty, grpSet, newDraft, validateDraft } from './engine/draft'
import { E, setDisabled, setEngine, setLang, setUnavailable } from './engine/state'
import type { EngineData, Product } from './engine/types'
import { PaymentController } from './payment/controller'
import { setAvailabilityGate, useEngine } from './store/engine'
import { FakePayment } from './test/fakes'

const FILES = { brand: 'BRAND', cats: 'CATS', products: 'PRODUCTS', mods: 'MODS', menuDeal: 'MENU_DEAL', cms: 'GUESTIT_CMS', upsell: 'UPSELL_CMS', priceVariants: 'PRICE_VARIANTS', i18n: 'I18N', alg: 'ALG', algIcon: 'ALG_ICON', catsub: 'CATSUB', comp: 'COMP', compAll: 'COMP_ALL', flags: 'FLAGS', locales: 'LOCALES', bdg: 'BDG', icons: 'P', obwInfo: 'OBW_INFO', obwDefault: 'OBW_DEFAULT', cmsCatAlias: 'CMS_CAT_ALIAS', roleGroup: 'ROLE_GROUP', allergenPolicy: 'ALLERGEN_POLICY' }
function pack(): EngineData {
  const dir = resolve(process.cwd(), 'public/mock/dadawan')
  return finalizeEngineData(Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, JSON.parse(readFileSync(resolve(dir, f + '.json'), 'utf8'))])) as unknown as EngineData)
}
const SAMPLES = resolve(process.cwd(), '../failover-handover/docs/reference/api-samples')
const sample = (f: string): TmkRoot => JSON.parse(readFileSync(resolve(SAMPLES, f), 'utf8'))
const FULL = mapTmkToEngine(sample('getfullresources.json'), pack(), { img: (u) => u })
const TEST_RAW = sample('testmode-2490.json')
const TEST = mapTmkToEngine(TEST_RAW, pack(), { img: (u) => u })
/** Menu 2490 with the main category that holds `productId` first (the kiosk renders MainCategories[0] only, decision 1). */
function mainOf(raw: TmkRoot, productId: number): TmkRoot {
  const c = structuredClone(raw)
  const nl = c.TMKData.find((x) => x.Language === 'nl') ?? c.TMKData[0]
  const main = nl.MainCategories.find((m) => m.SubCategories.some((s) => s.Products.some((p) => p.ProductId === productId)))!
  for (const t of c.TMKData) {
    const i = t.MainCategories.findIndex((m) => m.MainCategoryId === main.MainCategoryId)
    if (i > 0) t.MainCategories.unshift(...t.MainCategories.splice(i, 1))
  }
  return c
}
const CAPPED = mapTmkToEngine(mainOf(TEST_RAW, 458339), pack(), { img: (u) => u })

const cfg = structuredClone(configRaw) as unknown as GuestitConfig
const connected = { kind: 'connected', role: 'LOCAL_PRIMARY', nodeId: 'local', epoch: 1 } as const
const ctrls: PaymentController[] = []
const flush = () => new Promise((r) => setTimeout(r, 0))

function runtime(check: (ids: string[]) => Promise<{ unavailableIds: string[]; unknownIds?: string[] }>) {
  const h = createStaticAdapters()
  h.adapters.payment = new FakePayment()
  const spy = vi.fn(check)
  h.adapters.availability.check = spy
  h.adapters.catalog.current = vi.fn(async () => ({ version: 7, prices: {}, variants: {}, disabled: [] }))
  const rt = createRuntime({ adapters: h.adapters, staticHandle: null }, cfg)
  ctrls.push(rt.controller)
  return { rt, check: spy }
}
/** A plain orderable API product: no upsell steps, not information-only. */
const plain = (d: EngineData): Product => d.products.find((p) => !p.steps && !p.infoOnly && !p.disabled)!

let clock = Date.now()
beforeEach(() => {
  // The store's quick-tap lock (225 ms) is keyed by Date.now(): move the clock per test, keep timers real.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime((clock += 60_000))
  localStorage.clear()
  sessionStorage.clear()
  setEngine(FULL)
  setLang('nl')
  setUnavailable([])
  setDisabled([])
  useEngine.setState(useEngine.getInitialState(), true)
  useEngine.getState().setReady(cfg, 'nl')
  useEngine.getState().setConn(connected)
  useEngine.getState().setScreen('menu')
})
afterEach(() => {
  setAvailabilityGate(null)
  ctrls.splice(0).forEach((c) => c.dispose())
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('§2 live check on the first add / open of a product', () => {
  it('available → added once; the same product is not checked again in this session', async () => {
    const { check } = runtime(async () => ({ unavailableIds: [] }))
    setAvailabilityGate(liveGate)
    const p = plain(FULL)
    const s = useEngine.getState()
    s.quickAdd(p.id)
    expect(useEngine.getState().availPending).toBe(p.id)
    expect(useEngine.getState().cart).toHaveLength(0) // nothing until the API answered
    await flush()
    expect(check).toHaveBeenCalledWith([p.id])
    expect(useEngine.getState().cart.map((l) => [l.pid, l.qty])).toEqual([[p.id, 1]])
    expect(useEngine.getState().availPending).toBeNull()
    useEngine.getState().cardInc(p.id, false)
    await flush()
    expect(check).toHaveBeenCalledTimes(1)
    expect(useEngine.getState().cart[0].qty).toBe(2)
  })

  it('sold out → nothing added, dialog names the product, the card leaves the list (as the old kiosk)', async () => {
    runtime(async (ids) => ({ unavailableIds: ids }))
    setAvailabilityGate(liveGate)
    const p = plain(FULL)
    expect(prodsIn(p.cat).map((x) => x.id)).toContain(p.id)
    useEngine.getState().quickAdd(p.id)
    await flush()
    const s = useEngine.getState()
    expect(s.cart).toHaveLength(0)
    expect(s.confirm).toEqual({ type: 'soldOut', name: p.name })
    expect(prodsIn(p.cat).map((x) => x.id)).not.toContain(p.id)
    expect(validateCart(addToCart([], newDraft(p)).cart).some((i) => i.code === 'unavailable')).toBe(true)
  })

  it('unknown (error / timeout) → nothing added, "try again" toast, product NOT marked sold out', async () => {
    runtime(async (ids) => ({ unavailableIds: [], unknownIds: ids }))
    setAvailabilityGate(liveGate)
    const p = plain(FULL)
    useEngine.getState().quickAdd(p.id)
    await flush()
    const s = useEngine.getState()
    expect(s.cart).toHaveLength(0)
    expect(s.confirm).toBeNull()
    expect(s.toast?.text).toBe(E().i18n.nl.availUnknown)
    expect(prodsIn(p.cat).map((x) => x.id)).toContain(p.id)
  })

  it('a reply for an earlier guest session is discarded (rule 14)', async () => {
    let release!: (v: { unavailableIds: string[] }) => void
    runtime(() => new Promise((r) => (release = r)))
    setAvailabilityGate(liveGate)
    const p = plain(FULL)
    useEngine.getState().quickAdd(p.id)
    useEngine.getState().newOrderReset()
    release({ unavailableIds: [] })
    await flush()
    const s = useEngine.getState()
    expect(s.cart).toHaveLength(0)
    expect(s.availPending).toBeNull()
    expect(s.confirm).toBeNull()
  })

  it('opening the product page from a card is gated; editing a cart line and detail-add after it are not re-checked', async () => {
    const { check } = runtime(async () => ({ unavailableIds: [] }))
    setAvailabilityGate(liveGate)
    const p = plain(FULL)
    useEngine.getState().openProduct(p)
    expect(useEngine.getState().pdpOpen).toBe(false)
    await flush()
    expect(check).toHaveBeenCalledWith([p.id])
    expect(useEngine.getState().pdpOpen).toBe(true)
    useEngine.getState().addOrder()
    await flush()
    expect(useEngine.getState().cart).toHaveLength(1)
    expect(check).toHaveBeenCalledTimes(1)
    useEngine.getState().editLine(useEngine.getState().cart[0].lid)
    expect(useEngine.getState().pdpOpen).toBe(true)
    expect(check).toHaveBeenCalledTimes(1)
  })

  it('while one check is in flight, other taps are ignored (no double add)', async () => {
    let release!: (v: { unavailableIds: string[] }) => void
    const { check } = runtime(() => new Promise((r) => (release = r)))
    setAvailabilityGate(liveGate)
    const [a, b] = FULL.products.filter((p) => !p.steps && !p.infoOnly && !p.disabled)
    useEngine.getState().quickAdd(a.id)
    useEngine.getState().quickAdd(b.id)
    expect(check).toHaveBeenCalledTimes(1)
    release({ unavailableIds: [] })
    await flush()
    expect(useEngine.getState().cart.map((l) => l.pid)).toEqual([a.id])
  })

  it('without a gate (static simulation) adds are immediate', () => {
    const p = plain(FULL)
    useEngine.getState().quickAdd(p.id)
    expect(useEngine.getState().cart).toHaveLength(1)
  })
})

describe('checkout preflight on the live API', () => {
  it('checks exactly the products the cart depends on (lines + picked upsell options), not the whole menu', async () => {
    setEngine(TEST)
    const { check } = runtime(async () => ({ unavailableIds: [] }))
    const p = TEST.products.find((x) => x.id === '469180')!
    const d = newDraft(p)
    const g = 'up9_8'
    const item = E().mods[g].items[0]
    // the product's mandatory modifier ("Something", 1/1) comes first in the chain
    const md = p.steps!.filter((k) => k.startsWith('md') && E().mods[k].req)
    const modPids = md.map((k) => {
      grpSet(d, k, E().mods[k].items[0].id, 1)
      return E().mods[k].items[0].pid!
    })
    grpSet(d, g, item.id, 1)
    const cart = addToCart([], d).cart
    useEngine.getState().setCart(cart)
    expect(cartPids(cart).sort()).toEqual([...new Set([p.id, item.pid!, ...modPids])].sort())
    expect(await catalogRefresh()).toBe(true)
    expect(check).toHaveBeenCalledWith(cartPids(cart))
    expect(check.mock.calls[0][0]).toHaveLength(new Set([p.id, item.pid!, ...modPids]).size) // the old scope was one request per menu product
  })

  it('an UNKNOWN availability refuses to charge: "could not verify" dialog, no payment attempt', async () => {
    const { rt } = runtime(async (ids) => ({ unavailableIds: [], unknownIds: ids }))
    const start = vi.spyOn(rt.controller, 'start').mockResolvedValue(false)
    const p = plain(FULL)
    useEngine.getState().setCart(addToCart([], newDraft(p)).cart)
    useEngine.getState().setScreen('tag')
    await toPay()
    expect(useEngine.getState().confirm).toBe('availFail')
    expect(start).not.toHaveBeenCalled()
  })

  it('a sold-out cart product blocks payment and is marked in the cart', async () => {
    const { rt } = runtime(async (ids) => ({ unavailableIds: ids }))
    const start = vi.spyOn(rt.controller, 'start').mockResolvedValue(false)
    const p = plain(FULL)
    useEngine.getState().setCart(addToCart([], newDraft(p)).cart)
    useEngine.getState().setScreen('tag')
    await toPay()
    expect(start).not.toHaveBeenCalled()
    expect(validateCart(useEngine.getState().cart).some((i) => i.code === 'unavailable')).toBe(true)
  })
})

describe('§3 MaxAmountInAgenda and §4 NoInteraction from the real menus', () => {
  it('a product capped at 1 cannot exceed one per line; 999999 means the engine limit', () => {
    const rawOne = TEST_RAW.TMKData[0].MainCategories.flatMap((m) => m.SubCategories).flatMap((s) => s.Products).find((p) => p.ProductId === 458339)!
    expect(rawOne.MaxAmountInAgenda).toBe(1) // real data: "115. SURPRISE DISH" in menu 2490
    setEngine(CAPPED)
    const one = CAPPED.products.find((p) => p.id === '458339')!
    expect(one.maxQty).toBe(1)
    expect(lineMax(one)).toBe(1)
    expect(clampQty(5, lineMax(one))).toBe(1)
    const d = newDraft(one)
    d.qty = 2
    expect(validateDraft(d).some((i) => i.code === 'qty')).toBe(true)
    const big = FULL.products.find((p) => !p.infoOnly)!
    expect(lineMax(big)).toBe(20)
    expect(addToCart(addToCart([], newDraft(one)).cart, newDraft(one)).cart.every((l) => l.qty <= 1)).toBe(true)
  })

  it('cart quantity actions respect the cap', () => {
    setEngine(CAPPED)
    const one = CAPPED.products.find((p) => p.id === '458339')!
    useEngine.getState().setCart(addToCart([], newDraft(one)).cart)
    const lid = useEngine.getState().cart[0].lid
    useEngine.getState().cartQty(lid, 1)
    useEngine.getState().cardInc(one.id, false)
    expect(useEngine.getState().cart[0].qty).toBe(1)
    useEngine.getState().openProduct(one, { editing: lid, draft: newDraft(one) })
    useEngine.getState().draftQty(+3)
    expect(useEngine.getState().draft!.qty).toBe(1)
  })

  it('NoInteraction products stay visible, open the product page and cannot be added', () => {
    const info = FULL.products.find((p) => p.id === '454444')!
    expect(info.infoOnly).toBe(true)
    expect(info.disabled).toBeUndefined()
    expect(visible([info])).toHaveLength(1)
    expect(obNeedsDetail(info)).toBe(true)
    useEngine.getState().quickAdd(info.id)
    expect(useEngine.getState().pdpOpen).toBe(true)
    expect(useEngine.getState().cart).toHaveLength(0)
    useEngine.getState().addOrder()
    expect(useEngine.getState().cart).toHaveLength(0)
    expect(validateDraft(newDraft(info)).some((i) => i.code === 'info-only')).toBe(true)
  })
})
