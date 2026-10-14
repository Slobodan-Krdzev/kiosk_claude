// Connection state as defined in failover-handover/docs/03-kotlin-core-design.md §3.
// In the web kiosk this is *observed*, never decided: the source is the Launcher bridge,
// a backend routing descriptor, or (for now) the static simulation.

export type ServerRole = 'LOCAL_PRIMARY' | 'LOCAL_SECONDARY' | 'CLOUD_ACTIVE'

export type FailureReason = 'timeout' | 'unreachable' | 'stale-epoch' | 'not-writer' | 'readiness' | 'no-descriptor' | 'simulated'

export type ConnectionState =
  | { kind: 'connected'; role: ServerRole; nodeId: string; epoch: number }
  | { kind: 'suspect'; since: number; reason: FailureReason }
  | { kind: 'resolving'; attempt: number }
  | { kind: 'switching'; from: string | null; to: string; epoch: number }
  | { kind: 'reconciling'; pending: number; unknown: number }
  | { kind: 'no-authority'; reason: FailureReason; retryAt: number }

export function canSubmitWrites(s: ConnectionState): boolean {
  return s.kind === 'connected'
}

export function isReconnecting(s: ConnectionState): boolean {
  return s.kind === 'suspect' || s.kind === 'resolving' || s.kind === 'switching' || s.kind === 'reconciling'
}

/** i18n key for the inline guest message shown at the primary action, or null when nothing is needed. */
export function guestMessageKey(s: ConnectionState): string | null {
  if (s.kind === 'connected') return null
  if (s.kind === 'no-authority') return 'conn.noAuthority'
  return 'conn.waitSubmit'
}
