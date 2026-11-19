import { useState } from 'react'
import { Mail, Send, Users, CheckCircle, AlertCircle } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { PageHead } from './ui'
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
    <AdminLayout>
      <PageHead title="Email Users" />
      <div className="max-w-xl">
        {result && (
          <div role={result.ok ? 'status' : 'alert'} className={`flex items-center gap-2 text-[13px] mb-4 px-4 py-2.5 rounded-ui border ${
            result.ok ? 'text-[var(--green)] bg-[var(--green-bg)] border-[var(--green-bd)]' : 'text-[var(--red)] bg-[var(--red-bg)] border-[var(--red-bd)]'
          }`}>
            {result.ok ? <CheckCircle size={16} aria-hidden="true" /> : <AlertCircle size={16} aria-hidden="true" />}
            {result.ok ? `Sent to ${result.count} users successfully` : result.error}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          <fieldset className="card p-4">
            <legend className="sr-only">Audience</legend>
            <p className="section-title flex items-center gap-2"><Users size={16} aria-hidden="true" className="text-slate-400" /> Audience</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {AUDIENCES.map(a => (
                <button
                  key={a.value}
                  type="button"
                  aria-pressed={form.audience === a.value}
                  onClick={() => setForm(f => ({ ...f, audience: a.value }))}
                  className={`p-3 rounded-ui text-left border transition-colors ${
                    form.audience === a.value
                      ? 'border-slate-900 bg-white ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:bg-slate-100'
                  }`}
                >
                  <p className="text-[13px] font-medium text-slate-900">{a.label}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{a.desc}</p>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="card p-4 space-y-3">
            <p className="section-title flex items-center gap-2 !mb-0"><Mail size={16} aria-hidden="true" className="text-slate-400" /> Compose</p>
            <input
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Subject"
              aria-label="Subject"
              className="input"
              required
            />
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Email body (plain text or HTML)…"
              aria-label="Email body"
              rows={10}
              className="input resize-none font-mono !text-[12.5px]"
              required
            />
          </div>

          <button type="submit" disabled={sending} className="btn btn-primary w-full !h-10">
            <Send />
            {sending ? 'Sending…' : `Send to ${AUDIENCES.find(a => a.value === form.audience)?.label}`}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
