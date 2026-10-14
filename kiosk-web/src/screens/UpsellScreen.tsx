import { useMemo, useState } from 'react'
import { afterUpsell } from '../app/checkout'
import { getRuntime } from '../app/runtime'
import { Button, TopBar } from '../components/ui'
import { productById } from '../domain/cart'
import { applyOffer, computeOffers, type Offer } from '../domain/upsell'
import { useMoney, useT } from '../i18n/hooks'
import { useKiosk } from '../store/kiosk'

export function UpsellScreen() {
  const { t, l } = useT()
  const money = useMoney()
  const catalog = useKiosk((s) => s.catalog)!
  const cms = useKiosk((s) => s.cms)!
  const cart = useKiosk((s) => s.cart)
  const setCart = useKiosk((s) => s.setCart)
  const setScreen = useKiosk((s) => s.setScreen)

  // Offers are computed once on entry so accepted cards stay visible as "Added".
  const [initial] = useState(() => computeOffers(cart, catalog, cms))
  const [accepted, setAccepted] = useState<Set<string>>(new Set())
  const [drinkPick, setDrinkPick] = useState<Record<string, string>>({})
  const offers = useMemo(() => initial, [initial])

  const accept = (offer: Offer) => {
    if (accepted.has(offer.id)) return
    const next = applyOffer(cart, catalog, offer, { drinkPid: drinkPick[offer.id] })
    setCart(next)
    setAccepted(new Set([...accepted, offer.id]))
    getRuntime().resolved.adapters.analytics.send([{ type: 'upsell_accepted', at: new Date().toISOString(), data: { offer: offer.id, kind: offer.kind } }])
  }

  const forLineName = (lineId: string) => {
    const line = cart.find((x) => x.lineId === lineId)
    const p = line ? productById(catalog, line.productId) : undefined
    return p ? l(p.name) : ''
  }

  return (
    <div className="screen">
      <TopBar title={t('upsell.title')} onBack={() => setScreen('cart')} />
      <main className="content upsell">
        {offers.map((offer) => {
          const done = accepted.has(offer.id)
          if (offer.kind === 'menu-upgrade') {
            const drinks = offer.cfg.drinkPids.map((id) => productById(catalog, id)).filter((p) => !!p)
            const chosen = drinkPick[offer.id] ?? drinks[0]?.id
            return (
              <article key={offer.id} className={`offer ${done ? 'done' : ''}`}>
                <div className="offer-emoji" aria-hidden="true">
                  🍟🥤
                </div>
                <div className="offer-main">
                  <div className="offer-for">{t('upsell.forLine', { product: forLineName(offer.forLineId) })}</div>
                  <h3>{l(offer.cfg.title)}</h3>
                  <p className="muted">{l(offer.cfg.subtitle)}</p>
                  {!done ? (
                    <>
                      <div className="muted small">{t('upsell.pickDrink')}</div>
                      <div className="chips">
                        {drinks.map((d) => (
                          <button key={d!.id} type="button" className={`chip ${chosen === d!.id ? 'selected' : ''}`} onClick={() => setDrinkPick({ ...drinkPick, [offer.id]: d!.id })}>
                            {d!.image} {l(d!.name)}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="offer-action">
                  <Button variant={done ? 'ghost' : 'primary'} disabled={done} onClick={() => accept({ ...offer })}>
                    {done ? `✓ ${t('upsell.added')}` : `${t('upsell.add')} +${money(offer.cfg.priceCents)}`}
                  </Button>
                </div>
              </article>
            )
          }
          if (offer.kind === 'cross-sell') {
            const p = productById(catalog, offer.cfg.pid)
            return (
              <article key={offer.id} className={`offer ${done ? 'done' : ''}`}>
                <div className="offer-emoji" aria-hidden="true">
                  {p?.image ?? '✨'}
                </div>
                <div className="offer-main">
                  <h3>{l(offer.cfg.title)}</h3>
                  <p className="muted">{l(offer.cfg.subtitle)}</p>
                </div>
                <div className="offer-action">
                  <Button variant={done ? 'ghost' : 'primary'} disabled={done} onClick={() => accept(offer)}>
                    {done ? `✓ ${t('upsell.added')}` : `${t('upsell.add')} ${money(offer.cfg.priceCents)}`}
                  </Button>
                </div>
              </article>
            )
          }
          const to = productById(catalog, offer.cfg.toPid)
          return (
            <article key={offer.id} className={`offer ${done ? 'done' : ''}`}>
              <div className="offer-emoji" aria-hidden="true">
                {to?.image ?? '🍋'}
              </div>
              <div className="offer-main">
                <div className="offer-for">{t('upsell.forLine', { product: forLineName(offer.forLineId) })}</div>
                <h3>{l(offer.cfg.title)}</h3>
                <p className="muted">{l(offer.cfg.subtitle)}</p>
              </div>
              <div className="offer-action">
                <Button variant={done ? 'ghost' : 'primary'} disabled={done} onClick={() => accept(offer)}>
                  {done ? `✓ ${t('upsell.added')}` : t('upsell.swap', { delta: `+${money(offer.deltaCents)}` })}
                </Button>
              </div>
            </article>
          )
        })}
      </main>
      <footer className="bottombar">
        <Button variant="secondary" size="lg" onClick={afterUpsell}>
          {t('upsell.skip')}
        </Button>
        <Button variant="primary" size="lg" onClick={afterUpsell}>
          {t('upsell.continue')} →
        </Button>
      </footer>
    </div>
  )
}
