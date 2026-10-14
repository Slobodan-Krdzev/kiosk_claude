import { useEffect } from 'react'
import { IdleGuard } from '../components/IdleGuard'
import { Spinner } from '../components/ui'
import { t } from '../i18n'
import { AttractScreen, ServiceScreen } from '../screens/AttractScreen'
import { CartScreen } from '../screens/CartScreen'
import { ConfirmationScreen } from '../screens/ConfirmationScreen'
import { MenuScreen } from '../screens/MenuScreen'
import { OrderTagScreen } from '../screens/OrderTagScreen'
import { PaymentScreen } from '../screens/PaymentScreen'
import { StaffPanel } from '../screens/StaffPanel'
import { UpsellScreen } from '../screens/UpsellScreen'
import { useKiosk } from '../store/kiosk'
import { usePayState } from '../store/payment'
import { createRuntime, resolveAdapters } from './runtime'
import { restoreSession, startSessionPersistence } from './session'

let bootStarted = false

/**
 * Boot sequence (v36 order): adapters → config → catalog → paid-record restore (BEFORE anything else)
 * → unpaid-session restore → connectivity → ready.
 */
async function boot(): Promise<void> {
  const store = useKiosk.getState()
  const resolved = resolveAdapters()
  try {
    const config = await resolved.adapters.catalog.config()
    if (config.mode === 'production' && resolved.adapters.kind === 'static') {
      throw new Error('production mode requires real adapters (window.GuestitAdapters) — refusing to run on the simulation')
    }
    const rt = createRuntime(resolved, config)
    const [catalog, cms] = await Promise.all([resolved.adapters.catalog.load(), resolved.adapters.catalog.cms()])
    document.documentElement.lang = config.defaultLang
    store.setBooted({ config, catalog, cms, lang: config.defaultLang })

    await rt.controller.restore()
    if (rt.controller.state.status === 'idle') {
      restoreSession(config.sessionTtlMs)
    }
    startSessionPersistence()

    store.setConn(resolved.adapters.connectivity.get())
    resolved.adapters.connectivity.subscribe((c) => {
      useKiosk.getState().setConn(c)
      rt.log('connectivity.state', { kind: c.kind, ...(c.kind === 'connected' ? { role: c.role, epoch: c.epoch } : {}) })
    })
    rt.log('boot.ok', { adapters: resolved.adapters.kind, mode: config.mode })
  } catch (e) {
    store.setBootError(String(e))
  }
}

export function App() {
  const booted = useKiosk((s) => s.booted)
  const bootError = useKiosk((s) => s.bootError)
  const screen = useKiosk((s) => s.screen)
  const staffOpen = useKiosk((s) => s.staffOpen)
  const preflight = useKiosk((s) => s.preflight)
  const cartLen = useKiosk((s) => s.cart.length)
  const setScreen = useKiosk((s) => s.setScreen)
  const lang = useKiosk((s) => s.lang)
  const pay = usePayState()

  useEffect(() => {
    if (bootStarted) return
    bootStarted = true
    void boot()
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Leaving the payment flow with nothing charged: back to the cart (or attract when it was emptied).
  useEffect(() => {
    if (booted && pay.status === 'idle' && screen === 'payment' && preflight.step === 'idle') {
      setScreen(cartLen ? 'cart' : 'attract')
    }
  }, [booted, pay.status, screen, preflight.step, cartLen, setScreen])

  if (bootError) {
    return (
      <div className="boot error">
        <p>{t('boot.failed', 'en')}</p>
        <pre className="mono small">{bootError}</pre>
      </div>
    )
  }
  if (!booted) {
    return (
      <div className="boot">
        <Spinner size="lg" />
      </div>
    )
  }

  let body: React.ReactNode
  if (pay.status === 'done') body = <ConfirmationScreen />
  else if (pay.status !== 'idle' || screen === 'payment') body = <PaymentScreen />
  else {
    switch (screen) {
      case 'attract':
        body = <AttractScreen />
        break
      case 'service':
        body = <ServiceScreen />
        break
      case 'menu':
        body = <MenuScreen />
        break
      case 'cart':
        body = <CartScreen />
        break
      case 'upsell':
        body = <UpsellScreen />
        break
      case 'tag':
        body = <OrderTagScreen />
        break
      default:
        body = <AttractScreen />
    }
  }

  return (
    <div className="kiosk">
      {body}
      <IdleGuard />
      {staffOpen ? <StaffPanel /> : null}
    </div>
  )
}
