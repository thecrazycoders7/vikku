import { useEffect, useState } from 'react'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { Badge, PageHead } from './ui'
import { supabase } from '../../lib/supabaseClient'
import { getAdminOverview } from '../../lib/adminService'

export default function AdminProfile() {
  const [user, setUser]       = useState(null)
  const [overview, setOverview] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState(null) // { type: 'ok'|'err', text }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user))
    getAdminOverview().then(setOverview).catch(() => {})
  }, [])

  const handlePassword = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setMsg({ type: 'err', text: 'Passwords do not match' }); return }
    if (password.length < 8)  { setMsg({ type: 'err', text: 'Minimum 8 characters' }); return }
    setSaving(true)
    setMsg(null)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    setMsg(error ? { type: 'err', text: error.message } : { type: 'ok', text: 'Password updated successfully' })
    if (!error) { setPassword(''); setConfirm('') }
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'AD'
  const joined   = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

  return (
    <AdminLayout>
      <PageHead title="Admin Profile" />
      <div className="max-w-xl space-y-4">
        <div className="card p-4 sm:p-5 flex items-center gap-4">
          <div aria-hidden="true" className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <span className="font-semibold text-lg text-slate-700">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-[14px] break-all">{user?.email || '-'}</p>
            <p className="text-[12.5px] text-slate-500 mt-0.5 tabular-nums">Joined {joined}</p>
            <span className="mt-2 inline-block"><Badge tone="violet">Admin</Badge></span>
          </div>
        </div>

        {overview && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'MRR', value: `₹${overview.mrr.toLocaleString('en-IN')}` },
              { label: 'Total Users', value: overview.totalUsers },
              { label: 'Paid', value: overview.proUsers + overview.teamUsers },
            ].map(({ label, value }) => (
              <div key={label} className="card kpi">
                <p className="kpi-label">{label}</p>
                <p className="kpi-value">{value}</p>
              </div>
            ))}
          </div>
        )}

        <section className="card">
          <header className="card-head"><h2>Change Password</h2></header>
          <div className="p-4">
            {msg && (
              <div role={msg.type === 'ok' ? 'status' : 'alert'} className={`flex items-center gap-2 text-[13px] mb-3 ${msg.type === 'ok' ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {msg.type === 'ok' ? <CheckCircle size={16} aria-hidden="true" /> : <AlertCircle size={16} aria-hidden="true" />}
                {msg.text}
              </div>
            )}
            <form onSubmit={handlePassword} className="space-y-3">
              <label className="input-group">
                <Lock aria-hidden="true" />
                <span className="sr-only">New password</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" className="input" required />
              </label>
              <label className="input-group">
                <Lock aria-hidden="true" />
                <span className="sr-only">Confirm new password</span>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="input" required />
              </label>
              <button type="submit" disabled={saving} className="btn btn-primary w-full !h-10">
                {saving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
