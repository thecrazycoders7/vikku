import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ExternalLink, LayoutGrid } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { ProjectForm } from './Forms'
import useOpenOnParam from '../../../hooks/useOpenOnParam'
import usePmBoards from './usePmBoards'
import { MoneyTile, fmtDate } from './Lists'
import { useAuth } from '../../../contexts/AuthContext'
import { Badge, EmptyState, PageHead } from '../ui'
import {
  PROJECT_STAGES, createPmBoard, deleteProject, formatMoney, isoDay, listClients, listPayments, listProjects,
  moneySummary, updateProject,
} from '../../../lib/crmService'

// Creates the project's board in Vikku PM, then turns into a link to it (the dialog stays open).
function PmBoardButton({ project, client, userId, onLinked }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (project.pm_project_id) {
    return (
      <Link to={`/pm/projects/${project.pm_project_id}`} className="btn">
        <ExternalLink /> Open PM board
      </Link>
    )
  }
  const create = async () => {
    setBusy(true); setError('')
    try { onLinked(await createPmBoard(project, client, userId)) }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return (
    <>
      <button type="button" onClick={create} disabled={busy} className="btn">
        <LayoutGrid /> {busy ? 'Creating…' : 'Create PM board'}
      </button>
      {error && <p role="alert" className="basis-full order-last text-[12.5px] text-[var(--red)]">{error}</p>}
    </>
  )
}

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
  const boards = usePmBoards(projects)

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
      <PageHead title="Projects" sub="Client projects, budgets and delivery">
        <button onClick={() => setModal({})} disabled={!clients.length} title={clients.length ? '' : 'Add a client first'} className="btn btn-primary">
          <Plus /> New project
        </button>
      </PageHead>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MoneyTile label="Ongoing" sums={String(projects.filter(p => p.stage === 'ongoing').length)} hint={`${projects.filter(p => p.stage === 'new').length} new · ${projects.filter(p => p.stage === 'completed').length} completed`} />
        <MoneyTile label="Total budget" sums={money.budget} />
        <MoneyTile label="Paid" sums={money.paid} tone="!text-[var(--green)]" />
        <MoneyTile label="Still to collect" sums={money.balance} />
      </div>

      <label className="input-group mb-4 sm:max-w-sm">
        <Search aria-hidden="true" />
        <span className="sr-only">Search projects or clients</span>
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects or clients…" className="input" />
      </label>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-3 rounded-ui border border-[var(--red-bd)] bg-[var(--red-bg)] px-4 py-2.5 text-[13px] text-[var(--red)]">
          {error}<button type="button" onClick={load} className="btn btn-sm ml-auto">Try again</button>
        </div>
      )}
      {!loading && !clients.length && <div className="card mb-4"><EmptyState title="No clients yet">Add or convert a client first, then create their projects here.</EmptyState></div>}

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        {PROJECT_STAGES.map(stage => {
          const items = visible.filter(p => p.stage === stage.id)
          return (
            <section key={stage.id} onDragOver={e => { e.preventDefault(); setDragOver(stage.id) }} onDragLeave={() => setDragOver(d => d === stage.id ? null : d)} onDrop={e => onDrop(e, stage.id)}
              className={`w-72 flex-shrink-0 rounded-ui-lg border border-slate-200 bg-slate-100/70 p-3 min-h-[360px] ${dragOver === stage.id ? 'ring-2 ring-[var(--ring)]' : ''}`}>
              <header className="flex items-center gap-2 mb-3">
                <span aria-hidden="true" className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <h2 className="text-[13px] font-semibold text-slate-900">{stage.label}</h2>
                <span className="count">{items.length}</span>
              </header>
              <div className="space-y-2">
                {items.map(p => {
                  const client = clientsById[p.client_id]
                  const paid = paidByProject[p.id] || 0
                  const pct = Number(p.budget) > 0 ? Math.min(100, Math.round((paid / Number(p.budget)) * 100)) : 0
                  const late = p.due_date && p.due_date < today && !['completed', 'cancelled'].includes(p.stage)
                  return (
                    <div key={p.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', p.id)} onClick={() => setModal({ item: p })}
                      className="bg-white rounded-ui p-3 shadow-ui-sm border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                      <p className="text-[13px] font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[12px] text-slate-500 truncate">{client?.name}{client?.company ? ` · ${client.company}` : ''}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-[var(--green)]" style={{ width: `${pct}%` }} /></div>
                      <p className="mt-1 text-[12px] text-slate-500 tabular-nums">{formatMoney(paid, p.currency)} of {formatMoney(p.budget, p.currency)}</p>
                      {boards[p.pm_project_id] && (
                        <div className="mt-2" title="Tasks done on the linked Vikku PM board">
                          <div className="h-1 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-[var(--series-1)]" style={{ width: `${boards[p.pm_project_id].progress}%` }} /></div>
                          <p className="mt-1 text-[12px] text-slate-500 tabular-nums">Work {boards[p.pm_project_id].progress}% · {boards[p.pm_project_id].done}/{boards[p.pm_project_id].total} tasks</p>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        {p.service && <Badge tone="blue">{p.service}</Badge>}
                        {p.due_date && <Badge tone={late ? 'red' : 'slate'}><span className="tabular-nums">{late ? 'Late · ' : 'Due '}{fmtDate(p.due_date)}</span></Badge>}
                        {p.pm_project_id && <Link to={`/pm/projects/${p.pm_project_id}`} onClick={e => e.stopPropagation()} className="icon-act ml-auto" aria-label={`PM board for ${p.name}`} title="PM board"><ExternalLink size={15} /></Link>}
                      </div>
                    </div>
                  )
                })}
                {loading && [0, 1].map(i => <div key={i} className="skel h-24" />)}
                {!loading && items.length === 0 && <p className="text-[12px] text-slate-500 text-center py-6">No projects</p>}
              </div>
            </section>
          )
        })}
      </div>

      {modal && (
        <ProjectForm project={modal.item} clients={clients} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }}
          extra={modal.item && (
            <>
              <PmBoardButton project={modal.item} client={clientsById[modal.item.client_id]} userId={user?.id}
                onLinked={(saved) => { setModal({ item: saved }); load() }} />
              <button type="button" onClick={async () => { if (!confirm(`Delete the project "${modal.item.name}"? Payments stay but are unlinked.`)) return; try { await deleteProject(modal.item.id); setModal(null); load() } catch (err) { setError(err.message) } }} className="btn btn-ghost text-[var(--red)] hover:!bg-[var(--red-bg)]">Delete</button>
            </>
          )} />
      )}
    </AdminLayout>
  )
}
