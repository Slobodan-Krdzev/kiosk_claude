// Order-tag state (table / pager / name): mode per service, cleaning and validation. Port of the v36 tag logic.

import { isNameBlocked, numberRange, resolveTagMode, validateNameTag, validateNumberTag } from '../domain/orderTag'
import type { OrderTagConfig } from '../domain/types'
import { t, tf } from '../engine/state'

export function tagModeFor(cfg: OrderTagConfig, service: 'eatin' | 'takeaway' | null): 'none' | 'table' | 'pager' | 'name' {
  return resolveTagMode(cfg, service === 'eatin' ? 'eat-in' : 'takeaway').mode
}

export interface TagState {
  type: 'table' | 'pager' | 'name'
  v: string
  ok: boolean
  hint: string
  err: boolean
}

export function tagState(cfg: OrderTagConfig, service: 'eatin' | 'takeaway' | null, raw: string): TagState {
  const m = tagModeFor(cfg, service)
  const type = m === 'none' ? 'table' : m
  const v = clean(cfg, type, raw)
  let hint = ''
  let err = false
  let ok = false
  if (type === 'name') {
    const r = validateNameTag(v, cfg)
    ok = r.ok
    if (!v) hint = t('tag_nameNeed')
    else if (isNameBlocked(v, cfg.nameBlocklist)) {
      hint = t('tag_nameBad')
      err = true
    } else if (!ok) {
      hint = tf('tag_nameMin', { n: cfg.nameMin })
      err = true
    }
  } else {
    const r = numberRange(cfg, type)
    const res = validateNumberTag(v, cfg, type)
    ok = res.ok
    hint = tf('tag_range', { min: r.min, max: r.max })
    const n = Number(v)
    err = !!v && !ok && (n > r.max || v.length >= String(r.max).length)
  }
  return { type, v, ok, hint, err }
}

export function clean(cfg: OrderTagConfig, type: 'table' | 'pager' | 'name', v: string): string {
  if (type === 'name')
    return v
      .replace(/[^\p{L}\p{M} '-]/gu, '')
      .replace(/\s+/g, ' ')
      .replace(/^[ '-]+/, '')
      .slice(0, cfg.nameMax)
  return v
    .replace(/\D/g, '')
    .replace(/^0+/, '')
    .slice(0, String(numberRange(cfg, type).max).length)
}
