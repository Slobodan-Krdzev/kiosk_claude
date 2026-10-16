import { useShallow } from 'zustand/shallow'
// Home / menu shell: side rail, featured page, category page, basket bar. Ports of rail(), homeMain(), menuMain(), bottomBar().

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { baseTotal, cartCount, cartTotal, rewardClaimed, rewardLeft } from '../engine/cart'
import { alHidden, byId, catLabel, catOf, homeHasContent, obVarCard, pname, prodsInCards, venueMenu, venueName, visible } from '../engine/catalog'
import { cmsAddable, cmsFinishBlock, obwMode, presentationFor } from '../engine/cms'
import { fmt } from '../engine/money'
import { E, L, t, tf } from '../engine/state'
import type { Product, Promo } from '../engine/types'
import { useEngine } from '../store/engine'
import { CompactCard, FinishItem, ProductCard, ProductWide } from './cards'
import { FoodImg, Ic, LangPills } from './primitives'

const SIDEBAR_FALLBACK = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}brand/img/plateTer.webp`

export function Rail() {
  const b = E().brand
  const screen = useEngine((s) => s.screen)
  const cat = useEngine((s) => s.cat)
  const a = useEngine(useShallow((s) => ({ home: s.home, goCat: s.goCat, attract: s.attract })))
  const navRef = useRef<HTMLDivElement>(null)
  const indRef = useRef<HTMLDivElement>(null)
  const homeish = screen === 'home' || (screen === 'menu' && cat === 'new')

  useLayoutEffect(() => {
    const nav = navRef.current
    const ind = indRef.current
    if (!nav || !ind) return
    const sel = homeish ? '[data-a="home"]' : `[data-a="cat"][data-cat="${cat}"]`
    const btn = nav.querySelector<HTMLElement>(sel)
    if ((screen === 'menu' || screen === 'home') && btn) {
      ind.style.opacity = '1'
      ind.style.transform = `translateY(${btn.offsetTop}px)`
      ind.style.top = '0px'
      ind.style.height = btn.offsetHeight + 'px'
    } else ind.style.opacity = '0'
  }, [screen, cat, homeish])

  const row = (key: string, dataA: string, extra: Record<string, string>, on: boolean, icon: string, label: string, onClick: () => void, two = false) => (
    <button
      key={key}
      type="button"
      data-a={dataA}
      {...extra}
      aria-label={label}
      aria-current={on ? 'true' : undefined}
      onClick={onClick}
      className={`press relative z-10 w-full h-[84px] pl-[22px] pr-[56px] flex items-center gap-4 text-left text-cream/[.78] ${on ? 'rowOn' : ''} ${two ? 'nav-two' : ''}`}
    >
      <span className="nav-ico flex-none">
        <Ic n={icon} sw={1.9} />
      </span>
      <span className="nav-lbl hd">{label}</span>
      <span className="nav-chk" aria-hidden="true">
        <Ic n="check" sw={3} />
      </span>
    </button>
  )

  const sb = b.sidebar
  // API menu: the venue's logo and name, no brand photo / taglines (audit F10).
  const venue = venueMenu()
  const logo = venue ? E().venue!.logoImg : b.logoImg
  return (
    <nav id="railSide" className="flex-none relative z-20 flex flex-col text-cream overflow-hidden" style={{ width: b.layout.sidebarWidth, boxShadow: '16px 0 40px -18px rgba(20,17,12,.38)' }}>
      <div className="absolute inset-0" style={{ background: !venue && sb.backgroundType === 'color' ? sb.backgroundColor : 'radial-gradient(120% 90% at 50% 0%, #26211A 0%, #191713 72%)' }}>
        {!venue && sb.backgroundType === 'image' ? (
          <img
            src={SIDEBAR_FALLBACK}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: sb.focalPoint ? `${sb.focalPoint.x}% ${sb.focalPoint.y}%` : sb.backgroundPosition || 'center' }}
            onError={(e) => e.currentTarget.remove()}
          />
        ) : null}
        {(sb.overlayOpacity ?? 0) > 0 ? <div className="absolute inset-0" style={{ background: sb.overlayColor, opacity: sb.overlayOpacity }} /> : null}
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <button type="button" data-a="attract" aria-label={venue ? venueName() || t('navHome') : b.name} className="press pt-8 pb-4 px-4 grid place-items-center flex-none" onClick={a.attract}>
          {logo ? <img src={logo} alt={venue ? venueName() : b.name} style={{ height: 52, maxWidth: '100%', objectFit: 'contain', filter: venue ? 'drop-shadow(0 2px 8px rgba(0,0,0,.6))' : b.logoFilter || 'invert(1) brightness(1.7)' }} /> : <span className="hd text-[22px] tracking-[.1em]">{venueName()}</span>}
          {venue ? null : <span className="hd text-[11px] tracking-[.4em] text-cream/80 mt-2">– {b.copy.logoTagline} –</span>}
        </button>
        <div id="railNav" className="relative flex-none" ref={navRef}>
          <div id="railInd" ref={indRef} />
          {homeHasContent() ? row('home', 'home', {}, homeish, 'home', t('navHome'), a.home) : null}
          {b.features.loyalty ? row('rewards', 'cat', { 'data-cat': 'rewards' }, cat === 'rewards' && screen === 'menu', 'gift', t('lty_nav'), () => a.goCat('rewards')) : null}
          <div className="text-[14px] font-bold leading-[20px] tracking-[3px] uppercase pl-[22px] pt-4 pb-2 flex-none" style={{ color: 'rgb(var(--c-cream) / .58)' }}>
            {t('menuLbl')}
          </div>
          {E().cats.map((c) => row(c.id, 'cat', { 'data-cat': c.id }, cat === c.id && screen === 'menu', c.icon, catLabel(c.id), () => a.goCat(c.id), !!c.two))}
        </div>
        <div className="flex-1" />
        {venue ? null : (
        <div
          className="flex-none text-center pb-7"
          style={{ fontFamily: 'var(--f-accent)', fontSize: 30, lineHeight: 1.1, color: 'rgb(var(--c-cream))', transform: 'rotate(-4deg)', textShadow: '0 2px 12px rgba(0,0,0,.5)' }}
        >
          {L(b.copy.sub)
            .split('\n')
            .map((l, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {l}
              </span>
            ))}{' '}
          {b.copy.subIcon != null ? b.copy.subIcon : '🌿'}
        </div>
        )}
      </div>
    </nav>
  )
}

export function AlFilterBtn() {
  const n = useEngine((s) => s.allergenFilter.length)
  const open = useEngine((s) => s.openAlFilter)
  return (
    <button
      type="button"
      data-a="openAlFilter"
      aria-pressed={n > 0}
      aria-label={t('alFilterBtn') + (n ? ' · ' + tf('alActive', { n }) : '')}
      onClick={open}
      className={`press h-[56px] px-5 rounded-full flex items-center gap-2.5 text-[18px] font-bold whitespace-nowrap flex-none ${n ? 'bg-ember text-white' : 'bg-card shadow-soft text-ink/80'}`}
    >
      <span className="w-6 h-6 flex-none">
        <Ic n="info" sw={2.2} />
      </span>
      <span>{t('alFilterBtn')}</span>
      {n ? (
        <span className="ml-1 min-w-[28px] h-[28px] px-2 rounded-full bg-white text-ember num text-[16px] font-extrabold grid place-items-center" aria-hidden="true">
          {n}
        </span>
      ) : null}
    </button>
  )
}

function TopBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-7 flex-none topbar">
      <div className="text-[16px] font-semibold leading-[22px] tracking-[4px] uppercase text-mute">{venueMenu() ? venueName() : E().brand.copy.tagline}</div>
      <div className="flex items-center gap-3">
        <AlFilterBtn />
        <LangPills />
      </div>
    </div>
  )
}

function useScroller(key: string) {
  const ref = useRef<HTMLDivElement>(null)
  const saveScroll = useEngine((s) => s.saveScroll)
  const homeScroll = useEngine((s) => s.homeScroll)
  const menuScroll = useEngine((s) => s.menuScroll)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (key === 'home') el.scrollTop = homeScroll
    else if (menuScroll && menuScroll.cat === key) el.scrollTop = menuScroll.top
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return () => saveScroll(el.scrollTop)
  }, [key, saveScroll])
  return ref
}

// ---------- home ----------

function PromoCard({ pr, big }: { pr: Promo; big: boolean }) {
  const b = E().brand
  const openProduct = useEngine((s) => s.openProduct)
  const p = byId(pr.pid)
  if (!p) return null
  const chip = pr.menu ? `${tf('menuPriceA', { price: fmt(p.price + E().menuDeal.price) })} · ${tf('menuBaseA', { price: fmt(p.price) })}` : fmt(p.price)
  const open = () => openProduct(p, { menu: !!pr.menu, from: 'home' })
  if (big)
    return (
      <button type="button" data-a="promo" className="press relative w-full rounded-[30px] overflow-hidden text-left" style={{ height: b.layout.promoHeight || b.hero.height || b.layout.heroHeight }} onClick={open}>
        <FoodImg p={{ ...pr, _pos: `${b.hero.contentFocalPoint.x}% ${b.hero.contentFocalPoint.y}%`, _eager: true }} cls="absolute inset-0" em="150px" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(84deg, rgba(10,9,7,.60) 0%, rgba(10,9,7,.22) 46%, rgba(10,9,7,0) 66%)' }} />
        <div className="absolute inset-0 p-9 flex flex-col text-cream" style={{ maxWidth: `${b.hero.textSafeWidth}%` }}>
          <span className={`badge ${pr.menu ? 'b-dea' : 'b-new'} self-start`}>{L(pr.flag)}</span>
          <div className="flex-1" />
          <div className="heroTitle hd text-[52px] leading-[53px] tracking-[.5px] clamp2">{L(pr.title)}</div>
          <div className="text-[20px] leading-[28px] font-normal opacity-90 mt-2">{L(pr.sub)}</div>
          <div className="num text-[28px] leading-[34px] tracking-[-0.3px] font-extrabold mt-2">{chip}</div>
          <span className="mt-6 self-start h-[76px] px-10 rounded-full bg-cream text-ink flex items-center gap-3">
            <span className="text-[22px] font-bold leading-[26px]">{t('promoView')}</span>
            <span className="w-6 h-6">
              <Ic n="arrR" sw={2.6} />
            </span>
          </span>
        </div>
      </button>
    )
  return (
    <button type="button" data-a="promo" className="press bg-card rounded-[26px] overflow-hidden text-left shadow-soft" onClick={open}>
      <div className="relative">
        <span className={`absolute top-4 left-4 z-10 badge badge-sm ${pr.menu ? 'b-dea' : 'b-new'}`}>{L(pr.flag)}</span>
        <FoodImg p={{ ...pr, _eager: true }} cls="h-[210px] w-full" em="96px" />
      </div>
      <div className="px-6 pt-4 pb-5">
        <div className="hd text-[34px] leading-[37px] tracking-[.4px] clamp2">{L(pr.title)}</div>
        <div className="text-[18px] leading-[25px] font-normal text-mute mt-1.5">{L(pr.sub)}</div>
        <div className="flex items-center justify-between mt-2.5">
          <span className="num text-[25px] leading-[30px] tracking-[-0.2px] font-extrabold">{chip}</span>
          <span className="w-[48px] h-[48px] rounded-full bg-jade text-white grid place-items-center">
            <span className="w-5 h-5">
              <Ic n="chevR" sw={2.8} />
            </span>
          </span>
        </div>
      </div>
    </button>
  )
}

function H2({ txt, seeAllCat }: { txt: string; seeAllCat?: string }) {
  const goCat = useEngine((s) => s.goCat)
  return (
    <div className="flex items-baseline justify-between mt-10 mb-5">
      <h2 className="hd text-[46px] leading-[50px] tracking-[.7px]">{txt}</h2>
      {seeAllCat ? (
        <button type="button" data-a="cat" className="press h-[56px] px-6 -mr-2 rounded-full flex items-center gap-2 text-[17px] font-semibold leading-[24px] text-mute" onClick={() => goCat(seeAllCat)}>
          {t('seeAll')}
          <span className="w-5 h-5">
            <Ic n="chevR" sw={2.4} />
          </span>
        </button>
      ) : null}
    </div>
  )
}

export function HomeMain() {
  const b = E().brand
  const ref = useScroller('home')
  const promos = b.promos.filter((pr) => !alHidden(byId(pr.pid)) && !(pr.menu && alHidden(byId(E().menuDeal.side))))
  const [P0, ...rest] = promos
  const news = visible(E().products.filter((p) => p.badges.includes('new'))).slice(0, 3)
  const pops = visible(E().products.filter((p) => p.badges.includes('pop'))).slice(0, 3)
  const grid = { gridTemplateColumns: `repeat(${b.layout.gridColumns},1fr)`, gap: b.layout.gridGap }
  return (
    <>
      <TopBar />
      <h1 className="hd text-[72px] leading-[72px] tracking-[1px] px-5 mt-4 flex-none">{t('homeT')}</h1>
      <div className="scroller flex-1 px-5 pt-7 pb-[220px]" ref={ref}>
        {P0 ? <PromoCard pr={P0} big /> : null}
        {pops.length ? (
          <>
            <H2 txt={t('cat_popular')} seeAllCat="popular" />
            <div className="grid" style={grid}>
              {pops.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </>
        ) : null}
        <div className="grid grid-cols-2 gap-5 mt-10">
          {rest.map((pr) => (
            <PromoCard key={pr.pid} pr={pr} big={false} />
          ))}
        </div>
        {news.length ? <H2 txt={t('newIn')} seeAllCat="new" /> : null}
        <div className="grid" style={grid}>
          {news.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </>
  )
}

// ---------- menu ----------

function CompStrip({ cat }: { cat: string }) {
  const cart = useEngine((s) => s.cart)
  const a = useEngine(useShallow((s) => ({ goCat: s.goCat, openProduct: s.openProduct, quickAdd: s.quickAdd })))
  const d = E()
  const picks = visible((d.comp[cat] || d.comp.default).map((id) => byId(id)).filter((p): p is Product => !!p))
    .filter((p) => !cart.some((l) => l.pid === p.id))
    .slice(0, 4)
  if (picks.length < 2) return null
  const allCat = d.compAll[cat] || d.compAll.default
  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-4">
          <h3 className="hd text-[36px] leading-[40px] tracking-[.5px]">{t('finishT')}</h3>
          <span className="text-[17px] text-mute font-semibold leading-[24px]">{t('finishS')}</span>
        </div>
        <button type="button" data-a="cat" className="press h-[56px] px-4 -mr-2 rounded-full flex items-center gap-2 text-[17px] font-semibold leading-[24px] text-ink/70" onClick={() => a.goCat(allCat)}>
          {t('seeAll')}
          <span className="w-5 h-5">
            <Ic n="arrR" sw={2.6} />
          </span>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {picks.map((p) => (
          <div key={p.id} className="bg-card rounded-2xl p-3.5 shadow-soft flex flex-col">
            <button type="button" data-a="prod" className="press block w-full text-left" onClick={() => a.openProduct(p)}>
              <div className="rounded-xl overflow-hidden">
                <FoodImg p={p} cls="h-[104px] w-full" em="48px" />
              </div>
              <div className="hd text-[20px] leading-[22px] tracking-[.3px] truncate mt-2.5">{pname(p)}</div>
            </button>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="num text-[19px] font-extrabold tracking-[-0.2px] text-ink/85 truncate">+ {fmt(p.price)}</span>
              <button type="button" data-a="quickAdd" aria-label={tf('addA', { name: pname(p) })} className="press qadd w-[56px] h-[56px] rounded-full bg-jade text-white grid place-items-center flex-none" onClick={() => a.quickAdd(p.id)}>
                <span className="qic w-6 h-6 pointer-events-none">
                  <span className="qic-p">
                    <Ic n="plus" sw={2.8} />
                  </span>
                  <span className="qic-c">
                    <Ic n="check" sw={3} />
                  </span>
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CategoryFinish({ cat }: { cat: string }) {
  const cart = useEngine((s) => s.cart)
  const B = cmsFinishBlock(cat)
  if (!B) return null
  const max = B.display?.maxVisible || 4
  const inOrder = new Set(cart.filter((l) => !l.reward).map((l) => l.pid))
  const items = (B.items || [])
    .map((i) => byId(i.pid))
    .filter((p): p is Product => !!p && p.cat !== cat && cmsAddable(p) && !inOrder.has(p.id))
    .slice(0, max)
  if (!items.length) return null
  return (
    <section className="cfin mt-8" data-cms-block={B.id}>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="hd text-[27px] tracking-[.04em]">{L(B.title)}</span>
        {B.subtitle ? <span className="text-[19px] text-mute font-semibold">{L(B.subtitle)}</span> : null}
      </div>
      <div className="cfin-row">
        {items.map((p) => (
          <FinishItem key={p.id} p={p} />
        ))}
      </div>
    </section>
  )
}

function MenuGrid({ cat, filter }: { cat: string; filter: string }) {
  const openAlFilter = useEngine((s) => s.openAlFilter)
  const c = catOf(cat)
  const list = prodsInCards(cat).filter((p) => filter === 'all' || !c?.filters ? true : (p.tags || []).includes(filter))
  if (!list.length)
    return (
      <div className="rounded-[26px] bg-card shadow-soft p-12 text-center mt-4">
        <div className="hd text-[34px] tracking-[.03em]">{t('alEmpty')}</div>
        <button type="button" data-a="openAlFilter" className="press mt-6 h-[72px] px-8 rounded-full bg-jade text-white text-[21px] font-bold" onClick={openAlFilter}>
          {t('alChange')}
        </button>
      </div>
    )
  const PP = presentationFor(cat)
  const mode = obwMode(cat)
  let wide: Product[] = []
  let rest = list
  if (mode === 'all') {
    wide = list
    rest = []
  } else if (mode === 'top') {
    wide = list.filter((p) => obVarCard(p) && !alHidden(p))
    rest = list.filter((p) => !wide.includes(p))
  }
  const Card = PP.card === 'compact' ? CompactCard : ProductCard
  return (
    <div className="grid" data-card={PP.card} data-wide={mode} style={{ gridTemplateColumns: `repeat(${PP.columns},1fr)`, gap: E().brand.layout.gridGap }}>
      {wide.map((p) => (
        <ProductWide key={p.id} p={p} />
      ))}
      {rest.map((p) => (
        <Card key={p.id} p={p} />
      ))}
    </div>
  )
}

export function MenuMain() {
  const cat = useEngine((s) => s.cat)
  const filter = useEngine((s) => s.filter)
  const setFilter = useEngine((s) => s.setFilter)
  const ref = useScroller(cat)
  const b = E().brand
  const c = catOf(cat)
  const filtRef = useRef<HTMLDivElement>(null)
  const indRef = useRef<HTMLDivElement>(null)
  // The indicator follows the active filter pill: a DOM measurement after layout, written straight to the element.
  useLayoutEffect(() => {
    const ind = indRef.current
    const btn = filtRef.current?.querySelector<HTMLElement>(`[data-f="${filter}"]`)
    if (!ind) return
    if (btn) {
      ind.style.opacity = '1'
      ind.style.left = btn.offsetLeft + 'px'
      ind.style.width = btn.offsetWidth + 'px'
    } else ind.style.opacity = '0'
  }, [filter, cat])

  if (cat === 'rewards') return <RewardsMain />
  return (
    <>
      <TopBar />
      {venueMenu() ? null : (
        <div className="absolute right-5 top-[168px] text-right hd text-[15px] tracking-[.34em] text-mute/70" style={{ lineHeight: 2.1 }}>
          {b.copy.sideNote.split('\n').map((l, i) => (
            <span key={i}>
              {i > 0 ? <br /> : null}
              {l}
            </span>
          ))}
        </div>
      )}
      <h1 className="hd text-[72px] leading-[72px] tracking-[1px] px-5 mt-4 flex-none">{cat === 'new' ? t('newIn') : catLabel(cat)}</h1>
      <div className="cat-sub text-[24px] text-mute font-semibold px-5 mt-2 flex-none">{L(E().catsub[cat] || E().catsub.popular)}</div>
      {c?.filters ? (
        <div className="px-5 mt-6 flex-none">
          <div id="filtWrap" className="relative inline-flex gap-3.5" ref={filtRef}>
            <div id="filtInd" ref={indRef} style={{ opacity: 0 }} />
            {['all', ...c.filters].map((f) => (
              <button
                key={f}
                type="button"
                data-a="filter"
                data-f={f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`press relative z-10 h-[64px] px-8 rounded-full hd text-[22px] tracking-[.08em] ${filter === f ? 'text-white' : 'bg-card text-ink/75 shadow-soft'}`}
              >
                {t('f_' + f)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="scroller flex-1 px-5 pt-7 pb-[220px]" ref={ref}>
        <div id="gridWrap">
          <MenuGrid cat={cat} filter={filter} />
        </div>
        {cmsFinishBlock(cat) ? <CategoryFinish cat={cat} /> : <CompStrip cat={cat} />}
      </div>
    </>
  )
}

function RewardsMain() {
  const openSheet = useEngine((s) => s.voucher)
  const member = useEngine((s) => s.member)
  return (
    <>
      <TopBar />
      <h1 className="hd text-[72px] leading-[72px] tracking-[1px] px-5 mt-4 flex-none">{t('lty_nav')}</h1>
      <div className="text-[24px] text-mute font-semibold px-5 mt-2 flex-none">{t('lty_sub')}</div>
      <div className="scroller flex-1 px-5 pt-7 pb-[220px]">
        <div className="rounded-[26px] bg-card shadow-soft p-10 flex items-center gap-8">
          <span className="w-[96px] h-[96px] text-ink flex-none">
            <IcQRBig />
          </span>
          <div className="flex-1 min-w-0">
            <div className="hd text-[36px] tracking-[.03em]">{member ? tf('lty_welcome', { name: member.name }) : t('lty_btn')}</div>
            <div className="text-[21px] text-mute font-medium mt-1">{member ? tf('lty_points', { n: member.points }) : t('voucherBody')}</div>
          </div>
          <button type="button" className="press h-[76px] px-8 rounded-full bg-jade text-white hd text-[22px] tracking-[.1em]" onClick={openSheet}>
            {t('voucherS')}
          </button>
        </div>
      </div>
    </>
  )
}

function IcQRBig() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
      <path d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm12-2h2v2h-2v-2Zm2 2h2v2h-2v-2Zm-2 2h2v2h-2v-2Zm-2-2h2v2h-2v-2Zm0 4h2v4h-2v-4Zm4 2h4v2h-4v-2Zm2-4h2v2h-2v-2Z" />
    </svg>
  )
}

// ---------- basket bar ----------

function RewardPill() {
  const cart = useEngine((s) => s.cart)
  const dismissed = useEngine((s) => s.rewardDismissed)
  const b = E().brand
  const n = cartCount(cart)
  if (!b.reward || n === 0 || rewardClaimed(cart) || dismissed) return null
  const p = byId(b.reward.pid)
  if (!p) return null
  return (
    <div className="flex justify-center mb-3">
      <div className="pointer-events-auto h-[52px] px-6 rounded-full bg-card shadow-soft flex items-center gap-4">
        <span className="text-[19px] font-bold text-ink/80">{tf('rw_prog', { amt: fmt(rewardLeft(cart)), name: pname(p) })}</span>
        <span className="w-[150px] h-[8px] rounded-full bg-line overflow-hidden">
          <span className="block h-full bg-gold" style={{ width: `${Math.min(100, (baseTotal(cart) / b.reward.threshold) * 100)}%` }} />
        </span>
      </div>
    </div>
  )
}

export function BottomBar() {
  const cart = useEngine((s) => s.cart)
  const note = useEngine((s) => s.note)
  const viewOrder = useEngine((s) => s.viewOrder)
  const [noteOn, setNoteOn] = useState(false)
  const LY = E().brand.layout
  const n = cartCount(cart)
  useEffect(() => {
    if (!note) return
    const show = setTimeout(() => setNoteOn(true), 0)
    const hide = setTimeout(() => setNoteOn(false), Math.max(0, (E().brand.motion.addNote ?? 900) - (E().brand.motion.fieldXfade ?? 160)))
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [note])
  if (n === 0) return null
  return (
    <div id="bkWrap" className="absolute z-[100] pointer-events-none bar-in" style={{ left: LY.sidebarWidth - LY.basketOverlap, right: 32, bottom: LY.basketBottom }}>
      <div id="bkRw">
        <RewardPill />
      </div>
      <button
        type="button"
        data-a="viewOrder"
        id="bar"
        onClick={viewOrder}
        className="pointer-events-auto press relative w-full rounded-full bg-jade text-white flex items-center justify-center gap-4"
        style={{ height: LY.basketHeight, boxShadow: '0 22px 52px -14px rgb(var(--c-primary) / .55)' }}
      >
        <span className="w-9 h-9">
          <Ic n="bag" sw={2} />
        </span>
        <span className="text-[23px] font-bold leading-[30px]">{t('viewOrder')}</span>
        <span className="text-white/45 text-[23px] font-bold">·</span>
        <span id="bkQty" className="bkv text-[21px] font-medium leading-[30px]">
          <span className="bkv-c">
            {n} {n === 1 ? t('item') : t('items')}
          </span>
        </span>
        <span className="text-white/45 text-[23px] font-bold">·</span>
        <span id="bkTot" className="bkv num text-[21px] font-medium leading-[30px]">
          <span className="bkv-c">{fmt(cartTotal(cart))}</span>
        </span>
        <span className="w-7 h-7 ml-1">
          <Ic n="chevR" sw={2.8} />
        </span>
        <span id="bkNote" role="status" aria-live="polite" className={`text-[19px] font-bold${noteOn ? ' on' : ''}`}>
          {note?.text ?? ''}
        </span>
      </button>
    </div>
  )
}

/** The home/menu shell: rail + main column + basket bar. */
export function Shell() {
  const screen = useEngine((s) => s.screen)
  return (
    <>
      <div className="flex-1 min-h-0 flex">
        <Rail />
        <main id="mainCol" className="relative flex-1 min-w-0 flex flex-col enter">{screen === 'home' ? <HomeMain /> : <MenuMain />}</main>
      </div>
      <BottomBar />
    </>
  )
}
