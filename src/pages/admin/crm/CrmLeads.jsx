import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Phone, MapPin, Building2, CalendarClock, MessageCircle, RefreshCw } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import LeadPanel from './LeadPanel'
import useOpenOnParam from '../../../hooks/useOpenOnParam'
import { LEAD_SOURCES, LEAD_STAGES, convertLead, formatMoney, listLeads, pipelineStats, sourceLabel, updateLead, whatsappNumber } from '../../../lib/crmService'

function Stat({ label, children }) {
  return (
    <div className="glass rounded-xl px-4 py-2.5">
      <p className="text-[10px] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-white font-display">{children}</p>
    </div>
  )
}

function LeadCard({ lead, today, onOpen, onDragStart }) {
  const wa = whatsappNumber(lead.phone)
  const overdue = lead.next_follow_up && lead.next_follow_up <= today && !['won', 'lost'].includes(lead.stage)
  return (
    <div draggable onDragStart={e => onDragStart(e, lead)} onClick={() => onOpen(lead)}
      className="bg-[var(--surface)] rounded-xl p-3 shadow-sm border border-black/[0.04] cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
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

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        {LEAD_STAGES.map(stage => {
          const items = visible.filter(l => l.stage === stage.id)
          return (
            <section key={stage.id}
              onDragOver={e => { e.preventDefault(); setDragOver(stage.id) }}
              onDragLeave={() => setDragOver(d => d === stage.id ? null : d)}
              onDrop={e => onDrop(e, stage.id)}
              className={`w-72 flex-shrink-0 rounded-2xl border p-3 min-h-[420px] transition-shadow ${stage.tint} ${dragOver === stage.id ? 'ring-2 ring-orange-400' : ''}`}>
              <header className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <h2 className="text-sm font-semibold text-white">{stage.label}</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white text-white/50">{items.length}</span>
                <button onClick={() => setPanel({ stage: stage.id })} className="ml-auto p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/60" aria-label={`Add lead to ${stage.label}`}>
                  <Plus size={14} />
                </button>
              </header>
              <div className="space-y-2">
                {items.map(l => <LeadCard key={l.id} lead={l} today={today} onOpen={lead => setPanel({ lead })} onDragStart={onDragStart} />)}
                {!loading && items.length === 0 && <p className="text-[11px] text-white/30 text-center py-6">No leads</p>}
              </div>
            </section>
          )
        })}
      </div>

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
