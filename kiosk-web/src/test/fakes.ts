import type {
  PaymentAdapter,
  PaymentCancelResult,
  PaymentProgress,
  PaymentStartRequest,
  PaymentStartResult,
  PaymentStatusResult,
  PosAdapter,
  PosSubmitRequest,
  PosSubmitResult,
  PrinterAdapter,
} from '../adapters/types'
import type { OrderSnapshot, Timeouts } from '../domain/types'

export interface Deferred<T> {
  promise: Promise<T>
  resolve: (v: T) => void
  reject: (e: unknown) => void
}

export function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

export class FakePayment implements PaymentAdapter {
  startCalls: PaymentStartRequest[] = []
  starts: Deferred<PaymentStartResult>[] = []
  progress: ((p: PaymentProgress) => void) | undefined
  statusCalls = 0
  statusResult: PaymentStatusResult | 'hang' | 'throw' = { result: 'unknown' }
  cancelCalls = 0
  cancelResult: PaymentCancelResult | 'hang' = { result: 'cancelled' }

  start(req: PaymentStartRequest, onProgress?: (p: PaymentProgress) => void): Promise<PaymentStartResult> {
    this.startCalls.push(req)
    this.progress = onProgress
    const d = deferred<PaymentStartResult>()
    this.starts.push(d)
    return d.promise
  }

  status(): Promise<PaymentStatusResult> {
    this.statusCalls += 1
    if (this.statusResult === 'hang') return new Promise(() => {})
    if (this.statusResult === 'throw') return Promise.reject(new Error('boom'))
    return Promise.resolve(this.statusResult)
  }

  cancel(): Promise<PaymentCancelResult> {
    this.cancelCalls += 1
    if (this.cancelResult === 'hang') return new Promise(() => {})
    return Promise.resolve(this.cancelResult)
  }

  get lastStart(): Deferred<PaymentStartResult> {
    return this.starts[this.starts.length - 1]
  }
}

export class FakePos implements PosAdapter {
  submits: PosSubmitRequest[] = []
  mode: 'ok' | 'fail' | 'hang' | 'no-orderno' = 'ok'
  private keys = new Map<string, string>()
  private counter = 100

  submit(req: PosSubmitRequest): Promise<PosSubmitResult> {
    this.submits.push(req)
    if (this.mode === 'hang') return new Promise(() => {})
    if (this.mode === 'fail') return Promise.reject(new Error('pos down'))
    if (this.mode === 'no-orderno') return Promise.resolve({ orderNo: '', duplicate: false })
    const existing = this.keys.get(req.idempotencyKey)
    if (existing) return Promise.resolve({ orderNo: existing, duplicate: true })
    this.counter += 1
    const orderNo = String(this.counter)
    this.keys.set(req.idempotencyKey, orderNo)
    return Promise.resolve({ orderNo, duplicate: false })
  }

  health() {
    return Promise.resolve({ ok: true })
  }

  ordersForKey(key: string): number {
    return this.keys.has(key) ? 1 : 0
  }
}

export class FakePrinter implements PrinterAdapter {
  prints = 0
  printed = true
  print(): Promise<{ printed: boolean }> {
    this.prints += 1
    return Promise.resolve({ printed: this.printed })
  }
}

export const TEST_TIMEOUTS: Timeouts = {
  paymentStart: 90_000,
  paymentStatus: 12_000,
  paymentCancel: 12_000,
  posSubmit: 15_000,
  print: 10_000,
  availability: 8_000,
  health: 5_000,
}

export function snapshotInput(): Omit<OrderSnapshot, 'orderId' | 'startedAt' | 'paidAt'> {
  return {
    lines: [
      {
        lineId: 'L1',
        productId: 'em-1001',
        productName: 'Classic Beef',
        servingId: 'single',
        servingName: 'Single',
        choices: [{ groupId: 'doneness', optionIds: ['medium'] }],
        extras: [],
        qty: 1,
        unitPriceCents: 1150,
        lineTotalCents: 1150,
        kind: 'item',
      },
    ],
    service: 'eat-in',
    lang: 'nl',
    tag: { type: 'table', value: '7' },
    totals: { subtotalCents: 1150, discountCents: 0, totalCents: 1150, count: 1 },
    loyalty: null,
    pricedWith: { catalogVersion: 312 },
  }
}
