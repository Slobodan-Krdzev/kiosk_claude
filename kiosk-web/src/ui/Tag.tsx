import { useShallow } from 'zustand/shallow'
// Order tag (table sign / pager / name) — port of SCR.tag + tagKeysHTML.

import { tagGo, tagSkip } from '../app/checkout'
import { cartCount, lineUnit } from '../engine/cart'
import { fmt } from '../engine/money'
import { t } from '../engine/state'
import { clean, tagState } from '../app/tag'
import { useEngine } from '../store/engine'
import { Ic } from './primitives'
import { NO_HIT } from './style'
import { TAG_ILL } from './tagIll'

const BKSP = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
    <path d="m11 9 6 6M17 9l-6 6" />
  </svg>
)
const KB = { lat: ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'], cyr: ['ЉЊЕРТЅУИОПШЃ', 'АСДФГХЈКЛЧЌЖ', 'ЗЏЦВБНМ'] }

export function Tag() {
  const cfg = useEngine((s) => s.config!.orderTag)
  const service = useEngine((s) => s.service)
  const cart = useEngine((s) => s.cart)
  const raw = useEngine((s) => s.tagDraft)
  const kb = useEngine((s) => s.tagKb)
  const checking = useEngine((s) => s.checking)
  const a = useEngine(useShallow((s) => ({ tagKey: s.tagKey, tagBack: s.tagBack, tagSetDraft: s.tagSetDraft })))
  const st = tagState(cfg, service, raw)
  const total = cart.reduce((x, l) => x + lineUnit(l) * l.qty, 0)
  const n = cartCount(cart)
  const T = { table: ['tag_tableT', 'tag_tableS', 'tag_tableL'], pager: ['tag_pagerT', 'tag_pagerS', 'tag_pagerL'], name: ['tag_nameT', 'tag_nameS', 'tag_nameL'] }[st.type]
  const dis = !st.ok || checking
  const key = (k: string, label: React.ReactNode, cls = '', aria?: string) => (
    <button key={k} type="button" data-a="tagKey" className={`press tag-k ${cls}`} aria-label={aria} onClick={() => press(k)}>
      {label}
    </button>
  )
  const press = (k: string) => {
    if (k === 'del') a.tagSetDraft(st.v.slice(0, -1))
    else if (k === 'clr') a.tagSetDraft('')
    else if (k === 'kb') a.tagKey('kb')
    else if (k === 'sp') a.tagSetDraft(clean(cfg, st.type, st.v + ' '))
    else a.tagSetDraft(clean(cfg, st.type, st.v + k))
  }
  return (
    <>
      <div className="flex-none flex items-center justify-between px-9 pt-7 pb-4">
        <button type="button" data-a="tagBack" className="press h-[76px] pl-5 pr-8 rounded-full bg-card shadow-soft flex items-center gap-2 text-[24px] font-bold" onClick={a.tagBack}>
          <span className="w-8 h-8">
            <Ic n="chevL" sw={2.4} />
          </span>
          {t('yourOrder')}
        </button>
        <div className="text-[22px] text-mute font-semibold">
          {n} {n === 1 ? t('item') : t('items')} · <span className="num">{fmt(total)}</span>
        </div>
      </div>
      <div className="scroller flex-1 px-10 tag-wrap">
        <div className="tag-head">
          <div className="tag-ill" aria-hidden="true">
            {TAG_ILL[st.type]}
          </div>
          <div className="tag-hx">
            <h1 className="hd tag-t">{t(T[0])}</h1>
            <p className="tag-s">{t(T[1])}</p>
          </div>
        </div>
        <div id="tagField" className={`tag-field${st.v ? ' has' : ''}`}>
          <span className="tag-lbl" id="tagLbl">
            {t(T[2])}
          </span>
          <output id="tagVal" className={`tag-val ${st.type === 'name' ? 'name' : 'num'}${st.v ? '' : ' empty'}`} aria-labelledby="tagLbl" aria-live="polite">
            {st.v ? st.v : <span className="tag-ph">{st.type === 'name' ? t('tag_namePh') : '—'}</span>}
          </output>
          <button type="button" id="tagClr" data-a="tagKey" className="press tag-clr" aria-label={t('tag_clear')} hidden={!st.v} onClick={() => press('clr')}>
            <Ic n="x" sw={2.6} />
          </button>
        </div>
        <div id="tagHint" className={`tag-hint${st.err ? ' err' : ''}`} role="status">
          {st.hint}
        </div>
        {st.type !== 'name' ? (
          <div className="tag-pad" role="group" aria-label={t('tag_padA')}>
            {'123456789'.split('').map((d) => key(d, d, 'num'))}
            <span aria-hidden="true" />
            {key('0', '0', 'num')}
            {key('del', BKSP, 'tag-kdel', t('tag_del'))}
          </div>
        ) : (
          <div className="tag-kb" role="group" aria-label={t('tag_kbA')}>
            {KB[kb].map((r, i) => (
              <div className="tag-row" key={r}>
                {r.split('').map((ch) => key(ch, ch))}
                {i === 2 ? key('del', BKSP, 'tag-kdel w', t('tag_del')) : null}
              </div>
            ))}
            <div className="tag-row">
              {key('kb', kb === 'cyr' ? 'ABC' : 'АБВ', 'w', t('tag_kbSwitch'))}
              {key('-', '-')}
              {key('sp', t('tag_space'), 'sp')}
            </div>
          </div>
        )}
      </div>
      <div className="flex-none bg-card shadow-lift px-10 py-7">
        {cfg.required ? null : (
          <button type="button" data-a="tagSkip" className="press tag-skip" onClick={() => void tagSkip()}>
            {t('tag_skip')}
          </button>
        )}
        <button type="button" id="tagGo" data-a="tagGo" disabled={dis} aria-disabled={dis} className="press cta w-full h-[112px] rounded-full bg-jade text-white flex items-center justify-center gap-6" onClick={() => void tagGo(st)}>
          <span className="hd text-[28px] tracking-[.12em]" style={NO_HIT}>
            {checking ? t('availCheckT') : t('tag_go')} · <span className="num">{fmt(total)}</span>
          </span>
          <span className="w-9 h-9" style={NO_HIT}>
            <Ic n="arrR" sw={2.4} />
          </span>
        </button>
      </div>
    </>
  )
}
