import { useCallback } from 'react'
import { useKiosk } from '../store/kiosk'
import type { L10n } from '../domain/types'
import { l10n, t } from './index'

export function useT() {
  const lang = useKiosk((s) => s.lang)
  const tt = useCallback((key: string, vars?: Record<string, string | number>) => t(key, lang, vars), [lang])
  const ll = useCallback((value: L10n | undefined) => l10n(value, lang), [lang])
  return { t: tt, l: ll, lang }
}

export function useMoney() {
  const config = useKiosk((s) => s.config)
  return useCallback(
    (cents: number) => {
      const currency = config?.currency ?? 'EUR'
      const locale = config?.locale ?? 'nl-NL'
      try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)
      } catch {
        return `${(cents / 100).toFixed(2)} ${currency}`
      }
    },
    [config?.currency, config?.locale],
  )
}
