// Service worker registration and safe updates (PWA, 2026-10-21).
//
// The worker is registered only in the production build and only in a secure context (https or localhost) —
// browsers do not allow service workers on plain http such as http://192.168.0.2:9544.
// A new build's worker installs in the background and waits. It takes over only while no guest is ordering:
// start screen, empty cart, no payment in progress. Then the page reloads once onto the new build. A guest is
// never reloaded mid-order (handover rule 16).

type Log = (event: string, data?: Record<string, unknown>) => void

export interface UpdateGate {
  /** True while nobody is ordering: start screen, empty cart, payment idle. */
  idle: () => boolean
  /** Called whenever idle() may have changed; returns the unsubscribe. */
  subscribe: (cb: () => void) => () => void
}

export type SwStatus = 'unsupported' | 'insecure' | 'dev' | 'registered' | 'failed'
let status: SwStatus = 'unsupported'
export const swStatus = (): SwStatus => status

export async function registerServiceWorker(gate: UpdateGate, log: Log = () => {}, isProd: boolean = import.meta.env.PROD): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  if (!isProd) {
    status = 'dev'
    return
  }
  if (!isSecureContext) {
    status = 'insecure'
    log('pwa.insecureContext', { origin: location.origin })
    return
  }
  try {
    const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' })
    status = 'registered'
    let reloading = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading || !gate.idle()) return
      reloading = true
      log('pwa.updated', {})
      window.location.reload()
    })
    let unsub: (() => void) | null = null
    const offerUpdate = () => {
      const waiting = reg.waiting
      if (!waiting || !navigator.serviceWorker.controller) return
      const tryNow = () => {
        if (!gate.idle()) return
        unsub?.()
        unsub = null
        log('pwa.activateUpdate', {})
        waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      unsub?.()
      unsub = gate.subscribe(tryNow)
      tryNow()
    }
    offerUpdate()
    reg.addEventListener('updatefound', () => {
      const w = reg.installing
      w?.addEventListener('statechange', () => {
        if (w.state === 'installed') offerUpdate()
      })
    })
    // Look for a new build every 30 minutes; the kiosk may run for days.
    setInterval(() => void reg.update().catch(() => undefined), 30 * 60 * 1000)
  } catch (e) {
    status = 'failed'
    log('pwa.registerFailed', { error: e instanceof Error ? e.message : String(e) })
  }
}
