// The "continue without receipt?" prompt: opened by the API order adapter, answered through the confirm dialog.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { askContinueWithoutReceipt, printPromptOpen, printSkipNo, printSkipYes } from './app/orderPrompts'
import { finalizeEngineData } from './engine/data'
import { setEngine, setLang } from './engine/state'
import type { EngineData } from './engine/types'
import { useEngine } from './store/engine'
import { Overlays } from './ui/Overlays'

const FILES: Record<string, string> = {
  brand: 'BRAND', cats: 'CATS', products: 'PRODUCTS', mods: 'MODS', menuDeal: 'MENU_DEAL', cms: 'GUESTIT_CMS', upsell: 'UPSELL_CMS', priceVariants: 'PRICE_VARIANTS', i18n: 'I18N', alg: 'ALG', algIcon: 'ALG_ICON', catsub: 'CATSUB', comp: 'COMP', compAll: 'COMP_ALL', flags: 'FLAGS', locales: 'LOCALES', bdg: 'BDG', icons: 'P', obwInfo: 'OBW_INFO', obwDefault: 'OBW_DEFAULT', cmsCatAlias: 'CMS_CAT_ALIAS', roleGroup: 'ROLE_GROUP', allergenPolicy: 'ALLERGEN_POLICY',
}
function pack(): EngineData {
  const dir = resolve(process.cwd(), 'public/mock/dadawan')
  return finalizeEngineData(Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, JSON.parse(readFileSync(resolve(dir, f + '.json'), 'utf8'))])) as unknown as EngineData)
}

afterEach(cleanup)

describe('continue without receipt prompt', () => {
  it('opens the printProblem dialog, resolves with the tapped answer and closes it', async () => {
    setEngine(pack())
    setLang('nl')
    useEngine.setState(useEngine.getInitialState(), true)
    const p = askContinueWithoutReceipt()
    expect(printPromptOpen()).toBe(true)
    expect(useEngine.getState().confirm).toBe('printProblem')
    render(<Overlays />)
    fireEvent.click(screen.getByRole('button', { name: 'Doorgaan zonder bon' }))
    expect(await p).toBe(true)
    expect(useEngine.getState().confirm).toBeNull()
    expect(printPromptOpen()).toBe(false)

    const q = askContinueWithoutReceipt()
    printSkipNo()
    expect(await q).toBe(false)

    const r1 = askContinueWithoutReceipt()
    const r2 = askContinueWithoutReceipt() // a second question answers the first with "no"
    expect(await r1).toBe(false)
    printSkipYes()
    expect(await r2).toBe(true)
  })
})
