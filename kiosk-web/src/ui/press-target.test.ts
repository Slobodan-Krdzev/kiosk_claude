// Touch rule (2026-10-19/21): nothing inside a `button.press` may be a hit-test target, so a tap on a label or
// icon is a tap on the button. This pins the stylesheet rule; the bottom call-to-action buttons also carry the
// same rule inline (Tag, Cart, basket bar, attract) so no stylesheet order or cache can undo it.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

describe('button labels are never the tap target', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/reference.css'), 'utf8')
  it('reference.css keeps `button.press *{ pointer-events:none }`', () => {
    expect(css).toMatch(/button\.press \*\s*\{\s*pointer-events\s*:\s*none/)
  })
  it('the bottom buttons carry the rule inline as well', () => {
    for (const [file, marker] of [
      ['src/ui/Tag.tsx', 'data-a="tagGo"'],
      ['src/ui/Cart.tsx', 'data-a="toPay"'],
      ['src/ui/shell.tsx', 'data-a="viewOrder"'],
      ['src/ui/Attract.tsx', 'data-a="startWith"'],
    ]) {
      const src = readFileSync(resolve(process.cwd(), file), 'utf8')
      const i = src.indexOf(marker)
      expect(i).toBeGreaterThan(-1)
      const block = src.slice(i, src.indexOf('</button>', i))
      expect(block, `${file} ${marker}`).toContain('NO_HIT')
    }
  })
})
