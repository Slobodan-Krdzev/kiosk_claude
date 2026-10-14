import { useEffect, useState } from 'react'
import { getRuntime } from '../app/runtime'
import { clearSession } from '../app/session'
import { Button, StatusIndicator } from '../components/ui'
import { useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'
import { usePayState } from '../store/payment'

/** Shown only when the POS accepted the order (status 'done'). */
export function ConfirmationScreen() {
  const { t } = useT()
  const pay = usePayState()
  const autoMs = useKiosk((s) => s.config?.doneAutoResetMs ?? 30000)
  const resetSession = useKiosk((s) => s.resetSession)
  const [left, setLeft] = useState(Math.ceil(autoMs / 1000))

  const newOrder = () => {
    if (getRuntime().controller.reset()) {
      clearSession()
      resetSession()
    }
  }

  useEffect(() => {
    // Wait for the print step before counting down so the record is cleared first.
    if (pay.receipt === 'printing') return
    if (left <= 0) {
      newOrder()
      return
    }
    const id = setTimeout(() => setLeft((x) => x - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, pay.receipt])

  const tag = pay.snapshot?.tag
  return (
    <div className="screen done">
      <header className="pay-header">
        <span className="pay-title">{t('done.title')}</span>
        <StatusIndicator />
      </header>
      <main className="content done-body">
        <div className="big-check" aria-hidden="true">
          ✓
        </div>
        <h1>{t('done.title')}</h1>
        <div className="done-no">
          <span className="muted">{t('done.orderNo')}</span>
          <strong>{pay.orderNo}</strong>
        </div>
        {tag ? <p className="done-tag">{t(`done.tag.${tag.type}`, { value: tag.value })}</p> : null}
        <p className="muted">{t('done.kitchenPending')}</p>
        <p className={`receipt ${pay.receipt}`}>{t(`done.receipt.${pay.receipt === 'none' ? 'unknown' : pay.receipt}`)}</p>
      </main>
      <footer className="bottombar center">
        <Button variant="primary" size="lg" onClick={newOrder} disabled={pay.receipt === 'printing'}>
          {t('done.newOrder')}
        </Button>
        {pay.receipt !== 'printing' ? <span className="muted small">{t('done.autoReset', { s: left })}</span> : null}
      </footer>
    </div>
  )
}
