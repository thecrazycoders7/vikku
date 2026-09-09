import { useLayoutEffect } from 'react'

// Shared across all mounted modals so stacked modals don't unlock early
let lockCount = 0

/**
 * Locks body scrolling while the calling component is mounted (or while
 * `active` is true). Uses position:fixed rather than overflow:hidden because
 * iOS Safari ignores overflow on body; scroll position is preserved and
 * restored on unlock.
 */
export default function useLockBodyScroll(active = true) {
  useLayoutEffect(() => {
    if (!active) return
    const body = document.body
    lockCount++
    if (lockCount === 1) {
      const scrollY = window.scrollY
      body.dataset.scrollLockY = String(scrollY)
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
      body.style.overflow = 'hidden'
    }
    return () => {
      lockCount--
      if (lockCount === 0) {
        const y = Number(body.dataset.scrollLockY || 0)
        delete body.dataset.scrollLockY
        body.style.position = ''
        body.style.top = ''
        body.style.left = ''
        body.style.right = ''
        body.style.width = ''
        body.style.overflow = ''
        // 'instant' bypasses the global scroll-behavior:smooth, which would
        // animate the restore and can be cancelled by competing scrolls
        window.scrollTo({ top: y, left: 0, behavior: 'instant' })
      }
    }
  }, [active])
}
