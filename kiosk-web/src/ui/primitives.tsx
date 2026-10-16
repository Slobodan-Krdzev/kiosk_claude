// Shared building blocks, each a faithful port of a reference render helper.

import type { CSSProperties, ReactNode } from 'react'
import { fmt } from '../engine/money'
import { E, L, t, tf } from '../engine/state'
import type { L10n, Lang, Product } from '../engine/types'
import { MAX_LINE_QTY } from '../engine/types'
import { useEngine } from '../store/engine'

// ---------- icons ----------

export function Ic({ n, cls = '', sw = 2.1 }: { n: string; cls?: string; sw?: number }) {
  const d = E().icons[n]
  return (
    <svg viewBox="0 0 24 24" className={cls} width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision">
      <path d={d} />
    </svg>
  )
}

export function IcQR() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
      <path d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm12-2h2v2h-2v-2Zm2 2h2v2h-2v-2Zm-2 2h2v2h-2v-2Zm-2-2h2v2h-2v-2Zm0 4h2v4h-2v-4Zm4 2h4v2h-4v-2Zm2-4h2v2h-2v-2Z" />
    </svg>
  )
}

// ---------- food imagery ----------

export interface FoodLike {
  img?: string
  em?: string
  tint?: string
  tint2?: string
  cut?: boolean
  z?: string
  _pos?: string
  _eager?: boolean
}

export function FoodImg({ p, cls = '', em = '110px', style }: { p: FoodLike; cls?: string; em?: string; style?: CSSProperties }) {
  const st: CSSProperties = { ['--tint' as string]: p.tint || '#EFE7D4', ['--tint2' as string]: p.tint2 || p.tint || '#E0D4BC', ['--em' as string]: em, ...style }
  return (
    <div className={`fimg ${p.cut ? 'fimg-cut ' : ''}${cls}`} style={st}>
      <div className="femoji">{p.em || '🍽'}</div>
      {p.img ? (
        <img
          src={p.img}
          alt=""
          className={p.z || undefined}
          style={p._pos ? { objectPosition: p._pos } : undefined}
          loading={p._eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={(e) => e.currentTarget.remove()}
        />
      ) : null}
    </div>
  )
}

/** Detail-page hero: free-standing dish on the paper background. */
export function HeroShot({ p, em = '170px' }: { p: FoodLike; em?: string }) {
  return (
    <div className="hero-shot" style={{ ['--tint' as string]: p.tint || '#F8F5EE', ['--em' as string]: em }}>
      {p.img ? <img src={p.img} alt="" className="hero-img" loading="eager" decoding="async" onError={(e) => e.currentTarget.remove()} /> : <span className="hero-emoji">{p.em || '🍽'}</span>}
    </div>
  )
}

// ---------- badges ----------

export function Badges({ p, cls = 'top-4 left-4', sm = false }: { p: Product; cls?: string; sm?: boolean }) {
  if (!p.badges?.length) return null
  const bdg = E().bdg
  return (
    <div className={`absolute ${cls} flex gap-2.5 z-10`}>
      {p.badges.map((b) => (
        <span key={b} className={`badge ${sm ? 'badge-sm' : ''} ${bdg[b]?.[0] ?? ''}`}>
          {t(bdg[b]?.[1] ?? b)}
        </span>
      ))}
    </div>
  )
}

// ---------- language pills ----------

export function LangPills({ dark = false }: { dark?: boolean }) {
  const lang = useEngine((s) => s.lang)
  const setLang = useEngine((s) => s.setLang)
  const b = E().brand
  return (
    <div className={`flex gap-2.5 p-2 rounded-full ${dark ? 'bg-ink/60' : 'bg-shade'}`}>
      {b.languages.map((id: Lang) => {
        const on = lang === id
        return (
          <button
            key={id}
            type="button"
            data-a="lang"
            aria-pressed={on}
            onClick={() => setLang(id)}
            className={`press h-[60px] px-5 rounded-full flex items-center gap-2 text-[18px] font-semibold leading-[24px] ${on ? (dark ? 'bg-cream text-ink' : 'bg-ink text-cream') : dark ? 'text-white/85' : 'text-ink/70'}`}
          >
            <span className="text-[24px]">{E().flags[id]}</span>
            {id.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}

// ---------- quantity control (gt-stp) ----------

export const CTL_R = (): number => (E().cms.brand?.controls || { radius: 12 }).radius

export function Stepper({
  qty,
  onDelta,
  h = 72,
  keepMin = false,
  name,
  max = MAX_LINE_QTY,
}: {
  qty: number
  onDelta: (d: number) => void
  h?: number
  keepMin?: boolean
  name?: string
  /** Per-product cap (lineMax); defaults to the engine's limit. */
  max?: number
}) {
  const atMax = qty >= Math.min(max, MAX_LINE_QTY)
  const atMin = qty <= 1
  const minIcon = atMin && !keepMin ? 'trash' : 'minus'
  return (
    <span className="gt-stp" style={{ ['--stp-h' as string]: `${h}px`, ['--stp-r' as string]: `${CTL_R()}px` }} role="group" aria-label={`${t('qty')}: ${qty}`}>
      <button
        type="button"
        className={`press gt-stp-b ${atMin && keepMin ? 'off' : ''}`}
        aria-label={atMin && !keepMin ? (name ? tf('removeA', { name }) : t('removeItem')) : t('qtyDown')}
        aria-disabled={atMin && keepMin ? true : undefined}
        onClick={() => onDelta(-1)}
      >
        <span className="w-7 h-7">
          <Ic n={minIcon} sw={2.8} />
        </span>
      </button>
      <span className="gt-stp-q num">{qty}</span>
      <button type="button" className={`press gt-stp-b ${atMax ? 'off' : ''}`} aria-label={t('qtyUp')} aria-disabled={atMax ? true : undefined} onClick={() => onDelta(1)}>
        <span className="w-7 h-7">
          <Ic n="plus" sw={2.8} />
        </span>
      </button>
    </span>
  )
}

// ---------- small text helpers ----------

export function Money({ v }: { v: number }) {
  return <>{fmt(v)}</>
}

export function Txt({ v }: { v: L10n | undefined }) {
  return <>{L(v)}</>
}

export function Section({ children }: { children: ReactNode }) {
  return <>{children}</>
}
