// applyBrand(): writes the brand tokens as CSS variables on <html> (the reference stylesheet reads them).

import type { Brand } from '../engine/types'

const hx = (h: string): string => {
  const n = parseInt(h.slice(1), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

export function applyBrand(b: Brand): void {
  const R = document.documentElement.style
  for (const [k, v] of Object.entries(b.colors)) R.setProperty('--c-' + k, hx(v))
  R.setProperty('--f-head', `'${b.typography.displayFont}','${b.typography.bodyFont}',sans-serif`)
  R.setProperty('--f-body', `'${b.typography.bodyFont}',system-ui,sans-serif`)
  R.setProperty('--f-accent', `'${b.typography.accentFont}',cursive`)
  const m = b.motion
  R.setProperty('--m-herofade', (m.heroFade ?? 650) + 'ms')
  R.setProperty('--m-barin', (m.basketEntrance ?? 240) + 'ms')
  R.setProperty('--m-barout', (m.basketExit ?? 160) + 'ms')
  R.setProperty('--m-xfade', (m.fieldXfade ?? 160) + 'ms')
  R.setProperty('--m-ct', (m.containerTransform ?? 520) + 'ms')
  R.setProperty('--m-barfade', (m.pdpBarFade ?? 200) + 'ms')
  R.setProperty('--r-btn', b.radiusBtn)
  document.title = b.name + ' — Self-order kiosk'
  document.documentElement.classList.add('brand-' + b.id)
}
