// Module-level engine context: data, language, availability and the allergen filter.
// The engine functions are a port of the v36 reference, which read these from globals (E, S.lang, AVAIL, …).

import type { EngineData, L10n, Lang } from './types'

let data: EngineData | null = null
let lang: Lang = 'nl'
const unavailable = new Set<string>()
const disabled = new Set<string>()
let allergenFilter = new Set<string>()

export function setEngine(d: EngineData): void {
  data = d
}

export function E(): EngineData {
  if (!data) throw new Error('engine data not loaded')
  return data
}

export function hasEngine(): boolean {
  return data !== null
}

export function setLang(l: Lang): void {
  lang = l
}

export function getLang(): Lang {
  return lang
}

/** L(): a localised value or a plain string. */
export function L(o: L10n | undefined | null): string {
  if (o == null) return ''
  if (typeof o === 'string') return o
  return (o as Record<string, string>)[lang] ?? o.en ?? ''
}

export function t(k: string): string {
  const d = data
  if (!d) return k
  return d.i18n[lang]?.[k] ?? d.i18n.en[k] ?? k
}

export function tf(k: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((a, [kk, v]) => a.replaceAll('{' + kk + '}', String(v)), t(k))
}

// ---------- availability (cache, sync) ----------

export function setUnavailable(ids: Iterable<string>): void {
  unavailable.clear()
  for (const id of ids) unavailable.add(id)
}

export function patchUnavailable(checked: string[], na: string[]): void {
  for (const id of checked) unavailable.delete(id)
  for (const id of na) unavailable.add(id)
}

export function setDisabled(ids: Iterable<string>): void {
  disabled.clear()
  for (const id of ids) disabled.add(id)
}

export function checkProducts(ids: string[]): string[] {
  return [...new Set(ids)].filter((id) => unavailable.has(id) || disabled.has(id))
}

export function unavailableSnapshot(): string[] {
  return [...new Set([...unavailable, ...disabled])]
}

// ---------- allergen filter ----------

export function setAllergenFilter(s: Set<string>): void {
  allergenFilter = new Set(s)
}

export function getAllergenFilter(): Set<string> {
  return allergenFilter
}
