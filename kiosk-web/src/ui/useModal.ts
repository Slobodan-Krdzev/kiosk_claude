import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Modal behaviour for a dialog element (audit F12, 2026-10-16):
 * focus moves into the dialog when it opens, Tab / Shift+Tab stay inside, everything outside the dialog
 * (up to #screen) is made inert, Escape calls onClose when given, and focus returns to the opener on close.
 */
export function useModal(ref: RefObject<HTMLElement | null>, onClose?: () => void): void {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const opener = document.activeElement as HTMLElement | null
    const focusables = () => [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => !n.closest('[hidden]') && n.getAttribute('aria-hidden') !== 'true')
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
    ;(focusables()[0] ?? el).focus({ preventScroll: true })

    // Background inert: every sibling on the path from the dialog up to the screen root.
    const root = document.getElementById('screen') ?? document.body
    const touched: Element[] = []
    for (let node: Element | null = el; node && node !== root && node.parentElement; node = node.parentElement) {
      for (const sib of Array.from(node.parentElement.children)) {
        if (sib !== node && !sib.hasAttribute('inert')) {
          sib.setAttribute('inert', '')
          touched.push(sib)
        }
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeRef.current) {
        e.preventDefault()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) {
        e.preventDefault()
        el.focus()
        return
      }
      const i = f.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) {
        e.preventDefault()
        f[f.length - 1].focus()
      } else if (!e.shiftKey && (i === -1 || i === f.length - 1)) {
        e.preventDefault()
        f[0].focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      touched.forEach((n) => n.removeAttribute('inert'))
      if (opener && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [ref])
}
