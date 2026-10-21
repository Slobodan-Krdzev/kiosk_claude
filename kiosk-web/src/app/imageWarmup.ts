// Image warm-up (2026-10-21, Alex: "the images need to load faster").
//
// The menu's pictures are full-size originals (110–660 KB each, 0.3–2.8 s per picture measured on the test menu),
// shown at ~200 px. Until the backend serves thumbnails (B12), the kiosk downloads them quietly in the background
// right after the menu loads, in the order a guest meets them — screensaver, logo, promotions, then category by
// category, then option pictures — a few at a time, so every screen opens from the browser cache.
// Nothing is kept in memory: each picture is dropped as soon as the browser has it.

import type { EngineData } from '../engine/types'

export const WARMUP_CONCURRENCY = 3

const isRemote = (u: string | undefined): u is string => !!u && /^https?:\/\//i.test(u)

/** Every remote picture of the menu, de-duplicated, in the order a guest meets them. */
export function warmupOrder(d: EngineData, lang: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const add = (u: string | undefined) => {
    if (isRemote(u) && !seen.has(u)) {
      seen.add(u)
      out.push(u)
    }
  }
  const slides = d.screensaver?.slides ?? {}
  ;(slides[lang as keyof typeof slides] ?? []).forEach((s) => add(s.img))
  Object.values(slides).forEach((l) => (l ?? []).forEach((s) => add(s.img)))
  add(d.venue?.logoImg)
  ;(d.brand.promos ?? []).forEach((p) => add(p.img))
  for (const c of d.cats) d.products.filter((p) => p.cat === c.id && !p.disabled && !p.infoOnly).forEach((p) => add(p.img))
  Object.values(d.mods).forEach((g) => g.items.forEach((it) => add(it.img)))
  return out
}

/** Fetch the pictures into the browser cache, `concurrency` at a time. Returns a cancel function. */
export function warmImages(
  urls: string[],
  opts: { concurrency?: number; onDone?: (r: { total: number; ok: number; failed: number; ms: number }) => void; makeImage?: () => HTMLImageElement } = {},
): () => void {
  const make = opts.makeImage ?? (() => new Image())
  const queue = [...urls]
  const t0 = Date.now()
  let ok = 0
  let failed = 0
  let active = 0
  let cancelled = false
  const next = () => {
    if (cancelled) return
    const u = queue.shift()
    if (u === undefined) {
      if (active === 0) opts.onDone?.({ total: urls.length, ok, failed, ms: Date.now() - t0 })
      return
    }
    active++
    const img = make()
    img.decoding = 'async'
    const done = (good: boolean) => {
      img.onload = img.onerror = null
      if (good) ok++
      else failed++
      active--
      next()
    }
    img.onload = () => done(true)
    img.onerror = () => done(false)
    img.src = u
  }
  if (!urls.length) {
    opts.onDone?.({ total: 0, ok: 0, failed: 0, ms: 0 })
    return () => {}
  }
  for (let i = 0; i < Math.max(1, opts.concurrency ?? WARMUP_CONCURRENCY); i++) next()
  return () => {
    cancelled = true
  }
}

/** Open the connections to the image hosts before the first picture is needed. */
export function preconnect(urls: string[], doc: Document = document): void {
  const origins = [...new Set(urls.map((u) => new URL(u).origin))]
  for (const o of origins) {
    if (doc.head.querySelector(`link[rel="preconnect"][href="${o}"]`)) continue
    const l = doc.createElement('link')
    l.rel = 'preconnect'
    l.href = o
    doc.head.appendChild(l)
  }
}
