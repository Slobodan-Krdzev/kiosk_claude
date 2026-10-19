// The 1080×1920 design canvas. Portrait panels: fluid kiosk mode (engine's body.kiosk.fluid #screen rule, CSS zoom).
// Landscape / desktop: the whole device is scaled to fit (engine's simulator #device --s rule).

import { useEffect, type ReactNode } from 'react'
import { FullscreenButton } from './FullscreenButton'

function fit(screen: HTMLElement | null, device: HTMLElement | null, hint: HTMLElement | null, brandName: string) {
  const vw = window.visualViewport?.width || innerWidth
  const vh = window.visualViewport?.height || innerHeight
  const a = vw / Math.max(1, vh)
  const coarse = window.matchMedia?.('(pointer:coarse)').matches
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches
  const kiosk = a <= 0.66 || ((coarse || standalone) && a < 1.75)
  const B = document.body.classList
  if (kiosk) {
    B.add('kiosk', 'fluid')
    // Touch panels keep ≥0.62 so targets stay ≥56 real px; a mouse-driven preview may shrink further.
    const z = Math.min(Math.max(vw / 1080, coarse ? 0.62 : 0.2), 1.25)
    screen?.style.setProperty('--z', String(z))
    screen?.style.setProperty('--k', '1')
    screen?.style.setProperty('--cw', '1080px')
    screen?.style.setProperty('--ch', Math.round(vh / z) + 'px')
    document.documentElement.style.setProperty('--vvh', vh + 'px')
    if (hint) hint.textContent = ''
    return
  }
  B.remove('kiosk', 'fluid')
  screen?.style.removeProperty('--z')
  screen?.style.removeProperty('--cw')
  screen?.style.removeProperty('--ch')
  const pad = 40
  const s = Math.min((innerWidth - pad) / 1120, (innerHeight - pad) / 1960)
  device?.style.setProperty('--s', String(Math.min(1, s)))
  if (hint) hint.textContent = `${brandName} kiosk · white-label engine by Guestit · 1080×1920 · ${Math.round(Math.min(1, s) * 100)}% · portrait screen = kiosk mode`
}

export function Stage({ children, overlay, brandName }: { children: ReactNode; overlay: ReactNode; brandName: string }) {
  useEffect(() => {
    const run = () => fit(document.getElementById('screen'), document.getElementById('device'), document.getElementById('hint'), brandName)
    run()
    addEventListener('resize', run)
    addEventListener('orientationchange', run)
    window.visualViewport?.addEventListener('resize', run)
    return () => {
      removeEventListener('resize', run)
      removeEventListener('orientationchange', run)
      window.visualViewport?.removeEventListener('resize', run)
    }
  }, [brandName])
  return (
    <>
      <div id="stage">
        <div id="device">
          <div id="bezel">
            <div id="screen">
              <div id="app">{children}</div>
              <div id="overlay">{overlay}</div>
            </div>
          </div>
        </div>
      </div>
      <div id="hint" />
      <FullscreenButton />
    </>
  )
}

export function BootCard({ logo, name, title, sub, fail, onRetry, onAdminTap }: { logo?: string; name: string; title: string; sub: string; fail?: boolean; onRetry?: () => void; onAdminTap?: () => void }) {
  return (
    <div id="bootScreen">
      <div className="bootCard" role={fail ? 'alertdialog' : 'status'} aria-modal={fail}>
        {logo ? <img src={logo} alt={name} className="bootLogo" /> : null}
        <div className="bootT">{title}</div>
        <div className="bootS">{sub}</div>
        {fail ? (
          <button type="button" className="press bootBtn" onClick={onRetry}>
            Retry
          </button>
        ) : (
          <div className="bootSpin" aria-hidden="true" />
        )}
        <button type="button" className="bootAdmin" aria-label="admin" onClick={onAdminTap} />
      </div>
    </div>
  )
}
