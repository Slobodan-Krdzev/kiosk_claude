import { useEffect, useState, useSyncExternalStore } from 'react'
import type { SimSettings } from '../adapters/static/sim'
import { getRuntime } from '../app/runtime'
import { Button, Keypad, Note } from '../components/ui'
import { numberRange, resolveTagMode } from '../domain/orderTag'
import { useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'
import { usePayState } from '../store/payment'

export function StaffPanel() {
  const { t } = useT()
  const setStaffOpen = useKiosk((s) => s.setStaffOpen)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const verify = async (p: string) => {
    setBusy(true)
    try {
      const r = await getRuntime().resolved.adapters.auth.verify(p)
      if (r.ok) {
        setAuthed(true)
        getRuntime().log('staff.open')
      } else {
        setError(t('staff.pinWrong'))
        setPin('')
      }
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (pin.length === 4 && !busy && !authed) void verify(pin)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  return (
    <div className="staff-backdrop" role="dialog" aria-modal="true">
      <div className="staff">
        <header className="staff-header">
          <h2>{t('staff.title')}</h2>
          <Button variant="ghost" onClick={() => setStaffOpen(false)}>
            {t('staff.close')}
          </Button>
        </header>
        {!authed ? (
          <div className="staff-pin">
            <p>{t('staff.pin')}</p>
            <div className="code-display">{'●'.repeat(pin.length).padEnd(4, '○')}</div>
            {error ? <Note tone="danger">{error}</Note> : null}
            <Keypad value={pin} onChange={setPin} maxLen={4} />
          </div>
        ) : (
          <StaffBody />
        )}
      </div>
    </div>
  )
}

function StaffBody() {
  const rt = getRuntime()
  const pay = usePayState()
  const conn = useKiosk((s) => s.conn)
  const config = useKiosk((s) => s.config!)
  const catalog = useKiosk((s) => s.catalog!)
  const clientErrors = useKiosk((s) => s.clientErrors)
  const [tab, setTab] = useState<'status' | 'sim' | 'logs'>('status')
  const [clearReason, setClearReason] = useState('')
  const [, force] = useState(0)
  const record = (() => {
    try {
      return localStorage.getItem('guestit.paidOrder.v3')
    } catch {
      return null
    }
  })()
  const eatIn = resolveTagMode(config.orderTag, 'eat-in').mode
  const takeaway = resolveTagMode(config.orderTag, 'takeaway').mode
  const canStaffClear = pay.status === 'assistance' || pay.status === 'timeout' || pay.status === 'recovery-required' || pay.status === 'status-check'

  return (
    <div className="staff-body">
      <nav className="tabs">
        {(['status', 'sim', 'logs'] as const).map((k) => (
          <button key={k} type="button" className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {k === 'status' ? 'Status' : k === 'sim' ? 'Simulation' : 'Logs'}
          </button>
        ))}
      </nav>

      {tab === 'status' ? (
        <div className="staff-grid">
          <section className="card">
            <h3>Device</h3>
            <dl>
              <dt>Device ID</dt>
              <dd>{rt.deviceId}</dd>
              <dt>Adapters</dt>
              <dd>
                {rt.resolved.adapters.kind} {rt.resolved.adapters.kind === 'static' ? '(simulation — not evidence)' : ''}
              </dd>
              <dt>Mode</dt>
              <dd>{config.mode}</dd>
              <dt>Venue / tenant</dt>
              <dd>
                {config.venueId} / {config.tenantId}
              </dd>
              <dt>Catalog version</dt>
              <dd>{catalog.version}</dd>
            </dl>
          </section>

          <section className="card">
            <h3>Connection</h3>
            <dl>
              <dt>State</dt>
              <dd>{conn.kind}</dd>
              {conn.kind === 'connected' ? (
                <>
                  <dt>Role / node</dt>
                  <dd>
                    {conn.role} · {conn.nodeId}
                  </dd>
                  <dt>Epoch</dt>
                  <dd>{conn.epoch}</dd>
                </>
              ) : null}
            </dl>
            <Button onClick={() => rt.resolved.adapters.connectivity.requestRecovery()}>Re-resolve server</Button>
          </section>

          <section className="card">
            <h3>Payment / order</h3>
            <dl>
              <dt>Status</dt>
              <dd>
                <strong>{pay.status}</strong> {pay.assistanceNeeded ? '· assistance' : ''} {pay.restored ? '· restored' : ''}
              </dd>
              <dt>Order ID</dt>
              <dd className="mono">{pay.orderId ?? '—'}</dd>
              <dt>Attempt</dt>
              <dd className="mono">{pay.attemptId ?? '—'}</dd>
              <dt>Idempotency key</dt>
              <dd className="mono">{pay.submitKey ?? '—'}</dd>
              <dt>Tx ref</dt>
              <dd className="mono">
                {pay.txRef ?? '—'} {pay.txRefGenerated ? '(generated — provider gave none)' : ''}
              </dd>
              <dt>Recovery ref</dt>
              <dd className="mono">{pay.recoveryRef ?? '—'}</dd>
              <dt>Order no</dt>
              <dd>
                {pay.orderNo ?? '—'} {pay.duplicate ? '(duplicate: already known to POS)' : ''}
              </dd>
              <dt>Uncertain reason</dt>
              <dd>{pay.uncertainReason ?? pay.lastError ?? '—'}</dd>
              <dt>Durable record</dt>
              <dd>{record ? 'present' : 'none'}</dd>
            </dl>
            <div className="row gap wrap">
              {pay.status === 'timeout' || pay.status === 'assistance' ? <Button onClick={() => void rt.controller.staffCheckStatus()}>Check payment status</Button> : null}
              {pay.status === 'recovery-required' || pay.status === 'assistance' ? <Button onClick={() => void rt.controller.submitRetry()}>Resend order (same key)</Button> : null}
            </div>
            {canStaffClear ? (
              <div className="staff-clear">
                <input className="input" placeholder="Reason (handled at POS, refunded, …)" value={clearReason} onChange={(e) => setClearReason(e.target.value)} />
                <Button
                  variant="danger"
                  disabled={clearReason.trim().length < 3}
                  onClick={() => {
                    if (rt.controller.staffClear(clearReason.trim(), 'staff-pin')) {
                      useKiosk.getState().resetSession()
                      setClearReason('')
                    }
                  }}
                >
                  Clear record (logged override)
                </Button>
              </div>
            ) : null}
            {pay.rawRecovery ? (
              <details>
                <summary>Raw invalid record</summary>
                <pre className="mono small">{pay.rawRecovery}</pre>
              </details>
            ) : null}
          </section>

          <section className="card">
            <h3>Order tag (read-only, from backend config)</h3>
            <dl>
              <dt>Eat-in</dt>
              <dd>
                {eatIn} {eatIn === 'table' || eatIn === 'pager' ? `(${numberRange(config.orderTag, eatIn).min}–${numberRange(config.orderTag, eatIn).max})` : ''}
              </dd>
              <dt>Takeaway</dt>
              <dd>
                {takeaway} {takeaway === 'table' || takeaway === 'pager' ? `(${numberRange(config.orderTag, takeaway).min}–${numberRange(config.orderTag, takeaway).max})` : ''}
              </dd>
              <dt>Required</dt>
              <dd>{config.orderTag.required ? 'yes' : 'no (skip allowed)'}</dd>
              <dt>Name length</dt>
              <dd>
                {config.orderTag.nameMin}–{config.orderTag.nameMax}
              </dd>
            </dl>
            {clientErrors.length ? <Note tone="warn">{clientErrors[clientErrors.length - 1]}</Note> : null}
          </section>

          <section className="card">
            <h3>App</h3>
            <div className="row gap wrap">
              <Button onClick={() => window.location.reload()}>Reload app</Button>
              <Button onClick={() => force((x) => x + 1)}>Refresh view</Button>
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'sim' ? <SimPanel /> : null}
      {tab === 'logs' ? <LogsPanel /> : null}
    </div>
  )
}

function useSim(): [SimSettings | null, (p: Partial<SimSettings>) => void, () => void] {
  const handle = getRuntime().resolved.staticHandle
  const settings = useSyncExternalStore(
    (cb) => (handle ? handle.sim.subscribe(() => cb()) : () => {}),
    () => (handle ? handle.sim.get() : null),
    () => (handle ? handle.sim.get() : null),
  )
  return [settings, (p) => handle?.sim.set(p), () => handle?.sim.reset()]
}

function SimPanel() {
  const [sim, setSim, resetSim] = useSim()
  const catalog = useKiosk((s) => s.catalog!)
  const handle = getRuntime().resolved.staticHandle
  const [, force] = useState(0)
  if (!sim || !handle) return <Note>Simulation controls are only available on the static adapters.</Note>

  const Select = <K extends keyof SimSettings>({ k, options }: { k: K; options: string[] }) => (
    <select className="input" value={String(sim[k])} onChange={(e) => setSim({ [k]: e.target.value } as Partial<SimSettings>)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )

  return (
    <div className="staff-grid">
      <Note tone="warn">Simulation only. Nothing here is evidence of production behaviour (handover rule 5).</Note>

      <section className="card">
        <h3>Terminal</h3>
        <label>
          Start result <Select k="paymentResult" options={['approved', 'declined', 'cancelled', 'timeout', 'terminal-offline', 'unknown', 'reject']} />
        </label>
        <label>
          Status lookup result <Select k="statusResult" options={['approved', 'not-charged', 'unknown']} />
        </label>
        <label>
          Cancel result <Select k="cancelResult" options={['cancelled', 'approved', 'unknown']} />
        </label>
        <label>
          Delay (ms){' '}
          <input className="input" type="number" min={300} step={500} value={sim.paymentDelayMs} onChange={(e) => setSim({ paymentDelayMs: Number(e.target.value) || 300 })} />
        </label>
      </section>

      <section className="card">
        <h3>POS / printer / health</h3>
        <label>
          POS submit <Select k="posResult" options={['ok', 'fail', 'no-orderno']} />
        </label>
        <label>
          Printer <Select k="printer" options={['ok', 'fail']} />
        </label>
        <label>
          Health <Select k="health" options={['ok', 'down']} />
        </label>
      </section>

      <section className="card">
        <h3>Hang (never answer → client timeout)</h3>
        <div className="checks">
          {(Object.keys(sim.hang) as (keyof SimSettings['hang'])[]).map((k) => (
            <label key={k} className="check">
              <input type="checkbox" checked={sim.hang[k]} onChange={(e) => setSim({ hang: { ...sim.hang, [k]: e.target.checked } })} /> {k}
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Connectivity scenario</h3>
        <p className="muted small">Switching between connected roles plays suspect → resolving → switching → reconciling → connected with a new epoch.</p>
        <Select k="connectivity" options={['local-primary', 'local-secondary', 'cloud', 'reconnecting', 'no-authority']} />
      </section>

      <section className="card">
        <h3>Catalog</h3>
        <p className="muted small">Unavailable products (checked at payment) and a price change (+€0.50) to trigger the guest confirmation.</p>
        <div className="checks">
          {catalog.products.map((p) => (
            <label key={p.id} className="check">
              <input
                type="checkbox"
                checked={sim.unavailableIds.includes(p.id)}
                onChange={(e) => setSim({ unavailableIds: e.target.checked ? [...sim.unavailableIds, p.id] : sim.unavailableIds.filter((x) => x !== p.id) })}
              />{' '}
              {p.name.en}
              <button
                type="button"
                className={`link ${sim.priceChanges[p.id] ? 'danger' : ''}`}
                onClick={() => {
                  const next = { ...sim.priceChanges }
                  if (next[p.id]) delete next[p.id]
                  else next[p.id] = p.priceCents + 50
                  setSim({ priceChanges: next })
                }}
              >
                {sim.priceChanges[p.id] ? `price ${sim.priceChanges[p.id]}¢ (reset)` : '+50¢'}
              </button>
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Ledgers (simulated backend)</h3>
        <details open>
          <summary>Submitted idempotency keys ({Object.keys(handle.debug.submittedKeys()).length})</summary>
          <pre className="mono small">{JSON.stringify(handle.debug.submittedKeys(), null, 1)}</pre>
        </details>
        <details>
          <summary>Charges — one per attemptId ({Object.keys(handle.debug.charges()).length})</summary>
          <pre className="mono small">{JSON.stringify(handle.debug.charges(), null, 1)}</pre>
        </details>
        <div className="row gap wrap">
          <Button onClick={() => force((x) => x + 1)}>Refresh</Button>
          <Button
            variant="danger"
            onClick={() => {
              handle.debug.clearSimLedgers()
              force((x) => x + 1)
            }}
          >
            Clear simulated ledgers
          </Button>
          <Button onClick={resetSim}>Reset simulation</Button>
        </div>
      </section>
    </div>
  )
}

function LogsPanel() {
  const rt = getRuntime()
  const [, force] = useState(0)
  const entries = rt.logEntries().slice(-60).reverse()
  const analytics = rt.resolved.staticHandle?.debug.analytics().slice(-20).reverse() ?? []
  return (
    <div className="staff-grid">
      <section className="card">
        <h3>Structured log (no personal or card data)</h3>
        <Button onClick={() => force((x) => x + 1)}>Refresh</Button>
        <pre className="mono small log">
          {entries.map((e) => `${e.at.slice(11, 23)} ${e.event} ${e.data ? JSON.stringify(e.data) : ''}\n`).join('') || '—'}
        </pre>
      </section>
      <section className="card">
        <h3>Analytics events</h3>
        <pre className="mono small log">{analytics.map((e) => `${e.at.slice(11, 19)} ${e.type} ${e.data ? JSON.stringify(e.data) : ''}\n`).join('') || '—'}</pre>
      </section>
    </div>
  )
}
