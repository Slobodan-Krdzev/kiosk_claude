import { describe, expect, it } from 'vitest'
import { isNameBlocked, normalizeName, resolveTagMode, validateNameTag, validateNumberTag } from './orderTag'
import type { OrderTagConfig } from './types'

const cfg: OrderTagConfig = {
  mode: 'table',
  takeawayMode: 'pager',
  required: true,
  min: 1,
  max: 99,
  table: { min: 1, max: 40 },
  pager: { min: 1, max: 150 },
  nameMin: 2,
  nameMax: 16,
  nameBlocklist: ['sojubar'],
}

describe('order tag mode resolution', () => {
  it('uses takeawayMode for takeaway and mode for eat-in', () => {
    expect(resolveTagMode(cfg, 'eat-in').mode).toBe('table')
    expect(resolveTagMode(cfg, 'takeaway').mode).toBe('pager')
  })
  it('defaults takeaway to none when mode is table and takeawayMode is missing', () => {
    expect(resolveTagMode({ ...cfg, takeawayMode: null }, 'takeaway').mode).toBe('none')
    expect(resolveTagMode({ ...cfg, mode: 'name', takeawayMode: undefined }, 'takeaway').mode).toBe('name')
  })
  it('falls back to none with a client error on an unknown mode', () => {
    const r = resolveTagMode({ ...cfg, mode: 'beacon' as never }, 'eat-in')
    expect(r.mode).toBe('none')
    expect(r.clientError).toContain('beacon')
  })
})

describe('number tags', () => {
  it('uses the type-specific range', () => {
    expect(validateNumberTag('40', cfg, 'table')).toEqual({ ok: true, value: '40' })
    expect(validateNumberTag('41', cfg, 'table')).toEqual({ ok: false, reason: 'range' })
    expect(validateNumberTag('150', cfg, 'pager')).toEqual({ ok: true, value: '150' })
    expect(validateNumberTag('007', cfg, 'pager')).toEqual({ ok: true, value: '7' })
    expect(validateNumberTag('', cfg, 'pager')).toEqual({ ok: false, reason: 'empty' })
    expect(validateNumberTag('0', cfg, 'pager')).toEqual({ ok: false, reason: 'range' })
  })
})

describe('name tags', () => {
  it('normalises case, accents and stretched letters', () => {
    expect(normalizeName('Shiiiit')).toBe('shit')
    expect(normalizeName('Kánker')).toBe('kanker')
  })
  it('blocks whole words from the built-in and the organisation list', () => {
    expect(isNameBlocked('Alex')).toBe(false)
    expect(isNameBlocked('SHIT happens')).toBe(true)
    expect(isNameBlocked('Sojubar', cfg.nameBlocklist)).toBe(true)
    expect(isNameBlocked('Shitake', cfg.nameBlocklist)).toBe(false) // not a whole word
  })
  it('validates length, characters and blocklist', () => {
    expect(validateNameTag('  Alex  ', cfg)).toEqual({ ok: true, value: 'Alex' })
    expect(validateNameTag('A', cfg)).toEqual({ ok: false, reason: 'length' })
    expect(validateNameTag('A very long name indeed', cfg)).toEqual({ ok: false, reason: 'length' })
    expect(validateNameTag('Al<x>', cfg)).toEqual({ ok: false, reason: 'chars' })
    expect(validateNameTag('kut', cfg)).toEqual({ ok: false, reason: 'blocked' })
    expect(validateNameTag('Марија', cfg)).toEqual({ ok: true, value: 'Марија' })
  })
})
