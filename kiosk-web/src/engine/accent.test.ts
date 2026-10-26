// Venue accent palette from ThemeResponse.ActiveColor: the colour itself on buttons when white text reads on it,
// darkened when it is too light; lighter shade, pale tint and product-page price derived from it; junk → null.
import { describe, expect, it } from 'vitest'
import { accentPalette, contrastWithWhite, MIN_CONTRAST, parseHex } from './accent'

describe('accent palette', () => {
  it('Ohana #3881F3: primary is the colour itself; lighter, tint and price shades derived', () => {
    const p = accentPalette('#3881F3')!
    expect(p.primary).toBe('#3881F3')
    expect(p.pbright).toBe('#6AA1F6')
    expect(p.primarysoft).toBe('#E3EDFD')
    expect(p.pdpprice).toBe('#5694F5')
  })
  it('a too-light colour is darkened until white button text reads on it', () => {
    const p = accentPalette('#FFE14D')!
    expect(p.primary).not.toBe('#FFE14D')
    expect(contrastWithWhite(parseHex(p.primary)!)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })
  it('short hex and missing # are accepted; anything else gives no palette', () => {
    expect(accentPalette('38f')).not.toBeNull()
    for (const v of [undefined, null, '', 'blue', '#12345', '#GGGGGG', 42]) expect(accentPalette(v)).toBeNull()
  })
})
