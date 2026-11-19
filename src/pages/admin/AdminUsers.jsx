import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { RefreshCw, Download, X, Folder, AlertTriangle, Users as UsersIcon } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { Badge, DataTable, EmptyState, ErrorState, PageHead, Skeleton } from './ui'
import { getAdminUsers, adminChangePlan, getAdminUserDetail, adminDeleteUser, getAdminExpiring } from '../../lib/adminService'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

const PLAN_TONE = { free: 'slate', pro: 'violet', team: 'blue' }

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
  const [saving, setSaving] = useState(false)
  const change = async (plan) => {
    if (plan === currentPlan) return
    setSaving(true)
    try { await adminChangePlan(userId, plan); onChanged(userId, plan) }
    catch (err) { console.error(err) }
    finally { setSaving(false) }
  }
  return (
    <select value={currentPlan} disabled={saving} onChange={e => change(e.target.value)} aria-label={`Change plan (now ${currentPlan})`}
      className="act cursor-pointer">
      {['free', 'pro', 'team'].map(p => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
    </select>
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
    <div className="overlay" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="User detail" className="dialog !max-w-md" onClick={e => e.stopPropagation()}>
        <div className="dialog-head">
          <h2>User detail</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm text-slate-500" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="dialog-body">
          {loading ? (
            <div className="space-y-2.5 py-2"><Skeleton className="h-4 w-56" /><Skeleton className="h-5 w-24 rounded-full" /><Skeleton className="h-3 w-40" /></div>
          ) : data ? (
            <>
              <div className="space-y-2 mb-5">
                <p className="text-[14px] font-mono text-slate-900 break-all">{data.user?.email}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge tone={PLAN_TONE[data.subscription?.plan || 'free']}><span className="capitalize">{data.subscription?.plan || 'free'}</span></Badge>
                  {data.subscription?.status && <Badge tone="slate">{data.subscription.status}</Badge>}
                </div>
                <p className="text-[12.5px] text-slate-500 tabular-nums">Joined: {fmt(data.user?.created_at)}</p>
                {data.subscription?.current_period_end && (
                  <p className="text-[12.5px] text-slate-500 tabular-nums">Period ends: {fmt(data.subscription.current_period_end)}</p>
                )}
              </div>

              {data.projects?.length > 0 && (
                <div className="mb-1">
                  <p className="section-title flex items-center gap-1.5 !mb-2"><Folder size={14} aria-hidden="true" className="text-slate-400" /> {data.projects.length} Projects</p>
                  <div className="divide-y divide-slate-200 max-h-40 overflow-y-auto rounded-ui border border-slate-200">
                    {data.projects.map(p => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-2 text-[13px]">
                        <span className="text-slate-900 truncate flex-1">{p.name}</span>
                        <span className="text-slate-500 ml-2">{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <ErrorState title="Failed to load user" />
          )}
        </div>
        {data && (
          <div className="dialog-foot">
            <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">{deleting ? 'Deleting…' : 'Delete User'}</button>
          </div>
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
  const columns = [
    { key: 'email', label: 'Email', sort: u => u.email?.toLowerCase(), render: u => <span className="font-mono text-[12.5px] text-slate-900 block max-w-[320px] truncate">{u.email}</span> },
    { key: 'plan', label: 'Plan', sort: u => ({ free: 0, pro: 1, team: 2 })[u.plan] ?? 0, render: u => <Badge tone={PLAN_TONE[u.plan] || 'slate'}><span className="capitalize">{u.plan}</span></Badge> },
    { key: 'projects', label: 'Projects', num: true, sort: u => u.projectCount, render: u => <span className="text-slate-600">{u.projectCount}</span> },
    { key: 'joined', label: 'Joined', className: 'max-sm:hidden', sort: u => u.joinedAt, render: u => <span className="text-slate-600" title={fmt(u.joinedAt)}>{timeAgo(u.joinedAt)}</span> },
    { key: 'active', label: 'Last active', className: 'max-md:hidden', sort: u => u.lastSignIn, render: u => <span className="text-slate-600">{timeAgo(u.lastSignIn)}</span> },
    { key: 'change', label: <span className="sr-only">Change plan</span>, render: u => (
      <div className="flex justify-end" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
        <PlanDropdown userId={u.id} currentPlan={u.plan} onChanged={handlePlanChanged} />
      </div>
    ) },
  ]
  const filters = [
    { key: 'plan', label: 'Plan', all: 'All plans', options: ['free', 'pro', 'team'].map(p => ({ value: p, label: p[0].toUpperCase() + p.slice(1) })), test: (u, v) => u.plan === v },
    { key: 'active', label: 'Activity', all: 'Any activity', options: [{ value: '7d', label: 'Active 7d' }], test: u => u.lastSignIn && u.lastSignIn >= sevenDaysAgo },
  ]

  return (
    <AdminLayout>
      <PageHead title="Users">
        <button onClick={load} disabled={loading} className="btn btn-ghost text-slate-600">
          <RefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </PageHead>

      {expiring.length > 0 && (
        <div role="status" className="rounded-ui-lg border border-[var(--amber-bd)] bg-[var(--amber-bg)] p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} aria-hidden="true" className="text-[var(--amber)]" />
            <p className="text-[13px] font-medium text-[var(--amber)]">{expiring.length} subscription{expiring.length !== 1 ? 's' : ''} expiring within 7 days</p>
          </div>
          <div className="space-y-1">
            {expiring.map(s => (
              <div key={s.id} className="flex items-center justify-between text-[12.5px]">
                <span className="text-slate-700 font-mono truncate flex-1">{s.email}</span>
                <span className="text-[var(--amber)] ml-3 flex-shrink-0 tabular-nums">expires {new Date(s.current_period_end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {error && !users.length ? <ErrorState title="Couldn't load users" onRetry={load}>{error}</ErrorState> : (
          <DataTable rows={users} columns={columns} loading={loading && !users.length} filters={filters} initialSort={{ key: 'joined', dir: 'desc' }}
            search={u => u.email || ''} searchLabel="Search email" onRowClick={u => setDetailUserId(u.id)}
            toolbar={visible => (
              <>
                <span className="text-[12.5px] text-slate-500 tabular-nums">{visible.length} users</span>
                <button onClick={() => exportCSV(visible)} className="btn btn-sm"><Download size={14} /> CSV</button>
              </>
            )}
            empty={<EmptyState icon={UsersIcon} title="No users found" />} />
        )}
      </div>

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
