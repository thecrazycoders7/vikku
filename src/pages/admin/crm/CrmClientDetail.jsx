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
import { useToast } from '../ui'
import {
  PROJECT_STAGES, createPmBoard, deleteClient, deletePayment, deleteProject, formatMoney, getClient, listPayments,
  listProjects, listRetainers, moneySummary, moneyText, isoDay, pmShareLink, recordRetainerMonth, updatePayment, whatsappNumber,
} from '../../../lib/crmService'

const TABS = ['Timeline', 'Projects', 'Payments']

export default function CrmClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [client, setClient] = useState(null)
  const [projects, setProjects] = useState([])
  const [payments, setPayments] = useState([])
  const [retainers, setRetainers] = useState([])
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
      <button onClick={() => navigate('/admin/crm/clients')} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-4">
        <ArrowLeft size={13} /> Back to clients
      </button>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
      {!client ? (
        !error && <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="glass rounded-2xl p-5 mb-4">
            <div className="flex flex-wrap items-start gap-4">
              <span className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 font-semibold text-xl flex items-center justify-center flex-shrink-0">{client.name.trim()[0]?.toUpperCase()}</span>
              <div className="flex-1 min-w-0">
                <h1 className="font-display font-bold text-lg text-white">{client.name}</h1>
                {client.company && <p className="text-sm text-white/50">{client.company}</p>}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                  {client.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {client.phone}</span>}
                  {client.email && <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-white"><Mail size={12} /> {client.email}</a>}
                  {(client.city || client.country) && <span className="flex items-center gap-1.5"><MapPin size={12} /> {[client.city, client.country].filter(Boolean).join(', ')}</span>}
                  <span className="flex items-center gap-1.5"><Globe2 size={12} /> Billed in {client.currency}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-green-50 text-green-700"><MessageCircle size={12} /> WhatsApp</a>}
                <button onClick={() => setModal({ type: 'client' })} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06]" aria-label="Edit client"><Pencil size={14} /></button>
                <button onClick={removeClient} className="p-2 rounded-xl text-white/40 hover:text-red-500 hover:bg-red-50" aria-label="Delete client"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-black/[0.05] flex flex-wrap gap-2 text-[11px]">
              <span className={`px-2 py-0.5 rounded-full ${client.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-white/[0.06] text-white/50'}`}>{client.status === 'active' ? 'Active' : 'Past'}</span>
              {client.lead_id && <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">Converted from a lead</span>}
              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50">Client since {fmtDate(client.created_at)}</span>
              {client.gst_number && <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50">GST {client.gst_number}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <MoneyTile label="Budget" sums={money.budget} hint={`${projects.filter(p => p.stage !== 'cancelled').length} project(s)`} />
            <MoneyTile label="Paid" sums={money.paid} tone="text-emerald-600" />
            <MoneyTile label="Balance" sums={money.balance} tone="text-orange-600" />
          </div>

          <div className="flex gap-1 border-b border-black/[0.06] mb-4 overflow-x-auto">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-white/50 hover:text-white'}`}>
                {t}{t === 'Projects' ? ` (${projects.length})` : t === 'Payments' ? ` (${payments.length})` : ''}
              </button>
            ))}
          </div>

          {tab === 'Timeline' && (
            <div className="grid lg:grid-cols-3 gap-5">
              <section className="glass rounded-2xl p-5 lg:col-span-2"><Timeline key={timelineKey} clientId={client.id} leadId={client.lead_id} /></section>
              <section className="glass rounded-2xl p-5 space-y-3 text-xs h-fit">
                <h2 className="text-[10px] text-white/40 uppercase tracking-widest">Details</h2>
                <p><span className="text-white/40">Address</span><br /><span className="text-white">{client.address || 'Not added'}</span></p>
                <p><span className="text-white/40">Notes</span><br /><span className="text-white whitespace-pre-wrap">{client.notes || 'No notes'}</span></p>
              </section>
            </div>
          )}

          {tab === 'Projects' && (
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[10px] text-white/40 uppercase tracking-widest">Projects</h2>
                <button onClick={() => setModal({ type: 'project' })} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl"><Plus size={12} /> New project</button>
              </div>
              {projects.length === 0 ? <p className="text-xs text-white/30 py-4">No projects yet.</p> : (
                <div className="divide-y divide-black/[0.05]">
                  {projects.map(p => {
                    const stage = PROJECT_STAGES.find(s => s.id === p.stage)
                    return (
                      <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                        <button onClick={() => setModal({ type: 'project', item: p })} className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-semibold text-white flex items-center gap-2">{p.name}
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60 flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${stage?.dot}`} />{stage?.label}</span>
                          </p>
                          <p className="text-[11px] text-white/40">{[p.service, p.due_date && `Due ${fmtDate(p.due_date)}`].filter(Boolean).join(' · ')}</p>
                        </button>
                        <p className="text-xs text-white/60">{formatMoney(paidByProject[p.id] || 0, p.currency)} of {formatMoney(p.budget, p.currency)} paid</p>
                        {boards[p.pm_project_id] && <p className="text-xs text-white/60" title="Tasks done on the linked Vikku PM board">Work {boards[p.pm_project_id].progress}% · {boards[p.pm_project_id].done}/{boards[p.pm_project_id].total} tasks</p>}
                        {boards[p.pm_project_id]?.share_token && (
                          <button onClick={() => copyShare(boards[p.pm_project_id].share_token, p.name)} title="Copy the read-only progress link for this client"
                            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white/[0.06] text-white/60 hover:text-white"><Link2 size={11} /> Client progress link</button>
                        )}
                        {p.pm_project_id
                          ? <Link to={`/pm/projects/${p.pm_project_id}`} className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700"><ExternalLink size={11} /> PM board</Link>
                          : <button onClick={() => run(() => createPmBoard(p, client, user?.id))} className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white/[0.06] text-white/60 hover:text-white"><LayoutGrid size={11} /> Create PM board</button>}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {tab === 'Payments' && (
            <div className="space-y-5">
              <section className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[10px] text-white/40 uppercase tracking-widest">Payments · {moneyText(money.paid)} received</h2>
                  <button onClick={() => setModal({ type: 'payment' })} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl"><Plus size={12} /> Record payment</button>
                </div>
                <PaymentRows payments={payments} projectsById={projectsById}
                  onReceived={p => run(() => updatePayment(p.id, { status: 'received', paid_on: isoDay() }))}
                  onEdit={p => setModal({ type: 'payment', item: p })}
                  onDelete={p => confirm(`Delete this ${formatMoney(p.amount, p.currency)} payment?`) && run(() => deletePayment(p.id))} />
              </section>
              <section className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[10px] text-white/40 uppercase tracking-widest">Retainers</h2>
                  <button onClick={() => setModal({ type: 'retainer' })} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-white/[0.06] text-white/70 hover:text-white"><Plus size={12} /> New retainer</button>
                </div>
                <RetainerRows retainers={retainers} onRecord={r => run(() => recordRetainerMonth(r))} onEdit={r => setModal({ type: 'retainer', item: r })} />
              </section>
            </div>
          )}
        </>
      )}

      {modal?.type === 'client' && <ClientForm client={client} onClose={() => setModal(null)} onSaved={(c) => { setClient(c); setModal(null) }} />}
      {modal?.type === 'project' && (
        <ProjectForm project={modal.item} clients={[client]} clientId={client.id} onClose={() => setModal(null)} onSaved={closeAndReload}
          extra={modal.item && <button type="button" onClick={() => confirm(`Delete the project "${modal.item.name}"? Payments stay but are unlinked.`) && (setModal(null), run(() => deleteProject(modal.item.id)))} className="text-xs px-3 py-2 rounded-xl text-white/40 hover:text-red-500 hover:bg-red-50">Delete</button>} />
      )}
      {modal?.type === 'payment' && <PaymentForm payment={modal.item} clients={[client]} projects={projects} clientId={client.id} onClose={() => setModal(null)} onSaved={closeAndReload} />}
      {modal?.type === 'retainer' && <RetainerForm retainer={modal.item} clients={[client]} clientId={client.id} onClose={() => setModal(null)} onSaved={closeAndReload} />}
      {toast}
    </AdminLayout>
  )
}
