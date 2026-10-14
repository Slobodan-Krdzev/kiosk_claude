// The adapter boundary. The UI and the payment state machine talk ONLY to these interfaces.
// Implementations: StaticJsonAdapters (now), later a Guestit Launcher JS bridge or HTTP client.
// Semantics follow failover-handover/docs/reference/kiosk-backend-requirements-v36.md:
// a timeout always means "outcome unknown", never "failed".

import type { ConnectionState } from '../domain/connectivity'
import type { Catalog, CatalogCurrent, Cms, GuestitConfig, LoyaltyMember, OrderSnapshot } from '../domain/types'

export type PaymentProgress = 'waiting-for-card' | 'processing'

export interface PaymentStartRequest {
  attemptId: string
  orderId: string
  amountMinor: number
  currency: string
}

export interface PaymentStartResult {
  result: 'approved' | 'declined' | 'cancelled' | 'timeout' | 'terminal-offline'
  txRef?: string
}

export interface PaymentStatusResult {
  result: 'approved' | 'not-charged' | 'unknown'
  txRef?: string
}

export interface PaymentCancelResult {
  result: 'cancelled' | 'not-charged' | 'approved' | 'unknown'
  txRef?: string
}

export interface PaymentAdapter {
  /** One attemptId = at most one charge. Progress callbacks are cosmetic, never an outcome. */
  start(req: PaymentStartRequest, onProgress?: (p: PaymentProgress) => void): Promise<PaymentStartResult>
  /** Authoritative, idempotent, available after a restart. */
  status(req: { attemptId: string; orderId: string }): Promise<PaymentStatusResult>
  /** A request, not a guarantee. */
  cancel(req: { attemptId: string }): Promise<PaymentCancelResult>
}

export interface PosSubmitRequest {
  idempotencyKey: string
  orderId: string
  attemptId: string
  txRef: string
  snapshot: OrderSnapshot
}

export interface PosSubmitResult {
  orderNo: string
  duplicate: boolean
}

export interface PosAdapter {
  /** Durable idempotency: same key always returns the same order (duplicate: true). */
  submit(req: PosSubmitRequest): Promise<PosSubmitResult>
  health(): Promise<{ ok: boolean }>
}

export interface PrinterAdapter {
  print(req: { orderNo: string; snapshot: OrderSnapshot }): Promise<{ printed: boolean }>
}

export interface AvailabilityAdapter {
  check(productIds: string[]): Promise<{ unavailableIds: string[] }>
}

export interface CatalogAdapter {
  config(): Promise<GuestitConfig>
  load(): Promise<Catalog>
  cms(): Promise<Cms>
  current(): Promise<CatalogCurrent>
}

export interface AuthAdapter {
  verify(pin: string): Promise<{ ok: boolean }>
}

export interface LoyaltyAdapter {
  identify(code: string): Promise<LoyaltyMember | null>
  /** Idempotent on the key (LTY-<orderId>). Called after POS acceptance. */
  commit(req: { key: string; memberId: string; orderId: string; totalCents: number }): Promise<{ ok: boolean }>
}

export interface AnalyticsEvent {
  type: string
  at: string
  data?: Record<string, string | number | boolean | null>
}

export interface AnalyticsAdapter {
  send(events: AnalyticsEvent[]): void
}

export interface ConnectivityAdapter {
  get(): ConnectionState
  subscribe(cb: (s: ConnectionState) => void): () => void
  /** Staff action: re-resolve now. Never forces a writer. */
  requestRecovery(): void
}

export interface GuestitAdapters {
  kind: 'static' | 'bridge' | 'http'
  payment: PaymentAdapter
  pos: PosAdapter
  printer: PrinterAdapter
  availability: AvailabilityAdapter
  catalog: CatalogAdapter
  auth: AuthAdapter
  loyalty: LoyaltyAdapter
  analytics: AnalyticsAdapter
  connectivity: ConnectivityAdapter
}

declare global {
  interface Window {
    /** Set by the Guestit Launcher (Kotlin) when the kiosk runs inside the WebView shell. */
    GuestitAdapters?: GuestitAdapters
  }
}
