// Allergen filter on a real API menu (captured getfullresources of 2026-10-15): products that declare a
// selected allergen leave the open category immediately; products without an allergen screen stay (unknown ≠ free of).
// Found 2026-10-16 in Chrome: the grid only refreshed after navigating away and back.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import configRaw from '../public/mock/config.json'
import type { TmkRoot } from './adapters/http/tmk'
import { mapTmkToEngine } from './adapters/http/tmkMapper'
import type { GuestitConfig } from './domain/types'
import { alUnknown, prodsIn } from './engine/catalog'
import { finalizeEngineData } from './engine/data'
import { E, setAllergenFilter, setDisabled, setEngine, setLang, setUnavailable } from './engine/state'
import type { EngineData } from './engine/types'
import { useEngine } from './store/engine'
import { HomeMain, MenuMain } from './ui/shell'

const FILES: Record<string, string> = {
  brand: 'BRAND', cats: 'CATS', products: 'PRODUCTS', mods: 'MODS', menuDeal: 'MENU_DEAL', cms: 'GUESTIT_CMS', upsell: 'UPSELL_CMS', priceVariants: 'PRICE_VARIANTS', i18n: 'I18N', alg: 'ALG', algIcon: 'ALG_ICON', catsub: 'CATSUB', comp: 'COMP', compAll: 'COMP_ALL', flags: 'FLAGS', locales: 'LOCALES', bdg: 'BDG', icons: 'P', obwInfo: 'OBW_INFO', obwDefault: 'OBW_DEFAULT', cmsCatAlias: 'CMS_CAT_ALIAS', roleGroup: 'ROLE_GROUP', allergenPolicy: 'ALLERGEN_POLICY',
}
function pack(): EngineData {
  const dir = resolve(process.cwd(), 'public/mock/dadawan')
  return finalizeEngineData(Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, JSON.parse(readFileSync(resolve(dir, f + '.json'), 'utf8'))])) as unknown as EngineData)
}
const FULL: TmkRoot = JSON.parse(readFileSync(resolve(process.cwd(), '../failover-handover/docs/reference/api-samples/getfullresources.json'), 'utf8'))
const cfg = structuredClone(configRaw) as unknown as GuestitConfig
const KOUDE = 's54926'

const cards = (el: HTMLElement) => [...new Set([...el.querySelectorAll('[data-ctl-for]')].map((x) => x.getAttribute('data-ctl-for')))]

beforeEach(() => {
  setEngine(mapTmkToEngine(FULL, pack(), { img: (u) => u }))
  setLang('nl')
  setUnavailable([])
  setDisabled([])
  setAllergenFilter(new Set())
  useEngine.setState(useEngine.getInitialState(), true)
  useEngine.getState().setReady(cfg, 'nl')
  useEngine.getState().startWith('eatin')
})
afterEach(() => {
  cleanup()
  setAllergenFilter(new Set())
})

describe('allergen filter with real API data', () => {
  it('the API allergen screens feed the filter: 73 of 86 dev-menu products declare allergens, gluten on 37', () => {
    const all = E().products
    expect(all).toHaveLength(86)
    expect(all.filter((p) => !alUnknown(p))).toHaveLength(73)
    expect(all.filter((p) => p.allergens.contains.includes('gluten'))).toHaveLength(37)
    expect(E().algFilter).toHaveLength(18) // ids 1–18; the dietary marks 19–22 are not filters
  })

  it('toggling an allergen rebuilds the open category at once; unknown products stay; reset restores', () => {
    useEngine.getState().goCat(KOUDE)
    const { container } = render(<MenuMain />)
    const before = cards(container)
    expect(before).toHaveLength(prodsIn(KOUDE).length)
    expect(before.length).toBeGreaterThan(5)

    act(() => useEngine.getState().alToggle('gluten'))
    const gluten = cards(container)
    expect(gluten.length).toBe(prodsIn(KOUDE).length)
    expect(gluten.length).toBeLessThan(before.length)
    for (const pid of gluten) expect(E().products.find((p) => p.id === pid)!.allergens.contains).not.toContain('gluten')
    for (const pid of before.filter((x) => !gluten.includes(x))) expect(E().products.find((p) => p.id === pid)!.allergens.contains).toContain('gluten')

    act(() => useEngine.getState().alToggle('milk'))
    const both = cards(container)
    expect(both.length).toBeLessThan(gluten.length)

    // a product without an allergen screen is never hidden by the filter (unknown ≠ free of)
    const unknownCat = E().products.find((p) => alUnknown(p))!.cat
    act(() => useEngine.getState().goCat(unknownCat))
    expect(cards(container)).toEqual(expect.arrayContaining(E().products.filter((p) => p.cat === unknownCat && alUnknown(p) && !p.infoOnly).map((p) => p.id)))

    act(() => useEngine.getState().alClear())
    act(() => useEngine.getState().goCat(KOUDE))
    expect(cards(container)).toEqual(before)
  })

  it('the home rows follow the filter as well', () => {
    const d = E()
    const popular = d.products.filter((p) => p.allergens.contains.includes('gluten')).slice(0, 2)
    popular.forEach((p) => p.badges.push('pop'))
    useEngine.getState().home()
    const { container } = render(<HomeMain />)
    expect(cards(container)).toEqual(expect.arrayContaining(popular.map((p) => p.id)))
    act(() => useEngine.getState().alToggle('gluten'))
    for (const p of popular) expect(cards(container)).not.toContain(p.id)
  })
})
