import { E, getLang } from './state'

/** formatMoney: eMenu style "12,50" when the CMS symbol is empty; otherwise Intl currency. */
export function fmt(minor: number): string {
  const d = E()
  const m = d.cms.brand?.money ?? { symbol: '€', decimals: ',' }
  const n = Math.round(minor | 0)
  const neg = n < 0
  const v = Math.abs(n)
  if (m.symbol === '') {
    const whole = String(Math.floor(v / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return (neg ? '-' : '') + whole + (m.decimals || ',') + String(v % 100).padStart(2, '0')
  }
  const txt = new Intl.NumberFormat(d.locales[getLang()] || 'nl-NL', { style: 'currency', currency: 'EUR' }).format(n / 100)
  const out = txt.replace('€', m.symbol || '€')
  return m.decimals && m.decimals !== ',' ? out.replace(',', m.decimals) : out
}

export function ltyNum(n: number): string {
  const l = getLang()
  try {
    return new Intl.NumberFormat(l === 'en' ? 'en-GB' : l === 'mk' ? 'mk-MK' : 'nl-NL').format(n)
  } catch {
    return String(n)
  }
}
