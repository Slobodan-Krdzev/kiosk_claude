// config.js (per-location backend address): present → wins over config.json; absent or broken → config.json applies
// and the problem is reported; trailing slash removed; mixed content and a missing /api suffix are warnings only.

import { describe, expect, it } from 'vitest'
import { apiHost, readKioskConfig } from './kioskConfig'

const w = (kioskConfig: unknown, protocol = 'https:') => ({ kioskConfig: kioskConfig as Window['kioskConfig'], location: { protocol } })

describe('config.js', () => {
  it('a valid file provides the api base and selects config.js as the origin', () => {
    const r = readKioskConfig(w({ api: 'https://kioskapi.dev.revelapps.com/api' }))
    expect(r).toEqual({ api: 'https://kioskapi.dev.revelapps.com/api', origin: 'config.js', problems: [] })
  })
  it('a missing file falls back to config.json and says so', () => {
    const r = readKioskConfig(w(undefined))
    expect(r.api).toBeNull()
    expect(r.origin).toBe('config.json')
    expect(r.problems[0]).toMatch(/missing/)
  })
  it('a file without a usable api string falls back and says so', () => {
    for (const bad of [null, {}, { api: 42 }, { api: '' }, 'x']) {
      const r = readKioskConfig(w(bad))
      expect(r.api).toBeNull()
      expect(r.problems[0]).toMatch(/no usable/)
    }
  })
  it('trailing slashes are removed (the old kiosk produced //getfullresources otherwise)', () => {
    const r = readKioskConfig(w({ api: 'https://host.example/api//' }))
    expect(r.api).toBe('https://host.example/api')
    expect(r.problems).toEqual(['config.js api had a trailing slash (removed)'])
  })
  it('a non-URL value is refused; http on an https page and a missing /api are warnings', () => {
    expect(readKioskConfig(w({ api: 'kioskapi.dev.revelapps.com/api' })).api).toBeNull()
    const r = readKioskConfig(w({ api: 'http://192.168.1.10/api' }, 'https:'))
    expect(r.api).toBe('http://192.168.1.10/api')
    expect(r.problems.some((p) => /mixed content/.test(p))).toBe(true)
    expect(readKioskConfig(w({ api: 'http://192.168.1.10/api' }, 'http:')).problems).toEqual([])
    expect(readKioskConfig(w({ api: 'https://host.example' })).problems).toEqual(['config.js api does not end in /api (the kiosk still uses it as given)'])
  })
  it('apiHost shows the host only', () => {
    expect(apiHost('https://kioskapi.dev.revelapps.com/api')).toBe('kioskapi.dev.revelapps.com')
    expect(apiHost('nonsense')).toBe('nonsense')
  })
})
