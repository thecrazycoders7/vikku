import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Phone, MapPin, Building2, CalendarClock, MessageCircle, RefreshCw, CheckSquare, ChevronDown, Trash2, X, Tag, ArrowRightLeft } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import LeadPanel from './LeadPanel'
import useOpenOnParam from '../../../hooks/useOpenOnParam'
import { Badge, Menu, MenuItem, PageHead, useToast } from '../ui'
import { LEAD_SOURCES, LEAD_STAGES, convertLead, deleteLeads, formatMoney, listLeads, pipelineStats, sourceLabel, updateLead, updateLeads, whatsappNumber } from '../../../lib/crmService'

function Stat({ label, children }) {
  return (
    <div className="card px-4 py-3 min-w-0">
      <p className="text-[12.5px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-[16px] font-semibold text-slate-900 tabular-nums break-words">{children}</p>
    </div>
  )
}

function LeadCard({ lead, today, onOpen, onDragStart, selecting, selected, onToggle }) {
  const wa = whatsappNumber(lead.phone)
  const overdue = lead.next_follow_up && lead.next_follow_up <= today && !['won', 'lost'].includes(lead.stage)
  return (
    <div draggable={!selecting} onDragStart={e => onDragStart(e, lead)} onClick={() => selecting ? onToggle(lead) : onOpen(lead)}
      className={`bg-white rounded-ui p-3 shadow-ui-sm border cursor-pointer hover:border-slate-300 transition-colors ${selected ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-2">
        {selecting && <input type="checkbox" checked={selected} readOnly tabIndex={-1} aria-label={`Select ${lead.name}`} className="mt-0.5 h-4 w-4 flex-none accent-[var(--primary)]" />}
        <p className="flex-1 min-w-0 text-[13px] font-semibold text-slate-900 truncate">{lead.name}</p>
        {Number(lead.value) > 0 && <p className="text-[12.5px] font-semibold text-slate-900 flex-shrink-0 tabular-nums">{formatMoney(lead.value, lead.currency)}</p>}
      </div>
      <div className="mt-1.5 space-y-1 text-[12px] text-slate-500">
        {lead.company && <p className="flex items-center gap-1.5 truncate"><Building2 size={12} aria-hidden="true" /> {lead.company}</p>}
        {(lead.phone || lead.city) && (
          <p className="flex items-center gap-3 flex-wrap">
            {lead.phone && <span className="flex items-center gap-1.5 tabular-nums"><Phone size={12} aria-hidden="true" /> {lead.phone}</span>}
            {lead.city && <span className="flex items-center gap-1.5"><MapPin size={12} aria-hidden="true" /> {lead.city}</span>}
          </p>
        )}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <Badge tone="blue">{sourceLabel(lead.source)}</Badge>
        {lead.next_follow_up && (
          <Badge tone={overdue ? 'red' : 'slate'}>
            <span className="tabular-nums">{overdue ? 'Due ' : ''}{new Date(lead.next_follow_up).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
          </Badge>
        )}
        {lead.client_id && <Badge tone="green">Client</Badge>}
        {wa && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="icon-act ml-auto" aria-label={`WhatsApp ${lead.name}`} title="WhatsApp">
            <MessageCircle size={15} />
          </a>
        )}
      </div>
    </div>
  )
}

export default function CrmLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('')
  const [panel, setPanel] = useState(null) // { lead } | { stage } for a new lead
  const [dragOver, setDragOver] = useState(null)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const [busy, setBusy] = useState(false)
  const [toast, showToast] = useToast()
  const [params, setParams] = useSearchParams()
  const followUps = params.get('view') === 'followups' // sidebar "Follow-ups": open leads with a follow-up date

  const load = async () => {
    setLoading(true); setError('')
    try { setLeads(await listLeads()) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  useOpenOnParam('new', () => setPanel({ stage: 'new' }))
  useOpenOnParam('lead', (id) => { const lead = leads.find(l => l.id === id); if (lead) setPanel({ lead }) }, !loading)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads.filter(l => (!source || l.source === source) &&
      (!followUps || (l.next_follow_up && !['won', 'lost'].includes(l.stage))) &&
      (!q || [l.name, l.company, l.phone, l.email, l.city].some(v => v?.toLowerCase().includes(q))))
  }, [leads, query, source, followUps])

  const stats = useMemo(() => pipelineStats(leads), [leads])
  const today = new Date().toISOString().slice(0, 10)

  const moveTo = async (lead, stage) => {
    if (lead.stage === stage) return
    const patch = { stage }
    if (stage === 'lost') {
      const reason = prompt(`Why was "${lead.name}" lost? (optional)`)
      if (reason === null) return
      patch.lost_reason = reason || null
    }
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, ...patch } : l))
    try {
      const saved = await updateLead(lead.id, patch)
      setLeads(ls => ls.map(l => l.id === saved.id ? saved : l))
      if (stage === 'won' && !saved.client_id && confirm(`"${lead.name}" is won. Create a client from this lead now?`)) {
        const clientId = await convertLead(saved.id)
        setLeads(ls => ls.map(l => l.id === saved.id ? { ...l, client_id: clientId } : l))
      }
    } catch (err) { setError(err.message); load() }
  }

  const onDragStart = (e, lead) => { e.dataTransfer.setData('text/plain', lead.id); e.dataTransfer.effectAllowed = 'move' }
  const onDrop = (e, stage) => {
    e.preventDefault(); setDragOver(null)
    const lead = leads.find(l => l.id === e.dataTransfer.getData('text/plain'))
    if (lead) moveTo(lead, stage)
  }

  // ---- bulk select ----
  const toggle = (lead) => setSelected(sel => { const next = new Set(sel); next.has(lead.id) ? next.delete(lead.id) : next.add(lead.id); return next })
  const setMany = (items, on) => setSelected(sel => { const next = new Set(sel); items.forEach(l => on ? next.add(l.id) : next.delete(l.id)); return next })
  const stopSelecting = () => { setSelecting(false); setSelected(new Set()) }
  useEffect(() => {
    if (!selecting) return
    const onKey = e => { if (e.key === 'Escape' && !panel) stopSelecting() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selecting, panel])
  // Only leads still on screen count, so a filter change can't act on hidden ones.
  const chosen = visible.filter(l => selected.has(l.id))

  const bulkUpdate = async (fields, done) => {
    const targets = chosen
    if (!targets.length) return
    setBusy(true); setError('')
    try {
      const saved = await updateLeads(targets.map(l => l.id), fields)
      const byId = Object.fromEntries(saved.map(l => [l.id, l]))
      setLeads(ls => ls.map(l => byId[l.id] || l))
      setSelected(new Set())
      // Undo puts each lead's old values back, grouped so leads that shared a value go in one request.
      const groups = {}
      for (const l of targets) {
        const before = Object.fromEntries(Object.keys(fields).map(k => [k, l[k] ?? null]))
        ;(groups[JSON.stringify(before)] ||= []).push(l.id)
      }
      showToast({
        text: `${done} ${targets.length} lead${targets.length === 1 ? '' : 's'}`,
        undo: async () => {
          try { for (const [before, ids] of Object.entries(groups)) await updateLeads(ids, JSON.parse(before)) }
          catch (err) { setError(err.message) }
          load()
        },
      })
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  const bulkStage = (stage) => {
    const fields = { stage }
    if (stage === 'lost') {
      const reason = prompt(`Why were these ${chosen.length} leads lost? (optional)`)
      if (reason === null) return
      fields.lost_reason = reason || null
    }
    bulkUpdate(fields, `Moved to ${LEAD_STAGES.find(s => s.id === stage)?.label}:`)
  }
  const plus = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }

  const bulkDelete = async () => {
    const n = chosen.length
    if (!n || !confirm(`Delete ${n} lead${n === 1 ? '' : 's'} and their timeline? This can't be undone.`)) return
    setBusy(true); setError('')
    try {
      const ids = new Set(chosen.map(l => l.id))
      await deleteLeads([...ids])
      setLeads(ls => ls.filter(l => !ids.has(l.id)))
      setSelected(new Set())
      showToast({ text: `Deleted ${n} lead${n === 1 ? '' : 's'}` })
    } catch (err) { setError(err.message); load() }
    finally { setBusy(false) }
  }

  const pipelineText = Object.keys(stats.pipeline).length
    ? Object.entries(stats.pipeline).map(([cur, v]) => formatMoney(v, cur)).join(' + ')
    : formatMoney(0)

  return (
    <AdminLayout>
      <PageHead title={followUps ? 'Follow-ups' : 'Leads'} sub={followUps ? 'Open leads with a follow-up date' : 'Your sales pipeline'}>
        <button type="button" onClick={() => selecting ? stopSelecting() : setSelecting(true)} aria-pressed={selecting}
          className={`btn ${selecting ? '!bg-slate-100 !border-slate-300' : ''}`}>
          {selecting ? <><X /> Done selecting</> : <><CheckSquare /> Select</>}
        </button>
        <button onClick={() => setPanel({ stage: 'new' })} className="btn btn-primary">
          <Plus /> New lead
        </button>
      </PageHead>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <Stat label="Open">{stats.open}</Stat>
        <Stat label="Pipeline">{pipelineText}</Stat>
        <Stat label="Won this month">{stats.wonThisMonth}</Stat>
        <Stat label="Win rate (month)">{stats.winRate}%</Stat>
        <Stat label="Follow-ups due">{stats.followUpsDue}</Stat>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <label className="input-group flex-1 sm:max-w-sm">
          <Search aria-hidden="true" />
          <span className="sr-only">Search leads</span>
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, company, phone, city…" className="input" />
        </label>
        <select value={source} onChange={e => setSource(e.target.value)} aria-label="Source" className="input sm:!w-44">
          <option value="" className="bg-black">All sources</option>
          {LEAD_SOURCES.map(s => <option key={s.id} value={s.id} className="bg-black">{s.label}</option>)}
        </select>
        <button type="button" aria-pressed={followUps}
          onClick={() => { const next = new URLSearchParams(params); followUps ? next.delete('view') : next.set('view', 'followups'); setParams(next) }}
          className={`btn h-9 ${followUps ? '!bg-[var(--primary)] !border-[var(--primary)] !text-[var(--primary-fg)]' : ''}`}>
          Follow-ups only
        </button>
        <button onClick={load} className="btn btn-ghost h-9 text-slate-600">
          <RefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-3 rounded-ui border border-[var(--red-bd)] bg-[var(--red-bg)] px-4 py-2.5 text-[13px] text-[var(--red)]">
          {error}<button type="button" onClick={load} className="btn btn-sm ml-auto">Try again</button>
        </div>
      )}

      <div className={`flex gap-3 overflow-x-auto -mx-1 px-1 ${selecting ? 'pb-28' : 'pb-4'}`}>
        {LEAD_STAGES.map(stage => {
          const items = visible.filter(l => l.stage === stage.id)
          return (
            <section key={stage.id}
              onDragOver={e => { e.preventDefault(); setDragOver(stage.id) }}
              onDragLeave={() => setDragOver(d => d === stage.id ? null : d)}
              onDrop={e => onDrop(e, stage.id)}
              className={`w-72 flex-shrink-0 rounded-ui-lg border border-slate-200 bg-slate-100/70 p-3 min-h-[420px] transition-shadow ${dragOver === stage.id ? 'ring-2 ring-[var(--ring)]' : ''}`}>
              <header className="flex items-center gap-2 mb-3">
                {selecting && items.length > 0 ? (
                  <input type="checkbox" aria-label={`Select all leads in ${stage.label}`} className="h-4 w-4 accent-[var(--primary)]"
                    checked={items.every(l => selected.has(l.id))}
                    ref={el => { if (el) el.indeterminate = items.some(l => selected.has(l.id)) && !items.every(l => selected.has(l.id)) }}
                    onChange={e => setMany(items, e.target.checked)} />
                ) : <span className={`w-2 h-2 rounded-full ${stage.dot}`} />}
                <h2 className="text-[13px] font-semibold text-slate-900">{stage.label}</h2>
                <span className="count">{items.length}</span>
                <button onClick={() => setPanel({ stage: stage.id })} className="icon-act ml-auto hover:!bg-white" aria-label={`Add lead to ${stage.label}`}>
                  <Plus size={16} />
                </button>
              </header>
              <div className="space-y-2">
                {items.map(l => <LeadCard key={l.id} lead={l} today={today} onOpen={lead => setPanel({ lead })} onDragStart={onDragStart}
                  selecting={selecting} selected={selected.has(l.id)} onToggle={toggle} />)}
                {loading && items.length === 0 && [0, 1].map(i => <div key={i} className="skel h-20" />)}
                {!loading && items.length === 0 && <p className="text-[12px] text-slate-500 text-center py-6">No leads</p>}
              </div>
            </section>
          )
        })}
      </div>

      {selecting && (
        <div role="toolbar" aria-label="Bulk actions"
          className="fixed bottom-4 left-1/2 lg:left-[calc(50%+124px)] z-40 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl flex flex-wrap items-center gap-2 rounded-ui-lg border border-slate-200 bg-white px-3 py-2.5 shadow-ui-lg">
          <span className="text-[13px] font-medium text-slate-900 tabular-nums px-1">{chosen.length} selected</span>
          <button type="button" onClick={() => setMany(visible, chosen.length < visible.length)} className="btn btn-ghost btn-sm">
            {chosen.length < visible.length ? `Select all ${visible.length}` : 'Clear'}
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <Menu up align="right" width="w-48" trigger={({ open, toggle: t }) => (
              <button type="button" onClick={t} disabled={!chosen.length || busy} aria-haspopup="menu" aria-expanded={open} className="act gap-1 disabled:opacity-40"><ArrowRightLeft size={13} /> Move to <ChevronDown size={12} /></button>
            )}>
              {LEAD_STAGES.filter(s => s.id !== 'won').map(s => <MenuItem key={s.id} onClick={() => bulkStage(s.id)}>{s.label}</MenuItem>)}
              <p className="px-2.5 py-1.5 text-[11px] text-slate-400">Mark leads Won one at a time, so each becomes a client.</p>
            </Menu>
            <Menu up align="right" width="w-52" trigger={({ open, toggle: t }) => (
              <button type="button" onClick={t} disabled={!chosen.length || busy} aria-haspopup="menu" aria-expanded={open} className="act gap-1 disabled:opacity-40"><CalendarClock size={13} /> Follow-up <ChevronDown size={12} /></button>
            )}>
              <MenuItem onClick={() => bulkUpdate({ next_follow_up: plus(1) }, 'Follow-up set to tomorrow for')}>Tomorrow</MenuItem>
              <MenuItem onClick={() => bulkUpdate({ next_follow_up: plus(7) }, 'Follow-up set to next week for')}>Next week</MenuItem>
              <label className="pop-item justify-between" onClick={e => e.stopPropagation()}>
                Pick a date
                <input type="date" min={plus(0)} className="text-[12px] text-slate-700 bg-transparent"
                  onChange={e => e.target.value && bulkUpdate({ next_follow_up: e.target.value }, `Follow-up set to ${e.target.value} for`)} />
              </label>
              <MenuItem onClick={() => bulkUpdate({ next_follow_up: null }, 'Follow-up cleared for')}>Clear follow-up</MenuItem>
            </Menu>
            <Menu up align="right" width="w-44" trigger={({ open, toggle: t }) => (
              <button type="button" onClick={t} disabled={!chosen.length || busy} aria-haspopup="menu" aria-expanded={open} className="act gap-1 disabled:opacity-40"><Tag size={13} /> Source <ChevronDown size={12} /></button>
            )}>
              {LEAD_SOURCES.map(s => <MenuItem key={s.id} onClick={() => bulkUpdate({ source: s.id }, `Source set to ${s.label} for`)}>{s.label}</MenuItem>)}
            </Menu>
            <button type="button" onClick={bulkDelete} disabled={!chosen.length || busy}
              className="act gap-1 !border-[var(--red-bd)] !text-[var(--red)] hover:!bg-[var(--red-bg)] disabled:opacity-40"><Trash2 size={13} /> Delete</button>
          </div>
        </div>
      )}
      {toast}

      {panel && (
        <LeadPanel
          lead={panel.lead}
          defaultStage={panel.stage}
          onClose={() => setPanel(null)}
          onSaved={(saved, isNew) => { setLeads(ls => isNew ? [saved, ...ls] : ls.map(l => l.id === saved.id ? saved : l)); setPanel(null) }}
          onDeleted={(id) => { setLeads(ls => ls.filter(l => l.id !== id)); setPanel(null) }}
        />
      )}
    </AdminLayout>
  )
}
