import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Small presentational pieces for the admin workspace (tokens in index.css under `.adm`).

export function Panel({ title, count, action, children, className = '', bodyClass = '' }) {
  return (
    <section className={`min-w-0 bg-white border border-slate-200 rounded-xl ${className}`}>
      {title && (
        <header className="flex items-center gap-2 px-5 h-12 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          {count > 0 && <span className="text-[11px] font-medium tabular-nums px-1.5 rounded-md bg-slate-100 text-slate-600">{count}</span>}
          {action && <div className="ml-auto">{action}</div>}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  )
}

export function ViewAll({ to, children = 'View all' }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-orange-700 rounded">
      {children} <ArrowRight size={13} />
    </Link>
  )
}

const TONES = {
  red: 'bg-red-50 text-red-700 ring-red-600/10',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/15',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/10',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/15',
  slate: 'bg-slate-50 text-slate-600 ring-slate-500/15',
}
export function Badge({ tone = 'slate', children }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${TONES[tone]}`}>{children}</span>
}

// Line chart of real history only; renders nothing when there is too little data to draw.
export function Sparkline({ values, label }) {
  if (!values || values.length < 2 || values.every(v => v === 0)) return null
  const w = 64, h = 24, max = Math.max(...values), min = Math.min(...values, 0)
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 2 - ((v - min) / (max - min || 1)) * (h - 4)}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="flex-none">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" className="text-orange-500" />
    </svg>
  )
}

export function KpiCard({ label, value, sub, trend, spark, to }) {
  const body = (
    <>
      <div className="flex min-h-7 items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        {spark}
      </div>
      <p className="mt-1 text-[28px] leading-8 font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
      <p className="mt-2 text-[12px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">{trend}{sub}</p>
    </>
  )
  const cls = 'block min-w-0 bg-white border border-slate-200 rounded-xl p-5 transition-colors'
  return to ? <Link to={to} className={`${cls} hover:border-slate-300`}>{body}</Link> : <div className={cls}>{body}</div>
}

export function Trend({ now, before, suffix = 'vs previous 7 days' }) {
  if (before == null) return null
  const diff = now - before
  const tone = diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-red-700' : 'text-slate-500'
  return <span className={`font-medium ${tone}`}>{diff > 0 ? '+' : ''}{diff} <span className="font-normal text-slate-500">{suffix}</span></span>
}

export const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-md bg-slate-100 ${className}`} />

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex items-start gap-3 px-5 py-6">
      {Icon && <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon size={16} /></span>}
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        {children && <p className="mt-0.5 text-[13px] text-slate-500">{children}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}

// Dropdown that closes on outside click and Escape. `trigger` gets { open, toggle, id }.
export function Menu({ trigger, children, align = 'right', width = 'w-56' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen(o => !o) })}
      {open && (
        <div role="menu" onClick={() => setOpen(false)}
          className={`absolute z-50 mt-2 ${width} ${align === 'right' ? 'right-0' : 'left-0'} rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/5`}>
          {children}
        </div>
      )}
    </div>
  )
}

export function MenuItem({ icon: Icon, children, onClick, to, danger }) {
  const cls = `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] ${danger ? 'text-red-700 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`
  const inner = <>{Icon && <Icon size={15} className="flex-none text-slate-400" />}{children}</>
  return to
    ? <Link role="menuitem" to={to} className={cls}>{inner}</Link>
    : <button role="menuitem" type="button" onClick={onClick} className={cls}>{inner}</button>
}

// Bottom-corner confirmation with an optional undo; disappears after a few seconds.
export function useToast() {
  const [toast, setToast] = useState(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])
  const node = toast && (
    <div role="status" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 flex items-center gap-4 rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] text-slate-50 shadow-lg">
      {toast.text}
      {toast.undo && <button type="button" onClick={() => { toast.undo(); setToast(null) }} className="font-semibold text-orange-300 hover:text-orange-200">Undo</button>}
    </div>
  )
  return [node, setToast]
}
