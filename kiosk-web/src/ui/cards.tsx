import { useShallow } from 'zustand/shallow'
// Product cards (visual, compact, wide) and the R44 order button / inline stepper.

import { obConfigs, obLine, obQty, obSizeQty, lineSummary } from '../engine/cart'
import { alHidden, obBlocked, obHasReq, obNeedsDetail, obSizes, obVarCard, pname, servingsOf, defServingIx } from '../engine/catalog'
import { fmt } from '../engine/money'
import { E, L, t, tf } from '../engine/state'
import { MAX_LINE_QTY, type Product } from '../engine/types'
import { useEngine } from '../store/engine'
import { Badges, FoodImg, Ic } from './primitives'

function useServingSel(pid: string): number {
  const sel = useEngine((s) => s.servingSel[pid])
  const p = E().products.find((x) => x.id === pid)!
  const sv = servingsOf(p)
  if (!sv) return -1
  return Number.isInteger(sel) ? Math.max(0, Math.min(sv.length - 1, sel)) : defServingIx(p)
}

function cardPrice(p: Product, sel: number): number {
  const sv = servingsOf(p)
  return sv ? sv[sel].price : p.price
}

/** The round control at the right of the bottom row: [+] add · [›] choose · [n] count · inline stepper. */
export function CardCtl({ p, size = 72, wide = false }: { p: Product; size?: number; wide?: boolean }) {
  const cart = useEngine((s) => s.cart)
  const gtcKey = useEngine((s) => s.gtcKey)
  const a = useEngine(useShallow((s) => ({ quickAdd: s.quickAdd, cardInc: s.cardInc, cardDec: s.cardDec, gtcExpand: s.gtcExpand, openProduct: s.openProduct })))
  const sel = useServingSel(p.id)
  const row = size === 56
  const bl = obBlocked(p)
  const n = obQty(cart, p, wide, sel)
  const open = gtcKey === p.id
  if (wide && obVarCard(p)) return n > 0 && open && !bl ? <ObStepper p={p} n={n} row={false} wide /> : null
  if (bl)
    return (
      <button type="button" className="ob ob-off" disabled aria-disabled="true" aria-label={bl === 'filter' ? tf('obFilterA', { name: pname(p) }) : tf('soldOutA', { name: pname(p) })}>
        <span className="ob-i">
          <Ic n={bl === 'filter' ? 'info' : 'x'} sw={2.4} />
        </span>
      </button>
    )
  if (n > 0 && open) return <ObStepper p={p} n={n} row={row} wide={false} />
  if (n > 0)
    return (
      <button type="button" data-a="gtcOpen" className="press ob ob-n" aria-label={tf('obCountA', { q: n })} onClick={() => a.gtcExpand(p.id)}>
        <span className="ob-q num" aria-live="polite">
          {n}
        </span>
      </button>
    )
  if (obNeedsDetail(p))
    return (
      <button type="button" data-a="prod" className="press ob" aria-label={tf('obChooseA', { name: pname(p) })} onClick={() => a.openProduct(p)}>
        <span className="ob-i">
          <Ic n="chevR" sw={2.6} />
        </span>
      </button>
    )
  return (
    <button type="button" data-a="quickAdd" className="press ob" aria-label={tf('obAddA', { name: pname(p) })} onClick={() => a.quickAdd(p.id)}>
      <span className="ob-i">
        <Ic n="plus" sw={2.6} />
      </span>
    </button>
  )
}

export function ObStepper({ p, n, row, wide }: { p: Product; n: number; row: boolean; wide: boolean }) {
  const cart = useEngine((s) => s.cart)
  const cardInc = useEngine((s) => s.cardInc)
  const cardDec = useEngine((s) => s.cardDec)
  const sel = useServingSel(p.id)
  const one = n === 1
  const atMax = n >= MAX_LINE_QTY
  const l = obLine(cart, p, wide, sel)
  const multi = !wide && obConfigs(cart, p) > 1
  const lab = multi && l ? lineSummary(cart, l) : ''
  return (
    <span className={`ob-stp in${row ? ' row' : ''}${multi ? ' multi' : ''}`} role="group" aria-label={multi && l ? tf('obMultiA', { q: n, cfg: lab }) : tf('obCountA', { q: n })}>
      <button type="button" data-a="cardDec" className="press ob-m" aria-label={one ? t('obRemove') : t('obLess')} onClick={() => cardDec(p.id, wide)}>
        {one ? (
          <span className="ob-tr">
            <Ic n="trash" sw={2.3} />
          </span>
        ) : (
          <span className="ob-bar" />
        )}
      </button>
      <span className={`ob-sq num${multi ? ' multi' : ''}`} aria-live="polite">
        {n}
        {multi ? <span className="ob-sqc">{lab}</span> : null}
      </span>
      <button type="button" data-a="cardInc" className={`press ob-p${atMax ? ' off' : ''}`} aria-label={t('obMore')} aria-disabled={atMax ? true : undefined} onClick={() => cardInc(p.id, wide)}>
        <span className="ob-i">
          <Ic n="plus" sw={2.6} />
        </span>
      </button>
    </span>
  )
}

function ObMoney({ p, px }: { p: Product; px: number }) {
  const openProduct = useEngine((s) => s.openProduct)
  const sel = useServingSel(p.id)
  if (alHidden(p))
    return (
      <span className="card-money">
        <span className="ob-flt-t">{t('obNoFilter')}</span>
      </span>
    )
  const sizes = obSizes(p)
  return (
    <span className="card-money">
      <button type="button" data-a="prod" className="press num ob-price text-left w-full" style={{ fontSize: px }} onClick={() => openProduct(p)}>
        {sizes && !obHasReq(p) ? <span className="ob-from">{t('obFrom')} </span> : null}
        {fmt(sizes ? Math.min(...sizes.map((x) => x.price)) : cardPrice(p, sel))}
      </button>
    </span>
  )
}

const prodAttrs = (p: Product) => (alHidden(p) ? { disabled: true, 'aria-disabled': true as const, tabIndex: -1 } : {})

export function ProductCard({ p }: { p: Product }) {
  const openProduct = useEngine((s) => s.openProduct)
  const gtcKey = useEngine((s) => s.gtcKey)
  const b = E().brand
  return (
    <article className={`ob-card relative bg-card rounded-[16px] overflow-hidden shadow-soft flex flex-col card-in card-fast${alHidden(p) ? ' ob-flt' : ''}`}>
      <Badges p={p} cls="top-3 left-3" sm />
      <button type="button" data-a="prod" {...prodAttrs(p)} className="press block w-full text-left" onClick={() => openProduct(p)}>
        <FoodImg p={p} cls="w-full flex-none" em="80px" style={{ height: b.layout.productImageHeight }} />
        <div className="px-[16px] pt-2">
          <div className="hd text-[25px] leading-[27px] tracking-[.3px] clamp2 h-[54px]">{pname(p)}</div>
          <div className="p-desc text-[16px] text-mute font-normal leading-[21px] clamp2 h-[42px] mt-1">{L(p.desc)}</div>
        </div>
      </button>
      <div className="card-row px-[16px] pb-2.5 pt-1.5 mt-auto">
        <ObMoney p={p} px={23} />
      </div>
      <span className={`card-ctl${gtcKey === p.id ? ' open' : ''}`} data-ctl-for={p.id} data-ctl-size="72">
        <CardCtl p={p} size={72} />
      </span>
    </article>
  )
}

export function CompactCard({ p }: { p: Product }) {
  const openProduct = useEngine((s) => s.openProduct)
  const gtcKey = useEngine((s) => s.gtcKey)
  return (
    <article className={`cp ob-card relative bg-card rounded-[16px] overflow-hidden shadow-soft flex flex-col card-in card-fast${alHidden(p) ? ' ob-flt' : ''}`}>
      <Badges p={p} cls="top-3 left-3" sm />
      <button type="button" data-a="prod" {...prodAttrs(p)} className="press block w-full text-left" onClick={() => openProduct(p)}>
        <FoodImg p={p} cls="cp-img w-full flex-none" em="60px" />
        <div className="px-[14px] pt-2">
          <div className="hd cp-n text-[23px] leading-[25px] tracking-[.3px] clamp2">{pname(p)}</div>
          <div className="p-desc text-[15px] text-mute font-normal leading-[20px] clamp2 mt-1 h-[40px]">{L(p.desc)}</div>
        </div>
      </button>
      <div className="card-row px-[14px] pb-2.5 pt-2 mt-auto">
        <ObMoney p={p} px={22} />
      </div>
      <span className={`card-ctl${gtcKey === p.id ? ' open' : ''}`} data-ctl-for={p.id} data-ctl-size="72">
        <CardCtl p={p} size={72} />
      </span>
    </article>
  )
}

function ObwSizes({ p }: { p: Product }) {
  const cart = useEngine((s) => s.cart)
  const obVar = useEngine((s) => s.obVar)
  const sv = obSizes(p)!
  const dis = !!obBlocked(p)
  return (
    <>
      {sv.map((x, i) => {
        const q = obSizeQty(cart, p, i)
        const save = Number.isInteger(x.compareAt) && (x.compareAt as number) > x.price ? (x.compareAt as number) - x.price : 0
        return (
          <button
            key={i}
            type="button"
            disabled={dis}
            aria-disabled={dis ? true : undefined}
            data-a="obVar"
            className={`press obw-sz${q ? ' has' : ''}`}
            aria-label={tf(q ? 'obVarAq' : 'obVarA', { name: pname(p), size: L(x.short), price: fmt(x.price), q })}
            onClick={() => obVar(p.id, i)}
          >
            <span className="obw-szt">
              <span className="obw-szl">{L(x.label || x.short)}</span>
              {x.sub ? <span className="obw-szs2">{x.sub}</span> : null}
              {save ? <span className="obw-save">{tf('obSave', { amount: fmt(save) })}</span> : null}
            </span>
            <span className="obw-szp">
              {save ? <s className="obw-was num">{fmt(x.compareAt as number)}</s> : null}
              <span className="num">{fmt(x.price)}</span>
              {dis ? null : (
                <span className="obw-szadd" aria-hidden="true">
                  <Ic n="plus" sw={3} />
                </span>
              )}
            </span>
            {q ? (
              <span className="ob-vc num">{q}</span>
            ) : x.love ? (
              <span className="ob-vh" aria-hidden="true">
                <Ic n="heart" sw={0} />
              </span>
            ) : null}
          </button>
        )
      })}
    </>
  )
}

export function ProductWide({ p }: { p: Product }) {
  const openProduct = useEngine((s) => s.openProduct)
  const gtcKey = useEngine((s) => s.gtcKey)
  const info = E().obwInfo[p.id] || {}
  const sizes = obVarCard(p) && !alHidden(p)
  const sub = p.sub || info.sub ? L(p.sub || info.sub) : ''
  const tags = (p.flavour || info.flavour || []).slice(0, 3)
  return (
    <article className={`obw ob-card relative bg-card rounded-[22px] overflow-hidden shadow-soft card-in card-fast${alHidden(p) ? ' ob-flt' : ''}`}>
      <button type="button" data-a="prod" {...prodAttrs(p)} className="press obw-img" aria-label={pname(p)} onClick={() => openProduct(p)}>
        <FoodImg p={p} cls="w-full h-full" em="80px" />
      </button>
      <Badges p={p} cls="top-3 left-3" sm />
      <div className="obw-body">
        <button type="button" data-a="prod" {...prodAttrs(p)} className="press block w-full text-left" onClick={() => openProduct(p)}>
          <div className="hd obw-name">{pname(p)}</div>
          {sub ? <div className="obw-sub">{sub}</div> : null}
          <div className="obw-desc">{L(p.desc)}</div>
        </button>
        {tags.length ? (
          <div className="obw-tags">
            {tags.map((x, i) => (
              <span key={i}>{L(x)}</span>
            ))}
          </div>
        ) : null}
        <div className={`obw-row${sizes ? ' sz' : ''}`}>
          {sizes ? (
            <div className="obw-szs" data-obw={p.id} role="group" aria-label={t('sizeT')}>
              <ObwSizes p={p} />
            </div>
          ) : (
            <div className="obw-money">
              <ObMoney p={p} px={26} />
            </div>
          )}
          <span className={`card-ctl${gtcKey === p.id ? ' open' : ''}`} data-ctl-for={p.id} data-ctl-size="72" data-ctl-wide="1">
            <CardCtl p={p} size={72} wide />
          </span>
        </div>
      </div>
    </article>
  )
}

/** Compact row item for the CMS "category-finish" block and the menu's completion strip. */
export function FinishItem({ p }: { p: Product }) {
  const openProduct = useEngine((s) => s.openProduct)
  return (
    <div className="cfin-item" data-pid={p.id}>
      <button type="button" data-a="prod" className="press cfin-img" onClick={() => openProduct(p)}>
        <FoodImg p={p} cls="h-full" em="40px" />
      </button>
      <div className="flex-1 min-w-0">
        <button type="button" data-a="prod" className="press block text-left w-full" onClick={() => openProduct(p)}>
          <span className="hd block text-[20px] leading-[22px] tracking-[.03em]">{pname(p)}</span>
        </button>
        <div className="num text-[19px] font-extrabold mt-0.5">+ {fmt(p.price)}</div>
      </div>
      <span className="card-ctl flex-none" data-ctl-for={p.id} data-ctl-size="56">
        <CardCtl p={p} size={56} />
      </span>
    </div>
  )
}
