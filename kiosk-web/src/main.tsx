import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './reference.css'
import { App } from './app/App'

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
