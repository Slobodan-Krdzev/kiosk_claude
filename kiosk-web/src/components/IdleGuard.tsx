import { useEffect, useRef, useState } from 'react'
import { getRuntime } from '../app/runtime'
import { clearSession } from '../app/session'
import { useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'
import { usePayState } from '../store/payment'
import { Button } from './ui'

/**
 * Inactivity reset. Never fires while a payment is active or uncertain (PAY_LOCKED_ACTIONS),
 * on the attract screen, or while the staff panel is open. The done screen has its own countdown.
 */
export function IdleGuard() {
  const screen = useKiosk((s) => s.screen)
  const staffOpen = useKiosk((s) => s.staffOpen)
  const cfg = useKiosk((s) => s.config?.idle)
  const resetSession = useKiosk((s) => s.resetSession)
  const pay = usePayState()
  const { t } = useT()
  const [countdown, setCountdown] = useState<number | null>(null)
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tick = useRef<ReturnType<typeof setInterval> | null>(null)

  const exempt = screen === 'attract' || staffOpen || pay.status !== 'idle'

  useEffect(() => {
    if (!cfg || exempt) {
      setCountdown(null)
      return
    }
    const arm = () => {
      if (warnTimer.current) clearTimeout(warnTimer.current)
      if (tick.current) clearInterval(tick.current)
      setCountdown(null)
      warnTimer.current = setTimeout(() => {
        setCountdown(Math.ceil(cfg.countdownMs / 1000))
      }, cfg.warnAfterMs)
    }
    const onActivity = () => {
      if (countdown !== null) return // the overlay has its own buttons
      arm()
    }
    arm()
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart', 'wheel']
    for (const e of events) window.addEventListener(e, onActivity, { passive: true })
    return () => {
      for (const e of events) window.removeEventListener(e, onActivity)
      if (warnTimer.current) clearTimeout(warnTimer.current)
      if (tick.current) clearInterval(tick.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, exempt, countdown === null])

  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      const ctrl = getRuntime().controller
      if (ctrl.isLocked()) {
        // idleExempt: never clear an uncertain or paid state
        setCountdown(null)
        return
      }
      getRuntime().log('idle.reset', { screen })
      clearSession()
      resetSession()
      setCountdown(null)
      return
    }
    const id = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000)
    return () => clearTimeout(id)
  }, [countdown, resetSession, screen])

  if (countdown === null || exempt) return null
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="overlay-card">
        <h2>{t('idle.title')}</h2>
        <p>{t('idle.body', { s: countdown })}</p>
        <div className="row gap">
          <Button variant="primary" size="lg" onClick={() => setCountdown(null)}>
            {t('idle.continue')}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              clearSession()
              resetSession()
              setCountdown(null)
            }}
          >
            {t('idle.restart')}
          </Button>
        </div>
      </div>
    </div>
  )
}
