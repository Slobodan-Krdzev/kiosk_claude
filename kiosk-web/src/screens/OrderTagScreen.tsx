import { useState } from 'react'
import { startPayment } from '../app/checkout'
import { Button, Keyboard, Keypad, Note, TopBar } from '../components/ui'
import { numberRange, resolveTagMode, validateNameTag, validateNumberTag } from '../domain/orderTag'
import { useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'

export function OrderTagScreen() {
  const { t } = useT()
  const cfg = useKiosk((s) => s.config!.orderTag)
  const service = useKiosk((s) => s.service!)
  const setTag = useKiosk((s) => s.setTag)
  const setScreen = useKiosk((s) => s.setScreen)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { mode } = resolveTagMode(cfg, service)
  if (mode === 'none') return null
  const isNumber = mode === 'table' || mode === 'pager'
  const range = isNumber ? numberRange(cfg, mode) : null

  const confirm = () => {
    const v = isNumber ? validateNumberTag(value, cfg, mode) : validateNameTag(value, cfg)
    if (!v.ok) {
      if (v.reason === 'empty') return
      const vars = isNumber ? { min: range!.min, max: range!.max } : { min: cfg.nameMin, max: cfg.nameMax }
      setError(t(`tag.err.${v.reason}`, vars))
      return
    }
    setTag({ type: mode, value: v.value })
    void startPayment()
  }

  const skip = () => {
    setTag(null)
    void startPayment()
  }

  return (
    <div className="screen">
      <TopBar title={t(`tag.label.${mode}`)} onBack={() => setScreen('cart')} />
      <main className="content tag">
        <h1 className="tag-title">{t(`tag.${mode}.title`)}</h1>
        <p className="muted">{t(`tag.${mode}.help`)}</p>
        {isNumber ? (
          <>
            <div className="code-display big">{value || '–'}</div>
            <p className="muted small">{t('tag.range', { min: range!.min, max: range!.max })}</p>
            {error ? <Note tone="danger">{error}</Note> : null}
            <Keypad
              value={value}
              maxLen={String(range!.max).length}
              onChange={(v) => {
                setValue(v)
                setError(null)
              }}
            />
          </>
        ) : (
          <>
            <div className="code-display big name">{value || '–'}</div>
            {error ? <Note tone="danger">{error}</Note> : null}
            <Keyboard
              value={value}
              maxLen={cfg.nameMax}
              onChange={(v) => {
                setValue(v)
                setError(null)
              }}
            />
          </>
        )}
      </main>
      <footer className="bottombar">
        {!cfg.required ? (
          <Button variant="ghost" size="lg" onClick={skip}>
            {t('tag.skip')}
          </Button>
        ) : (
          <span />
        )}
        <Button variant="primary" size="lg" disabled={!value.trim()} onClick={confirm}>
          {t('tag.confirm')} →
        </Button>
      </footer>
    </div>
  )
}
