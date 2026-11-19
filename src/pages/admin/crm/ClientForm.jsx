import { useState } from 'react'
import { createClient, updateClient } from '../../../lib/crmService'
import { Field, inputCls } from './LeadPanel'
import { Modal } from './Forms'

const EMPTY = { name: '', company: '', phone: '', email: '', city: '', country: 'India', currency: 'INR', gst_number: '', address: '', status: 'active', notes: '' }

// Modal to add a client directly (without a lead) or edit one.
export default function ClientForm({ client, onClose, onSaved }) {
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
    <Modal title={isNew ? 'New client' : 'Edit client'} onClose={onClose} onSubmit={save} saving={saving} error={error} submitLabel={isNew ? 'Add client' : 'Save changes'}>
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
    </Modal>
  )
}
