// Short-interruption session (v36: sessionStorage 'guestit.session', TTL 3 min).
// Restores only an UNPAID cart within the same interruption. Separate from the paid-order record.

import type { Screen } from '../store/kiosk'
import { useKiosk } from '../store/kiosk'
import type { CartLine, Lang, LoyaltyMember, OrderTag, ServiceMode } from '../domain/types'

const KEY = 'guestit.session'

interface SessionBlob {
  v: 1
  savedAt: number
  cart: CartLine[]
  service: ServiceMode | null
  lang: Lang
  tag: OrderTag | null
  member: LoyaltyMember | null
  screen: Screen
}

const RESTORABLE: Screen[] = ['menu', 'cart', 'upsell', 'tag']

export function saveSession(): void {
  const s = useKiosk.getState()
  if (!s.booted) return
  try {
    if (s.screen === 'attract' || s.cart.length === 0) {
      sessionStorage.removeItem(KEY)
      return
    }
    const blob: SessionBlob = {
      v: 1,
      savedAt: Date.now(),
      cart: s.cart,
      service: s.service,
      lang: s.lang,
      tag: s.tag,
      member: s.member,
      screen: RESTORABLE.includes(s.screen) ? s.screen : 'cart',
    }
    sessionStorage.setItem(KEY, JSON.stringify(blob))
  } catch {
    /* storage blocked */
  }
}

export function restoreSession(ttlMs: number): boolean {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return false
    const blob = JSON.parse(raw) as SessionBlob
    if (blob.v !== 1 || Date.now() - blob.savedAt > ttlMs || !Array.isArray(blob.cart) || blob.cart.length === 0) {
      sessionStorage.removeItem(KEY)
      return false
    }
    useKiosk.getState().hydrateSession({ cart: blob.cart, service: blob.service, lang: blob.lang, tag: blob.tag, member: blob.member, screen: blob.screen })
    return true
  } catch {
    return false
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

/** Persist on every relevant change. Returns the unsubscribe function. */
export function startSessionPersistence(): () => void {
  let last = ''
  return useKiosk.subscribe((s) => {
    const sig = `${s.cartVersion}|${s.screen}|${s.lang}|${s.service}|${s.tag?.value ?? ''}|${s.member?.id ?? ''}`
    if (sig === last) return
    last = sig
    saveSession()
  })
}
