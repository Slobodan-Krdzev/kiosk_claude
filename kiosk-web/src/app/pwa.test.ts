// PWA: manifest says fullscreen + portrait with installable icons; sticky fullscreen re-enters on every tap unless
// staff paused it; the service worker is never registered on plain http or in development; an update takes over only
// while nobody is ordering; the worker never touches the API, POSTs or config freshness.
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { pauseStickyFullscreen, resumeStickyFullscreen, startStickyFullscreen } from './kioskMode'
import { registerServiceWorker, swStatus } from './swRegister'

const root = process.cwd()

describe('manifest', () => {
  const m = JSON.parse(readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'))
  it('starts fullscreen in portrait, relative to wherever the kiosk is hosted', () => {
    expect(m.display).toBe('fullscreen')
    expect(m.display_override[0]).toBe('fullscreen')
    expect(m.orientation).toBe('portrait')
    expect([m.start_url, m.scope]).toEqual(['./', './'])
  })
  it('has 192 and 512 icons and a maskable one, all shipped', () => {
    const sizes = m.icons.map((i: { sizes: string }) => i.sizes)
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']))
    expect(m.icons.some((i: { purpose: string }) => i.purpose === 'maskable')).toBe(true)
    for (const i of m.icons) expect(() => readFileSync(resolve(root, 'public', i.src))).not.toThrow()
  })
  it('index.html links it', () => {
    expect(readFileSync(resolve(root, 'index.html'), 'utf8')).toContain('rel="manifest" href="./manifest.webmanifest"')
  })
})

describe('service worker rules (public/sw.js)', () => {
  const sw = readFileSync(resolve(root, 'public/sw.js'), 'utf8')
  it('leaves non-GET requests and API calls alone', () => {
    expect(sw).toMatch(/if \(req\.method !== 'GET'\) return/)
    expect(sw).toMatch(/if \(isApi\(url\)\) return/)
  })
  it('config.js and the menu fixtures are network first', () => {
    expect(sw).toMatch(/config\\\.js\$.*networkFirst/s)
  })
  it('updates wait for the page to say so', () => {
    expect(sw).toContain("event.data.type === 'SKIP_WAITING'")
    expect(sw).not.toMatch(/install[^}]*skipWaiting/)
  })
})

describe('sticky fullscreen', () => {
  afterEach(() => resumeStickyFullscreen())
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
  it('the first tap enters fullscreen, a tap after leaving re-enters it', async () => {
    const { request, exit } = setup()
    const stop = startStickyFullscreen(document)
    document.body.click()
    await Promise.resolve()
    expect(request).toHaveBeenCalledTimes(1)
    document.body.click()
    expect(request).toHaveBeenCalledTimes(1) // already fullscreen
    exit()
    document.body.click()
    expect(request).toHaveBeenCalledTimes(2)
    stop()
  })
  it('paused by staff (logo hold exit): taps do nothing until resumed', () => {
    const { request } = setup()
    const stop = startStickyFullscreen(document)
    pauseStickyFullscreen()
    document.body.click()
    expect(request).not.toHaveBeenCalled()
    stop()
  })
})

describe('service worker registration', () => {
  const gate = (idle: boolean) => ({ idle: () => idle, subscribe: () => () => {} })
  it('is skipped in development and on plain http', async () => {
    const register = vi.fn()
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register, addEventListener: vi.fn() } })
    await registerServiceWorker(gate(true), () => {}, false)
    expect(swStatus()).toBe('dev')
    vi.stubGlobal('isSecureContext', false)
    await registerServiceWorker(gate(true), () => {}, true)
    expect(swStatus()).toBe('insecure')
    expect(register).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
  it('a waiting update is activated only while nobody is ordering', async () => {
    const waiting = { postMessage: vi.fn() }
    const reg = { waiting, installing: null, addEventListener: vi.fn(), update: vi.fn(async () => undefined) }
    let subscriber: (() => void) | null = null
    let idle = false
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register: vi.fn(async () => reg), addEventListener: vi.fn(), controller: {} } })
    vi.stubGlobal('isSecureContext', true)
    vi.useFakeTimers()
    await registerServiceWorker({ idle: () => idle, subscribe: (cb) => ((subscriber = cb), () => (subscriber = null)) }, () => {}, true)
    expect(waiting.postMessage).not.toHaveBeenCalled() // a guest is ordering
    idle = true
    subscriber!()
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
})
