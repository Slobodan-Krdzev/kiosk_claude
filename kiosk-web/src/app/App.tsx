import { useEffect, useRef } from 'react'
import { loadEngineData, resolveCatalogSource } from '../adapters/http/catalogSource'
import { resolveOrderTagConfig } from '../engine/data'
import { setEngine } from '../engine/state'
import { useEngine } from '../store/engine'
import { usePayState } from '../store/payment'
import { Attract } from '../ui/Attract'
import { applyBrand } from '../ui/brand'
import { Cart } from '../ui/Cart'
import { Overlays } from '../ui/Overlays'
import { Pay } from '../ui/Pay'
import { Pdp } from '../ui/Pdp'
import { Shell } from '../ui/shell'
import { BootCard, Stage } from '../ui/Stage'
import { StaffPanel } from '../ui/StaffPanel'
import { Tag } from '../ui/Tag'
import { catalogRefresh } from './checkout'
import { createRuntime, getRuntime, resolveAdapters } from './runtime'
import { clearSession, restoreSession, startSessionPersistence } from './session'

let bootStarted = false
let brandName = 'Guestit'

/** Boot: adapters → config → engine data (later: the backend) → brand → payment-record restore → session → connectivity. */
async function boot(): Promise<void> {
  const store = useEngine.getState()
  const resolved = resolveAdapters()
  try {
    const config = await resolved.adapters.catalog.config()
    if (config.mode === 'production' && resolved.adapters.kind === 'static') {
      throw new Error('production mode requires real adapters (window.GuestitAdapters) — refusing to run on the simulation')
    }
    const source = resolveCatalogSource(config.catalogSource, window.location.search)
    const engine = await loadEngineData(import.meta.env.BASE_URL, source)
    setEngine(engine)
    applyBrand(engine.brand)
    brandName = engine.brand.name
    config.orderTag = resolveOrderTagConfig(config.orderTag)
    const rt = createRuntime(resolved, config)
    const lang = engine.brand.defaultLanguage || config.defaultLang
    document.documentElement.lang = lang
    useEngine.getState().setReady(config, lang)

    await rt.controller.restore()
    if (rt.controller.state.status === 'idle') restoreSession(config.sessionTtlMs)
    startSessionPersistence()

    useEngine.getState().setConn(resolved.adapters.connectivity.get())
    resolved.adapters.connectivity.subscribe((c) => {
      useEngine.getState().setConn(c)
      rt.log('connectivity.state', { kind: c.kind, ...(c.kind === 'connected' ? { role: c.role, epoch: c.epoch } : {}) })
    })
    void catalogRefresh()
    rt.log('boot.ok', { adapters: resolved.adapters.kind, mode: config.mode, brand: engine.brand.id, catalog: source.source })
  } catch (e) {
    store.setBootError(String(e))
  }
}

/** Inactivity: warn after inactivityTimeoutMs, clear after inactivityWarningMs more. Never during payment. */
function useIdle() {
  const pay = usePayState()
  useEffect(() => {
    const onActivity = () => {
      const s = useEngine.getState()
      if (s.confirm !== 'idle') s.touch()
    }
    const ev: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart', 'wheel']
    for (const e of ev) window.addEventListener(e, onActivity, { passive: true })
    return () => {
      for (const e of ev) window.removeEventListener(e, onActivity)
    }
  }, [])
  const payStatus = pay.status
  useEffect(() => {
    const id = setInterval(() => {
      const s = useEngine.getState()
      if (!s.ready) return
      const cfg = s.config
      const brand = (() => {
        try {
          return getRuntime().config ? undefined : undefined
        } catch {
          return undefined
        }
      })()
      void brand
      const timeout = cfg ? cfg.idle.warnAfterMs : 75000
      const warn = cfg ? cfg.idle.countdownMs : 15000
      const exempt = s.screen === 'attract' || payStatus !== 'idle' || s.staffOpen
      const now = Date.now()
      if (exempt) {
        if (s.idleWarnAt) s.idleContinue()
        else s.touch()
        return
      }
      if (s.idleWarnAt) {
        if (now - s.idleWarnAt >= warn) {
          if (!getRuntime().controller.paymentMayHaveSucceeded()) {
            clearSession()
            s.newOrderReset()
          } else s.idleContinue()
        }
        return
      }
      if (now - s.lastActivity >= timeout) s.idleWarn()
    }, 1000)
    return () => clearInterval(id)
  }, [payStatus])
}

function useStaffTaps() {
  const taps = useRef<number[]>([])
  return () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((x) => now - x < 3000), now]
    if (taps.current.length >= 5) {
      taps.current = []
      useEngine.getState().setStaffOpen(true)
    }
  }
}

export function App() {
  const ready = useEngine((s) => s.ready)
  const bootError = useEngine((s) => s.bootError)
  const screen = useEngine((s) => s.screen)
  const navDir = useEngine((s) => s.navDir)
  const pdpOpen = useEngine((s) => s.pdpOpen)
  const staffOpen = useEngine((s) => s.staffOpen)
  const lang = useEngine((s) => s.lang)
  const setScreen = useEngine((s) => s.setScreen)
  const pay = usePayState()
  const staffTap = useStaffTaps()
  useIdle()

  useEffect(() => {
    if (bootStarted) return
    bootStarted = true
    void boot()
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  // Leaving the payment flow with nothing charged → back to the cart.
  useEffect(() => {
    if (ready && pay.status === 'idle' && screen === 'pay') setScreen('cart')
  }, [ready, pay.status, screen, setScreen])

  let body: React.ReactNode
  if (bootError) body = <BootCard name={brandName} title="Kiosk could not start" sub={bootError} fail onRetry={() => window.location.reload()} onAdminTap={staffTap} />
  else if (!ready) body = <BootCard name={brandName} title="Starting…" sub="" onAdminTap={staffTap} />
  else if (pay.status !== 'idle' || screen === 'pay') body = <Pay />
  else if (screen === 'attract') body = <Attract />
  else if (screen === 'home' || screen === 'menu') body = <Shell />
  else if (screen === 'cart') body = <Cart />
  else if (screen === 'tag') body = <Tag />
  else body = <Attract />

  const showPdp = ready && pdpOpen && pay.status === 'idle' && screen !== 'pay'
  return (
    <Stage brandName={brandName} overlay={ready ? <Overlays /> : null}>
      <div className={`screen-root enter-${navDir}`} key={`${screen}-${pay.status === 'idle' ? '' : 'pay'}`} onClickCapture={(e) => {
        const el = e.target as HTMLElement
        if (el.closest('img[alt]') && el.closest('[data-a="attract"], .hero-lockup')) staffTap()
      }}>
        {body}
      </div>
      {showPdp ? <Pdp /> : null}
      {staffOpen ? <StaffPanel /> : null}
    </Stage>
  )
}
