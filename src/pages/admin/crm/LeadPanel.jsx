import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Trash2, UserCheck, ExternalLink, MessageCircle } from 'lucide-react'
import useLockBodyScroll from '../../../hooks/useLockBodyScroll'
import { LEAD_SOURCES, LEAD_STAGES, SERVICES, convertLead, createLead, deleteLead, updateLead, whatsappNumber } from '../../../lib/crmService'
import Timeline from './Timeline'

const EMPTY = { name: '', company: '', phone: '', email: '', city: '', country: 'India', source: 'website', service: '', value: '', currency: 'INR', stage: 'new', next_follow_up: '', lost_reason: '', notes: '' }
export const inputCls = 'input'

export function Field({ label, children, wide }) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="input-label">{label}</span>
      {children}
    </label>
  )
}

// Side panel to add or edit a lead, log activity, convert it to a client or delete it.
export default function LeadPanel({ lead, defaultStage = 'new', onClose, onSaved, onDeleted }) {
  useLockBodyScroll()
  const navigate = useNavigate()
  const isNew = !lead
  const [form, setForm] = useState(() => {
    const base = { ...EMPTY, stage: defaultStage }
    if (!lead) return base
    return Object.fromEntries(Object.keys(EMPTY).map(k => [k, lead[k] ?? '']))
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const payload = () => ({
    ...form,
    name: form.name.trim(),
    value: Number(form.value) || 0,
    next_follow_up: form.next_follow_up || null,
    lost_reason: form.stage === 'lost' ? (form.lost_reason || null) : null,
  })

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Add a name for the lead.'); return }
    setSaving(true); setError('')
    try {
      const saved = isNew ? await createLead(payload()) : await updateLead(lead.id, payload())
      onSaved(saved, isNew)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const convert = async () => {
    setSaving(true); setError('')
    try {
      const clientId = await convertLead(lead.id)
      navigate(`/admin/crm/clients/${clientId}`)
    } catch (err) { setError(err.message); setSaving(false) }
  }

  const remove = async () => {
    if (!confirm(`Delete the lead "${lead.name}"? Its timeline is deleted too.`)) return
    try { await deleteLead(lead.id); onDeleted(lead.id) }
    catch (err) { setError(err.message) }
  }

  const wa = whatsappNumber(form.phone)

  return (
    <div className="overlay drawer" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label={isNew ? 'New lead' : lead.name} className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-head">
          <h2>{isNew ? 'New lead' : lead.name}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm text-slate-500" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="dialog-body">

        {!isNew && (
          <div className="flex flex-wrap gap-2 mb-5">
            {lead.client_id ? (
              <button onClick={() => navigate(`/admin/crm/clients/${lead.client_id}`)} className="btn btn-sm">
                <ExternalLink size={14} /> Open client
              </button>
            ) : (
              <button onClick={convert} disabled={saving} className="btn btn-primary btn-sm">
                <UserCheck size={14} /> Convert to client
              </button>
            )}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
            <button onClick={remove} className="btn btn-ghost btn-sm ml-auto text-slate-500 hover:!text-[var(--red)] hover:!bg-[var(--red-bg)]">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}

        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name *"><input className={inputCls} value={form.name} onChange={set('name')} autoFocus={isNew} /></Field>
          <Field label="Company"><input className={inputCls} value={form.company} onChange={set('company')} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.phone} onChange={set('phone')} inputMode="tel" /></Field>
          <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={set('email')} /></Field>
          <Field label="City"><input className={inputCls} value={form.city} onChange={set('city')} /></Field>
          <Field label="Country"><input className={inputCls} value={form.country} onChange={set('country')} /></Field>
          <Field label="Source">
            <select className={inputCls} value={form.source} onChange={set('source')}>
              {LEAD_SOURCES.map(s => <option key={s.id} value={s.id} className="bg-black">{s.label}</option>)}
            </select>
          </Field>
          <Field label="Service">
            <select className={inputCls} value={form.service} onChange={set('service')}>
              <option value="" className="bg-black">Not decided</option>
              {SERVICES.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
            </select>
          </Field>
          <Field label="Deal value">
            <div className="flex gap-2">
              <select className={`${inputCls} !w-24`} value={form.currency} onChange={set('currency')}>
                <option value="INR" className="bg-black">₹ INR</option>
                <option value="USD" className="bg-black">$ USD</option>
              </select>
              <input className={inputCls} type="number" min="0" step="1" value={form.value} onChange={set('value')} placeholder="0" />
            </div>
          </Field>
          <Field label="Stage">
            <select className={inputCls} value={form.stage} onChange={set('stage')}>
              {LEAD_STAGES.map(s => <option key={s.id} value={s.id} className="bg-black">{s.label}</option>)}
            </select>
          </Field>
          <Field label="Next follow-up"><input className={inputCls} type="date" value={form.next_follow_up} onChange={set('next_follow_up')} /></Field>
          {form.stage === 'lost' && <Field label="Lost reason"><input className={inputCls} value={form.lost_reason} onChange={set('lost_reason')} placeholder="e.g. Budget, timing, chose another agency" /></Field>}
          <Field label="Notes" wide><textarea className={`${inputCls} resize-none`} rows={3} value={form.notes} onChange={set('notes')} /></Field>

          {error && <p role="alert" className="sm:col-span-2 text-[12.5px] text-[var(--red)]">{error}</p>}
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : isNew ? 'Add lead' : 'Save changes'}</button>
          </div>
        </form>

        {!isNew && (
          <section className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="section-title">Timeline</h3>
            <Timeline leadId={lead.id} />
          </section>
        )}
        </div>
      </aside>
    </div>
  )
}
