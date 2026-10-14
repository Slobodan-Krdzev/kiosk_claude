// Short-interruption session (sessionStorage 'guestit.session', TTL from config). Restores only an UNPAID cart.

import type { OrderTag } from '../domain/types'
import type { CartLine, Lang } from '../engine/types'
import { useEngine, type Screen, type Service } from '../store/engine'

const KEY = 'guestit.session'

interface Blob {
  v: 2
  at: number
  cart: CartLine[]
  service: Service | null
  lang: Lang
  screen: Screen
  cat: string
  tag: OrderTag | null
}

const RESTORABLE: Screen[] = ['home', 'menu', 'cart']

export function saveSession(): void {
  const s = useEngine.getState()
  if (!s.ready) return
  try {
    if (s.screen === 'attract' || s.cart.length === 0) {
      sessionStorage.removeItem(KEY)
      return
    }
    const blob: Blob = { v: 2, at: Date.now(), cart: s.cart, service: s.service, lang: s.lang, screen: RESTORABLE.includes(s.screen) ? s.screen : 'cart', cat: s.cat, tag: s.tag }
    sessionStorage.setItem(KEY, JSON.stringify(blob))
  } catch {
    /* storage blocked */
  }
}

export function restoreSession(ttlMs: number): boolean {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return false
    const b = JSON.parse(raw) as Blob
    if (b.v !== 2 || Date.now() - b.at > ttlMs || !Array.isArray(b.cart) || !b.cart.length) {
      sessionStorage.removeItem(KEY)
      return false
    }
    useEngine.getState().hydrate({ cart: b.cart, service: b.service, lang: b.lang, screen: b.screen, cat: b.cat, tag: b.tag })
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

export function startSessionPersistence(): () => void {
  let last = ''
  return useEngine.subscribe((s) => {
    const sig = `${s.cartVersion}|${s.screen}|${s.lang}|${s.service}|${s.cat}|${s.tag?.value ?? ''}`
    if (sig === last) return
    last = sig
    saveSession()
  })
}
