import { create } from 'zustand'
import { sameConfig } from '../domain/cart'
import type { ConnectionState } from '../domain/connectivity'
import type { PriceChange } from '../domain/cart'
import type { CartLine, Catalog, Cms, GuestitConfig, Lang, LoyaltyMember, OrderTag, ServiceMode } from '../domain/types'

export type Screen = 'attract' | 'service' | 'menu' | 'cart' | 'upsell' | 'tag' | 'payment'

export type Preflight =
  | { step: 'idle' }
  | { step: 'checking' }
  | { step: 'price-confirm'; changes: PriceChange[] }
  | { step: 'error'; key: string }

export interface KioskState {
  booted: boolean
  bootError: string | null
  config: GuestitConfig | null
  catalog: Catalog | null
  cms: Cms | null
  lang: Lang
  service: ServiceMode | null
  screen: Screen
  activeCategoryId: string | null
  cart: CartLine[]
  /** Bumps on every cart mutation; checkout aborts if it changed during the checks. */
  cartVersion: number
  tag: OrderTag | null
  member: LoyaltyMember | null
  unavailableIds: string[]
  conn: ConnectionState
  staffOpen: boolean
  preflight: Preflight
  clientErrors: string[]

  setBooted(payload: { config: GuestitConfig; catalog: Catalog; cms: Cms; lang: Lang }): void
  setBootError(msg: string): void
  setLang(lang: Lang): void
  setService(service: ServiceMode): void
  setScreen(screen: Screen): void
  setCategory(id: string | null): void
  setCatalog(catalog: Catalog): void
  addLine(line: CartLine): void
  replaceLine(lineId: string, line: CartLine): void
  setQty(lineId: string, qty: number): void
  removeLine(lineId: string): void
  setCart(cart: CartLine[]): void
  clearCart(): void
  setTag(tag: OrderTag | null): void
  setMember(member: LoyaltyMember | null): void
  setUnavailable(ids: string[]): void
  setConn(conn: ConnectionState): void
  setStaffOpen(open: boolean): void
  setPreflight(p: Preflight): void
  addClientError(msg: string): void
  /** New guest: clears everything session-related and returns to the attract screen. */
  resetSession(): void
  /** Restore an unpaid session after a short interruption. */
  hydrateSession(s: { cart: CartLine[]; service: ServiceMode | null; lang: Lang; tag: OrderTag | null; member: LoyaltyMember | null; screen: Screen }): void
}

const INITIAL_CONN: ConnectionState = { kind: 'resolving', attempt: 0 }

export const useKiosk = create<KioskState>((set, get) => ({
  booted: false,
  bootError: null,
  config: null,
  catalog: null,
  cms: null,
  lang: 'nl',
  service: null,
  screen: 'attract',
  activeCategoryId: null,
  cart: [],
  cartVersion: 0,
  tag: null,
  member: null,
  unavailableIds: [],
  conn: INITIAL_CONN,
  staffOpen: false,
  preflight: { step: 'idle' },
  clientErrors: [],

  setBooted: ({ config, catalog, cms, lang }) =>
    set({ booted: true, bootError: null, config, catalog, cms, lang, activeCategoryId: catalog.categories[0]?.id ?? null }),
  setBootError: (msg) => set({ bootError: msg }),
  setLang: (lang) => set({ lang }),
  setService: (service) => set({ service }),
  setScreen: (screen) => set({ screen }),
  setCategory: (id) => set({ activeCategoryId: id }),
  setCatalog: (catalog) => set({ catalog }),

  addLine: (line) => {
    const { cart } = get()
    const existing = cart.find((l) => sameConfig(l, line))
    if (existing) {
      set({ cart: cart.map((l) => (l === existing ? { ...l, qty: l.qty + line.qty } : l)), cartVersion: get().cartVersion + 1 })
    } else {
      set({ cart: [...cart, line], cartVersion: get().cartVersion + 1 })
    }
  },
  replaceLine: (lineId, line) =>
    set((s) => ({ cart: s.cart.map((l) => (l.lineId === lineId ? { ...line, lineId } : l)), cartVersion: s.cartVersion + 1 })),
  setQty: (lineId, qty) =>
    set((s) => {
      if (qty <= 0) {
        // Remove the line and any upsell lines bound to it.
        return { cart: s.cart.filter((l) => l.lineId !== lineId && l.sourceLineId !== lineId), cartVersion: s.cartVersion + 1 }
      }
      return {
        cart: s.cart.map((l) => (l.lineId === lineId ? { ...l, qty } : l.sourceLineId === lineId && l.kind === 'menu-upgrade' ? { ...l, qty } : l)),
        cartVersion: s.cartVersion + 1,
      }
    }),
  removeLine: (lineId) => get().setQty(lineId, 0),
  setCart: (cart) => set((s) => ({ cart, cartVersion: s.cartVersion + 1 })),
  clearCart: () => set((s) => ({ cart: [], cartVersion: s.cartVersion + 1 })),
  setTag: (tag) => set({ tag }),
  setMember: (member) => set({ member }),
  setUnavailable: (ids) => set({ unavailableIds: ids }),
  setConn: (conn) => set({ conn }),
  setStaffOpen: (open) => set({ staffOpen: open }),
  setPreflight: (p) => set({ preflight: p }),
  addClientError: (msg) => set((s) => ({ clientErrors: [...s.clientErrors.slice(-19), msg] })),

  resetSession: () =>
    set((s) => ({
      cart: [],
      cartVersion: s.cartVersion + 1,
      service: null,
      tag: null,
      member: null,
      screen: 'attract',
      activeCategoryId: s.catalog?.categories[0]?.id ?? null,
      preflight: { step: 'idle' },
      lang: s.config?.defaultLang ?? s.lang,
    })),
  hydrateSession: (h) =>
    set((s) => ({ cart: h.cart, service: h.service, lang: h.lang, tag: h.tag, member: h.member, screen: h.screen, cartVersion: s.cartVersion + 1 })),
}))
