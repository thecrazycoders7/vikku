import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FileText, Trash2 } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { Field } from './LeadPanel'
import { fmtDate } from './Lists'
import { Badge, EmptyState, Panel, useToast } from '../ui'
import { DOC_TEMPLATES } from '../../../data/docTemplates'
import { COMPANY_FIELDS } from '../../../lib/docTemplate'
import { deleteClientDoc, getDocSettings, listClientDocs, listClients, setDocSetting } from '../../../lib/crmService'

const CATEGORIES = ['Sales', 'Contracts', 'Delivery', 'Billing', 'Hiring', 'Policies']
const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-400 focus:outline-none'

export default function CrmDocTemplates() {
  const [params] = useSearchParams()
  const clientId = params.get('client')
  const [docs, setDocs] = useState([])
  const [clients, setClients] = useState([])
  const [company, setCompany] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useToast()

  useEffect(() => {
    listClients().then(setClients).catch(e => setError(e.message))
    Promise.all([listClientDocs(), getDocSettings()])
      .then(([d, s]) => { setDocs(d); setCompany(s.company || {}) })
      .catch(() => setError('Documents can be downloaded, but saving needs the database update. Run supabase/migrations/20261101_crm_client_docs.sql.'))
  }, [])

  const client = clients.find(c => c.id === clientId)
  const nameOf = (id) => { const c = clients.find(x => x.id === id); return c ? c.company || c.name : '' }
  const missing = useMemo(() => COMPANY_FIELDS.filter(f => ['LEGAL FORM', 'REGISTERED ADDRESS', 'VIKKU PAN', 'ACCOUNT NUMBER'].includes(f.key) && !company[f.key]?.trim()), [company])

  const saveCompany = async (e) => {
    e.preventDefault()
    setSaving(true)
    try { await setDocSetting('company', company); setToast({ text: 'Business details saved. New documents will use them.' }) }
    catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }
  const remove = async (d) => {
    if (!window.confirm(`Delete "${d.title}"? This cannot be undone.`)) return
    try { await deleteClientDoc(d.id); setDocs(list => list.filter(x => x.id !== d.id)) }
    catch (err) { setError(err.message) }
  }

  return (
    <AdminLayout>
      <div className="mb-4">
        <h1 className="font-display font-bold text-lg text-slate-900">Documents</h1>
        <p className="text-xs text-slate-500">{client ? `Pick a template for ${client.company || client.name}` : 'Pick a template, fill it in for a client, and download a PDF'}</p>
      </div>

      {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      {missing.length > 0 && !error && (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Add your <a href="#business-details" className="font-medium underline">business details</a> once and they'll fill into every document. Missing: {missing.map(f => f.label.toLowerCase()).join(', ')}.
        </p>
      )}

      <div className="space-y-5">
        {!clientId && docs.length > 0 && (
          <Panel title="Saved documents" count={docs.length}>
            <ul className="divide-y divide-slate-100">
              {docs.map(d => (
                <li key={d.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Link to={`/admin/documents/${d.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900 hover:text-orange-700">{d.title}</Link>
                  {nameOf(d.client_id) && <span className="hidden sm:block flex-none text-xs text-slate-500">{nameOf(d.client_id)}</span>}
                  <span className="flex-none text-xs text-slate-400">{fmtDate(d.updated_at)}</span>
                  <button type="button" className="icon-act" aria-label={`Delete ${d.title}`} onClick={() => remove(d)}><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel title="Templates" count={DOC_TEMPLATES.length}>
          {CATEGORIES.map(cat => (
            <div key={cat} className="border-b border-slate-100 last:border-0 px-5 py-3">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">{cat}</p>
              <ul className="grid gap-x-6 sm:grid-cols-2">
                {DOC_TEMPLATES.filter(t => t.category === cat).map(t => (
                  <li key={t.id}>
                    <Link to={`/admin/documents/new?template=${t.id}${clientId ? `&client=${clientId}` : ''}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 hover:bg-slate-50">
                      <FileText size={16} className="flex-none text-slate-400 group-hover:text-orange-600" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">{t.title}</span>
                        <span className="block truncate text-xs text-slate-500">{t.use}</span>
                      </span>
                      {t.party === 'person' && <span className="ml-auto flex-none"><Badge>Staff</Badge></span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {DOC_TEMPLATES.length === 0 && <EmptyState icon={FileText} title="No templates" />}
        </Panel>

        <div id="business-details" className="scroll-mt-20">
          <Panel title="Your business details">
            <form onSubmit={saveCompany} className="grid gap-3 p-5 sm:grid-cols-2">
              {COMPANY_FIELDS.map(f => (
                <Field key={f.key} label={f.label}>
                  <input className={inputCls} placeholder={f.hint} value={company[f.key] || ''} onChange={e => setCompany(c => ({ ...c, [f.key]: e.target.value }))} />
                </Field>
              ))}
              <div className="sm:col-span-2 flex items-center gap-3">
                <button disabled={saving} className="btn-primary text-xs px-4 py-2.5 rounded-xl disabled:opacity-50">{saving ? 'Saving…' : 'Save details'}</button>
                <span className="text-xs text-slate-500">Saved documents keep the details they were made with.</span>
              </div>
            </form>
          </Panel>
        </div>

        <p className="text-xs text-slate-500">These templates are drafts. Have a lawyer check the contracts and a CA check the tax items before first use.</p>
      </div>
      {toast}
    </AdminLayout>
  )
}
