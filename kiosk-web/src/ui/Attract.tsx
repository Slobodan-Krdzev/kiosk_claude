import { useShallow } from 'zustand/shallow'
import { useEffect, useState } from 'react'
import { currentSlides } from '../engine/slides'
import { E, L, t, tf } from '../engine/state'
import { useEngine } from '../store/engine'
import { Ic, IcQR, LangPills } from './primitives'

// Original first-screen slides (embedded hero + BRAND.hero.images), kept for later use.
// Since 2026-10-15 the first screen shows the venue's screensaver slides from the API menu instead.
// const HERO_LOCAL = `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}brand/img/hero.webp`

/** Attract / welcome screen — port of SCR.attract. Remote hero images fall back to the embedded photo. */
export function Attract() {
  const b = E().brand
  const heroIdx = useEngine((s) => s.heroIdx)
  const a = useEngine(useShallow((s) => ({ startWith: s.startWith, voucher: s.voucher })))
  const member = useEngine((s) => s.member)
  const lang = useEngine((s) => s.lang)
  // Original slides (see HERO_LOCAL above):
  // const images = [HERO_LOCAL, ...(b.hero.mode === 'slider' ? b.hero.images : [])].filter((u, i, arr) => arr.indexOf(u) === i)
  // const interval = b.motion.heroInterval || b.hero.interval || 7000
  const ss = E().screensaver
  // Minute clock so slides with a time window switch while the screen is idle.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  // A slide that fails to load is dropped from the rotation by state, never by removing React's DOM node.
  const [broken, setBroken] = useState<string[]>([])
  const images = currentSlides(ss, lang, now)
    .map((s) => s.img)
    .filter((u, i, arr) => arr.indexOf(u) === i && !broken.includes(u))
  const interval = ss?.intervalMs || 7000
  // API menu: the venue's slides carry their own copy, so the brand overlay (headline, tagline) is hidden
  // and the venue logo (ThemeResponse.LogoImage) replaces the brand logo.
  const venueMode = !!ss
  const venue = E().venue
  const logo = venueMode && venue?.logoImg ? { src: venue.logoImg, alt: venue.name || '', filter: 'drop-shadow(0 6px 24px rgba(0,0,0,.5))' } : { src: b.logoImg, alt: b.name, filter: `${b.logoFilter || 'invert(1) brightness(1.6)'} drop-shadow(0 6px 24px rgba(0,0,0,.5))` }

  // Bottom controls hide after Screensaver.ActivationTime without a touch and come back on the next touch.
  // The revealing touch never starts an order: the controls are not hit-testable while invisible.
  const idleMs = ss?.idleMs || 0
  const [idle, setIdle] = useState(false)
  // Hit-testing is only switched off once the fade-out has finished (longest row transition ≈ 560 ms):
  // a tap on a button that is still visible must always count. Waking re-enables it at once.
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!idleMs) return
    let timer: ReturnType<typeof setTimeout> | null = null
    let goneTimer: ReturnType<typeof setTimeout> | null = null
    const arm = () => {
      timer = setTimeout(() => {
        setIdle(true)
        goneTimer = setTimeout(() => setGone(true), 650)
      }, idleMs)
    }
    const wake = () => {
      if (timer) clearTimeout(timer)
      if (goneTimer) clearTimeout(goneTimer)
      goneTimer = null
      setIdle(false)
      setGone(false)
      arm()
    }
    arm()
    const ev: (keyof WindowEventMap)[] = ['pointerdown', 'touchstart', 'keydown', 'wheel']
    for (const e of ev) window.addEventListener(e, wake, { passive: true })
    return () => {
      if (timer) clearTimeout(timer)
      if (goneTimer) clearTimeout(goneTimer)
      for (const e of ev) window.removeEventListener(e, wake)
    }
  }, [idleMs])
  const fade = { transition: 'opacity 450ms ease', opacity: idle ? 0 : 1 } as const
  // Staggered slide + fade of the bottom rows. Leaving: bottom row first, sinking. Coming back: rising row by row from the top.
  // Reduced motion: fade only.
  const reduceMotion = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const ROWS = 4
  const rowMotion = (i: number): React.CSSProperties => {
    const delay = idle ? (ROWS - 1 - i) * 60 : 80 + i * 70
    return {
      opacity: idle ? 0 : 1,
      transform: reduceMotion ? undefined : idle ? 'translateY(56px) scale(.97)' : 'none',
      transition: idle
        ? `opacity 320ms ease-in ${delay}ms, transform 380ms cubic-bezier(.4,0,1,1) ${delay}ms`
        : `opacity 420ms ease-out ${delay}ms, transform 560ms cubic-bezier(.16,1,.3,1) ${delay}ms`,
      willChange: 'opacity, transform',
    }
  }

  useEffect(() => {
    if (images.length <= 1) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => useEngine.setState((s) => ({ heroIdx: (s.heroIdx + 1) % images.length })), interval)
    return () => clearInterval(id)
  }, [images.length, interval])

  const startBtn = (id: 'eatin' | 'takeaway') => (
    // Icon and text are direct children of the button (Alex, 2026-10-21): no wrapper element can ever be the tap target.
    <button type="button" data-a="startWith" data-s={id} className="press ctapulse h-[132px] rounded-full bg-cream text-ink flex items-center justify-center gap-5 hd text-[30px] tracking-[.16em]" onClick={() => a.startWith(id)}>
      <Ic n={id === 'eatin' ? 'dish' : 'bag'} sw={2.2} cls="w-10 h-10 flex-none" />
      {t(id === 'eatin' ? 'eatIn' : 'takeAway')}
    </button>
  )
  const lines = (s: string) =>
    s.split('\n').map((l, i) => (
      <span key={i}>
        {i > 0 ? <br /> : null}
        {l}
      </span>
    ))

  return (
    <>
      <div className="heromedia" style={ss && ss.opacity < 1 ? { opacity: ss.opacity } : undefined}>
        {images.map((u, i) => (
          <img key={u} className={`heroimg${i === heroIdx % images.length ? ' on' : ''}`} src={u} alt="" width={2160} height={3840} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" onError={() => setBroken((b) => (b.includes(u) ? b : [...b, u]))} />
        ))}
      </div>
      {venueMode ? (
        // Only a bottom shade for the order buttons; it leaves with them.
        <div className="absolute inset-0 pointer-events-none" style={{ ...fade, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(10,9,7,0) 58%, rgba(10,9,7,.55) 80%, rgba(10,9,7,.8) 100%)' }} />
      ) : (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,9,7,.66) 0%, rgba(10,9,7,.20) 24%, rgba(10,9,7,0) 40%), linear-gradient(180deg, rgba(10,9,7,0) 44%, rgba(10,9,7,.58) 72%, rgba(10,9,7,.88) 100%), linear-gradient(100deg, rgba(10,9,7,.46) 0%, rgba(10,9,7,0) 55%)',
          }}
        />
      )}
      <div className="absolute inset-0">
        <div className="hero-lockup absolute top-[40px] left-1/2 -translate-x-1/2 text-center">
          <img src={logo.src} alt={logo.alt} className="mx-auto" style={{ height: 96, maxWidth: 420, objectFit: 'contain', filter: logo.filter }} />
          {venueMode ? null : <div className="hd text-[17px] tracking-[.42em] text-cream/90 mt-2.5">– {b.copy.logoTagline} –</div>}
        </div>
        <div className="absolute top-[40px] right-[24px]">
          <LangPills dark />
        </div>
        {venueMode ? null : (
          <div className="absolute left-[105px] top-[268px] text-cream">
            <h1 className="hd text-[78px] leading-[1.1] tracking-[.03em]" style={{ textShadow: '0 4px 30px rgba(0,0,0,.55)' }}>
              {lines(L(b.copy.headline))}
            </h1>
            <div className="w-[56px] h-[3px] bg-cream/85 mt-8 mb-7" />
            <p className="text-[24px] font-semibold tracking-[.3em] leading-[1.7]">{lines(L(b.copy.sub))}</p>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0" style={{ pointerEvents: gone ? 'none' : undefined }} aria-hidden={gone || undefined}>
          <div className="px-[105px]">
            {b.features.loyalty ? (
              <div className="flex justify-center lty-att" style={rowMotion(0)}>
                <button type="button" data-a="ltyOpen" className={`press lty-pill${member ? ' on' : ''}`} onClick={a.voucher}>
                  <span className="lty-ic">{member ? <Ic n="check" sw={2.8} /> : <IcQR />}</span>
                  <span className="lty-lbl">{member ? tf('lty_welcome', { name: member.name }) + ' · ' + tf('lty_points', { n: member.points }) : t('lty_btn')}</span>
                  <span className="lty-chev">
                    <Ic n="chevR" sw={2.6} />
                  </span>
                </button>
              </div>
            ) : null}
            <div className="hd text-[28px] tracking-[.14em] text-cream text-center mb-[22px]" style={{ textShadow: '0 3px 20px rgba(0,0,0,.6)', ...rowMotion(1) }}>
              {t('howOrder')}
            </div>
            <div className="grid grid-cols-2 gap-[24px]" style={rowMotion(2)}>
              {startBtn('eatin')}
              {startBtn('takeaway')}
            </div>
          </div>
          <div className="mx-[40px] mt-[40px] pt-[26px] pb-[60px] flex items-center justify-center text-cream" style={{ borderTop: '1.5px solid rgba(255,255,255,.28)', ...rowMotion(3) }}>
            {b.features.voucher ? (
              <button type="button" data-a="voucher" className="press h-[64px] px-6 rounded-full flex items-center gap-5" onClick={a.voucher}>
                <span className="w-[46px] h-[46px] opacity-95">
                  <IcQR />
                </span>
                <span className="text-left leading-tight">
                  <span className="hd block text-[20px] tracking-[.12em]">{t('voucherT')}</span>
                  <span className="block text-[15px] font-semibold text-white/55 tracking-[.2em] uppercase mt-1">{t('voucherS')}</span>
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
