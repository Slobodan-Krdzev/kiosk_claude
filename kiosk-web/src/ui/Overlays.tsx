import { useShallow } from 'zustand/shallow'
// Overlays — port of overlays(): sheets (voucher/loyalty, allergens, allergen filter, price) and confirm dialogs, plus toast and connection banner.

import { useEffect, useRef, useState } from 'react'
import { useModal } from './useModal'
import { availBack, availRetry, priceBack, priceConfirm } from '../app/checkout'
import { printSkipNo, printSkipYes } from '../app/orderPrompts'
import { getRuntime } from '../app/runtime'
import { clearSession } from '../app/session'
import { cartCount, line, lineUnit, xsLinesOf } from '../engine/cart'
import { alUnknown, byId, composedAllergens, mustId, pname } from '../engine/catalog'
import { cmsPidOf } from '../engine/cms'
import { fmt } from '../engine/money'
import { E, L, t, tf } from '../engine/state'
import { canSubmitWrites } from '../domain/connectivity'
import { useEngine } from '../store/engine'
import { withTimeout } from '../adapters/withTimeout'
import { NOTHING_CHARGED } from '../payment/states'
import { usePayState } from '../store/payment'
import { PriceRows } from './Pdp'
import { Ic, IcQR } from './primitives'
import { toggleFullscreen, useFullscreenState } from '../app/fullscreen'

function Scrim({ onClose, children, z = 'z-40' }: { onClose?: () => void; children: React.ReactNode; z?: string }) {
  return (
    <div className={`absolute inset-0 ${z}`} style={{ background: 'rgb(var(--c-ink)/.45)' }} onClick={onClose}>
      {children}
    </div>
  )
}

function Sheet({ onClose, label, children }: { onClose: () => void; label?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, onClose)
  return (
    <Scrim onClose={onClose}>
      <div ref={ref} className="absolute left-0 right-0 bottom-0 bg-paper rounded-t-[36px] p-12 sheetup" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <div className="w-[72px] h-[6px] rounded-full bg-ink/15 mx-auto mb-9" />
        {children}
      </div>
    </Scrim>
  )
}

function Dialog({ children, width = 760, pop = true, bg = '.5', label }: { children: React.ReactNode; width?: number; pop?: boolean; bg?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref)
  return (
    <div className="absolute inset-0 z-50 grid place-items-center" style={{ background: `rgb(var(--c-ink)/${bg})` }}>
      <div ref={ref} className={`bg-paper rounded-[32px] p-12 text-center ${pop ? 'pop' : ''}`} style={{ width }} role="alertdialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>
  )
}

function VoucherSheet() {
  const close = useEngine((s) => s.closeSheet)
  const setMember = useEngine((s) => s.setMember)
  const [code, setCode] = useState('')
  const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)
  // The reply is applied only if this sheet is still open for the SAME guest session (audit F07):
  // a reset or close while the request is pending discards the result instead of attaching the previous guest.
  const submit = async () => {
    if (busy || !code) return
    const rt = getRuntime()
    const gen = useEngine.getState().sessionGen
    setBusy(true)
    setErr(false)
    let m: Awaited<ReturnType<typeof rt.resolved.adapters.loyalty.identify>> | undefined
    try {
      m = await withTimeout(rt.resolved.adapters.loyalty.identify(code), rt.config.timeouts.loyalty ?? 8000, 'loyaltyIdentify')
    } catch (e) {
      rt.log('loyalty.identifyFailed', { error: String(e) })
      m = undefined
    }
    const now = useEngine.getState()
    if (now.sessionGen !== gen || (now.sheet !== 'voucher' && now.sheet !== 'loyalty')) {
      rt.log('loyalty.staleReplyDiscarded', { gen, nowGen: now.sessionGen })
      return
    }
    setBusy(false)
    if (m) {
      setMember(m)
      close()
    } else setErr(true)
  }
  return (
    <Sheet onClose={close}>
      <div className="w-[120px] h-[120px] mx-auto text-ink">
        <IcQR />
      </div>
      <div className="hd text-[46px] tracking-[.02em] text-center mt-7">{t('voucherT')}</div>
      <p className="text-[24px] text-mute font-medium text-center max-w-[640px] mx-auto mt-4 leading-relaxed">{t('voucherBody')}</p>
      <div className="text-center text-[18px] font-bold text-ember mt-3">{t('voucherDemo')}</div>
      <div className="flex justify-center gap-3 mt-6">
        <input className="h-[72px] w-[320px] px-6 rounded-[16px] bg-card text-[28px] num text-center" inputMode="numeric" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
        <button type="button" className={`press h-[72px] px-8 rounded-full bg-jade text-white hd text-[22px] tracking-[.1em]${busy ? ' opacity-60' : ''}`} disabled={busy} aria-busy={busy || undefined} onClick={() => void submit()}>
          {busy ? t('cm_wait') : t('cm_apply')}
        </button>
      </div>
      {err ? <div className="text-center text-[19px] font-bold text-ember mt-3">{t('cm_err')}</div> : null}
      <button type="button" data-a="closeSheet" className="press w-full h-[96px] mt-6 rounded-full bg-ink text-cream grid place-items-center text-center hd text-[24px] tracking-[.1em]" onClick={close}>
        {t('close')}
      </button>
    </Sheet>
  )
}

/** Allergen icon: the kiosk's own image when there is one (API menus), else the emoji. */
function AlgIcon({ id, size }: { id: string; size: number }) {
  const src = E().algImg?.[id]
  const [broken, setBroken] = useState(false)
  if (src && !broken) return <img src={src} alt="" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain' }} onError={() => setBroken(true)} />
  return <span style={{ fontSize: Math.round(size * 0.8), lineHeight: 1 }}>{E().algIcon[id] || '•'}</span>
}

function AllergenSheet({ pid }: { pid: string }) {
  const close = useEngine((s) => s.closeSheet)
  const draft = useEngine((s) => s.draft)
  const p = mustId(pid)
  const A = draft && draft.pid === p.id ? composedAllergens(draft, cmsPidOf) : { ...p.allergens, unknownNames: [] as string[] }
  const chips = (ids: string[], tone: string) =>
    ids.length ? (
      ids.map((a) => (
        <span key={a} className={`h-[64px] px-6 rounded-full ${tone} flex items-center gap-3 text-[21px] font-bold`}>
          <AlgIcon id={a} size={36} />
          {E().alg[a] ? L(E().alg[a]) : String(a)}
        </span>
      ))
    ) : (
      <span className="text-[20px] text-mute font-semibold">—</span>
    )
  const sec = (title: string, ids: string[], tone: string, note?: string) => (
    <div className="mt-7">
      <div className="hd text-[24px] tracking-[.08em] mb-3">{title}</div>
      <div className="flex flex-wrap gap-3">{chips(ids, tone)}</div>
      {note ? <div className="text-[18px] text-mute font-medium mt-2">{note}</div> : null}
    </div>
  )
  return (
    <Sheet onClose={close} label={t('allergens')}>
      <div className="hd text-[46px] tracking-[.02em]">{t('allergens')}</div>
      <div className="text-[23px] text-mute font-semibold mt-1.5">
        {pname(p)}
        {p.kcal ? ` · ${p.kcal} ${t('kcal')} ${t('perServing')}` : ''}
      </div>
      <div className="text-[18px] text-mute font-semibold mt-2">{t('alForOrder')}</div>
      {A.contains.length || A.traces.length || A.info?.length ? (
        <>
          {sec(t('alContains'), A.contains, 'bg-ember/15 text-ember')}
          {/* API menus carry no traces: the section only shows when there are some (the brand pack always has it). */}
          {A.traces.length || !E().algImg ? sec(t('alTraces'), A.traces, 'bg-gold/25 text-ink') : null}
          {A.info?.length ? sec(t('alDiet'), A.info, 'bg-card shadow-soft') : null}
          {A.removable.length ? sec(t('alRemovable'), A.removable, 'bg-card shadow-soft', t('alRemovableNote')) : null}
        </>
      ) : (
        <div className="mt-7 text-[22px] font-semibold text-mute">{alUnknown(p) ? t('alUnknown') : t('alNone')}</div>
      )}
      {A.unknownNames.length ? (
        <div className="mt-4 text-[18px] text-ember font-semibold">
          ⚠️ {t('alUnknown')}: {A.unknownNames.join(', ')}
        </div>
      ) : null}
      <div className="mt-8 rounded-[20px] bg-card shadow-soft p-6 text-[20px] font-medium leading-relaxed text-ink/85">⚠️ {L(E().allergenPolicy.disclaimer)}</div>
      <button type="button" data-a="closeSheet" className="press w-full h-[96px] mt-10 rounded-full bg-ink text-cream grid place-items-center text-center hd text-[24px] tracking-[.1em]" onClick={close}>
        {t('close')}
      </button>
    </Sheet>
  )
}

function AlFilterSheet() {
  const close = useEngine((s) => s.closeSheet)
  const F = useEngine((s) => s.allergenFilter)
  const a = useEngine(useShallow((s) => ({ alToggle: s.alToggle, alClear: s.alClear })))
  return (
    <Sheet onClose={close} label={t('alFilterT')}>
      <div className="hd text-[46px] tracking-[.02em]">{t('alFilterT')}</div>
      <div className="text-[22px] text-mute font-semibold mt-1.5">{t('alFilterS')}</div>
      <div className="al-grid mt-7">
        {(E().algFilter || Object.keys(E().alg)).map((id) => {
          const on = F.includes(id)
          return (
            <button key={id} type="button" data-a="alToggle" aria-pressed={on} className={`press optBtn al-chip rounded-[16px] bg-card flex items-center gap-3 text-[21px] font-bold text-left${on ? ' on' : ''}`} onClick={() => a.alToggle(id)}>
              <span className="text-[26px] flex-none grid place-items-center" aria-hidden="true">
                <AlgIcon id={id} size={34} />
              </span>
              <span className="al-lbl">{L(E().alg[id])}</span>
              <span className="al-ck flex-none w-8 h-8 rounded-full grid place-items-center" aria-hidden="true">
                <span className="w-5 h-5">
                  <Ic n="check" sw={3.2} />
                </span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-5 text-[19px] font-semibold text-ink/80">{t('alFilterHint')}</div>
      <div className="mt-4 rounded-[20px] bg-card shadow-soft p-5 text-[19px] font-medium text-ink/85">⚠️ {t('alFilterNote')}</div>
      <div className="flex flex-wrap gap-4 mt-8">
        <button type="button" data-a="alClear" className="press h-[88px] px-8 rounded-full bg-card shadow-soft text-[22px] font-bold whitespace-nowrap flex-none" onClick={a.alClear}>
          {t('alReset')}
        </button>
        <button type="button" data-a="closeSheet" className="press h-[88px] px-8 rounded-full bg-jade text-white grid place-items-center text-center hd text-[24px] tracking-[.1em] whitespace-nowrap flex-1 min-w-[260px]" onClick={close}>
          {t('close')}
        </button>
      </div>
    </Sheet>
  )
}

function PriceSheet() {
  const close = useEngine((s) => s.closeSheet)
  const draft = useEngine((s) => s.draft)
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, close)
  if (!draft) return null
  const p = mustId(draft.pid)
  return (
    <>
      <Scrim onClose={close}>{null}</Scrim>
      <div ref={ref} className="absolute left-0 right-0 bottom-0 z-40 bg-paper rounded-t-[40px] px-10 pt-8 sheetup" role="dialog" aria-modal="true" aria-label={t('priceBreakdown')} style={{ paddingBottom: 'calc(28px + env(safe-area-inset-bottom,0px))' }}>
        <div className="flex items-center justify-between">
          <div className="hd text-[40px] tracking-[.02em]">{t('priceBreakdown')}</div>
          <button type="button" data-a="closeSheet" aria-label={t('close')} className="press w-[64px] h-[64px] rounded-full bg-card shadow-soft grid place-items-center" onClick={close}>
            <span className="w-7 h-7">
              <Ic n="x" sw={2.6} />
            </span>
          </button>
        </div>
        <div id="priceRows" className="mt-4">
          <PriceRows p={p} d={draft} />
        </div>
      </div>
    </>
  )
}

function IdleDialog() {
  const warnAt = useEngine((s) => s.idleWarnAt)
  const countdownMs = useEngine((s) => s.config?.idle.countdownMs ?? 15000)
  const a = useEngine(useShallow((s) => ({ idleContinue: s.idleContinue, newOrderReset: s.newOrderReset })))
  // The countdown follows config.idle (the same setting useIdle() resets on), not the brand pack.
  const secsLeft = () => Math.max(0, Math.ceil((countdownMs - (Date.now() - (warnAt || Date.now()))) / 1000))
  const [left, setLeft] = useState(secsLeft)
  useEffect(() => {
    const id = setInterval(() => setLeft(secsLeft()), 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warnAt, countdownMs])
  const ref = useRef<HTMLDivElement>(null)
  useModal(ref, a.idleContinue)
  return (
    <div className="absolute inset-0 z-50 grid place-items-center idle-scrim" style={{ background: 'rgb(var(--c-ink)/.62)' }}>
      <div ref={ref} className="bg-paper rounded-[36px] p-12 w-[800px] text-center" role="alertdialog" aria-modal="true" aria-labelledby="idleT">
        <div id="idleT" className="hd text-[54px] leading-[1.05] tracking-[.02em]">
          {t('idleT')}
        </div>
        <p className="text-[26px] text-ink/80 font-medium mt-5" dangerouslySetInnerHTML={{ __html: tf('idleB', { n: `<span id="idleCd" class="num font-extrabold">${left}</span>` }) }} />
        <div className="grid grid-cols-1 gap-4 mt-10">
          <button type="button" id="idleGo" data-a="idleGo" className="press h-[104px] rounded-full bg-jade text-white hd text-[26px] tracking-[.1em]" onClick={a.idleContinue}>
            {t('idleGo')}
          </button>
          <button
            type="button"
            data-a="idleClear"
            className="press h-[88px] rounded-full text-[23px] font-bold text-ember"
            style={{ boxShadow: 'inset 0 0 0 3px rgb(var(--c-ember)/.55)' }}
            onClick={() => {
              clearSession()
              a.newOrderReset()
            }}
          >
            {t('idleClear')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Confirms() {
  const confirm = useEngine((s) => s.confirm)
  const cart = useEngine((s) => s.cart)
  const a = useEngine(useShallow((s) => ({ keepEdit: s.keepEdit, discardStep: s.discardStep, discardEdit: s.discardEdit, delAll: s.delAll, delMainOnly: s.delMainOnly, delCancel: s.delCancel, keepOrder: s.keepOrder, confirmCancel: s.confirmCancel })))
  if (!confirm) return null
  if (confirm === 'idle') return <IdleDialog />
  if (typeof confirm === 'object' && confirm.type === 'soldOut')
    return (
      <Dialog label={t('unavailT')}>
        <div id="soldOutT" className="hd text-[44px] leading-[1.05] tracking-[.02em]">
          {t('unavailT')}
        </div>
        <p className="text-[23px] text-mute font-medium mt-3">{tf('soldOutNow', { name: confirm.name })}</p>
        <div className="grid gap-4 mt-10">
          <button type="button" data-a="soldOutOk" className="press h-[92px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]" onClick={() => useEngine.getState().setConfirm(null)}>
            {t('close')}
          </button>
        </div>
      </Dialog>
    )
  if (confirm === 'printProblem')
    return (
      <Dialog label={t('printProblemT')}>
        <div id="printProblemT" className="hd text-[44px] leading-[1.05] tracking-[.02em]">
          {t('printProblemT')}
        </div>
        <p className="text-[23px] text-mute font-medium mt-3">{t('printProblemB')}</p>
        <div className="grid gap-4 mt-10">
          <button type="button" data-a="printYes" className="press h-[92px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]" onClick={printSkipYes}>
            {t('printYes')}
          </button>
          <button type="button" data-a="printNo" className="press h-[92px] rounded-full bg-card shadow-soft text-[22px] font-bold" onClick={printSkipNo}>
            {t('cancel')}
          </button>
        </div>
      </Dialog>
    )
  if (confirm === 'availFail' || confirm === 'authChanged')
    return (
      <Dialog>
        <div id="availFailT" className="hd text-[44px] leading-[1.05] tracking-[.02em]">
          {t(confirm === 'authChanged' ? 'authChangedT' : 'availFailT')}
        </div>
        <p className="text-[23px] text-mute font-medium mt-3">{t(confirm === 'authChanged' ? 'authChangedB' : 'availFailB')}</p>
        <div className="grid gap-4 mt-10">
          <button type="button" data-a="availRetry" className="press h-[92px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]" onClick={() => void availRetry()}>
            {t('connRetry')}
          </button>
          <button type="button" data-a="availBack" className="press h-[80px] rounded-full text-[22px] font-bold text-ink/70" onClick={availBack}>
            {t('payBack')}
          </button>
        </div>
      </Dialog>
    )
  if (typeof confirm === 'object' && confirm.type === 'priceChanged') {
    const total = cart.reduce((x, l) => x + lineUnit(l) * l.qty, 0)
    return (
      <Dialog width={820}>
        <div id="priceChT" className="hd text-[46px] leading-[1.05] tracking-[.02em]">
          {confirm.again ? t('priceChangedAgain') : t('priceChangedT')}
        </div>
        <div className="text-[23px] text-ink/80 font-medium mt-4 text-left">
          {confirm.changes.map((c) => (
            <p key={c.lid} className="py-1">
              {tf('priceChangedB', { name: c.name, price: fmt(c.now), old: fmt(c.old) })}
            </p>
          ))}
        </div>
        <div className="grid gap-4 mt-10">
          <button type="button" data-a="priceConfirm" className="press h-[92px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]" onClick={() => void priceConfirm()}>
            {t('priceConfirm')} · {fmt(total + confirm.changes.reduce((x, c) => x + (c.now - c.old) * (line(cart, c.lid)?.qty || 1), 0))}
          </button>
          <button type="button" data-a="priceBack" className="press h-[80px] rounded-full text-[22px] font-bold text-ink/70" onClick={priceBack}>
            {t('payBack')}
          </button>
        </div>
      </Dialog>
    )
  }
  if (typeof confirm === 'object' && confirm.type === 'delLinked') {
    const l = line(cart, confirm.lid)
    const n = l ? xsLinesOf(cart, l.lid).length : 0
    const name = l ? byId(l.pid)?.name || '' : ''
    return (
      <Dialog width={820}>
        <div id="delLinkedT" className="hd text-[46px] leading-[1.05] tracking-[.02em]">
          {t('delLinkedT')}
        </div>
        <p className="text-[24px] text-mute font-medium mt-3">{tf(n === 1 ? 'delLinkedB1' : 'delLinkedB', { name, n })}</p>
        <div className="grid gap-4 mt-10">
          <button type="button" data-a="delAll" className="press h-[92px] rounded-full bg-ember text-white hd text-[23px] tracking-[.08em]" onClick={a.delAll}>
            {t('delAll')}
          </button>
          <button type="button" data-a="delMainOnly" className="press h-[92px] rounded-full bg-card shadow-soft text-[22px] font-bold" onClick={a.delMainOnly}>
            {t('delMainOnly')} · {t('delKeepSides')}
          </button>
          <button type="button" data-a="delCancel" className="press h-[80px] rounded-full text-[22px] font-bold text-ink/70" onClick={a.delCancel}>
            {t('cancel')}
          </button>
        </div>
      </Dialog>
    )
  }
  if (confirm === 'discard' || confirm === 'discardStep')
    return (
      <Dialog>
        <div id="discardT" className="hd text-[48px] tracking-[.02em]">
          {t('discardT')}
        </div>
        <p className="text-[24px] text-mute font-medium mt-3">{t('discardB')}</p>
        <div className="grid grid-cols-2 gap-5 mt-10">
          <button type="button" data-a="keepEdit" className="press h-[100px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]" onClick={a.keepEdit}>
            {t('discardKeep')}
          </button>
          <button type="button" className="press h-[100px] rounded-full text-[23px] font-bold text-ember" style={{ boxShadow: 'inset 0 0 0 3px rgb(var(--c-ember)/.55)' }} onClick={confirm === 'discardStep' ? a.discardStep : a.discardEdit}>
            {t('discardYes')}
          </button>
        </div>
      </Dialog>
    )
  if (confirm === 'cancel')
    return (
      <Dialog>
        <div className="text-[84px]">🥺</div>
        <div className="hd text-[48px] tracking-[.02em] mt-4">{t('cancelQ')}</div>
        <p className="text-[24px] text-mute font-medium mt-3">{t('cancelB')}</p>
        <div className="grid grid-cols-2 gap-5 mt-10">
          <button type="button" data-a="keepOrder" className="press h-[100px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]" onClick={a.keepOrder}>
            {t('keepOrder')}
          </button>
          <button
            type="button"
            data-a="confirmCancel"
            className="press h-[100px] rounded-full text-[23px] font-bold text-ember"
            style={{ boxShadow: 'inset 0 0 0 3px rgb(var(--c-ember)/.55)' }}
            onClick={() => {
              clearSession()
              a.confirmCancel()
            }}
          >
            {t('yesCancel')}
          </button>
        </div>
      </Dialog>
    )
  return null
}

function Toast() {
  const toast = useEngine((s) => s.toast)
  const screen = useEngine((s) => s.screen)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!toast) return
    const show = setTimeout(() => setOn(true), 0)
    const hide = setTimeout(() => setOn(false), 1600)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [toast])
  // On home/menu the basket bar carries the note instead (bkNote).
  if (!toast || (screen !== 'cart' && cartCount(useEngine.getState().cart) > 0 && (screen === 'home' || screen === 'menu'))) return null
  return (
    <div id="obToast" className={`ob-toast${on ? ' on' : ''}`} role="status" aria-live="polite">
      {toast.text}
    </div>
  )
}

function ConnBanner() {
  const conn = useEngine((s) => s.conn)
  const ready = useEngine((s) => s.ready)
  if (!ready || canSubmitWrites(conn)) return null
  return (
    <div id="connBanner" role="status" aria-live="polite">
      {t('connLost')}
    </div>
  )
}

/** "Volledig scherm" pill after a 3 s hold on the logo: the tap on it is the user activation touch screens need. */
function FsPrompt() {
  const fs = useFullscreenState()
  if (!fs.prompt) return null
  return (
    <div id="fsPrompt" role="status">
      <button type="button" data-a="fsToggle" className="press" onClick={() => void toggleFullscreen()}>
        {fs.on ? t('fsExit') : t('fsAction')}
      </button>
    </div>
  )
}

export function Overlays() {
  const sheet = useEngine((s) => s.sheet)
  const confirm = useEngine((s) => s.confirm)
  const pay = usePayState()
  // Confirm dialogs stay off during an active payment, except the order adapter's own question
  // ("continue without receipt?"), which is asked while payment.start() is pending.
  const confirms = pay.status === 'idle' || NOTHING_CHARGED.has(pay.status) || confirm === 'printProblem'
  return (
    <>
      {sheet === 'voucher' || sheet === 'loyalty' ? <VoucherSheet /> : null}
      {sheet && typeof sheet === 'object' ? <AllergenSheet pid={sheet.allergens} /> : null}
      {sheet === 'alfilter' ? <AlFilterSheet /> : null}
      {sheet === 'price' ? <PriceSheet /> : null}
      {confirms ? <Confirms /> : null}
      <Toast />
      <ConnBanner />
      <FsPrompt />
    </>
  )
}
