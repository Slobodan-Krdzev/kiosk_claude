import { useShallow } from 'zustand/shallow'
// Product detail page (R44 layout) + customize step. Ports of renderR44(), r44*(), vuMenuBlock(), vuDrinksBlock(), xsSection(), SCR.customize, stepDock().

import { useEffect, useRef, useState } from 'react'
import { byId, lineMax, mustId, pname, servingIx, servingsOf } from '../engine/catalog'
import { cmsById, drinkUp, priceOf } from '../engine/cms'
import {
  activeSteps,
  blockReason,
  grpCount,
  grpMax,
  grpMin,
  isStep,
  optionUnavailable,
  stepLocked,
  draftValid,
  exMax,
  exQty,
  extrasSum,
  firstIncomplete,
  menuTotalOf,
  pdpTotal,
  priceLines,
  stepKey,
  unavailParts,
  unitPrice,
  xsConflicts,
  xsPortion,
  xsSelected,
  xsSum,
  xsTitle,
  xsVisible,
} from '../engine/draft'
import { fmt } from '../engine/money'
import { E, L, getAllergenFilter, t, tf } from '../engine/state'
import type { CmsItem, Draft, ModItem, Product } from '../engine/types'
import { draftExperience, useEngine, type EngineState } from '../store/engine'
import type { Experience } from '../engine/cms'
import { FoodImg, HeroShot, Ic, Stepper } from './primitives'

const r44Grams = (x: { sub?: string }): number | null => {
  const m = String(x?.sub || '').match(/(\d+)\s*g\b/i)
  return m ? +m[1] : null
}

function R44Bowl({ frac }: { frac: number }) {
  const f = Math.max(0.18, Math.min(1, frac))
  const h = Math.round(22 * f * 10) / 10
  return (
    <svg viewBox="0 0 64 44" aria-hidden="true" className="r44-bowl">
      <defs>
        <clipPath id="r44c">
          <path d="M6 14h52c0 14-11 24-26 24S6 28 6 14Z" />
        </clipPath>
      </defs>
      <path d="M6 14h52c0 14-11 24-26 24S6 28 6 14Z" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <rect x="4" y={(38 - h).toFixed(1)} width="56" height={h} fill="currentColor" clipPath="url(#r44c)" opacity=".9" />
      <path d="M22 41h20" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M10 10c6-6 38-6 44 0" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
    </svg>
  )
}

/** Group header. `numbered`: always a step number and full-size title, also when optional (upsell steps). */
function R44Head({ title, note, rule, numbered }: { title: React.ReactNode; note: 'req' | 'opt' | null; rule?: string; numbered?: boolean }) {
  const small = note === 'opt' && !numbered
  return (
    <div className={`r44-step${small ? ' r44-optional' : ''}`}>
      {small ? null : <span className="r44-num" aria-hidden="true" />}
      <span className="r44-tt">{title}</span>
      {note ? (
        <span className={`r44-note${note === 'req' ? ' req' : ''}`} aria-label={note === 'req' ? t('reqMark') : undefined}>
          · {t(note === 'req' ? 'r44Req' : 'r44Opt')}
        </span>
      ) : null}
      {rule ? <span className="r44-note">· {rule}</span> : null}
    </div>
  )
}

/** Selection rule of an upsell step from the API data ("choose 2", "choose 1–5", "up to 3"). */
function ruleText(g: string): string {
  if (!isStep(g)) return ''
  const min = grpMin(g)
  const max = grpMax(g)
  if (min === max) return tf('pickN', { n: max })
  return min > 0 ? tf('pickRange', { min, max }) : tf('pickMax', { n: max })
}

function SizeSection({ p, d }: { p: Product; d: Draft }) {
  const pickServing = useEngine((s) => s.pickServing)
  const sv = servingsOf(p)
  if (!sv || sv.length < 2) return null
  const sel = servingIx(p, d)
  const base = sv[0]
  const gs = sv.map(r44Grams)
  const gmax = Math.max(...gs.filter((g): g is number => !!g), 1)
  return (
    <section className="grp r44-grp" id="grp-serving" role="radiogroup" aria-label={t('r44Size')}>
      <R44Head title={t('r44Size')} note={null} />
      <div className="r44-sizes" style={{ gridTemplateColumns: `repeat(${Math.min(sv.length, 3)},minmax(0,1fr))` }}>
        {sv.map((x, i) => {
          const on = i === sel
          const g = gs[i]
          const dg = g && gs[0] ? g - (gs[0] as number) : 0
          const dp = x.price - base.price
          const diff = i === 0 ? t('r44Base') : dg > 0 ? tf('r44DiffG', { g: dg, price: fmt(dp) }) : `+ ${fmt(dp)}`
          return (
            <button key={i} type="button" role="radio" data-a="pickServing" aria-pressed={on} aria-checked={on} className={`press r44-size${on ? ' on' : ''}`} onClick={() => pickServing(p.id, i, 'pdp')}>
              <span className="r44-sz-ic">
                <R44Bowl frac={g ? g / gmax : (i + 1) / sv.length} />
              </span>
              <span className="r44-sz-mid">
                <span className="r44-sz-nm">
                  <span className="hd">{L(x.short)}</span>
                  {x.love ? <span className="r44-rec">{t('r44Rec')}</span> : null}
                </span>
                {x.sub ? <span className="r44-sz-g">{x.sub}</span> : null}
                <span className="r44-sz-d">{diff}</span>
              </span>
              <span className="r44-sz-pr hd num">{fmt(x.price)}</span>
              <span className="r44-ck" aria-hidden="true">
                <Ic n="check" sw={3} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

const r44Cols = (items: ModItem[]): number => {
  const n = items.length
  const long = Math.max(...items.map((it) => String(L(it.name)).length + (it.price ? 6 : 0))) > 12
  return n <= 2 ? n : n === 3 ? 3 : long ? 2 : 4
}

function Group({ g, d, need, hint }: { g: string; d: Draft; need: boolean; hint: string }) {
  const choice = useEngine((s) => s.choice)
  const grp = E().mods[g]
  const req = !!grp.req
  const filter = getAllergenFilter()
  return (
    <section className={`grp r44-grp${need ? ' grp-need' : ''}`} id={`grp-${g}`} role="group" aria-labelledby={`grpl-${g}`}>
      <R44Head title={<span id={`grpl-${g}`}>{L(grp.label)}</span>} note={req ? 'req' : 'opt'} />
      <div id={`hint-${g}`} className="reqHint r44-hint" role="status" aria-live="polite">
        {hint}
      </div>
      <div className="r44-opts" style={{ gridTemplateColumns: `repeat(${r44Cols(grp.items)},minmax(0,1fr))` }}>
        {grp.items.map((it) => {
          const on = d.choices[g] === it.id
          const bl = [...filter].some((a) => (it.allergens?.contains || []).includes(a))
          return (
            <button key={it.id} type="button" data-a={bl ? 'r44Blocked' : 'choice'} aria-pressed={on && !bl} aria-disabled={bl ? true : undefined} className={`press optBtn r44-opt${bl ? ' blk' : ''}`} onClick={() => !bl && choice(g, it.id)}>
              <span className="r44-ol">
                <span className="r44-on">{L(it.name)}</span>
                {it.sub ? <span className="r44-os">{L(it.sub)}</span> : null}
              </span>
              {it.price ? (
                <span className="r44-op hd num">
                  {it.price > 0 ? '+' : ''}
                  {fmt(it.price)}
                </span>
              ) : null}
              <span className="r44-ck" aria-hidden="true">
                <Ic n="check" sw={3} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/** One option of an upsell step: the v36 enhancement tile, with a stepper when the option may be taken more than once. */
function StepTile({ g, it, d, full }: { g: string; it: ModItem; d: Draft; full: boolean }) {
  const a = useEngine(useShallow((s) => ({ pick: s.pick, pickQty: s.pickQty })))
  const q = exQty(d, g, it.id)
  const max = exMax(it.id, g)
  const name = L(it.name)
  // Sold-out / disabled product behind the option (audit F06): shown, not pickable; an existing pick can be removed.
  const na = optionUnavailable(g, it.id)
  // full = the step has its maximum of different options: a picked option can still go up to its own max
  const more = q < max && (q > 0 || !full) && !na
  return (
    <div className={`r44-ex${q ? ' on' : ''}`} data-ex={it.id} aria-disabled={na && !q ? true : undefined} style={na ? { opacity: q ? 1 : 0.45 } : undefined}>
      <div className="r44-ex-img" style={{ height: 'calc(210px * var(--u))' }}>
        <FoodImg p={{ img: it.img, em: it.em || '🍽' }} cls="absolute inset-0" em="64px" />
      </div>
      <div className="r44-ex-b">
        <div className="hd r44-ex-n">{name}</div>
        <div className={`r44-ex-s${na ? ' text-ember' : ''}`}>{na ? t('unavailT') : it.sub ? L(it.sub) : ''}</div>
        <div className="r44-ex-row">
          <span className="r44-ex-p hd num">+ {fmt(it.price)}</span>
          {q > 0 && max > 1 ? (
            <span className="ob-stp r44-exstp" role="group" aria-label={tf('qtyOfA', { name, n: q })}>
              <button type="button" data-a="pickQty" className="press ob-m" aria-label={q === 1 ? t('obRemove') : t('obLess')} onClick={() => a.pickQty(g, it.id, -1)}>
                {q === 1 ? (
                  <span className="ob-tr">
                    <Ic n="trash" sw={2.3} />
                  </span>
                ) : (
                  <span className="ob-bar" />
                )}
              </button>
              <span className="ob-sq num" aria-live="polite">
                {q}
              </span>
              <button type="button" data-a="pickQty" className={`press ob-p${more ? '' : ' off'}`} aria-label={t('obMore')} aria-disabled={more ? undefined : true} onClick={() => more && a.pickQty(g, it.id, 1)}>
                <span className="ob-i">
                  <Ic n="plus" sw={2.6} />
                </span>
              </button>
            </span>
          ) : q > 0 ? (
            <button type="button" data-a="pick" className="press ob" aria-pressed="true" aria-label={t('obRemove')} onClick={() => a.pick(g, it.id)}>
              <span className="ob-i">
                <Ic n="check" sw={3} />
              </span>
            </button>
          ) : (
            <button type="button" data-a="pick" className={`press ob${(full && grpMax(g) > 1) || na ? ' off' : ''}`} aria-label={tf('obAddA', { name })} aria-disabled={na || undefined} onClick={() => !na && a.pick(g, it.id)}>
              <span className="ob-i">
                <Ic n="plus" sw={2.6} />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** One upsell step on the product page. Steps after it appear as the guest picks (chain from the API collection). */
// Kept for the revert described at the step rendering below (picture tiles for upsell collections).
function StepSection({ g, d, need, hint, nudge }: { g: string; d: Draft; need: boolean; hint: string; nudge: () => void }) {
  const grp = E().mods[g]
  const full = grpCount(d, g) >= grpMax(g)
  // Locked until the earlier required step is finished: greyed out; a tap leads the guest to that step.
  const locked = stepLocked(d, g)
  return (
    <section
      className={`grp r44-grp${need ? ' grp-need' : ''}`}
      id={`grp-${g}`}
      role="group"
      aria-labelledby={`grpl-${g}`}
      aria-disabled={locked || undefined}
      data-locked={locked || undefined}
      style={{ opacity: locked ? 0.38 : 1, filter: locked ? 'grayscale(1)' : undefined, transition: 'opacity 250ms ease, filter 250ms ease' }}
      onClickCapture={
        locked
          ? (e) => {
              e.stopPropagation()
              e.preventDefault()
              nudge()
            }
          : undefined
      }
    >
      <R44Head title={<span id={`grpl-${g}`}>{L(grp.label)}</span>} note={grp.req ? 'req' : 'opt'} rule={ruleText(g)} numbered />
      <div id={`hint-${g}`} className="reqHint r44-hint" role="status" aria-live="polite">
        {hint}
      </div>
      <div className="r44-exg">
        {grp.items.map((it) => (
          <StepTile key={it.id} g={g} it={it} d={d} full={full} />
        ))}
      </div>
    </section>
  )
}

/**
 * A multi-pick modifier wizard (API, max > 1) in the choice-group chip layout (2026-10-20, Alex: no pictures for
 * modifiers): numbered header with the "kies 1–4" rule, chips that toggle, each option at most once, a full step
 * refuses new chips, a locked step (earlier required step unfinished) nudges the guest there.
 */
function ChipStepSection({ g, d, need, hint, nudge }: { g: string; d: Draft; need: boolean; hint: string; nudge: () => void }) {
  const a = useEngine(useShallow((s) => ({ pick: s.pick, pickQty: s.pickQty })))
  const grp = E().mods[g]
  const full = grpCount(d, g) >= grpMax(g)
  const locked = stepLocked(d, g)
  // An option that may be taken more than once (upsell: its own MaxSelection) cycles on each tap: 1 → 2 → … → max → off.
  const tap = (id: string) => {
    const q = exQty(d, g, id)
    const max = exMax(id, g)
    if (q === 0) a.pick(g, id)
    else if (q < max) a.pickQty(g, id, 1)
    else a.pickQty(g, id, -q)
  }
  return (
    <section
      className={`grp r44-grp${need ? ' grp-need' : ''}`}
      id={`grp-${g}`}
      role="group"
      aria-labelledby={`grpl-${g}`}
      aria-disabled={locked || undefined}
      data-locked={locked || undefined}
      style={{ opacity: locked ? 0.38 : 1, filter: locked ? 'grayscale(1)' : undefined, transition: 'opacity 250ms ease, filter 250ms ease' }}
      onClickCapture={
        locked
          ? (e) => {
              e.stopPropagation()
              e.preventDefault()
              nudge()
            }
          : undefined
      }
    >
      <R44Head title={<span id={`grpl-${g}`}>{L(grp.label)}</span>} note={grp.req ? 'req' : 'opt'} rule={ruleText(g)} numbered />
      <div id={`hint-${g}`} className="reqHint r44-hint" role="status" aria-live="polite">
        {hint}
      </div>
      <div className="r44-opts" style={{ gridTemplateColumns: `repeat(${r44Cols(grp.items)},minmax(0,1fr))` }}>
        {grp.items.map((it) => {
          const q = exQty(d, g, it.id)
          const on = q > 0
          const na = optionUnavailable(g, it.id)
          const blocked = !on && (full || na)
          const max = exMax(it.id, g)
          return (
            <button
              key={it.id}
              type="button"
              data-a={blocked ? 'r44Blocked' : 'pick'}
              aria-pressed={on}
              aria-disabled={blocked ? true : undefined}
              aria-label={max > 1 ? `${L(it.name)} ×${q}` : undefined}
              className={`press optBtn r44-opt${blocked ? ' blk' : ''}`}
              onClick={() => !blocked && tap(it.id)}
            >
              <span className="r44-ol">
                <span className="r44-on">
                  {L(it.name)}
                  {q > 1 ? <span className="num"> ×{q}</span> : null}
                </span>
                {na ? <span className="r44-os text-ember">{t('unavailT')}</span> : it.sub ? <span className="r44-os">{L(it.sub)}</span> : null}
              </span>
              {it.price ? (
                <span className="r44-op hd num">
                  {it.price > 0 ? '+' : ''}
                  {fmt(it.price)}
                </span>
              ) : null}
              <span className="r44-ck" aria-hidden="true">
                <Ic n="check" sw={3} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// Referenced so the kept tile section compiles while unused (see the revert note at the step rendering).
void StepSection

function EnhTile({ v, d }: { v: CmsItem; d: Draft }) {
  const exQtyAct = useEngine((s) => s.exQty)
  const g = E().roleGroup[v.role]
  const q = exQty(d, g, v.id)
  const max = exMax(v.id)
  const name = L(v.title)
  const sub = [v.qtyLabel ? L(v.qtyLabel) : '', v.description ? L(v.description) : ''].filter(Boolean).join(' · ')
  return (
    <div className={`r44-ex${q ? ' on' : ''}`} data-ex={v.id}>
      <div className="r44-ex-img">
        <FoodImg p={{ img: v.img, em: v.em || '🥢', tint: v.tint, tint2: v.tint2, cut: v.cut }} cls="absolute inset-0" em="64px" />
      </div>
      <div className="r44-ex-b">
        <div className="hd r44-ex-n">{name}</div>
        <div className="r44-ex-s">{sub}</div>
        <div className="r44-ex-row">
          <span className="r44-ex-p hd num">+ {fmt(priceOf(v))}</span>
          {q > 0 ? (
            <span className="ob-stp r44-exstp" role="group" aria-label={tf('qtyOfA', { name, n: q })}>
              <button type="button" data-a="exQty" className="press ob-m" aria-label={q === 1 ? t('obRemove') : t('obLess')} onClick={() => exQtyAct(v.id, -1)}>
                {q === 1 ? (
                  <span className="ob-tr">
                    <Ic n="trash" sw={2.3} />
                  </span>
                ) : (
                  <span className="ob-bar" />
                )}
              </button>
              <span className="ob-sq num" aria-live="polite">
                {q}
              </span>
              <button type="button" data-a="exQty" className={`press ob-p${q >= max ? ' off' : ''}`} aria-label={t('obMore')} aria-disabled={q >= max ? true : undefined} onClick={() => exQtyAct(v.id, 1)}>
                <span className="ob-i">
                  <Ic n="plus" sw={2.6} />
                </span>
              </button>
            </span>
          ) : (
            <button type="button" data-a="exQty" className="press ob" aria-label={tf('obAddA', { name })} onClick={() => exQtyAct(v.id, 1)}>
              <span className="ob-i">
                <Ic n="plus" sw={2.6} />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EnhSection({ xp, d }: { xp: Experience; d: Draft }) {
  const toggle = useEngine((s) => s.r44ExToggle)
  const vuMore = useEngine((s) => s.vuMore)
  if (!xp.allEnhancements.length) return null
  const open = !!d._more?.enhOpen
  const expanded = !!d._more?.enh
  const all = xp.allEnhancements.length
  const list = expanded ? xp.allEnhancements : xp.productEnhancements.slice(0, 3)
  const sel = xp.allEnhancements.map((v) => ({ v, q: exQty(d, E().roleGroup[v.role], v.id) })).filter((x) => x.q > 0)
  const sum = sel.length ? sel.map((x) => (x.q > 1 ? x.q + '× ' : '') + L(x.v.title)).join(' · ') : t('r44NoneSel')
  const extra = sel.reduce((a, x) => a + priceOf(x.v) * x.q, 0)
  return (
    <section className={`grp r44-grp r44-exs${open ? ' open' : ''}`} id="vuX" aria-label={L(xp.sectionEnh.title)}>
      <button type="button" data-a="r44ExToggle" className="press r44-exh" aria-expanded={open} aria-controls="vuXBody" onClick={toggle}>
        <span className="r44-exh-t">
          <span className="hd">{L(xp.sectionEnh.title)}</span>
          <span className="r44-note">· {t('r44Opt')}</span>
        </span>
        <span className={`r44-exh-s${sel.length ? ' has' : ''}`}>
          {sum}
          {extra ? <b className="num"> + {fmt(extra)}</b> : null}
        </span>
        <span className="r44-exh-i">
          <Ic n="chevR" sw={2.6} />
        </span>
      </button>
      <div id="vuXBody" className="r44-exbody" hidden={!open}>
        <div className="r44-exg">
          {list.map((v) => (
            <EnhTile key={v.id} v={v} d={d} />
          ))}
        </div>
        {all > 3 ? (
          <button type="button" data-a="vuMore" className="press r44-more" onClick={() => vuMore('enh')}>
            {expanded ? t('showLess') : tf('r44AllEx', { n: all })}
          </button>
        ) : null}
      </div>
    </section>
  )
}

function DrinkUpCard({ v, d }: { v: CmsItem; d: Draft }) {
  const pickDrink = useEngine((s) => s.pickDrink)
  const dr = mustId(v.pid!)
  const on = d.drink === v.pid
  return (
    <button type="button" data-a="pickDrink" aria-pressed={on} className={`press vu-card drink-up flex flex-col overflow-hidden rounded-[22px] text-left ${on ? 'vu-on' : ''}`} onClick={() => pickDrink(v.pid!)}>
      <span className="vu-ring" aria-hidden="true" />
      <div className="relative flex-none w-full h-[300px] drink-shot">
        {dr.img ? <img src={dr.img} alt="" className="drink-img" loading="lazy" decoding="async" onError={(e) => e.currentTarget.remove()} /> : <span className="grid place-items-center h-full text-[80px]">{dr.em}</span>}
        <span className="vu-check" aria-hidden="true">
          <Ic n="check" sw={3} />
        </span>
      </div>
      <div className="p-5 pt-4 flex-1 flex flex-col w-full">
        <div className="hd text-[26px] leading-[28px] tracking-[.03em]">{pname(dr)}</div>
        {v.description ? <div className="text-[18px] text-mute font-medium leading-[23px] clamp2 mt-1">{L(v.description)}</div> : null}
        <div className="num text-[26px] font-extrabold mt-2">+ {fmt(priceOf(v))}</div>
        <span className="vu-cta vu-ctaS h-[68px] rounded-full grid text-[19px] font-bold mt-3">
          <span className="vu-c0">{t('vuChoose')}</span>
          <span className="vu-c1">
            <span className="w-5 h-5">
              <Ic n="check" sw={3} />
            </span>
            {t('vuChosen')}
          </span>
        </span>
      </div>
    </button>
  )
}

function DrinkInclChip({ id, d }: { id: string; d: Draft }) {
  const pickDrink = useEngine((s) => s.pickDrink)
  const dr = mustId(id)
  const on = d.drink === id
  return (
    <button type="button" data-a="pickDrink" aria-pressed={on} className={`press drink-chip flex items-center gap-4 rounded-[18px] text-left ${on ? 'on' : ''}`} onClick={() => pickDrink(id)}>
      <span className="drink-chip-img flex-none">{dr.img ? <img src={dr.img} alt="" loading="lazy" decoding="async" onError={(e) => e.currentTarget.remove()} /> : <span className="text-[30px]">{dr.em}</span>}</span>
      <span className="flex-1 min-w-0 text-[21px] font-semibold leading-[25px]">{pname(dr)}</span>
      <span className="drink-ck flex-none w-9 h-9 rounded-full grid place-items-center" aria-hidden="true">
        <span className="w-5 h-5">
          <Ic n="check" sw={3.2} />
        </span>
      </span>
    </button>
  )
}

function DrinksBlock({ d, vDrinks }: { d: Draft; vDrinks: CmsItem[] }) {
  const picked = byId(d.drink)
  const extra = drinkUp(d.drink)
  return (
    <div id="vuDrinks" className="mt-7">
      <div className="hd text-[34px] leading-[38px] tracking-[.03em]">{t('menuDrink')}</div>
      <div className="text-[20px] text-mute font-medium mt-1">{t('menuDrinkS')}</div>
      {vDrinks.length ? (
        <div className="mt-7">
          <div className="hd text-[30px] leading-[34px] tracking-[.03em]">{t('drinkUpgradeT')}</div>
          <div className="text-[19px] text-mute font-medium mt-1">{t('drinkUpgradeS')}</div>
          <div className="grid grid-cols-2 gap-5 mt-4">
            {vDrinks.map((v) => (
              <DrinkUpCard key={v.id} v={v} d={d} />
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-7">
        <div className="hd text-[30px] leading-[34px] tracking-[.03em]">{t('drinkInclT')}</div>
        <div className="text-[19px] text-mute font-medium mt-1">{t('drinkInclS')}</div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {E().menuDeal.drinks.map((id) => (
            <DrinkInclChip key={id} id={id} d={d} />
          ))}
        </div>
      </div>
      <div id="drinkPicked" className="mt-6 rounded-[20px] bg-card shadow-soft px-6 py-5 flex items-center gap-5" role="status" aria-live="polite">
        <div className="flex-1 min-w-0">
          <div id="drinkPickedName" className="text-[22px] font-bold truncate">
            {tf('drinkPickedT', { name: picked ? pname(picked) : '—' })}
          </div>
          <div className="text-[18px] text-mute font-medium mt-0.5">{t('drinkPickedS')}</div>
        </div>
        <span id="drinkPickedTag" className="bkv flex-none h-[56px] px-6 rounded-full bg-jade/10 text-jade text-[19px] font-bold grid place-items-center">
          <span className="bkv-c">{extra ? `+ ${fmt(extra)}` : t('inclLabel')}</span>
        </span>
      </div>
    </div>
  )
}

function MenuWrap({ p, d, xp }: { p: Product; d: Draft; xp: Experience }) {
  const vuMenu = useEngine((s) => s.vuMenu)
  const v = xp.menuUpgrade!
  if (d.menu)
    return (
      <div className="mt-6" id="vuMenuWrap">
        <div id="vuMenuCard" className="vu-menu-sum rounded-[24px] px-6 py-5 flex items-center gap-5 text-white" aria-pressed="true" data-a="vuMenu" role="button" tabIndex={0} onClick={vuMenu}>
          <span className="flex-none w-[56px] h-[56px] rounded-full bg-white/20 grid place-items-center">
            <span className="w-7 h-7">
              <Ic n="check" sw={3.2} />
            </span>
          </span>
          <span className="flex-1 min-w-0">
            <span className="hd block text-[30px] leading-[32px] tracking-[.04em]">{t('vuMenuAdded')}</span>
            <span className="block text-[19px] font-medium opacity-90 mt-0.5 truncate">{L(v.incl)}</span>
          </span>
          <span className="flex-none text-right">
            <span className="num block text-[28px] font-extrabold">{tf('menuPriceA', { price: fmt(menuTotalOf(p, d)) })}</span>
            <span className="block text-[17px] font-bold underline underline-offset-4 opacity-90">{t('menuRemove')}</span>
          </span>
        </div>
        <DrinksBlock d={d} vDrinks={xp.premiumDrinks} />
      </div>
    )
  const tot = menuTotalOf(p, d)
  return (
    <div className="r44-grp r44-offer-wrap" id="vuMenuWrap">
      <button type="button" id="vuMenuCard" data-a="vuMenu" className="press r44-offer" aria-pressed="false" onClick={vuMenu}>
        <span className="r44-of-ic">
          <Ic n="gift" sw={2} />
        </span>
        <span className="r44-of-tx">
          <span className="hd r44-of-t">{L(v.title)}</span>
          <span className="r44-of-s">{L(v.incl)}</span>
        </span>
        <span className="r44-of-pr">
          <span className="r44-of-plus num">+ {fmt(E().menuDeal.price)}</span>
          <span className="r44-of-tot hd num">{fmt(tot)}</span>
        </span>
        <span className="ob" aria-hidden="true">
          <span className="ob-i">
            <Ic n="plus" sw={2.6} />
          </span>
        </span>
      </button>
    </div>
  )
}

function XsChip({ v, d }: { v: CmsItem; d: Draft }) {
  const vux = useEngine((s) => s.vux)
  const on = xsSelected(d, v.id)
  return (
    <button type="button" data-a="vux" aria-pressed={on} className={`press vu-card xs-chip flex items-center gap-4 rounded-[20px] text-left min-h-[112px] pr-4 ${on ? 'vu-on' : ''}`} onClick={() => vux(v.id)}>
      <span className="xs-ring" aria-hidden="true" />
      <div className="relative flex-none w-[112px] self-stretch rounded-l-[20px] overflow-hidden">
        <FoodImg p={{ img: v.img, em: v.em || '🥢', tint: v.tint, tint2: v.tint2, cut: v.cut }} cls="absolute inset-0" em="44px" />
      </div>
      <div className="flex-1 min-w-0 py-3">
        <div className="hd text-[22px] leading-[24px] tracking-[.03em]">{xsTitle(v, d)}</div>
        {v.qtyLabel ? <div className="text-[15px] leading-[18px] text-mute font-semibold">{L(v.qtyLabel)}</div> : null}
        <div className="num text-[21px] font-extrabold mt-0.5">+ {fmt(priceOf(v))}</div>
      </div>
      <span className="xs-ck flex-none w-[48px] h-[48px] grid place-items-center" style={{ borderRadius: (E().cms.brand?.controls?.radius ?? 12) + 'px' }} aria-hidden="true">
        <span className="xs-ck0 w-6 h-6">
          <Ic n="plus" sw={2.8} />
        </span>
        <span className="xs-ck1 w-6 h-6">
          <Ic n="check" sw={3} />
        </span>
      </span>
    </button>
  )
}

function XsSection({ d, xp }: { d: Draft; xp: Experience }) {
  const a = useEngine(useShallow((s) => ({ xsKeep: s.xsKeep, xsDrop: s.xsDrop })))
  const all = xp.allCrossSells.filter((v) => xsVisible(v, d))
  if (!all.length) return null
  const title = L(xp.sectionXs.title)
  const conflict = xp.menuUpgrade && d.menu && all.find((v) => xsConflicts(v, d) && xsSelected(d, v.id) && !xsPortion(d, v.id) && d._xsAsk === v.id)
  return (
    <section id="xsX" className="mt-8" aria-label={title}>
      <div className="flex items-baseline justify-between">
        <div className="hd text-[30px] leading-[34px] tracking-[.04em]">{title}</div>
      </div>
      <div className={`xs-row ${all.length <= 3 ? 'xs-fit' : ''} flex gap-4 mt-4 overflow-x-auto pb-2`}>
        {all.map((v) => (
          <XsChip key={v.id} v={v} d={d} />
        ))}
      </div>
      {conflict ? (
        <div id="xsConflict" className="mt-4 rounded-[20px] bg-card shadow-soft p-5 flex flex-wrap items-center gap-4" role="group">
          <div className="flex-1 min-w-[260px] text-[21px] font-semibold">{tf('xsConflictT', { name: L(conflict.title).toLowerCase() })}</div>
          <button type="button" data-a="xsKeep" className="press h-[64px] px-6 rounded-full bg-jade text-white text-[19px] font-bold" onClick={() => a.xsKeep(conflict.id)}>
            {t('xsKeep')}
          </button>
          <button type="button" data-a="xsDrop" className="press h-[64px] px-6 rounded-full text-[19px] font-bold text-ember" style={{ boxShadow: 'inset 0 0 0 2.5px rgb(var(--c-ember) / .5)' }} onClick={() => a.xsDrop(conflict.id)}>
            {t('xsDrop')}
          </button>
        </div>
      ) : null}
    </section>
  )
}

function Info({ p, d, xp, vu }: { p: Product; d: Draft; xp: Experience; vu: boolean }) {
  const a = useEngine(useShallow((s) => ({ openCustomize: s.openCustomize, openSheet: s.openSheet })))
  const n = (d.extras || []).filter(([g]) => g !== 'premX').length + (d.removes?.length || 0)
  return (
    <div className="r44-info">
      {(p.mods || []).length ? (
        <button type="button" data-a="openCustomize" className="press r44-row" onClick={a.openCustomize}>
          <span className="r44-row-t hd">{t('customize')}</span>
          <span className="r44-row-s">{t('yourWay')}</span>
          {n ? <span className="r44-row-n num">{n}</span> : null}
          <span className="r44-row-i">
            <Ic n="chevR" sw={2.4} />
          </span>
        </button>
      ) : null}
      <button type="button" data-a="openSheet" className="press r44-row" onClick={a.openSheet}>
        <span className="r44-row-t hd">{t('r44Allerg')}</span>
        <span className="r44-row-s">{t('r44AllergS')}</span>
        <span className="r44-row-i">
          <Ic n="chevR" sw={2.4} />
        </span>
      </button>
      {vu && xp.allCrossSells.filter((v) => xsVisible(v, d)).length ? (
        <div className="r44-row r44-row-x">
          <div className="r44-row-t hd">{t('r44Pair')}</div>
          <XsSection d={d} xp={xp} />
        </div>
      ) : null}
    </div>
  )
}

function UnavailBanner({ d }: { d: Draft }) {
  const a = useEngine(useShallow((s) => ({ fixXs: s.fixXs, fixMenu: s.fixMenu, fixOption: s.fixOption })))
  const naP = unavailParts(d)
  if (!naP.length) return null
  return (
    <div className="flex-none bg-ember text-white px-8 py-4" role="status">
      <div className="text-[22px] font-bold">{naP.map((x) => tf('unavailPart', { name: x.name })).join(' · ')}</div>
      {naP.some((x) => x.role !== 'main') ? (
        <div className="text-[18px] font-semibold opacity-90 mt-0.5">
          {tf('unavailPartsB', {
            list: naP
              .filter((x) => x.role !== 'main')
              .map((x) => x.name)
              .join(', '),
          })}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3 mt-3">
        {naP
          .filter((x) => x.fix)
          .map((x) =>
            x.fix === 'drink' ? (
              <button key={x.pid} type="button" className="press h-[60px] px-5 rounded-full bg-white text-ember text-[19px] font-bold" onClick={() => document.getElementById('vuDrinks')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                {t('changeDrink')}
              </button>
            ) : x.fix === 'xs' ? (
              <button key={x.pid} type="button" className="press h-[60px] px-5 rounded-full bg-white text-ember text-[19px] font-bold" onClick={() => a.fixXs(x.id!)}>
                {tf('removePart', { name: x.name })}
              </button>
            ) : x.fix === 'option' ? (
              <button key={x.group + ':' + x.id} type="button" className="press h-[60px] px-5 rounded-full bg-white text-ember text-[19px] font-bold" onClick={() => a.fixOption(x.group!, x.id!)}>
                {tf('removePart', { name: x.name })}
              </button>
            ) : (
              <button key={x.pid} type="button" className="press h-[60px] px-5 rounded-full bg-white text-ember text-[19px] font-bold" onClick={a.fixMenu}>
                {tf('removePart', { name: L(E().upsell.menuUpgrade.title) })}
              </button>
            ),
          )}
      </div>
    </div>
  )
}

/** The R44 product page. */
function ProductPage({ p, d, xp, editing, nudge, need, hint }: { p: Product; d: Draft; xp: Experience; editing: boolean; nudge: () => void; need: string | null; hint: string }) {
  const a = useEngine(useShallow((s) => ({ backProduct: s.backProduct, openSheet: s.openSheet, openPrice: s.openPrice, draftQty: s.draftQty, addOrder: s.addOrder })))
  const vu = xp.flowType === 'visual-upsell'
  const sv = servingsOf(p)
  const sizes = !!sv && sv.length > 1
  const req = xp.modificationGroups.filter((g) => g.required)
  const opt = xp.modificationGroups.filter((g) => !g.required)
  const ok = draftValid(d)
  const label = editing ? t('r44Save') : t('r44Add')
  return (
    <>
      <UnavailBanner d={d} />
      <div className="pdp-sheet r44">
        <div className="r44-top">
          <button type="button" data-a="backProduct" id="pdpBack" className="press r44-round" aria-label={t('back')} onClick={a.backProduct}>
            <span>
              <Ic n="chevL" sw={2.6} />
            </span>
          </button>
          <button type="button" data-a="openSheet" className="press r44-round" aria-label={t('r44Allerg')} onClick={a.openSheet}>
            <span>
              <Ic n="info" sw={2.2} />
            </span>
          </button>
        </div>
        <div className="scroller flex-1 r44-scroll">
          <div className="r44-intro">
            <div id="pdpHero" className="pdp-hero r44-hero">
              <HeroShot p={p} em="120px" />
            </div>
            <div className="r44-intro-t">
              <h1 className="hd r44-name">{pname(p)}</h1>
              <p className="r44-desc">{L(p.desc)}</p>
              <div className="hd r44-lbl" id="r44SizeLbl">
                {sizes ? tf('r44SelSize', { size: L(sv![servingIx(p, d)].short) }) : t('r44Price')}
              </div>
              <button type="button" data-a="openPrice" className="press hd num r44-price" aria-label={t('priceBreakdown')} onClick={a.openPrice}>
                <span id="r44Price" aria-live="polite">
                  {fmt(unitPrice(d))}
                </span>
              </button>
            </div>
          </div>
          <SizeSection p={p} d={d} />
          {req.map((g) => (
            <Group key={g.id} g={g.id} d={d} need={need === g.id} hint={need === g.id ? hint : ''} />
          ))}
          {opt.map((g) => (
            <Group key={g.id} g={g.id} d={d} need={false} hint="" />
          ))}
          {/* 2026-10-20 (Alex): upsell steps are drawn as the chip grid too, no pictures. To bring the picture tiles
              back for upsell collections, replace the line below with the commented branch (StepSection stays in
              the file for that):
              activeSteps(p, d).map((g) =>
                E().mods[g].ui === 'chips' ? <ChipStepSection key={g} … /> : <StepSection key={g} … />,
              ) */}
          {activeSteps(p, d).map((g) => (
            <ChipStepSection key={g} g={g} d={d} need={need === g} hint={need === g ? hint : ''} nudge={nudge} />
          ))}
          {vu ? <EnhSection xp={xp} d={d} /> : null}
          {vu && xp.menuUpgrade ? (
            <div className="r44-menu">
              <MenuWrap p={p} d={d} xp={xp} />
            </div>
          ) : null}
          <Info p={p} d={d} xp={xp} vu={vu} />
        </div>
        {p.infoOnly ? (
          // Information-only product (API NoInteraction, kiosk-product-checks.md §4): no quantity, no add.
          <div className="flex-none pdp-bottom r44-bar">
            <div id="ctaReason" className="r44-reason r44-info-only" role="status">
              {t('infoOnlyB')}
            </div>
          </div>
        ) : (
        <div className="flex-none pdp-bottom r44-bar">
          <div id="ctaReason" className="r44-reason" role="status" aria-live="polite">
            {ok ? '' : blockReason(d)}
          </div>
          <div className="r44-barrow">
            <div className="pdp-stp r44-qty">
              <Stepper qty={d.qty} onDelta={a.draftQty} h={64} keepMin max={lineMax(p)} />
            </div>
            <div className="relative flex-1" id="ctaWrap">
              <button type="button" data-a="addOrder" id="cfgCta" disabled={!ok} aria-disabled={!ok} className="press cta r44-cta" onClick={a.addOrder}>
                <span className="hd r44-cta-l">{label}</span>
                <span className="r44-dot" aria-hidden="true">
                  ·
                </span>
                <span id="cfgTot" className="bkv hd num r44-cta-t">
                  <span className="bkv-c">{fmt(pdpTotal(d))}</span>
                </span>
              </button>
              {ok ? null : <button type="button" data-a="cfgIncomplete" id="ctaVeil" className="cta-veil absolute inset-0 rounded-[22px]" aria-label={blockReason(d) || t('reqHint')} onClick={nudge} />}
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  )
}

/** Customize step: functional extras / removals, inside #pdp. */
function CustomizeStep({ p, d, xp }: { p: Product; d: Draft; xp: Experience }) {
  const a = useEngine(useShallow((s) => ({ mod: s.mod, backProduct: s.backProduct, confirmCustomize: s.confirmCustomize, openPrice: s.openPrice })))
  const custom0 = useEngine((s) => s.custom0)
  const shadow = new Set(xp.allEnhancements.flatMap((v) => v.shadows || []).map(([g, i2]) => g + ':' + i2))
  const dirty = !!(custom0 && stepKey(d) !== custom0)
  const row = (g: string, it: ModItem, kind: 'extra' | 'remove') => {
    const on = kind === 'extra' ? d.extras.some(([gg, ii]) => gg === g && ii === it.id) : d.removes.some(([gg, ii]) => gg === g && ii === it.id)
    return (
      <button key={it.id} type="button" data-a="mod" aria-pressed={on} className={`press w-full flex items-center gap-6 p-5 rounded-[22px] mb-3 bg-card shadow-soft ${on ? 'row-on' : ''}`} onClick={() => a.mod(kind, g, it.id)}>
        <span className="ck" />
        {it.em ? <span className="text-[36px]">{it.em}</span> : null}
        <span className="flex-1 text-left text-[25px] font-semibold">{L(it.name)}</span>
        {kind === 'extra' ? <span className={`num text-[23px] font-bold ${on ? 'text-jade' : 'text-mute'}`}>+ {fmt(it.price)}</span> : <span className="text-[21px] font-bold text-jade">{t('free')}</span>}
      </button>
    )
  }
  const summary = (() => {
    let base: { x?: string[]; r?: string[] } = {}
    try {
      base = JSON.parse(custom0 || '{}')
    } catch {
      base = {}
    }
    const was = new Set([...(base.x || []), ...(base.r || [])])
    const now = [...(d.extras || []).map(([g, i]) => [g, i, 'x'] as const), ...(d.removes || []).map(([g, i]) => [g, i, 'r'] as const)]
    const nm = (g: string, i: string) => {
      try {
        return L(E().mods[g].items.find((x) => x.id === i)!.name)
      } catch {
        return null
      }
    }
    const added = now.filter(([g, i]) => !was.has(g + ':' + i)).map(([g, i]) => nm(g, i)).filter(Boolean)
    const gone = [...(base.x || []), ...(base.r || [])]
      .filter((k) => !now.some(([g, i]) => g + ':' + i === k))
      .map((k) => {
        const [g, i] = k.split(':')
        return nm(g, i)
      })
      .filter(Boolean)
    return [...added, ...gone.map((n) => '− ' + n)].join(' · ')
  })()
  return (
    <>
      <div className="pdpBar flex-none h-[104px] px-5 flex items-center gap-4 text-white bg-ink">
        <button type="button" data-a="backProduct" id="pdpBack" aria-label={t('back')} className="press h-[76px] min-w-[76px] pl-3 pr-6 rounded-full flex items-center gap-3 hd text-[26px] tracking-[.1em]" onClick={a.backProduct}>
          <span className="w-10 h-10">
            <Ic n="arrL" sw={2.6} />
          </span>
          {t('back')}
        </button>
        <div className="flex-1 min-w-0 text-center hd text-[40px] tracking-[.04em] truncate px-3">{pname(p)}</div>
        <div className="min-w-[190px] text-right" aria-live="polite">
          <span id="pdpTot" className="bkv num text-[34px] font-extrabold text-pbright">
            <span className="bkv-c">{fmt(pdpTotal(d))}</span>
          </span>
        </div>
      </div>
      <div className="pdp-sheet">
        <div className="px-10 pt-6 pb-3 flex-none">
          <h1 className="hd text-[56px] tracking-[.02em]">{t('customize')}</h1>
          <div className="text-[22px] text-mute font-medium mt-1">{pname(p)}</div>
        </div>
        <div className="scroller flex-1 px-10 pt-4 pb-[200px]">
          {(p.mods || []).map((g) => {
            const grp = E().mods[g]
            const its = grp.items.filter((it) => !shadow.has(g + ':' + it.id))
            if (!its.length) return null
            return (
              <div key={g} className="mb-8">
                <div className="flex items-baseline gap-4 mb-4">
                  <div className="hd text-[26px] tracking-[.06em]">{L(grp.label)}</div>
                  <div className="text-[19px] text-mute font-semibold">{t('optional')}</div>
                </div>
                {its.map((it) => row(g, it, grp.type === 'extra' ? 'extra' : 'remove'))}
              </div>
            )
          })}
        </div>
        <div className="flex-none bg-card shadow-lift px-8 pt-3 pdp-bottom" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom,0px))' }}>
          <div id="stepInfo" className="flex items-end justify-between gap-6">
            <div className="min-w-0">
              {dirty ? (
                <>
                  <div className="text-[21px] font-semibold truncate">{summary || ' '}</div>
                  <div className="text-[18px] text-mute font-semibold truncate">
                    {t('priceBase')} {fmt(p.price)} · {t('priceExtras')} +{fmt(extrasSum(p, d))}
                  </div>
                </>
              ) : (
                <div className="text-[20px] text-mute font-semibold">{t('noChanges')}</div>
              )}
            </div>
            <div className="flex items-center gap-4 flex-none">
              <span id="cfgTot" className="bkv num text-[34px] font-extrabold">
                <span className="bkv-c">{fmt(pdpTotal(d))}</span>
              </span>
              <button type="button" data-a="openPrice" className="press h-[40px] text-[17px] font-bold text-jade underline underline-offset-4 flex-none" onClick={a.openPrice}>
                {t('priceBreakdown')}
              </button>
            </div>
          </div>
          <div className="relative mt-3" id="ctaWrap">
            {dirty ? (
              <button type="button" data-a="confirmCustomize" id="cfgCta" className="press cta w-full h-[104px] rounded-[22px] bg-jade text-white flex items-center justify-center gap-6" onClick={a.confirmCustomize}>
                <span className="hd text-[27px] tracking-[.12em]">{t('confirmChoices')}</span>
                <span className="w-9 h-9 flex-none">
                  <Ic n="check" sw={3} />
                </span>
              </button>
            ) : (
              <button type="button" data-a="confirmCustomize" id="cfgCta" className="press cta step-back w-full h-[104px] rounded-[22px] bg-paper text-jade flex items-center justify-center gap-6" onClick={a.confirmCustomize}>
                <span className="w-9 h-9 flex-none">
                  <Ic n="arrL" sw={2.6} />
                </span>
                <span className="hd text-[27px] tracking-[.12em]">{t('backToProduct')}</span>
              </button>
            )}
          </div>
          <div className="text-center text-[17px] text-mute font-semibold mt-2 min-h-[24px]">{dirty ? t('backAfterConfirm') : ' '}</div>
        </div>
      </div>
    </>
  )
}

/** Price breakdown rows (price sheet). */
export function PriceRows({ p, d }: { p: Product; d: Draft }) {
  const rows = priceLines(p, d)
  const xs = (d.crossSells || []).map((x) => ({ sel: x, v: cmsById(x.id) })).filter((x) => x.v)
  return (
    <>
      {rows.map(([n, v, plus], i) => (
        <div key={i} className={`flex justify-between gap-6 py-1.5 text-[22px] ${plus ? 'text-ink/80' : 'font-semibold'}`}>
          <span className="truncate">{n}</span>
          <span className="num flex-none">
            {plus ? '+ ' : ''}
            {fmt(v)}
          </span>
        </div>
      ))}
      {d.qty > 1 ? (
        <div className="flex justify-between gap-6 py-1.5 text-[22px] text-ink/80">
          <span>{t('qty')}</span>
          <span className="num">
            × {d.qty} = {fmt(unitPrice(d) * d.qty)}
          </span>
        </div>
      ) : null}
      {xs.length ? (
        <>
          <div className="hair mt-3 pt-3 text-[18px] hd tracking-[.1em] text-mute">{t('priceSide')}</div>
          {xs.map(({ sel, v }) => (
            <div key={sel.id} className="flex justify-between gap-6 py-1.5 text-[22px] text-ink/80">
              <span className="truncate">
                {xsTitle(v!, d)} × {sel.quantity}
                {v!.qtyLabel ? ` · ${L(v!.qtyLabel)}` : ''}
              </span>
              <span className="num flex-none">+ {fmt(priceOf(v!) * sel.quantity)}</span>
            </div>
          ))}
        </>
      ) : null}
      <div className="hair mt-3 pt-3 flex justify-between hd text-[30px] tracking-[.04em]">
        <span>{t('total')}</span>
        <span className="num">{fmt(unitPrice(d) * d.qty + xsSum(d))}</span>
      </div>
    </>
  )
}

/** A group is done when its choice is made (single select) or its maximum is reached (multi select). */
function groupDone(d: Draft, g: string): boolean {
  if (!E().mods[g]) return false
  return isStep(g) ? grpCount(d, g) >= grpMax(g) : !!d.choices[g]
}

/**
 * Auto-advance (Alex, 2026-10-26): when a tap completes an option group, the next group scrolls to the top of the
 * product page. Only a group that turns done after the page opened counts — opening with an option already chosen
 * (a Special tile) does not move the page. The scroll is smooth and skipped when there is no next group.
 */
function useAutoAdvance(pid: string | null, draft: Draft | null) {
  const prev = useRef<{ pid: string | null; done: Set<string> }>({ pid: null, done: new Set() })
  useEffect(() => {
    if (!pid || !draft) {
      prev.current = { pid: null, done: new Set() }
      return
    }
    const groups = Array.from(document.querySelectorAll<HTMLElement>('#pdp section.r44-grp[id^="grp-"]'))
    const done = new Set(groups.map((el) => el.id.slice(4)).filter((g) => groupDone(draft, g)))
    const before = prev.current
    prev.current = { pid, done }
    if (before.pid !== pid) return // page just opened (or another product): remember, do not scroll
    const fresh = groups.findIndex((el) => done.has(el.id.slice(4)) && !before.done.has(el.id.slice(4)))
    if (fresh < 0) return
    const next = groups[fresh + 1]
    const scroller = next?.closest<HTMLElement>('.r44-scroll')
    if (!next || !scroller) return
    // The kiosk stage is drawn scaled (Stage.tsx): screen distances ÷ scale = scroll distances.
    const scale = scroller.getBoundingClientRect().height / (scroller.offsetHeight || 1) || 1
    const sTop = scroller.getBoundingClientRect().top
    // Stop just below the floating back / info buttons that sit over the top of the page.
    const back = document.querySelector<HTMLElement>('#pdp [data-a="backProduct"]')
    const cover = back && !scroller.contains(back) ? Math.max(0, (back.getBoundingClientRect().bottom - sTop) / scale) : 0
    const top = (next.getBoundingClientRect().top - sTop) / scale + scroller.scrollTop - cover - 12
    // Let the tapped chip show its selected state first.
    const t = setTimeout(() => scroller.scrollTo({ top, behavior: 'smooth' }), 180)
    return () => clearTimeout(t)
  }, [pid, draft])
}

export function Pdp() {
  const pid = useEngine((s) => s.pid)
  const draft = useEngine((s) => s.draft)
  const editing = useEngine((s) => s.editing)
  const step = useEngine((s) => s.pdpStep)
  const cart = useEngine((s) => s.cart)
  const [need, setNeed] = useState<string | null>(null)
  const [hint, setHint] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])
  useAutoAdvance(pid, draft)
  if (!pid || !draft) return null
  const p = mustId(pid)
  const xp = draftExperience({ cart, editing, draft, pid } as Pick<EngineState, 'cart' | 'editing' | 'draft' | 'pid'>)
  const vu = xp.flowType === 'visual-upsell'
  const nudge = () => {
    if (draft.menu && !draft.drink && !firstIncomplete(draft)) {
      document.getElementById('vuDrinks')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const g = firstIncomplete(draft)
    if (!g) return
    document.getElementById('grp-' + g)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setNeed(g)
    setHint(tf('r44Need', { group: L(E().mods[g].label) }))
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setNeed(null), E().brand.motion.reqHighlight ?? 1400)
  }
  return (
    <div id="pdp" className={`pdp pdp-r44 ${vu ? 'pdp-vu' : 'pdp-mod'}`} role="dialog" aria-modal="true" aria-label={pname(p)}>
      <div className="pdp-scrim" aria-hidden="true" />
      {step === 'customize' ? <CustomizeStep p={p} d={draft} xp={xp} /> : <ProductPage p={p} d={draft} xp={xp} editing={!!editing} nudge={nudge} need={need} hint={hint} />}
    </div>
  )
}
