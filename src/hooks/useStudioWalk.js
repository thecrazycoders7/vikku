import { useEffect, useRef, useState } from 'react'

// Scroll-driven walk through the 3D studio (src/lib/studioScene.js), shared by the homepage and the
// tools dashboard. Each page has seven full-height sections whose ids are passed in; scrolling from
// one section's centre to the next moves the camera one room along. Returns the canvas and loading
// refs, the current room index and whether the scene has finished loading.
export default function useStudioWalk(sectionIds, onRoomReached) {
  const canvasRef = useRef(null)
  const loadingRef = useRef(null)
  const [room, setRoom] = useState(0)
  const [ready, setReady] = useState(false)
  const story = useRef({ target: 0 }).current
  const reachedCb = useRef(onRoomReached)
  reachedCb.current = onRoomReached
  const ids = sectionIds.join(',')

  // Scroll → story progress in [0,1]; each section's centre maps to t = i / (sections - 1).
  useEffect(() => {
    const bar = document.getElementById('progress')
    const secs = ids.split(',').map(id => document.getElementById(id))
    let reached = 0
    const update = () => {
      // ponytail: re-measured every scroll since fonts and resizes shift section heights; seven rects is cheap
      const max = document.documentElement.scrollHeight - innerHeight
      const stops = secs.map(s => s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2 - innerHeight / 2)
      const n = stops.length - 1
      stops[0] = 0
      stops[n] = Math.min(stops[n], max)
      let t = 1
      for (let i = 0; i < n; i++) if (scrollY <= stops[i + 1]) { t = (i + Math.max(0, (scrollY - stops[i]) / (stops[i + 1] - stops[i] || 1))) / n; break }
      story.target = t
      if (bar) bar.style.width = t * 100 + '%'
      const r = Math.round(t * n)
      setRoom(r)
      for (; reached < r; reached++) reachedCb.current?.(reached + 1)
    }
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    update()
    return () => {
      removeEventListener('scroll', update)
      removeEventListener('resize', update)
    }
  }, [story, ids])

  // The 3D scene loads in its own chunk once the page is idle, and fades in over the poster when ready.
  // Skipped during the build's headless prerender and on data-saver, 2G or low-memory devices,
  // where the poster image stays as the backdrop. (Not 3G: Chrome's estimate often says 3G on fine desktop links.)
  useEffect(() => {
    const net = navigator.connection
    const lite = net?.saveData || /2g/.test(net?.effectiveType || '') || (navigator.deviceMemory || 8) <= 2
    if (navigator.webdriver || lite) { loadingRef.current.hidden = true; return }
    let dispose = null
    let cancelled = false
    const start = () => import('../lib/studioScene').then(({ createStudio }) =>
      createStudio({ canvas: canvasRef.current, loadingEl: loadingRef.current, story, onReady: () => setReady(true) }))
      .then(d => { if (cancelled) d(); else dispose = d })
      .catch(() => { if (loadingRef.current) loadingRef.current.hidden = true })
    const idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300)
    return () => {
      cancelled = true
      window.cancelIdleCallback ? cancelIdleCallback(idle) : clearTimeout(idle)
      dispose?.()
    }
  }, [story])

  return { canvasRef, loadingRef, room, ready }
}
