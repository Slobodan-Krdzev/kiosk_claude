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

/** Last 6 characters of the kiosk's order id, upper-cased: the display number when the backend returns none. */
export const shortRef = (orderId: string): string => orderId.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()

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
  /**
   * The backend answered "Printing problem" without an order number: ask the guest "continue without receipt?".
   * true → the same order is sent again with ?skip=true (same OrderGuid), false → abortRequest, cancelled.
   * Without this hook the answer stays UNKNOWN (no prompt possible).
   */
  askPrintingProblem?: () => Promise<boolean>
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
  private readonly ask: TmkOrderOptions['askPrintingProblem']
  private readonly fetchFn: typeof fetch
  private readonly log: NonNullable<TmkOrderOptions['log']>
  /** Open POSTs by attemptId (cancel waits for them). */
  private readonly open = new Map<string, Promise<Outcome>>()
  /** "Continue without receipt?" prompts waiting for the guest, by attemptId (cancel answers them with false). */
  private readonly asking = new Map<string, (go: boolean) => void>()
  /** Closed POSTs by attemptId (submit / print read them). Bounded: a kiosk runs one attempt at a time. */
  private readonly outcomes = new Map<string, Outcome>()

  constructor(apiBase: string, opts: TmkOrderOptions = {}) {
    this.base = apiBase.replace(/\/+$/, '')
    this.startTimeoutMs = opts.startTimeoutMs ?? 240_000
    this.cancelTimeoutMs = opts.cancelTimeoutMs ?? 12_000
    this.tableFallback = opts.tableNumber ?? ''
    this.ask = opts.askPrintingProblem
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
    const att = req.attemptId
    try {
      const p = this.post(att, body, false)
      this.open.set(att, p)
      let o = await p
      this.open.delete(att)
      // "Printing problem" without an order number (the dev backend's answer to every order, 2026-10-16): the old
      // kiosk asked "continue without printing?" and re-sent the same order with skip=true. Once per attempt.
      if (o.kind === 'unknown' && o.message === MSG_PRINTING && this.ask) {
        const go = await this.prompt(att)
        if (go) {
          const p2 = this.post(att, body, true)
          this.open.set(att, p2)
          o = await p2
          this.open.delete(att)
          if (o.kind === 'unknown' && o.message === MSG_PRINTING) o = { ...o, message: `${MSG_PRINTING} (again, after skip=true)` }
        } else {
          await this.abortRequest(att)
          o = { kind: 'cancelled', orderNo: null, idOrder: null, printed: false, message: 'guest declined to continue without receipt' }
          this.outcomes.set(att, o)
          this.log('order.result', { attemptId: att, kind: o.kind, message: o.message })
        }
      }
      if (o.kind === 'approved') return { result: 'approved', ...(o.idOrder ? { txRef: o.idOrder } : {}) }
      if (o.kind === 'cancelled') return { result: 'cancelled' }
      // Unknown message / HTTP error: the controller treats a rejection as outcome UNKNOWN and keeps the record.
      throw new Error(o.message || 'order: unclassified response')
    } finally {
      this.open.delete(att)
      this.asking.delete(att)
    }
  }

  private prompt(att: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.asking.set(att, resolve)
      this.ask!().then(
        (go) => {
          if (this.asking.get(att) === resolve) resolve(go)
        },
        () => {
          if (this.asking.get(att) === resolve) resolve(false)
        },
      )
    }).finally(() => this.asking.delete(att))
  }

  private async abortRequest(att: string): Promise<void> {
    try {
      const ctl = new AbortController()
      const t = setTimeout(() => ctl.abort(), this.cancelTimeoutMs)
      try {
        const res = await this.fetchFn(this.abortUrl(), { method: 'GET', signal: ctl.signal })
        this.log('order.abortRequested', { attemptId: att, status: res.status })
      } finally {
        clearTimeout(t)
      }
    } catch (e) {
      this.log('order.abortFailed', { attemptId: att, error: String(e) })
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
    // Guest cancels while "continue without receipt?" is open: that is the "No" answer (start() sends abortRequest).
    const asking = this.asking.get(req.attemptId)
    if (asking) {
      asking(false)
      return { result: 'cancelled' }
    }
    const pending = this.open.get(req.attemptId)
    await this.abortRequest(req.attemptId)
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
    if (o.orderNo) return { orderNo: o.orderNo, duplicate: false }
    // Live 2026-10-16: the dev backend answers `IsSuccess: true` with `Data: null` — accepted, but no order number
    // (documented: Data.AdditionalData). The acceptance stands (rule 12); the guest gets the kiosk's own short
    // reference so staff can still match the order (BACKEND-DEPENDENCIES B9).
    const fallback = o.idOrder ?? shortRef(req.orderId)
    this.log('order.noNumber', { attemptId: req.attemptId, orderId: req.orderId, shown: fallback })
    return { orderNo: fallback, duplicate: false }
  }

  /** No health endpoint: the kiosk reaches the API when the menu loaded; the POST itself is the test. */
  async health(): Promise<{ ok: boolean }> {
    return { ok: true }
  }

  // ----- PrinterAdapter: the backend printed as part of the POST -----

  async print(req: { orderNo: string; snapshot: OrderSnapshot }): Promise<{ printed: boolean }> {
    const o = [...this.outcomes.values()].find((x) => x.orderNo === req.orderNo || (!x.orderNo && (x.idOrder === req.orderNo || shortRef(req.snapshot.orderId) === req.orderNo)))
    // A receipt is only reported as printed when the backend answered with its own order number AND did not
    // report a printing problem; a skip=true resend never printed (the guest chose to continue without).
    return { printed: !!o && o.printed && !!o.orderNo }
  }

  // ----- the POST -----

  private async post(attemptId: string, body: TmkOrderRequest, skip: boolean): Promise<Outcome> {
    // What goes out, per line: product id, quantity and the option product ids (modifiers / upsell picks).
    this.log('order.sent', {
      attemptId,
      skip,
      orderGuid: body.Order.OrderGuid,
      table: body.tableNumber,
      items: body.Order.Items.map((i) => ({ id: i.Item.Id, qty: i.Quantity, price: i.Item.Price, options: i.UpsaleCollection.map((u) => `${u.UpsaleStepOptionModel.ProductId}×${u.Quantity}`) })),
    })
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), this.startTimeoutMs)
    let outcome: Outcome
    let rawText = ''
    try {
      const res = await this.fetchFn(this.orderUrl(skip), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal })
      const text = await res.text()
      rawText = text
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
    // The raw body (bounded) is part of the log on purpose: the backend's real answers differ from the handover
    // document (HTTP 409 + bare string, NO-BREAK SPACE in the message) and every live run is evidence.
    this.log('order.result', { attemptId, skip, kind: outcome.kind, orderNo: outcome.orderNo, idOrder: outcome.idOrder, printed: outcome.printed, message: outcome.message, raw: rawText.slice(0, 400), ...(outcome.kind === 'unknown' ? { codes: [...rawText.slice(0, 60)].map((c) => c.charCodeAt(0)) } : {}) })
    return outcome
  }
}

/** Trimmed text with runs of whitespace collapsed to one space: the dev backend writes "Printing problem" with a NO-BREAK SPACE (U+00A0) between the words (live run 2026-10-16). */
const str = (v: unknown): string | null => {
  if (v == null) return null
  const s = String(v).replace(/\s+/g, ' ').trim()
  return s || null
}

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
