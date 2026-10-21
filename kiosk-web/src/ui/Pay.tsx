// Payment + success — port of SCR.pay, driven by our PaymentController state.

import { useEffect, useState } from 'react'
import { retryPay } from '../app/checkout'
import { getRuntime } from '../app/runtime'
import { clearSession } from '../app/session'
import { canSubmitWrites } from '../domain/connectivity'
import { cartTotal } from '../engine/cart'
import { fmt } from '../engine/money'
import { E, t, tf } from '../engine/state'
import { useEngine } from '../store/engine'
import { usePayState } from '../store/payment'
import { Ic } from './primitives'
import { TAG_ILL } from './tagIll'
import { parkPayment, parkedFrom } from '../payment/parked'

function Btn({ a, label, primary = true, onClick, disabled }: { a: string; label: string; primary?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" data-a={a} onClick={onClick} disabled={disabled} aria-disabled={disabled || undefined} className={`press h-[88px] px-10 rounded-full ${primary ? 'bg-jade text-white hd text-[24px] tracking-[.1em]' : 'bg-card shadow-soft text-[23px] font-bold'}${disabled ? ' opacity-40' : ''}`}>
      {label}
    </button>
  )
}

/**
 * Staff entry (PIN-protected panel) on every payment and recovery screen, so a stuck transaction can be
 * investigated on the device without reloading or clearing storage. Audit F04 (2026-10-16).
 */
function StaffEntry() {
  const setStaffOpen = useEngine((s) => s.setStaffOpen)
  return (
    <button type="button" data-a="staffOpen" aria-label={t('staffEntry')} className="press absolute left-8 bottom-8 h-[56px] px-5 rounded-full bg-card shadow-soft text-[17px] font-bold text-mute flex items-center gap-2" onClick={() => setStaffOpen(true)}>
      <span className="w-5 h-5">
        <Ic n="info" sw={2.2} />
      </span>
      {t('staffEntry')}
    </button>
  )
}

function Panel({ icon, title, body, actions, tone = '', meta }: { icon: React.ReactNode; title: string; body?: React.ReactNode; actions?: React.ReactNode; tone?: string; meta?: string }) {
  return (
    <div className="flex-1 grid place-items-center enter">
      <div className="text-center px-16 max-w-[900px]">
        <div className={`w-[150px] h-[150px] rounded-full grid place-items-center mx-auto ${tone || 'bg-shade'}`}>
          <span className="w-[72px] h-[72px]">{icon}</span>
        </div>
        <div className="hd text-[54px] leading-[1.05] tracking-[.02em] mt-9">{title}</div>
        {body ? <p className="text-[26px] font-medium text-ink/80 mt-6 leading-relaxed">{body}</p> : null}
        {meta ? <div className="text-[20px] text-mute font-semibold mt-4">{meta}</div> : null}
        <div className="flex flex-wrap justify-center gap-4 mt-12">{actions}</div>
      </div>
    </div>
  )
}

function Done() {
  const pay = usePayState()
  const service = useEngine((s) => s.service)
  const newOrderReset = useEngine((s) => s.newOrderReset)
  const secs = E().brand.paymentSettings.doneCountdownS || 15
  const [left, setLeft] = useState(secs)
  const newOrder = () => {
    if (getRuntime().controller.reset()) {
      clearSession()
      newOrderReset()
    }
  }
  useEffect(() => {
    if (left <= 0) {
      if (pay.receipt !== 'printing') newOrder()
      return
    }
    const id = setTimeout(() => setLeft((x) => x - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, pay.receipt])
  const tg = pay.snapshot?.tag
  const lbl = tg ? { table: 'tag_tableL', pager: 'tag_pagerL', name: 'tag_nameL' }[tg.type] : null
  const doneText = tg ? tf({ table: 'tag_doneTable', pager: 'tag_donePager', name: 'tag_doneName' }[tg.type], { v: tg.value }) : service === 'eatin' ? t('pickupCounter') : t('callNo')
  const problems: { text: string; cls: string }[] = []
  if (!pay.accepted) problems.push({ text: t('orderPending'), cls: 'text-mute' })
  if (pay.receipt === 'failed') problems.push({ text: '⚠ ' + t('receiptFailed'), cls: 'text-ember' })
  return (
    <div className="flex-1 relative grid place-items-center enter overflow-hidden">
      <div className="text-center px-16 relative">
        <div className="w-[190px] h-[190px] rounded-full bg-jade text-white grid place-items-center mx-auto pop">
          <svg viewBox="0 0 24 24" className="w-[96px] h-[96px]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path className="checkdraw" d="m5 13 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <div className="hd text-[58px] tracking-[.02em] mt-9">{t('thanks')}</div>
        {tg && lbl ? (
          <div className={`tagdone tagdone-${tg.type}`}>
            <span className="tagdone-i" aria-hidden="true">
              {TAG_ILL[tg.type]}
            </span>
            <span className="tagdone-x">
              <span className="l">{t(lbl)}</span>
              <span className="v">{tg.value}</span>
            </span>
          </div>
        ) : null}
        <div className="text-[24px] text-mute font-semibold mt-8">{t('orderNo')}</div>
        <div className="hd text-[170px] leading-none tracking-[.04em] num mt-2">{pay.orderNo}</div>
        <p className="text-[26px] font-medium text-ink/80 max-w-[680px] mx-auto mt-9 leading-relaxed">{doneText}</p>
        {/* Status lines and the technical reference only when something needs the guest's or staff's
            attention (2026-10-19, Alex): a clean success shows the order number and nothing else. */}
        {problems.length ? (
          <>
            <div className="flex justify-center gap-6 flex-wrap mt-6 text-[20px] font-semibold" role="status">
              {problems.map((p) => (
                <span key={p.text} className={p.cls}>
                  {p.text}
                </span>
              ))}
            </div>
            <div className="text-[19px] text-mute font-semibold mt-4">
              {t('refT')}: {pay.orderId || '—'}
              {pay.txRef ? ' · ' + pay.txRef : ''}
            </div>
          </>
        ) : null}
        <button type="button" data-a="newOrder" className="press h-[104px] px-14 mt-12 rounded-full bg-jade text-white hd text-[26px] tracking-[.12em]" onClick={newOrder}>
          {t('newOrder')}
        </button>
        <div className="text-[20px] text-mute font-semibold mt-6">
          {t('autoRestart')}{' '}
          <span id="cd" className="num font-extrabold">
            {left}
          </span>{' '}
          s
        </div>
      </div>
    </div>
  )
}

export function Pay() {
  return (
    <div className="flex-1 flex flex-col relative min-h-0">
      <PayPanel />
      <StaffEntry />
    </div>
  )
}

function PayPanel() {
  const pay = usePayState()
  const cart = useEngine((s) => s.cart)
  const conn = useEngine((s) => s.conn)
  const checking = useEngine((s) => s.checking)
  const setScreen = useEngine((s) => s.setScreen)
  const ctrl = () => getRuntime().controller
  const st = pay.status
  // "Check payment status" feedback (2026-10-19): the API has no status endpoint (B7), so the lookup usually
  // ends unknown and the screen used to stay exactly as it was. Now the button says it is checking and the
  // result is written under it.
  const [check, setCheck] = useState<'idle' | 'running' | 'unknown'>('idle')
  // "Start from the top" (2026-10-21, Alex): the guest may leave the protected screen. The record is parked for
  // staff (never dropped), the departure is logged, the kiosk returns to the start screen for the next guest.
  const newOrderReset = useEngine((s) => s.newOrderReset)
  const startOver = () => {
    const c = getRuntime().controller
    const parked = parkedFrom(c.state)
    parkPayment(parked)
    getRuntime().log('pay.parkedByGuest', { orderId: parked.orderId, attemptId: parked.attemptId, status: parked.status, txRef: parked.txRef })
    if (c.staffClear('guest: start from the top (record parked for staff)', 'guest')) newOrderReset()
  }
  const runCheck = async () => {
    setCheck('running')
    await ctrl().lookup()
    const after = getRuntime().controller.state.status
    setCheck(after === 'timeout' || after === 'assistance' ? 'unknown' : 'idle')
  }
  if (st === 'done') return <Done />
  const amount = pay.snapshot ? pay.snapshot.totals.totalCents : cartTotal(cart)
  const meta = pay.txRef && st !== 'idle' ? `${t('payAttempt')} ${pay.attempt} · ${pay.txRef}` : undefined
  // A new charge attempt needs the writable authority and runs the full preflight (retryPay → toPay).
  const retryOk = canSubmitWrites(conn) && !checking
  const back = () => {
    ctrl().backToCart()
    setScreen('cart')
  }
  if (st === 'status-check') return <Panel icon={<Ic n="info" sw={2} />} title={t('statusCheckT')} body={t('statusCheckB')} tone="bg-gold/30" meta={meta} />
  if (st === 'cancel-requested') return <Panel icon={<Ic n="info" sw={2} />} title={t('cancelReqT')} body={t('cancelReqB')} tone="bg-gold/30" meta={meta} />
  if (st === 'assistance' || (pay.assistanceNeeded && (st === 'timeout' || st === 'recovery-required')))
    return (
      <Panel
        icon={<Ic n="info" sw={2} />}
        title={t('assistT')}
        body={
          <>
            {t('assistB')}
            {st === 'assistance' ? (
              <>
                <br />
                {t('assistData')}
              </>
            ) : null}
            {check === 'unknown' ? (
              <>
                <br />
                <span className="font-bold text-ink" role="status">
                  {t('payCheckUnknown')}
                </span>
              </>
            ) : null}
          </>
        }
        actions={
          <>
            {st === 'recovery-required' ? (
              <Btn a="paySubmitRetry" label={t('payRetrySubmit')} onClick={() => void ctrl().submitRetry()} />
            ) : st === 'timeout' ? (
              <Btn a="payLookup" label={check === 'running' ? t('payChecking') : t('payCheck')} disabled={check === 'running'} onClick={() => void runCheck()} />
            ) : null}
            <Btn a="startOver" label={t('startOver')} primary={false} onClick={startOver} />
          </>
        }
        tone="bg-gold/30"
      />
    )
  if (st === 'declined')
    return (
      <Panel
        icon={<Ic n="x" sw={2.4} />}
        title={t('payDeclinedT')}
        body={t('payDeclinedB')}
        actions={
          <>
            <Btn a="payRetry" label={t('payRetry')} onClick={() => void retryPay()} disabled={!retryOk} />
            <Btn a="cancelPay" label={t('payBack')} primary={false} onClick={back} />
          </>
        }
        tone="bg-ember/15 text-ember"
        meta={meta}
      />
    )
  if (st === 'terminal-offline')
    return (
      <Panel
        icon={<Ic n="card" sw={1.8} />}
        title={t('payOfflineT')}
        body={t('payOfflineB')}
        actions={
          <>
            <Btn a="payRetry" label={t('payReconnect')} onClick={() => void retryPay()} disabled={!retryOk} />
            <Btn a="cancelPay" label={t('payBack')} primary={false} onClick={back} />
          </>
        }
        tone="bg-ember/15 text-ember"
        meta={meta}
      />
    )
  if (st === 'timeout')
    return (
      <Panel
        icon={<Ic n="info" sw={2} />}
        title={t('payTimeoutT')}
        body={
          <>
            {t('payTimeoutB')}
            {check === 'unknown' ? (
              <>
                <br />
                <span className="font-bold text-ink" role="status">
                  {t('payCheckUnknown')}
                </span>
              </>
            ) : null}
          </>
        }
        actions={
          <>
            <Btn a="payLookup" label={check === 'running' ? t('payChecking') : t('payCheck')} disabled={check === 'running'} onClick={() => void runCheck()} />
            <Btn a="startOver" label={t('startOver')} primary={false} onClick={startOver} />
          </>
        }
        tone="bg-gold/30"
      />
    )
  if (st === 'lookup') return <Panel icon={<Ic n="info" sw={2} />} title={t('payChecking')} tone="bg-gold/30" meta={meta} />
  if (st === 'cancelled')
    return (
      <Panel
        icon={<Ic n="x" sw={2.4} />}
        title={t('payCancelledT')}
        body={t('payDeclinedB')}
        actions={
          <>
            <Btn a="payRetry" label={t('payRetry')} onClick={() => void retryPay()} disabled={!retryOk} />
            <Btn a="cancelPay" label={t('payBack')} primary={false} onClick={back} />
          </>
        }
        meta={meta}
      />
    )
  if (st === 'recovery-required' || st === 'order-submit-failed' || (st === 'submitting' && pay.recoveryRef))
    return (
      <Panel
        icon={<Ic n="check" sw={2.6} />}
        title={t('payRecoverT')}
        body={
          <>
            {t('payRecoverB')}
            <br />
            <span className="num font-extrabold">
              {t('payRef')}: {pay.recoveryRef || '—'}
            </span>
          </>
        }
        actions={st === 'submitting' ? null : <Btn a="paySubmitRetry" label={t('payRetrySubmit')} onClick={() => void ctrl().submitRetry()} />}
        tone="bg-jade text-white"
        meta={meta}
      />
    )
  if (st === 'approved' || st === 'submitting') return <Panel icon={<Ic n="check" sw={2.6} />} title={t('payApproved')} tone="bg-jade text-white" meta={meta} />

  const status = st === 'connecting' ? t('payConnecting') : st === 'processing' ? t('payProcessing') : t('followReader')
  const canCancel = st === 'connecting' || st === 'waiting-for-card'
  return (
    <div className="flex-1 grid place-items-center enter">
      <div className="text-center px-16">
        <div className="hd text-[64px] tracking-[.02em]">{t('payTitle')}</div>
        <div className="num text-[100px] font-extrabold mt-3">{fmt(amount)}</div>
        <div className={`ringwrap mx-auto mt-14 ${st === 'connecting' || st === 'idle' ? 'opacity-50' : ''}`}>
          <div className="ring" />
          <div className="ring" />
          <div className="ring" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-[120px] h-[120px] rounded-[24px] bg-ink text-cream grid place-items-center cardtap">
              <span className="w-14 h-14">
                <Ic n="card" sw={1.8} />
              </span>
            </div>
          </div>
        </div>
        <p className="text-[27px] font-medium text-ink/80 max-w-[640px] mx-auto mt-14 leading-relaxed" id="payStatus" aria-live="polite">
          {st === 'idle' ? t('availCheckT') : status}
        </p>
        {canCancel ? (
          <button type="button" data-a="cancelPay" className="press h-[88px] px-12 mt-12 rounded-full bg-card shadow-soft text-[24px] font-bold" onClick={() => void ctrl().cancel()}>
            {t('cancel')}
          </button>
        ) : null}
      </div>
    </div>
  )
}
