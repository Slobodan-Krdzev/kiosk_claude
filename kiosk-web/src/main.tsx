import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './reference.css'
import { App } from './app/App'

// The old kiosk registered its own service worker (service-worker.js) on the same origin a venue now serves this
// kiosk from; it would keep serving the OLD bundle. Remove workers that are not this kiosk's sw.js and caches that
// are not this kiosk's (kiosk-*), once per boot. This kiosk's own worker is registered in swRegister.ts.
void (async () => {
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? []
    const foreign = regs.filter((r) => ![r.active, r.waiting, r.installing].some((w) => w && /\/sw\.js(\?|$)/.test(w.scriptURL)))
    for (const r of foreign) await r.unregister()
    const names = ((await window.caches?.keys?.()) ?? []).filter((n) => !n.startsWith('kiosk-'))
    for (const n of names) await caches.delete(n)
    if (foreign.length || names.length) {
      console.warn('[kiosk] removed legacy service worker(s) / caches', { workers: foreign.length, caches: names.length })
      if (foreign.length) window.location.reload()
    }
  } catch {
    /* no service worker API */
  }
})()

window.addEventListener('error', (e) => console.error('[kiosk] fatal', e.message, e.error?.stack))
window.addEventListener('unhandledrejection', (e) => console.error('[kiosk] unhandled', String(e.reason)))

class Boundary extends Component<{ children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null }
  static getDerivedStateFromError(e: unknown) {
    return { err: e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e) }
  }
  componentDidCatch(e: unknown) {
    console.error('[kiosk] render error', e)
  }
  render() {
    if (this.state.err)
      return (
        <div style={{ position: 'fixed', inset: 0, background: '#f5f0e4', color: '#1a1915', padding: 40, font: '600 18px/1.5 Inter, system-ui, sans-serif', overflow: 'auto' }}>
          <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 12 }}>Kiosk error</div>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.err}</pre>
          <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '14px 28px', borderRadius: 999, border: 0, background: '#0f6b4f', color: '#fff', font: 'inherit' }}>
            Restart
          </button>
        </div>
      )
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boundary>
      <App />
    </Boundary>
  </StrictMode>,
)
