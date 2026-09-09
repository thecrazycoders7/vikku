import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { Search, RefreshCw, ChevronDown, Download, X, Folder, AlertTriangle } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { getAdminUsers, adminChangePlan, getAdminUserDetail, adminDeleteUser, getAdminExpiring } from '../../lib/adminService'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

const PLAN_STYLES = {
  free:  'bg-white/10 text-white/50',
  pro:   'bg-violet-500/20 text-violet-300',
  team:  'bg-blue-500/20 text-blue-300',
}

function timeAgo(dateStr) {
  if (!dateStr) return '-'
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  const m = Math.floor(d / 30)
  if (m < 12) return `${m}mo ago`
  return `${Math.floor(m / 12)}y ago`
}

function fmt(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function PlanDropdown({ userId, currentPlan, onChanged }) {
  const [open, setOpen]     = useState(false)
  const [saving, setSaving] = useState(false)

  const change = async (plan) => {
    if (plan === currentPlan) { setOpen(false); return }
    setSaving(true)
    try { await adminChangePlan(userId, plan); onChanged(userId, plan) }
    catch (err) { console.error(err) }
    finally { setSaving(false); setOpen(false) }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${PLAN_STYLES[currentPlan] || PLAN_STYLES.free}`}
      >
        {saving ? '…' : currentPlan}
        <ChevronDown size={9} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 glass rounded-xl p-1 w-24 shadow-xl">
          {['free', 'pro', 'team'].map(p => (
            <button
              key={p}
              onClick={() => change(p)}
              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                p === currentPlan ? 'text-white/30 cursor-default' : 'text-white/80 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function UserDetailModal({ userId, onClose, onDeleted }) {
  useLockBodyScroll()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getAdminUserDetail(userId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  const handleDelete = async () => {
    if (!confirm(`Permanently delete ${data?.user?.email}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await adminDeleteUser(userId)
      onDeleted(userId)
      onClose()
    } catch (err) {
      alert(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors" aria-label="Close">
          <X size={16} />
        </button>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">User Detail</p>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            <div className="space-y-2 mb-5">
              <p className="text-sm font-mono text-white">{data.user?.email}</p>
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PLAN_STYLES[data.subscription?.plan || 'free'] || PLAN_STYLES.free}`}>
                  {data.subscription?.plan || 'free'}
                </span>
                {data.subscription?.status && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">
                    {data.subscription.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/40">Joined: {fmt(data.user?.created_at)}</p>
              {data.subscription?.current_period_end && (
                <p className="text-xs text-white/40">Period ends: {fmt(data.subscription.current_period_end)}</p>
              )}
            </div>

            {data.projects?.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Folder size={10} /> {data.projects.length} Projects
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {data.projects.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-white/70 truncate flex-1">{p.name}</span>
                      <span className="text-white/30 ml-2">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full text-sm font-medium py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete User'}
            </button>
          </>
        ) : (
          <p className="text-sm text-white/40 text-center py-8">Failed to load user</p>
        )}
      </div>
    </div>
  )
}

function exportCSV(rows) {
  const header = ['Email', 'Plan', 'Projects', 'Joined', 'Last Sign In']
  const csv = [header, ...rows.map(u => [u.email, u.plan, u.projectCount, u.joinedAt, u.lastSignIn || ''])]
    .map(r => r.join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'users.csv'
  a.click()
}

export default function AdminUsers() {
  const [users, setUsers]               = useState([])
  const [expiring, setExpiring]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [planFilter, setPlanFilter]     = useState('all')
  const [activeFilter, setActiveFilter] = useState(false)
  const [detailUserId, setDetailUserId] = useState(null)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [d, e] = await Promise.all([getAdminUsers(), getAdminExpiring()])
      setUsers(d.users || [])
      setExpiring(e.expiring || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useAutoRefresh(load)

  const handlePlanChanged = (userId, plan) => {
    setUsers(u => u.map(row => row.id === userId ? { ...row, plan } : row))
  }

  const handleDeleted = (userId) => {
    setUsers(u => u.filter(row => row.id !== userId))
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const filtered = users.filter(u => {
    if (search && !u.email?.toLowerCase().includes(search.toLowerCase())) return false
    if (planFilter !== 'all' && u.plan !== planFilter) return false
    if (activeFilter && (!u.lastSignIn || u.lastSignIn < sevenDaysAgo)) return false
    return true
  })

  return (
    <AdminLayout title="Users">
      {/* Expiry alerts */}
      {expiring.length > 0 && (
        <div className="glass rounded-xl p-4 mb-4 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={13} className="text-orange-400" />
            <p className="text-xs font-medium text-orange-400">{expiring.length} subscription{expiring.length !== 1 ? 's' : ''} expiring within 7 days</p>
          </div>
          <div className="space-y-1">
            {expiring.map(s => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-mono truncate flex-1">{s.email}</span>
                <span className="text-orange-400/70 ml-3 flex-shrink-0">expires {new Date(s.current_period_end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email…"
            className="w-full glass rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none"
          />
        </div>
        <span className="text-xs text-white/40">{filtered.length} users</span>
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors ml-auto"
        >
          <Download size={12} /> CSV
        </button>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['all', 'free', 'pro', 'team'].map(f => (
          <button
            key={f}
            onClick={() => setPlanFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${
              planFilter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => setActiveFilter(a => !a)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            activeFilter ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Active 7d
        </button>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 mb-4 text-sm text-red-400 border border-red-500/20">{error}</div>
      )}

      {loading && !users.length ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_56px_88px_88px_80px] gap-3 px-4 py-2.5 border-b border-white/[0.06] text-[10px] text-white/30 uppercase tracking-widest">
            <span>Email</span>
            <span>Plan</span>
            <span className="text-right">Projects</span>
            <span>Joined</span>
            <span>Last Active</span>
            <span className="text-right">Change</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-white/30">No users found</div>
          ) : (
            filtered.map((u, i) => (
              <div
                key={u.id}
                onClick={() => setDetailUserId(u.id)}
                className={`grid grid-cols-[1fr_80px_56px_88px_88px_80px] gap-3 px-4 py-3 items-center cursor-pointer ${
                  i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''
                } hover:bg-white/[0.02] transition-colors`}
              >
                <span className="text-xs text-white/80 truncate font-mono">{u.email}</span>
                <span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PLAN_STYLES[u.plan] || PLAN_STYLES.free}`}>
                    {u.plan}
                  </span>
                </span>
                <span className="text-xs text-white/50 text-right">{u.projectCount}</span>
                <span className="text-xs text-white/40">{timeAgo(u.joinedAt)}</span>
                <span className="text-xs text-white/40">{timeAgo(u.lastSignIn)}</span>
                <div className="flex justify-end" onClick={e => e.stopPropagation()}>
                  <PlanDropdown userId={u.id} currentPlan={u.plan} onChanged={handlePlanChanged} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {detailUserId && (
        <UserDetailModal
          userId={detailUserId}
          onClose={() => setDetailUserId(null)}
          onDeleted={handleDeleted}
        />
      )}
    </AdminLayout>
  )
}
