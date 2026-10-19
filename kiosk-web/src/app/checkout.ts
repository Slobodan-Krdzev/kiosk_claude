// Checkout: cart → (order tag) → availability + price revalidation → terminal. Port of ACT.toPay / priceConfirm.
// The payment itself is our PaymentController (persist before pay, one attempt id per charge, same key on retry).

import { withTimeout } from '../adapters/withTimeout'
import { canSubmitWrites, type ConnectionState } from '../domain/connectivity'
import type { OrderSnapshot, SnapshotLine } from '../domain/types'
import { applyRevalidatedPrices, lineUnit, priceStamp, revalidatePrices, validateCart } from '../engine/cart'
import { byId, modItem, mustId, servingOf, servingsOf } from '../engine/catalog'
import { cmsById } from '../engine/cms'
import { exQty, includedPids } from '../engine/draft'
import { E, L, patchUnavailable, setDisabled } from '../engine/state'
import type { CartLine, Product } from '../engine/types'
import { PAY_ACTIVE, PAY_UNCERTAIN } from '../payment/states'
import { useEngine } from '../store/engine'
import { tagModeFor, type TagState } from './tag'
import { getRuntime } from './runtime'

let paying = false
/** Version of the last successful catalog refresh; frozen into every snapshot (pricedWith). */
let catalogVersion = 0

/** Identity of the writable authority the device believes in; a change during preflight invalidates the preflight. */
const connKey = (c: ConnectionState): string => (c.kind === 'connected' ? `${c.role}:${c.nodeId}:${c.epoch}` : c.kind)

/** Every product the cart depends on: lines, picked upsell options, menu parts and cross-sells. */
export function cartPids(cart: CartLine[]): string[] {
  const ids = new Set<string>()
  for (const l of cart) {
    if (l.reward) continue
    if (l.lineType === 'cross-sell') {
      const pid = (l.xsId && cmsById(l.xsId)?.pid) || l.pid
      if (pid) ids.add(pid)
      continue
    }
    includedPids(l).forEach((id) => ids.add(id))
  }
  return [...ids]
}

/**
 * Live catalog sync (availability + current prices). Never touches a started or paid snapshot.
 * Checks the products the cart depends on (the kiosk API answers one product per request, kiosk-product-checks.md
 * §2); `ids` widens that, e.g. the whole menu on the static simulation. A product whose availability is UNKNOWN
 * makes the refresh fail: the kiosk never charges on an unverified cart.
 */
export async function catalogRefresh(ids?: string[]): Promise<boolean> {
  const rt = getRuntime()
  const { adapters } = rt.resolved
  const cfg = rt.config
  try {
    const want = ids ?? cartPids(useEngine.getState().cart)
    const na = await withTimeout(adapters.availability.check(want), cfg.timeouts.availability, 'availability')
    patchUnavailable(want, na.unavailableIds)
    useEngine.getState().availChanged()
    if (na.unknownIds?.length) {
      rt.log('availability.unknown', { ids: na.unknownIds })
      return false
    }
    const cur = await withTimeout(adapters.catalog.current(), cfg.timeouts.availability, 'catalog')
    for (const [pid, cents] of Object.entries(cur.prices || {})) {
      const p = byId(pid)
      if (!p || typeof cents !== 'number' || cents === p.price) continue
      const delta = cents - p.price
      p.price = cents
      servingsOf(p)?.forEach((s) => (s.price += delta))
    }
    // Price variants (premium menu drinks, cross-sell prices) are pricing inputs too (audit F11).
    for (const [id, cents] of Object.entries(cur.variants || {})) {
      const pv = E().priceVariants[id]
      if (pv && typeof cents === 'number') pv.price = cents
    }
    setDisabled(cur.disabled || [])
    if (typeof cur.version === 'number') catalogVersion = cur.version
    return true
  } catch (e) {
    rt.log('catalog.refreshFailed', { error: String(e) })
    return false
  }
}

function tagNeeded(): boolean {
  const s = useEngine.getState()
  return tagModeFor(s.config!.orderTag, s.service) !== 'none'
}

const cartSig = (cart: CartLine[]) => JSON.stringify(cart.map((l) => [l.lid, l.qty, l.unitPrice]))

/**
 * The ONE preflight before any charge (first attempt and every "try again"): writable authority, cart valid,
 * order tag, fresh availability + prices, authority unchanged after the awaits, then startPay().
 * Audit F02/F03 (2026-10-16).
 */
export async function toPay(): Promise<void> {
  const s = useEngine.getState()
  const rt = getRuntime()
  // Every early return is logged (2026-10-19): a tap that "does nothing" must leave a trace in the staff log.
  if (!canSubmitWrites(s.conn)) {
    rt.log('checkout.skip', { reason: 'no-authority', conn: s.conn.kind })
    return
  }
  const st = rt.controller.state.status
  if (PAY_ACTIVE.has(st) || PAY_UNCERTAIN.has(st) || paying) {
    rt.log('checkout.skip', { reason: 'payment-state', status: st, paying })
    return
  }
  const issues = validateCart(s.cart).filter((i) => i.code !== 'price-changed')
  if (issues.length) {
    rt.log('checkout.skip', { reason: 'cart-invalid', issues: issues.map((i) => i.code) })
    return
  }
  if (s.screen === 'cart' && tagNeeded()) {
    s.tagOpen()
    return
  }
  paying = true
  const sig = cartSig(s.cart)
  const auth = connKey(s.conn)
  try {
    s.setChecking(true)
    const ok = await catalogRefresh()
    const s2 = useEngine.getState()
    s2.setChecking(false)
    if (sig !== cartSig(s2.cart)) {
      rt.log('checkout.skip', { reason: 'cart-changed-during-check' })
      return
    }
    if (connKey(s2.conn) !== auth) {
      // The authority changed while we were checking: the answers came from the old writer. Re-resolve, never proceed.
      rt.log('checkout.authorityChanged', { from: auth, to: connKey(s2.conn) })
      s2.setConfirm('authChanged')
      return
    }
    if (!ok) {
      s2.setConfirm('availFail')
      return
    }
    const issues2 = validateCart(s2.cart).filter((i) => i.code !== 'price-changed')
    if (issues2.length) {
      rt.log('checkout.skip', { reason: 'cart-invalid-after-check', issues: issues2.map((i) => i.code) })
      return
    }
    const changes = revalidatePrices(s2.cart)
    if (changes.length) {
      s2.setConfirm({ type: 'priceChanged', changes, shown: priceStamp(changes) })
      return
    }
    await startPay()
  } finally {
    paying = false
    useEngine.getState().setChecking(false)
  }
}

export async function availRetry(): Promise<void> {
  useEngine.getState().setConfirm(null)
  await toPay()
}

/** "Try again" after declined / cancelled / terminal-offline: the same preflight as the first attempt. */
export async function retryPay(): Promise<void> {
  await toPay()
}
export function availBack(): void {
  useEngine.getState().setConfirm(null)
}

export async function priceConfirm(): Promise<void> {
  const s = useEngine.getState()
  const conf = s.confirm
  if (!conf || typeof conf !== 'object' || conf.type !== 'priceChanged') return
  const now = revalidatePrices(s.cart)
  if (priceStamp(now) !== conf.shown) {
    s.setConfirm(now.length ? { type: 'priceChanged', changes: now, shown: priceStamp(now), again: true } : null)
    if (!now.length) await toPay()
    return
  }
  if (!canSubmitWrites(s.conn)) {
    getRuntime().log('checkout.authorityLost', { at: 'priceConfirm' })
    s.setConfirm('authChanged')
    return
  }
  s.setCart(applyRevalidatedPrices(s.cart))
  s.setConfirm(null)
  await startPay()
}
export function priceBack(): void {
  useEngine.getState().setConfirm(null)
}

export async function tagGo(st: TagState): Promise<void> {
  const s = useEngine.getState()
  if (!st.ok) return
  s.tagConfirm({ type: st.type, value: st.v })
  await toPay()
}
export async function tagSkip(): Promise<void> {
  const s = useEngine.getState()
  s.tagConfirm(null)
  await toPay()
}

/** Freeze the order and hand it to the payment controller. */
export async function startPay(): Promise<void> {
  const s = useEngine.getState()
  const rt = getRuntime()
  if (!rt.controller.canRetryPayment()) {
    rt.log('checkout.skip', { reason: 'controller-busy', status: rt.controller.state.status, hasSnapshot: !!rt.controller.state.snapshot })
    return
  }
  if (!s.cart.length) {
    rt.log('checkout.skip', { reason: 'empty-cart' })
    return
  }
  // Charge boundary: the authority is checked again right here, after every await of the preflight.
  if (!canSubmitWrites(s.conn)) {
    rt.log('pay.refusedNoAuthority', { conn: s.conn.kind })
    return
  }
  s.setScreen('pay')
  const snapshot = buildSnapshot(s.cart, s.service === 'eatin' ? 'eat-in' : 'takeaway', s.lang, s.tag, s.member?.id ?? null)
  const started = await rt.controller.start(snapshot)
  if (!started && rt.controller.state.storeFailed) rt.log('pay.storeFail')
}

export function buildSnapshot(cart: CartLine[], service: 'eat-in' | 'takeaway', lang: OrderSnapshot['lang'], tag: OrderSnapshot['tag'], memberId: string | null): Omit<OrderSnapshot, 'orderId' | 'startedAt' | 'paidAt'> {
  const lines: SnapshotLine[] = cart.map((l) => {
    const p: Product = mustId(l.pid)
    const sv = servingOf(p, l)
    const unit = lineUnit(l)
    const kind: SnapshotLine['kind'] = l.reward ? 'gift' : l.lineType === 'cross-sell' ? 'cross-sell' : 'item'
    return {
      lineId: l.lid,
      productId: l.pid,
      productName: p.name,
      servingId: sv ? String(servingsOf(p)!.indexOf(sv)) : '',
      servingName: sv ? L(sv.short) : '',
      choices: Object.entries(l.choices || {})
        .filter(([, v]) => !!v)
        .map(([groupId, v]) => ({ groupId, optionIds: [v as string] })),
      extras: (l.extras || []).map(([g, id]) => {
        const it = modItem(g, id)
        return { extraId: `${g}:${id}`, qty: exQty(l, g, id), ...(it.pid ? { productId: it.pid } : {}), name: typeof it.name === 'string' ? it.name : it.name.en, priceCents: it.price }
      }),
      removes: (l.removes || []).map(([g, id]) => `${g}:${id}`),
      qty: l.qty,
      unitPriceCents: unit,
      lineTotalCents: unit * l.qty,
      basePriceCents: l.reward ? 0 : sv ? sv.price : p.price,
      ...(p.apiImg ? { image: p.apiImg } : {}),
      ...(p.plu ? { plu: p.plu } : {}),
      kind,
      ...(l.priceVariantId ? { priceVariantId: l.priceVariantId } : {}),
      ...(l.groupId ? { groupId: l.groupId } : {}),
      ...(l.sourceLineId ? { sourceLineId: l.sourceLineId } : {}),
      ...(l.menu && l.drink ? { menuDrink: { productId: l.drink, servingId: '', choices: {} }, menuSideId: E().menuDeal.side } : {}),
    }
  })
  const subtotal = lines.reduce((a, x) => a + x.lineTotalCents, 0)
  return {
    lines,
    service,
    lang,
    tag,
    totals: { subtotalCents: subtotal, discountCents: 0, totalCents: subtotal, count: cart.reduce((a, l) => a + l.qty, 0) },
    loyalty: memberId ? { memberId } : null,
    pricedWith: { catalogVersion },
  }
}
