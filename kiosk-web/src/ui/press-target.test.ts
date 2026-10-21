// Touch rule (2026-10-19/21): nothing inside a `button.press` may be a hit-test target. The stylesheet makes every
// descendant pointer-events:none, and the bottom call-to-action buttons go one step further (Alex, 2026-10-21):
// their text and icon are direct children — no span at all between the finger and the button.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

describe('button labels are never the tap target', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/reference.css'), 'utf8')
  it('reference.css keeps `button.press *{ pointer-events:none }`', () => {
    expect(css).toMatch(/button\.press \*\s*\{\s*pointer-events\s*:\s*none/)
  })
  it('the bottom buttons have no span inside: text and icon are direct children', () => {
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
      expect(block, `${file} ${marker}`).not.toContain('<span')
      expect(block, `${file} ${marker}`).toContain('<Ic ')
    }
  })
})
