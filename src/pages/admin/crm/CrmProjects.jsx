import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, CalendarClock, ExternalLink, LayoutGrid } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { ProjectForm } from './Forms'
import useOpenOnParam from '../../../hooks/useOpenOnParam'
import { MoneyTile, fmtDate } from './Lists'
import { useAuth } from '../../../contexts/AuthContext'
import {
  PROJECT_STAGES, createPmBoard, deleteProject, formatMoney, isoDay, listClients, listPayments, listProjects,
  moneySummary, updateProject,
} from '../../../lib/crmService'

export default function CrmProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null) // { item? }
  const [dragOver, setDragOver] = useState(null)
  useOpenOnParam('new', () => setModal({}), !loading)

  const load = async () => {
    setError('')
    try {
      const [pr, cl, pa] = await Promise.all([listProjects(), listClients(), listPayments()])
      setProjects(pr); setClients(cl); setPayments(pa)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const clientsById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients])
  const paidByProject = useMemo(() => {
    const out = {}
    for (const p of payments) if (p.project_id && p.status === 'received') out[p.project_id] = (out[p.project_id] || 0) + Number(p.amount)
    return out
  }, [payments])
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter(p => !q || [p.name, p.service, clientsById[p.client_id]?.name, clientsById[p.client_id]?.company].some(v => v?.toLowerCase().includes(q)))
  }, [projects, query, clientsById])
  const money = useMemo(() => moneySummary(projects, payments.filter(p => p.project_id)), [projects, payments])
  const today = isoDay()

  const move = async (project, stage) => {
    if (project.stage === stage) return
    setProjects(ps => ps.map(p => p.id === project.id ? { ...p, stage } : p))
    try { const saved = await updateProject(project.id, { stage }); setProjects(ps => ps.map(p => p.id === saved.id ? saved : p)) }
    catch (err) { setError(err.message); load() }
  }
  const onDrop = (e, stage) => {
    e.preventDefault(); setDragOver(null)
    const p = projects.find(x => x.id === e.dataTransfer.getData('text/plain'))
    if (p) move(p, stage)
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="mr-auto">
          <h1 className="font-display font-bold text-lg text-white">Projects</h1>
          <p className="text-xs text-white/40">Client projects, budgets and delivery</p>
        </div>
        <button onClick={() => setModal({})} disabled={!clients.length} title={clients.length ? '' : 'Add a client first'} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl disabled:opacity-50">
          <Plus size={13} /> New project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <MoneyTile label="Ongoing" sums={String(projects.filter(p => p.stage === 'ongoing').length)} hint={`${projects.filter(p => p.stage === 'new').length} new · ${projects.filter(p => p.stage === 'completed').length} completed`} />
        <MoneyTile label="Total budget" sums={money.budget} />
        <MoneyTile label="Paid" sums={money.paid} tone="text-emerald-600" />
        <MoneyTile label="Still to collect" sums={money.balance} tone="text-orange-600" />
      </div>

      <div className="flex items-center gap-2 glass rounded-xl px-3 mb-4">
        <Search size={13} className="text-white/30" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects or clients…" className="flex-1 bg-transparent py-2 text-sm text-white placeholder-white/30 focus:outline-none" />
      </div>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
      {!loading && !clients.length && <div className="glass rounded-2xl p-6 text-center text-sm text-white/50 mb-4">Add or convert a client first, then create their projects here.</div>}

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        {PROJECT_STAGES.map(stage => {
          const items = visible.filter(p => p.stage === stage.id)
          return (
            <section key={stage.id} onDragOver={e => { e.preventDefault(); setDragOver(stage.id) }} onDragLeave={() => setDragOver(d => d === stage.id ? null : d)} onDrop={e => onDrop(e, stage.id)}
              className={`w-72 flex-shrink-0 rounded-2xl border p-3 min-h-[360px] ${stage.tint} ${dragOver === stage.id ? 'ring-2 ring-orange-400' : ''}`}>
              <header className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <h2 className="text-sm font-semibold text-white">{stage.label}</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white text-white/50">{items.length}</span>
              </header>
              <div className="space-y-2">
                {items.map(p => {
                  const client = clientsById[p.client_id]
                  const paid = paidByProject[p.id] || 0
                  const pct = Number(p.budget) > 0 ? Math.min(100, Math.round((paid / Number(p.budget)) * 100)) : 0
                  const late = p.due_date && p.due_date < today && !['completed', 'cancelled'].includes(p.stage)
                  return (
                    <div key={p.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', p.id)} onClick={() => setModal({ item: p })}
                      className="bg-[var(--surface)] rounded-xl p-3 shadow-sm border border-black/[0.04] cursor-pointer hover:shadow-md transition-shadow">
                      <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                      <p className="text-[11px] text-white/50 truncate">{client?.name}{client?.company ? ` · ${client.company}` : ''}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-black/[0.06] overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                      <p className="mt-1 text-[11px] text-white/50">{formatMoney(paid, p.currency)} of {formatMoney(p.budget, p.currency)}</p>
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        {p.service && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{p.service}</span>}
                        {p.due_date && <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${late ? 'bg-red-50 text-red-600' : 'bg-white/[0.06] text-white/50'}`}><CalendarClock size={10} /> {fmtDate(p.due_date)}</span>}
                        {p.pm_project_id && <Link to={`/pm/projects/${p.pm_project_id}`} onClick={e => e.stopPropagation()} className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 flex items-center gap-1"><ExternalLink size={10} /> PM board</Link>}
                      </div>
                    </div>
                  )
                })}
                {!loading && items.length === 0 && <p className="text-[11px] text-white/30 text-center py-6">No projects</p>}
              </div>
            </section>
          )
        })}
      </div>

      {modal && (
        <ProjectForm project={modal.item} clients={clients} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }}
          extra={modal.item && (
            <>
              {!modal.item.pm_project_id && <button type="button" onClick={async () => { try { await createPmBoard(modal.item, clientsById[modal.item.client_id], user?.id); setModal(null); load() } catch (err) { setError(err.message) } }} className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-white/[0.06] text-white/70 hover:text-white"><LayoutGrid size={12} /> Create PM board</button>}
              <button type="button" onClick={async () => { if (!confirm(`Delete the project "${modal.item.name}"? Payments stay but are unlinked.`)) return; try { await deleteProject(modal.item.id); setModal(null); load() } catch (err) { setError(err.message) } }} className="text-xs px-3 py-2 rounded-xl text-white/40 hover:text-red-500 hover:bg-red-50">Delete</button>
            </>
          )} />
      )}
    </AdminLayout>
  )
}
