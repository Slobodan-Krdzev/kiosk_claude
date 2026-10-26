// "Special" modifier groups (2026-10-26): a wizard with SubTitle "Special" becomes option tiles on a full-row card.
// A tile opens the product page with that option chosen when more groups or upsell follow; otherwise it adds the
// product at once. The option still travels in the order POST as an UpsaleCollection entry with its ProductId.
// Built on the real test menu 2490 (product 469180 "7up (copy)"), with its wizard data adjusted per case.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildSnapshot } from './app/checkout'
import type { TmkRoot } from './adapters/http/tmk'
import { mapTmkToEngine } from './adapters/http/tmkMapper'
import { buildOrderPayload } from './adapters/http/tmkOrder'
import { byId, specialGroup, specialHasMore } from './engine/catalog'
import { finalizeEngineData } from './engine/data'
import { E, setEngine, setLang } from './engine/state'
import type { EngineData } from './engine/types'
import { setAvailabilityGate, useEngine } from './store/engine'

const FILES = { brand: 'BRAND', cats: 'CATS', products: 'PRODUCTS', mods: 'MODS', menuDeal: 'MENU_DEAL', cms: 'GUESTIT_CMS', upsell: 'UPSELL_CMS', priceVariants: 'PRICE_VARIANTS', i18n: 'I18N', alg: 'ALG', algIcon: 'ALG_ICON', catsub: 'CATSUB', comp: 'COMP', compAll: 'COMP_ALL', flags: 'FLAGS', locales: 'LOCALES', bdg: 'BDG', icons: 'P', obwInfo: 'OBW_INFO', obwDefault: 'OBW_DEFAULT', cmsCatAlias: 'CMS_CAT_ALIAS', roleGroup: 'ROLE_GROUP', allergenPolicy: 'ALLERGEN_POLICY' }
function pack(): EngineData {
  const dir = resolve(process.cwd(), 'public/mock/dadawan')
  return finalizeEngineData(Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, JSON.parse(readFileSync(resolve(dir, f + '.json'), 'utf8'))])) as unknown as EngineData)
}
const RAW: TmkRoot = JSON.parse(readFileSync(resolve(process.cwd(), '../failover-handover/docs/reference/api-samples/testmode-2490.json'), 'utf8'))
const PID = 469180

/** Menu 2490 where product 469180's single-select wizard ("Something", 1/1) has SubTitle "Special". */
function menu(opts: { only?: boolean } = {}): EngineData {
  const raw = structuredClone(RAW)
  for (const t of raw.TMKData)
    for (const m of t.MainCategories)
      for (const s of m.SubCategories)
        for (const p of s.Products) {
          if (p.ProductId !== PID) continue
          const special = p.ModifierWizards!.find((w) => w.SelectionMax === 1)!
          special.SubTitle = 'Special'
          if (opts.only) {
            // Nothing after the special group: no other wizard, no upsell.
            p.ModifierWizards = [special]
            p.HasUpsaleCollection = false
            p.UpsaleCollectionId = null
          }
        }
  return mapTmkToEngine(raw, pack(), { img: (u) => u })
}

beforeEach(() => {
  setAvailabilityGate(null)
  setLang('nl')
})
afterEach(() => useEngine.setState({ cart: [], draft: null, pdpOpen: false, pid: null }))

describe('mapping', () => {
  it('SubTitle "Special" (any case, trimmed) marks that choice group; other products have none', () => {
    const d = menu()
    const p = d.products.find((x) => x.id === String(PID))!
    expect(p.special).toBeTruthy()
    expect(d.mods[p.special!].type).toBe('choice')
    expect(p.choice).toContain(p.special)
    expect(d.products.filter((x) => x.special)).toHaveLength(1)
    expect(menu().products.find((x) => x.id === '465455')!.special).toBeUndefined()
  })
})

describe('tile tap', () => {
  it('more groups or upsell follow → the product page opens with that option already chosen, nothing in the basket', () => {
    setEngine(menu())
    const p = byId(String(PID))!
    const g = specialGroup(p)!
    expect(specialHasMore(p)).toBe(true)
    const opt = E().mods[g].items[0]
    useEngine.getState().specialPick(p.id, opt.id)
    const s = useEngine.getState()
    expect(s.pdpOpen).toBe(true)
    expect(s.pid).toBe(p.id)
    expect(s.draft!.choices[g]).toBe(opt.id)
    expect(s.cart).toHaveLength(0)
  })

  it('nothing follows → added to the basket at once with that option; the order POST carries it as an UpsaleCollection entry', () => {
    setEngine(menu({ only: true }))
    const p = byId(String(PID))!
    const g = specialGroup(p)!
    expect(specialHasMore(p)).toBe(false)
    const opt = E().mods[g].items[E().mods[g].items.length - 1]
    useEngine.getState().specialPick(p.id, opt.id)
    const s = useEngine.getState()
    expect(s.pdpOpen).toBe(false)
    expect(s.cart).toHaveLength(1)
    expect(s.cart[0].choices[g]).toBe(opt.id)
    const snap = buildSnapshot(s.cart, 'eat-in', 'nl', { type: 'table', value: '1' }, null)
    expect(snap.lines[0].unitPriceCents).toBe(p.price + opt.price)
    const body = buildOrderPayload({ ...snap, orderId: 'K1-x-1', startedAt: '', paidAt: null }, '1')
    expect(body.Order.Items[0].Item.Id).toBe(PID)
    expect(body.Order.Items[0].UpsaleCollection.map((u) => [u.UpsaleStepOptionModel.ProductId, u.Quantity])).toEqual([[Number(opt.pid), 1]])
  })

  it('an unknown option id does nothing', () => {
    setEngine(menu({ only: true }))
    useEngine.getState().specialPick(String(PID), 'nope')
    expect(useEngine.getState().cart).toHaveLength(0)
  })
})
