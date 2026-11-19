import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Pencil, Trash2, MessageCircle, Globe2, Plus, ExternalLink, LayoutGrid, Link2 } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import ClientForm from './ClientForm'
import Timeline from './Timeline'
import { PaymentForm, ProjectForm, RetainerForm } from './Forms'
import { MoneyTile, PaymentRows, RetainerRows, fmtDate } from './Lists'
import { useAuth } from '../../../contexts/AuthContext'
import usePmBoards from './usePmBoards'
import { Badge, EmptyState, ErrorState, Skeleton, useToast } from '../ui'
import {
  PROJECT_STAGES, createPmBoard, deleteClient, deletePayment, deleteProject, formatMoney, getClient, listClientDocs, listPayments,
  listProjects, listRetainers, moneySummary, moneyText, isoDay, pmShareLink, recordRetainerMonth, updatePayment, whatsappNumber,
} from '../../../lib/crmService'

const TABS = ['Timeline', 'Projects', 'Payments', 'Documents']
export const STAGE_TONE = { new: 'violet', ongoing: 'green', completed: 'blue', cancelled: 'red' } // same colours as the project stage dots

export default function CrmClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [client, setClient] = useState(null)
  const [projects, setProjects] = useState([])
  const [payments, setPayments] = useState([])
  const [retainers, setRetainers] = useState([])
  const [docs, setDocs] = useState([])
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Timeline')
  const [modal, setModal] = useState(null) // { type: 'client'|'project'|'payment'|'retainer', item? }
  const [timelineKey, setTimelineKey] = useState(0)
  const boards = usePmBoards(projects)
  const [toast, showToast] = useToast()
  // The PM board's read-only client view, to send the client by WhatsApp or email.
  const copyShare = async (token, name) => {
    const url = pmShareLink(token)
    try { await navigator.clipboard.writeText(url); showToast({ text: `Progress link for ${name} copied` }) }
    catch { prompt('Copy this link for your client:', url) }
  }

  const loadMoney = async () => {
    const [pr, pa, re] = await Promise.all([listProjects({ clientId: id }), listPayments({ clientId: id }), listRetainers({ clientId: id })])
    setProjects(pr); setPayments(pa); setRetainers(re)
    setTimelineKey(k => k + 1)
  }
  useEffect(() => {
    getClient(id).then(setClient).catch(e => setError(e.message))
    loadMoney().catch(e => setError(e.message))
    listClientDocs({ clientId: id }).then(setDocs).catch(() => setDocs([]))
  }, [id])

  const money = useMemo(() => moneySummary(projects, payments), [projects, payments])
  const paidByProject = useMemo(() => {
    const out = {}
    for (const p of payments) if (p.project_id && p.status === 'received') out[p.project_id] = (out[p.project_id] || 0) + Number(p.amount)
    return out
  }, [payments])
  const projectsById = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects])

  const run = async (fn) => { setError(''); try { await fn(); await loadMoney() } catch (err) { setError(err.message) } }
  const closeAndReload = () => { setModal(null); run(async () => {}) }

  const removeClient = async () => {
    if (!confirm(`Delete the client "${client.name}"? Their projects, payments, retainers and timeline are deleted too; the original lead stays.`)) return
    try { await deleteClient(client.id); navigate('/admin/crm/clients') }
    catch (err) { setError(err.message) }
  }

  const wa = whatsappNumber(client?.phone)

  return (
    <AdminLayout>
      <button onClick={() => navigate('/admin/crm/clients')} className="btn btn-ghost btn-sm -ml-2 mb-3 text-slate-600">
        <ArrowLeft size={14} /> Back to clients
      </button>

      {error && client && (
        <div role="alert" className="mb-4 rounded-ui border border-[var(--red-bd)] bg-[var(--red-bg)] px-4 py-2.5 text-[13px] text-[var(--red)]">{error}</div>
      )}
      {!client ? (
        error ? <div className="card"><ErrorState title="Couldn't load this client" onRetry={() => location.reload()}>{error}</ErrorState></div>
          : <div className="card p-4"><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="mt-3 h-5 w-48" /><Skeleton className="mt-2 h-3 w-72 max-w-full" /></div>
      ) : (
        <>
          <div className="card p-4 sm:p-5 mb-4">
            <div className="flex flex-wrap items-start gap-4">
              <span aria-hidden="true" className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 font-semibold text-lg flex items-center justify-center flex-shrink-0">{client.name.trim()[0]?.toUpperCase()}</span>
              <div className="flex-1 min-w-0">
                <h1 className="text-[20px] leading-7 font-semibold tracking-[-.02em] text-slate-900">{client.name}</h1>
                {client.company && <p className="text-[13px] text-slate-500">{client.company}</p>}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-slate-600">
                  {client.phone && <span className="flex items-center gap-1.5 tabular-nums"><Phone size={14} aria-hidden="true" className="text-slate-400" /> {client.phone}</span>}
                  {client.email && <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:underline"><Mail size={14} aria-hidden="true" className="text-slate-400" /> {client.email}</a>}
                  {(client.city || client.country) && <span className="flex items-center gap-1.5"><MapPin size={14} aria-hidden="true" className="text-slate-400" /> {[client.city, client.country].filter(Boolean).join(', ')}</span>}
                  <span className="flex items-center gap-1.5"><Globe2 size={14} aria-hidden="true" className="text-slate-400" /> Billed in {client.currency}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn"><MessageCircle /> WhatsApp</a>}
                <button onClick={() => setModal({ type: 'client' })} className="btn btn-icon" aria-label="Edit client" title="Edit client"><Pencil /></button>
                <button onClick={removeClient} className="btn btn-icon hover:!text-[var(--red)] hover:!bg-[var(--red-bg)]" aria-label="Delete client" title="Delete client"><Trash2 /></button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-2">
              <Badge tone={client.status === 'active' ? 'green' : 'slate'}>{client.status === 'active' ? 'Active' : 'Past'}</Badge>
              {client.lead_id && <Badge tone="violet">Converted from a lead</Badge>}
              <Badge tone="slate">Client since {fmtDate(client.created_at)}</Badge>
              {client.gst_number && <Badge tone="slate">GST {client.gst_number}</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <MoneyTile label="Budget" sums={money.budget} hint={`${projects.filter(p => p.stage !== 'cancelled').length} project(s)`} />
            <MoneyTile label="Paid" sums={money.paid} tone="!text-[var(--green)]" />
            <MoneyTile label="Balance" sums={money.balance} />
          </div>

          <div role="tablist" aria-label="Client sections" className="flex gap-0.5 border-b border-slate-200 mb-4 overflow-x-auto">
            {TABS.map(t => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={`h-[38px] px-3 text-[14px] font-medium border-b-2 -mb-px whitespace-nowrap inline-flex items-center gap-1.5 transition-colors ${tab === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
                {t}{t !== 'Timeline' && <span className="count !h-[18px] !min-w-[18px] !font-medium !text-slate-500 !bg-slate-100">{t === 'Projects' ? projects.length : t === 'Payments' ? payments.length : docs.length}</span>}
              </button>
            ))}
          </div>

          {tab === 'Documents' && (
            <section className="card">
              <header className="card-head">
                <h2>Documents</h2>
                <div className="right"><Link to={`/admin/documents?client=${id}`} className="btn btn-sm"><Plus size={14} /> New document</Link></div>
              </header>
              {docs.length === 0 ? <EmptyState title="No documents yet">Pick a template to make the first one.</EmptyState> : (
                <ul className="divide-y divide-slate-200">
                  {docs.map(d => (
                    <li key={d.id}><Link to={`/admin/documents/${d.id}`} className="flex items-center justify-between gap-3 px-4 h-12 text-[13px] font-medium text-slate-900 hover:bg-slate-100">
                      <span className="min-w-0 truncate">{d.title}</span><span className="flex-none text-[12px] font-normal text-slate-500 tabular-nums">{fmtDate(d.updated_at)}</span>
                    </Link></li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {tab === 'Timeline' && (
            <div className="grid lg:grid-cols-3 gap-4">
              <section className="card p-4 lg:col-span-2"><h2 className="section-title">Timeline</h2><Timeline key={timelineKey} clientId={client.id} leadId={client.lead_id} /></section>
              <section className="card p-4 space-y-3 text-[13px] h-fit">
                <h2 className="section-title !mb-0">Details</h2>
                <p><span className="text-[12px] text-slate-500">Address</span><br /><span className="text-slate-900">{client.address || 'Not added'}</span></p>
                <p><span className="text-[12px] text-slate-500">Notes</span><br /><span className="text-slate-900 whitespace-pre-wrap">{client.notes || 'No notes'}</span></p>
              </section>
            </div>
          )}

          {tab === 'Projects' && (
            <section className="card">
              <header className="card-head">
                <h2>Projects</h2>
                <div className="right"><button onClick={() => setModal({ type: 'project' })} className="btn btn-primary btn-sm"><Plus size={14} /> New project</button></div>
              </header>
              {projects.length === 0 ? <EmptyState title="No projects yet" /> : (
                <div className="divide-y divide-slate-200 px-4">
                  {projects.map(p => {
                    const stage = PROJECT_STAGES.find(s => s.id === p.stage)
                    return (
                      <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                        <button onClick={() => setModal({ type: 'project', item: p })} className="min-w-0 flex-1 text-left">
                          <p className="text-[14px] font-semibold text-slate-900 flex items-center gap-2 hover:underline">{p.name}
                            <Badge tone={STAGE_TONE[p.stage]}>{stage?.label}</Badge>
                          </p>
                          <p className="text-[12px] text-slate-500 tabular-nums">{[p.service, p.due_date && `Due ${fmtDate(p.due_date)}`].filter(Boolean).join(' · ')}</p>
                        </button>
                        <p className="text-[12.5px] text-slate-600 tabular-nums">{formatMoney(paidByProject[p.id] || 0, p.currency)} of {formatMoney(p.budget, p.currency)} paid</p>
                        {boards[p.pm_project_id] && <p className="text-[12.5px] text-slate-600 tabular-nums" title="Tasks done on the linked Vikku PM board">Work {boards[p.pm_project_id].progress}% · {boards[p.pm_project_id].done}/{boards[p.pm_project_id].total} tasks</p>}
                        {boards[p.pm_project_id]?.share_token && (
                          <button onClick={() => copyShare(boards[p.pm_project_id].share_token, p.name)} title="Copy the read-only progress link for this client"
                            className="act"><Link2 size={14} /> Client progress link</button>
                        )}
                        {p.pm_project_id
                          ? <Link to={`/pm/projects/${p.pm_project_id}`} className="act"><ExternalLink size={14} /> PM board</Link>
                          : <button onClick={() => run(() => createPmBoard(p, client, user?.id))} className="act"><LayoutGrid size={14} /> Create PM board</button>}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {tab === 'Payments' && (
            <div className="space-y-4">
              <section className="card">
                <header className="card-head">
                  <h2>Payments <span className="font-normal text-slate-500 tabular-nums">· {moneyText(money.paid)} received</span></h2>
                  <div className="right"><button onClick={() => setModal({ type: 'payment' })} className="btn btn-primary btn-sm"><Plus size={14} /> Record payment</button></div>
                </header>
                <div className="px-4"><PaymentRows payments={payments} projectsById={projectsById}
                  onReceived={p => run(() => updatePayment(p.id, { status: 'received', paid_on: isoDay() }))}
                  onEdit={p => setModal({ type: 'payment', item: p })}
                  onDelete={p => confirm(`Delete this ${formatMoney(p.amount, p.currency)} payment?`) && run(() => deletePayment(p.id))} /></div>
              </section>
              <section className="card">
                <header className="card-head">
                  <h2>Retainers</h2>
                  <div className="right"><button onClick={() => setModal({ type: 'retainer' })} className="btn btn-sm"><Plus size={14} /> New retainer</button></div>
                </header>
                <div className="px-4"><RetainerRows retainers={retainers} onRecord={r => run(() => recordRetainerMonth(r))} onEdit={r => setModal({ type: 'retainer', item: r })} /></div>
              </section>
            </div>
          )}
        </>
      )}

      {modal?.type === 'client' && <ClientForm client={client} onClose={() => setModal(null)} onSaved={(c) => { setClient(c); setModal(null) }} />}
      {modal?.type === 'project' && (
        <ProjectForm project={modal.item} clients={[client]} clientId={client.id} onClose={() => setModal(null)} onSaved={closeAndReload}
          extra={modal.item && <button type="button" onClick={() => confirm(`Delete the project "${modal.item.name}"? Payments stay but are unlinked.`) && (setModal(null), run(() => deleteProject(modal.item.id)))} className="btn btn-ghost text-[var(--red)] hover:!bg-[var(--red-bg)]">Delete</button>} />
      )}
      {modal?.type === 'payment' && <PaymentForm payment={modal.item} clients={[client]} projects={projects} clientId={client.id} onClose={() => setModal(null)} onSaved={closeAndReload} />}
      {modal?.type === 'retainer' && <RetainerForm retainer={modal.item} clients={[client]} clientId={client.id} onClose={() => setModal(null)} onSaved={closeAndReload} />}
      {toast}
    </AdminLayout>
  )
}
