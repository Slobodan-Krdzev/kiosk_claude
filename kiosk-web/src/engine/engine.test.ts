// @vitest-environment node
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { beforeAll, describe, expect, it } from 'vitest'
import { addCrossSellLine, addToCart, applyEdit, cartCount, cartTotal, lineSummary, removeLine, revalidatePrices, syncReward, validateCart, xsLinesOf } from './cart'
import { byId, obNeedsDetail, obVarCard, servingIx, visible } from './catalog'
import { cmsById, experienceFor, priceOf, presentationFor } from './cms'
import { finalizeEngineData } from './data'
import { blockReason, draftValid, exSet, newDraft, priceLines, unitPrice, xsSet, xsSum, cfgKey } from './draft'
import { fmt } from './money'
import { setAllergenFilter, setEngine, setLang, setUnavailable, t, tf } from './state'
import type { EngineData } from './types'

function load(): EngineData {
  const dir = resolve(process.cwd(), 'public/mock/dadawan')
  const j = (f: string) => JSON.parse(readFileSync(resolve(dir, f + '.json'), 'utf8'))
  return finalizeEngineData({
    brand: j('BRAND'), cats: j('CATS'), products: j('PRODUCTS'), mods: j('MODS'), menuDeal: j('MENU_DEAL'), cms: j('GUESTIT_CMS'), upsell: j('UPSELL_CMS'),
    priceVariants: j('PRICE_VARIANTS'), i18n: j('I18N'), alg: j('ALG'), algIcon: j('ALG_ICON'), catsub: j('CATSUB'), comp: j('COMP'), compAll: j('COMP_ALL'),
    flags: j('FLAGS'), locales: j('LOCALES'), bdg: j('BDG'), icons: j('P'), obwInfo: j('OBW_INFO'), obwDefault: j('OBW_DEFAULT'), cmsCatAlias: j('CMS_CAT_ALIAS'),
    roleGroup: j('ROLE_GROUP'), allergenPolicy: j('ALLERGEN_POLICY'),
  })
}

beforeAll(() => {
  setEngine(load())
  setLang('nl')
  setUnavailable([])
  setAllergenFilter(new Set())
})

describe('catalog + money', () => {
  it('prices are integer cents and the product price is the default serving', () => {
    const p = byId('salmonpoke')!
    expect(p.price).toBe(1250)
    expect(p.servings![servingIx(p, null)].love).toBe(true)
    expect(fmt(1250)).toBe('12,50')
    expect(fmt(0)).toBe('0,00')
  })
  it('cards: required choice or sizes need the detail page; 2–3 sizes without required choice is a wide card', () => {
    expect(obNeedsDetail(byId('salmonpoke')!)).toBe(true) // sizes
    expect(obVarCard(byId('salmonpoke')!)).toBe(true)
    expect(obNeedsDetail(byId('gyoza')!)).toBe(false)
    expect(visible(byId('salmonpoke') ? [byId('salmonpoke')!] : [])).toHaveLength(1)
  })
  it('translations resolve with fallback and placeholders', () => {
    expect(t('eatIn')).toBe('Hier eten')
    setLang('mk')
    expect(t('eatIn')).not.toBe('Hier eten')
    setLang('nl')
    expect(tf('r44Need', { group: 'X' })).toContain('X')
  })
})

describe('draft pricing', () => {
  it('size, menu and premium extras add up in cents', () => {
    const p = byId('salmonpoke')!
    const d = newDraft(p)
    expect(unitPrice(d)).toBe(1250)
    d.serving = 2
    expect(unitPrice(d)).toBe(1550)
    d.menu = true
    d.drink = 'cola'
    expect(unitPrice(d)).toBe(1550 + 450)
    d.drink = 'lychee'
    expect(unitPrice(d)).toBe(1550 + 450 + priceOf(cmsById('vuLychee')!))
    exSet(d, 'premX', 'vuSalmon', 2)
    expect(unitPrice(d)).toBe(1550 + 450 + 150 + 2 * 350)
    xsSet(d, 'xsGyoza', { quantity: 1 })
    expect(xsSum(d)).toBe(350)
    expect(priceLines(p, d).length).toBeGreaterThan(3)
  })
  it('required choices block the add with a reason', () => {
    const p = byId('steakplate') ?? byId('plateBeef') ?? byId('stoneBeef')
    const needs = p ?? load().products.find((x) => (x.choice || []).some((g) => load().mods[g].req))!
    const d = newDraft(needs)
    expect(draftValid(d)).toBe(false)
    expect(blockReason(d)).toMatch(/./)
  })
  it('experienceFor: poke has visual upsell with menu + enhancements + cross-sells', () => {
    const xp = experienceFor(byId('salmonpoke')!, new Set(), new Set())
    expect(xp.flowType).toBe('visual-upsell')
    expect(xp.menuUpgrade).not.toBeNull()
    expect(xp.allEnhancements.length).toBeGreaterThan(0)
    expect(xp.allCrossSells.map((v) => v.id)).toContain('xsGyoza')
    expect(presentationFor('sushi').card).toBe('compact')
  })
})

describe('cart', () => {
  it('merges identical simple lines, keeps configured lines apart, links cross-sell lines', () => {
    const g = byId('gyoza')!
    let { cart } = addToCart([], newDraft(g))
    ;({ cart } = addToCart(cart, newDraft(g)))
    expect(cart).toHaveLength(1)
    expect(cart[0].qty).toBe(2)
    const d = newDraft(byId('salmonpoke')!)
    d.serving = 0
    xsSet(d, 'xsEdam')
    const r = addToCart(cart, d)
    cart = addCrossSellLine(r.cart, cmsById('xsEdam')!, r.line, d.crossSells[0])
    expect(cart).toHaveLength(3)
    expect(xsLinesOf(cart, r.line.lid)).toHaveLength(1)
    expect(cartCount(cart)).toBe(4)
    expect(cartTotal(cart)).toBe(2 * g.price + 1050 + priceOf(cmsById('xsEdam')!))
    expect(lineSummary(cart, r.line)).toContain('Small')
    // remove main but keep sides
    const kept = removeLine(cart, r.line.lid, { unlink: true })
    expect(kept).toHaveLength(2)
    expect(kept.find((l) => l.lineType === 'cross-sell')!.sourceLineId).toBeNull()
    const all = removeLine(cart, r.line.lid, { withLinked: true })
    expect(all).toHaveLength(1)
  })
  it('edit reconfigures the line and reconciles cross-sells', () => {
    const d = newDraft(byId('salmonpoke')!)
    d.serving = 1
    xsSet(d, 'xsGyoza')
    const r = addToCart([], d)
    let cart = addCrossSellLine(r.cart, cmsById('xsGyoza')!, r.line, d.crossSells[0])
    const e = JSON.parse(JSON.stringify(d))
    e.serving = 2
    e.crossSells = [{ id: 'xsEdam', quantity: 2, extraPortion: false }]
    cart = applyEdit(cart, r.line.lid, e)
    expect(cart.find((l) => l.lid === r.line.lid)!.unitPrice).toBe(1550)
    expect(cart.filter((l) => l.lineType === 'cross-sell').map((l) => [l.xsId, l.qty])).toEqual([['xsEdam', 2]])
    expect(cfgKey(e)).not.toBe(cfgKey(d))
  })
  it('reward gift appears at the threshold and leaves below it; validation and price revalidation work', () => {
    const { cart } = addToCart([], { ...newDraft(byId('salmonpoke')!), serving: 2, qty: 2 })
    const r1 = syncReward(cart, false)
    expect(r1.cart[0].reward).toBe(true)
    expect(r1.change).toEqual({ added: true, name: byId('mochi')!.name })
    const r2 = syncReward(r1.cart.map((l) => (l.reward ? l : { ...l, qty: 1 })), false)
    expect(r2.cart.some((l) => l.reward)).toBe(false)
    expect(validateCart(cart)).toEqual([])
    const changed = cart.map((l) => ({ ...l, unitPrice: l.unitPrice - 100 }))
    expect(revalidatePrices(changed)).toHaveLength(1)
    setUnavailable(['salmonpoke'])
    expect(validateCart(cart).some((i) => i.code === 'unavailable')).toBe(true)
    setUnavailable([])
  })
})
