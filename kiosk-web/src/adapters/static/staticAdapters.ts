// Static JSON adapters: fixtures from /mock/*.json plus a simulated terminal, POS and printer.
// This is a development stand-in. Nothing here is proof that production failover works.

import type { ConnectionState } from '../../domain/connectivity'
import type { Catalog, CatalogCurrent, Cms, GuestitConfig, LoyaltyMember } from '../../domain/types'
import type {
  AnalyticsAdapter,
  AnalyticsEvent,
  AuthAdapter,
  AvailabilityAdapter,
  CatalogAdapter,
  ConnectivityAdapter,
  GuestitAdapters,
  LoyaltyAdapter,
  PaymentAdapter,
  PaymentStartRequest,
  PaymentStartResult,
  PosAdapter,
  PosSubmitRequest,
  PrinterAdapter,
} from '../types'
import { delay } from '../withTimeout'
import { SimStore } from './sim'

const SUBMITTED_KEY = 'guestit.sim.submittedKeys.v1'
const CHARGES_KEY = 'guestit.sim.charges.v1'
const ANALYTICS_KEY = 'guestit.sim.analytics.v1'

function never(): Promise<never> {
  return new Promise(() => {})
}

async function fetchJson<T>(path: string): Promise<T> {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  const res = await fetch(`${base}mock/${path}`, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`fetch ${path}: HTTP ${res.status}`)
  return (await res.json()) as T
}

function readMap<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, T>
  } catch {
    return {}
  }
}

function writeMap<T>(key: string, map: Record<string, T>): void {
  try {
    localStorage.setItem(key, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

// ---------- Payment (simulated terminal) ----------

interface ChargeRecord {
  attemptId: string
  orderId: string
  amountMinor: number
  txRef: string
  at: string
}

class SimPayment implements PaymentAdapter {
  private readonly sim: SimStore
  constructor(sim: SimStore) {
    this.sim = sim
  }

  async start(req: PaymentStartRequest, onProgress?: (p: 'waiting-for-card' | 'processing') => void): Promise<PaymentStartResult> {
    const s = this.sim.get()
    if (s.hang.paymentStart) return never()
    const step = Math.max(300, s.paymentDelayMs / 3)
    await delay(step)
    onProgress?.('waiting-for-card')
    if (s.paymentResult === 'terminal-offline') return { result: 'terminal-offline' }
    await delay(step)
    onProgress?.('processing')
    await delay(step)
    // Re-read: a staff member may have flipped the switch while "the card was being read".
    const r = this.sim.get().paymentResult
    switch (r) {
      case 'approved': {
        const txRef = `SIM-${Date.now().toString(36).toUpperCase()}`
        const charges = readMap<ChargeRecord>(CHARGES_KEY)
        // One attemptId = at most one charge.
        if (!charges[req.attemptId]) {
          charges[req.attemptId] = { attemptId: req.attemptId, orderId: req.orderId, amountMinor: req.amountMinor, txRef, at: new Date().toISOString() }
          writeMap(CHARGES_KEY, charges)
        }
        return { result: 'approved', txRef: charges[req.attemptId].txRef }
      }
      case 'declined':
        return { result: 'declined' }
      case 'cancelled':
        return { result: 'cancelled' }
      case 'timeout':
        return { result: 'timeout' }
      case 'terminal-offline':
        return { result: 'terminal-offline' }
      case 'unknown':
        return {} as PaymentStartResult // malformed answer on purpose
      case 'reject':
        throw new Error('simulated adapter failure')
    }
  }

  async status(req: { attemptId: string; orderId: string }) {
    const s = this.sim.get()
    if (s.hang.paymentStatus) return never()
    await delay(800)
    const charges = readMap<ChargeRecord>(CHARGES_KEY)
    const charged = charges[req.attemptId]
    // The simulated terminal's own ledger is authoritative when it knows the attempt.
    if (charged) return { result: 'approved' as const, txRef: charged.txRef }
    if (s.statusResult === 'approved') {
      const txRef = `SIM-${Date.now().toString(36).toUpperCase()}`
      charges[req.attemptId] = { attemptId: req.attemptId, orderId: req.orderId, amountMinor: 0, txRef, at: new Date().toISOString() }
      writeMap(CHARGES_KEY, charges)
      return { result: 'approved' as const, txRef }
    }
    return { result: s.statusResult }
  }

  async cancel(req: { attemptId: string }) {
    const s = this.sim.get()
    if (s.hang.paymentCancel) return never()
    await delay(900)
    const charges = readMap<ChargeRecord>(CHARGES_KEY)
    if (charges[req.attemptId]) return { result: 'approved' as const, txRef: charges[req.attemptId].txRef }
    return { result: s.cancelResult }
  }
}

// ---------- POS (simulated durable idempotency) ----------

interface SubmittedRecord {
  orderNo: string
  orderId: string
  at: string
}

class SimPos implements PosAdapter {
  private readonly sim: SimStore
  constructor(sim: SimStore) {
    this.sim = sim
  }

  async submit(req: PosSubmitRequest) {
    const s = this.sim.get()
    if (s.hang.posSubmit) return never()
    await delay(1200)
    const keys = readMap<SubmittedRecord>(SUBMITTED_KEY)
    const existing = keys[req.idempotencyKey]
    if (existing) return { orderNo: existing.orderNo, duplicate: true }
    if (s.posResult === 'fail') throw new Error('simulated POS failure')
    if (s.posResult === 'no-orderno') return { orderNo: '', duplicate: false }
    const n = Object.keys(keys).length + 101
    const orderNo = String(n)
    keys[req.idempotencyKey] = { orderNo, orderId: req.orderId, at: new Date().toISOString() }
    writeMap(SUBMITTED_KEY, keys)
    return { orderNo, duplicate: false }
  }

  async health() {
    const s = this.sim.get()
    if (s.hang.health) return never()
    await delay(200)
    return { ok: s.health === 'ok' }
  }
}

class SimPrinter implements PrinterAdapter {
  private readonly sim: SimStore
  constructor(sim: SimStore) {
    this.sim = sim
  }
  async print() {
    const s = this.sim.get()
    if (s.hang.print) return never()
    await delay(1000)
    return { printed: s.printer === 'ok' }
  }
}

class SimAvailability implements AvailabilityAdapter {
  private readonly sim: SimStore
  constructor(sim: SimStore) {
    this.sim = sim
  }
  async check(productIds: string[]) {
    const s = this.sim.get()
    if (s.hang.availability) return never()
    const fixture = await fetchJson<{ unavailableIds: string[] }>('availability.json')
    const set = new Set([...fixture.unavailableIds, ...s.unavailableIds])
    await delay(400)
    return { unavailableIds: productIds.filter((id) => set.has(id)) }
  }
}

class StaticCatalog implements CatalogAdapter {
  private readonly sim: SimStore
  constructor(sim: SimStore) {
    this.sim = sim
  }
  config() {
    return fetchJson<GuestitConfig>('config.json')
  }
  load() {
    return fetchJson<Catalog>('catalog.json')
  }
  cms() {
    return fetchJson<Cms>('cms.json')
  }
  async current() {
    const base = await fetchJson<CatalogCurrent>('catalog-current.json')
    const s = this.sim.get()
    return { ...base, prices: { ...base.prices, ...s.priceChanges }, disabled: [...base.disabled, ...s.unavailableIds] }
  }
}

class StaticAuth implements AuthAdapter {
  private readonly getPin: () => string | undefined
  constructor(getPin: () => string | undefined) {
    this.getPin = getPin
  }
  async verify(pin: string) {
    await delay(300)
    const expected = this.getPin()
    return { ok: !!expected && pin === expected }
  }
}

class StaticLoyalty implements LoyaltyAdapter {
  async identify(code: string): Promise<LoyaltyMember | null> {
    const data = await fetchJson<{ members: (LoyaltyMember & { code: string })[] }>('members.json')
    await delay(400)
    const m = data.members.find((x) => x.code === code)
    return m ? { id: m.id, name: m.name, points: m.points } : null
  }
  async commit(req: { key: string }) {
    const commits = readMap<string>('guestit.sim.loyaltyCommits.v1')
    if (!commits[req.key]) {
      commits[req.key] = new Date().toISOString()
      writeMap('guestit.sim.loyaltyCommits.v1', commits)
    }
    return { ok: true }
  }
}

class LocalAnalytics implements AnalyticsAdapter {
  send(events: AnalyticsEvent[]) {
    try {
      const existing = JSON.parse(localStorage.getItem(ANALYTICS_KEY) ?? '[]') as AnalyticsEvent[]
      const next = [...existing, ...events].slice(-200)
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }
}

// ---------- Connectivity (simulated; the real source is the backend/Launcher) ----------

class SimConnectivity implements ConnectivityAdapter {
  private state: ConnectionState
  private listeners = new Set<(s: ConnectionState) => void>()
  private epoch = 41
  private timer: ReturnType<typeof setTimeout> | null = null

  private readonly sim: SimStore

  constructor(sim: SimStore) {
    this.sim = sim
    this.state = this.fromSim(sim.get().connectivity)
    sim.subscribe((s) => this.transitionTo(s.connectivity))
  }

  get() {
    return this.state
  }

  subscribe(cb: (s: ConnectionState) => void) {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  requestRecovery() {
    // Re-resolve: in the simulation, just re-emit the configured state.
    this.set(this.fromSim(this.sim.get().connectivity))
  }

  private fromSim(c: string): ConnectionState {
    switch (c) {
      case 'local-secondary':
        return { kind: 'connected', role: 'LOCAL_SECONDARY', nodeId: 'V-DEMO-B', epoch: this.epoch }
      case 'cloud':
        return { kind: 'connected', role: 'CLOUD_ACTIVE', nodeId: 'cloud-eu1', epoch: this.epoch }
      case 'reconnecting':
        return { kind: 'resolving', attempt: 1 }
      case 'no-authority':
        return { kind: 'no-authority', reason: 'simulated', retryAt: Date.now() + 8000 }
      default:
        return { kind: 'connected', role: 'LOCAL_PRIMARY', nodeId: 'V-DEMO-A', epoch: this.epoch }
    }
  }

  /** Plays the handover's state machine (suspect → resolving → switching → reconciling → connected). */
  private transitionTo(c: string) {
    if (this.timer) clearTimeout(this.timer)
    const target = this.fromSim(c)
    const current = this.state
    if (target.kind !== 'connected' || current.kind !== 'connected' || current.role === target.role) {
      this.set(target)
      return
    }
    this.epoch += 1
    const to = target.nodeId
    const steps: ConnectionState[] = [
      { kind: 'suspect', since: Date.now(), reason: 'timeout' },
      { kind: 'resolving', attempt: 1 },
      { kind: 'switching', from: current.nodeId, to, epoch: this.epoch },
      { kind: 'reconciling', pending: 0, unknown: 0 },
      { ...target, epoch: this.epoch },
    ]
    let i = 0
    const tick = () => {
      this.set(steps[i])
      i += 1
      if (i < steps.length) this.timer = setTimeout(tick, i === steps.length - 1 ? 600 : 1200)
    }
    tick()
  }

  private set(s: ConnectionState) {
    this.state = s
    for (const l of this.listeners) l(s)
  }
}

export interface StaticAdaptersHandle {
  adapters: GuestitAdapters
  sim: SimStore
  /** Diagnostics for the staff panel. */
  debug: {
    submittedKeys(): Record<string, SubmittedRecord>
    charges(): Record<string, ChargeRecord>
    analytics(): AnalyticsEvent[]
    clearSimLedgers(): void
  }
}

export function createStaticAdapters(): StaticAdaptersHandle {
  const sim = new SimStore()
  let pin: string | undefined
  const catalog = new StaticCatalog(sim)
  const wrappedCatalog: CatalogAdapter = {
    async config() {
      const c = await catalog.config()
      pin = c.staffPin
      return c
    },
    load: () => catalog.load(),
    cms: () => catalog.cms(),
    current: () => catalog.current(),
  }
  const adapters: GuestitAdapters = {
    kind: 'static',
    payment: new SimPayment(sim),
    pos: new SimPos(sim),
    printer: new SimPrinter(sim),
    availability: new SimAvailability(sim),
    catalog: wrappedCatalog,
    auth: new StaticAuth(() => pin),
    loyalty: new StaticLoyalty(),
    analytics: new LocalAnalytics(),
    connectivity: new SimConnectivity(sim),
  }
  return {
    adapters,
    sim,
    debug: {
      submittedKeys: () => readMap<SubmittedRecord>(SUBMITTED_KEY),
      charges: () => readMap<ChargeRecord>(CHARGES_KEY),
      analytics: () => {
        try {
          return JSON.parse(localStorage.getItem(ANALYTICS_KEY) ?? '[]') as AnalyticsEvent[]
        } catch {
          return []
        }
      },
      clearSimLedgers: () => {
        try {
          localStorage.removeItem(SUBMITTED_KEY)
          localStorage.removeItem(CHARGES_KEY)
          localStorage.removeItem(ANALYTICS_KEY)
        } catch {
          /* ignore */
        }
      },
    },
  }
}
