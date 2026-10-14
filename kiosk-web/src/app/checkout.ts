// Checkout flow: cart → upsell → order tag → preflight checks → payment.
// Preflight (v36 ACT.toPay): online, availability fresh, no price change, no active/uncertain attempt,
// cart unchanged during the checks. Only then is the snapshot frozen and the terminal started.

import { withTimeout } from '../adapters/withTimeout'
import { applyPriceChanges, buildSnapshot, detectPriceChanges } from '../domain/cart'
import { canSubmitWrites } from '../domain/connectivity'
import { resolveTagMode } from '../domain/orderTag'
import { computeOffers } from '../domain/upsell'
import { useKiosk } from '../store/kiosk'
import { getRuntime } from './runtime'

/** From the cart: go to upsell if there are offers, else to the tag step. */
export function beginCheckout(): void {
  const s = useKiosk.getState()
  if (!s.catalog || !s.cms || s.cart.length === 0) return
  getRuntime().resolved.adapters.analytics.send([{ type: 'checkout_started', at: new Date().toISOString(), data: { count: s.cart.length } }])
  const offers = computeOffers(s.cart, s.catalog, s.cms)
  if (offers.length) {
    s.setScreen('upsell')
  } else {
    afterUpsell()
  }
}

/** After upsell: ask for the order tag when the venue requires one, else start payment. */
export function afterUpsell(): void {
  const s = useKiosk.getState()
  if (!s.config || !s.service) return
  const { mode, clientError } = resolveTagMode(s.config.orderTag, s.service)
  if (clientError) s.addClientError(clientError)
  if (mode === 'none') {
    s.setTag(null)
    void startPayment()
  } else {
    s.setScreen('tag')
  }
}

/** Preflight checks, then hand the frozen snapshot to the payment controller. */
export async function startPayment(): Promise<void> {
  const rt = getRuntime()
  const { adapters } = rt.resolved
  const s = useKiosk.getState()
  if (!s.catalog || !s.config || !s.service || s.cart.length === 0) return
  if (!rt.controller.canRetryPayment()) return
  if (!canSubmitWrites(s.conn)) {
    s.setPreflight({ step: 'error', key: s.conn.kind === 'no-authority' ? 'conn.noAuthority' : 'conn.waitSubmit' })
    s.setScreen('payment')
    return
  }
  const versionAtStart = s.cartVersion
  s.setPreflight({ step: 'checking' })
  s.setScreen('payment')

  try {
    const health = await withTimeout(adapters.pos.health(), s.config.timeouts.health, 'health')
    if (!health.ok) {
      s.setPreflight({ step: 'error', key: 'cart.offline' })
      return
    }
    const productIds = Array.from(new Set(s.cart.map((l) => l.productId)))
    const avail = await withTimeout(adapters.availability.check(productIds), s.config.timeouts.availability, 'availability')
    if (avail.unavailableIds.length) {
      s.setUnavailable(avail.unavailableIds)
      s.setPreflight({ step: 'error', key: 'cart.unavailableInCart' })
      return
    }
    const current = await withTimeout(adapters.catalog.current(), s.config.timeouts.availability, 'catalogCurrent')
    const disabledInCart = s.cart.filter((l) => current.disabled.includes(l.productId)).map((l) => l.productId)
    if (disabledInCart.length) {
      s.setUnavailable(Array.from(new Set([...s.unavailableIds, ...disabledInCart])))
      s.setPreflight({ step: 'error', key: 'cart.unavailableInCart' })
      return
    }
    const changes = detectPriceChanges(s.cart, s.catalog, current)
    if (useKiosk.getState().cartVersion !== versionAtStart) {
      // The guest kept editing during the checks: back to the cart, they tap pay again.
      s.setPreflight({ step: 'idle' })
      s.setScreen('cart')
      return
    }
    if (changes.length) {
      s.setPreflight({ step: 'price-confirm', changes })
      return
    }
    await freezeAndPay()
  } catch (e) {
    rt.log('checkout.preflightFailed', { error: String(e) })
    s.setPreflight({ step: 'error', key: 'cart.checkFailed' })
  }
}

/** Guest accepted the new prices. */
export async function acceptPriceChanges(): Promise<void> {
  const s = useKiosk.getState()
  if (s.preflight.step !== 'price-confirm' || !s.catalog) return
  s.setCatalog(applyPriceChanges(s.catalog, s.preflight.changes))
  await freezeAndPay()
}

export function cancelPreflight(): void {
  const s = useKiosk.getState()
  s.setPreflight({ step: 'idle' })
  s.setScreen('cart')
}

async function freezeAndPay(): Promise<void> {
  const rt = getRuntime()
  const s = useKiosk.getState()
  if (!s.catalog || !s.service) return
  const snapshot = buildSnapshot({
    orderId: 'pending',
    lines: s.cart,
    catalog: s.catalog,
    service: s.service,
    lang: s.lang,
    tag: s.tag,
    member: s.member,
  })
  s.setPreflight({ step: 'idle' })
  const input = { lines: snapshot.lines, service: snapshot.service, lang: snapshot.lang, tag: snapshot.tag, totals: snapshot.totals, loyalty: snapshot.loyalty, pricedWith: snapshot.pricedWith }
  const started = await rt.controller.start(input)
  if (!started && rt.controller.state.storeFailed) {
    useKiosk.getState().setPreflight({ step: 'error', key: 'pay.storeFail' })
  }
}
