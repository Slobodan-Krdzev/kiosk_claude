// @vitest-environment node
// Order + payment over the kiosk API's one blocking POST (docs/reference/kiosk-payment-flow.md), mapped onto the
// payment controller (docs/reference/order-payment-integration.md). Fetch is mocked: nothing here is live
// verification; the request body follows the documented payload and the responses the documented rows.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildSnapshot } from '../../app/checkout'
import { addToCart } from '../../engine/cart'
import { finalizeEngineData } from '../../engine/data'
import { grpSet, newDraft } from '../../engine/draft'
import { E, setEngine, setLang } from '../../engine/state'
import type { EngineData } from '../../engine/types'
import { PaymentController } from '../../payment/controller'
import { MemoryPaidRecordStore } from '../../payment/persistence'
import { deferred, snapshotInput, TEST_TIMEOUTS } from '../../test/fakes'
import type { OrderSnapshot } from '../../domain/types'
import type { GuestitAdapters } from '../types'
import type { TmkRoot } from './tmk'
import { withLiveAdapters } from './tmkLive'
import { mapTmkToEngine } from './tmkMapper'
import { buildOrderPayload, classify, MSG_ABORTED, MSG_PRINTING, tableNumberFor, TmkOrderPayment, type TmkOrderResponse } from './tmkOrder'

const SAMPLES = resolve(process.cwd(), '../failover-handover/docs/reference/api-samples')
const sample = (f: string): TmkRoot => JSON.parse(readFileSync(resolve(SAMPLES, f), 'utf8'))
function pack(): EngineData {
  const dir = resolve(process.cwd(), 'public/mock/dadawan')
  const j = (f: string) => JSON.parse(readFileSync(resolve(dir, f + '.json'), 'utf8'))
  return finalizeEngineData({
    brand: j('BRAND'), cats: j('CATS'), products: j('PRODUCTS'), mods: j('MODS'), menuDeal: j('MENU_DEAL'), cms: j('GUESTIT_CMS'), upsell: j('UPSELL_CMS'),
    priceVariants: j('PRICE_VARIANTS'), i18n: j('I18N'), alg: j('ALG'), algIcon: j('ALG_ICON'), catsub: j('CATSUB'), comp: j('COMP'), compAll: j('COMP_ALL'),
    flags: j('FLAGS'), locales: j('LOCALES'), bdg: j('BDG'), icons: j('P'), obwInfo: j('OBW_INFO'), obwDefault: j('OBW_DEFAULT'), cmsCatAlias: j('CMS_CAT_ALIAS'),
    roleGroup: j('ROLE_GROUP'), allergenPolicy: j('ALLERGEN_POLICY'),
  })
}
const TEST_RAW = sample('testmode-2490.json')
const API = 'https://kioskapi.dev.revelapps.com/api'

const ok = (body: TmkOrderResponse | string, status = 200) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const SUCCESS: TmkOrderResponse = { IsSuccess: true, ResponseMessage: null, Data: { AdditionalData: '57', IdOrder: 123456 } }

/** A fetch mock that records calls and lets the test resolve the order POST when it wants. */
function api() {
  const calls: { url: string; init?: RequestInit }[] = []
  let pendingPost: ReturnType<typeof deferred<Response>> | null = null
  const fetchFn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, init })
    if (url.includes('/abortRequest')) return new Response('', { status: 200 })
    pendingPost = deferred<Response>()
    const abort = () => pendingPost?.reject(new DOMException('aborted', 'AbortError'))
    init?.signal?.addEventListener('abort', abort)
    return pendingPost.promise
  }) as unknown as typeof fetch
  return {
    fetchFn,
    calls,
    posts: () => calls.filter((c) => c.url.includes('CreateKioskOrderWithPinPayment')),
    aborts: () => calls.filter((c) => c.url.includes('abortRequest')),
    body: (i = 0) => JSON.parse(String(calls.filter((c) => c.url.includes('CreateKioskOrderWithPinPayment'))[i].init!.body)),
    answer: (r: Response) => pendingPost!.resolve(r),
  }
}

const snap = (over: Partial<OrderSnapshot> = {}): OrderSnapshot => ({ ...snapshotInput(), orderId: 'K1-abc-12345678', startedAt: '2026-10-16T12:00:00.000Z', paidAt: null, ...over })

afterEach(() => vi.useRealTimers())

describe('request body (kiosk-payment-flow.md "Request body")', () => {
  it('a real menu 2490 line with a picked upsell option: base price and option priced separately, OrderGuid = our order id', () => {
    setEngine(mapTmkToEngine(TEST_RAW, pack(), { img: (u) => '/img-proxy?u=' + encodeURIComponent(u) }))
    setLang('nl')
    const p = E().products.find((x) => x.id === '469180')! // "7up (copy)", HasUpsaleCollection
    const d = newDraft(p)
    const g = 'up9_8'
    const opt = E().mods[g].items[0]
    grpSet(d, g, opt.id, 2)
    const plain = newDraft(E().products.find((x) => x.id === '465455')!) // Pepsi Light Cola
    plain.qty = 3
    const cart = addToCart(addToCart([], d).cart, plain).cart
    const s = buildSnapshot(cart, 'eat-in', 'nl', { type: 'table', value: '12' }, null)
    const line = s.lines[0]
    expect(line.basePriceCents).toBe(p.price)
    expect(line.unitPriceCents).toBe(p.price + opt.price * 2)
    expect(line.image).toMatch(/^http/) // the API's own URL, not the proxy
    expect(line.image).not.toContain('img-proxy')
    expect(line.extras[0]).toMatchObject({ productId: opt.pid, priceCents: opt.price, qty: 2 })

    const body = buildOrderPayload({ ...s, orderId: 'K1-x-1', startedAt: '', paidAt: null }, tableNumberFor({ ...s, orderId: 'K1-x-1', startedAt: '', paidAt: null }, '9'))
    expect(body).toEqual({
      Order: {
        OrderGuid: 'K1-x-1',
        SessionGuid: '',
        Items: [
          {
            Item: { Id: 469180, PluCode: '', Image: line.image, Name: p.name, Price: p.price / 100 },
            Variants: [],
            UpsaleCollection: [{ UpsaleStepOptionModel: { ProductId: Number(opt.pid), Name: typeof opt.name === 'string' ? opt.name : opt.name.en, Price: opt.price / 100 }, Quantity: 2 }],
            Quantity: 1,
            ItemGuid: '',
            CoursePosition: 0,
            Note: '',
          },
          {
            Item: { Id: 465455, PluCode: '', Image: s.lines[1].image, Name: 'Pepsi Light Cola', Price: 3.6 },
            Variants: [],
            UpsaleCollection: [],
            Quantity: 3,
            ItemGuid: '',
            CoursePosition: 0,
            Note: '',
          },
        ],
      },
      tableNumber: '12',
      deviceSessionId: '',
    })
  })

  it('tableNumber: the table tag, else the configured fallback; gift lines are not sent; a non-numeric id refuses', () => {
    const s = snap({ tag: null })
    expect(tableNumberFor(s, '9')).toBe('9')
    expect(tableNumberFor(snap({ tag: { type: 'pager', value: '4' } }), '9')).toBe('9')
    expect(tableNumberFor(snap({ tag: { type: 'table', value: '7' } }), '9')).toBe('7')
    const withGift = snap({ lines: [{ ...s.lines[0], productId: '443490', basePriceCents: 550 }, { ...s.lines[0], lineId: 'G', productId: '443491', kind: 'gift', unitPriceCents: 0 }] })
    expect(buildOrderPayload(withGift, '9').Order.Items.map((i) => i.Item.Id)).toEqual([443490])
    expect(() => buildOrderPayload(s, '9')).toThrow(/numeric ProductId/) // the simulation's 'em-1001'
    expect(() => buildOrderPayload(snap({ lines: [{ ...s.lines[0], productId: '1', extras: [{ extraId: 'x', qty: 1 }] }] }), '9')).toThrow(/no ProductId/)
  })
})

describe('response → outcome (order-payment-integration.md §4)', () => {
  it('classifies every documented row; anything unclassified is UNKNOWN, never declined', () => {
    expect(classify(200, SUCCESS, '')).toMatchObject({ kind: 'approved', orderNo: '57', idOrder: '123456', printed: true })
    expect(classify(200, { IsSuccess: false, ResponseMessage: MSG_ABORTED }, '')).toMatchObject({ kind: 'cancelled' })
    expect(classify(200, { IsSuccess: false, ResponseMessage: MSG_PRINTING, Data: { AdditionalData: 58, IdOrder: 1 } }, '')).toMatchObject({ kind: 'approved', orderNo: '58', printed: false })
    expect(classify(200, { IsSuccess: false, ResponseMessage: MSG_PRINTING }, '')).toMatchObject({ kind: 'unknown', message: MSG_PRINTING })
    expect(classify(200, { IsSuccess: false, ResponseMessage: 'Card declined' }, '')).toMatchObject({ kind: 'unknown', message: 'order: Card declined' })
    expect(classify(200, { IsSuccess: false }, '')).toMatchObject({ kind: 'unknown' })
    expect(classify(500, { Message: 'An error has occurred.' }, '{"Message":"An error has occurred."}')).toMatchObject({ kind: 'unknown', message: 'order: HTTP 500 An error has occurred.' })
    expect(classify(200, null, 'not json')).toMatchObject({ kind: 'unknown' })
    // As the dev backend really answers (live run 2026-10-16): the message is the body of a non-2xx answer.
    expect(classify(409, 'Printing problem', '"Printing problem"')).toMatchObject({ kind: 'unknown', message: MSG_PRINTING })
    expect(classify(409, 'Printing problem \r\n', '"Printing problem \\r\\n"')).toMatchObject({ kind: 'unknown', message: MSG_PRINTING })
    expect(classify(409, 'Aborted', '"Aborted"')).toMatchObject({ kind: 'cancelled' })
    expect(classify(409, 'Terminal busy', '"Terminal busy"')).toMatchObject({ kind: 'unknown', message: 'order: HTTP 409 Terminal busy' })
    expect(classify(409, { IsSuccess: true, Data: { AdditionalData: '5' } }, '')).toMatchObject({ kind: 'unknown' }) // success is only a 2xx success
  })
})

describe('TmkOrderPayment', () => {
  const adapter = (a: ReturnType<typeof api>, opts = {}) => new TmkOrderPayment(API, { fetch: a.fetchFn, tableNumber: '9', ...opts })
  const start = (op: TmkOrderPayment, att = 'K1-abc-12345678-A1', progress?: (p: string) => void) => op.start({ attemptId: att, orderId: 'K1-abc-12345678', amountMinor: 1150, currency: 'EUR', snapshot: snap({ lines: [{ ...snap().lines[0], productId: '443490', basePriceCents: 550 }] }) }, progress)

  it('approved: one POST with skip=false and JSON body, "waiting for card" at once, order number handed to submit, printed', async () => {
    const a = api()
    const op = adapter(a)
    const progress: string[] = []
    const p = start(op, 'ATT1', (x) => progress.push(x))
    await Promise.resolve()
    expect(progress).toEqual(['waiting-for-card'])
    expect(a.posts()).toHaveLength(1)
    expect(a.posts()[0].url).toBe(API + '/CreateKioskOrderWithPinPayment?skip=false')
    expect(a.posts()[0].init?.method).toBe('POST')
    expect((a.posts()[0].init!.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(a.body().Order.OrderGuid).toBe('K1-abc-12345678')
    a.answer(ok(SUCCESS))
    expect(await p).toEqual({ result: 'approved', txRef: '123456' })
    expect(await op.submit({ idempotencyKey: 'IDEMP-K1', orderId: 'K1', attemptId: 'ATT1', txRef: '123456', snapshot: snap() })).toEqual({ orderNo: '57', duplicate: false })
    expect(await op.print({ orderNo: '57', snapshot: snap() })).toEqual({ printed: true })
    expect(await op.status({ attemptId: 'ATT1', orderId: 'K1' })).toEqual({ result: 'approved', txRef: '123456' })
    expect(a.posts()).toHaveLength(1) // submit and print made no further call
  })

  it('cancel: GET abortRequest, then the open POST closes with "Aborted" → cancelled for both calls', async () => {
    const a = api()
    const op = adapter(a)
    const p = start(op, 'ATT2')
    await Promise.resolve()
    const c = op.cancel({ attemptId: 'ATT2' })
    await Promise.resolve()
    await Promise.resolve()
    expect(a.aborts()).toHaveLength(1)
    expect(a.aborts()[0].url).toBe(API + '/abortRequest')
    a.answer(ok({ IsSuccess: false, ResponseMessage: MSG_ABORTED }))
    expect(await c).toEqual({ result: 'cancelled' })
    expect(await p).toEqual({ result: 'cancelled' })
    expect(await op.status({ attemptId: 'ATT2', orderId: 'K1' })).toEqual({ result: 'not-charged' })
    await expect(op.submit({ idempotencyKey: 'k', orderId: 'K1', attemptId: 'ATT2', txRef: 't', snapshot: snap() })).rejects.toThrow(/no accepted order/)
  })

  it('cancel while the terminal already approved: approved wins (money moved)', async () => {
    const a = api()
    const op = adapter(a)
    const p = start(op, 'ATT3')
    await Promise.resolve()
    const c = op.cancel({ attemptId: 'ATT3' })
    await Promise.resolve()
    a.answer(ok(SUCCESS))
    expect(await c).toEqual({ result: 'approved', txRef: '123456' })
    expect(await p).toEqual({ result: 'approved', txRef: '123456' })
  })

  it('cancel when the POST does not close in time → unknown (the controller keeps the record)', async () => {
    const a = api()
    const op = adapter(a, { cancelTimeoutMs: 20 })
    const p = start(op, 'ATT4')
    await Promise.resolve()
    expect(await op.cancel({ attemptId: 'ATT4' })).toEqual({ result: 'unknown' })
    a.answer(ok({ IsSuccess: false, ResponseMessage: MSG_ABORTED }))
    expect(await p).toEqual({ result: 'cancelled' })
  })

  it('no answer within startTimeoutMs → the POST is aborted and start rejects (UNKNOWN); HTTP 500 and other messages reject too', async () => {
    const a = api()
    const op = adapter(a, { startTimeoutMs: 20 })
    await expect(start(op, 'ATT5')).rejects.toThrow(/no answer after 20 ms/)
    expect(await op.status({ attemptId: 'ATT5', orderId: 'K1' })).toEqual({ result: 'unknown' })

    const b = api()
    const op2 = adapter(b)
    const p = start(op2, 'ATT6')
    await Promise.resolve()
    b.answer(ok('{"Message":"An error has occurred."}', 500))
    await expect(p).rejects.toThrow(/HTTP 500/)

    const c = api()
    const op3 = adapter(c)
    const p3 = start(op3, 'ATT7')
    await Promise.resolve()
    c.answer(ok({ IsSuccess: false, ResponseMessage: 'Terminal not responding' }))
    await expect(p3).rejects.toThrow(/Terminal not responding/)
    expect(c.posts()).toHaveLength(1) // never re-sent on its own
  })

  it('"Printing problem": with an order number → approved, not printed; without → start rejects (UNKNOWN, as the dev backend answers it)', async () => {
    const a = api()
    const op = adapter(a)
    const p = start(op, 'ATT8')
    await Promise.resolve()
    a.answer(ok({ IsSuccess: false, ResponseMessage: MSG_PRINTING, Data: { AdditionalData: '61', IdOrder: 9 } }))
    expect(await p).toEqual({ result: 'approved', txRef: '9' })
    expect(await op.submit({ idempotencyKey: 'k', orderId: 'K1', attemptId: 'ATT8', txRef: '9', snapshot: snap() })).toEqual({ orderNo: '61', duplicate: false })
    expect(await op.print({ orderNo: '61', snapshot: snap() })).toEqual({ printed: false })

    const b = api()
    const op2 = adapter(b)
    const p2 = start(op2, 'ATT9')
    await Promise.resolve()
    b.answer(ok('"Printing problem"', 409)) // exactly what kioskapi.dev answered on 2026-10-16
    await expect(p2).rejects.toThrow('Printing problem')
    expect(await op2.status({ attemptId: 'ATT9', orderId: 'K1' })).toEqual({ result: 'unknown' })
    await expect(op2.submit({ idempotencyKey: 'k', orderId: 'K1', attemptId: 'ATT9', txRef: 't', snapshot: snap() })).rejects.toThrow(/no accepted order/)
  })

  it('is selected on API menus only: payment, POS and printer are the same instance; test mode keeps the simulation', () => {
    const base = { kind: 'static', payment: { p: 1 }, pos: { q: 1 }, printer: { r: 1 }, catalog: { current: async () => ({}) } } as unknown as GuestitAdapters
    const src = (source: 'api' | 'test' | 'static') => ({ source, apiBase: API, testUrl: 'https://t/', menuId: 2408, tableNumber: '9' })
    const live = withLiveAdapters(base, src('api'), () => 1, {}, { startTimeoutMs: 1000 })
    expect(live.payment).toBeInstanceOf(TmkOrderPayment)
    expect(live.pos).toBe(live.payment)
    expect(live.printer).toBe(live.payment)
    expect(withLiveAdapters(base, src('test'), () => 1, {}, { startTimeoutMs: 1000 }).payment).toBe(base.payment)
    expect(withLiveAdapters(base, src('api'), () => 1).payment).toBe(base.payment) // no order options → no order adapter
  })
})

describe('through the payment controller', () => {
  function controller(a: ReturnType<typeof api>, opts = {}) {
    const op = new TmkOrderPayment(API, { fetch: a.fetchFn, tableNumber: '9', ...opts })
    const store = new MemoryPaidRecordStore()
    const accepted: string[] = []
    const c = new PaymentController({
      adapters: { payment: op, pos: op, printer: op },
      store,
      timeouts: TEST_TIMEOUTS,
      uncertainMs: 120_000,
      currency: 'EUR',
      deviceId: 'K1',
      newOrderId: () => 'K1-ORDER',
      onAccepted: (i) => accepted.push(i.orderNo),
    })
    return { c, op, store, accepted }
  }
  const input = () => ({ ...snapshotInput(), lines: [{ ...snapshotInput().lines[0], productId: '443490', basePriceCents: 550 }] })
  const flush = async () => {
    for (let i = 0; i < 6; i++) await Promise.resolve()
  }

  it('approved: persist → POST → approved → done with the order number, cart released once, receipt printed, record cleared', async () => {
    const a = api()
    const { c, store, accepted } = controller(a)
    const p = c.start(input())
    await flush()
    expect(c.state.status).toBe('waiting-for-card')
    expect(store.read().kind).toBe('ok')
    expect(a.body().Order.OrderGuid).toBe('K1-ORDER')
    a.answer(ok(SUCCESS))
    await p
    await flush()
    expect(c.state.status).toBe('done')
    expect(c.state.orderNo).toBe('57')
    expect(c.state.txRef).toBe('123456')
    expect(c.state.receipt).toBe('printed')
    expect(accepted).toEqual(['57'])
    expect(store.read().kind).toBe('none')
    expect(a.posts()).toHaveLength(1)
    c.dispose()
  })

  it('guest cancels: abortRequest, POST answers Aborted → cancelled, nothing charged, record cleared, retry allowed', async () => {
    const a = api()
    const { c, store } = controller(a)
    const p = c.start(input())
    await flush()
    const cancel = c.cancel()
    await flush()
    expect(c.state.status).toBe('cancel-requested')
    expect(a.aborts()).toHaveLength(1)
    a.answer(ok({ IsSuccess: false, ResponseMessage: MSG_ABORTED }))
    await Promise.all([p, cancel])
    await flush()
    expect(c.state.status).toBe('cancelled')
    expect(store.read().kind).toBe('none')
    expect(c.canRetry()).toBe(true)
    c.dispose()
  })

  it('an unclassified answer leaves the outcome UNKNOWN with the record kept: never "declined", never a second POST', async () => {
    const a = api()
    const { c, store } = controller(a)
    const p = c.start(input())
    await flush()
    a.answer(ok({ IsSuccess: false, ResponseMessage: 'Card declined' }))
    await p
    await flush()
    expect(c.state.status).toBe('timeout')
    expect(c.state.uncertainReason).toBe('start-rejected')
    expect(store.read().kind).toBe('ok')
    await c.lookup() // no status endpoint → stays unknown, assistance flagged
    expect(c.state.status).toBe('timeout')
    expect(c.state.assistanceNeeded).toBe(true)
    expect(a.posts()).toHaveLength(1)
    c.dispose()
  })

  it('HTTP 409 "Printing problem" without an order number (dev backend, 2026-10-16): UNKNOWN, record kept, no re-POST, never marked paid', async () => {
    const a = api()
    const { c, store } = controller(a)
    const p = c.start(input())
    await flush()
    a.answer(ok('"Printing problem"', 409))
    await p
    await flush()
    expect(c.state.status).toBe('timeout')
    expect(c.state.paymentConfirmed).toBe(false)
    expect(store.read().kind).toBe('ok')
    await c.lookup()
    expect(c.state.status).toBe('timeout')
    expect(a.posts()).toHaveLength(1) // the old kiosk re-POSTed with skip=true here; the kiosk waits for B4 / question 2
    c.dispose()
  })

  it('"Printing problem" with an order number: done, receipt failed', async () => {
    const a = api()
    const { c } = controller(a)
    const p = c.start(input())
    await flush()
    a.answer(ok({ IsSuccess: false, ResponseMessage: MSG_PRINTING, Data: { AdditionalData: '61', IdOrder: 9 } }))
    await p
    await flush()
    expect(c.state.status).toBe('done')
    expect(c.state.orderNo).toBe('61')
    expect(c.state.receipt).toBe('failed')
    c.dispose()
  })

  it('the guard fires before the terminal answers: UNKNOWN, then the late approval is still applied exactly once', async () => {
    vi.useFakeTimers()
    const a = api()
    const { c, accepted } = controller(a)
    const p = c.start(input())
    await flush()
    await vi.advanceTimersByTimeAsync(TEST_TIMEOUTS.paymentStart + 1)
    expect(c.state.status).toBe('timeout')
    a.answer(ok(SUCCESS))
    await p
    await flush()
    expect(c.state.status).toBe('done')
    expect(accepted).toEqual(['57'])
    c.dispose()
  })
})
