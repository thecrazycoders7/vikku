import { useEffect, useState } from 'react'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import AdminLayout from './AdminLayout'
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
    <AdminLayout title="Admin Profile">
      <div className="max-w-xl space-y-5">
        {/* Avatar + info */}
        <div className="glass rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/30 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-xl text-violet-300">{initials}</span>
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{user?.email || '-'}</p>
            <p className="text-xs text-white/40 mt-0.5">Joined {joined}</p>
            <span className="mt-2 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">Admin</span>
          </div>
        </div>

        {/* Quick stats */}
        {overview && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'MRR', value: `₹${overview.mrr.toLocaleString('en-IN')}`, color: 'text-green-400' },
              { label: 'Total Users', value: overview.totalUsers, color: 'text-white' },
              { label: 'Paid', value: overview.proUsers + overview.teamUsers, color: 'text-violet-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <p className={`font-display font-bold text-xl ${color}`}>{value}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Change password */}
        <div className="glass rounded-2xl p-6">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-5">Change Password</p>
          {msg && (
            <div className={`flex items-center gap-2 text-sm mb-4 ${msg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
              {msg.type === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {msg.text}
            </div>
          )}
          <form onSubmit={handlePassword} className="space-y-3">
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                required
              />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-white text-black text-sm font-semibold py-2.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
