// Fullscreen button (bottom-right of the real viewport). Browsers only allow fullscreen on a user
// gesture, so the kiosk cannot enter it at startup by itself; the button is the gesture. It is hidden
// while the document is fullscreen and when the Fullscreen API is unavailable (Launcher WebView, iframe).

import { useEffect, useState } from 'react'
import { t } from '../engine/state'

function fullscreenOn(): boolean {
  return typeof document !== 'undefined' && !!document.fullscreenElement
}

export function FullscreenButton() {
  const enabled = typeof document !== 'undefined' && !!document.fullscreenEnabled && typeof document.documentElement.requestFullscreen === 'function'
  const [on, setOn] = useState(fullscreenOn)
  useEffect(() => {
    if (!enabled) return
    const sync = () => setOn(fullscreenOn())
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [enabled])
  if (!enabled || on) return null
  const label = t('fsAction') || 'Fullscreen'
  return (
    <button
      type="button"
      id="fsBtn"
      data-a="fullscreen"
      className="press"
      aria-label={label}
      title={label}
      onClick={() => {
        void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch((err: unknown) => {
          console.warn('[kiosk] fullscreen refused', err instanceof Error ? err.message : String(err))
        })
      }}
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      </svg>
    </button>
  )
}
