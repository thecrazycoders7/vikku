import { useState } from 'react'
import { Mail, Send, Users, CheckCircle, AlertCircle } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { adminSendEmail } from '../../lib/adminService'

const AUDIENCES = [
  { value: 'all',  label: 'All Users',  desc: 'Everyone with an account' },
  { value: 'free', label: 'Free Users', desc: 'Users on the free plan' },
  { value: 'pro',  label: 'Pro Users',  desc: 'Users on pro or team plan' },
]

export default function AdminEmail() {
  const [form, setForm]   = useState({ subject: '', body: '', audience: 'all' })
  const [sending, setSending] = useState(false)
  const [result, setResult]   = useState(null) // { ok, count } | { error }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!confirm(`Send this email to all ${form.audience} users?`)) return
    setSending(true)
    setResult(null)
    try {
      const r = await adminSendEmail(form)
      setResult({ ok: true, count: r.count })
      setForm(f => ({ ...f, subject: '', body: '' }))
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <AdminLayout title="Email Users">
      <div className="max-w-xl">
        {result && (
          <div className={`flex items-center gap-2 text-sm mb-5 p-4 glass rounded-xl border ${
            result.ok ? 'text-green-400 border-green-500/20' : 'text-red-400 border-red-500/20'
          }`}>
            {result.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {result.ok ? `Sent to ${result.count} users successfully` : result.error}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          {/* Audience */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users size={11} /> Audience
            </p>
            <div className="grid grid-cols-3 gap-2">
              {AUDIENCES.map(a => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, audience: a.value }))}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    form.audience === a.value
                      ? 'border-white/20 bg-white/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <p className="text-xs font-medium text-white">{a.label}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Compose */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Mail size={11} /> Compose
            </p>
            <input
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Subject"
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
              required
            />
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Email body (plain text or HTML)…"
              rows={10}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none resize-none font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-white text-black text-sm font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {sending ? 'Sending…' : `Send to ${AUDIENCES.find(a => a.value === form.audience)?.label}`}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
