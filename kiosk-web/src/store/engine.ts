// Kiosk state + actions: a port of the reference engine's S state and ACT handlers onto Zustand.
// Everything money- or data-related is delegated to src/engine/*; this file only sequences state.

import { create } from 'zustand'
import type { ConnectionState } from '../domain/connectivity'
import type { GuestitConfig, LoyaltyMember, OrderTag } from '../domain/types'
import {
  addCrossSellLine,
  addToCart,
  applyEdit,
  bumpIds,

  hasLinked,
  line,
  obLine,
  obQty,
  removeLine,
  setLineQty,
  syncReward,
  xsLinesOf,
  type RewardChange,
} from '../engine/cart'
import { byId, defServingIx, homeHasContent, lineMax, mustId, obBlocked, obNeedsDetail, obSizes, obVarCard, pname, servingsOf, specialGroup, specialHasMore } from '../engine/catalog'
import { cmsById, experienceFor } from '../engine/cms'
import { cfgKey, clampQty, exQty, exSet, grpSet, newDraft, stepKey, unavailParts, validateDraft, xsConflicts, xsKey, xsPortion, xsRemove, xsSel, xsSelected, xsSet, draftValid } from '../engine/draft'
import { E, L, checkProducts, hasEngine, setAllergenFilter, setLang as engineSetLang } from '../engine/state'
import type { CartLine, Draft, Lang, Product } from '../engine/types'

export type Screen = 'attract' | 'home' | 'menu' | 'cart' | 'tag' | 'pay'
export type Service = 'eatin' | 'takeaway'
export type Sheet = null | 'voucher' | 'loyalty' | 'alfilter' | 'price' | { allergens: string }
export type Confirm =
  | null
  | 'idle'
  | 'availFail'
  | 'authChanged'
  | 'crash'
  | 'cancel'
  | 'discard'
  | 'discardStep'
  | { type: 'priceChanged'; changes: { lid: string; name: string; old: number; now: number }[]; shown: string; again?: boolean }
  | { type: 'delLinked'; lid: string }
  /** The live availability check said "sold out" when the guest tapped a product (kiosk-product-checks.md §2). */
  | { type: 'soldOut'; name: string }
  /** The order POST answered "Printing problem": continue without a receipt (resend with skip=true) or abort. */
  | 'printProblem'

/**
 * Live availability gate (old kiosk: `checkProductAvailable` on tap / info / detail add). Installed by the app;
 * resolves 'ok' | 'soldOut' | 'unknown'. The store asks it once per product per guest session, before the first
 * add or product-page open; later increments of the same product are not re-checked (checkout re-checks the cart).
 */
export type AvailabilityGate = (pid: string) => Promise<'ok' | 'soldOut' | 'unknown'>
let gate: AvailabilityGate | null = null
/** Products already confirmed available in this guest session (cleared by newOrderReset and when the gate changes). */
const verified = new Set<string>()
export function setAvailabilityGate(g: AvailabilityGate | null): void {
  gate = g
  verified.clear()
}

export interface EngineState {
  ready: boolean
  bootError: string | null
  /** The remote menu failed after the payment controller was restored: recovery runs, guests cannot order. */
  menuError: string | null
  /** Guest session generation: bumped on every reset. Async replies for an older generation are discarded (audit F07). */
  sessionGen: number
  config: GuestitConfig | null
  lang: Lang
  service: Service | null
  screen: Screen
  navDir: 'fwd' | 'back'
  cat: string
  filter: string
  cart: CartLine[]
  cartVersion: number
  // product page (overlay over home/menu, or full screen from the cart)
  pdpOpen: boolean
  pdpStep: 'product' | 'customize'
  pid: string | null
  draft: Draft | null
  editing: string | null
  from: 'home' | 'menu' | 'cart' | null
  draft0: string | null
  custom0: string | null
  customRestore: [[string, string][], [string, string][]] | null
  // overlays
  sheet: Sheet
  confirm: Confirm
  allergenFilter: string[]
  rewardDismissed: boolean
  // order tag
  tag: OrderTag | null
  tagDraft: string
  tagFor: string | null
  tagKb: 'lat' | 'cyr'
  // misc
  heroIdx: number
  checking: boolean
  /** Product whose live availability check is in flight (card shows a waiting state; taps are ignored meanwhile). */
  availPending: string | null
  /** Bumped when the sold-out set changed, so product lists and cards re-render. */
  availVersion: number
  gtcKey: string | null
  servingSel: Record<string, number>
  note: { text: string; at: number } | null
  toast: { text: string; at: number } | null
  member: LoyaltyMember | null
  conn: ConnectionState
  staffOpen: boolean
  idleWarnAt: number | null
  lastActivity: number
  homeScroll: number
  menuScroll: { cat: string; top: number } | null

  // boot
  setReady(config: GuestitConfig, lang: Lang): void
  setBootError(msg: string): void
  setMenuError(msg: string | null): void
  setConn(c: ConnectionState): void
  setStaffOpen(open: boolean): void
  setMember(m: LoyaltyMember | null): void
  touch(): void

  // navigation
  setLang(l: Lang): void
  startWith(s: Service): void
  home(): void
  attract(): void
  otype(s: Service): void
  goCat(c: string): void
  setFilter(f: string): void
  viewOrder(): void
  backMenu(): void
  saveScroll(top: number): void

  // cards
  quickAdd(pid: string): void
  cardInc(pid: string, wide: boolean): void
  cardDec(pid: string, wide: boolean): void
  obVar(pid: string, ix: number): void
  /** Full-row card of a "Special" product: tap an option tile. */
  specialPick(pid: string, id: string): void
  pickServing(pid: string, ix: number, ctx: 'card' | 'pdp'): void
  gtcExpand(pid: string): void
  gtcCollapse(): void

  // product page
  openProduct(p: Product, opts?: { menu?: boolean; editing?: string | null; draft?: Draft | null; from?: 'home' | 'menu' | 'cart' }): void
  closeProduct(): void
  choice(g: string, id: string): void
  /** Upsell steps: toggle an option (within the step's min..max). */
  pick(g: string, id: string): void
  /** Upsell steps: change how often an option is taken. */
  pickQty(g: string, id: string, delta: number): void
  pickDrink(id: string): void
  vuMenu(): void
  xsKeep(id: string): void
  xsDrop(id: string): void
  exQty(id: string, delta: number): void
  vux(id: string): void
  r44ExToggle(): void
  vuMore(sec: 'enh' | 'xs'): void
  mod(kind: 'extra' | 'remove', g: string, id: string): void
  draftQty(delta: number): void
  openCustomize(): void
  confirmCustomize(): void
  backProduct(): void
  keepEdit(): void
  discardStep(): void
  discardEdit(): void
  fixXs(id: string): void
  fixMenu(): void
  /** Remove a sold-out upsell option from the draft (audit F06). */
  fixOption(g: string, id: string): void
  addOrder(): void

  // cart
  cartQty(lid: string, delta: number): void
  delLine(lid: string): void
  delAll(): void
  delMainOnly(): void
  delCancel(): void
  editLine(lid: string): void
  askCancel(): void
  keepOrder(): void
  confirmCancel(): void

  // sheets / confirms
  openSheet(): void
  openAlFilter(): void
  alToggle(id: string): void
  alClear(): void
  openPrice(): void
  closeSheet(): void
  voucher(): void
  setConfirm(c: Confirm): void
  setChecking(b: boolean): void
  /** The sold-out set changed outside the store (checkout refresh, live check): re-render lists. */
  availChanged(): void
  setScreen(s: Screen): void
  setCart(cart: CartLine[]): void

  // order tag
  tagOpen(): void
  tagKey(k: string): void
  tagSetDraft(v: string): void
  tagConfirm(tag: OrderTag | null): void
  tagBack(): void

  // idle / reset
  idleWarn(): void
  idleContinue(): void
  newOrderReset(): void
  hydrate(s: { cart: CartLine[]; service: Service | null; lang: Lang; screen: Screen; cat: string; tag: OrderTag | null }): void
  dismissReward(): void
}

let gtcTimer: ReturnType<typeof setTimeout> | null = null
const GTC_MS = 2200
const QLOCK: Record<string, number> = {}
const QUICK_LOCK_MS = 225

const INITIAL_CONN: ConnectionState = { kind: 'resolving', attempt: 0 }

/** First sidebar category: 'popular' in the brand pack, the first API subcategory otherwise. */
const firstCat = (): string => (hasEngine() && E().cats[0]?.id) || 'popular'

function resetFields() {
  return {
    screen: 'attract' as Screen,
    navDir: 'fwd' as const,
    cat: firstCat(),
    filter: 'all',
    cart: [] as CartLine[],
    pdpOpen: false,
    pdpStep: 'product' as const,
    pid: null,
    draft: null,
    editing: null,
    from: null,
    draft0: null,
    custom0: null,
    customRestore: null,
    sheet: null as Sheet,
    confirm: null as Confirm,
    allergenFilter: [] as string[],
    rewardDismissed: false,
    tag: null,
    tagDraft: '',
    tagFor: null,
    tagKb: 'lat' as const,
    heroIdx: 0,
    checking: false,
    availPending: null,
    gtcKey: null,
    servingSel: {} as Record<string, number>,
    note: null,
    toast: null,
    member: null,
    idleWarnAt: null,
    service: null as Service | null,
    homeScroll: 0,
    menuScroll: null,
  }
}

export const useEngine = create<EngineState>((set, get) => {
  /** Reward entitlement is recalculated after every cart change; a change produces a basket note. */
  const withReward = (cart: CartLine[]): CartLine[] => {
    const { cart: next, change } = syncReward(cart, get().rewardDismissed)
    if (change) set({ note: { text: noteText(change), at: Date.now() } })
    return next
  }
  const noteText = (n: RewardChange): string => {
    if (!n) return ''
    const b = E().brand
    if ('added' in n) return tfSafe('rw_added', { name: n.name })
    return tfSafe('rw_gone', { name: n.name, amt: String((b.reward?.threshold || 0) / 100) })
  }
  const tfSafe = (k: string, vars: Record<string, string>) => {
    try {
      return Object.entries(vars).reduce((a, [kk, v]) => a.replaceAll('{' + kk + '}', v), E().i18n[get().lang]?.[k] ?? E().i18n.en[k] ?? k)
    } catch {
      return k
    }
  }
  const tSafe = (k: string) => E().i18n[get().lang]?.[k] ?? E().i18n.en[k] ?? k
  const setCartV = (cart: CartLine[], extra: Partial<EngineState> = {}) => set((s) => ({ cart, cartVersion: s.cartVersion + 1, ...extra }))
  const servingSelOf = (pid: string) => {
    const p = mustId(pid)
    const sv = servingsOf(p)
    if (!sv) return -1
    const sel = get().servingSel[pid]
    return Number.isInteger(sel) ? Math.max(0, Math.min(sv.length - 1, sel)) : defServingIx(p)
  }
  const obToast = (text: string) => set({ toast: { text, at: Date.now() } })
  const addDraft = (d: Draft, p: Product): CartLine => {
    const r = addToCart(get().cart, d)
    let cart = r.cart
    for (const sel of d.crossSells || []) {
      const v = cmsById(sel.id)
      if (v) cart = addCrossSellLine(cart, v, r.line, sel)
    }
    setCartV(withReward(cart), { lastActivity: Date.now() })
    void p
    return r.line
  }
  const quickLocked = (key: string) => {
    const now = Date.now()
    if (QLOCK[key] && now - QLOCK[key] < QUICK_LOCK_MS) return true
    QLOCK[key] = now
    return false
  }
  const gtcArm = (pid: string) => {
    if (gtcTimer) clearTimeout(gtcTimer)
    gtcTimer = setTimeout(() => {
      if (get().gtcKey === pid) set({ gtcKey: null })
    }, GTC_MS)
  }
  const mutateDraft = (fn: (d: Draft) => void) => {
    const d = get().draft
    if (!d) return
    const next = JSON.parse(JSON.stringify(d)) as Draft
    fn(next)
    set({ draft: next, lastActivity: Date.now() })
  }
  /**
   * Run `then` once the product is known to be available. Without a gate (static simulation) or for a product
   * already verified this session it runs at once. One check at a time; a reply for an older guest session is
   * discarded (rule 14). Sold out → dialog, card disappears (the engine hides sold-out products, as the old kiosk
   * did); unknown → "could not check, try again" toast and nothing is added.
   */
  const guarded = (p: Product, then: () => void) => {
    if (!gate || verified.has(p.id)) {
      then()
      return
    }
    if (get().availPending) return
    const gen = get().sessionGen
    set({ availPending: p.id, lastActivity: Date.now() })
    void gate(p.id).then(
      (r) => {
        const s = get()
        if (s.sessionGen !== gen) return
        set({ availPending: null, availVersion: s.availVersion + 1 })
        if (r === 'ok') {
          verified.add(p.id)
          then()
        } else if (r === 'soldOut') set({ confirm: { type: 'soldOut', name: pname(p) }, gtcKey: null })
        else obToast(tSafe('availUnknown'))
      },
      () => {
        const s = get()
        if (s.sessionGen !== gen) return
        set({ availPending: null })
        obToast(tSafe('availUnknown'))
      },
    )
  }
  const openProductNow: EngineState['openProduct'] = (p, { menu = false, editing = null, draft = null, from } = {}) => {
    const s = get()
    const d = draft || newDraft(p, { menu })
    set({
      pid: p.id,
      from: from || (s.screen === 'home' ? 'home' : s.screen === 'cart' ? 'cart' : 'menu'),
      draft: d,
      editing,
      sheet: null,
      confirm: null,
      draft0: cfgKey(d) + '|' + d.qty + '|' + xsKey(d),
      pdpOpen: true,
      pdpStep: 'product',
      custom0: null,
      customRestore: null,
      lastActivity: Date.now(),
    })
  }
  const addOrderNow = (p: Product) => {
    const s = get()
    const d = s.draft
    if (!d || s.pid !== p.id) return
    const clean: Draft = { ...d }
    delete clean._more
    delete clean._xsAsk
    if (s.editing) {
      const next = applyEdit(s.cart, s.editing, clean)
      setCartV(withReward(next), { editing: null, draft: null, draft0: null })
      set({ from: 'cart' })
      get().closeProduct()
      return
    }
    addDraft(clean, p)
    get().closeProduct()
    set({ note: { text: tSafe('vuAdded'), at: Date.now() } })
  }

  return {
    ready: false,
    bootError: null,
    menuError: null,
    sessionGen: 0,
    config: null,
    lang: 'nl',
    cartVersion: 0,
    availVersion: 0,
    conn: INITIAL_CONN,
    staffOpen: false,
    lastActivity: Date.now(),
    ...resetFields(),

    setReady: (config, lang) => {
      engineSetLang(lang)
      verified.clear()
      set({ ready: true, config, lang, cat: firstCat() })
    },
    setBootError: (msg) => set({ bootError: msg }),
    setMenuError: (menuError) => set({ menuError }),
    setConn: (conn) => set({ conn }),
    setStaffOpen: (open) => set({ staffOpen: open }),
    setMember: (member) => set({ member }),
    touch: () => set({ lastActivity: Date.now() }),

    setLang: (lang) => {
      engineSetLang(lang)
      set({ lang, tagKb: lang === 'mk' ? 'cyr' : 'lat' })
    },
    startWith: (service) => set(homeHasContent() ? { service, screen: 'home', navDir: 'fwd', homeScroll: 0, lastActivity: Date.now() } : { service, screen: 'menu', cat: firstCat(), filter: 'all', navDir: 'fwd', lastActivity: Date.now() }),
    home: () => set(homeHasContent() ? { screen: 'home', navDir: 'fwd' } : { screen: 'menu', cat: firstCat(), filter: 'all', navDir: 'fwd' }),
    attract: () => set({ screen: 'attract', navDir: 'back', heroIdx: 0 }),
    otype: (service) => set({ service }),
    goCat: (cat) => set({ screen: 'menu', cat, filter: 'all', navDir: 'fwd' }),
    setFilter: (filter) => set({ filter }),
    viewOrder: () => set({ screen: 'cart', navDir: 'fwd', pdpOpen: false }),
    backMenu: () => set({ screen: 'menu', navDir: 'back' }),
    saveScroll: (top) => {
      const s = get()
      if (s.screen === 'home') set({ homeScroll: top })
      else if (s.screen === 'menu') set({ menuScroll: { cat: s.cat, top } })
    },

    // ---------- cards ----------
    quickAdd: (pid) => {
      const p = byId(pid)
      if (!p || obBlocked(p)) return
      if (obNeedsDetail(p)) {
        get().openProduct(p)
        return
      }
      if (quickLocked(pid)) return
      guarded(p, () => {
        const d = newDraft(p)
        if (servingsOf(p)) d.serving = servingSelOf(pid)
        addDraft(d, p)
        get().gtcExpand(pid)
        obToast(tfSafe('obAdded', { name: pname(p) }))
      })
    },
    cardInc: (pid, wide) => {
      const p = byId(pid)
      if (!p || obBlocked(p)) return
      gtcArm(pid)
      const l = obLine(get().cart, p, wide, servingSelOf(pid))
      if (l) {
        if (l.qty >= lineMax(p)) return
        setCartV(withReward(setLineQty(get().cart, l.lid, l.qty + 1)))
        return
      }
      if (wide && obVarCard(p)) {
        get().obVar(pid, servingSelOf(pid))
        return
      }
      if (obNeedsDetail(p)) {
        set({ gtcKey: null })
        get().openProduct(p)
        return
      }
      get().quickAdd(pid)
    },
    cardDec: (pid, wide) => {
      const p = byId(pid)
      if (!p) return
      gtcArm(pid)
      const l = obLine(get().cart, p, wide, servingSelOf(pid))
      if (!l) return
      if (l.qty > 1) {
        setCartV(withReward(setLineQty(get().cart, l.lid, l.qty - 1)))
        return
      }
      if (obQty(get().cart, p, wide, servingSelOf(pid)) <= l.qty) set({ gtcKey: null })
      get().delLine(l.lid)
    },
    obVar: (pid, ix) => {
      const p = byId(pid)
      if (!p || obBlocked(p) || !obVarCard(p)) return
      const sv = obSizes(p)!
      if (!(ix >= 0 && ix < sv.length)) return
      if (quickLocked(pid + ':' + ix)) return
      set((s) => ({ servingSel: { ...s.servingSel, [pid]: ix } }))
      guarded(p, () => {
        const d = newDraft(p)
        d.serving = ix
        addDraft(d, p)
        get().gtcExpand(pid)
        obToast(tfSafe('obAdded', { name: `${pname(p)} (${L(sv[ix].short)})` }))
      })
    },
    specialPick: (pid, id) => {
      const p = byId(pid)
      const g = specialGroup(p)
      if (!p || !g || obBlocked(p) || p.infoOnly) return
      const it = E().mods[g].items.find((x) => x.id === id)
      if (!it) return
      if (quickLocked(pid + ':' + g + ':' + id)) return
      const d = newDraft(p)
      d.choices[g] = id
      // More option groups or upsell → the product page with this option already chosen; otherwise straight to the basket.
      if (specialHasMore(p)) {
        guarded(p, () => openProductNow(p, { draft: d }))
        return
      }
      if (!draftValid(d)) return
      guarded(p, () => {
        addDraft(d, p)
        obToast(tfSafe('obAdded', { name: `${pname(p)} (${L(it.name)})` }))
      })
    },
    pickServing: (pid, ix, ctx) => {
      const p = byId(pid)
      if (!p || !servingsOf(p)) return
      if (ctx === 'pdp') {
        mutateDraft((d) => {
          d.serving = ix
        })
        return
      }
      set((s) => ({ servingSel: { ...s.servingSel, [pid]: ix }, gtcKey: s.gtcKey === pid ? null : s.gtcKey }))
    },
    gtcExpand: (pid) => {
      set({ gtcKey: pid })
      gtcArm(pid)
    },
    gtcCollapse: () => {
      if (gtcTimer) clearTimeout(gtcTimer)
      set({ gtcKey: null })
    },

    // ---------- product page ----------
    openProduct: (p, opts = {}) => {
      // Opening from a card asks the live check first (old kiosk: info / detail open); editing a cart line does not.
      if (opts.editing || opts.draft) openProductNow(p, opts)
      else guarded(p, () => openProductNow(p, opts))
    },
    closeProduct: () => {
      const s = get()
      set({ draft: null, editing: null, sheet: null, confirm: null, draft0: null, pdpOpen: false, pdpStep: 'product', screen: s.from === 'cart' ? 'cart' : s.from === 'home' ? 'home' : 'menu' })
    },
    choice: (g, id) =>
      mutateDraft((d) => {
        d.choices[g] = id
      }),
    pick: (g, id) =>
      mutateDraft((d) => {
        grpSet(d, g, id, exQty(d, g, id) > 0 ? 0 : 1)
      }),
    pickQty: (g, id, delta) =>
      mutateDraft((d) => {
        grpSet(d, g, id, exQty(d, g, id) + delta)
      }),
    pickDrink: (id) =>
      mutateDraft((d) => {
        d.drink = id
      }),
    vuMenu: () =>
      mutateDraft((d) => {
        d.menu = !d.menu
        d._xsAsk = null
        if (!d.menu) (d.crossSells || []).forEach((x) => (x.extraPortion = false))
        if (d.menu) {
          const c = (E().upsell.menuUpgrade.conflictsWithCrossSells || []).find((cid) => xsSelected(d, cid) && !xsPortion(d, cid))
          if (c) d._xsAsk = c
        }
      }),
    xsKeep: (id) =>
      mutateDraft((d) => {
        xsSet(d, id, { extraPortion: true })
        d._xsAsk = null
      }),
    xsDrop: (id) =>
      mutateDraft((d) => {
        xsRemove(d, id)
        d._xsAsk = null
      }),
    exQty: (id, delta) =>
      mutateDraft((d) => {
        const v = cmsById(id)
        if (!v) return
        const g = E().roleGroup[v.role]
        if (!g) return
        exSet(d, g, v.id, exQty(d, g, v.id) + delta)
      }),
    vux: (id) =>
      mutateDraft((d) => {
        const v = cmsById(id)
        if (!v) return
        if (v.role === 'cross-sell') {
          if (xsSelected(d, id)) xsRemove(d, id)
          else xsSet(d, id, { quantity: 1, extraPortion: xsConflicts(v, d) })
          return
        }
        const g = E().roleGroup[v.role]
        if (!g) return
        exSet(d, g, id, exQty(d, g, id) > 0 ? 0 : 1)
      }),
    r44ExToggle: () =>
      mutateDraft((d) => {
        d._more = d._more || {}
        d._more.enhOpen = !d._more.enhOpen
      }),
    vuMore: (sec) =>
      mutateDraft((d) => {
        d._more = d._more || {}
        d._more[sec] = !d._more[sec]
      }),
    mod: (kind, g, id) =>
      mutateDraft((d) => {
        const arr = kind === 'extra' ? d.extras : d.removes
        const i = arr.findIndex(([gg, ii]) => gg === g && ii === id)
        if (i >= 0) arr.splice(i, 1)
        else arr.push([g, id])
      }),
    draftQty: (delta) =>
      mutateDraft((d) => {
        d.qty = clampQty(d.qty + delta, lineMax(byId(d.pid)))
      }),
    openCustomize: () => {
      const d = get().draft
      if (!d) return
      set({ pdpStep: 'customize', custom0: stepKey(d), customRestore: JSON.parse(JSON.stringify([d.extras, d.removes])) })
    },
    confirmCustomize: () => set({ pdpStep: 'product', custom0: null, customRestore: null }),
    backProduct: () => {
      const s = get()
      if (s.pdpStep === 'customize') {
        if (s.custom0 && s.draft && stepKey(s.draft) !== s.custom0) {
          set({ confirm: 'discardStep' })
          return
        }
        set({ pdpStep: 'product', custom0: null, customRestore: null })
        return
      }
      if (s.draft && s.draft0 && cfgKey(s.draft) + '|' + s.draft.qty + '|' + xsKey(s.draft) !== s.draft0) {
        set({ confirm: 'discard' })
        return
      }
      get().closeProduct()
    },
    keepEdit: () => set({ confirm: null }),
    discardStep: () => {
      const s = get()
      const [e, r] = s.customRestore || [[], []]
      mutateDraft((d) => {
        d.extras = JSON.parse(JSON.stringify(e))
        d.removes = JSON.parse(JSON.stringify(r))
      })
      set({ confirm: null, pdpStep: 'product', custom0: null, customRestore: null })
    },
    discardEdit: () => {
      set({ confirm: null })
      get().closeProduct()
    },
    fixOption: (g, id) =>
      mutateDraft((d) => {
        grpSet(d, g, id, 0)
      }),
    fixXs: (id) =>
      mutateDraft((d) => {
        xsRemove(d, id)
      }),
    fixMenu: () =>
      mutateDraft((d) => {
        d.menu = false
      }),
    addOrder: () => {
      const s = get()
      const d = s.draft
      if (!d || !s.pid) return
      if (!draftValid(d)) return
      if (validateDraft(d).some((i) => i.code.startsWith('unavailable'))) return
      const p = mustId(s.pid)
      if (p.infoOnly) return
      // Detail-page add runs the live check too (old kiosk MealInfo add); a product opened through a card is already verified.
      if (!s.editing) {
        guarded(p, () => addOrderNow(p))
        return
      }
      addOrderNow(p)
    },

    // ---------- cart ----------
    cartQty: (lid, delta) => {
      const l = line(get().cart, lid)
      if (!l || l.reward) return
      const next = l.qty + delta
      if (next <= 0) {
        get().delLine(lid)
        return
      }
      if (next > lineMax(byId(l.pid))) return
      setCartV(withReward(setLineQty(get().cart, lid, next)))
    },
    delLine: (lid) => {
      const s = get()
      const l = line(s.cart, lid)
      if (!l) return
      if (l.reward) {
        setCartV(
          s.cart.filter((x) => x !== l),
          { rewardDismissed: true },
        )
        return
      }
      if (l.lineType === 'product' && hasLinked(s.cart, lid)) {
        set({ confirm: { type: 'delLinked', lid } })
        return
      }
      setCartV(withReward(removeLine(s.cart, lid)))
    },
    delAll: () => {
      const c = get().confirm
      const lid = c && typeof c === 'object' && c.type === 'delLinked' ? c.lid : null
      set({ confirm: null })
      if (lid) setCartV(withReward(removeLine(get().cart, lid, { withLinked: true })))
    },
    delMainOnly: () => {
      const c = get().confirm
      const lid = c && typeof c === 'object' && c.type === 'delLinked' ? c.lid : null
      set({ confirm: null })
      if (lid) setCartV(withReward(removeLine(get().cart, lid, { unlink: true })))
    },
    delCancel: () => set({ confirm: null }),
    editLine: (lid) => {
      const s = get()
      const l = line(s.cart, lid)
      if (!l || l.reward) return
      const draft: Draft = {
        pid: l.pid,
        qty: l.qty,
        menu: l.menu,
        drink: l.drink,
        reward: !!l.reward,
        serving: l.serving,
        choices: { ...l.choices },
        extras: l.extras.map((x) => [...x] as [string, string]),
        removes: l.removes.map((x) => [...x] as [string, string]),
        extraQty: { ...(l.extraQty || {}) },
        crossSells: xsLinesOf(s.cart, lid).map((x) => ({ id: x.xsId!, quantity: x.qty, extraPortion: !!x.extraPortion })),
      }
      get().openProduct(mustId(l.pid), { editing: lid, draft, from: 'cart' })
    },
    askCancel: () => set({ confirm: 'cancel' }),
    keepOrder: () => set({ confirm: null }),
    confirmCancel: () => {
      set({ confirm: null })
      get().newOrderReset()
    },

    // ---------- sheets ----------
    openSheet: () => {
      const pid = get().pid
      if (pid) set({ sheet: { allergens: pid } })
    },
    openAlFilter: () => set({ sheet: 'alfilter' }),
    alToggle: (id) => {
      const f = new Set(get().allergenFilter)
      if (f.has(id)) f.delete(id)
      else f.add(id)
      setAllergenFilter(f)
      set({ allergenFilter: [...f] })
    },
    alClear: () => {
      setAllergenFilter(new Set())
      set({ allergenFilter: [] })
    },
    openPrice: () => set({ sheet: 'price' }),
    closeSheet: () => set({ sheet: null }),
    voucher: () => set({ sheet: 'voucher' }),
    setConfirm: (confirm) => set({ confirm }),
    setChecking: (checking) => set({ checking }),
    availChanged: () => set((s) => ({ availVersion: s.availVersion + 1 })),
    setScreen: (screen) => set({ screen }),
    setCart: (cart) => setCartV(cart),

    // ---------- order tag ----------
    tagOpen: () => {
      const s = get()
      set({ tagDraft: s.tag?.value ?? (s.tagDraft || ''), tagKb: s.lang === 'mk' ? 'cyr' : 'lat', screen: 'tag', navDir: 'fwd' })
    },
    tagKey: (k) => {
      const s = get()
      if (k === 'clr') set({ tagDraft: '' })
      else if (k === 'del') set({ tagDraft: s.tagDraft.slice(0, -1) })
      else if (k === 'kb') set({ tagKb: s.tagKb === 'cyr' ? 'lat' : 'cyr' })
      else if (k === 'sp') set({ tagDraft: s.tagDraft + ' ' })
      else set({ tagDraft: s.tagDraft + k })
      set({ lastActivity: Date.now() })
    },
    tagSetDraft: (v) => set({ tagDraft: v }),
    tagConfirm: (tag) => set({ tag }),
    tagBack: () => set({ screen: 'cart', navDir: 'back' }),

    // ---------- idle / reset ----------
    idleWarn: () => set({ idleWarnAt: Date.now(), confirm: 'idle' }),
    idleContinue: () => set({ idleWarnAt: null, confirm: null, lastActivity: Date.now() }),
    newOrderReset: () => {
      if (gtcTimer) clearTimeout(gtcTimer)
      setAllergenFilter(new Set())
      verified.clear()
      const s = get()
      set({ ...resetFields(), lang: s.config?.defaultLang ?? s.lang, cartVersion: s.cartVersion + 1, sessionGen: s.sessionGen + 1, lastActivity: Date.now() })
      engineSetLang(s.config?.defaultLang ?? s.lang)
    },
    hydrate: (h) => {
      bumpIds(h.cart)
      // The menu may have changed since the session was saved: keep only a category and language it still has.
      const d = E()
      const cat = ['new', 'rewards'].includes(h.cat) || d.cats.some((c) => c.id === h.cat) ? h.cat : firstCat()
      const lang = d.brand.languages.includes(h.lang) ? h.lang : d.brand.defaultLanguage
      engineSetLang(lang)
      set((s) => ({ cart: h.cart, service: h.service, lang, screen: h.screen, cat, tag: h.tag, cartVersion: s.cartVersion + 1 }))
    },
    dismissReward: () => set({ rewardDismissed: true }),
  }
})

/** Products in the order (for experienceFor), excluding the line being edited's own group. */
export function orderedPidsFor(state: Pick<EngineState, 'cart' | 'editing'>): Set<string> {
  const own = state.editing ? state.cart.find((l) => l.lid === state.editing) : null
  return new Set(state.cart.filter((l) => !l.reward && (!own || l.groupId !== own.groupId)).map((l) => l.pid))
}

export function selectedXsFor(d: Draft | null): Set<string> {
  return new Set((d?.crossSells || []).map((x) => x.id))
}

export function draftExperience(state: Pick<EngineState, 'cart' | 'editing' | 'draft' | 'pid'>) {
  const p = mustId(state.pid!)
  return experienceFor(p, orderedPidsFor(state), selectedXsFor(state.draft))
}

export function draftUnavailable(d: Draft): boolean {
  return checkProducts([d.pid]).length > 0 || unavailParts(d).length > 0
}

export { xsSel }
