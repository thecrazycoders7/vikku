import { useState } from 'react'
import { X } from 'lucide-react'
import useLockBodyScroll from '../../../hooks/useLockBodyScroll'
import {
  EXPENSE_CATEGORIES, PAYMENT_KINDS, PAYMENT_METHODS, PROJECT_STAGES, SERVICES, formatMoney, isoDay,
  createExpense, createPayment, createProject, createRecurring, createRetainer, saveCashBalance, updatePayment, updateProject, updateRecurring, updateRetainer,
} from '../../../lib/crmService'
import { Field, inputCls } from './LeadPanel'

// Shared modal shell for the CRM forms.
export function Modal({ title, onClose, onSubmit, saving, error, submitLabel, children, extra }) {
  useLockBodyScroll()
  return (
    <div className="overlay" onClick={onClose}>
      <form role="dialog" aria-modal="true" aria-label={title} onSubmit={onSubmit} onClick={e => e.stopPropagation()} className="dialog">
        <div className="dialog-head">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm text-slate-500" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="dialog-body grid grid-cols-1 sm:grid-cols-2 gap-3">
          {children}
          {error && <p role="alert" className="sm:col-span-2 text-[12.5px] text-[var(--red)]">{error}</p>}
        </div>
        <div className="dialog-foot">
          {extra}
          <button type="button" onClick={onClose} className="btn btn-ghost ml-auto">Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : submitLabel}</button>
        </div>
      </form>
    </div>
  )
}

// Form state + save handling shared by every form below.
function useForm(initial, saveFn, onSaved, validate) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    const problem = validate?.(form)
    if (problem) { setError(problem); return }
    setSaving(true); setError('')
    try { onSaved(await saveFn(form)) }
    catch (err) { setError(err.message); setSaving(false) }
  }
  return { form, setForm, set, submit, saving, error }
}

const pick = (obj, keys, fallback) => Object.fromEntries(keys.map(k => [k, obj?.[k] ?? fallback[k] ?? '']))
const nullIfEmpty = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === '' ? null : v]))

function ClientSelect({ clients, value, onChange }) {
  return (
    <select className={inputCls} value={value} onChange={onChange}>
      <option value="" className="bg-black">Choose a client</option>
      {clients.map(c => <option key={c.id} value={c.id} className="bg-black">{c.name}{c.company ? ` · ${c.company}` : ''}</option>)}
    </select>
  )
}

// ------------------------------------------------------------- project ------
export function ProjectForm({ project, clients, clientId, onClose, onSaved, extra }) {
  const client = clients.find(c => c.id === (project?.client_id || clientId))
  const defaults = { client_id: clientId || '', name: '', service: '', budget: '', currency: client?.currency || 'INR', stage: 'new', start_date: '', due_date: '', notes: '' }
  const f = useForm(pick(project, Object.keys(defaults), defaults), (form) => {
    const data = nullIfEmpty({ ...form, name: form.name.trim(), budget: Number(form.budget) || 0 })
    return project ? updateProject(project.id, data) : createProject(data)
  }, onSaved, (form) => !form.client_id ? 'Choose a client.' : !form.name.trim() ? 'Add a project name.' : null)

  return (
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onClose} onSubmit={f.submit} saving={f.saving} error={f.error} submitLabel={project ? 'Save changes' : 'Add project'} extra={extra}>
      {!clientId && !project && <Field label="Client *" wide><ClientSelect clients={clients} value={f.form.client_id} onChange={e => { f.set('client_id')(e); const c = clients.find(x => x.id === e.target.value); if (c) f.setForm(x => ({ ...x, client_id: c.id, currency: c.currency })) }} /></Field>}
      <Field label="Project name *" wide><input className={inputCls} value={f.form.name} onChange={f.set('name')} autoFocus /></Field>
      <Field label="Service">
        <select className={inputCls} value={f.form.service} onChange={f.set('service')}>
          <option value="" className="bg-black">Not set</option>
          {SERVICES.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
        </select>
      </Field>
      <Field label="Stage">
        <select className={inputCls} value={f.form.stage} onChange={f.set('stage')}>
          {PROJECT_STAGES.map(s => <option key={s.id} value={s.id} className="bg-black">{s.label}</option>)}
        </select>
      </Field>
      <Field label="Budget">
        <div className="flex gap-2">
          <select className={`${inputCls} !w-24`} value={f.form.currency} onChange={f.set('currency')}>
            <option value="INR" className="bg-black">₹ INR</option><option value="USD" className="bg-black">$ USD</option>
          </select>
          <input className={inputCls} type="number" min="0" value={f.form.budget} onChange={f.set('budget')} placeholder="0" />
        </div>
      </Field>
      <Field label="Start date"><input className={inputCls} type="date" value={f.form.start_date} onChange={f.set('start_date')} /></Field>
      <Field label="Due date"><input className={inputCls} type="date" value={f.form.due_date} onChange={f.set('due_date')} /></Field>
      <Field label="Notes" wide><textarea className={`${inputCls} resize-none`} rows={2} value={f.form.notes} onChange={f.set('notes')} /></Field>
    </Modal>
  )
}

// ------------------------------------------------------------- payment ------
export function PaymentForm({ payment, clients, projects, clientId, projectId, onClose, onSaved }) {
  const project = projects.find(p => p.id === (payment?.project_id || projectId))
  const client = clients.find(c => c.id === (payment?.client_id || clientId || project?.client_id))
  const defaults = { client_id: client?.id || '', project_id: project?.id || '', amount: '', currency: project?.currency || client?.currency || 'INR', kind: 'milestone', method: 'upi', status: 'received', paid_on: isoDay(), due_on: '', reference: '', notes: '' }
  const f = useForm(pick(payment, Object.keys(defaults), defaults), (form) => {
    const data = nullIfEmpty({ ...form, amount: Number(form.amount), paid_on: form.status === 'received' ? form.paid_on : null, due_on: form.status === 'pending' ? form.due_on : null })
    return payment ? updatePayment(payment.id, data) : createPayment(data)
  }, onSaved, (form) => !form.client_id ? 'Choose a client.' : !(Number(form.amount) > 0) ? 'Enter an amount above zero.' : form.status === 'received' && !form.paid_on ? 'Add the date it was received.' : null)
  const clientProjects = projects.filter(p => p.client_id === f.form.client_id)

  return (
    <Modal title={payment ? 'Edit payment' : 'Record payment'} onClose={onClose} onSubmit={f.submit} saving={f.saving} error={f.error} submitLabel={payment ? 'Save changes' : 'Save payment'}>
      {!clientId && !payment && <Field label="Client *" wide><ClientSelect clients={clients} value={f.form.client_id} onChange={e => f.setForm(x => ({ ...x, client_id: e.target.value, project_id: '', currency: clients.find(c => c.id === e.target.value)?.currency || x.currency }))} /></Field>}
      <Field label="Project" wide>
        <select className={inputCls} value={f.form.project_id} onChange={f.set('project_id')}>
          <option value="" className="bg-black">No specific project</option>
          {clientProjects.map(p => <option key={p.id} value={p.id} className="bg-black">{p.name} ({formatMoney(p.budget, p.currency)})</option>)}
        </select>
      </Field>
      <Field label="Amount *">
        <div className="flex gap-2">
          <select className={`${inputCls} !w-24`} value={f.form.currency} onChange={f.set('currency')}>
            <option value="INR" className="bg-black">₹ INR</option><option value="USD" className="bg-black">$ USD</option>
          </select>
          <input className={inputCls} type="number" min="0" step="0.01" value={f.form.amount} onChange={f.set('amount')} autoFocus />
        </div>
      </Field>
      <Field label="Status">
        <select className={inputCls} value={f.form.status} onChange={f.set('status')}>
          <option value="received" className="bg-black">Received</option><option value="pending" className="bg-black">Pending (expected)</option>
        </select>
      </Field>
      {f.form.status === 'received'
        ? <Field label="Received on *"><input className={inputCls} type="date" value={f.form.paid_on} onChange={f.set('paid_on')} /></Field>
        : <Field label="Due on"><input className={inputCls} type="date" value={f.form.due_on} onChange={f.set('due_on')} /></Field>}
      <Field label="Type">
        <select className={inputCls} value={f.form.kind} onChange={f.set('kind')}>
          {PAYMENT_KINDS.map(k => <option key={k.id} value={k.id} className="bg-black">{k.label}</option>)}
        </select>
      </Field>
      <Field label="Method">
        <select className={inputCls} value={f.form.method} onChange={f.set('method')}>
          {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id} className="bg-black">{m.label}</option>)}
        </select>
      </Field>
      <Field label="Reference"><input className={inputCls} value={f.form.reference} onChange={f.set('reference')} placeholder="UTR, invoice no." /></Field>
      <Field label="Notes" wide><input className={inputCls} value={f.form.notes} onChange={f.set('notes')} /></Field>
    </Modal>
  )
}

// ------------------------------------------------------------ retainer ------
export function RetainerForm({ retainer, clients, clientId, onClose, onSaved }) {
  const client = clients.find(c => c.id === (retainer?.client_id || clientId))
  const defaults = { client_id: client?.id || '', title: 'Monthly support', amount: '', currency: client?.currency || 'INR', start_date: isoDay(), next_billing_date: '', status: 'active', notes: '' }
  const f = useForm(pick(retainer, Object.keys(defaults), defaults), (form) => {
    const data = nullIfEmpty({ ...form, title: form.title.trim(), amount: Number(form.amount) })
    return retainer ? updateRetainer(retainer.id, data) : createRetainer(data)
  }, onSaved, (form) => !form.client_id ? 'Choose a client.' : !form.title.trim() ? 'Add a title.' : !(Number(form.amount) > 0) ? 'Enter a monthly amount above zero.' : null)

  return (
    <Modal title={retainer ? 'Edit retainer' : 'New retainer'} onClose={onClose} onSubmit={f.submit} saving={f.saving} error={f.error} submitLabel={retainer ? 'Save changes' : 'Add retainer'}>
      {!clientId && !retainer && <Field label="Client *" wide><ClientSelect clients={clients} value={f.form.client_id} onChange={e => f.setForm(x => ({ ...x, client_id: e.target.value, currency: clients.find(c => c.id === e.target.value)?.currency || x.currency }))} /></Field>}
      <Field label="Title *" wide><input className={inputCls} value={f.form.title} onChange={f.set('title')} /></Field>
      <Field label="Monthly amount *">
        <div className="flex gap-2">
          <select className={`${inputCls} !w-24`} value={f.form.currency} onChange={f.set('currency')}>
            <option value="INR" className="bg-black">₹ INR</option><option value="USD" className="bg-black">$ USD</option>
          </select>
          <input className={inputCls} type="number" min="0" value={f.form.amount} onChange={f.set('amount')} />
        </div>
      </Field>
      <Field label="Status">
        <select className={inputCls} value={f.form.status} onChange={f.set('status')}>
          <option value="active" className="bg-black">Active</option><option value="paused" className="bg-black">Paused</option><option value="ended" className="bg-black">Ended</option>
        </select>
      </Field>
      <Field label="Started"><input className={inputCls} type="date" value={f.form.start_date} onChange={f.set('start_date')} /></Field>
      <Field label="Next billing date"><input className={inputCls} type="date" value={f.form.next_billing_date} onChange={f.set('next_billing_date')} /></Field>
      <Field label="Notes" wide><input className={inputCls} value={f.form.notes} onChange={f.set('notes')} /></Field>
    </Modal>
  )
}

// ------------------------------------------------------------- expense ------
export function ExpenseForm({ clients, onClose, onSaved }) {
  const defaults = { spent_on: isoDay(), amount: '', currency: 'INR', category: 'tools', description: '', client_id: '' }
  const f = useForm(defaults, (form) => createExpense(nullIfEmpty({ ...form, amount: Number(form.amount) })), onSaved,
    (form) => !(Number(form.amount) > 0) ? 'Enter an amount above zero.' : null)
  return (
    <Modal title="Add expense" onClose={onClose} onSubmit={f.submit} saving={f.saving} error={f.error} submitLabel="Add expense">
      <Field label="Amount *">
        <div className="flex gap-2">
          <select className={`${inputCls} !w-24`} value={f.form.currency} onChange={f.set('currency')}>
            <option value="INR" className="bg-black">₹ INR</option><option value="USD" className="bg-black">$ USD</option>
          </select>
          <input className={inputCls} type="number" min="0" step="0.01" value={f.form.amount} onChange={f.set('amount')} autoFocus />
        </div>
      </Field>
      <Field label="Date"><input className={inputCls} type="date" value={f.form.spent_on} onChange={f.set('spent_on')} /></Field>
      <Field label="Category">
        <select className={inputCls} value={f.form.category} onChange={f.set('category')}>
          {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id} className="bg-black">{c.label}</option>)}
        </select>
      </Field>
      <Field label="For client (optional)"><ClientSelect clients={clients} value={f.form.client_id} onChange={f.set('client_id')} /></Field>
      <Field label="Description" wide><input className={inputCls} value={f.form.description} onChange={f.set('description')} placeholder="e.g. OpenAI API, freelancer for UI" /></Field>
    </Modal>
  )
}

// -------------------------------------------------------- regular cost ------
export function RecurringForm({ item, clients, onClose, onSaved }) {
  const defaults = { title: '', amount: '', currency: 'INR', category: 'tools', every: 'month', next_due: isoDay(), client_id: '' }
  const f = useForm(pick(item, Object.keys(defaults), defaults), (form) => {
    const data = nullIfEmpty({ ...form, title: form.title.trim(), amount: Number(form.amount), anchor_day: Number(form.next_due.slice(8, 10)) })
    return item ? updateRecurring(item.id, data) : createRecurring(data)
  }, onSaved, (form) => !form.title.trim() ? 'Add a name.' : !(Number(form.amount) > 0) ? 'Enter an amount above zero.' : !form.next_due ? 'Choose the next payment date.' : null)
  return (
    <Modal title={item ? 'Edit regular cost' : 'Add regular cost'} onClose={onClose} onSubmit={f.submit} saving={f.saving} error={f.error} submitLabel={item ? 'Save changes' : 'Add cost'}>
      <Field label="Name *" wide><input className={inputCls} value={f.form.title} onChange={f.set('title')} placeholder="e.g. Vercel, office rent, salary" autoFocus /></Field>
      <Field label="Amount *">
        <div className="flex gap-2">
          <select className={`${inputCls} !w-24`} value={f.form.currency} onChange={f.set('currency')}>
            <option value="INR" className="bg-black">₹ INR</option><option value="USD" className="bg-black">$ USD</option>
          </select>
          <input className={inputCls} type="number" min="0" step="0.01" value={f.form.amount} onChange={f.set('amount')} />
        </div>
      </Field>
      <Field label="Repeats">
        <select className={inputCls} value={f.form.every} onChange={f.set('every')}>
          <option value="month" className="bg-black">Every month</option><option value="year" className="bg-black">Every year</option>
        </select>
      </Field>
      <Field label="Next payment date *"><input className={inputCls} type="date" value={f.form.next_due} onChange={f.set('next_due')} /></Field>
      <Field label="Category">
        <select className={inputCls} value={f.form.category} onChange={f.set('category')}>
          {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id} className="bg-black">{c.label}</option>)}
        </select>
      </Field>
      <Field label="For client (optional)" wide><ClientSelect clients={clients} value={f.form.client_id} onChange={f.set('client_id')} /></Field>
    </Modal>
  )
}

// --------------------------------------------------------- bank balance ------
export function BalanceForm({ currency, balance, onClose, onSaved }) {
  const defaults = { amount: '', as_of: isoDay() }
  const f = useForm(balance ? { amount: balance.amount, as_of: isoDay() } : defaults,
    (form) => saveCashBalance({ currency, amount: Number(form.amount), as_of: form.as_of }), onSaved,
    (form) => form.amount === '' || Number.isNaN(Number(form.amount)) ? 'Enter your balance.' : !form.as_of ? 'Choose a date.' : null)
  return (
    <Modal title={`Bank balance (${currency})`} onClose={onClose} onSubmit={f.submit} saving={f.saving} error={f.error} submitLabel="Save balance">
      <Field label="Balance *"><input className={inputCls} type="number" step="0.01" value={f.form.amount} onChange={f.set('amount')} autoFocus /></Field>
      <Field label="As of"><input className={inputCls} type="date" value={f.form.as_of} onChange={f.set('as_of')} /></Field>
      <p className="sm:col-span-2 text-[12px] text-slate-500">Enter what your bank shows at the end of this day. Payments and expenses dated after it adjust the balance automatically, so update it when it stops matching your bank.</p>
    </Modal>
  )
}
