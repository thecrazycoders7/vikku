import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUp, ArrowDown, ChevronsUpDown, CircleCheck, CircleAlert, Search, SearchX, Inbox } from 'lucide-react'

// Small presentational pieces for the admin workspace. Classes and tokens live in index.css under `.adm`
// (the restaurant app's design system).

// Page title row: 20px title, 13px muted line, actions on the right.
export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div className="min-w-0">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="actions">{children}</div>}
    </div>
  )
}

// Grid of KPI-sized placeholders while a page loads.
export function KpiSkeletons({ count = 4, className = 'grid grid-cols-2 lg:grid-cols-4 gap-4' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card kpi"><Skeleton className="h-4 w-24" /><Skeleton className="mt-2.5 h-7 w-32" /><Skeleton className="mt-2 h-3 w-40 max-w-full" /></div>
      ))}
    </div>
  )
}

// Underlined tabs (active tab: text colour with a 2px bar). tabs: [label] or [[id, label, count?]].
export function Tabs({ tabs, value, onChange, label = 'Sections' }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-0.5 border-b border-slate-200 mb-4 overflow-x-auto">
      {tabs.map(t => {
        const [id, text, count] = Array.isArray(t) ? t : [t, t]
        return (
          <button key={id} type="button" role="tab" aria-selected={value === id} onClick={() => onChange(id)}
            className={`h-[38px] px-3 text-[14px] font-medium border-b-2 -mb-px whitespace-nowrap inline-flex items-center gap-1.5 transition-colors ${value === id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
            {text}{count != null && <span className="text-[11px] tabular-nums rounded-full bg-slate-100 px-1.5 text-slate-500">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function Panel({ title, count, action, children, className = '', bodyClass = '' }) {
  return (
    <section className={`card min-w-0 ${className}`}>
      {title && (
        <header className="card-head">
          <h2>{title}</h2>
          {count > 0 && <span className="count">{count}</span>}
          {action && <div className="right">{action}</div>}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  )
}

export function ViewAll({ to, children = 'View all' }) {
  return (
    <Link to={to} className="btn btn-ghost btn-sm text-slate-500 hover:text-slate-900">
      {children} <ArrowRight size={13} />
    </Link>
  )
}

// Soft status badge with a dot; always pass a text label. Orange is reserved for the brand, so it reads as amber.
// `tone` is a colour name, or an older Tailwind tone string from the CRM data ('bg-emerald-50 text-emerald-700').
const TONES = { red: 'b-red', amber: 'b-amber', orange: 'b-amber', green: 'b-green', blue: 'b-blue', violet: 'b-violet', slate: 'b-gray' }
const FAMILY = { rose: 'red', red: 'red', amber: 'amber', yellow: 'amber', orange: 'amber', emerald: 'green', green: 'green', blue: 'blue', sky: 'blue', violet: 'violet', purple: 'violet' }
export const toneOf = (cls = '') => FAMILY[/(?:bg|text)-([a-z]+)-\d/.exec(cls)?.[1]] || 'slate'
export const badgeCls = (tone = 'slate') => `badge ${TONES[tone] || TONES[toneOf(tone)]}`
export function Badge({ tone = 'slate', children }) {
  return <span className={badgeCls(tone)}>{children}</span>
}

// Line chart of real history only; renders nothing when there is too little data to draw.
export function Sparkline({ values, label }) {
  if (!values || values.length < 2 || values.every(v => v === 0)) return null
  const w = 64, h = 24, max = Math.max(...values), min = Math.min(...values, 0)
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 2 - ((v - min) / (max - min || 1)) * (h - 4)}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="flex-none max-[480px]:hidden">
      <polyline points={pts} fill="none" stroke="var(--series-1)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function KpiCard({ label, value, sub, trend, spark, to }) {
  const body = (
    <>
      <div className="flex min-h-6 items-start justify-between gap-3">
        <p className="kpi-label">{label}</p>
        {spark}
      </div>
      <p className="kpi-value">{value}</p>
      <p className="kpi-foot">{trend}{sub}</p>
    </>
  )
  const cls = 'card kpi min-w-0 transition-colors'
  return to ? <Link to={to} className={cls}>{body}</Link> : <div className={cls}>{body}</div>
}

export function Trend({ now, before, suffix = 'vs previous 7 days' }) {
  if (before == null) return null
  const diff = now - before
  return (
    <span>
      <span className={`delta ${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}`}>{diff > 0 ? '+' : ''}{diff}</span>{' '}
      <span>{suffix}</span>
    </span>
  )
}

// Grey placeholder block shown while data loads.
export const Skeleton = ({ className = '' }) => <div aria-hidden="true" className={`skel ${className}`} />

export function EmptyState({ icon: Icon = Inbox, title, children, action }) {
  return (
    <div className="empty">
      <span className="em-ic" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

// Load failure with a way to try again.
export function ErrorState({ title = "Couldn't load this", children, onRetry }) {
  return (
    <div role="alert" className="empty state-error">
      <span className="em-ic" aria-hidden="true"><CircleAlert size={18} strokeWidth={1.75} /></span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {onRetry && <button type="button" onClick={onRetry} className="btn btn-sm mt-1">Try again</button>}
    </div>
  )
}

// Dropdown that closes on outside click and Escape. `trigger` gets { open, toggle, id }.
export function Menu({ trigger, children, align = 'right', width = 'w-56', up = false }) {
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
          className={`popover absolute z-50 ${up ? 'bottom-full mb-2' : 'mt-2'} ${width} ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {children}
        </div>
      )}
    </div>
  )
}

export function MenuItem({ icon: Icon, children, onClick, to, danger }) {
  const cls = `pop-item ${danger ? 'danger' : ''}`
  const inner = <>{Icon && <Icon size={16} />}{children}</>
  return to
    ? <Link role="menuitem" to={to} className={cls}>{inner}</Link>
    : <button role="menuitem" type="button" onClick={onClick} className={cls}>{inner}</button>
}

// Bottom-corner toast with an optional undo; disappears after a few seconds. Pass `type: 'error'` for failures.
export function useToast() {
  const [toast, setToast] = useState(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])
  const node = toast && (
    <div role={toast.type === 'error' ? 'alert' : 'status'} className={`toast ${toast.type === 'error' ? 'error' : 'success'}`}>
      {toast.type === 'error' ? <CircleAlert aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
      <span>{toast.text}</span>
      {toast.undo && <button type="button" onClick={() => { toast.undo(); setToast(null) }}>Undo</button>}
    </div>
  )
  return [node, setToast]
}

// Sorting for admin lists. `get` maps a key to a value getter (lowercase strings yourself); empty values
// always go last. Click a header to sort by it, click again to flip.
export function useSort(rows, initial, get) {
  const [sort, setSort] = useState(initial) // { key, dir: 'asc' | 'desc' }
  const sorted = useMemo(() => {
    const value = get[sort.key]
    if (!value) return rows
    const m = sort.dir === 'desc' ? -1 : 1
    const empty = (v) => v == null || v === ''
    return [...rows].sort((a, b) => {
      const x = value(a), y = value(b)
      if (empty(x)) return empty(y) ? 0 : 1
      if (empty(y)) return -1
      return (x < y ? -1 : x > y ? 1 : 0) * m
    })
  }, [rows, sort]) // `get` is a fresh object each render; it only changes with `rows`
  const toggle = (key) => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === initial.key ? initial.dir : 'asc' })
  return { sorted, sort, setSort, toggle }
}

// Column header that sorts its list (pair with useSort).
export function SortHeader({ label, k, sort, onSort, className = '' }) {
  const on = sort.key === k
  const Icon = !on ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <span role="columnheader" aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={className}>
      <button type="button" onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded hover:text-slate-900 ${on ? 'text-slate-900' : ''}`}>
        {label} <Icon size={13} className={on ? '' : 'opacity-50'} />
      </button>
    </span>
  )
}

// One list component for admin tables: search, select filters, sortable headers, pagination, and
// "empty" / "no results" states. columns: [{ key, label, render(row), sort(row) → value, num }].
// filters: [{ key, label, options: [{ value, label }], test(row, value), all? }] (`all` labels the no-filter option).
// search(row) → text to match. initialFilters: { [key]: value }. Column `className` applies to its th and td.
// toolbar: nodes, or (visibleRows) => nodes for actions that use the filtered rows (CSV export).
export function DataTable({ rows, columns, search, searchLabel = 'Search', filters = [], initialFilters = {}, initialSort, pageSize = 25,
  onRowClick, rowKey = r => r.id, empty, emptyTitle = 'Nothing here yet', toolbar, loading }) {
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState(initialFilters)
  const [page, setPage] = useState(0)
  const visible = useMemo(() => rows.filter(r =>
    (!q || search?.(r).toLowerCase().includes(q.trim().toLowerCase()))
    && filters.every(f => !picked[f.key] || f.test(r, picked[f.key]))
  ), [rows, q, picked]) // filters/search are fresh each render; they only change with rows
  const getters = Object.fromEntries(columns.filter(c => c.sort).map(c => [c.key, c.sort]))
  const { sorted, sort, toggle } = useSort(visible, initialSort || { key: null, dir: 'asc' }, getters)
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const at = Math.min(page, pages - 1)
  const shown = sorted.slice(at * pageSize, (at + 1) * pageSize)
  useEffect(() => setPage(0), [q, picked])
  const filtered = q || Object.values(picked).some(Boolean)

  return (
    <div className="min-w-0">
      {(search || filters.length > 0 || toolbar) && (
        <div className="dt-toolbar">
          {search && (
            <label className="input-group">
              <Search aria-hidden="true" />
              <span className="sr-only">{searchLabel}</span>
              <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={`${searchLabel}…`} className="input" />
            </label>
          )}
          {filters.map(f => (
            <select key={f.key} aria-label={f.label} value={picked[f.key] || ''} className="select"
              onChange={e => setPicked(p => ({ ...p, [f.key]: e.target.value }))}>
              <option value="">{f.all || `${f.label}: all`}</option>
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          {toolbar && <div className="ml-auto flex items-center gap-2">{typeof toolbar === 'function' ? toolbar(sorted) : toolbar}</div>}
        </div>
      )}
      {loading ? (
        <div className="divide-y divide-slate-200" aria-busy="true">
          {[0, 1, 2, 3, 4].map(i => <div key={i} className="flex items-center gap-4 px-4 h-12"><Skeleton className="h-3.5 w-1/3" /><Skeleton className="h-3.5 w-1/5" /><Skeleton className="ml-auto h-3.5 w-16" /></div>)}
        </div>
      ) : !rows.length ? (empty || <EmptyState title={emptyTitle} />) : !sorted.length ? (
        <EmptyState icon={SearchX} title="No results" action={filtered && (
          <button type="button" className="btn btn-sm" onClick={() => { setQ(''); setPicked({}) }}>Clear filters</button>
        )}>Nothing matches these filters.</EmptyState>
      ) : (
        <div className="relative overflow-x-auto">
          <table className="dt">
            <thead>
              <tr>
                {columns.map(c => {
                  const on = sort.key === c.key
                  const Icon = !on ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown
                  return (
                    <th key={c.key} scope="col" className={`${c.num ? 'num' : ''} ${c.className || ''}`}
                      aria-sort={c.sort ? (on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}>
                      {c.sort
                        ? <button type="button" onClick={() => toggle(c.key)}>{c.label}<Icon size={13} aria-hidden="true" className={on ? '' : 'opacity-50'} /></button>
                        : c.label}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {shown.map(r => (
                <tr key={rowKey(r)} className={onRowClick ? 'clickable' : undefined} tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick && (() => onRowClick(r))}
                  onKeyDown={onRowClick && (e => { if (e.key === 'Enter') onRowClick(r) })}>
                  {columns.map(c => <td key={c.key} className={`${c.num ? 'num' : ''} ${c.className || ''}`}>{c.render ? c.render(r) : r[c.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sorted.length > pageSize && (
        <div className="dt-foot">
          <span className="flex-1">{at * pageSize + 1}–{Math.min((at + 1) * pageSize, sorted.length)} of {sorted.length}</span>
          <button type="button" className="btn btn-sm" disabled={at === 0} onClick={() => setPage(at - 1)}>Previous</button>
          <button type="button" className="btn btn-sm" disabled={at >= pages - 1} onClick={() => setPage(at + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
