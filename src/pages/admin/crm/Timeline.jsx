import { useEffect, useState } from 'react'
import { MessageSquare, Phone, Mail, Calendar, ArrowRight, Sparkles, UserCheck, Send } from 'lucide-react'
import { ACTIVITY_KINDS, addActivity, listActivity, stageLabel } from '../../../lib/crmService'

const ICONS = { note: MessageSquare, call: Phone, email: Mail, whatsapp: Send, meeting: Calendar, stage_change: ArrowRight, created: Sparkles, converted: UserCheck }

function describe(a) {
  if (a.kind === 'stage_change' && a.body?.includes(' → ')) {
    const [from, to] = a.body.split(' → ')
    return `Moved from ${stageLabel(from)} to ${stageLabel(to)}`
  }
  return a.body
}

const when = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

// Activity history for a lead and/or client, with a box to log notes, calls and messages.
export default function Timeline({ leadId, clientId }) {
  const [items, setItems] = useState([])
  const [kind, setKind] = useState('note')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => listActivity({ leadId, clientId }).then(setItems).catch(e => setError(e.message))
  useEffect(() => { load() }, [leadId, clientId])

  const add = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSaving(true); setError('')
    try {
      await addActivity({ lead_id: clientId ? null : leadId, client_id: clientId || null, kind, body: body.trim() })
      setBody('')
      await load()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <form onSubmit={add} className="flex flex-col sm:flex-row gap-2 mb-4">
        <select value={kind} onChange={e => setKind(e.target.value)} aria-label="Activity type" className="input sm:!w-36">
          {ACTIVITY_KINDS.map(k => <option key={k.id} value={k.id} className="bg-black">{k.label}</option>)}
        </select>
        <input value={body} onChange={e => setBody(e.target.value)} placeholder="What happened? e.g. Called, interested in a WhatsApp bot, send quote Friday"
          aria-label="What happened" className="input flex-1" />
        <button type="submit" disabled={saving || !body.trim()} className="btn btn-primary h-9">
          {saving ? 'Saving…' : 'Add'}
        </button>
      </form>
      {error && <p role="alert" className="text-[12.5px] text-[var(--red)] mb-3">{error}</p>}
      {items.length === 0 ? (
        <p className="text-[13px] text-slate-500">No activity yet.</p>
      ) : (
        <ol className="space-y-3">
          {items.map(a => {
            const Icon = ICONS[a.kind] || MessageSquare
            return (
              <li key={a.id} className="flex gap-3">
                <span aria-hidden="true" className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0"><Icon size={14} /></span>
                <div className="min-w-0">
                  <p className="text-[13px] text-slate-700 break-words">{describe(a)}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">{ACTIVITY_KINDS.find(k => k.id === a.kind)?.label || ''}{ACTIVITY_KINDS.some(k => k.id === a.kind) ? ' · ' : ''}{when(a.created_at)}</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
