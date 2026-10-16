import { useEffect, useRef } from 'react'
import { DEFAULT_MENU_TIMEOUT_MS, designFor, designUrl, fetchDesign, fetchMenu, mapMenu, resolveCatalogSource } from '../adapters/http/catalogSource'
import type { VenueDesign } from '../adapters/http/venueDesign'
import { withLiveAdapters } from '../adapters/http/tmkLive'
import { withTimeout } from '../adapters/withTimeout'
import type { CatalogSourceConfig } from '../domain/types'
import { fetchEngineData, resolveOrderTagConfig } from '../engine/data'
import { E, setEngine, t } from '../engine/state'
import type { EngineData, Lang } from '../engine/types'
import { setAvailabilityGate, useEngine } from '../store/engine'
import { liveGate } from './availability'
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
let menuRetry: { source: CatalogSourceConfig; pack: EngineData; timeoutMs: number; design?: VenueDesign } | null = null
/** When the API menu in use was loaded (ms); stamped into snapshots as the catalog version (no price endpoint exists). */
let menuLoadedAt = 0
/** Live checks against the kiosk API are in use (API / test menu on the static simulation). */
let liveChecks = false

/** Boot / recovery refresh: the whole menu on the static simulation, only the cart's products on the live API. */
const refreshScope = (): string[] | undefined => (liveChecks ? undefined : E().products.map((p) => p.id))

function applyMenu(engine: EngineData, config: { defaultLang: Lang }): Lang {
  setEngine(engine)
  if (engine.venue) menuLoadedAt = Date.now()
  applyBrand(engine.brand)
  // One identity everywhere (audit F10): the venue's name on API menus, the brand pack's otherwise.
  brandName = engine.venue ? engine.venue.name || 'Kiosk' : engine.brand.name
  document.title = `${brandName} — Self-order kiosk`
  const lang = engine.brand.defaultLanguage || config.defaultLang
  document.documentElement.lang = lang
  return lang
}

/** Staff "Retry" or the periodic retry after the menu failed at boot. */
async function retryMenu(): Promise<void> {
  const s = useEngine.getState()
  if (!menuRetry || !s.config) return
  try {
    const engine = mapMenu(await fetchMenu(menuRetry.source, menuRetry.timeoutMs), menuRetry.pack, import.meta.env.BASE_URL, undefined, menuRetry.design)
    const lang = applyMenu(engine, s.config)
    useEngine.getState().setMenuError(null)
    useEngine.getState().setReady(s.config, lang)
    getRuntime().log('menu.recovered')
    void catalogRefresh(refreshScope())
  } catch (e) {
    getRuntime().log('menu.retryFailed', { error: String(e) })
  }
}

/**
 * Boot order (audit F05, 2026-10-16): adapters → config → brand pack (local texts/brand) → payment controller
 * restore → remote menu (bounded, requested in parallel) → session → connectivity.
 * A hanging or failing menu never blocks payment recovery: the Pay screen renders on the brand pack, and the
 * guest flow stays closed (menuError) until the menu loads.
 */
async function boot(): Promise<void> {
  const store = useEngine.getState()
  let resolved = resolveAdapters()
  try {
    const config = await resolved.adapters.catalog.config()
    if (config.mode === 'production' && resolved.adapters.kind === 'static') {
      throw new Error('production mode requires real adapters (window.GuestitAdapters) — refusing to run on the simulation')
    }
    const base = import.meta.env.BASE_URL
    const source = resolveCatalogSource(config.catalogSource, window.location.search)
    const timeoutMs = config.timeouts.menuLoad ?? DEFAULT_MENU_TIMEOUT_MS
    // API menu on the simulation: availability (and the no-op price check) go to the kiosk API, as the old kiosk did.
    const live = withLiveAdapters(resolved.adapters, source, () => menuLoadedAt, { timeoutMs: config.timeouts.availability })
    liveChecks = live !== resolved.adapters
    resolved = { ...resolved, adapters: live }
    setAvailabilityGate(liveChecks ? liveGate : null)
    // The remote menu request starts now, in parallel with the brand pack; it is awaited only after restore().
    const menuP = source.source === 'static' ? null : fetchMenu(source, timeoutMs)
    menuP?.catch(() => undefined) // observed below; avoid an unhandled rejection if restore() throws first
    // The venue design file (badges, icons, cross-sells … by API ids) loads alongside; it never fails the menu.
    const designP = source.source === 'static' ? null : fetchDesign(designUrl(source, base), timeoutMs)
    const pack = await withTimeout(fetchEngineData(base), timeoutMs, 'brandPack')
    applyMenu(pack, config) // texts + brand for the recovery UI, even if the menu never arrives
    config.orderTag = resolveOrderTagConfig(config.orderTag)
    const rt = createRuntime(resolved, config)
    await rt.controller.restore()

    let engine = pack
    let menuError: string | null = null
    let design: VenueDesign | undefined
    if (designP) {
      const dz = await designP
      if (dz.error) rt.log('design.loadFailed', { error: dz.error })
      const v = designFor(dz.raw, pack)
      design = v.design
      if (v.problems.length) rt.log('design.ignored', { problems: v.problems })
    }
    if (menuP) {
      try {
        engine = mapMenu(await menuP, pack, base, undefined, design)
      } catch (e) {
        menuError = String(e)
        menuRetry = { source, pack, timeoutMs, design }
        rt.log('menu.loadFailed', { error: menuError })
      }
    }
    // With a menu error the kiosk still becomes "ready" so the Pay screen can run recovery on the brand pack's
    // texts; the guest flow stays closed (App shows the menu-failure card while no transaction is active).
    const lang = applyMenu(engine, config)
    useEngine.getState().setReady(config, lang)
    if (menuError) useEngine.getState().setMenuError(menuError)
    if (rt.controller.state.status === 'idle' && !menuError) restoreSession(config.sessionTtlMs)
    startSessionPersistence()

    useEngine.getState().setConn(resolved.adapters.connectivity.get())
    resolved.adapters.connectivity.subscribe((c) => {
      useEngine.getState().setConn(c)
      rt.log('connectivity.state', { kind: c.kind, ...(c.kind === 'connected' ? { role: c.role, epoch: c.epoch } : {}) })
    })
    if (!menuError) void catalogRefresh(refreshScope())
    rt.log('boot.ok', { adapters: resolved.adapters.kind, liveChecks, mode: config.mode, brand: engine.brand.id, catalog: source.source, design: !!design, menuError })
  } catch (e) {
    store.setBootError(String(e))
  }
}

/** While the menu is missing, retry it in the background (the Pay screen keeps working meanwhile). */
function useMenuRetry(menuError: string | null) {
  useEffect(() => {
    if (!menuError) return
    const id = setInterval(() => void retryMenu(), 30_000)
    return () => clearInterval(id)
  }, [menuError])
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
  const menuError = useEngine((s) => s.menuError)
  const screen = useEngine((s) => s.screen)
  const navDir = useEngine((s) => s.navDir)
  const pdpOpen = useEngine((s) => s.pdpOpen)
  const staffOpen = useEngine((s) => s.staffOpen)
  const lang = useEngine((s) => s.lang)
  const setScreen = useEngine((s) => s.setScreen)
  const pay = usePayState()
  const staffTap = useStaffTaps()
  useIdle()
  useMenuRetry(menuError)

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
  else if (menuError) body = <BootCard name={brandName} title={t('menuFailT')} sub={`${t('menuFailB')} (${menuError})`} fail onRetry={() => void retryMenu()} onAdminTap={staffTap} />
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
