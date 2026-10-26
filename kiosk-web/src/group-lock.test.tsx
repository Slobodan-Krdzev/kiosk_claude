// Group locking (2026-10-26, Alex): on the product page every group below an unfinished mandatory group is
// disabled — modifier groups, multi-pick groups and upsell steps alike. Picks there are refused (store + engine).
// Real test menu 2490, product 469180 "7up (copy)": wizard "Something" (1/1, mandatory), wizard "Test" (multi-pick),
// upsell collection after them. A variant makes "Test" single-pick too, so two modifier choice groups follow each other.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { TmkRoot } from './adapters/http/tmk'
import { mapTmkToEngine } from './adapters/http/tmkMapper'
import { byId } from './engine/catalog'
import { finalizeEngineData } from './engine/data'
import { grpSet, groupLocked, newDraft, pageGroups } from './engine/draft'
import { E, setEngine, setLang } from './engine/state'
import type { EngineData } from './engine/types'
import { setAvailabilityGate, useEngine } from './store/engine'

const FILES = { brand: 'BRAND', cats: 'CATS', products: 'PRODUCTS', mods: 'MODS', menuDeal: 'MENU_DEAL', cms: 'GUESTIT_CMS', upsell: 'UPSELL_CMS', priceVariants: 'PRICE_VARIANTS', i18n: 'I18N', alg: 'ALG', algIcon: 'ALG_ICON', catsub: 'CATSUB', comp: 'COMP', compAll: 'COMP_ALL', flags: 'FLAGS', locales: 'LOCALES', bdg: 'BDG', icons: 'P', obwInfo: 'OBW_INFO', obwDefault: 'OBW_DEFAULT', cmsCatAlias: 'CMS_CAT_ALIAS', roleGroup: 'ROLE_GROUP', allergenPolicy: 'ALLERGEN_POLICY' }
function pack(): EngineData {
  const dir = resolve(process.cwd(), 'public/mock/dadawan')
  return finalizeEngineData(Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, JSON.parse(readFileSync(resolve(dir, f + '.json'), 'utf8'))])) as unknown as EngineData)
}
const RAW: TmkRoot = JSON.parse(readFileSync(resolve(process.cwd(), '../failover-handover/docs/reference/api-samples/testmode-2490.json'), 'utf8'))
const PID = '469180'

function menu(opts: { twoChoices?: boolean } = {}): EngineData {
  const raw = structuredClone(RAW)
  if (opts.twoChoices)
    for (const t of raw.TMKData)
      for (const m of t.MainCategories)
        for (const s of m.SubCategories)
          for (const p of s.Products)
            if (String(p.ProductId) === PID) for (const w of p.ModifierWizards || []) Object.assign(w, { SelectionMin: 1, SelectionMax: 1, IsMandatory: true })
  return mapTmkToEngine(raw, pack(), { img: (u) => u })
}

beforeEach(() => {
  setAvailabilityGate(null)
  setLang('nl')
})
afterEach(() => useEngine.setState({ cart: [], draft: null, pdpOpen: false, pid: null }))

describe('groups below an unfinished mandatory group are locked', () => {
  it('mandatory modifier choice → the multi-pick group and the upsell steps below are locked until it is chosen', () => {
    setEngine(menu())
    const p = byId(PID)!
    const d = newDraft(p)
    const [first, ...rest] = pageGroups(p, d)
    expect(E().mods[first].req).toBe(true)
    expect(rest.length).toBeGreaterThan(0)
    expect(groupLocked(d, first)).toBe(false)
    expect(rest.every((g) => groupLocked(d, g))).toBe(true)
    // a pick in a locked step is refused
    const step = rest.find((g) => E().mods[g].type === 'step')!
    expect(grpSet(d, step, E().mods[step].items[0].id, 1)).toBe(false)
    d.choices[first] = E().mods[first].items[0].id
    expect(groupLocked(d, rest[0])).toBe(false)
  })

  it('two mandatory modifier choice groups: the second is locked and the store refuses a choice there until the first is made', () => {
    setEngine(menu({ twoChoices: true }))
    const p = byId(PID)!
    useEngine.getState().openProduct(p, { draft: newDraft(p) })
    const [a, b] = pageGroups(p, useEngine.getState().draft!)
    expect([E().mods[a].type, E().mods[b].type]).toEqual(['choice', 'choice'])
    const pickB = E().mods[b].items[0].id
    useEngine.getState().choice(b, pickB)
    expect(useEngine.getState().draft!.choices[b] ?? null).toBeNull()
    useEngine.getState().choice(a, E().mods[a].items[0].id)
    useEngine.getState().choice(b, pickB)
    expect(useEngine.getState().draft!.choices[b]).toBe(pickB)
  })

})
