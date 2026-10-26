import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Trash2, UserCheck, ExternalLink, MessageCircle } from 'lucide-react'
import useLockBodyScroll from '../../../hooks/useLockBodyScroll'
import { LEAD_SOURCES, LEAD_STAGES, SERVICES, convertLead, createLead, deleteLead, updateLead, whatsappNumber } from '../../../lib/crmService'
import Timeline from './Timeline'

const EMPTY = { name: '', company: '', phone: '', email: '', city: '', country: 'India', source: 'website', service: '', value: '', currency: 'INR', stage: 'new', next_follow_up: '', lost_reason: '', notes: '' }
export const inputCls = 'w-full glass rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none bg-transparent'

export function Field({ label, children, wide }) {
  return (
    <label className={`flex flex-col gap-1 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
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
    <div className="fixed inset-0 z-[9998] flex justify-end bg-black/40" onClick={onClose}>
      <aside className="w-full max-w-xl h-full overflow-y-auto bg-[var(--surface)] shadow-2xl p-5 sm:p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-base text-white">{isNew ? 'New lead' : lead.name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]" aria-label="Close"><X size={16} /></button>
        </div>

        {!isNew && (
          <div className="flex flex-wrap gap-2 mb-5">
            {lead.client_id ? (
              <button onClick={() => navigate(`/admin/crm/clients/${lead.client_id}`)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700">
                <ExternalLink size={12} /> Open client
              </button>
            ) : (
              <button onClick={convert} disabled={saving} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl disabled:opacity-50">
                <UserCheck size={12} /> Convert to client
              </button>
            )}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-green-50 text-green-700">
                <MessageCircle size={12} /> WhatsApp
              </a>
            )}
            <button onClick={remove} className="ml-auto flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl text-white/40 hover:text-red-500 hover:bg-red-50">
              <Trash2 size={12} /> Delete
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

          {error && <p className="sm:col-span-2 text-xs text-red-500">{error}</p>}
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="text-xs px-4 py-2 rounded-xl text-white/50 hover:text-white">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-xs px-5 py-2 rounded-xl disabled:opacity-50">{saving ? 'Saving…' : isNew ? 'Add lead' : 'Save changes'}</button>
          </div>
        </form>

        {!isNew && (
          <section className="mt-8">
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Timeline</h3>
            <Timeline leadId={lead.id} />
          </section>
        )}
      </aside>
    </div>
  )
}
