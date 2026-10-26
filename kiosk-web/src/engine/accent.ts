// Venue accent colour (2026-10-26, Alex): ThemeResponse.ActiveColor drives every accent of the kiosk on API menus —
// bottom buttons, the active sidebar row, prices on cards and Special tiles, the product-page price, the basket
// steppers. The brand pack's accent tokens are replaced by a palette derived from that one colour:
//   primary      the colour itself (darkened until white text on it stays readable)
//   pbright      a lighter shade (highlights, the active-row marker)
//   primarysoft  a pale tint (selected tiles, soft backgrounds)
//   pdpprice     the product-page price / totals (a lighter shade, as the pack's light blue)
// Opacity variants come from the CSS itself (rgb(var(--c-primary) / .x)).

export type Rgb = [number, number, number]

export function parseHex(v: unknown): Rgb | null {
  if (typeof v !== 'string') return null
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v.trim())
  if (!m) return null
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1]
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb
}

export const toHex = (c: Rgb): string => '#' + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('').toUpperCase()

/** Mix `c` with `with_` by `t` (0 = c, 1 = with_). */
export const mix = (c: Rgb, with_: Rgb, t: number): Rgb => c.map((x, i) => x + (with_[i] - x) * t) as Rgb

/** WCAG relative luminance. */
export function luminance(c: Rgb): number {
  const [r, g, b] = c.map((x) => {
    const s = x / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio of white text on `c`. */
export const contrastWithWhite = (c: Rgb): number => 1.05 / (luminance(c) + 0.05)

const WHITE: Rgb = [255, 255, 255]
const BLACK: Rgb = [0, 0, 0]
/** White button labels need at least this contrast (WCAG AA for large text). */
export const MIN_CONTRAST = 3

export interface AccentPalette {
  primary: string
  pbright: string
  primarysoft: string
  pdpprice: string
}

/** The kiosk's accent tokens from one venue colour; null when the value is not a colour. */
export function accentPalette(active: unknown): AccentPalette | null {
  const c = parseHex(active)
  if (!c) return null
  let primary = c
  for (let i = 0; i < 20 && contrastWithWhite(primary) < MIN_CONTRAST; i++) primary = mix(primary, BLACK, 0.08)
  return {
    primary: toHex(primary),
    pbright: toHex(mix(c, WHITE, 0.25)),
    primarysoft: toHex(mix(c, WHITE, 0.86)),
    pdpprice: toHex(mix(c, WHITE, 0.15)),
  }
}
