import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { ExpenseForm, PaymentForm, RetainerForm } from './Forms'
import { MoneyTile, PaymentRows, RetainerRows, fmtDate } from './Lists'
import {
  EXPENSE_CATEGORIES, activeMrr, deleteExpense, deletePayment, formatMoney, isoDay, labelOf, listClients, listExpenses,
  listPayments, listProjects, listRetainers, monthStats, overduePayments, recordRetainerMonth, sumByCurrency, updatePayment,
} from '../../../lib/crmService'

const TABS = ['Payments', 'Retainers', 'Expenses']

export default function CrmPayments() {
  const [data, setData] = useState({ payments: [], retainers: [], expenses: [], clients: [], projects: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Payments')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState(null) // { type: 'payment'|'retainer'|'expense', item? }

  const load = async () => {
    setError('')
    try {
      const [payments, retainers, expenses, clients, projects] = await Promise.all([listPayments(), listRetainers(), listExpenses(), listClients(), listProjects()])
      setData({ payments, retainers, expenses, clients, projects })
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const run = async (fn) => { setError(''); try { await fn(); await load() } catch (err) { setError(err.message) } }
  const saved = () => { setModal(null); load() }

  const { payments, retainers, expenses, clients, projects } = data
  const clientsById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients])
  const projectsById = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects])
  const month = useMemo(() => monthStats({ projects, payments, expenses }), [projects, payments, expenses])
  const pending = payments.filter(p => p.status === 'pending')
  const overdue = overduePayments(payments)
  const shown = status ? payments.filter(p => status === 'overdue' ? overdue.includes(p) : p.status === status) : payments

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="mr-auto">
          <h1 className="font-display font-bold text-lg text-white">Payments</h1>
          <p className="text-xs text-white/40">Money in, retainers and expenses</p>
        </div>
        {tab === 'Payments' && <button onClick={() => setModal({ type: 'payment' })} disabled={!clients.length} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl disabled:opacity-50"><Plus size={13} /> Record payment</button>}
        {tab === 'Retainers' && <button onClick={() => setModal({ type: 'retainer' })} disabled={!clients.length} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl disabled:opacity-50"><Plus size={13} /> New retainer</button>}
        {tab === 'Expenses' && <button onClick={() => setModal({ type: 'expense' })} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl"><Plus size={13} /> Add expense</button>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
        <MoneyTile label="Received this month" sums={month.received} tone="text-emerald-600" />
        <MoneyTile label="Pending" sums={sumByCurrency(pending)} tone="text-amber-600" hint={overdue.length ? `${overdue.length} overdue` : 'None overdue'} />
        <MoneyTile label="Retainers (monthly)" sums={activeMrr(retainers)} hint={`${retainers.filter(r => r.status === 'active').length} active`} />
        <MoneyTile label="Expenses this month" sums={month.expenses} tone="text-rose-600" />
      </div>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
      {!loading && !clients.length && <div className="glass rounded-2xl p-6 text-center text-sm text-white/50 mb-4">Add or convert a client first to record their payments.</div>}

      <div className="flex gap-1 border-b border-black/[0.06] mb-4 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-white/50 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Payments' && (
        <section className="glass rounded-2xl p-5">
          <div className="flex justify-end mb-2">
            <select value={status} onChange={e => setStatus(e.target.value)} className="glass rounded-xl px-3 py-1.5 text-xs text-white bg-transparent focus:outline-none">
              <option value="" className="bg-black">All payments</option>
              <option value="received" className="bg-black">Received</option>
              <option value="pending" className="bg-black">Pending</option>
              <option value="overdue" className="bg-black">Overdue</option>
            </select>
          </div>
          <PaymentRows payments={shown} clientsById={clientsById} projectsById={projectsById} showClient
            onReceived={p => run(() => updatePayment(p.id, { status: 'received', paid_on: isoDay() }))}
            onEdit={p => setModal({ type: 'payment', item: p })}
            onDelete={p => confirm(`Delete this ${formatMoney(p.amount, p.currency)} payment?`) && run(() => deletePayment(p.id))} />
        </section>
      )}

      {tab === 'Retainers' && (
        <section className="glass rounded-2xl p-5">
          <RetainerRows retainers={retainers} clientsById={clientsById} showClient onRecord={r => run(() => recordRetainerMonth(r))} onEdit={r => setModal({ type: 'retainer', item: r })} />
        </section>
      )}

      {tab === 'Expenses' && (
        <section className="glass rounded-2xl p-5">
          {expenses.length === 0 ? <p className="text-xs text-white/30 py-4">No expenses yet.</p> : (
            <div className="divide-y divide-black/[0.05]">
              {expenses.map(e => (
                <div key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{formatMoney(e.amount, e.currency)} <span className="ml-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">{labelOf(EXPENSE_CATEGORIES, e.category)}</span></p>
                    <p className="text-[11px] text-white/40 truncate">{[e.description, clientsById[e.client_id]?.name].filter(Boolean).join(' · ') || 'No description'}</p>
                  </div>
                  <p className="text-[11px] text-white/50">{fmtDate(e.spent_on)}</p>
                  <button onClick={() => confirm('Delete this expense?') && run(() => deleteExpense(e.id))} className="p-1.5 rounded-lg text-white/30 hover:text-red-500 hover:bg-red-50" aria-label="Delete expense"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {modal?.type === 'payment' && <PaymentForm payment={modal.item} clients={clients} projects={projects} onClose={() => setModal(null)} onSaved={saved} />}
      {modal?.type === 'retainer' && <RetainerForm retainer={modal.item} clients={clients} onClose={() => setModal(null)} onSaved={saved} />}
      {modal?.type === 'expense' && <ExpenseForm clients={clients} onClose={() => setModal(null)} onSaved={saved} />}
    </AdminLayout>
  )
}
