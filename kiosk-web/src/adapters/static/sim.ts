// Simulation switches for the static adapters. Persisted so the staff panel settings
// survive a reload (needed to demo restart recovery). SIMULATION ONLY — never evidence.

export type SimPaymentResult = 'approved' | 'declined' | 'cancelled' | 'timeout' | 'terminal-offline' | 'unknown' | 'reject'
export type SimStatusResult = 'approved' | 'not-charged' | 'unknown'
export type SimPosResult = 'ok' | 'fail' | 'no-orderno'
export type SimConnectivity = 'local-primary' | 'local-secondary' | 'cloud' | 'reconnecting' | 'no-authority'

export interface SimSettings {
  paymentResult: SimPaymentResult
  paymentDelayMs: number
  statusResult: SimStatusResult
  cancelResult: 'cancelled' | 'approved' | 'unknown'
  posResult: SimPosResult
  printer: 'ok' | 'fail'
  health: 'ok' | 'down'
  hang: {
    paymentStart: boolean
    paymentStatus: boolean
    paymentCancel: boolean
    posSubmit: boolean
    print: boolean
    availability: boolean
    health: boolean
  }
  connectivity: SimConnectivity
  unavailableIds: string[]
  priceChanges: Record<string, number>
}

export const DEFAULT_SIM: SimSettings = {
  paymentResult: 'approved',
  paymentDelayMs: 4000,
  statusResult: 'approved',
  cancelResult: 'cancelled',
  posResult: 'ok',
  printer: 'ok',
  health: 'ok',
  hang: { paymentStart: false, paymentStatus: false, paymentCancel: false, posSubmit: false, print: false, availability: false, health: false },
  connectivity: 'local-primary',
  unavailableIds: [],
  priceChanges: {},
}

const KEY = 'guestit.sim.v1'

type Listener = (s: SimSettings) => void

export class SimStore {
  private settings: SimSettings
  private listeners = new Set<Listener>()

  constructor() {
    this.settings = load()
  }

  get(): SimSettings {
    return this.settings
  }

  set(patch: Partial<SimSettings>): void {
    this.settings = { ...this.settings, ...patch, hang: { ...this.settings.hang, ...(patch.hang ?? {}) } }
    save(this.settings)
    for (const l of this.listeners) l(this.settings)
  }

  reset(): void {
    this.settings = { ...DEFAULT_SIM, hang: { ...DEFAULT_SIM.hang } }
    save(this.settings)
    for (const l of this.listeners) l(this.settings)
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }
}

function load(): SimSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_SIM, hang: { ...DEFAULT_SIM.hang } }
    const parsed = JSON.parse(raw) as Partial<SimSettings>
    return { ...DEFAULT_SIM, ...parsed, hang: { ...DEFAULT_SIM.hang, ...(parsed.hang ?? {}) } }
  } catch {
    return { ...DEFAULT_SIM, hang: { ...DEFAULT_SIM.hang } }
  }
}

function save(s: SimSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* storage blocked: settings live in memory only */
  }
}
