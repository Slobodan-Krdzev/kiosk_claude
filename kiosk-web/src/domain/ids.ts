// Identifier formats follow the v36 kiosk reference
// (failover-handover/docs/reference/kiosk-payment-and-recovery-v36.md §4).

const DEVICE_KEY = 'guestit.deviceId'

function rand(len: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  const buf = new Uint8Array(len)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buf)
  } else {
    for (let i = 0; i < len; i++) buf[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < len; i++) out += alphabet[buf[i] % alphabet.length]
  return out
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`
}

/** Permanent per-device id (localStorage). Falls back to a per-session id if storage is blocked. */
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY)
    if (existing) return existing
    const id = `K${rand(6).toUpperCase()}`
    localStorage.setItem(DEVICE_KEY, id)
    return id
  } catch {
    return `KTMP${rand(4).toUpperCase()}`
  }
}

export function newOrderId(deviceId: string, now = Date.now()): string {
  return `${deviceId}-${now.toString(36)}-${uuid().replace(/-/g, '').slice(0, 8)}`
}

export function newAttemptId(orderId: string, attempt: number): string {
  return `${orderId}-A${attempt}-${rand(6)}`
}

export function attemptIndexOf(attemptId: string | null | undefined): number | null {
  if (!attemptId) return null
  const m = /-A(\d+)-[a-z0-9]+$/.exec(attemptId)
  return m ? Number(m[1]) : null
}

export function idempotencyKeyFor(orderId: string): string {
  return `IDEMP-${orderId}`
}

export function newRecoveryRef(): string {
  return `GUE-${rand(5).toUpperCase()}`
}

export function fallbackTxRef(): string {
  return `TX-${rand(10).toUpperCase()}`
}

export function newLineId(): string {
  return `L${rand(8)}`
}

export function newSessionId(): string {
  return `S${Date.now().toString(36)}${rand(4)}`
}
