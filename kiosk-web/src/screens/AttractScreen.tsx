import { useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'
import { LangSwitch, StatusIndicator, useStaffTrigger } from '../components/ui'

export function AttractScreen() {
  const { t, l } = useT()
  const cms = useKiosk((s) => s.cms)
  const venue = useKiosk((s) => s.config?.venueName ?? 'Guestit')
  const setScreen = useKiosk((s) => s.setScreen)
  const tap = useStaffTrigger()
  return (
    <div className="hero" onClick={() => setScreen('service')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setScreen('service')}>
      <div className="hero-top" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="logo hero-logo" onClick={tap} aria-label={venue}>
          <span className="logo-mark">G</span>
        </button>
        <StatusIndicator />
      </div>
      <div className="hero-body">
        <div className="hero-emoji" aria-hidden="true">
          🍔🥗🍟
        </div>
        <h1 className="hero-title">{venue}</h1>
        <p className="hero-tagline">{l(cms?.brand.tagline)}</p>
        <div className="hero-cta pulse">{t('attract.tap')}</div>
      </div>
      <div className="hero-bottom" onClick={(e) => e.stopPropagation()}>
        <LangSwitch />
      </div>
    </div>
  )
}

export function ServiceScreen() {
  const { t } = useT()
  const setService = useKiosk((s) => s.setService)
  const setScreen = useKiosk((s) => s.setScreen)
  const pick = (s: 'eat-in' | 'takeaway') => {
    setService(s)
    setScreen('menu')
  }
  return (
    <div className="hero service">
      <div className="hero-top">
        <LangSwitch compact />
        <StatusIndicator />
      </div>
      <div className="hero-body">
        <h1 className="hero-title">{t('service.title')}</h1>
        <div className="service-choices">
          <button type="button" className="service-card" onClick={() => pick('eat-in')}>
            <span className="service-emoji" aria-hidden="true">
              🍽️
            </span>
            <span>{t('service.eatIn')}</span>
          </button>
          <button type="button" className="service-card" onClick={() => pick('takeaway')}>
            <span className="service-emoji" aria-hidden="true">
              🥡
            </span>
            <span>{t('service.takeaway')}</span>
          </button>
        </div>
      </div>
      <div className="hero-bottom" />
    </div>
  )
}
