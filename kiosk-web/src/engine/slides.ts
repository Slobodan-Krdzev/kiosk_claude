// Screensaver slides for the first screen: language choice and the optional time window per slide.

import type { Lang, Screensaver, Slide } from './types'

const minutes = (hhmm: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm).trim())
  return m ? +m[1] * 60 + +m[2] : null
}

/** A slide without a time window is always on; a window may wrap past midnight (22:00–02:00). from === to = all day. */
export function slideOn(s: Slide, now: Date): boolean {
  if (!s.time) return true
  const from = minutes(s.time.from)
  const to = minutes(s.time.to)
  if (from == null || to == null || from === to) return true
  const t = now.getHours() * 60 + now.getMinutes()
  return from < to ? t >= from && t < to : t >= from || t < to
}

/** Slides of the current language (else the first language that has any), filtered by time. */
export function currentSlides(ss: Screensaver | undefined, lang: Lang, now: Date): Slide[] {
  if (!ss) return []
  const list = ss.slides[lang]?.length ? ss.slides[lang]! : Object.values(ss.slides).find((l) => l?.length) || []
  return list.filter((s) => slideOn(s, now))
}
