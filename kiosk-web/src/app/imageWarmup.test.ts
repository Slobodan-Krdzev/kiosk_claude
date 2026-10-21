// Image warm-up: guest order (screensaver, logo, promos, categories, options), de-duplicated, remote only;
// a bounded number of downloads at a time; failures do not stop the queue; cancel stops it.
import { describe, expect, it } from 'vitest'
import type { EngineData } from '../engine/types'
import { preconnect, warmImages, warmupOrder } from './imageWarmup'

const engine = {
  screensaver: { intervalMs: 1, idleMs: 1, opacity: 1, slides: { nl: [{ img: 'http://h/s1.jpg' }], en: [{ img: 'http://h/s1.jpg' }, { img: 'http://h/s2.jpg' }] } },
  venue: { logoImg: 'http://h/logo.png' },
  brand: { promos: [{ pid: 'p1', img: 'http://h/promo.jpg' }] },
  cats: [{ id: 'c2' }, { id: 'c1' }],
  products: [
    { id: 'a', cat: 'c1', img: 'http://h/a.jpg' },
    { id: 'b', cat: 'c2', img: 'http://h/b.jpg' },
    { id: 'x', cat: 'c2', img: 'http://h/hidden.jpg', infoOnly: true },
    { id: 'l', cat: 'c1', img: 'brand/local.png' },
  ],
  mods: { g: { items: [{ id: 'o', img: 'http://h/opt.jpg' }, { id: 'o2', img: 'http://h/a.jpg' }] } },
} as unknown as EngineData

class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  decoding = ''
  static started: string[] = []
  static active = 0
  static peak = 0
  set src(u: string) {
    FakeImage.started.push(u)
    FakeImage.active++
    FakeImage.peak = Math.max(FakeImage.peak, FakeImage.active)
    queueMicrotask(() => {
      FakeImage.active--
      if (u.includes('bad')) this.onerror?.()
      else this.onload?.()
    })
  }
}

describe('image warm-up', () => {
  it('orders pictures the way a guest meets them, once each, remote only', () => {
    expect(warmupOrder(engine, 'nl')).toEqual(['http://h/s1.jpg', 'http://h/s2.jpg', 'http://h/logo.png', 'http://h/promo.jpg', 'http://h/b.jpg', 'http://h/a.jpg', 'http://h/opt.jpg'])
  })

  it('downloads at most `concurrency` at a time, keeps going after a failure, reports the result', async () => {
    FakeImage.started = []
    FakeImage.peak = 0
    const urls = ['http://h/1', 'http://h/bad', 'http://h/3', 'http://h/4', 'http://h/5']
    const result = await new Promise<{ total: number; ok: number; failed: number }>((resolve) =>
      warmImages(urls, { concurrency: 2, makeImage: () => new FakeImage() as unknown as HTMLImageElement, onDone: resolve }),
    )
    expect(FakeImage.started).toEqual(urls)
    expect(FakeImage.peak).toBeLessThanOrEqual(2)
    expect(result).toMatchObject({ total: 5, ok: 4, failed: 1 })
  })

  it('cancel stops the queue', async () => {
    FakeImage.started = []
    const cancel = warmImages(['http://h/1', 'http://h/2', 'http://h/3'], { concurrency: 1, makeImage: () => new FakeImage() as unknown as HTMLImageElement })
    cancel()
    await new Promise((r) => setTimeout(r, 5))
    expect(FakeImage.started).toEqual(['http://h/1'])
  })

  it('preconnect adds one link per image host', () => {
    preconnect(['http://h/a.jpg', 'http://h/b.jpg', 'https://other/x.png'])
    preconnect(['http://h/c.jpg'])
    expect([...document.head.querySelectorAll('link[rel="preconnect"]')].map((l) => l.getAttribute('href'))).toEqual(['http://h', 'https://other'])
  })
})
