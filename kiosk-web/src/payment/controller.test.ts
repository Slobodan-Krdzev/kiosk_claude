import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FakePayment, FakePos, FakePrinter, TEST_TIMEOUTS, snapshotInput } from '../test/fakes'
import { PaymentController } from './controller'
import { MemoryPaidRecordStore } from './persistence'

function setup(opts: { failWrites?: boolean } = {}) {
  const payment = new FakePayment()
  const pos = new FakePos()
  const printer = new FakePrinter()
  const store = new MemoryPaidRecordStore()
  store.failWrites = !!opts.failWrites
  const accepted: string[] = []
  let orderCounter = 0
  const ctrl = new PaymentController({
    adapters: { payment, pos, printer },
    store,
    timeouts: TEST_TIMEOUTS,
    uncertainMs: 120_000,
    currency: 'EUR',
    deviceId: 'KTEST',
    newOrderId: () => `KTEST-o${++orderCounter}`,
    onAccepted: (i) => accepted.push(i.orderNo),
  })
  return { ctrl, payment, pos, printer, store, accepted }
}

const flush = () => vi.advanceTimersByTimeAsync(0)

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('PaymentController — happy path', () => {
  it('persists the record before the terminal is touched, then approves, submits and prints once', async () => {
    const { ctrl, payment, pos, printer, store, accepted } = setup()
    const p = ctrl.start(snapshotInput())
    await flush()
    expect(payment.startCalls).toHaveLength(1)
    const rec = store.peek()
    expect(rec?.submissionState).toBe('starting')
    expect(rec?.idempotencyKey).toBe('IDEMP-KTEST-o1')
    expect(ctrl.state.status).toBe('connecting')

    payment.progress?.('waiting-for-card')
    payment.progress?.('processing')
    expect(ctrl.state.status).toBe('processing')

    payment.lastStart.resolve({ result: 'approved', txRef: 'TX1' })
    await p
    await flush()
    expect(ctrl.state.status).toBe('done')
    expect(ctrl.state.orderNo).toBe('101')
    expect(ctrl.state.txRef).toBe('TX1')
    expect(pos.submits).toHaveLength(1)
    expect(pos.submits[0].idempotencyKey).toBe('IDEMP-KTEST-o1')
    expect(accepted).toEqual(['101'])
    expect(printer.prints).toBe(1)
    expect(ctrl.state.receipt).toBe('printed')
    expect(store.peek()).toBeNull() // cleared after the print step
    expect(ctrl.reset()).toBe(true)
    expect(ctrl.state.status).toBe('idle')
  })

  it('refuses to start when the record cannot be written', async () => {
    const { ctrl, payment } = setup({ failWrites: true })
    const ok = await ctrl.start(snapshotInput())
    expect(ok).toBe(false)
    expect(ctrl.state.status).toBe('idle')
    expect(ctrl.state.storeFailed).toBe(true)
    expect(payment.startCalls).toHaveLength(0)
  })
})

describe('PaymentController — declined / cancelled / retry', () => {
  it('declined clears the record and allows a retry with a new attemptId but the same orderId and key', async () => {
    const { ctrl, payment, store } = setup()
    const p1 = ctrl.start(snapshotInput())
    await flush()
    const firstAttempt = ctrl.state.attemptId
    payment.lastStart.resolve({ result: 'declined' })
    await p1
    expect(ctrl.state.status).toBe('declined')
    expect(ctrl.state.snapshot).toBeNull()
    expect(store.peek()).toBeNull()
    expect(ctrl.canRetry()).toBe(true)

    const p2 = ctrl.start(snapshotInput())
    await flush()
    expect(ctrl.state.orderId).toBe('KTEST-o1')
    expect(ctrl.state.attemptId).not.toBe(firstAttempt)
    expect(ctrl.state.attempt).toBe(2)
    expect(store.peek()?.idempotencyKey).toBe('IDEMP-KTEST-o1')
    payment.lastStart.resolve({ result: 'approved', txRef: 'TX2' })
    await p2
    await flush()
    expect(ctrl.state.status).toBe('done')
  })

  it('guest cancel: cancel-requested until the provider confirms, then cancelled with nothing kept', async () => {
    const { ctrl, payment, store } = setup()
    void ctrl.start(snapshotInput())
    await flush()
    payment.cancelResult = { result: 'cancelled' }
    const c = ctrl.cancel()
    expect(ctrl.state.status).toBe('cancel-requested')
    expect(store.peek()?.submissionState).toBe('cancel-requested')
    await c
    expect(ctrl.state.status).toBe('cancelled')
    expect(store.peek()).toBeNull()
    ctrl.backToCart()
    expect(ctrl.state.status).toBe('idle')
  })

  it('cancel answered with approved is applied once, and the late start approval is ignored', async () => {
    const { ctrl, payment, pos } = setup()
    const p = ctrl.start(snapshotInput())
    await flush()
    payment.cancelResult = { result: 'approved', txRef: 'TXC' }
    await ctrl.cancel()
    await flush()
    expect(ctrl.state.status).toBe('done')
    payment.lastStart.resolve({ result: 'approved', txRef: 'TXLATE' })
    await p
    await flush()
    expect(pos.submits).toHaveLength(1)
    expect(ctrl.state.txRef).toBe('TXC')
  })

  it('cancel with an unknown answer ends in timeout (uncertain), record kept', async () => {
    const { ctrl, payment, store } = setup()
    void ctrl.start(snapshotInput())
    await flush()
    payment.cancelResult = { result: 'unknown' }
    await ctrl.cancel()
    expect(ctrl.state.status).toBe('timeout')
    expect(store.peek()?.submissionState).toBe('timeout')
    expect(ctrl.isLocked()).toBe(true)
  })
})

describe('PaymentController — uncertainty', () => {
  it('a terminal timeout is UNKNOWN: record kept, lookup resolves it', async () => {
    const { ctrl, payment, store, pos } = setup()
    const p = ctrl.start(snapshotInput())
    await flush()
    payment.lastStart.resolve({ result: 'timeout' })
    await p
    expect(ctrl.state.status).toBe('timeout')
    expect(store.peek()?.submissionState).toBe('timeout')
    expect(ctrl.reset()).toBe(false)

    payment.statusResult = { result: 'approved', txRef: 'TXS' }
    await ctrl.lookup()
    await flush()
    expect(ctrl.state.status).toBe('done')
    expect(pos.submits).toHaveLength(1)
  })

  it('lookup "not-charged" returns to idle and clears everything', async () => {
    const { ctrl, payment, store } = setup()
    const p = ctrl.start(snapshotInput())
    await flush()
    payment.lastStart.resolve({} as never)
    await p
    expect(ctrl.state.status).toBe('timeout')
    expect(ctrl.state.uncertainReason).toBe('unknown-result')
    payment.statusResult = { result: 'not-charged' }
    await ctrl.lookup()
    expect(ctrl.state.status).toBe('idle')
    expect(store.peek()).toBeNull()
    expect(ctrl.canRetryPayment()).toBe(true)
  })

  it('lookup that times out stays in timeout and asks for assistance', async () => {
    const { ctrl, payment } = setup()
    const p = ctrl.start(snapshotInput())
    await flush()
    payment.lastStart.resolve({ result: 'timeout' })
    await p
    payment.statusResult = 'hang'
    const l = ctrl.lookup()
    await vi.advanceTimersByTimeAsync(TEST_TIMEOUTS.paymentStatus + 1)
    await l
    expect(ctrl.state.status).toBe('timeout')
    expect(ctrl.state.assistanceNeeded).toBe(true)
  })

  it('the guard timer turns a hanging terminal into timeout; a late approval is still honoured', async () => {
    const { ctrl, payment, pos } = setup()
    const p = ctrl.start(snapshotInput())
    await flush()
    await vi.advanceTimersByTimeAsync(TEST_TIMEOUTS.paymentStart + 1)
    expect(ctrl.state.status).toBe('timeout')
    payment.lastStart.resolve({ result: 'approved', txRef: 'TXLATE' })
    await p
    await flush()
    expect(ctrl.state.status).toBe('done')
    expect(pos.submits).toHaveLength(1)
  })

  it('a rejected start promise is unknown, not failure', async () => {
    const { ctrl, payment, store } = setup()
    const p = ctrl.start(snapshotInput())
    await flush()
    payment.lastStart.reject(new Error('adapter crashed'))
    await p
    expect(ctrl.state.status).toBe('timeout')
    expect(store.peek()).not.toBeNull()
  })

  it('after uncertainMs the assistance flag is raised', async () => {
    const { ctrl, payment } = setup()
    const p = ctrl.start(snapshotInput())
    await flush()
    payment.lastStart.resolve({ result: 'timeout' })
    await p
    await vi.advanceTimersByTimeAsync(120_001)
    expect(ctrl.state.assistanceNeeded).toBe(true)
  })
})

describe('PaymentController — paid but order not confirmed', () => {
  it('POS failure → recovery-required with a reference; resend uses the same key and yields one order', async () => {
    const { ctrl, payment, pos, store, accepted } = setup()
    pos.mode = 'fail'
    const p = ctrl.start(snapshotInput())
    await flush()
    payment.lastStart.resolve({ result: 'approved', txRef: 'TX' })
    await p
    await flush()
    expect(ctrl.state.status).toBe('recovery-required')
    expect(ctrl.state.recoveryRef).toMatch(/^GUE-/)
    expect(store.peek()?.submissionState).toBe('order-submit-failed')
    expect(accepted).toEqual([])
    expect(ctrl.reset()).toBe(false)

    pos.mode = 'ok'
    await ctrl.submitRetry()
    await flush()
    expect(ctrl.state.status).toBe('done')
    expect(pos.submits).toHaveLength(2)
    expect(new Set(pos.submits.map((s) => s.idempotencyKey)).size).toBe(1)
    expect(pos.ordersForKey('IDEMP-KTEST-o1')).toBe(1)
    expect(accepted).toEqual(['101'])
  })

  it('POS timeout → recovery-required (same key on retry); a missing orderNo counts as not accepted', async () => {
    const { ctrl, payment, pos } = setup()
    pos.mode = 'hang'
    const p = ctrl.start(snapshotInput())
    await flush()
    payment.lastStart.resolve({ result: 'approved', txRef: 'TX' })
    await p
    await vi.advanceTimersByTimeAsync(TEST_TIMEOUTS.posSubmit + 1)
    expect(ctrl.state.status).toBe('recovery-required')

    pos.mode = 'no-orderno'
    await ctrl.submitRetry()
    expect(ctrl.state.status).toBe('recovery-required')
    expect(ctrl.state.lastError).toBe('no-orderno')
  })
})

describe('PaymentController — restart recovery', () => {
  it('restores an approved-but-unsubmitted record and resubmits with the same key', async () => {
    const first = setup()
    first.pos.mode = 'hang'
    const p = first.ctrl.start(snapshotInput())
    await flush()
    first.payment.lastStart.resolve({ result: 'approved', txRef: 'TX' })
    await p
    expect(first.store.peek()?.submissionState).toBe('submitting')
    const raw = JSON.stringify(first.store.peek())
    first.ctrl.dispose()

    const second = setup()
    second.store.seed(raw)
    await second.ctrl.restore()
    await flush()
    expect(second.ctrl.state.status).toBe('done')
    expect(second.ctrl.state.restored).toBe(true)
    expect(second.pos.submits[0].idempotencyKey).toBe('IDEMP-KTEST-o1')
    expect(second.accepted).toEqual(['101'])
  })

  it('restores a "starting" record via status-check: approved finishes the order', async () => {
    const first = setup()
    void first.ctrl.start(snapshotInput())
    await flush()
    const raw = JSON.stringify(first.store.peek())
    first.ctrl.dispose()

    const second = setup()
    second.store.seed(raw)
    second.payment.statusResult = { result: 'approved', txRef: 'TXR' }
    await second.ctrl.restore()
    await flush()
    expect(second.ctrl.state.status).toBe('done')
    expect(second.payment.statusCalls).toBe(1)
    expect(second.payment.startCalls).toHaveLength(0) // never a second charge
  })

  it('restores a "starting" record via status-check: not-charged gives a clean start', async () => {
    const first = setup()
    void first.ctrl.start(snapshotInput())
    await flush()
    const raw = JSON.stringify(first.store.peek())

    const second = setup()
    second.store.seed(raw)
    second.payment.statusResult = { result: 'not-charged' }
    await second.ctrl.restore()
    expect(second.ctrl.state.status).toBe('idle')
    expect(second.store.peek()).toBeNull()
    expect(second.ctrl.state.orderId).toBeNull()
  })

  it('restores a "timeout" record: unknown status → assistance, record kept', async () => {
    const first = setup()
    const p = first.ctrl.start(snapshotInput())
    await flush()
    first.payment.lastStart.resolve({ result: 'timeout' })
    await p
    const raw = JSON.stringify(first.store.peek())

    const second = setup()
    second.store.seed(raw)
    second.payment.statusResult = 'throw'
    await second.ctrl.restore()
    expect(second.ctrl.state.status).toBe('assistance')
    expect(second.store.peek()).not.toBeNull()
    expect(second.ctrl.reset()).toBe(false)
    expect(second.ctrl.staffClear('handled at POS', 'staff-1')).toBe(true)
    expect(second.ctrl.state.status).toBe('idle')
  })

  it('an invalid record goes to assistance with the raw record', async () => {
    const { ctrl, store } = setup()
    store.seed('{"schemaVersion":2,"junk":true}')
    await ctrl.restore()
    expect(ctrl.state.status).toBe('assistance')
    expect(ctrl.state.rawRecovery).toContain('junk')
  })

  it('an accepted record restores to done with receipt unknown', async () => {
    const first = setup()
    first.printer.print = () => new Promise(() => {}) // crash during print step
    const p = first.ctrl.start(snapshotInput())
    await flush()
    first.payment.lastStart.resolve({ result: 'approved', txRef: 'TX' })
    await p
    await flush()
    expect(first.ctrl.state.status).toBe('done')
    const raw = JSON.stringify(first.store.peek())
    expect(raw).toContain('"accepted"')

    const second = setup()
    second.store.seed(raw)
    await second.ctrl.restore()
    expect(second.ctrl.state.status).toBe('done')
    expect(second.ctrl.state.receipt).toBe('unknown')
    expect(second.ctrl.state.orderNo).toBe('101')
    expect(second.pos.submits).toHaveLength(0)
  })
})
