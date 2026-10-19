import { useShallow } from 'zustand/shallow'
// Order review — port of SCR.cart (+ cartInspireHTML). Loyalty (Como) box reduced to a login prompt.

import { cartClashes, cartCount, hasCat, lineSummary, lineUnit, validateCart } from '../engine/cart'
import { byId, lineMax, pname } from '../engine/catalog'
import { cmsAddable, cmsBlocks } from '../engine/cms'
import { firstIncomplete, lineNeedsChoice, unavailParts, validateLineStructure } from '../engine/draft'
import { fmt } from '../engine/money'
import { E, L, checkProducts, t, tf } from '../engine/state'
import type { CartLine, Product } from '../engine/types'
import { canSubmitWrites } from '../domain/connectivity'
import { useEngine } from '../store/engine'
import { toPay } from '../app/checkout'
import { CardCtl } from './cards'
import { FoodImg, Ic, Stepper } from './primitives'

function CartInspire() {
  const cart = useEngine((s) => s.cart)
  const a = useEngine(useShallow((s) => ({ openProduct: s.openProduct, goCat: s.goCat })))
  const B = cmsBlocks('cart-inspire')[0]
  if (!B) return null
  const inCart = new Set(cart.filter((l) => !l.reward).map((l) => l.pid))
  const link = B.link?.cat ? B.link : null
  const p = (B.items || []).map((i) => byId(i.pid)).filter((x): x is Product => !!x && !inCart.has(x.id) && cmsAddable(x))[0]
  if (!p && !link) return null
  if (link && cart.some((l) => !l.reward && byId(l.pid)?.cat === link.cat)) return null
  return (
    <section className="cinsp mt-6" data-cms-block={B.id}>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="hd text-[27px] tracking-[.04em]">{L(B.title)}</span>
        {B.subtitle ? <span className="text-[19px] text-mute font-semibold">{L(B.subtitle)}</span> : null}
      </div>
      {p ? (
        <div className="cinsp-c">
          <button type="button" data-a="prod" className="press cinsp-img" onClick={() => a.openProduct(p, { from: 'cart' })}>
            <FoodImg p={p} cls="h-full" em="44px" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="hd text-[23px] leading-[25px] tracking-[.03em]">{pname(p)}</div>
            <div className="p-desc text-[18px] text-mute font-medium leading-[23px] clamp2">{L(p.desc)}</div>
            <div className="num text-[21px] font-extrabold mt-1">+ {fmt(p.price)}</div>
          </div>
          <span className="card-ctl flex-none" data-ctl-for={p.id} data-ctl-size="56">
            <CardCtl p={p} size={56} />
          </span>
        </div>
      ) : null}
      {link ? (
        <button type="button" data-a="cat" className="press cinsp-link mt-3" onClick={() => a.goCat(link.cat)}>
          {L(link.label)}
        </button>
      ) : null}
    </section>
  )
}

function Line({ l, cart }: { l: CartLine; cart: CartLine[] }) {
  const a = useEngine(useShallow((s) => ({ delLine: s.delLine, editLine: s.editLine, cartQty: s.cartQty })))
  const p = byId(l.pid)
  const na = checkProducts([l.pid]).length > 0
  let sum = ''
  try {
    sum = lineSummary(cart, l)
  } catch {
    sum = ''
  }
  const img = (cls = '') => (
    <div className={`w-[132px] h-[132px] rounded-[20px] overflow-hidden flex-none ${cls}`}>{p ? <FoodImg p={p} cls="h-full" em="58px" /> : null}</div>
  )
  if (l.reward && p)
    return (
      <div className="flex gap-6 p-5 rounded-[26px] mb-4 line-gift">
        {img()}
        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-center gap-3">
            <div className="hd text-[25px] tracking-[.03em]">{pname(p)}</div>
            <span className="badge b-dea">🎁 {t('giftLabel')}</span>
          </div>
          <div className="text-[19px] text-mute font-semibold mt-1">{t('giftFixed')}</div>
          <div className="num text-[24px] font-extrabold mt-1">{fmt(0)}</div>
          <button type="button" data-a="delLine" className="press mt-3 h-[56px] px-5 rounded-full bg-card shadow-soft text-[19px] font-bold text-ink/70" onClick={() => a.delLine(l.lid)}>
            {tf('removeA', { name: pname(p) })}
          </button>
        </div>
      </div>
    )
  if (!p || validateLineStructure(l).length)
    return (
      <div className="flex gap-6 p-5 rounded-[26px] mb-4 line-na" role="group" aria-label={t('lineInvalid')}>
        <div className="flex-1 min-w-0 py-1">
          <div className="hd text-[25px] tracking-[.03em] line-through text-ink/60">{p ? pname(p) : l.pid}</div>
          <div className="text-[19px] text-ink/80 font-medium mt-1">{t('lineInvalid')}</div>
          <button type="button" data-a="delLine" className="press mt-3 h-[64px] px-6 rounded-full bg-ember text-white text-[20px] font-bold" onClick={() => a.delLine(l.lid)}>
            {t('unavailRemove')}
          </button>
        </div>
      </div>
    )
  if (!na && l.lineType === 'product' && lineNeedsChoice(l)) {
    const g = firstIncomplete(l)!
    return (
      <div className="flex gap-6 p-5 rounded-[26px] mb-4 line-need" role="group">
        {img()}
        <div className="flex-1 min-w-0 py-1">
          <div className="hd text-[25px] tracking-[.03em]">{pname(p)}</div>
          <button type="button" data-a="editLine" className="press mt-2 h-[64px] px-6 rounded-full bg-ember text-white text-[20px] font-bold" onClick={() => a.editLine(l.lid)}>
            {tf('needChoice', { label: L(E().mods[g].label).toLowerCase() })}
          </button>
        </div>
      </div>
    )
  }
  if (na)
    return (
      <div className="flex gap-6 p-5 rounded-[26px] mb-4 line-na" role="group" aria-label={t('unavailT')}>
        {img('opacity-50')}
        <div className="flex-1 min-w-0 py-1">
          <div className="hd text-[25px] tracking-[.03em] line-through text-ink/60">{pname(p)}</div>
          <div className="hd text-[20px] tracking-[.06em] text-ember mt-1">{t('unavailT')}</div>
          <div className="text-[19px] text-ink/80 font-medium mt-1">{t('unavailB')}</div>
          <button type="button" data-a="delLine" className="press mt-3 h-[64px] px-6 rounded-full bg-ember text-white text-[20px] font-bold" onClick={() => a.delLine(l.lid)}>
            {t('unavailRemove')}
          </button>
        </div>
      </div>
    )
  return (
    <div className="flex gap-6 p-5 bg-card rounded-[26px] mb-4 shadow-soft">
      {img()}
      <div className="flex-1 min-w-0 py-1">
        <div className="hd text-[25px] tracking-[.03em]">{pname(p)}</div>
        {sum ? <div className="text-[19px] text-mute font-medium leading-snug clamp2 mt-1">{sum}</div> : null}
        {/* Per-line actions: edit (products only) and remove. Both are 56 px tall touch targets. Remove goes
            through delLine, the same path as the stepper's trash at quantity 1 (linked-sides dialog kept). */}
        <div className="flex items-center gap-8 mt-2">
          {l.lineType === 'cross-sell' ? (
            <span className="text-[17px] hd tracking-[.1em] text-mute">{t('priceSide')}</span>
          ) : (
            <button type="button" data-a="editLine" className="press flex items-center gap-2 h-[56px] text-[20px] font-bold text-ink/70" onClick={() => a.editLine(l.lid)}>
              <span className="w-6 h-6">
                <Ic n="pencil" />
              </span>
              {t('edit')}
            </button>
          )}
          <button type="button" data-a="delLine" className="press flex items-center gap-2 h-[56px] text-[20px] font-bold text-ink/70" aria-label={tf('removeA', { name: pname(p) })} onClick={() => a.delLine(l.lid)}>
            <span className="w-6 h-6">
              <Ic n="trash" />
            </span>
            {t('removeItem')}
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between py-1">
        <div className="num text-[27px] font-extrabold" id={`lp-${l.lid}`}>
          {fmt(lineUnit(l) * l.qty)}
        </div>
        <span id={`ls-${l.lid}`}>
          <Stepper qty={l.qty} onDelta={(d) => a.cartQty(l.lid, d)} h={72} name={pname(p)} max={lineMax(p)} />
        </span>
      </div>
    </div>
  )
}

export function Cart() {
  const cart = useEngine((s) => s.cart)
  const service = useEngine((s) => s.service)
  const checking = useEngine((s) => s.checking)
  const conn = useEngine((s) => s.conn)
  const a = useEngine(useShallow((s) => ({ backMenu: s.backMenu, askCancel: s.askCancel, otype: s.otype, voucher: s.voucher })))
  const member = useEngine((s) => s.member)
  const total = cart.reduce((x, l) => x + lineUnit(l) * l.qty, 0)
  const issues = validateCart(cart).filter((i) => i.code !== 'price-changed')
  const clashes = cartClashes(cart)
  const online = canSubmitWrites(conn)
  const blocked = issues.length > 0 || !online || checking
  const n = cartCount(cart)
  const svc = service === 'eatin' ? 'eatin' : 'takeaway'
  const blockedText = checking
    ? t('availCheckT')
    : !online
      ? t('blockedConn')
      : issues.some((i) => i.code.startsWith('unavailable'))
        ? tf('blockedUnavail', { list: [...new Set(cart.flatMap((l) => unavailParts(l).map((x) => x.name)))].join(', ') })
        : issues.some((i) => i.code === 'required-choice')
          ? t('blockedChoice')
          : issues.some((i) => i.code === 'qty')
            ? t('blockedQty')
            : t('unavailBlock')
  void hasCat
  return (
    <>
      <div className="flex-none flex items-center justify-between px-9 pt-7 pb-4">
        <button type="button" data-a="backMenu" className="press h-[76px] pl-5 pr-8 rounded-full bg-card shadow-soft flex items-center gap-2 text-[24px] font-bold" onClick={a.backMenu}>
          <span className="w-8 h-8">
            <Ic n="chevL" sw={2.4} />
          </span>
          {t('menuLbl')}
        </button>
        <button type="button" data-a="askCancel" className="press h-[76px] px-6 rounded-full text-[20px] font-bold text-mute" onClick={a.askCancel}>
          {t('cancelOrder')}
        </button>
      </div>
      <div className="px-10 flex-none">
        <h1 className="hd text-[72px] tracking-[.02em]">{t('yourOrder')}</h1>
        <div className="flex items-center justify-between mt-4">
          <div className="text-[22px] text-mute font-semibold">
            {n} {n === 1 ? t('item') : t('items')}
          </div>
          <button type="button" data-a="otype" className="press h-[64px] px-6 rounded-full bg-card shadow-soft flex items-center gap-3 text-[20px] font-bold" aria-label={t('svcChangeA')} onClick={() => a.otype(svc === 'eatin' ? 'takeaway' : 'eatin')}>
            <span className="w-6 h-6">
              <Ic n={svc === 'eatin' ? 'dish' : 'bag'} sw={2} />
            </span>
            {t(svc === 'eatin' ? 'eatIn' : 'takeAway')}
            <span className="text-mute font-semibold">· {t('svcChange')}</span>
          </button>
        </div>
      </div>
      <div className="scroller flex-1 px-10 pt-6 pb-8 enter">
        {cart.length ? (
          cart.map((l) => <Line key={l.lid} l={l} cart={cart} />)
        ) : (
          <div className="grid place-items-center text-center pt-24">
            <div className="text-[120px]">🥢</div>
            <div className="hd text-[40px] mt-6">{t('emptyT')}</div>
            <div className="text-[23px] text-mute font-medium mt-2">{t('emptyS')}</div>
            <button type="button" data-a="backMenu" className="press mt-9 h-[92px] px-12 rounded-full bg-jade text-white hd text-[24px] tracking-[.1em]" onClick={a.backMenu}>
              {t('browse')}
            </button>
          </div>
        )}
        {cart.length ? (
          <button type="button" data-a="backMenu" className="press w-full h-[96px] rounded-[24px] border-[3px] border-dashed border-ink/25 flex items-center justify-center gap-3 text-[24px] font-bold text-ink/60 mb-5" onClick={a.backMenu}>
            <span className="w-7 h-7">
              <Ic n="plus" sw={2.6} />
            </span>
            {t('addMore')}
          </button>
        ) : null}
        {cart.length && E().brand.features.loyalty ? (
          <div className="cm-join" role="note">
            <span className="cm-jic">
              <Ic n="gift" sw={2} />
            </span>
            <span className="cm-jtx">
              <b>{member ? tf('lty_welcome', { name: member.name }) : t('cm_join')}</b>
              {member ? tf('lty_points', { n: member.points }) : t('cm_joinS')}
            </span>
            {!member ? (
              <button type="button" className="press cm-ob" onClick={a.voucher}>
                {t('lty_btn')}
              </button>
            ) : null}
          </div>
        ) : null}
        {cart.length ? <CartInspire /> : null}
      </div>
      {cart.length ? (
        <div className="flex-none bg-card shadow-lift px-10 py-7">
          <div className="flex items-baseline justify-between">
            <div className="hd text-[30px] tracking-[.05em]">{t('total')}</div>
            <div className="num text-[46px] font-extrabold" id="cartTot">
              {fmt(total)}
            </div>
          </div>
          <div className="text-[19px] text-mute font-semibold text-right mt-0.5">{t('inclVat')}</div>
          {clashes.length ? (
            <div className="rounded-[20px] bg-ember/15 text-ember text-[20px] font-bold p-4 mb-3" role="status">
              ⚠️ {tf('alCartClash', { names: clashes.join(', ') })}
            </div>
          ) : null}
          {blocked ? (
            <div className={`text-[20px] ${checking ? 'text-mute' : 'text-ember'} font-bold text-right mt-2`} role="status">
              {blockedText}
            </div>
          ) : null}
          <button type="button" data-a="toPay" disabled={blocked} aria-disabled={blocked} className="press cta w-full h-[112px] mt-5 rounded-full bg-jade text-white flex items-center justify-center gap-6" onClick={() => void toPay()}>
            <span className="hd text-[28px] tracking-[.12em]">
              {t('goPay')} · <span className="num">{fmt(total)}</span>
            </span>
            <span className="w-9 h-9">
              <Ic n="arrR" sw={2.4} />
            </span>
          </button>
        </div>
      ) : null}
    </>
  )
}

