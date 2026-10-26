import { useState } from 'react'
import { X } from 'lucide-react'
import useLockBodyScroll from '../../../hooks/useLockBodyScroll'
import { createClient, updateClient } from '../../../lib/crmService'
import { Field, inputCls } from './LeadPanel'

const EMPTY = { name: '', company: '', phone: '', email: '', city: '', country: 'India', currency: 'INR', gst_number: '', address: '', status: 'active', notes: '' }

// Modal to add a client directly (without a lead) or edit one.
export default function ClientForm({ client, onClose, onSaved }) {
  useLockBodyScroll()
  const isNew = !client
  const [form, setForm] = useState(() => client ? Object.fromEntries(Object.keys(EMPTY).map(k => [k, client[k] ?? ''])) : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Add a name for the client.'); return }
    setSaving(true); setError('')
    try {
      const data = { ...form, name: form.name.trim() }
      onSaved(isNew ? await createClient(data) : await updateClient(client.id, data))
    } catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-[8vh]" onClick={onClose}>
      <form onSubmit={save} onClick={e => e.stopPropagation()} className="w-full max-w-xl bg-[var(--surface)] rounded-2xl shadow-2xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 flex items-center justify-between mb-1">
          <h2 className="font-display font-bold text-base text-white">{isNew ? 'New client' : 'Edit client'}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white" aria-label="Close"><X size={16} /></button>
        </div>
        <Field label="Name *"><input className={inputCls} value={form.name} onChange={set('name')} autoFocus /></Field>
        <Field label="Company"><input className={inputCls} value={form.company} onChange={set('company')} /></Field>
        <Field label="Phone"><input className={inputCls} value={form.phone} onChange={set('phone')} inputMode="tel" /></Field>
        <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="City"><input className={inputCls} value={form.city} onChange={set('city')} /></Field>
        <Field label="Country"><input className={inputCls} value={form.country} onChange={set('country')} /></Field>
        <Field label="Billing currency">
          <select className={inputCls} value={form.currency} onChange={set('currency')}>
            <option value="INR" className="bg-black">₹ INR, Indian Rupee</option>
            <option value="USD" className="bg-black">$ USD, US Dollar</option>
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} value={form.status} onChange={set('status')}>
            <option value="active" className="bg-black">Active</option>
            <option value="past" className="bg-black">Past</option>
          </select>
        </Field>
        <Field label="GST number"><input className={inputCls} value={form.gst_number} onChange={set('gst_number')} /></Field>
        <Field label="Address"><input className={inputCls} value={form.address} onChange={set('address')} /></Field>
        <Field label="Notes" wide><textarea className={`${inputCls} resize-none`} rows={3} value={form.notes} onChange={set('notes')} /></Field>
        {error && <p className="sm:col-span-2 text-xs text-red-500">{error}</p>}
        <div className="sm:col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="text-xs px-4 py-2 rounded-xl text-white/50 hover:text-white">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-xs px-5 py-2 rounded-xl disabled:opacity-50">{saving ? 'Saving…' : isNew ? 'Add client' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  )
}
