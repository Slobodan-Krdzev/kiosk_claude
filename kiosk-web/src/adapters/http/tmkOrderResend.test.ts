// @vitest-environment node
// "Printing problem" → "continue without receipt?" → the same order again with ?skip=true (the old kiosk's path,
// built on Alex's decision of 2026-10-16 after the dev backend answered HTTP 409 "Printing problem" to every order).
import { describe, expect, it, vi } from 'vitest'
import type { OrderSnapshot } from '../../domain/types'
import { PaymentController } from '../../payment/controller'
import { MemoryPaidRecordStore } from '../../payment/persistence'
import { deferred, snapshotInput, TEST_TIMEOUTS } from '../../test/fakes'
import { TmkOrderPayment, type TmkOrderResponse } from './tmkOrder'

const API = 'https://kioskapi.dev.revelapps.com/api'
const ok = (body: TmkOrderResponse | string, status = 200) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const SUCCESS: TmkOrderResponse = { IsSuccess: true, Data: { AdditionalData: '57', IdOrder: 123456 } }
const PRINTING = () => ok('"Printing problem"', 409)

function api() {
  const calls: { url: string; init?: RequestInit }[] = []
  const posts: ReturnType<typeof deferred<Response>>[] = []
  const fetchFn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, init })
    if (url.includes('/abortRequest')) return new Response('', { status: 200 })
    const d = deferred<Response>()
    posts.push(d)
    init?.signal?.addEventListener('abort', () => d.reject(new DOMException('aborted', 'AbortError')))
    return d.promise
  }) as unknown as typeof fetch
  return {
    fetchFn,
    calls,
    postCalls: () => calls.filter((c) => c.url.includes('CreateKioskOrderWithPinPayment')),
    aborts: () => calls.filter((c) => c.url.includes('abortRequest')),
    answer: (i: number, r: Response) => posts[i].resolve(r),
    body: (i: number) => JSON.parse(String(calls.filter((c) => c.url.includes('CreateKioskOrderWithPinPayment'))[i].init!.body)),
  }
}
const snap = (): OrderSnapshot => ({ ...snapshotInput(), lines: [{ ...snapshotInput().lines[0], productId: '443491', basePriceCents: 600 }], orderId: 'K1-ORDER', startedAt: '2026-10-16T12:00:00.000Z', paidAt: null })
// Response.text() settles on a macrotask in Node: wait a real tick, not only microtasks.
const flush = () => new Promise((r) => setTimeout(r, 5))

describe('resend with skip=true', () => {
  const setup = (answer: () => Promise<boolean>) => {
    const a = api()
    const ask = vi.fn(answer)
    const op = new TmkOrderPayment(API, { fetch: a.fetchFn, tableNumber: '9', askPrintingProblem: ask })
    const start = op.start({ attemptId: 'ATT', orderId: 'K1-ORDER', amountMinor: 600, currency: 'EUR', snapshot: snap() })
    return { a, ask, op, start }
  }

  it('Yes: the same body (same OrderGuid) goes out once more with ?skip=true; its success completes the order', async () => {
    const { a, ask, op, start } = setup(async () => true)
    await flush()
    a.answer(0, PRINTING())
    await flush()
    expect(ask).toHaveBeenCalledTimes(1)
    expect(a.postCalls()).toHaveLength(2)
    expect(a.postCalls()[0].url).toContain('?skip=false')
    expect(a.postCalls()[1].url).toContain('?skip=true')
    expect(a.body(1)).toEqual(a.body(0))
    expect(a.body(1).Order.OrderGuid).toBe('K1-ORDER')
    expect(a.aborts()).toHaveLength(0)
    a.answer(1, ok(SUCCESS))
    expect(await start).toEqual({ result: 'approved', txRef: '123456' })
    expect(await op.submit({ idempotencyKey: 'k', orderId: 'K1-ORDER', attemptId: 'ATT', txRef: '123456', snapshot: snap() })).toEqual({ orderNo: '57', duplicate: false })
    expect(await op.print({ orderNo: '57', snapshot: snap() })).toEqual({ printed: true })
  })

  it('No: abortRequest, cancelled, nothing sent again', async () => {
    const { a, op, start } = setup(async () => false)
    await flush()
    a.answer(0, PRINTING())
    expect(await start).toEqual({ result: 'cancelled' })
    expect(a.postCalls()).toHaveLength(1)
    expect(a.aborts()).toHaveLength(1)
    expect(await op.status({ attemptId: 'ATT', orderId: 'K1-ORDER' })).toEqual({ result: 'not-charged' })
  })

  it('guest taps Cancel while the question is open: counts as No', async () => {
    const asked = deferred<boolean>()
    const { a, op, start } = setup(() => asked.promise)
    await flush()
    a.answer(0, PRINTING())
    await flush()
    expect(await op.cancel({ attemptId: 'ATT' })).toEqual({ result: 'cancelled' })
    expect(await start).toEqual({ result: 'cancelled' })
    expect(a.aborts()).toHaveLength(1)
    expect(a.postCalls()).toHaveLength(1)
  })

  it('a second "Printing problem" after skip=true is UNKNOWN; the guest is asked only once per attempt', async () => {
    const { a, ask, start } = setup(async () => true)
    await flush()
    a.answer(0, PRINTING())
    await flush()
    a.answer(1, PRINTING())
    await expect(start).rejects.toThrow(/Printing problem \(again/)
    expect(ask).toHaveBeenCalledTimes(1)
    expect(a.postCalls()).toHaveLength(2)
  })

  it('"Aborted" on the resend is cancelled; without the hook the answer stays UNKNOWN', async () => {
    const { a, start } = setup(async () => true)
    await flush()
    a.answer(0, PRINTING())
    await flush()
    a.answer(1, ok('"Aborted"', 409))
    expect(await start).toEqual({ result: 'cancelled' })

    const b = api()
    const op = new TmkOrderPayment(API, { fetch: b.fetchFn })
    const p = op.start({ attemptId: 'X', orderId: 'K1-ORDER', amountMinor: 600, currency: 'EUR', snapshot: snap() })
    await flush()
    b.answer(0, PRINTING())
    await expect(p).rejects.toThrow('Printing problem')
    expect(b.postCalls()).toHaveLength(1)
  })

  it('the dev backend\'s real success (IsSuccess true, Data null): accepted, shown with the kiosk\'s short reference', async () => {
    const { a, op, start } = setup(async () => true)
    await flush()
    a.answer(0, PRINTING())
    await flush()
    a.answer(1, ok('{"ResponseMessage":null,"StatusCode":200,"PopupResponseMessage":false,"IsSuccess":true,"Data":null}'))
    expect(await start).toEqual({ result: 'approved' }) // no IdOrder → the controller generates a tx reference
    expect(await op.submit({ idempotencyKey: 'k', orderId: 'K1-ORDER-acccc8c4', attemptId: 'ATT', txRef: 'TX', snapshot: snap() })).toEqual({ orderNo: 'CCC8C4', duplicate: false })
    expect(await op.print({ orderNo: 'CCC8C4', snapshot: snap() })).toEqual({ printed: false }) // not the backend's number → no receipt claim
  })

  it('through the controller: printing problem → Yes → skip=true → done with the order number; the record was written before the first POST', async () => {
    const a = api()
    const op = new TmkOrderPayment(API, { fetch: a.fetchFn, tableNumber: '9', askPrintingProblem: async () => true })
    const store = new MemoryPaidRecordStore()
    const c = new PaymentController({ adapters: { payment: op, pos: op, printer: op }, store, timeouts: TEST_TIMEOUTS, uncertainMs: 120_000, currency: 'EUR', deviceId: 'K1', newOrderId: () => 'K1-ORDER', onAccepted: () => {} })
    const p = c.start({ ...snapshotInput(), lines: [{ ...snapshotInput().lines[0], productId: '443491', basePriceCents: 600 }] })
    await flush()
    expect(c.state.status).toBe('waiting-for-card')
    expect(store.read().kind).toBe('ok')
    a.answer(0, PRINTING())
    await flush()
    expect(c.state.status).toBe('waiting-for-card') // still one attempt, one charge
    expect(a.postCalls()).toHaveLength(2)
    a.answer(1, ok(SUCCESS))
    await p
    await flush()
    expect(c.state.status).toBe('done')
    expect(c.state.orderNo).toBe('57')
    expect(c.state.attempt).toBe(1)
    c.dispose()
  })
})
