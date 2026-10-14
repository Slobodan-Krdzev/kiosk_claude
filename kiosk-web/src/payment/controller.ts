// Payment + order submission controller.
// Implements the v36 reference state machine (failover-handover/docs/reference/kiosk-payment-and-recovery-v36.md)
// as a framework-free class so it can be unit-tested with fake adapters and fake timers.
//
// Invariants:
//  - persist BEFORE touching the terminal; the record is cleared only when nothing was charged or after acceptance+print
//  - one attemptId = at most one charge; approval is applied exactly once (FINALIZED)
//  - a timeout is UNKNOWN, never failure; the guest is never asked to pay again automatically
//  - the idempotency key IDEMP-<orderId> never changes across retries or restarts
//  - the cart is cleared only after the POS accepted the order

import type { PaymentAdapter, PaymentStartResult, PosAdapter, PrinterAdapter } from '../adapters/types'
import { withTimeout } from '../adapters/withTimeout'
import { attemptIndexOf, fallbackTxRef, idempotencyKeyFor, newAttemptId, newRecoveryRef, newSessionId } from '../domain/ids'
import type { OrderSnapshot, Timeouts } from '../domain/types'
import type { PaidRecord, PaidRecordStore } from './persistence'
import { MAY_HAVE_SUCCEEDED, NOTHING_CHARGED, PAY_T, PAY_UNCERTAIN, type PayStatus, type SubmissionState } from './states'

export type ReceiptState = 'none' | 'printing' | 'printed' | 'failed' | 'unknown'

export interface PayState {
  status: PayStatus
  orderSession: string
  orderId: string | null
  attempt: number
  attemptId: string | null
  txRef: string | null
  txRefGenerated: boolean
  submitKey: string | null
  recoveryRef: string | null
  snapshot: OrderSnapshot | null
  orderNo: string | null
  accepted: boolean
  duplicate: boolean
  receipt: ReceiptState
  uncertainReason: string | null
  assistanceNeeded: boolean
  rawRecovery: string | null
  storeFailed: boolean
  restored: boolean
  lastError: string | null
}

export interface PaymentDeps {
  adapters: { payment: PaymentAdapter; pos: PosAdapter; printer: PrinterAdapter }
  store: PaidRecordStore
  timeouts: Timeouts
  uncertainMs: number
  currency: string
  deviceId: string
  newOrderId: () => string
  /** Called exactly when the POS accepted the order: the cart may be emptied now. */
  onAccepted: (info: { orderNo: string; snapshot: OrderSnapshot; orderId: string }) => void
  log?: (event: string, data?: Record<string, unknown>) => void
}

export type PayListener = (s: PayState) => void

function initialState(session: string): PayState {
  return {
    status: 'idle',
    orderSession: session,
    orderId: null,
    attempt: 0,
    attemptId: null,
    txRef: null,
    txRefGenerated: false,
    submitKey: null,
    recoveryRef: null,
    snapshot: null,
    orderNo: null,
    accepted: false,
    duplicate: false,
    receipt: 'none',
    uncertainReason: null,
    assistanceNeeded: false,
    rawRecovery: null,
    storeFailed: false,
    restored: false,
    lastError: null,
  }
}

export class PaymentController {
  private s: PayState
  private readonly deps: PaymentDeps
  private readonly finalized = new Set<string>()
  private readonly listeners = new Set<PayListener>()
  private timers: Partial<Record<'guard' | 'progress' | 'uncertain', ReturnType<typeof setTimeout>>> = {}

  constructor(deps: PaymentDeps) {
    this.deps = deps
    this.s = initialState(newSessionId())
  }

  // ---------- observation ----------

  get state(): PayState {
    return this.s
  }

  /** Fresh read of the status (avoids TS narrowing across a transition). */
  private cur(): PayStatus {
    return this.s.status
  }

  subscribe(fn: PayListener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private set(patch: Partial<PayState>): void {
    this.s = { ...this.s, ...patch }
    for (const l of this.listeners) l(this.s)
  }

  private log(event: string, data?: Record<string, unknown>): void {
    this.deps.log?.(event, { ...data, status: this.s.status, orderId: this.s.orderId, attemptId: this.s.attemptId })
  }

  /** Transition guard. Illegal transitions are no-ops (logged). */
  private go(to: PayStatus): boolean {
    const from = this.s.status
    if (!PAY_T[from].includes(to)) {
      console.warn(`[pay] illegal transition ${from} → ${to}`)
      this.log('pay.illegal', { from, to })
      return false
    }
    this.set({ status: to })
    this.log('pay.state', { from, to })
    return true
  }

  /** Boot-time restore sets the status directly (the table has no idle → X edge for that). */
  private restoreTo(to: PayStatus): void {
    this.set({ status: to, restored: true })
    this.log('pay.restore', { to })
  }

  // ---------- predicates ----------

  paymentMayHaveSucceeded(): boolean {
    return !!this.s.snapshot || MAY_HAVE_SUCCEEDED.has(this.s.status)
  }

  /** True while inactivity resets, navigation and "new order" must be refused. */
  isLocked(): boolean {
    return PAY_UNCERTAIN.has(this.s.status) || this.paymentMayHaveSucceeded()
  }

  canRetryPayment(): boolean {
    return (this.s.status === 'idle' || NOTHING_CHARGED.has(this.s.status)) && !this.s.snapshot
  }

  private isCurrent(session: string, attemptId: string | null): boolean {
    return session === this.s.orderSession && attemptId !== null && attemptId === this.s.attemptId
  }

  // ---------- persistence ----------

  private buildRecord(submissionState: SubmissionState): PaidRecord | null {
    const { orderId, attemptId, submitKey, snapshot } = this.s
    if (!orderId || !attemptId || !submitKey || !snapshot) return null
    return {
      schemaVersion: 3,
      deviceId: this.deps.deviceId,
      orderId,
      orderSessionId: this.s.orderSession,
      paymentAttemptId: attemptId,
      transactionReference: this.s.txRef,
      idempotencyKey: submitKey,
      startedAt: snapshot.startedAt,
      paidAt: snapshot.paidAt ?? null,
      snapshot,
      recoveryReference: this.s.recoveryRef,
      submissionState,
      accepted: this.s.accepted,
      orderNo: this.s.orderNo,
      savedAt: new Date().toISOString(),
    }
  }

  private persist(submissionState: SubmissionState): boolean {
    const rec = this.buildRecord(submissionState)
    if (!rec) return false
    const ok = this.deps.store.write(rec)
    if (!ok) this.log('pay.persistFailed', { submissionState })
    return ok
  }

  private clearAttemptData(): void {
    this.deps.store.clear()
    this.set({ snapshot: null, txRef: null, txRefGenerated: false, uncertainReason: null, assistanceNeeded: false, lastError: null })
  }

  // ---------- timers ----------

  private clearTimer(name: 'guard' | 'progress' | 'uncertain'): void {
    const t = this.timers[name]
    if (t) clearTimeout(t)
    delete this.timers[name]
  }

  private clearAllTimers(): void {
    this.clearTimer('guard')
    this.clearTimer('progress')
    this.clearTimer('uncertain')
  }

  private armProgress(session: string, att: string): void {
    this.clearTimer('progress')
    this.timers.progress = setTimeout(() => {
      if (this.isCurrent(session, att) && this.s.status === 'connecting') this.go('waiting-for-card')
    }, 1500)
  }

  private armGuard(session: string, att: string): void {
    this.clearTimer('guard')
    this.timers.guard = setTimeout(() => {
      if (!this.isCurrent(session, att)) return
      const st = this.s.status
      if (st === 'connecting' || st === 'waiting-for-card' || st === 'processing' || st === 'cancel-requested') {
        this.uncertain('terminal-timeout')
      }
    }, this.deps.timeouts.paymentStart)
  }

  private armUncertain(): void {
    this.clearTimer('uncertain')
    this.timers.uncertain = setTimeout(() => {
      if (PAY_UNCERTAIN.has(this.s.status)) this.set({ assistanceNeeded: true })
    }, this.deps.uncertainMs)
  }

  private ensureProcessing(): void {
    if (this.s.status === 'connecting') this.go('waiting-for-card')
    if (this.s.status === 'waiting-for-card') this.go('processing')
  }

  // ---------- guest actions ----------

  /**
   * Start a payment attempt for the frozen snapshot. The caller has already verified:
   * online, availability fresh, no price change, cart unchanged during the check.
   */
  async start(snapshotInput: Omit<OrderSnapshot, 'orderId' | 'startedAt' | 'paidAt'>): Promise<boolean> {
    if (!this.canRetryPayment()) return false
    const orderId = this.s.orderId ?? this.deps.newOrderId()
    const attempt = this.s.attempt + 1
    const attemptId = newAttemptId(orderId, attempt)
    const snapshot: OrderSnapshot = {
      ...(JSON.parse(JSON.stringify(snapshotInput)) as Omit<OrderSnapshot, 'orderId' | 'startedAt' | 'paidAt'>),
      orderId,
      startedAt: new Date().toISOString(),
      paidAt: null,
    }
    const submitKey = idempotencyKeyFor(orderId)
    const session = this.s.orderSession

    this.set({
      orderId,
      attempt,
      attemptId,
      snapshot,
      submitKey,
      txRef: null,
      txRefGenerated: false,
      recoveryRef: null,
      uncertainReason: null,
      assistanceNeeded: false,
      storeFailed: false,
      lastError: null,
      orderNo: null,
      accepted: false,
      duplicate: false,
      receipt: 'none',
    })

    // Persist BEFORE the terminal is touched. If that fails, no payment starts.
    if (!this.persist('starting')) {
      this.set({ storeFailed: true, snapshot: null, attemptId: null, attempt: attempt - 1 })
      this.log('pay.storeFail')
      return false
    }
    if (!this.go('connecting')) return false
    this.armProgress(session, attemptId)
    this.armGuard(session, attemptId)

    const req = { attemptId, orderId, amountMinor: snapshot.totals.totalCents, currency: this.deps.currency }
    let result: PaymentStartResult | undefined
    try {
      result = await this.deps.adapters.payment.start(req, (p) => this.onProgress(session, attemptId, p))
    } catch (e) {
      if (!this.isCurrent(session, attemptId)) return true
      this.log('pay.startRejected', { error: String(e) })
      this.uncertain('start-rejected')
      return true
    }
    this.onStartResult(session, attemptId, result)
    return true
  }

  private onProgress(session: string, att: string, p: 'waiting-for-card' | 'processing'): void {
    if (!this.isCurrent(session, att)) return
    if (p === 'waiting-for-card' && this.s.status === 'connecting') this.go('waiting-for-card')
    if (p === 'processing') {
      if (this.s.status === 'connecting') this.go('waiting-for-card')
      if (this.s.status === 'waiting-for-card') this.go('processing')
    }
  }

  private onStartResult(session: string, att: string, r: PaymentStartResult | undefined): void {
    if (!this.isCurrent(session, att)) return
    if (this.finalized.has(att)) return
    const res = r && typeof r === 'object' ? r.result : undefined

    // An approval is processed even after cancel-requested or timeout (money moved).
    if (res === 'approved') {
      this.approveOnce(att, r?.txRef)
      return
    }
    const st = this.s.status
    // Stale: the attempt already reached a terminal or uncertain state.
    if (st === 'timeout' || NOTHING_CHARGED.has(st) || st === 'idle') return

    if (res === 'cancelled') {
      this.cancelFinal(att)
      return
    }
    if (st === 'cancel-requested') {
      // Only approved/cancelled/timeout matter here; anything else is unknown.
      if (res !== 'declined' && res !== 'terminal-offline') this.uncertain('unknown-result')
      return
    }
    if (res === 'declined') {
      this.ensureProcessing()
      if (this.go('declined')) this.clearTimersAndAttempt()
      return
    }
    if (res === 'terminal-offline') {
      if (this.go('terminal-offline')) this.clearTimersAndAttempt()
      return
    }
    if (res === 'timeout') {
      this.uncertain('terminal-timeout')
      return
    }
    this.uncertain('unknown-result')
  }

  private clearTimersAndAttempt(): void {
    this.clearAllTimers()
    this.clearAttemptData()
  }

  /** Outcome unknown: keep everything, never clear the record. */
  private uncertain(reason: string): void {
    const att = this.s.attemptId
    if (att && this.finalized.has(att)) return
    if (this.s.status === 'connecting') this.go('waiting-for-card')
    const st = this.s.status
    if (st !== 'waiting-for-card' && st !== 'processing' && st !== 'cancel-requested' && st !== 'lookup') return
    this.clearTimer('guard')
    this.clearTimer('progress')
    if (!this.go('timeout')) return
    this.set({ uncertainReason: reason })
    this.persist('timeout')
    this.armUncertain()
  }

  /** Guest pressed "Cancel". */
  async cancel(): Promise<void> {
    const st = this.s.status
    if (st === 'idle' || NOTHING_CHARGED.has(st)) {
      this.backToCart()
      return
    }
    if (st !== 'connecting' && st !== 'waiting-for-card') return
    const session = this.s.orderSession
    const att = this.s.attemptId!
    if (!this.go('cancel-requested')) return
    this.persist('cancel-requested')
    let r
    try {
      r = await withTimeout(this.deps.adapters.payment.cancel({ attemptId: att }), this.deps.timeouts.paymentCancel, 'paymentCancel')
    } catch {
      if (!this.isCurrent(session, att)) return
      this.uncertain('cancel-timeout')
      return
    }
    if (!this.isCurrent(session, att) || this.finalized.has(att)) return
    if (this.s.status !== 'cancel-requested') return
    if (r?.result === 'cancelled' || r?.result === 'not-charged') this.cancelFinal(att)
    else if (r?.result === 'approved') this.approveOnce(att, r.txRef)
    else this.uncertain('cancel-unknown')
  }

  /** Definitive cancellation confirmed by the provider: nothing was charged. */
  private cancelFinal(att: string): void {
    if (this.finalized.has(att) || att !== this.s.attemptId) return
    const st = this.s.status
    if (st !== 'connecting' && st !== 'waiting-for-card' && st !== 'processing' && st !== 'cancel-requested') return
    if (this.go('cancelled')) this.clearTimersAndAttempt()
  }

  /** From a definitive "nothing charged" state back to the cart. */
  backToCart(): void {
    if (NOTHING_CHARGED.has(this.s.status)) {
      if (this.go('idle')) this.clearTimersAndAttempt()
    }
  }

  /** Approval is applied exactly once per attempt, also after cancel-requested or timeout. */
  private approveOnce(att: string, txRef?: string): void {
    if (this.finalized.has(att) || att !== this.s.attemptId) return
    this.finalized.add(att)
    this.clearAllTimers()
    if (this.s.status === 'timeout' && !this.go('lookup')) return
    if (this.s.status === 'connecting' || this.s.status === 'waiting-for-card') this.ensureProcessing()
    const clean = typeof txRef === 'string' ? txRef.trim() : ''
    const ref = clean || fallbackTxRef()
    this.set({
      txRef: ref,
      txRefGenerated: !clean,
      snapshot: this.s.snapshot ? { ...this.s.snapshot, paidAt: new Date().toISOString() } : this.s.snapshot,
      assistanceNeeded: false,
      uncertainReason: null,
    })
    if (!this.go('approved')) return
    this.persist('approved')
    void this.submitOrder()
  }

  /** Submit (or re-submit) the paid order with the SAME idempotency key. */
  async submitOrder(): Promise<void> {
    const st = this.s.status
    if (st !== 'approved' && st !== 'recovery-required' && st !== 'assistance') return
    const { orderSession: session, attemptId: att, submitKey, orderId, txRef, snapshot } = this.s
    if (!att || !submitKey || !orderId || !snapshot) return
    if (!this.go('submitting')) return
    this.persist('submitting')
    let r
    try {
      r = await withTimeout(
        this.deps.adapters.pos.submit({ idempotencyKey: submitKey, orderId, attemptId: att, txRef: txRef ?? '', snapshot }),
        this.deps.timeouts.posSubmit,
        'posSubmit',
      )
    } catch (e) {
      if (!this.isCurrent(session, att)) return
      this.submitFailed(String(e))
      return
    }
    if (!this.isCurrent(session, att) || this.s.status !== 'submitting') return
    const orderNo = r && typeof r.orderNo === 'string' && r.orderNo.trim() ? r.orderNo.trim() : null
    if (!orderNo) {
      this.submitFailed('no-orderno')
      return
    }
    await this.done(orderNo, !!r.duplicate)
  }

  private submitFailed(reason: string): void {
    if (!this.go('order-submit-failed')) return
    const recoveryRef = this.s.recoveryRef ?? newRecoveryRef()
    this.set({ recoveryRef, lastError: reason })
    this.persist('order-submit-failed')
    this.go('recovery-required')
    this.armUncertain()
  }

  private async done(orderNo: string, duplicate: boolean): Promise<void> {
    const session = this.s.orderSession
    this.clearAllTimers()
    this.set({ accepted: true, orderNo, duplicate, assistanceNeeded: false })
    if (!this.go('done')) return
    this.persist('accepted')
    const snapshot = this.s.snapshot!
    this.deps.onAccepted({ orderNo, snapshot, orderId: this.s.orderId! })
    this.set({ receipt: 'printing' })
    try {
      const p = await withTimeout(this.deps.adapters.printer.print({ orderNo, snapshot }), this.deps.timeouts.print, 'print')
      if (session !== this.s.orderSession) return
      this.set({ receipt: p?.printed ? 'printed' : 'failed' })
    } catch {
      if (session !== this.s.orderSession) return
      this.set({ receipt: 'failed' })
    }
    this.deps.store.clear()
  }

  /** Guest: "Resend order" from recovery-required. Same key. */
  async submitRetry(): Promise<void> {
    if (this.s.status === 'recovery-required' || this.s.status === 'assistance') await this.submitOrder()
  }

  /** Guest: "Try again" after declined / cancelled / terminal-offline. New attemptId, same orderId. */
  canRetry(): boolean {
    return this.canRetryPayment() && this.s.status !== 'idle'
  }

  /** Guest: "Check payment status" from timeout. */
  async lookup(): Promise<void> {
    if (this.s.status !== 'timeout') return
    const session = this.s.orderSession
    const att = this.s.attemptId!
    const orderId = this.s.orderId!
    if (!this.go('lookup')) return
    let r
    try {
      r = await withTimeout(this.deps.adapters.payment.status({ attemptId: att, orderId }), this.deps.timeouts.paymentStatus, 'paymentStatus')
    } catch {
      if (!this.isCurrent(session, att)) return
      this.lookupUnknown()
      return
    }
    if (!this.isCurrent(session, att) || this.finalized.has(att) || this.cur() !== 'lookup') return
    if (r?.result === 'approved') {
      this.approveOnce(att, r.txRef)
      return
    }
    if (r?.result === 'not-charged') {
      if (this.go('idle')) this.clearTimersAndAttempt()
      return
    }
    this.lookupUnknown()
  }

  private lookupUnknown(): void {
    if (this.go('timeout')) {
      this.persist('timeout')
      this.set({ assistanceNeeded: true })
    }
  }

  // ---------- restart recovery ----------

  /** Boot sequence, before anything else. Local storage is never proof of payment. */
  async restore(): Promise<void> {
    const read = this.deps.store.read()
    if (read.kind === 'none') return
    if (read.kind === 'invalid') {
      this.set({ rawRecovery: read.raw, assistanceNeeded: true })
      this.restoreTo('assistance')
      return
    }
    const rec = read.record
    const attempt = attemptIndexOf(rec.paymentAttemptId) ?? 1
    this.set({
      orderSession: rec.orderSessionId || this.s.orderSession,
      orderId: rec.orderId,
      attempt,
      attemptId: rec.paymentAttemptId,
      txRef: rec.transactionReference,
      submitKey: rec.idempotencyKey,
      recoveryRef: rec.recoveryReference,
      snapshot: rec.snapshot,
      orderNo: rec.orderNo,
      accepted: rec.accepted,
    })
    switch (rec.submissionState) {
      case 'accepted':
        this.finalized.add(rec.paymentAttemptId)
        this.set({ receipt: 'unknown' })
        this.restoreTo('done')
        return
      case 'approved':
      case 'submitting':
      case 'order-submit-failed':
        this.finalized.add(rec.paymentAttemptId)
        this.set({ recoveryRef: rec.recoveryReference ?? newRecoveryRef() })
        this.restoreTo('recovery-required')
        this.persist('order-submit-failed')
        this.armUncertain()
        await this.submitOrder()
        return
      case 'starting':
      case 'timeout':
      case 'cancel-requested':
        this.restoreTo('status-check')
        await this.statusCheck()
        return
    }
  }

  private async statusCheck(): Promise<void> {
    const session = this.s.orderSession
    const att = this.s.attemptId!
    const orderId = this.s.orderId!
    let r
    try {
      r = await withTimeout(this.deps.adapters.payment.status({ attemptId: att, orderId }), this.deps.timeouts.paymentStatus, 'paymentStatus')
    } catch {
      r = undefined
    }
    if (!this.isCurrent(session, att) || this.s.status !== 'status-check') return
    if (r?.result === 'approved') {
      this.approveOnce(att, r.txRef)
      return
    }
    if (r?.result === 'not-charged') {
      // Clean start: nothing was charged, the previous order identity is dropped.
      if (this.go('idle')) {
        this.clearTimersAndAttempt()
        this.set({ orderId: null, attempt: 0, attemptId: null, submitKey: null, restored: false })
      }
      return
    }
    if (this.go('assistance')) this.set({ assistanceNeeded: true })
  }

  // ---------- reset ----------

  /** "New order". Refused while the outcome is uncertain. */
  reset(): boolean {
    const st = this.s.status
    const allowed = st === 'done' || st === 'idle' || NOTHING_CHARGED.has(st)
    if (!allowed) return false
    if (st !== 'done' && this.s.snapshot) return false
    this.clearAllTimers()
    this.finalized.clear()
    this.deps.store.clear()
    this.s = initialState(newSessionId())
    for (const l of this.listeners) l(this.s)
    this.log('pay.reset')
    return true
  }

  /**
   * Staff override: clear an assistance/uncertain record after the situation was handled at the POS.
   * Logged; only reachable from the authenticated staff panel.
   */
  staffClear(reason: string, staffRef: string): boolean {
    const st = this.s.status
    if (!(st === 'assistance' || st === 'timeout' || st === 'recovery-required' || st === 'status-check')) return false
    this.log('pay.staffClear', { reason, staffRef })
    this.clearAllTimers()
    this.finalized.clear()
    this.deps.store.clear()
    this.s = initialState(newSessionId())
    for (const l of this.listeners) l(this.s)
    return true
  }

  /** Staff: run a status check from the assistance screen (never forces anything). */
  async staffCheckStatus(): Promise<void> {
    if (this.s.status === 'assistance') {
      if (!this.go('lookup')) return
      const session = this.s.orderSession
      const att = this.s.attemptId!
      const orderId = this.s.orderId!
      let r
      try {
        r = await withTimeout(this.deps.adapters.payment.status({ attemptId: att, orderId }), this.deps.timeouts.paymentStatus, 'paymentStatus')
      } catch {
        r = undefined
      }
      if (!this.isCurrent(session, att) || this.cur() !== 'lookup') return
      if (r?.result === 'approved') this.approveOnce(att, r.txRef)
      else if (r?.result === 'not-charged') {
        if (this.go('idle')) this.clearTimersAndAttempt()
      } else this.lookupUnknown()
      return
    }
    if (this.s.status === 'timeout') await this.lookup()
  }

  /** For tests. */
  dispose(): void {
    this.clearAllTimers()
    this.listeners.clear()
  }
}
