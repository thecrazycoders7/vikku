import { useState, useEffect } from 'react'

// Module-level guard so React StrictMode's double-invoked effect (dev only)
// doesn't set up the animation twice or cut it short.
let started = false

// First-load intro: centered logo + wordmark, fades in then out to reveal the
// site. Shows once per browser session; skipped for reduced-motion users.
export default function SplashScreen() {
  const [phase, setPhase] = useState(() => {
    try { if (sessionStorage.getItem('vikku_splash') === '1') return 'done' } catch {}
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'done'
    return 'in'
  })

  useEffect(() => {
    if (phase !== 'in' || started) return
    started = true
    try { sessionStorage.setItem('vikku_splash', '1') } catch {}
    // Note: intentionally does NOT lock body scroll — the opaque overlay
    // already covers the page for ~2s, and touching body.style.overflow
    // races with the modal scroll-lock and could leave scrolling stuck.
    // No cleanup that clears these — StrictMode's simulated unmount would
    // otherwise cancel the only timers and freeze the splash on screen.
    setTimeout(() => setPhase('leaving'), 1500)
    setTimeout(() => setPhase('done'), 2150)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        background: 'var(--bg)',
        opacity: phase === 'leaving' ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: phase === 'leaving' ? 'none' : 'auto',
      }}
      aria-hidden="true"
    >
      <div
        className="flex items-center gap-3 sm:gap-4"
        style={{ animation: 'vikkuSplashIn 0.8s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <img src="/logo.png" alt="" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
        <span
          className="font-display font-extrabold tracking-tight"
          style={{ fontSize: 'clamp(2.2rem, 7vw, 3.75rem)', color: 'var(--text)' }}
        >
          Vikku
        </span>
      </div>
      <style>{`
        @keyframes vikkuSplashIn {
          from { opacity: 0; transform: translateY(14px) scale(0.94); filter: blur(6px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
      `}</style>
    </div>
  )
}
