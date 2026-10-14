import { useMemo, useState } from 'react'
import { Button, QtyStepper, Sheet, TopBar } from '../components/ui'
import { cartTotals, defaultServingId, lineUnitPrice, validateLine } from '../domain/cart'
import { newLineId } from '../domain/ids'
import type { CartLine, Product } from '../domain/types'
import { useMoney, useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'

export function MenuScreen() {
  const { t, l } = useT()
  const money = useMoney()
  const catalog = useKiosk((s) => s.catalog)!
  const cms = useKiosk((s) => s.cms)
  const activeCategoryId = useKiosk((s) => s.activeCategoryId)
  const setCategory = useKiosk((s) => s.setCategory)
  const setScreen = useKiosk((s) => s.setScreen)
  const cart = useKiosk((s) => s.cart)
  const unavailableIds = useKiosk((s) => s.unavailableIds)
  const [editing, setEditing] = useState<{ product: Product; line?: CartLine } | null>(null)

  const categories = useMemo(() => [...catalog.categories].sort((a, b) => a.sort - b.sort), [catalog])
  const products = useMemo(() => catalog.products.filter((p) => p.categoryId === activeCategoryId), [catalog, activeCategoryId])
  const totals = cartTotals(cart, catalog)
  const isUnavailable = (p: Product) => !p.available || unavailableIds.includes(p.id)

  return (
    <div className="screen">
      <TopBar />
      <div className="menu">
        <nav className="rail" aria-label="Categories">
          {categories.map((c) => (
            <button key={c.id} type="button" className={`rail-item ${c.id === activeCategoryId ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
              <span className="rail-icon" aria-hidden="true">
                {c.icon ?? '•'}
              </span>
              <span className="rail-label">{l(c.name)}</span>
            </button>
          ))}
        </nav>
        <main className="products">
          {products.map((p) => {
            const soldOut = isUnavailable(p)
            const minPrice = p.priceCents + Math.min(0, ...p.servings.map((s) => s.priceDeltaCents))
            const hasRange = p.servings.some((s) => s.priceDeltaCents !== 0)
            return (
              <button key={p.id} type="button" className={`product-card ${soldOut ? 'soldout' : ''}`} disabled={soldOut} onClick={() => setEditing({ product: p })}>
                <div className="product-emoji" aria-hidden="true">
                  {p.image ?? '🍽️'}
                </div>
                <div className="product-badges">
                  {(p.tags ?? []).map((tag) => (
                    <span key={tag} className={`badge badge-${tag}`}>
                      {l(cms?.badges[tag]) || tag}
                    </span>
                  ))}
                </div>
                <div className="product-name">{l(p.name)}</div>
                <div className="product-desc">{l(p.description)}</div>
                <div className="product-price">
                  {hasRange ? <span className="muted">{t('menu.from')} </span> : null}
                  {money(minPrice)}
                </div>
                {soldOut ? <div className="soldout-label">{t('menu.unavailable')}</div> : null}
              </button>
            )
          })}
        </main>
      </div>
      <footer className="bottombar">
        <div className="cart-summary">
          <strong>{totals.count === 1 ? t('menu.item') : t('menu.items', { n: totals.count })}</strong>
          <span className="muted"> · {money(totals.totalCents)}</span>
        </div>
        <Button variant="primary" size="lg" disabled={cart.length === 0} onClick={() => setScreen('cart')}>
          {t('menu.viewOrder')} →
        </Button>
      </footer>
      {editing ? <ProductSheet product={editing.product} line={editing.line} onClose={() => setEditing(null)} /> : null}
    </div>
  )
}

/** Product configuration sheet: serving, choice groups, extras, quantity. Used for add and edit. */
export function ProductSheet({ product, line, onClose }: { product: Product; line?: CartLine; onClose: () => void }) {
  const { t, l } = useT()
  const money = useMoney()
  const catalog = useKiosk((s) => s.catalog)!
  const cms = useKiosk((s) => s.cms)
  const addLine = useKiosk((s) => s.addLine)
  const replaceLine = useKiosk((s) => s.replaceLine)

  const [draft, setDraft] = useState<CartLine>(
    line ?? {
      lineId: newLineId(),
      productId: product.id,
      servingId: defaultServingId(product),
      choices: {},
      extras: {},
      qty: 1,
      kind: 'item',
    },
  )
  const problems = validateLine(draft, product)
  const unit = lineUnitPrice(draft, catalog)

  const toggleChoice = (groupId: string, optionId: string, max: number) => {
    const current = draft.choices[groupId] ?? []
    let next: string[]
    if (current.includes(optionId)) next = current.filter((x) => x !== optionId)
    else if (max <= 1) next = [optionId]
    else if (current.length < max) next = [...current, optionId]
    else next = current
    setDraft({ ...draft, choices: { ...draft.choices, [groupId]: next } })
  }

  const submit = () => {
    if (problems.length) return
    if (line) replaceLine(line.lineId, draft)
    else addLine(draft)
    onClose()
  }

  return (
    <Sheet
      onClose={onClose}
      title={l(product.name)}
      footer={
        <div className="sheet-actions">
          <QtyStepper value={draft.qty} min={1} onChange={(q) => setDraft({ ...draft, qty: q })} />
          <Button variant="primary" size="lg" disabled={problems.length > 0} onClick={submit}>
            {line ? t('product.update') : t('product.add')} · {money(unit * draft.qty)}
          </Button>
        </div>
      }
    >
      <div className="product-hero">
        <div className="product-emoji big" aria-hidden="true">
          {product.image ?? '🍽️'}
        </div>
        <p className="product-desc">{l(product.description)}</p>
        {product.allergens.length ? (
          <p className="allergens">
            <strong>{t('product.allergens')}:</strong> {product.allergens.map((a) => l(cms?.allergens[a]) || a).join(', ')}
          </p>
        ) : null}
      </div>

      {product.servings.length > 1 ? (
        <section className="option-group">
          <h3>
            {t('product.serving')} <span className="req">{t('product.required')}</span>
          </h3>
          <div className="chips">
            {product.servings.map((s) => (
              <button key={s.id} type="button" className={`chip ${draft.servingId === s.id ? 'selected' : ''}`} onClick={() => setDraft({ ...draft, servingId: s.id })}>
                {l(s.name)}
                {s.priceDeltaCents ? <span className="chip-price">{s.priceDeltaCents > 0 ? '+' : '−'}{money(Math.abs(s.priceDeltaCents))}</span> : null}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {product.choiceGroups.map((g) => (
        <section className="option-group" key={g.id}>
          <h3>
            {l(g.name)} <span className={g.req ? 'req' : 'opt'}>{g.req ? t('product.required') : g.max > 1 ? t('product.pickUpTo', { n: g.max }) : t('product.optional')}</span>
          </h3>
          <div className="chips">
            {g.options.map((o) => (
              <button key={o.id} type="button" className={`chip ${(draft.choices[g.id] ?? []).includes(o.id) ? 'selected' : ''}`} onClick={() => toggleChoice(g.id, o.id, g.max)}>
                {l(o.name)}
                {o.priceDeltaCents ? <span className="chip-price">+{money(o.priceDeltaCents)}</span> : null}
              </button>
            ))}
          </div>
        </section>
      ))}

      {product.extras.length ? (
        <section className="option-group">
          <h3>{t('product.extras')}</h3>
          <div className="extras">
            {product.extras.map((e) => (
              <div className="extra-row" key={e.id}>
                <div>
                  <div>{l(e.name)}</div>
                  <div className="muted">+{money(e.priceCents)}</div>
                </div>
                <QtyStepper value={draft.extras[e.id] ?? 0} max={e.maxQuantity} onChange={(q) => setDraft({ ...draft, extras: { ...draft.extras, [e.id]: q } })} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </Sheet>
  )
}
