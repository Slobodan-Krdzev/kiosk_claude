// config.js imageBase: picture links on a private-network host load from the public origin; public links, unset or
// invalid imageBase → unchanged.
import { describe, expect, it } from 'vitest'
import { rehostImg } from '../adapters/http/catalogSource'
import { readImageBase } from './kioskConfig'

describe('imageBase', () => {
  it('reads an http(s) origin, trailing slash removed; anything else → null', () => {
    expect(readImageBase({ kioskConfig: { imageBase: 'http://f.revelapps.com:9091/' } })).toBe('http://f.revelapps.com:9091')
    for (const v of [undefined, '', 'f.revelapps.com', 'http://f.revelapps.com:9091/Shared', 42]) expect(readImageBase({ kioskConfig: { imageBase: v } })).toBeNull()
    expect(readImageBase({})).toBeNull()
  })
  it('moves only private-network picture links, path and query kept', () => {
    const B = 'http://f.revelapps.com:9091'
    expect(rehostImg('http://192.168.0.2:9091/Shared/Images/a.gif?v=2', B)).toBe('http://f.revelapps.com:9091/Shared/Images/a.gif?v=2')
    expect(rehostImg('http://10.0.0.5/x.png', B)).toBe('http://f.revelapps.com:9091/x.png')
    expect(rehostImg('http://my.tabletmenukaart.nl/x.png', B)).toBe('http://my.tabletmenukaart.nl/x.png')
    expect(rehostImg('http://192.168.0.2:9091/a.png', null)).toBe('http://192.168.0.2:9091/a.png')
  })
})
