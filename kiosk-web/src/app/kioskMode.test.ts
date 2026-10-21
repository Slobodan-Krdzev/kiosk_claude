// Fullscreen from the first tap: any tap enters it, a tap after leaving re-enters it, the logo-hold exit pauses it.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { pauseStickyFullscreen, resumeStickyFullscreen, startStickyFullscreen } from './kioskMode'

const setup = () => {
  let fs: Element | null = null
  const request = vi.fn(async () => {
    fs = document.documentElement
  })
  Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, get: () => true })
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => fs })
  ;(document.documentElement as unknown as { requestFullscreen: unknown }).requestFullscreen = request
  return { request, exit: () => (fs = null) }
}

describe('fullscreen from the first tap', () => {
  afterEach(() => resumeStickyFullscreen())

  it('the first tap (language pill or a bottom button) enters fullscreen; the tap still reaches the button', async () => {
    const { request } = setup()
    document.body.innerHTML = '<button data-a="lang">NL</button><button data-a="startWith">Hier eten</button>'
    const onLang = vi.fn()
    document.querySelector('[data-a="lang"]')!.addEventListener('click', onLang)
    const stop = startStickyFullscreen(document)
    ;(document.querySelector('[data-a="lang"]') as HTMLButtonElement).click()
    await Promise.resolve()
    expect(request).toHaveBeenCalledTimes(1)
    expect(onLang).toHaveBeenCalledTimes(1)
    ;(document.querySelector('[data-a="startWith"]') as HTMLButtonElement).click()
    expect(request).toHaveBeenCalledTimes(1) // already fullscreen
    stop()
  })

  it('after leaving fullscreen the next tap re-enters it', async () => {
    const { request, exit } = setup()
    const stop = startStickyFullscreen(document)
    document.body.click()
    await Promise.resolve()
    exit()
    document.body.click()
    expect(request).toHaveBeenCalledTimes(2)
    stop()
  })

  it('paused by the staff logo-hold exit: taps do nothing', () => {
    const { request } = setup()
    const stop = startStickyFullscreen(document)
    pauseStickyFullscreen()
    document.body.click()
    expect(request).not.toHaveBeenCalled()
    stop()
  })
})
