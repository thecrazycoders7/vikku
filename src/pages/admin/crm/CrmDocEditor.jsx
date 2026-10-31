import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download, Pencil, Plus, Save } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { useToast } from '../ui'
import { DOC_TEMPLATES } from '../../../data/docTemplates'
import { addRow, choicesOf, clientValues, columnWeights, defaultValues, fieldsOf, parseTemplate } from '../../../lib/docTemplate'
import { downloadTemplatePdf } from '../../../lib/docTemplatePdf'
import { logoDataUrl } from '../../../lib/quotePdf'
import { createClientDoc, deleteDocSetting, getClientDoc, getDocSettings, listClients, setDocSetting, updateClientDoc } from '../../../lib/crmService'

const ACRONYMS = /\b(gstin|gst|pan|sow|ifsc|upi|id|ctc|ai|sms)\b/g
const hintText = (h) => ({ N: 'no.', Nth: 'nth' }[h] || h.replace('VIKKU ', '').toLowerCase().replace(/^./, c => c.toUpperCase()).replace(ACRONYMS, m => m.toUpperCase()))

function Blank({ seg, value, onChange, inCell }) {
  const label = hintText(seg.hint)
  const shared = { value, 'aria-label': label, placeholder: label, onChange: e => onChange(e.target.value) }
  const cls = `rounded border-b px-1 text-sm outline-none focus:border-orange-500 ${value ? 'border-slate-300 bg-orange-50/60 text-slate-900' : 'border-sky-300 bg-sky-50 text-slate-900 placeholder-sky-500/70'}`
  if (seg.hint.length > 34 || value.length > 44) {
    return <textarea rows={Math.min(5, Math.ceil(Math.max(value.length, seg.hint.length) / (inCell ? 24 : 64)) + 1)} {...shared} className={`${cls} block w-full resize-y py-0.5`} />
  }
  const choices = choicesOf(seg.hint)
  const width = Math.min(Math.max((value || label).length, 5) + 3, 46)
  return (
    <>
      <input {...shared} list={choices ? `opts-${seg.field}` : undefined} className={`${cls} max-w-full py-0 ${inCell ? 'w-0 min-w-[3ch] flex-1' : ''}`} style={inCell ? undefined : { width: `${width}ch` }} />
      {choices && <datalist id={`opts-${seg.field}`}>{choices.map(c => <option key={c} value={c} />)}</datalist>}
    </>
  )
}

function Segments({ segments, fields, set, inCell }) {
  return segments.map((s, i) => (
    <Fragment key={i}>
      {s.box ? <input type="checkbox" aria-label="Tick" className="mr-1 align-middle accent-orange-600" checked={!!fields[s.box]} onChange={e => set(s.box, e.target.checked ? 'yes' : '')} />
        : s.field ? <Blank seg={s} value={fields[s.field] || ''} onChange={v => set(s.field, v)} inCell={inCell} />
        : s.bold ? <strong>{s.text}</strong> : s.text}
    </Fragment>
  ))
}

function Sheet({ title, blocks, fields, set, onAddRow }) {
  return (
    <div className="mx-auto w-full max-w-[794px] rounded-lg border border-slate-200 bg-white px-5 py-6 sm:px-12 sm:py-10 text-[14px] leading-relaxed text-slate-900">
      <header className="flex items-center gap-2.5 border-b-2 border-orange-600 pb-3">
        <img src="/logo-sm.png" alt="" width="28" height="28" className="h-7 w-7" />
        <span className="text-lg font-bold">Vikku Labs</span>
        <span className="ml-auto hidden text-right text-[11px] leading-snug text-slate-500 sm:block">www.vikku.in · connect@vikku.in<br />+91 93939 79892 · Hyderabad, Telangana</span>
      </header>
      <h2 className="mb-4 mt-5 text-2xl font-bold">{title}</h2>
      {blocks.map((b, i) => {
        if (b.type === 'page') return <hr key={i} className="my-6 border-dashed border-slate-300" />
        if (b.type === 'heading') return <h3 key={i} className="mb-2 mt-5 text-[15px] font-bold text-orange-600">{b.text}</h3>
        if (b.type === 'check') return <p key={i} className="mb-1"><Segments segments={[{ box: b.box }, ...b.segments]} fields={fields} set={set} /></p>
        if (b.type === 'item') return <p key={i} className="mb-1.5 flex gap-2"><span className="w-5 flex-none text-right text-slate-500">{b.marker}</span><span className="min-w-0 flex-1"><Segments segments={b.segments} fields={fields} set={set} /></span></p>
        if (b.type === 'para') return <p key={i} className="mb-2"><Segments segments={b.segments} fields={fields} set={set} /></p>
        const repeat = b.rows.filter(r => r.repeats).pop()
        const weights = columnWeights(b)
        const total = weights.reduce((a, w) => a + w, 0)
        return (
          <div key={i} className="mb-4 overflow-x-auto">
            <table className="w-full min-w-[460px] table-fixed border-collapse text-[13px]">
              <colgroup>{weights.map((w, j) => <col key={j} style={{ width: `${(100 * w) / total}%` }} />)}</colgroup>
              <thead><tr className="bg-orange-50">{b.header.map((h, j) => <th key={j} className="border border-slate-200 px-2 py-1.5 text-left font-bold">{h}</th>)}</tr></thead>
              <tbody>
                {b.rows.map(r => (
                  <tr key={r.line}>{r.cells.map((c, j) => <td key={j} className="border border-slate-200 px-2 py-1.5 align-top"><div className="flex flex-wrap items-center gap-x-1"><Segments segments={c} fields={fields} set={set} inCell /></div></td>)}</tr>
                ))}
              </tbody>
            </table>
            {repeat && <button type="button" className="act mt-1.5" onClick={() => onAddRow(repeat)}><Plus size={12} className="mr-1" /> Add row</button>}
          </div>
        )
      })}
    </div>
  )
}

export default function CrmDocEditor() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [clients, setClients] = useState([])
  const [settings, setSettings] = useState({})
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [wording, setWording] = useState(false)
  const [toast, setToast] = useToast()

  useEffect(() => {
    (async () => {
      const [cl, st] = await Promise.all([listClients().catch(() => []), getDocSettings().catch(() => ({}))])
      setClients(cl); setSettings(st)
      if (id) return setDoc(await getClientDoc(id))
      const t = DOC_TEMPLATES.find(x => x.id === params.get('template'))
      if (!t) return navigate('/admin/documents', { replace: true })
      const body = st[`template:${t.id}`]?.body || t.body
      const client = t.party === 'client' ? cl.find(c => c.id === params.get('client')) : null
      setDoc({
        template_id: t.id, client_id: client?.id || null, body,
        title: client ? `${t.title} - ${client.company || client.name}` : t.title,
        fields: { ...defaultValues(parseTemplate(body), st.company), ...(client ? clientValues(client) : {}) },
      })
    })().catch(e => setError(e.message))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const template = DOC_TEMPLATES.find(t => t.id === doc?.template_id)
  const blocks = useMemo(() => doc ? parseTemplate(doc.body) : [], [doc?.body]) // eslint-disable-line react-hooks/exhaustive-deps
  const left = doc ? fieldsOf(blocks).filter(f => !doc.fields[f.field]?.trim()).length : 0

  const change = (patch) => { setDoc(d => ({ ...d, ...patch })); setDirty(true) }
  const setField = (key, v) => change({ fields: { ...doc.fields, [key]: v } })
  const pickClient = (e) => {
    const c = clients.find(x => x.id === e.target.value)
    change({
      client_id: c?.id || null,
      title: c ? `${template.title} - ${c.company || c.name}` : template.title,
      fields: c ? { ...doc.fields, ...clientValues(c) } : doc.fields,
    })
  }
  const onAddRow = (row) => change(addRow(doc.body, row, doc.fields))

  const save = async () => {
    const { id: docId, client_id, template_id, title, body, fields } = doc
    if (!title.trim()) throw new Error('Add a title.')
    if (docId) return updateClientDoc(docId, { client_id, title, body, fields })
    const made = await createClientDoc({ client_id, template_id, title, body, fields })
    setDoc(d => ({ ...d, id: made.id }))
    window.history.replaceState(null, '', `/admin/documents/${made.id}`)
    return made
  }
  const run = (fn) => async () => {
    setBusy(true); setError('')
    try { await fn() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const onSave = run(async () => { await save(); setDirty(false); setToast({ text: 'Document saved.' }) })
  // The PDF comes first, so a failed save never stops someone getting their document.
  const onDownload = run(async () => {
    await downloadTemplatePdf({ ...doc, heading: template?.title || doc.title }, await logoDataUrl())
    await save(); setDirty(false)
  })
  const saveAsTemplate = run(async () => {
    await setDocSetting(`template:${template.id}`, { body: doc.body })
    setSettings(s => ({ ...s, [`template:${template.id}`]: { body: doc.body } }))
    setToast({ text: 'New documents from this template will use this wording.' })
  })
  const resetTemplate = run(async () => {
    await deleteDocSetting(`template:${template.id}`)
    setSettings(({ [`template:${template.id}`]: _, ...rest }) => rest)
    change({ body: template.body })
    setToast({ text: 'Back to the original wording.' })
  })
  const leave = (e) => { if (dirty && !window.confirm('Leave without saving your changes?')) e.preventDefault() }

  return (
    <AdminLayout>
      <Link to="/admin/documents" onClick={leave} className="mb-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"><ArrowLeft size={13} /> Documents</Link>
      {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      {!doc ? <div className="flex h-32 items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div> : (
        <>
          <div className="sticky top-16 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <input aria-label="Document title" value={doc.title} onChange={e => change({ title: e.target.value })} className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-orange-400 focus:outline-none" />
            {template?.party === 'client' && (
              <select aria-label="Client" value={doc.client_id || ''} onChange={pickClient} className="max-w-[220px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900">
                <option value="">Choose a client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
              </select>
            )}
            <span className={`text-xs ${left ? 'text-sky-700' : 'text-emerald-700'}`}>{left ? `${left} blank${left === 1 ? '' : 's'} left` : 'All filled in'}</span>
            <button type="button" onClick={() => setWording(w => !w)} className="act" aria-expanded={wording}><Pencil size={12} className="mr-1" /> Edit wording</button>
            <button type="button" disabled={busy} onClick={onSave} className="act disabled:opacity-50"><Save size={12} className="mr-1" /> Save</button>
            <button type="button" disabled={busy} onClick={onDownload} className="btn-primary flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs disabled:opacity-50"><Download size={13} /> Download PDF</button>
          </div>

          {wording && (
            <section className="mx-auto mb-4 w-full max-w-[794px] rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-2 text-xs text-slate-500">Changes apply to this document. Put a blank in square capitals like [CLIENT]. Use <code>- [ ]</code> for a tick box, <code>###</code> for a heading and <code>**bold**</code> for bold.</p>
              <textarea aria-label="Document wording" rows={16} value={doc.body} onChange={e => change({ body: e.target.value })} className="w-full resize-y rounded-lg border border-slate-200 p-3 font-mono text-xs leading-relaxed text-slate-900 focus:border-orange-400 focus:outline-none" />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button type="button" disabled={busy} onClick={saveAsTemplate} className="act disabled:opacity-50">Use this wording for all new documents</button>
                {settings[`template:${template.id}`] && <button type="button" disabled={busy} onClick={resetTemplate} className="act disabled:opacity-50">Reset to original wording</button>}
              </div>
            </section>
          )}

          <Sheet title={template?.title || doc.title} blocks={blocks} fields={doc.fields} set={setField} onAddRow={onAddRow} />
        </>
      )}
      {toast}
    </AdminLayout>
  )
}
