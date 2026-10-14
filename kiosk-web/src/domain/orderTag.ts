import type { OrderTagConfig, OrderTagMode, ServiceMode } from './types'

const VALID_MODES: OrderTagMode[] = ['none', 'pager', 'table', 'name']

// Built-in blocklist (whole words; case, accents and stretched letters are ignored).
// Kept short and generic on purpose; organisations extend it via config.nameBlocklist.
const BUILTIN_BLOCKLIST = ['fuck', 'shit', 'cunt', 'bitch', 'nazi', 'hitler', 'kut', 'lul', 'hoer', 'kanker', 'пичка', 'курва']

/** Resolve the active mode for a service type. Unknown modes fall back safely to 'none'. */
export function resolveTagMode(cfg: OrderTagConfig, service: ServiceMode): { mode: OrderTagMode; clientError?: string } {
  let mode: OrderTagMode = cfg.mode
  let clientError: string | undefined
  if (!VALID_MODES.includes(mode)) {
    clientError = `orderTag.mode "${String(mode)}" unknown — falling back to none`
    mode = 'none'
  }
  if (service === 'takeaway') {
    let tm = cfg.takeawayMode
    if (tm === undefined || tm === null) tm = mode === 'table' ? 'none' : mode
    if (!VALID_MODES.includes(tm)) {
      clientError = `orderTag.takeawayMode "${String(tm)}" unknown — falling back to none`
      tm = 'none'
    }
    mode = tm
  }
  return clientError ? { mode, clientError } : { mode }
}

export function numberRange(cfg: OrderTagConfig, type: 'table' | 'pager'): { min: number; max: number } {
  const specific = type === 'table' ? cfg.table : cfg.pager
  return { min: specific?.min ?? cfg.min, max: specific?.max ?? cfg.max }
}

/** Normalises for blocklist comparison: lowercase, strip accents, collapse repeated letters. */
export function normalizeName(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/(.)\1+/g, '$1')
}

export function isNameBlocked(raw: string, extraBlocklist: string[] = []): boolean {
  const words = normalizeName(raw).split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  const blocked = new Set([...BUILTIN_BLOCKLIST, ...extraBlocklist].map(normalizeName))
  return words.some((w) => blocked.has(w))
}

export type TagValidation = { ok: true; value: string } | { ok: false; reason: 'empty' | 'range' | 'length' | 'blocked' | 'chars' }

export function validateNumberTag(raw: string, cfg: OrderTagConfig, type: 'table' | 'pager'): TagValidation {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return { ok: false, reason: 'empty' }
  const n = Number(digits)
  const { min, max } = numberRange(cfg, type)
  if (!Number.isInteger(n) || n < min || n > max) return { ok: false, reason: 'range' }
  return { ok: true, value: String(n) }
}

export function validateNameTag(raw: string, cfg: OrderTagConfig): TagValidation {
  const value = raw.trim().replace(/\s+/g, ' ')
  if (!value) return { ok: false, reason: 'empty' }
  if (!/^[\p{L}\p{N} .'-]+$/u.test(value)) return { ok: false, reason: 'chars' }
  if (value.length < cfg.nameMin || value.length > cfg.nameMax) return { ok: false, reason: 'length' }
  if (isNameBlocked(value, cfg.nameBlocklist)) return { ok: false, reason: 'blocked' }
  return { ok: true, value }
}
