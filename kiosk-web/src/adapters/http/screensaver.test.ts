// Screensaver Transparency: 0 or missing = fully visible (a venue backend sends 0.0); a value between 0 and 1
// dims the slides; GIF slides pass through untouched.
import { describe, expect, it } from 'vitest'
import type { TmkLangData } from './tmk'
import { screensaverOf } from './tmkMapper'

const tree = (transparency: number | undefined) =>
  ({
    Language: 'nl',
    Screensaver: {
      SlideTimer: 60,
      ActivationTime: 30,
      Transparency: transparency,
      Slides: [{ ImageUrl: 'http://192.168.0.2:9091/Shared/Images/a.gif', DisplayOrder: 0, UseActivation: false, UseRound: false, UseTime: false }],
    },
  }) as unknown as TmkLangData

describe('screensaver transparency', () => {
  it.each([
    [0, 1],
    [undefined, 1],
    [1, 1],
    [0.6, 0.6],
    [-2, 1],
    [5, 1],
  ])('Transparency %s → opacity %s', (t, opacity) => {
    const ss = screensaverOf([tree(t)], tree(t), (u) => u)!
    expect(ss.opacity).toBe(opacity)
    expect(ss.slides.nl![0].img).toBe('http://192.168.0.2:9091/Shared/Images/a.gif')
  })
})

