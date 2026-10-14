import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'
import { LANG_LABELS } from '../i18n'
import type { Lang } from '../domain/types'
import { isReconnecting } from '../domain/connectivity'

// ---------- Buttons ----------

export function Button(props: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'md' | 'lg'
  block?: boolean
  disabled?: boolean
  className?: string
  ariaLabel?: string
}) {
  const { variant = 'secondary', size = 'md', block, className = '', ...rest } = props
  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${className}`}
      onClick={rest.onClick}
      disabled={rest.disabled}
      aria-label={rest.ariaLabel}
    >
      {props.children}
    </button>
  )
}

// ---------- Hidden staff trigger: 5 taps within 3 s ----------

export function useStaffTrigger() {
  const taps = useRef<number[]>([])
  const setStaffOpen = useKiosk((s) => s.setStaffOpen)
  return () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < 3000), now]
    if (taps.current.length >= 5) {
      taps.current = []
      setStaffOpen(true)
    }
  }
}

// ---------- Language switch ----------

export function LangSwitch({ compact = false }: { compact?: boolean }) {
  const lang = useKiosk((s) => s.lang)
  const setLang = useKiosk((s) => s.setLang)
  const languages = useKiosk((s) => s.config?.languages ?? (['nl', 'en', 'mk'] as Lang[]))
  return (
    <div className={`lang-row ${compact ? 'compact' : ''}`} role="group" aria-label="Language">
      {languages.map((l) => (
        <button key={l} type="button" className={`chip ${l === lang ? 'selected' : ''}`} onClick={() => setLang(l)}>
          {compact ? l.toUpperCase() : LANG_LABELS[l]}
        </button>
      ))}
    </div>
  )
}

// ---------- Connection indicator (handover docs/07) ----------

export function StatusIndicator() {
  const conn = useKiosk((s) => s.conn)
  const { t } = useT()
  let cls = 'ok'
  let label: string | null = null
  if (conn.kind === 'connected') {
    if (conn.role === 'LOCAL_SECONDARY') {
      cls = 'standby'
      label = t('conn.status.standby')
    } else if (conn.role === 'CLOUD_ACTIVE') {
      cls = 'cloud'
      label = t('conn.status.cloud')
    } else {
      label = t('conn.status.local')
    }
  } else if (conn.kind === 'no-authority') {
    cls = 'bad'
    label = t('conn.status.noAuthority')
  } else if (isReconnecting(conn)) {
    cls = 'busy'
    label = t('conn.status.reconnecting')
  }
  const showLabel = cls === 'busy' || cls === 'bad'
  return (
    <div className={`status ${cls}`} title={label ?? ''} aria-live="polite">
      <span className="status-dot" />
      {showLabel && <span className="status-label">{label}</span>}
    </div>
  )
}

// ---------- Top bar ----------

export function TopBar({ title, onBack }: { title?: string; onBack?: () => void }) {
  const venue = useKiosk((s) => s.config?.venueName ?? 'Guestit')
  const service = useKiosk((s) => s.service)
  const { t } = useT()
  const tap = useStaffTrigger()
  return (
    <header className="topbar">
      <div className="topbar-left">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} ariaLabel={t('common.back')}>
            ←
          </Button>
        ) : null}
        <button type="button" className="logo" onClick={tap} aria-label={venue}>
          <span className="logo-mark">G</span>
          <span className="logo-text">{venue}</span>
        </button>
      </div>
      <div className="topbar-center">{title ? <h1 className="topbar-title">{title}</h1> : null}</div>
      <div className="topbar-right">
        {service ? <span className="pill">{t(service === 'eat-in' ? 'service.eatIn' : 'service.takeaway')}</span> : null}
        <LangSwitch compact />
        <StatusIndicator />
      </div>
    </header>
  )
}

// ---------- Sheet (bottom modal) ----------

export function Sheet({ children, onClose, title, footer }: { children: ReactNode; onClose?: () => void; title?: string; footer?: ReactNode }) {
  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        {title || onClose ? (
          <div className="sheet-header">
            <h2>{title}</h2>
            {onClose ? (
              <button type="button" className="btn btn-ghost btn-md" onClick={onClose} aria-label="close">
                ✕
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="sheet-body">{children}</div>
        {footer ? <div className="sheet-footer">{footer}</div> : null}
      </div>
    </div>
  )
}

// ---------- Quantity stepper ----------

export function QtyStepper({ value, onChange, min = 0, max = 20 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="stepper" role="group">
      <button type="button" className="stepper-btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="minus">
        −
      </button>
      <span className="stepper-value" aria-live="polite">
        {value}
      </span>
      <button type="button" className="stepper-btn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="plus">
        +
      </button>
    </div>
  )
}

// ---------- Numeric keypad ----------

export function Keypad({ value, onChange, maxLen = 3 }: { value: string; onChange: (v: string) => void; maxLen?: number }) {
  const { t } = useT()
  const press = (k: string) => {
    if (k === 'del') onChange(value.slice(0, -1))
    else if (value.length < maxLen) onChange(value + k)
  }
  return (
    <div className="keypad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
        <button key={k} type="button" className="key" onClick={() => press(k)}>
          {k}
        </button>
      ))}
      <span />
      <button type="button" className="key" onClick={() => press('0')}>
        0
      </button>
      <button type="button" className="key key-del" onClick={() => press('del')} aria-label={t('common.delete')}>
        ⌫
      </button>
    </div>
  )
}

// ---------- On-screen keyboard (names) ----------

const ROWS_LATIN = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
const ROWS_CYR = ['ЉЊЕРТЅУИОПШ', 'АСДФГХЈКЛЧЌЖ', 'ЗЏЦВБНМ']

export function Keyboard({ value, onChange, maxLen = 16 }: { value: string; onChange: (v: string) => void; maxLen?: number }) {
  const { lang } = useT()
  const [cyr, setCyr] = useState(lang === 'mk')
  useEffect(() => setCyr(lang === 'mk'), [lang])
  const rows = cyr ? ROWS_CYR : ROWS_LATIN
  const add = (ch: string) => {
    if (value.length >= maxLen) return
    const atWordStart = value.length === 0 || value.endsWith(' ')
    onChange(value + (atWordStart ? ch : ch.toLowerCase()))
  }
  return (
    <div className="keyboard">
      {rows.map((row) => (
        <div className="kb-row" key={row}>
          {row.split('').map((ch) => (
            <button key={ch} type="button" className="key" onClick={() => add(ch)}>
              {ch}
            </button>
          ))}
        </div>
      ))}
      <div className="kb-row">
        <button type="button" className="key key-wide" onClick={() => setCyr(!cyr)}>
          {cyr ? 'ABC' : 'АБВ'}
        </button>
        <button type="button" className="key key-space" onClick={() => value && !value.endsWith(' ') && value.length < maxLen && onChange(value + ' ')}>
          ␣
        </button>
        <button type="button" className="key key-wide key-del" onClick={() => onChange(value.slice(0, -1))} aria-label="delete">
          ⌫
        </button>
      </div>
    </div>
  )
}

// ---------- Inline note ----------

export function Note({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' | 'danger' | 'ok' }) {
  return (
    <div className={`inline-note ${tone}`} role="status">
      {children}
    </div>
  )
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`spinner spinner-${size}`} aria-hidden="true" />
}
