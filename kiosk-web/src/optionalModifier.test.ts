// Optional single-pick modifiers (Alex, 2026-10-27, "HULA SUNRISE" / "Make it Large": IsMandatory false,
// SelectionMin 0, SelectionMax 1). The card "+" used to add the product with the option already picked. Now the
// group starts empty ("Normal" tile on the product page), the card opens the product page, and the order POST
// carries the option only when the guest picked it. Built on the real test menu 2490 (product 469180), wizard data adjusted.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildSnapshot } from './app/checkout'
import type { TmkRoot } from './adapters/http/tmk'
import { mapTmkToEngine } from './adapters/http/tmkMapper'
import { buildOrderPayload } from './adapters/http/tmkOrder'
import { byId, modifierGroupCount, normalTiles, obNeedsDetail } from './engine/catalog'
import { finalizeEngineData } from './engine/data'
import { newDraft } from './engine/draft'
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

/** Menu 2490 where product 469180 has one optional single-pick wizard and nothing else. */
function menu(opts: { mandatory?: boolean; preselected?: boolean; others?: boolean } = {}): EngineData {
  const raw = structuredClone(RAW)
  for (const t of raw.TMKData)
    for (const m of t.MainCategories)
      for (const s of m.SubCategories)
        for (const p of s.Products) {
          if (p.ProductId !== PID) continue
          const w = p.ModifierWizards!.find((x) => x.SelectionMax === 1)!
          w.SubTitle = ''
          w.IsMandatory = !!opts.mandatory
          w.SelectionMin = opts.mandatory ? 1 : 0
          w.ModifierItemElements!.forEach((e, i) => (e.DefaultSelected = !!opts.preselected && i === 0))
          if (!opts.others) p.ModifierWizards = [w]
          p.HasUpsaleCollection = false
          p.UpsaleCollectionId = null
        }
  return mapTmkToEngine(raw, pack(), { img: (u) => u })
}

beforeEach(() => {
  setAvailabilityGate(null)
  setLang('nl')
})
afterEach(() => useEngine.setState({ cart: [], draft: null, pdpOpen: false, pid: null }))

describe('optional single-pick modifier', () => {
  it('starts empty and the card "+" opens the product page instead of adding', () => {
    setEngine(menu())
    const p = byId(String(PID))!
    const g = p.choice![0]
    expect(E().mods[g].blank).toBe(true)
    expect(newDraft(p).choices[g]).toBeNull()
    expect(obNeedsDetail(p)).toBe(true)
    useEngine.getState().quickAdd(p.id)
    const s = useEngine.getState()
    expect(s.cart).toHaveLength(0)
    expect(s.pdpOpen).toBe(true)
    expect(s.draft!.choices[g]).toBeNull()
  })

  it('the "Normal" tile (null) takes the option off again; a mandatory group refuses null', () => {
    setEngine(menu())
    const p = byId(String(PID))!
    const g = p.choice![0]
    const id = E().mods[g].items[0].id
    useEngine.getState().openProduct(p)
    useEngine.getState().choice(g, id)
    useEngine.getState().choice(g, id)
    expect(useEngine.getState().draft!.choices[g]).toBe(id)
    useEngine.getState().choice(g, null)
    expect(useEngine.getState().draft!.choices[g]).toBeNull()
    setEngine(menu({ mandatory: true }))
    const g2 = byId(String(PID))!.choice![0]
    useEngine.getState().openProduct(byId(String(PID))!)
    useEngine.getState().choice(g2, id)
    useEngine.getState().choice(g2, null)
    expect(useEngine.getState().draft!.choices[g2]).toBe(id)
  })

  it('the order POST carries the option only when it was picked', () => {
    setEngine(menu())
    const p = byId(String(PID))!
    const g = p.choice![0]
    const opt = E().mods[g].items[0]
    const post = (choice: string | null) => {
      const d = newDraft(p)
      d.choices[g] = choice
      const line = { ...d, lid: 'L1', key: 'k', qty: 1, unitPrice: p.price + (choice ? opt.price : 0), lineType: 'product' as const, groupId: 'G1', priceCheckedAt: Date.now() }
      const snap = buildSnapshot([line], 'eat-in', 'nl', { type: 'table', value: '1' }, null)
      return buildOrderPayload({ ...snap, orderId: 'K1-x-1', startedAt: '', paidAt: null }, '1').Order.Items[0].UpsaleCollection
    }
    expect(post(null)).toEqual([])
    expect(post(opt.id).map((u) => u.UpsaleStepOptionModel.ProductId)).toEqual([Number(opt.pid)])
  })

  it('DefaultSelected still pre-picks; a mandatory group is not "blank"', () => {
    setEngine(menu({ preselected: true }))
    const p = byId(String(PID))!
    const g = p.choice![0]
    expect(newDraft(p).choices[g]).toBe(E().mods[g].items[0].id)
    setEngine(menu({ mandatory: true }))
    expect(E().mods[byId(String(PID))!.choice![0]].blank).toBeUndefined()
  })

  it('"Normal" tiles only when it is the only modifier group; with more groups it stays chips', () => {
    setEngine(menu())
    let p = byId(String(PID))!
    expect(modifierGroupCount(p)).toBe(1)
    expect(normalTiles(p, p.choice![0])).toBe(true)
    setEngine(menu({ others: true }))
    p = byId(String(PID))!
    expect(modifierGroupCount(p)).toBeGreaterThan(1)
    expect(normalTiles(p, p.choice![0])).toBe(false)
    expect(obNeedsDetail(p)).toBe(true)
  })
})
