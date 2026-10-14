import { useShallow } from 'zustand/shallow'
import { useEffect } from 'react'
import { E, L, t, tf } from '../engine/state'
import { useEngine } from '../store/engine'
import { Ic, IcQR, LangPills } from './primitives'

const HERO_LOCAL = '/brand/img/hero.webp'

/** Attract / welcome screen — port of SCR.attract. Remote hero images fall back to the embedded photo. */
export function Attract() {
  const b = E().brand
  const heroIdx = useEngine((s) => s.heroIdx)
  const a = useEngine(useShallow((s) => ({ startWith: s.startWith, voucher: s.voucher })))
  const member = useEngine((s) => s.member)
  const images = [HERO_LOCAL, ...(b.hero.mode === 'slider' ? b.hero.images : [])].filter((u, i, arr) => arr.indexOf(u) === i)

  useEffect(() => {
    if (images.length <= 1) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => useEngine.setState((s) => ({ heroIdx: (s.heroIdx + 1) % images.length })), b.motion.heroInterval || b.hero.interval || 7000)
    return () => clearInterval(id)
  }, [images.length, b.motion.heroInterval, b.hero.interval])

  const startBtn = (id: 'eatin' | 'takeaway') => (
    <button type="button" data-a="startWith" data-s={id} className="press ctapulse h-[132px] rounded-full bg-cream text-ink flex items-center justify-center gap-5" onClick={() => a.startWith(id)}>
      <span className="w-10 h-10">
        <Ic n={id === 'eatin' ? 'dish' : 'bag'} sw={2.2} />
      </span>
      <span className="hd text-[30px] tracking-[.16em]">{t(id === 'eatin' ? 'eatIn' : 'takeAway')}</span>
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
      <div className="heromedia">
        {images.map((u, i) => (
          <img key={u} className={`heroimg${i === heroIdx % images.length ? ' on' : ''}`} src={u} alt="" width={2160} height={3840} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" onError={(e) => e.currentTarget.remove()} />
        ))}
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,9,7,.66) 0%, rgba(10,9,7,.20) 24%, rgba(10,9,7,0) 40%), linear-gradient(180deg, rgba(10,9,7,0) 44%, rgba(10,9,7,.58) 72%, rgba(10,9,7,.88) 100%), linear-gradient(100deg, rgba(10,9,7,.46) 0%, rgba(10,9,7,0) 55%)',
        }}
      />
      <div className="absolute inset-0">
        <div className="hero-lockup absolute top-[40px] left-1/2 -translate-x-1/2 text-center">
          <img src={b.logoImg} alt={b.name} className="mx-auto" style={{ height: 96, objectFit: 'contain', filter: `${b.logoFilter || 'invert(1) brightness(1.6)'} drop-shadow(0 6px 24px rgba(0,0,0,.5))` }} />
          <div className="hd text-[17px] tracking-[.42em] text-cream/90 mt-2.5">– {b.copy.logoTagline} –</div>
        </div>
        <div className="absolute top-[40px] right-[24px]">
          <LangPills dark />
        </div>
        <div className="absolute left-[105px] top-[268px] text-cream">
          <h1 className="hd text-[78px] leading-[1.1] tracking-[.03em]" style={{ textShadow: '0 4px 30px rgba(0,0,0,.55)' }}>
            {lines(L(b.copy.headline))}
          </h1>
          <div className="w-[56px] h-[3px] bg-cream/85 mt-8 mb-7" />
          <p className="text-[24px] font-semibold tracking-[.3em] leading-[1.7]">{lines(L(b.copy.sub))}</p>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="px-[105px]">
            {b.features.loyalty ? (
              <div className="flex justify-center lty-att">
                <button type="button" data-a="ltyOpen" className={`press lty-pill${member ? ' on' : ''}`} onClick={a.voucher}>
                  <span className="lty-ic">{member ? <Ic n="check" sw={2.8} /> : <IcQR />}</span>
                  <span className="lty-lbl">{member ? tf('lty_welcome', { name: member.name }) + ' · ' + tf('lty_points', { n: member.points }) : t('lty_btn')}</span>
                  <span className="lty-chev">
                    <Ic n="chevR" sw={2.6} />
                  </span>
                </button>
              </div>
            ) : null}
            <div className="hd text-[28px] tracking-[.14em] text-cream text-center mb-[22px]" style={{ textShadow: '0 3px 20px rgba(0,0,0,.6)' }}>
              {t('howOrder')}
            </div>
            <div className="grid grid-cols-2 gap-[24px]">
              {startBtn('eatin')}
              {startBtn('takeaway')}
            </div>
          </div>
          <div className="mx-[40px] mt-[40px] pt-[26px] pb-[60px] flex items-center justify-center text-cream" style={{ borderTop: '1.5px solid rgba(255,255,255,.28)' }}>
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
