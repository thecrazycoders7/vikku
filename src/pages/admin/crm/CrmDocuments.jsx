import { useEffect, useState } from 'react'
import { Plus, Trash2, Download, ArrowLeft, Pencil, Link2, ExternalLink, FileText } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { Field, inputCls } from './LeadPanel'
import { fmtDate } from './Lists'
import useOpenOnParam from '../../../hooks/useOpenOnParam'
import { downloadPdf } from '../../../lib/quotePdf'
import { quoteLink } from '../../../lib/quoteShare'
import { DataTable, EmptyState, ErrorState, PageHead, badgeCls, useToast } from '../ui'
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
      <button onClick={onBack} className="btn btn-ghost btn-sm -ml-2 mb-3 text-slate-600"><ArrowLeft size={14} /> All quotations</button>
      <div className="card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <h1 className="sm:col-span-2 text-[20px] leading-7 font-semibold tracking-[-.02em] text-slate-900">{doc ? `Edit ${doc.number}` : 'New quotation'}</h1>
        <Field label="For *">
          <select className={inputCls} value={form.link} onChange={pickParty}>
            <option value="" className="bg-black">Choose a client or lead</option>
            <optgroup label="Clients">{clients.map(c => <option key={c.id} value={`c:${c.id}`} className="bg-black">{c.name}{c.company ? ` · ${c.company}` : ''}</option>)}</optgroup>
            <optgroup label="Leads">{leads.filter(l => !l.client_id).map(l => <option key={l.id} value={`l:${l.id}`} className="bg-black">{l.name}{l.company ? ` · ${l.company}` : ''}</option>)}</optgroup>
          </select>
        </Field>
        <Field label="Title *"><input className={inputCls} value={form.title} onChange={set('title')} placeholder="WhatsApp AI assistant" /></Field>

        <div className="sm:col-span-2 mt-2">
          <div className="hidden sm:grid grid-cols-[1fr_70px_120px_110px_28px] gap-2 text-[12px] font-medium text-slate-500 mb-1">
            <span>Item</span><span>Qty</span><span>Rate</span><span className="text-right">Amount</span><span />
          </div>
          {form.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px] sm:grid-cols-[1fr_70px_120px_110px_28px] gap-2 mb-2 items-center">
              <input className={`${inputCls} col-span-2 sm:col-span-1`} value={it.description} onChange={setItem(i, 'description')} placeholder="What you'll deliver" aria-label="Item description" />
              <input className={inputCls} type="number" min="0" step="any" value={it.qty} onChange={setItem(i, 'qty')} aria-label="Quantity" />
              <input className={inputCls} type="number" min="0" step="any" value={it.rate} onChange={setItem(i, 'rate')} placeholder="0" aria-label="Rate" />
              <span className="text-[13px] text-slate-900 text-right tabular-nums">{exact(quoteTotals([it]).subtotal, form.currency)}</span>
              <button type="button" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))} disabled={form.items.length === 1} className="icon-act justify-self-end hover:!text-[var(--red)] disabled:opacity-30" aria-label="Remove item"><Trash2 size={15} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, rate: '' }] }))} className="btn btn-sm mt-1"><Plus size={14} /> Add item</button>
        </div>

        <Field label="Currency">
          <select className={inputCls} value={form.currency} onChange={set('currency')}>
            <option value="INR" className="bg-black">INR (₹)</option><option value="USD" className="bg-black">USD ($)</option>
          </select>
        </Field>
        <Field label="Valid until"><input className={inputCls} type="date" value={form.valid_until} onChange={set('valid_until')} /></Field>
        <Field label="Discount (amount)"><input className={inputCls} type="number" min="0" step="any" value={form.discount} onChange={set('discount')} placeholder="0" /></Field>
        <Field label="GST %"><input className={inputCls} type="number" min="0" max="100" step="any" value={form.tax_percent} onChange={set('tax_percent')} /></Field>

        <div className="sm:col-span-2 rounded-ui bg-slate-100 border border-slate-200 p-4 text-[13px] space-y-1 tabular-nums">
          <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{exact(t.subtotal, form.currency)}</span></div>
          {t.discount > 0 && <div className="flex justify-between text-slate-600"><span>Discount</span><span>− {exact(t.discount, form.currency)}</span></div>}
          {Number(form.tax_percent) > 0 && <div className="flex justify-between text-slate-600"><span>GST {Number(form.tax_percent)}%</span><span>{exact(t.tax, form.currency)}</span></div>}
          <div className="flex justify-between font-semibold text-slate-900 text-[16px] pt-1"><span>Total</span><span>{exact(t.total, form.currency)}</span></div>
        </div>

        <Field label="Notes (shown on the PDF)" wide><textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={set('notes')} placeholder="Timeline, what's included…" /></Field>
        <Field label="Terms" wide><textarea className={`${inputCls} resize-none`} rows={3} value={form.terms} onChange={set('terms')} /></Field>

        {error && <p role="alert" className="sm:col-span-2 text-[12.5px] text-[var(--red)]">{error}</p>}
        <div className="sm:col-span-2 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onBack} className="btn btn-ghost">Cancel</button>
          <button type="button" disabled={saving} onClick={() => save(false)} className="btn">{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" disabled={saving} onClick={() => save(true)} className="btn btn-primary"><Download /> Save & download PDF</button>
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
  const [toast, showToast] = useToast()

  // The client's accept/decline page. Only sent quotes can be answered, so copying a draft's link sends it.
  const copyLink = async (d) => {
    setError('')
    try {
      if (d.status === 'draft') { await updateDocument(d.id, { status: 'sent' }); await load() }
      const url = quoteLink(d.share_token)
      try { await navigator.clipboard.writeText(url); showToast({ text: `Link to ${d.number} copied${d.status === 'draft' ? ' · marked as sent' : ''}` }) }
      catch { prompt('Copy this link for your client:', url) }
    } catch (err) { setError(err.message) }
  }
  useOpenOnParam('new', () => setEditing({}), !loading)

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

  const columns = [
    { key: 'quote', label: 'Quotation', sort: d => d.number, render: d => {
      const party = partyOf(d, leads, clients)
      const expired = d.status === 'sent' && d.valid_until && d.valid_until < isoDay()
      return (
        <span className="block min-w-0 max-w-[420px] whitespace-normal py-2">
          <span className="block truncate font-medium text-slate-900"><span className="mr-2 font-mono text-[12px] text-slate-500">{d.number}</span>{d.title}</span>
          <span className="block truncate text-[12px] text-slate-500">{party?.name || 'Unknown'}{d.lead_id && !d.client_id ? ' (lead)' : ''}{d.valid_until ? ` · valid until ${fmtDate(d.valid_until)}` : ''}{expired ? ' · expired' : ''}</span>
          {d.responded_at && (
            <span className="block truncate text-[12px] text-slate-500">
              {d.status === 'accepted' ? 'Accepted' : 'Declined'} online{d.response_name ? ` by ${d.response_name}` : ''} · {fmtDate(d.responded_at)}{d.response_note ? ` · “${d.response_note}”` : ''}
            </span>
          )}
        </span>
      )
    } },
    { key: 'total', label: 'Total', num: true, sort: d => Number(d.total) || 0, render: d => <span className="font-semibold text-slate-900">{formatMoney(d.total, d.currency)}</span> },
    { key: 'status', label: 'Status', render: d => (
      <select value={d.status} onChange={e => run(() => updateDocument(d.id, { status: e.target.value }))} aria-label={`Status of ${d.number}`}
        className={`${badgeCls(statusOf(d.status)?.tone)} cursor-pointer appearance-none pr-2`}>
        {QUOTE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    ) },
    { key: 'created', label: 'Created', className: 'max-md:hidden', sort: d => d.created_at, render: d => <span className="text-slate-600 tabular-nums">{fmtDate(isoDay(new Date(d.created_at)))}</span> },
    { key: 'actions', label: <span className="sr-only">Actions</span>, render: d => (
      <span className="flex items-center justify-end gap-1">
        {d.share_token && d.status !== 'declined' && (
          <button onClick={() => copyLink(d)} className="act" title={d.status === 'draft' ? 'Copy the client link (marks it as sent)' : 'Copy the link your client uses to accept'}>
            <Link2 size={14} /> Client link
          </button>
        )}
        {d.share_token && <a href={`/q/${d.share_token}`} target="_blank" rel="noopener noreferrer" className="icon-act" aria-label="Preview what the client sees" title="Preview what the client sees"><ExternalLink size={15} /></a>}
        <button onClick={() => downloadPdf(d, partyOf(d, leads, clients)).catch(err => setError(err.message))} className="icon-act" aria-label="Download PDF" title="Download PDF"><Download size={15} /></button>
        <button onClick={() => setEditing({ doc: d })} className="icon-act" aria-label="Edit quotation" title="Edit"><Pencil size={15} /></button>
        <button onClick={() => confirm(`Delete ${d.number}?`) && run(() => deleteDocument(d.id))} className="icon-act hover:!text-[var(--red)] hover:!bg-[var(--red-bg)]" aria-label="Delete quotation"><Trash2 size={15} /></button>
      </span>
    ) },
  ]
  const statusFilter = { key: 'status', label: 'Status', all: 'All statuses', options: QUOTE_STATUSES.map(s => ({ value: s.id, label: s.label })), test: (d, v) => d.status === v }

  if (editing) {
    return (
      <AdminLayout>
        <Builder doc={editing.doc} leads={leads} clients={clients} onBack={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageHead title="Quotations" sub="Build a quote, download the PDF, track the answer">
        <button onClick={() => setEditing({})} className="btn btn-primary"><Plus /> New quotation</button>
      </PageHead>

      <div className="card overflow-hidden">
        {error && !docs.length && !loading ? <ErrorState title="Couldn't load quotations" onRetry={load}>{error}</ErrorState> : (
          <>
            {error && <p role="alert" className="border-b border-[var(--red-bd)] bg-[var(--red-bg)] px-4 py-2.5 text-[13px] text-[var(--red)]">{error}</p>}
            <DataTable rows={docs} columns={columns} loading={loading} filters={[statusFilter]} initialSort={{ key: 'created', dir: 'desc' }}
              search={d => [d.number, d.title, partyOf(d, leads, clients)?.name].filter(Boolean).join(' ')} searchLabel="Search number, title, client"
              empty={<EmptyState icon={FileText} title="No quotations yet">Create your first one.</EmptyState>} />
          </>
        )}
      </div>
      {toast}
    </AdminLayout>
  )
}
