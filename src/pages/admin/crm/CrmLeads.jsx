import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Phone, MapPin, Building2, CalendarClock, MessageCircle, RefreshCw, CheckSquare, ChevronDown, Trash2, X, Tag, ArrowRightLeft } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import LeadPanel from './LeadPanel'
import useOpenOnParam from '../../../hooks/useOpenOnParam'
import { Menu, MenuItem, useToast } from '../ui'
import { LEAD_SOURCES, LEAD_STAGES, convertLead, deleteLeads, formatMoney, listLeads, pipelineStats, sourceLabel, updateLead, updateLeads, whatsappNumber } from '../../../lib/crmService'

function Stat({ label, children }) {
  return (
    <div className="glass rounded-xl px-4 py-2.5">
      <p className="text-[10px] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-white font-display">{children}</p>
    </div>
  )
}

function LeadCard({ lead, today, onOpen, onDragStart, selecting, selected, onToggle }) {
  const wa = whatsappNumber(lead.phone)
  const overdue = lead.next_follow_up && lead.next_follow_up <= today && !['won', 'lost'].includes(lead.stage)
  return (
    <div draggable={!selecting} onDragStart={e => onDragStart(e, lead)} onClick={() => selecting ? onToggle(lead) : onOpen(lead)}
      className={`bg-[var(--surface)] rounded-xl p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${selected ? 'border-orange-400 ring-2 ring-orange-200' : 'border-black/[0.04]'}`}>
      <div className="flex items-start justify-between gap-2">
        {selecting && <input type="checkbox" checked={selected} readOnly tabIndex={-1} aria-label={`Select ${lead.name}`} className="mt-0.5 h-4 w-4 flex-none accent-orange-600" />}
        <p className="flex-1 min-w-0 text-sm font-semibold text-white truncate">{lead.name}</p>
        {Number(lead.value) > 0 && <p className="text-xs font-semibold text-white flex-shrink-0">{formatMoney(lead.value, lead.currency)}</p>}
      </div>
      <div className="mt-1.5 space-y-1 text-[11px] text-white/50">
        {lead.company && <p className="flex items-center gap-1.5 truncate"><Building2 size={11} /> {lead.company}</p>}
        {(lead.phone || lead.city) && (
          <p className="flex items-center gap-3 flex-wrap">
            {lead.phone && <span className="flex items-center gap-1.5"><Phone size={11} /> {lead.phone}</span>}
            {lead.city && <span className="flex items-center gap-1.5"><MapPin size={11} /> {lead.city}</span>}
          </p>
        )}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{sourceLabel(lead.source)}</span>
        {lead.next_follow_up && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${overdue ? 'bg-red-50 text-red-600' : 'bg-white/[0.06] text-white/50'}`}>
            <CalendarClock size={10} /> {new Date(lead.next_follow_up).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
        )}
        {lead.client_id && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Client</span>}
        {wa && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 flex items-center gap-1" aria-label={`WhatsApp ${lead.name}`}>
            <MessageCircle size={10} /> WhatsApp
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
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="mr-auto">
          <h1 className="font-display font-bold text-lg text-white">{followUps ? 'Follow-ups' : 'Leads'}</h1>
          <p className="text-xs text-white/40">{followUps ? 'Open leads with a follow-up date' : 'Your sales pipeline'}</p>
        </div>
        <button type="button" onClick={() => selecting ? stopSelecting() : setSelecting(true)} aria-pressed={selecting}
          className={`flex items-center gap-1.5 text-xs font-medium px-3.5 py-2.5 rounded-xl border ${selecting ? 'border-orange-200 bg-orange-50 text-orange-800' : 'glass text-white/70 hover:text-white'}`}>
          {selecting ? <><X size={13} /> Done selecting</> : <><CheckSquare size={13} /> Select</>}
        </button>
        <button onClick={() => setPanel({ stage: 'new' })} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl">
          <Plus size={13} /> New lead
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        <Stat label="Open">{stats.open}</Stat>
        <Stat label="Pipeline">{pipelineText}</Stat>
        <Stat label="Won this month">{stats.wonThisMonth}</Stat>
        <Stat label="Win rate (month)">{stats.winRate}%</Stat>
        <Stat label="Follow-ups due">{stats.followUpsDue}</Stat>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 glass rounded-xl px-3">
          <Search size={13} className="text-white/30" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, company, phone, city…"
            className="flex-1 bg-transparent py-2 text-sm text-white placeholder-white/30 focus:outline-none" />
        </div>
        <select value={source} onChange={e => setSource(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm text-white bg-transparent focus:outline-none">
          <option value="" className="bg-black">All sources</option>
          {LEAD_SOURCES.map(s => <option key={s.id} value={s.id} className="bg-black">{s.label}</option>)}
        </select>
        <button type="button" aria-pressed={followUps}
          onClick={() => { const next = new URLSearchParams(params); followUps ? next.delete('view') : next.set('view', 'followups'); setParams(next) }}
          className={`rounded-xl px-3 py-2 text-xs font-medium border ${followUps ? 'border-orange-200 bg-orange-50 text-orange-800' : 'glass text-white/60 hover:text-white'}`}>
          Follow-ups only
        </button>
        <button onClick={load} className="flex items-center justify-center gap-1.5 text-xs text-white/50 hover:text-white px-3">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

      <div className={`flex gap-3 overflow-x-auto -mx-1 px-1 ${selecting ? 'pb-28' : 'pb-4'}`}>
        {LEAD_STAGES.map(stage => {
          const items = visible.filter(l => l.stage === stage.id)
          return (
            <section key={stage.id}
              onDragOver={e => { e.preventDefault(); setDragOver(stage.id) }}
              onDragLeave={() => setDragOver(d => d === stage.id ? null : d)}
              onDrop={e => onDrop(e, stage.id)}
              className={`w-72 flex-shrink-0 rounded-2xl border p-3 min-h-[420px] transition-shadow ${stage.tint} ${dragOver === stage.id ? 'ring-2 ring-orange-400' : ''}`}>
              <header className="flex items-center gap-2 mb-3">
                {selecting && items.length > 0 ? (
                  <input type="checkbox" aria-label={`Select all leads in ${stage.label}`} className="h-4 w-4 accent-orange-600"
                    checked={items.every(l => selected.has(l.id))}
                    ref={el => { if (el) el.indeterminate = items.some(l => selected.has(l.id)) && !items.every(l => selected.has(l.id)) }}
                    onChange={e => setMany(items, e.target.checked)} />
                ) : <span className={`w-2 h-2 rounded-full ${stage.dot}`} />}
                <h2 className="text-sm font-semibold text-white">{stage.label}</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white text-white/50">{items.length}</span>
                <button onClick={() => setPanel({ stage: stage.id })} className="ml-auto p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/60" aria-label={`Add lead to ${stage.label}`}>
                  <Plus size={14} />
                </button>
              </header>
              <div className="space-y-2">
                {items.map(l => <LeadCard key={l.id} lead={l} today={today} onOpen={lead => setPanel({ lead })} onDragStart={onDragStart}
                  selecting={selecting} selected={selected.has(l.id)} onToggle={toggle} />)}
                {!loading && items.length === 0 && <p className="text-[11px] text-white/30 text-center py-6">No leads</p>}
              </div>
            </section>
          )
        })}
      </div>

      {selecting && (
        <div role="toolbar" aria-label="Bulk actions"
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-lg shadow-slate-900/10">
          <span className="text-[13px] font-medium text-slate-900 tabular-nums px-1">{chosen.length} selected</span>
          <button type="button" onClick={() => setMany(visible, chosen.length < visible.length)} className="text-[12px] font-medium text-orange-700 hover:underline px-1">
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
              <label className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-700 hover:bg-slate-50" onClick={e => e.stopPropagation()}>
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
              className="act gap-1 !border-red-200 !text-red-700 hover:!bg-red-50 disabled:opacity-40"><Trash2 size={13} /> Delete</button>
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
