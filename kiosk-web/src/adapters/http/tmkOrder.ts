// Order + payment against today's kiosk API: ONE blocking POST (`CreateKioskOrderWithPinPayment`) runs the CCV
// terminal, creates the order and prints. Contract: docs/reference/kiosk-payment-flow.md; mapping onto the
// kiosk's payment controller: docs/reference/order-payment-integration.md (2026-10-16).
//
// The controller's three steps stay; this class implements all three against the one call:
//   payment.start()  → the POST (the order travels in PaymentStartRequest.snapshot)
//   pos.submit()     → no network call: returns the order number the POST answered for this attempt
//   printer.print()  → no network call: the POST printed (or answered "Printing problem")
//   payment.cancel() → GET abortRequest, then waits for the open POST to close ("Aborted" = cancelled)
//   payment.status() → no endpoint exists: always unknown (BACKEND-DEPENDENCIES B7)
// Anything the kiosk cannot classify as "nothing charged" is UNKNOWN, never declined: the controller then keeps the
// record and the Pay screen offers status / assistance instead of leaving the guest on "pay at the terminal".

import type { OrderSnapshot } from '../../domain/types'
import type { PaymentAdapter, PaymentCancelResult, PaymentProgress, PaymentStartRequest, PaymentStartResult, PaymentStatusResult, PosAdapter, PosSubmitRequest, PosSubmitResult, PrinterAdapter } from '../types'

// ---------- wire types (Types/SendOrderTypes.ts of the old kiosk) ----------

export interface TmkOrderItem {
  Item: { Id: number; PluCode: string; Image: string; Name: string; Price: number }
  Variants: never[]
  UpsaleCollection: { UpsaleStepOptionModel: { ProductId: number; Name: string; Price: number }; Quantity: number }[]
  Quantity: number
  ItemGuid: string
  CoursePosition: number
  Note: string
}

export interface TmkOrderRequest {
  Order: { OrderGuid: string; SessionGuid: string; Items: TmkOrderItem[] }
  tableNumber: string
  deviceSessionId: string
}

export interface TmkOrderResponse {
  IsSuccess?: boolean
  ResponseMessage?: string | null
  Data?: { AdditionalData?: string | number | null; IdOrder?: number | string | null } | null
}

export const MSG_ABORTED = 'Aborted'
export const MSG_PRINTING = 'Printing problem'

const euros = (cents: number): number => Math.round(cents) / 100

/**
 * Snapshot → request body. Lines of kind item / cross-sell become Items; the base product price and each picked
 * option are priced separately (the old kiosk never sent a line total). Gift lines are not sent: the API has no
 * notion of them and they do not exist on API menus.
 */
export function buildOrderPayload(snapshot: OrderSnapshot, tableNumber: string): TmkOrderRequest {
  const Items: TmkOrderItem[] = []
  for (const l of snapshot.lines) {
    if (l.kind === 'gift') continue
    const id = Number(l.productId)
    if (!Number.isInteger(id)) throw new Error(`order: line ${l.lineId} has no numeric ProductId (${l.productId})`)
    const UpsaleCollection: TmkOrderItem['UpsaleCollection'] = []
    for (const x of l.extras || []) {
      const pid = Number(x.productId)
      if (!x.productId || !Number.isInteger(pid)) throw new Error(`order: option ${x.extraId} has no ProductId`)
      UpsaleCollection.push({ UpsaleStepOptionModel: { ProductId: pid, Name: x.name ?? '', Price: euros(x.priceCents ?? 0) }, Quantity: Math.max(1, x.qty | 0) })
    }
    Items.push({
      Item: { Id: id, PluCode: '', Image: l.image ?? '', Name: l.productName, Price: euros(l.basePriceCents ?? l.unitPriceCents) },
      Variants: [],
      UpsaleCollection,
      Quantity: l.qty,
      ItemGuid: '',
      CoursePosition: 0,
      Note: '',
    })
  }
  if (!Items.length) throw new Error('order: nothing to send')
  return { Order: { OrderGuid: snapshot.orderId, SessionGuid: '', Items }, tableNumber, deviceSessionId: '' }
}

/** `tableNumber` for the POST: the guest's table tag, else the kiosk's configured fallback. */
export function tableNumberFor(snapshot: OrderSnapshot, fallback: string): string {
  return snapshot.tag?.type === 'table' && snapshot.tag.value ? String(snapshot.tag.value) : fallback
}

// ---------- the adapter ----------

export interface TmkOrderOptions {
  /** How long the POST may stay open before it is aborted (then: outcome UNKNOWN). Longer than the controller's guard. */
  startTimeoutMs?: number
  /** Bound for abortRequest + the POST closing after it. */
  cancelTimeoutMs?: number
  /** `tableNumber` when the order carries no table tag. */
  tableNumber?: string
  fetch?: typeof fetch
  log?: (event: string, data?: Record<string, unknown>) => void
}

interface Outcome {
  kind: 'approved' | 'cancelled' | 'unknown'
  orderNo: string | null
  idOrder: string | null
  printed: boolean
  message: string | null
}

export class TmkOrderPayment implements PaymentAdapter, PosAdapter, PrinterAdapter {
  private readonly base: string
  private readonly startTimeoutMs: number
  private readonly cancelTimeoutMs: number
  private readonly tableFallback: string
  private readonly fetchFn: typeof fetch
  private readonly log: NonNullable<TmkOrderOptions['log']>
  /** Open POSTs by attemptId (cancel waits for them). */
  private readonly open = new Map<string, Promise<Outcome>>()
  /** Closed POSTs by attemptId (submit / print read them). Bounded: a kiosk runs one attempt at a time. */
  private readonly outcomes = new Map<string, Outcome>()

  constructor(apiBase: string, opts: TmkOrderOptions = {}) {
    this.base = apiBase.replace(/\/+$/, '')
    this.startTimeoutMs = opts.startTimeoutMs ?? 240_000
    this.cancelTimeoutMs = opts.cancelTimeoutMs ?? 12_000
    this.tableFallback = opts.tableNumber ?? ''
    this.fetchFn = opts.fetch ?? ((input, init) => fetch(input, init))
    this.log = opts.log ?? (() => {})
  }

  orderUrl(skip = false): string {
    return `${this.base}/CreateKioskOrderWithPinPayment?skip=${skip ? 'true' : 'false'}`
  }
  abortUrl(): string {
    return `${this.base}/abortRequest`
  }

  // ----- PaymentAdapter -----

  async start(req: PaymentStartRequest, onProgress?: (p: PaymentProgress) => void): Promise<PaymentStartResult> {
    if (!req.snapshot) throw new Error('order: start() without a snapshot')
    const body = buildOrderPayload(req.snapshot, tableNumberFor(req.snapshot, this.tableFallback))
    // The POST is opaque while the guest pays at the terminal: show "waiting for card" at once.
    onProgress?.('waiting-for-card')
    const p = this.post(req.attemptId, body, false)
    this.open.set(req.attemptId, p)
    try {
      const o = await p
      if (o.kind === 'approved') return { result: 'approved', ...(o.idOrder ? { txRef: o.idOrder } : {}) }
      if (o.kind === 'cancelled') return { result: 'cancelled' }
      // Unknown message / HTTP error: the controller treats a rejection as outcome UNKNOWN and keeps the record.
      throw new Error(o.message || 'order: unclassified response')
    } finally {
      this.open.delete(req.attemptId)
    }
  }

  /** No status endpoint exists (CheckKioskPayment is dead, kiosk-payment-flow.md): the outcome stays unknown. */
  async status(req: { attemptId: string; orderId: string }): Promise<PaymentStatusResult> {
    const o = this.outcomes.get(req.attemptId)
    if (o?.kind === 'approved') return { result: 'approved', ...(o.idOrder ? { txRef: o.idOrder } : {}) }
    if (o?.kind === 'cancelled') return { result: 'not-charged' }
    this.log('order.statusUnavailable', { attemptId: req.attemptId, orderId: req.orderId })
    return { result: 'unknown' }
  }

  /** abortRequest asks the backend to cancel the terminal; the open POST then closes with "Aborted". */
  async cancel(req: { attemptId: string }): Promise<PaymentCancelResult> {
    const pending = this.open.get(req.attemptId)
    try {
      const ctl = new AbortController()
      const t = setTimeout(() => ctl.abort(), this.cancelTimeoutMs)
      try {
        const res = await this.fetchFn(this.abortUrl(), { method: 'GET', signal: ctl.signal })
        this.log('order.abortRequested', { attemptId: req.attemptId, status: res.status })
      } finally {
        clearTimeout(t)
      }
    } catch (e) {
      this.log('order.abortFailed', { attemptId: req.attemptId, error: String(e) })
    }
    const done = pending ?? (this.outcomes.has(req.attemptId) ? Promise.resolve(this.outcomes.get(req.attemptId)!) : null)
    if (!done) return { result: 'unknown' }
    const o = await Promise.race([done, new Promise<null>((r) => setTimeout(() => r(null), this.cancelTimeoutMs))])
    if (!o) return { result: 'unknown' }
    if (o.kind === 'cancelled') return { result: 'cancelled' }
    if (o.kind === 'approved') return { result: 'approved', ...(o.idOrder ? { txRef: o.idOrder } : {}) }
    return { result: 'unknown' }
  }

  // ----- PosAdapter: the POST already created the order -----

  async submit(req: PosSubmitRequest): Promise<PosSubmitResult> {
    const o = this.outcomes.get(req.attemptId)
    if (!o || o.kind !== 'approved') throw new Error(`order: no accepted order for attempt ${req.attemptId}`)
    if (!o.orderNo) throw new Error('no-orderno')
    return { orderNo: o.orderNo, duplicate: false }
  }

  /** No health endpoint: the kiosk reaches the API when the menu loaded; the POST itself is the test. */
  async health(): Promise<{ ok: boolean }> {
    return { ok: true }
  }

  // ----- PrinterAdapter: the backend printed as part of the POST -----

  async print(req: { orderNo: string; snapshot: OrderSnapshot }): Promise<{ printed: boolean }> {
    const o = [...this.outcomes.values()].find((x) => x.orderNo === req.orderNo)
    return { printed: !!o && o.printed }
  }

  // ----- the POST -----

  private async post(attemptId: string, body: TmkOrderRequest, skip: boolean): Promise<Outcome> {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), this.startTimeoutMs)
    let outcome: Outcome
    try {
      const res = await this.fetchFn(this.orderUrl(skip), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal })
      const text = await res.text()
      let json: unknown = null
      try {
        json = text ? JSON.parse(text) : null
      } catch {
        json = null
      }
      outcome = classify(res.status, json, text)
    } catch (e) {
      outcome = { kind: 'unknown', orderNo: null, idOrder: null, printed: false, message: ctl.signal.aborted ? `order: no answer after ${this.startTimeoutMs} ms` : `order: ${String(e)}` }
    } finally {
      clearTimeout(timer)
    }
    this.outcomes.set(attemptId, outcome)
    this.log('order.result', { attemptId, kind: outcome.kind, orderNo: outcome.orderNo, idOrder: outcome.idOrder, printed: outcome.printed, message: outcome.message })
    return outcome
  }
}

const str = (v: unknown): string | null => (v != null && String(v).trim() ? String(v).trim() : null)

/**
 * HTTP status + body → outcome. Exported for the tests; every row of order-payment-integration.md §4 is here.
 * The old kiosk turned every non-2xx answer into `{ IsSuccess: false, ResponseMessage: <body> }` before matching
 * the two known messages — and that is how the dev backend actually speaks: "Printing problem" arrived as
 * **HTTP 409 with the JSON string `"Printing problem"` as body** (live run 2026-10-16, api-samples/README.md).
 * So the message is taken from `ResponseMessage`, a bare string body, or `Message`, whatever the status.
 */
export function classify(status: number, json: unknown, text: string): Outcome {
  const none: Outcome = { kind: 'unknown', orderNo: null, idOrder: null, printed: false, message: null }
  const obj: TmkOrderResponse | null = json && typeof json === 'object' ? (json as TmkOrderResponse) : null
  const ok = status >= 200 && status < 300
  const message = obj ? (typeof obj.ResponseMessage === 'string' ? str(obj.ResponseMessage) : str((obj as { Message?: unknown }).Message)) : typeof json === 'string' ? str(json) : str(text)
  const orderNo = str(obj?.Data?.AdditionalData)
  const idOrder = str(obj?.Data?.IdOrder)
  if (ok && obj?.IsSuccess === true) return { kind: 'approved', orderNo, idOrder, printed: true, message }
  if (message === MSG_ABORTED) return { kind: 'cancelled', orderNo: null, idOrder: null, printed: false, message }
  // "Printing problem": on the dev backend this came back in ~1 s, before any terminal contact could have happened
  // (live runs 2026-10-16), so it must NOT count as paid. With an order number the order exists (→ done, receipt
  // failed); without one the outcome is UNKNOWN until the backend says what state the payment is in (question 2)
  // and whether a resend with skip=true is de-duplicated (B4). The old kiosk re-POSTed here; the kiosk does not.
  if (message === MSG_PRINTING) return orderNo ? { kind: 'approved', orderNo, idOrder, printed: false, message } : { ...none, message: MSG_PRINTING }
  if (!ok) return { ...none, message: `order: HTTP ${status} ${message ?? ''}`.trim() }
  if (!obj) return { ...none, message: 'order: empty or non-JSON answer' }
  return { ...none, message: `order: ${message || 'IsSuccess false without message'}` }
}
