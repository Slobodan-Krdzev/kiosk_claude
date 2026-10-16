import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import configRaw from '../public/mock/config.json'
import type { GuestitConfig } from './domain/types'
import { createStaticAdapters } from './adapters/static/staticAdapters'
import { mapTmkToEngine } from './adapters/http/tmkMapper'
import { finalizeEngineData } from './engine/data'
import { E, L, setEngine, setLang, setUnavailable, setDisabled } from './engine/state'
import { newDraft, grpSet, validateDraft } from './engine/draft'
import { addToCart, revalidatePrices, cartTotal, applyEdit } from './engine/cart'
import { useEngine } from './store/engine'
import { attachPayState } from './store/payment'
import { createRuntime } from './app/runtime'
import { toPay, catalogRefresh } from './app/checkout'
import { Pay } from './ui/Pay'
import { Overlays } from './ui/Overlays'
import { PaymentController } from './payment/controller'
import { MemoryPaidRecordStore } from './payment/persistence'
import { FakePayment, FakePos, FakePrinter, TEST_TIMEOUTS, snapshotInput, deferred } from './test/fakes'

const files = {brand:'BRAND',cats:'CATS',products:'PRODUCTS',mods:'MODS',menuDeal:'MENU_DEAL',cms:'GUESTIT_CMS',upsell:'UPSELL_CMS',priceVariants:'PRICE_VARIANTS',i18n:'I18N',alg:'ALG',algIcon:'ALG_ICON',catsub:'CATSUB',comp:'COMP',compAll:'COMP_ALL',flags:'FLAGS',locales:'LOCALES',bdg:'BDG',icons:'P',obwInfo:'OBW_INFO',obwDefault:'OBW_DEFAULT',cmsCatAlias:'CMS_CAT_ALIAS',roleGroup:'ROLE_GROUP',allergenPolicy:'ALLERGEN_POLICY'}
const pack = () => finalizeEngineData(Object.fromEntries(Object.entries(files).map(([k,f])=>[k, JSON.parse(readFileSync(resolve('public/mock/dadawan',f+'.json'),'utf8'))])) as any)
const sample = () => JSON.parse(readFileSync(resolve('../failover-handover/docs/reference/api-samples/testmode-2490.json'),'utf8'))
const connected = {kind:'connected',role:'LOCAL_PRIMARY',nodeId:'local',epoch:1} as const
const ctrls: PaymentController[]=[]
const cfg = structuredClone(configRaw) as GuestitConfig
function ctrl(store = new MemoryPaidRecordStore()) {
 const payment=new FakePayment(), pos=new FakePos()
 const c=new PaymentController({adapters:{payment,pos,printer:new FakePrinter()},store,timeouts:TEST_TIMEOUTS,uncertainMs:120000,currency:'EUR',deviceId:'AUDIT',newOrderId:()=> 'AUDIT-1',onAccepted:()=>{}})
 ctrls.push(c); return {c,payment,pos,store}
}
function runtime() {
 const h=createStaticAdapters(), payment=new FakePayment()
 h.adapters.payment=payment
 h.adapters.availability.check=vi.fn(async()=>({unavailableIds:[]}))
 h.adapters.catalog.current=vi.fn(async()=>({version:36,prices:{},variants:{},disabled:[]}))
 const rt=createRuntime({adapters:h.adapters,staticHandle:null},cfg)
 ctrls.push(rt.controller)
 return {...rt,payment,adapters:h.adapters}
}
beforeEach(()=> {
 vi.useFakeTimers(); localStorage.clear(); sessionStorage.clear(); setEngine(pack());setLang('nl');setUnavailable([]);setDisabled([])
 useEngine.setState(useEngine.getInitialState(),true)
 useEngine.getState().setReady(cfg,'nl');useEngine.getState().setConn(connected)
 useEngine.getState().setCart(addToCart([],newDraft(E().products.find(p=>p.id==='gyoza')!)).cart)
 useEngine.getState().setScreen('tag')
})
afterEach(()=>{cleanup();ctrls.splice(0).forEach(c=>c.dispose());vi.restoreAllMocks();vi.useRealTimers()})
it('A01 must not submit an order after unknown payment recovery',async()=>{
 const first=ctrl();void first.c.start(snapshotInput());first.c.dispose()
 const next=ctrl(first.store);await next.c.restore();expect(next.c.state.status).toBe('assistance');await next.c.submitRetry()
 expect(next.pos.submits).toHaveLength(0)
})
it('A02 must expose a staff recovery control on assistance',async()=>{
 const c=ctrl();c.store.seed('invalid');await c.c.restore();attachPayState(c.c);render(<Pay />)
 expect(screen.queryAllByRole('button').length).toBeGreaterThan(0)
})
it('A03 must stop if authority is lost during checkout preflight',async()=>{
 const rt=runtime(), pending=deferred<{unavailableIds:string[]}>();rt.adapters.availability.check=()=>pending.promise
 const start=vi.spyOn(rt.controller,'start').mockResolvedValue(false)
 const p=toPay();useEngine.getState().setConn({kind:'no-authority',reason:'audit'} as any);pending.resolve({unavailableIds:[]});await p
 expect(start).not.toHaveBeenCalled()
})
it('A04 declined retry must refresh availability before starting another attempt',async()=>{
 const rt=runtime();const pending=rt.controller.start(snapshotInput());rt.payment.lastStart.resolve({result:'declined'});await pending
 const check=vi.spyOn(rt.adapters.availability,'check');vi.spyOn(rt.controller,'start').mockResolvedValue(false)
 render(<Pay />);await act(async()=>{fireEvent.click(screen.getByRole('button',{name:E().i18n.nl.payRetry}))})
 expect(check).toHaveBeenCalled()
})
it('A05 must reject an unavailable selected API upsell product',()=>{
 const d=mapTmkToEngine(sample(),pack(),{img:u=>u});setEngine(d)
 const p=d.products.find(p=>p.id==='469180')!,draft=newDraft(p),g='up9_8',item=d.mods[g].items[0]
 expect(item.pid).toBeTruthy();grpSet(draft,g,item.id,1);expect(validateDraft(draft)).toHaveLength(0)
 setUnavailable([item.pid!]);expect(validateDraft(draft).length).toBeGreaterThan(0)
})
it('A06 product names must use API translations when switching language',()=>{
 const raw=sample();const nl=raw.TMKData.find((x:any)=>x.Language==='nl'), en=raw.TMKData.find((x:any)=>x.Language==='en')
 const np=nl.MainCategories[0].SubCategories[0].Products[0]
 const ep=en.MainCategories.flatMap((m:any)=>m.SubCategories).flatMap((s:any)=>s.Products).find((p:any)=>p.ProductId===np.ProductId)
 expect(ep).toBeTruthy();np.Name='Nederlandse naam';ep.Name='English name'
 const d=mapTmkToEngine(raw,pack(),{img:u=>u});setEngine(d);setLang('en')
 expect(L(d.products.find(p=>p.id===String(np.ProductId))!.name)).toBe('English name')
})
it('A07 late loyalty response must not attach previous guest to a new order',async()=>{
 const rt=runtime(), pending=deferred<any>();rt.adapters.loyalty.identify=()=>pending.promise
 useEngine.getState().voucher();render(<Overlays />)
 fireEvent.change(screen.getByPlaceholderText('123456'),{target:{value:'123456'}})
 await act(async()=>{fireEvent.click(screen.getByRole('button',{name:E().i18n.nl.cm_apply}))})
 await act(async()=>{useEngine.getState().newOrderReset()})
 await act(async()=>{pending.resolve({id:'previous-guest',name:'Audit guest',points:1})})
 expect(useEngine.getState().member).toBeNull()
})

it('A08 must detect updated premium price variants during checkout refresh', async()=>{
 const rt=runtime(), draft=newDraft(E().products.find(p=>p.id==='salmonpoke')!);draft.menu=true;draft.drink='lychee'
 const cart=addToCart([],draft).cart
 rt.adapters.catalog.current=async()=>({version:37,prices:{},variants:{'lychee-menu-upgrade':999},disabled:[]})
 await catalogRefresh();expect(revalidatePrices(cart).length).toBeGreaterThan(0)
})
it('R6 regression: a sold-out included menu drink is rejected',()=>{
 const draft=newDraft(E().products.find(p=>p.id==='salmonpoke')!);draft.menu=true;draft.drink='cola'
 expect(validateDraft(draft)).toHaveLength(0);setUnavailable(['cola']);expect(validateDraft(draft).some(i=>i.code==='unavailable-included')).toBe(true)
})
it('R8 regression: editing parent quantity scales the integrated meal price',()=>{
 const draft=newDraft(E().products.find(p=>p.id==='salmonpoke')!);draft.menu=true;draft.drink='cola'
 const result=addToCart([],draft), old=cartTotal(result.cart);draft.qty=3
 const edited=applyEdit(result.cart,result.line.lid,draft)
 expect(cartTotal(edited)).toBe(old*3)
})
