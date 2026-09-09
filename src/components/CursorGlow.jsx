import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    const el = glowRef.current
    if (!el) return

    // Respect users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = null
    let x = window.innerWidth  / 2
    let y = window.innerHeight / 2
    let tx = x, ty = y

    const animate = () => {
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      el.style.transform = `translate(${x - 300}px, ${y - 300}px)`
      // Stop animating once the glow has settled on the target to save CPU
      if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5) {
        raf = null
        return
      }
      raf = requestAnimationFrame(animate)
    }

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      if (raf === null) raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)

    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-0 hidden md:block"
      style={{
        width:  '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 40%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  )
}
