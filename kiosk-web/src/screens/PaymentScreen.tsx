import { acceptPriceChanges, cancelPreflight, startPayment } from '../app/checkout'
import { getRuntime } from '../app/runtime'
import { Button, Note, Spinner, StatusIndicator } from '../components/ui'
import { productById } from '../domain/cart'
import { canSubmitWrites, guestMessageKey } from '../domain/connectivity'
import { useMoney, useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'
import { usePayState } from '../store/payment'

/** Everything from "Pay" until the order is accepted (the done state has its own screen). */
export function PaymentScreen() {
  const { t, l } = useT()
  const money = useMoney()
  const pay = usePayState()
  const preflight = useKiosk((s) => s.preflight)
  const conn = useKiosk((s) => s.conn)
  const catalog = useKiosk((s) => s.catalog)
  const ctrl = () => getRuntime().controller

  const amount = pay.snapshot?.totals.totalCents
  const connKey = guestMessageKey(conn)

  // The done state has its own screen (App). Guard against a render between two subscriptions.
  if (pay.status === 'done') return null

  // ----- Preflight (no attempt yet) -----
  if (pay.status === 'idle') {
    if (preflight.step === 'checking') {
      return (
        <Shell title={t('pay.title')}>
          <Spinner size="lg" />
          <p className="pay-msg">{t('cart.checking')}</p>
        </Shell>
      )
    }
    if (preflight.step === 'price-confirm') {
      return (
        <Shell title={t('price.title')}>
          <p className="pay-msg">{t('price.body')}</p>
          <ul className="price-changes">
            {preflight.changes.map((c) => {
              const p = catalog ? productById(catalog, c.productId) : undefined
              return (
                <li key={c.productId}>
                  <span>{l(p?.name) || c.productId}</span>
                  <span>
                    <s className="muted">{money(c.oldCents)}</s> → <strong>{money(c.newCents)}</strong>
                  </span>
                </li>
              )
            })}
          </ul>
          <div className="row gap">
            <Button variant="secondary" size="lg" onClick={cancelPreflight}>
              {t('price.back')}
            </Button>
            <Button variant="primary" size="lg" onClick={() => void acceptPriceChanges()}>
              {t('price.accept')}
            </Button>
          </div>
        </Shell>
      )
    }
    if (preflight.step === 'error') {
      const retryable = preflight.key !== 'pay.storeFail' && preflight.key !== 'cart.unavailableInCart'
      return (
        <Shell title={t('pay.title')}>
          <Note tone={preflight.key === 'pay.storeFail' ? 'danger' : 'warn'}>{t(preflight.key)}</Note>
          <div className="row gap">
            <Button variant="secondary" size="lg" onClick={cancelPreflight}>
              {t('pay.backToOrder')}
            </Button>
            {retryable ? (
              <Button variant="primary" size="lg" disabled={!canSubmitWrites(conn)} onClick={() => void startPayment()}>
                {t('pay.retry')}
              </Button>
            ) : null}
          </div>
        </Shell>
      )
    }
    return (
      <Shell title={t('pay.title')}>
        <Spinner size="lg" />
      </Shell>
    )
  }

  // ----- Active terminal -----
  if (pay.status === 'connecting' || pay.status === 'waiting-for-card' || pay.status === 'processing') {
    const msgKey = pay.status === 'connecting' ? 'pay.connecting' : pay.status === 'waiting-for-card' ? 'pay.waiting' : 'pay.processing'
    return (
      <Shell title={t('pay.title')}>
        <Amount cents={amount} />
        <Terminal active={pay.status === 'waiting-for-card'} />
        <p className="pay-msg">{t(msgKey)}</p>
        {pay.status !== 'processing' ? (
          <Button variant="ghost" size="lg" onClick={() => void ctrl().cancel()}>
            {t('pay.cancel')}
          </Button>
        ) : null}
      </Shell>
    )
  }

  if (pay.status === 'cancel-requested') {
    return (
      <Shell title={t('pay.title')}>
        <Amount cents={amount} />
        <Spinner size="lg" />
        <p className="pay-msg">{t('pay.cancelRequested')}</p>
      </Shell>
    )
  }

  // ----- Approved, sending to POS -----
  if (pay.status === 'approved' || pay.status === 'submitting') {
    return (
      <Shell title={t('pay.title')}>
        <div className="big-check" aria-hidden="true">
          ✓
        </div>
        <h2>{t('pay.approved')}</h2>
        <Spinner />
        <p className="pay-msg">{t('pay.submitting')}</p>
      </Shell>
    )
  }

  // ----- Nothing charged -----
  if (pay.status === 'declined' || pay.status === 'cancelled' || pay.status === 'terminal-offline') {
    const titleKey = pay.status === 'declined' ? 'pay.declined' : pay.status === 'cancelled' ? 'pay.cancelled' : 'pay.offline'
    const bodyKey = pay.status === 'declined' ? 'pay.declinedBody' : pay.status === 'cancelled' ? 'pay.cancelledBody' : 'pay.offlineBody'
    return (
      <Shell title={t('pay.title')}>
        <div className="big-x" aria-hidden="true">
          ✕
        </div>
        <h2>{t(titleKey)}</h2>
        <p className="pay-msg">{t(bodyKey)}</p>
        <div className="row gap">
          <Button variant="secondary" size="lg" onClick={() => ctrl().backToCart()}>
            {t('pay.backToOrder')}
          </Button>
          <Button variant="primary" size="lg" disabled={!canSubmitWrites(conn)} onClick={() => void startPayment()}>
            {pay.status === 'terminal-offline' ? t('pay.reconnect') : t('pay.retry')}
          </Button>
        </div>
        {connKey ? <Note tone="warn">{t(connKey)}</Note> : null}
      </Shell>
    )
  }

  // ----- Uncertain -----
  if (pay.status === 'timeout' || pay.status === 'lookup') {
    return (
      <Shell title={t('pay.title')} locked>
        <Amount cents={amount} />
        {pay.status === 'lookup' ? (
          <>
            <Spinner size="lg" />
            <p className="pay-msg">{t('pay.lookup')}</p>
          </>
        ) : (
          <>
            <div className="big-q" aria-hidden="true">
              ?
            </div>
            <h2>{t('pay.timeout')}</h2>
            <p className="pay-msg">{t('pay.timeoutBody')}</p>
            {pay.assistanceNeeded ? <Note tone="warn">{t('assist.body')}</Note> : null}
            <div className="row gap">
              <Button variant="primary" size="lg" onClick={() => void ctrl().lookup()}>
                {t('pay.checkStatus')}
              </Button>
            </div>
            <p className="muted small">{t('pay.callStaff')}</p>
          </>
        )}
      </Shell>
    )
  }

  // ----- Paid, order not confirmed -----
  if (pay.status === 'order-submit-failed' || pay.status === 'recovery-required') {
    return (
      <Shell title={t('recovery.title')} locked>
        <div className="big-check soft" aria-hidden="true">
          ✓
        </div>
        <h2>{t('recovery.title')}</h2>
        <p className="pay-msg">{t('recovery.body')}</p>
        <div className="ref-box">
          <span className="muted small">{t('recovery.ref')}</span>
          <strong>{pay.recoveryRef}</strong>
        </div>
        {connKey ? <Note tone={conn.kind === 'no-authority' ? 'danger' : 'warn'}>{t(connKey)}</Note> : null}
        <Button variant="primary" size="lg" disabled={!canSubmitWrites(conn)} onClick={() => void ctrl().submitRetry()}>
          {t('recovery.resend')}
        </Button>
        <p className="muted small">{t('pay.callStaff')}</p>
      </Shell>
    )
  }

  if (pay.status === 'status-check') {
    return (
      <Shell title={t('pay.title')} locked>
        <Spinner size="lg" />
        <p className="pay-msg">{t('pay.statusCheck')}</p>
      </Shell>
    )
  }

  // assistance
  return (
    <Shell title={t('assist.title')} locked>
      <div className="big-q" aria-hidden="true">
        !
      </div>
      <h2>{t('assist.title')}</h2>
      <p className="pay-msg">{t('assist.body')}</p>
      {pay.recoveryRef || pay.orderId ? (
        <div className="ref-box">
          <span className="muted small">{t('recovery.ref')}</span>
          <strong>{pay.recoveryRef ?? pay.orderId}</strong>
        </div>
      ) : null}
      <p className="muted small">{t('pay.callStaff')}</p>
    </Shell>
  )
}

function Shell({ title, children, locked }: { title: string; children: React.ReactNode; locked?: boolean }) {
  return (
    <div className={`screen pay ${locked ? 'locked' : ''}`}>
      <header className="pay-header">
        <span className="pay-title">{title}</span>
        <StatusIndicator />
      </header>
      <main className="content pay-body">{children}</main>
    </div>
  )
}

function Amount({ cents }: { cents: number | undefined }) {
  const { t } = useT()
  const money = useMoney()
  if (cents === undefined) return null
  return (
    <div className="pay-amount">
      <span className="muted">{t('pay.amount')}</span>
      <strong>{money(cents)}</strong>
    </div>
  )
}

function Terminal({ active }: { active: boolean }) {
  return (
    <div className={`terminal ${active ? 'active' : ''}`} aria-hidden="true">
      <div className="terminal-screen" />
      <div className="terminal-wave" />
      <div className="terminal-card">💳</div>
    </div>
  )
}
