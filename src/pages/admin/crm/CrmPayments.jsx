import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Pencil, Plus, Receipt, Trash2, Wallet } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { ExpenseForm, PaymentForm, RetainerForm } from './Forms'
import { MoneyTile, RetainerRows, fmtDate } from './Lists'
import { Badge, DataTable, EmptyState, PageHead, Tabs } from '../ui'
import {
  EXPENSE_CATEGORIES, PAYMENT_KINDS, PAYMENT_METHODS, activeMrr, deleteExpense, deletePayment, formatMoney, isoDay, labelOf, listClients, listExpenses,
  listPayments, listProjects, listRetainers, monthStats, overduePayments, recordRetainerMonth, sumByCurrency, updatePayment,
} from '../../../lib/crmService'

const TABS = ['Payments', 'Retainers', 'Expenses']

export default function CrmPayments() {
  const [data, setData] = useState({ payments: [], retainers: [], expenses: [], clients: [], projects: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Payments')
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
  const paymentColumns = [
    { key: 'amount', label: 'Amount', num: true, sort: p => Number(p.amount) || 0, render: p => <span className="font-semibold text-slate-900">{formatMoney(p.amount, p.currency)}</span> },
    { key: 'status', label: 'Status', render: p => <Badge tone={p.status === 'received' ? 'green' : overdue.includes(p) ? 'red' : 'amber'}>{p.status === 'received' ? 'Received' : overdue.includes(p) ? 'Overdue' : 'Pending'}</Badge> },
    { key: 'client', label: 'Client', sort: p => clientsById[p.client_id]?.name?.toLowerCase(), render: p => <span className="text-slate-900">{clientsById[p.client_id]?.name || '—'}</span> },
    { key: 'details', label: 'Details', className: 'max-lg:hidden', render: p => <span className="text-slate-600">{[projectsById[p.project_id]?.name, labelOf(PAYMENT_KINDS, p.kind), p.method && labelOf(PAYMENT_METHODS, p.method), p.reference].filter(Boolean).join(' · ') || '—'}</span> },
    { key: 'date', label: 'Date', sort: p => p.paid_on || p.due_on, render: p => <span className="text-slate-600 tabular-nums">{p.status === 'received' ? `Received ${fmtDate(p.paid_on)}` : p.due_on ? `Due ${fmtDate(p.due_on)}` : 'No due date'}</span> },
    { key: 'added', label: 'Added', className: 'max-xl:hidden', sort: p => p.created_at, render: p => <span className="text-slate-500 tabular-nums">{fmtDate(p.created_at)}</span> },
    { key: 'actions', label: <span className="sr-only">Actions</span>, render: p => (
      <span className="flex items-center justify-end gap-1">
        {p.status === 'pending' && <button onClick={() => run(() => updatePayment(p.id, { status: 'received', paid_on: isoDay() }))} className="act" title="Mark as received today"><CheckCircle2 size={14} /> Received</button>}
        <button onClick={() => setModal({ type: 'payment', item: p })} className="icon-act" aria-label="Edit payment"><Pencil size={15} /></button>
        <button onClick={() => confirm(`Delete this ${formatMoney(p.amount, p.currency)} payment?`) && run(() => deletePayment(p.id))} className="icon-act hover:!text-[var(--red)] hover:!bg-[var(--red-bg)]" aria-label="Delete payment"><Trash2 size={15} /></button>
      </span>
    ) },
  ]
  const statusFilter = { key: 'status', label: 'Status', all: 'All payments', options: [{ value: 'received', label: 'Received' }, { value: 'pending', label: 'Pending' }, { value: 'overdue', label: 'Overdue' }],
    test: (p, v) => v === 'overdue' ? overdue.includes(p) : p.status === v }
  const expenseColumns = [
    { key: 'amount', label: 'Amount', num: true, sort: e => Number(e.amount) || 0, render: e => <span className="font-semibold text-slate-900">{formatMoney(e.amount, e.currency)}</span> },
    { key: 'category', label: 'Category', render: e => <Badge tone="slate">{labelOf(EXPENSE_CATEGORIES, e.category)}</Badge> },
    { key: 'description', label: 'Description', render: e => <span className="text-slate-700 block max-w-[320px] truncate">{e.description || 'No description'}</span> },
    { key: 'client', label: 'Client', className: 'max-md:hidden', render: e => <span className="text-slate-600">{clientsById[e.client_id]?.name || '—'}</span> },
    { key: 'date', label: 'Date', sort: e => e.spent_on, render: e => <span className="text-slate-600 tabular-nums">{fmtDate(e.spent_on)}</span> },
    { key: 'actions', label: <span className="sr-only">Actions</span>, render: e => (
      <span className="flex justify-end"><button onClick={() => confirm('Delete this expense?') && run(() => deleteExpense(e.id))} className="icon-act hover:!text-[var(--red)] hover:!bg-[var(--red-bg)]" aria-label="Delete expense"><Trash2 size={15} /></button></span>
    ) },
  ]
  const categoryFilter = { key: 'category', label: 'Category', all: 'All categories', options: EXPENSE_CATEGORIES.map(c => ({ value: c.id, label: c.label })), test: (e, v) => e.category === v }

  return (
    <AdminLayout>
      <PageHead title="Payments" sub="Money in, retainers and expenses">
        {tab === 'Payments' && <button onClick={() => setModal({ type: 'payment' })} disabled={!clients.length} className="btn btn-primary"><Plus /> Record payment</button>}
        {tab === 'Retainers' && <button onClick={() => setModal({ type: 'retainer' })} disabled={!clients.length} className="btn btn-primary"><Plus /> New retainer</button>}
        {tab === 'Expenses' && <button onClick={() => setModal({ type: 'expense' })} className="btn btn-primary"><Plus /> Add expense</button>}
      </PageHead>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <MoneyTile label="Received this month" sums={month.received} tone="!text-[var(--green)]" />
        <MoneyTile label="Pending" sums={sumByCurrency(pending)} tone="!text-[var(--amber)]" hint={overdue.length ? `${overdue.length} overdue` : 'None overdue'} />
        <MoneyTile label="Retainers (monthly)" sums={activeMrr(retainers)} hint={`${retainers.filter(r => r.status === 'active').length} active`} />
        <MoneyTile label="Expenses this month" sums={month.expenses} tone="!text-[var(--red)]" />
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-3 rounded-ui border border-[var(--red-bd)] bg-[var(--red-bg)] px-4 py-2.5 text-[13px] text-[var(--red)]">
          {error}<button type="button" onClick={load} className="btn btn-sm ml-auto">Try again</button>
        </div>
      )}
      {!loading && !clients.length && <div className="card mb-4"><EmptyState title="No clients yet">Add or convert a client first to record their payments.</EmptyState></div>}

      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Payment sections" />

      {tab === 'Payments' && (
        <section className="card overflow-hidden">
          <DataTable rows={payments} columns={paymentColumns} loading={loading} filters={[statusFilter]} initialSort={{ key: 'added', dir: 'desc' }}
            search={p => [clientsById[p.client_id]?.name, projectsById[p.project_id]?.name, p.reference, p.notes].filter(Boolean).join(' ')} searchLabel="Search client, project, reference"
            empty={<EmptyState icon={Wallet} title="No payments yet" />} />
        </section>
      )}

      {tab === 'Retainers' && (
        <section className="card px-4">
          <RetainerRows retainers={retainers} clientsById={clientsById} showClient onRecord={r => run(() => recordRetainerMonth(r))} onEdit={r => setModal({ type: 'retainer', item: r })} />
        </section>
      )}

      {tab === 'Expenses' && (
        <section className="card overflow-hidden">
          <DataTable rows={expenses} columns={expenseColumns} loading={loading} filters={[categoryFilter]} initialSort={{ key: 'date', dir: 'desc' }}
            search={e => [e.description, clientsById[e.client_id]?.name].filter(Boolean).join(' ')} searchLabel="Search expenses"
            empty={<EmptyState icon={Receipt} title="No expenses yet" />} />
        </section>
      )}

      {modal?.type === 'payment' && <PaymentForm payment={modal.item} clients={clients} projects={projects} onClose={() => setModal(null)} onSaved={saved} />}
      {modal?.type === 'retainer' && <RetainerForm retainer={modal.item} clients={clients} onClose={() => setModal(null)} onSaved={saved} />}
      {modal?.type === 'expense' && <ExpenseForm clients={clients} onClose={() => setModal(null)} onSaved={saved} />}
    </AdminLayout>
  )
}
