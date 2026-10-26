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
        <select value={kind} onChange={e => setKind(e.target.value)} className="glass rounded-xl px-3 py-2 text-xs text-white focus:outline-none bg-transparent">
          {ACTIVITY_KINDS.map(k => <option key={k.id} value={k.id} className="bg-black">{k.label}</option>)}
        </select>
        <input value={body} onChange={e => setBody(e.target.value)} placeholder="What happened? e.g. Called, interested in a WhatsApp bot, send quote Friday"
          className="flex-1 glass rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none" />
        <button type="submit" disabled={saving || !body.trim()} className="btn-primary rounded-xl px-4 py-2 text-xs disabled:opacity-50">
          {saving ? 'Saving…' : 'Add'}
        </button>
      </form>
      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
      {items.length === 0 ? (
        <p className="text-xs text-white/30">No activity yet.</p>
      ) : (
        <ol className="space-y-3">
          {items.map(a => {
            const Icon = ICONS[a.kind] || MessageSquare
            return (
              <li key={a.id} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0"><Icon size={13} /></span>
                <div className="min-w-0">
                  <p className="text-xs text-white/80 break-words">{describe(a)}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{ACTIVITY_KINDS.find(k => k.id === a.kind)?.label || ''}{ACTIVITY_KINDS.some(k => k.id === a.kind) ? ' · ' : ''}{when(a.created_at)}</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
