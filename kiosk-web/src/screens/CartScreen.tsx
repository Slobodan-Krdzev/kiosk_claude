import { useState } from 'react'
import { beginCheckout } from '../app/checkout'
import { getRuntime } from '../app/runtime'
import { Button, Keypad, Note, QtyStepper, Sheet, TopBar } from '../components/ui'
import { cartTotals, lineTotal, productById } from '../domain/cart'
import { canSubmitWrites, guestMessageKey } from '../domain/connectivity'
import type { CartLine } from '../domain/types'
import { useMoney, useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'
import { ProductSheet } from './MenuScreen'

export function CartScreen() {
  const { t, l } = useT()
  const money = useMoney()
  const catalog = useKiosk((s) => s.catalog)!
  const cart = useKiosk((s) => s.cart)
  const setQty = useKiosk((s) => s.setQty)
  const removeLine = useKiosk((s) => s.removeLine)
  const clearCart = useKiosk((s) => s.clearCart)
  const setScreen = useKiosk((s) => s.setScreen)
  const member = useKiosk((s) => s.member)
  const setMember = useKiosk((s) => s.setMember)
  const unavailableIds = useKiosk((s) => s.unavailableIds)
  const conn = useKiosk((s) => s.conn)
  const [editing, setEditing] = useState<CartLine | null>(null)
  const [loyaltyOpen, setLoyaltyOpen] = useState(false)

  const totals = cartTotals(cart, catalog)
  const hasUnavailable = cart.some((lne) => unavailableIds.includes(lne.productId))
  const connKey = guestMessageKey(conn)
  const canPay = cart.length > 0 && !hasUnavailable && canSubmitWrites(conn)

  const describe = (lne: CartLine): string => {
    const p = productById(catalog, lne.productId)
    if (!p) return ''
    const parts: string[] = []
    const serving = p.servings.find((s) => s.id === lne.servingId)
    if (serving && p.servings.length > 1) parts.push(l(serving.name))
    for (const g of p.choiceGroups) {
      for (const optId of lne.choices[g.id] ?? []) {
        const o = g.options.find((x) => x.id === optId)
        if (o) parts.push(l(o.name))
      }
    }
    for (const e of p.extras) {
      const q = lne.extras[e.id] ?? 0
      if (q > 0) parts.push(`${q}× ${l(e.name)}`)
    }
    if (lne.kind === 'menu-upgrade' && lne.menuDrink) {
      const d = productById(catalog, lne.menuDrink.productId)
      return t('cart.menuUpgrade', { drink: d ? l(d.name) : '' })
    }
    return parts.join(' · ')
  }

  return (
    <div className="screen">
      <TopBar title={t('cart.title')} onBack={() => setScreen('menu')} />
      <main className="content cart">
        {cart.length === 0 ? (
          <div className="empty">
            <p>{t('cart.empty')}</p>
            <Button variant="primary" size="lg" onClick={() => setScreen('menu')}>
              {t('menu.start')}
            </Button>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {cart.map((lne) => {
                const p = productById(catalog, lne.productId)
                const unavailable = unavailableIds.includes(lne.productId)
                const isChild = !!lne.sourceLineId
                return (
                  <li key={lne.lineId} className={`cart-line ${isChild ? 'child' : ''} ${unavailable ? 'unavailable' : ''}`}>
                    <div className="cart-emoji" aria-hidden="true">
                      {lne.kind === 'menu-upgrade' ? '🍟' : p?.image ?? '🍽️'}
                    </div>
                    <div className="cart-main">
                      <div className="cart-name">{lne.kind === 'menu-upgrade' ? describe(lne) : l(p?.name)}</div>
                      {lne.kind !== 'menu-upgrade' && describe(lne) ? <div className="cart-sub">{describe(lne)}</div> : null}
                      {unavailable ? <div className="cart-sub danger">{t('menu.unavailable')}</div> : null}
                      <div className="cart-actions">
                        {lne.kind === 'item' && p ? (
                          <button type="button" className="link" onClick={() => setEditing(lne)}>
                            {t('cart.edit')}
                          </button>
                        ) : null}
                        <button type="button" className="link danger" onClick={() => removeLine(lne.lineId)}>
                          {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                    <div className="cart-right">
                      <div className="cart-price">{money(lineTotal(lne, catalog))}</div>
                      {isChild ? <span className="muted">×{lne.qty}</span> : <QtyStepper value={lne.qty} min={0} onChange={(q) => setQty(lne.lineId, q)} />}
                    </div>
                  </li>
                )
              })}
            </ul>

            <section className="loyalty">
              {member ? (
                <div className="row between">
                  <span>⭐ {t('cart.loyaltyMember', { name: member.name, points: member.points })}</span>
                  <button type="button" className="link" onClick={() => setMember(null)}>
                    {t('cart.loyaltyRemove')}
                  </button>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setLoyaltyOpen(true)}>
                  ⭐ {t('cart.loyaltyAsk')}
                </Button>
              )}
            </section>

            <section className="totals">
              <div className="row between">
                <span>{t('cart.subtotal')}</span>
                <span>{money(totals.subtotalCents)}</span>
              </div>
              <div className="row between total">
                <span>{t('cart.total')}</span>
                <span>{money(totals.totalCents)}</span>
              </div>
            </section>

            {hasUnavailable ? <Note tone="warn">{t('cart.unavailableInCart')}</Note> : null}
            {connKey ? <Note tone={conn.kind === 'no-authority' ? 'danger' : 'warn'}>{t(connKey)}</Note> : null}
          </>
        )}
      </main>
      {cart.length > 0 ? (
        <footer className="bottombar">
          <Button variant="ghost" onClick={clearCart}>
            {t('cart.clear')}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setScreen('menu')}>
            {t('cart.backToMenu')}
          </Button>
          <Button variant="primary" size="lg" disabled={!canPay} onClick={beginCheckout}>
            {t('cart.checkout')} · {money(totals.totalCents)}
          </Button>
        </footer>
      ) : null}
      {editing ? <ProductSheet product={productById(catalog, editing.productId)!} line={editing} onClose={() => setEditing(null)} /> : null}
      {loyaltyOpen ? <LoyaltySheet onClose={() => setLoyaltyOpen(false)} /> : null}
    </div>
  )
}

function LoyaltySheet({ onClose }: { onClose: () => void }) {
  const { t } = useT()
  const setMember = useKiosk((s) => s.setMember)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      const m = await getRuntime().resolved.adapters.loyalty.identify(code)
      if (m) {
        setMember(m)
        onClose()
      } else setError(t('cart.loyaltyUnknown'))
    } catch {
      setError(t('common.error'))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Sheet
      title={t('cart.loyaltyAsk')}
      onClose={onClose}
      footer={
        <Button variant="primary" size="lg" block disabled={code.length !== 6 || busy} onClick={submit}>
          {t('common.ok')}
        </Button>
      }
    >
      <p className="muted">{t('cart.loyaltyEnter')}</p>
      <div className="code-display">{code.padEnd(6, '·')}</div>
      {error ? <Note tone="danger">{error}</Note> : null}
      <Keypad value={code} onChange={setCode} maxLen={6} />
    </Sheet>
  )
}
