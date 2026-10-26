import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Download, ArrowLeft, Pencil } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { Field, inputCls } from './LeadPanel'
import { fmtDate } from './Lists'
import { downloadPdf } from '../../../lib/quotePdf'
import {
  QUOTE_STATUSES, createDocument, deleteDocument, formatMoney, isoDay, listClients, listDocuments, listLeads,
  quoteTotals, updateDocument,
} from '../../../lib/crmService'

const DEFAULT_TERMS = '50% advance to start, 50% on delivery.\nPrices exclude third-party costs (hosting, API usage, paid tools) unless listed.\nThis quotation is valid until the date shown.'
const statusOf = (id) => QUOTE_STATUSES.find(s => s.id === id)
// Builder amounts keep paise/cents (formatMoney rounds to whole rupees for the dashboards).
const exact = (n, currency) => new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(n) || 0)
const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return isoDay(d) }

function Builder({ doc, leads, clients, onBack, onSaved }) {
  const [form, setForm] = useState(() => ({
    link: doc?.client_id ? `c:${doc.client_id}` : doc?.lead_id ? `l:${doc.lead_id}` : '',
    title: doc?.title || '', currency: doc?.currency || 'INR',
    items: doc?.items?.length ? doc.items : [{ description: '', qty: 1, rate: '' }],
    tax_percent: doc?.tax_percent ?? 18, discount: doc?.discount || '', valid_until: doc?.valid_until || plusDays(15),
    notes: doc?.notes || '', terms: doc?.terms ?? DEFAULT_TERMS,
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setItem = (i, k) => (e) => setForm(f => ({ ...f, items: f.items.map((it, j) => j === i ? { ...it, [k]: e.target.value } : it) }))
  const t = quoteTotals(form.items, form.tax_percent, form.discount)

  const pickParty = (e) => {
    const link = e.target.value
    const c = link.startsWith('c:') && clients.find(x => x.id === link.slice(2))
    setForm(f => ({ ...f, link, currency: c?.currency || f.currency }))
  }

  const record = () => {
    const items = form.items.filter(i => i.description.trim() || Number(i.rate))
      .map(i => ({ description: i.description.trim(), qty: Number(i.qty) || 0, rate: Number(i.rate) || 0 }))
    return {
      client_id: form.link.startsWith('c:') ? form.link.slice(2) : null,
      lead_id: form.link.startsWith('l:') ? form.link.slice(2) : null,
      title: form.title.trim(), currency: form.currency, items,
      tax_percent: Number(form.tax_percent) || 0, discount: Number(form.discount) || 0,
      total: quoteTotals(items, form.tax_percent, form.discount).total,
      valid_until: form.valid_until || null, notes: form.notes.trim() || null, terms: form.terms.trim() || null,
    }
  }

  const save = async (andPdf) => {
    const data = record()
    if (!form.link) return setError('Choose a client or lead.')
    if (!data.title) return setError('Add a title.')
    if (!data.items.length) return setError('Add at least one line item.')
    setSaving(true); setError('')
    try {
      const saved = doc ? await updateDocument(doc.id, data) : await createDocument(data)
      if (andPdf) await downloadPdf(saved, partyOf(saved, leads, clients))
      onSaved(saved)
    } catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-3"><ArrowLeft size={13} /> All quotations</button>
      <div className="glass rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <h1 className="sm:col-span-2 font-display font-bold text-lg text-white">{doc ? `Edit ${doc.number}` : 'New quotation'}</h1>
        <Field label="For *">
          <select className={inputCls} value={form.link} onChange={pickParty}>
            <option value="" className="bg-black">Choose a client or lead</option>
            <optgroup label="Clients">{clients.map(c => <option key={c.id} value={`c:${c.id}`} className="bg-black">{c.name}{c.company ? ` · ${c.company}` : ''}</option>)}</optgroup>
            <optgroup label="Leads">{leads.filter(l => !l.client_id).map(l => <option key={l.id} value={`l:${l.id}`} className="bg-black">{l.name}{l.company ? ` · ${l.company}` : ''}</option>)}</optgroup>
          </select>
        </Field>
        <Field label="Title *"><input className={inputCls} value={form.title} onChange={set('title')} placeholder="WhatsApp AI assistant" /></Field>

        <div className="sm:col-span-2 mt-2">
          <div className="hidden sm:grid grid-cols-[1fr_70px_120px_110px_28px] gap-2 text-[10px] text-white/40 uppercase tracking-wider mb-1">
            <span>Item</span><span>Qty</span><span>Rate</span><span className="text-right">Amount</span><span />
          </div>
          {form.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px] sm:grid-cols-[1fr_70px_120px_110px_28px] gap-2 mb-2 items-center">
              <input className={`${inputCls} col-span-2 sm:col-span-1`} value={it.description} onChange={setItem(i, 'description')} placeholder="What you'll deliver" aria-label="Item description" />
              <input className={inputCls} type="number" min="0" step="any" value={it.qty} onChange={setItem(i, 'qty')} aria-label="Quantity" />
              <input className={inputCls} type="number" min="0" step="any" value={it.rate} onChange={setItem(i, 'rate')} placeholder="0" aria-label="Rate" />
              <span className="text-sm text-white text-right tabular-nums">{exact(quoteTotals([it]).subtotal, form.currency)}</span>
              <button type="button" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))} disabled={form.items.length === 1} className="p-1 text-white/30 hover:text-red-500 disabled:opacity-30 justify-self-end" aria-label="Remove item"><Trash2 size={13} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, rate: '' }] }))} className="flex items-center gap-1 text-xs text-orange-600 font-medium mt-1"><Plus size={12} /> Add item</button>
        </div>

        <Field label="Currency">
          <select className={inputCls} value={form.currency} onChange={set('currency')}>
            <option value="INR" className="bg-black">INR (₹)</option><option value="USD" className="bg-black">USD ($)</option>
          </select>
        </Field>
        <Field label="Valid until"><input className={inputCls} type="date" value={form.valid_until} onChange={set('valid_until')} /></Field>
        <Field label="Discount (amount)"><input className={inputCls} type="number" min="0" step="any" value={form.discount} onChange={set('discount')} placeholder="0" /></Field>
        <Field label="GST %"><input className={inputCls} type="number" min="0" max="100" step="any" value={form.tax_percent} onChange={set('tax_percent')} /></Field>

        <div className="sm:col-span-2 rounded-xl bg-orange-50/60 border border-orange-100 p-4 text-sm space-y-1 tabular-nums">
          <div className="flex justify-between text-white/60"><span>Subtotal</span><span>{exact(t.subtotal, form.currency)}</span></div>
          {t.discount > 0 && <div className="flex justify-between text-white/60"><span>Discount</span><span>− {exact(t.discount, form.currency)}</span></div>}
          {Number(form.tax_percent) > 0 && <div className="flex justify-between text-white/60"><span>GST {Number(form.tax_percent)}%</span><span>{exact(t.tax, form.currency)}</span></div>}
          <div className="flex justify-between font-bold text-white text-base pt-1"><span>Total</span><span>{exact(t.total, form.currency)}</span></div>
        </div>

        <Field label="Notes (shown on the PDF)" wide><textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={set('notes')} placeholder="Timeline, what's included…" /></Field>
        <Field label="Terms" wide><textarea className={`${inputCls} resize-none`} rows={3} value={form.terms} onChange={set('terms')} /></Field>

        {error && <p className="sm:col-span-2 text-xs text-red-500">{error}</p>}
        <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onBack} className="text-xs px-4 py-2 rounded-xl text-white/50 hover:text-white">Cancel</button>
          <button type="button" disabled={saving} onClick={() => save(false)} className="text-xs px-4 py-2 rounded-xl glass text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" disabled={saving} onClick={() => save(true)} className="btn-primary flex items-center gap-1.5 text-xs px-5 py-2 rounded-xl disabled:opacity-50"><Download size={13} /> Save & download PDF</button>
        </div>
      </div>
    </div>
  )
}

const partyOf = (d, leads, clients) => d.client_id ? clients.find(c => c.id === d.client_id) : leads.find(l => l.id === d.lead_id)

export default function CrmDocuments() {
  const [docs, setDocs] = useState([])
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null = list, {} = new, {doc} = edit
  const [filter, setFilter] = useState('all')

  const load = async () => {
    setError('')
    try {
      const [d, l, c] = await Promise.all([listDocuments(), listLeads(), listClients()])
      setDocs(d); setLeads(l); setClients(c)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const run = async (fn) => { setError(''); try { await fn(); await load() } catch (err) { setError(err.message) } }

  const shown = useMemo(() => filter === 'all' ? docs : docs.filter(d => d.status === filter), [docs, filter])

  if (editing) {
    return (
      <AdminLayout>
        <Builder doc={editing.doc} leads={leads} clients={clients} onBack={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="mr-auto">
          <h1 className="font-display font-bold text-lg text-white">Quotations</h1>
          <p className="text-xs text-white/40">Build a quote, download the PDF, track the answer</p>
        </div>
        <select className="glass rounded-xl px-3 py-2 text-xs text-white bg-transparent" value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="all" className="bg-black">All statuses</option>
          {QUOTE_STATUSES.map(s => <option key={s.id} value={s.id} className="bg-black">{s.label}</option>)}
        </select>
        <button onClick={() => setEditing({})} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl"><Plus size={13} /> New quotation</button>
      </div>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
      ) : shown.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-white/40">{docs.length ? 'No quotations with this status.' : 'No quotations yet. Create your first one.'}</div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-black/[0.05]">
          {shown.map(d => {
            const party = partyOf(d, leads, clients)
            const expired = d.status === 'sent' && d.valid_until && d.valid_until < isoDay()
            return (
              <div key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate"><span className="text-white/40 font-mono text-xs mr-2">{d.number}</span>{d.title}</p>
                  <p className="text-[11px] text-white/40 truncate">{party?.name || 'Unknown'}{d.lead_id && !d.client_id ? ' (lead)' : ''} · {fmtDate(isoDay(new Date(d.created_at)))}{d.valid_until ? ` · valid until ${fmtDate(d.valid_until)}` : ''}{expired ? ' · expired' : ''}</p>
                </div>
                <span className="text-sm font-semibold text-white tabular-nums">{formatMoney(d.total, d.currency)}</span>
                <select value={d.status} onChange={e => run(() => updateDocument(d.id, { status: e.target.value }))} className={`text-[11px] font-medium px-2 py-1 rounded-full border-0 ${statusOf(d.status)?.tone}`} aria-label="Quotation status">
                  {QUOTE_STATUSES.map(s => <option key={s.id} value={s.id} className="bg-black text-white">{s.label}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <button onClick={() => downloadPdf(d, party).catch(err => setError(err.message))} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]" aria-label="Download PDF"><Download size={14} /></button>
                  <button onClick={() => setEditing({ doc: d })} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]" aria-label="Edit quotation"><Pencil size={13} /></button>
                  <button onClick={() => confirm(`Delete ${d.number}?`) && run(() => deleteDocument(d.id))} className="p-1.5 rounded-lg text-white/30 hover:text-red-500 hover:bg-red-50" aria-label="Delete quotation"><Trash2 size={13} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
