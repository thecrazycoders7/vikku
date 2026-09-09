import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { RefreshCw, UserPlus, TrendingUp, Folder, CreditCard, LogIn } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { getAdminActivity } from '../../lib/adminService'

const TYPE_META = {
  signup:    { icon: UserPlus,    color: 'text-green-400',  label: 'Signed up' },
  upgrade:   { icon: TrendingUp,  color: 'text-violet-400', label: 'Upgraded' },
  project:   { icon: Folder,      color: 'text-blue-400',   label: 'Created project' },
  payment:   { icon: CreditCard,  color: 'text-emerald-400',label: 'Payment received' },
  signin:    { icon: LogIn,       color: 'text-white/40',   label: 'Signed in' },
}

function timeAgo(dateStr) {
  if (!dateStr) return '-'
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AdminActivity() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const d = await getAdminActivity()
      setEvents(d.events || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useAutoRefresh(load, 30000)

  return (
    <AdminLayout title="Activity Feed">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-white/40">Last 50 actions across all users</p>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && <div className="glass rounded-xl p-4 mb-4 text-sm text-red-400 border border-red-500/20">{error}</div>}

      {loading && !events.length ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-white/30">No activity yet</div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {events.map((ev, i) => {
            const meta = TYPE_META[ev.type] || TYPE_META.signin
            const Icon = meta.icon
            return (
              <div
                key={i}
                className={`flex items-start gap-3 px-4 py-3 ${i !== events.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}
              >
                <div className={`w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={12} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-white/70 truncate font-mono">{ev.email || 'Unknown'}</p>
                    <span className="text-[10px] text-white/25 flex-shrink-0">{timeAgo(ev.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5">{meta.label}{ev.detail ? ` - ${ev.detail}` : ''}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
