// Staff panel (5 taps on the logo, PIN): diagnostics, simulation switches, logs. Styled with the engine utilities.

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { SimSettings } from '../adapters/static/sim'
import { getRuntime } from '../app/runtime'
import { numberRange, resolveTagMode } from '../domain/orderTag'
import { E } from '../engine/state'
import { useEngine } from '../store/engine'
import { usePayState } from '../store/payment'

const btn = 'press h-[64px] px-6 rounded-full bg-card shadow-soft text-[19px] font-bold'
const btnP = 'press h-[64px] px-6 rounded-full bg-jade text-white text-[19px] font-bold'
const btnD = 'press h-[64px] px-6 rounded-full bg-ember text-white text-[19px] font-bold'
const card = 'bg-card rounded-[24px] shadow-soft p-6 flex flex-col gap-3 text-[18px]'
const input = 'h-[56px] px-4 rounded-[12px] bg-paper text-[18px] font-semibold min-w-[220px]'

export function StaffPanel() {
  const setStaffOpen = useEngine((s) => s.setStaffOpen)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)
  useEffect(() => {
    if (pin.length !== 4 || authed) return
    void getRuntime()
      .resolved.adapters.auth.verify(pin)
      .then((r) => {
        if (r.ok) setAuthed(true)
        else {
          setWrong(true)
          setPin('')
        }
      })
  }, [pin, authed])
  return (
    <div className="absolute inset-0 z-[600] bg-paper flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-10 py-6 bg-card shadow-soft flex-none">
        <div className="hd text-[40px] tracking-[.03em]">Staff</div>
        <button type="button" className={btn} onClick={() => setStaffOpen(false)}>
          Close
        </button>
      </div>
      {!authed ? (
        <div className="flex-1 grid place-items-center">
          <div className="text-center">
            <div className="text-[24px] font-semibold text-mute mb-4">Enter the PIN</div>
            <div className="hd text-[64px] tracking-[.3em]">{'●'.repeat(pin.length).padEnd(4, '○')}</div>
            {wrong ? <div className="text-ember font-bold mt-2">Wrong PIN</div> : null}
            <div className="tag-pad mt-8">
              {'123456789'.split('').map((d) => (
                <button key={d} type="button" className="press tag-k num" onClick={() => setPin((p) => (p + d).slice(0, 4))}>
                  {d}
                </button>
              ))}
              <span />
              <button type="button" className="press tag-k num" onClick={() => setPin((p) => (p + '0').slice(0, 4))}>
                0
              </button>
              <button type="button" className="press tag-k tag-kdel" onClick={() => setPin((p) => p.slice(0, -1))}>
                ⌫
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Body />
      )}
    </div>
  )
}

function Body() {
  const rt = getRuntime()
  const pay = usePayState()
  const conn = useEngine((s) => s.conn)
  const config = useEngine((s) => s.config!)
  const newOrderReset = useEngine((s) => s.newOrderReset)
  const [tab, setTab] = useState<'status' | 'sim' | 'logs'>('status')
  const [reason, setReason] = useState('')
  const eatIn = resolveTagMode(config.orderTag, 'eat-in').mode
  const takeaway = resolveTagMode(config.orderTag, 'takeaway').mode
  const canClear = ['assistance', 'timeout', 'recovery-required', 'status-check'].includes(pay.status)
  const rng = (m: string) => (m === 'table' || m === 'pager' ? ` (${numberRange(config.orderTag, m).min}–${numberRange(config.orderTag, m).max})` : '')
  return (
    <div className="scroller flex-1 px-10 py-6">
      <div className="flex gap-3 mb-6">
        {(['status', 'sim', 'logs'] as const).map((k) => (
          <button key={k} type="button" className={`press h-[56px] px-6 rounded-full text-[18px] font-bold ${tab === k ? 'bg-ink text-cream' : 'bg-card shadow-soft'}`} onClick={() => setTab(k)}>
            {k === 'status' ? 'Status' : k === 'sim' ? 'Simulation' : 'Logs'}
          </button>
        ))}
      </div>
      {tab === 'status' ? (
        <div className="grid grid-cols-2 gap-5">
          <section className={card}>
            <div className="hd text-[26px]">Device</div>
            <div>Device ID · {rt.deviceId}</div>
            <div>Adapters · {rt.resolved.adapters.kind === 'static' ? 'static (simulation — not evidence)' : rt.resolved.adapters.kind}</div>
            <div>Mode · {config.mode}</div>
            <div>
              Brand · {E().brand.name} · products {E().products.length}
            </div>
          </section>
          <section className={card}>
            <div className="hd text-[26px]">Connection</div>
            <div>State · {conn.kind}</div>
            {conn.kind === 'connected' ? (
              <div>
                {conn.role} · {conn.nodeId} · epoch {conn.epoch}
              </div>
            ) : null}
            <button type="button" className={btn} onClick={() => rt.resolved.adapters.connectivity.requestRecovery()}>
              Re-resolve server
            </button>
          </section>
          <section className={card}>
            <div className="hd text-[26px]">Payment / order</div>
            <div>
              Status · <b>{pay.status}</b> {pay.assistanceNeeded ? '· assistance' : ''} {pay.restored ? '· restored' : ''}
            </div>
            <div className="num break-all">Order · {pay.orderId ?? '—'}</div>
            <div className="num break-all">Attempt · {pay.attemptId ?? '—'}</div>
            <div className="num break-all">Key · {pay.submitKey ?? '—'}</div>
            <div className="num">
              Tx · {pay.txRef ?? '—'} {pay.txRefGenerated ? '(generated)' : ''}
            </div>
            <div className="num">Recovery · {pay.recoveryRef ?? '—'}</div>
            <div>
              Order no · {pay.orderNo ?? '—'} {pay.duplicate ? '(duplicate)' : ''}
            </div>
            <div>Reason · {pay.uncertainReason ?? pay.lastError ?? '—'}</div>
            <div className="flex gap-3 flex-wrap">
              {pay.status === 'timeout' || pay.status === 'assistance' ? (
                <button type="button" className={btn} onClick={() => void rt.controller.staffCheckStatus()}>
                  Check payment status
                </button>
              ) : null}
              {pay.status === 'recovery-required' || pay.status === 'assistance' ? (
                <button type="button" className={btn} onClick={() => void rt.controller.submitRetry()}>
                  Resend order (same key)
                </button>
              ) : null}
            </div>
            {canClear ? (
              <div className="flex gap-3 flex-wrap items-center">
                <input className={input} placeholder="Reason (handled at POS…)" value={reason} onChange={(e) => setReason(e.target.value)} />
                <button
                  type="button"
                  className={btnD}
                  disabled={reason.trim().length < 3}
                  onClick={() => {
                    if (rt.controller.staffClear(reason.trim(), 'staff-pin')) {
                      newOrderReset()
                      setReason('')
                    }
                  }}
                >
                  Clear record (logged)
                </button>
              </div>
            ) : null}
          </section>
          <section className={card}>
            <div className="hd text-[26px]">Order tag (backend config, read-only)</div>
            <div>
              Eat-in · {eatIn}
              {rng(eatIn)}
            </div>
            <div>
              Takeaway · {takeaway}
              {rng(takeaway)}
            </div>
            <div>Required · {config.orderTag.required ? 'yes' : 'no'}</div>
            <div className="flex gap-3 flex-wrap">
              <button type="button" className={btn} onClick={() => window.location.reload()}>
                Reload app
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {tab === 'sim' ? <SimPanel /> : null}
      {tab === 'logs' ? <Logs /> : null}
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
  const handle = getRuntime().resolved.staticHandle
  const [, force] = useState(0)
  if (!sim || !handle) return <div className={card}>Simulation controls are only available on the static adapters.</div>
  const Sel = <K extends keyof SimSettings>({ k, options }: { k: K; options: string[] }) => (
    <select className={input} value={String(sim[k])} onChange={(e) => setSim({ [k]: e.target.value } as Partial<SimSettings>)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
  const row = (label: string, el: React.ReactNode) => (
    <label className="flex items-center justify-between gap-4">
      <span>{label}</span>
      {el}
    </label>
  )
  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="col-span-2 rounded-[20px] bg-gold/25 p-5 text-[19px] font-semibold">Simulation only. Nothing here is evidence of production behaviour.</div>
      <section className={card}>
        <div className="hd text-[26px]">Terminal</div>
        {row('Start result', <Sel k="paymentResult" options={['approved', 'declined', 'cancelled', 'timeout', 'terminal-offline', 'unknown', 'reject']} />)}
        {row('Status lookup', <Sel k="statusResult" options={['approved', 'not-charged', 'unknown']} />)}
        {row('Cancel result', <Sel k="cancelResult" options={['cancelled', 'approved', 'unknown']} />)}
        {row('Delay (ms)', <input className={input} type="number" min={300} step={500} value={sim.paymentDelayMs} onChange={(e) => setSim({ paymentDelayMs: Number(e.target.value) || 300 })} />)}
      </section>
      <section className={card}>
        <div className="hd text-[26px]">POS / printer / health</div>
        {row('POS submit', <Sel k="posResult" options={['ok', 'fail', 'no-orderno']} />)}
        {row('Printer', <Sel k="printer" options={['ok', 'fail']} />)}
        {row('Health', <Sel k="health" options={['ok', 'down']} />)}
        {row('Connectivity', <Sel k="connectivity" options={['local-primary', 'local-secondary', 'cloud', 'reconnecting', 'no-authority']} />)}
      </section>
      <section className={card}>
        <div className="hd text-[26px]">Hang (never answer → client timeout)</div>
        {(Object.keys(sim.hang) as (keyof SimSettings['hang'])[]).map((k) => (
          <label key={k} className="flex items-center gap-3">
            <input type="checkbox" className="w-6 h-6" checked={sim.hang[k]} onChange={(e) => setSim({ hang: { ...sim.hang, [k]: e.target.checked } })} /> {k}
          </label>
        ))}
      </section>
      <section className={card}>
        <div className="hd text-[26px]">Catalog</div>
        <div className="text-mute">Sold out (checked before payment) · price +0,50 (guest confirmation)</div>
        <div className="grid grid-cols-2 gap-2 max-h-[520px] overflow-y-auto">
          {E().products.map((p) => (
            <label key={p.id} className="flex items-center gap-2">
              <input type="checkbox" className="w-6 h-6" checked={sim.unavailableIds.includes(p.id)} onChange={(e) => setSim({ unavailableIds: e.target.checked ? [...sim.unavailableIds, p.id] : sim.unavailableIds.filter((x) => x !== p.id) })} />
              <span className="truncate flex-1">{p.name}</span>
              <button
                type="button"
                className={`text-jade underline ${sim.priceChanges[p.id] ? 'text-ember' : ''}`}
                onClick={() => {
                  const next = { ...sim.priceChanges }
                  if (next[p.id]) delete next[p.id]
                  else next[p.id] = p.price + 50
                  setSim({ priceChanges: next })
                }}
              >
                {sim.priceChanges[p.id] ? 'reset' : '+50'}
              </button>
            </label>
          ))}
        </div>
      </section>
      <section className={`${card} col-span-2`}>
        <div className="hd text-[26px]">Simulated backend ledgers</div>
        <pre className="text-[15px] max-h-[260px] overflow-auto">{JSON.stringify({ submittedKeys: handle.debug.submittedKeys(), charges: handle.debug.charges() }, null, 1)}</pre>
        <div className="flex gap-3 flex-wrap">
          <button type="button" className={btn} onClick={() => force((x) => x + 1)}>
            Refresh
          </button>
          <button
            type="button"
            className={btnD}
            onClick={() => {
              handle.debug.clearSimLedgers()
              force((x) => x + 1)
            }}
          >
            Clear ledgers
          </button>
          <button type="button" className={btnP} onClick={resetSim}>
            Reset simulation
          </button>
        </div>
      </section>
    </div>
  )
}

function Logs() {
  const rt = getRuntime()
  const [, force] = useState(0)
  const entries = rt.logEntries().slice(-80).reverse()
  return (
    <section className={card}>
      <div className="flex items-center justify-between">
        <div className="hd text-[26px]">Structured log</div>
        <button type="button" className={btn} onClick={() => force((x) => x + 1)}>
          Refresh
        </button>
      </div>
      <pre className="text-[15px] max-h-[900px] overflow-auto whitespace-pre-wrap">{entries.map((e) => `${e.at.slice(11, 23)} ${e.event} ${e.data ? JSON.stringify(e.data) : ''}`).join('\n') || '—'}</pre>
    </section>
  )
}
