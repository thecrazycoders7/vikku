import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { TrendingUp, Users, Folder, IndianRupee, RefreshCw, Mail } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { getAdminOverview } from '../../lib/adminService'

function StatCard({ icon: Icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">{label}</span>
        <Icon size={14} className="text-white/20" />
      </div>
      <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

function PlanBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs text-white/40">{count}</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await getAdminOverview()
      setData(d)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useAutoRefresh(load)

  const totalPlans = data ? data.freeUsers + data.proUsers + data.teamUsers : 1
  const maxSignup  = data ? Math.max(...data.signupsByDay.map(d => d.count), 1) : 1

  return (
    <AdminLayout title="Overview">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-white/40">Live data from Supabase</p>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 mb-5 text-sm text-red-400 border border-red-500/20">{error}</div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
            <StatCard
              icon={IndianRupee}
              label="MRR"
              value={`₹${data.mrr.toLocaleString('en-IN')}`}
              sub={`${data.proUsers} pro · ${data.teamUsers} team`}
              color="text-green-400"
            />
            <StatCard
              icon={IndianRupee}
              label="ARR"
              value={`₹${((data.mrr * 12) / 100000).toFixed(1)}L`}
              sub="annual run rate"
              color="text-emerald-400"
            />
            <StatCard
              icon={Users}
              label="Total Users"
              value={data.totalUsers}
              sub={`${data.freeUsers} free`}
            />
            <StatCard
              icon={Users}
              label="Active 7d"
              value={data.activeUsers ?? '-'}
              sub="signed in recently"
              color="text-cyan-400"
            />
            <StatCard
              icon={TrendingUp}
              label="Paid"
              value={data.proUsers + data.teamUsers}
              sub={`${totalPlans > 0 ? Math.round(((data.proUsers + data.teamUsers) / totalPlans) * 100) : 0}% conversion`}
              color="text-violet-400"
            />
            <StatCard
              icon={Folder}
              label="Projects"
              value={data.totalProjects}
              sub="across all users"
            />
            <StatCard
              icon={Mail}
              label="Subscribers"
              value={data.totalSubscribers ?? '-'}
              sub="newsletter + leads"
              color="text-blue-400"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Plan breakdown */}
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Plan Breakdown</p>
              <div className="space-y-3">
                <PlanBar label="Free"  count={data.freeUsers}  total={totalPlans} color="bg-white/25" />
                <PlanBar label="Pro"   count={data.proUsers}   total={totalPlans} color="bg-violet-500" />
                <PlanBar label="Team"  count={data.teamUsers}  total={totalPlans} color="bg-blue-500" />
              </div>
            </div>

            {/* Signups chart */}
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Signups - Last 30 Days</p>
              <div className="flex items-end gap-0.5 h-20">
                {data.signupsByDay.map(({ date, count }) => (
                  <div
                    key={date}
                    className="flex-1 bg-violet-500/50 hover:bg-violet-500/80 rounded-t-sm transition-colors cursor-default"
                    style={{ height: `${Math.max((count / maxSignup) * 100, count > 0 ? 6 : 2)}%` }}
                    title={`${date}: ${count}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-white/25">
                <span>{data.signupsByDay[0]?.date?.slice(5)}</span>
                <span>{data.signupsByDay[data.signupsByDay.length - 1]?.date?.slice(5)}</span>
              </div>
            </div>
          </div>

          {/* Subscriber sources */}
          {data.subscribersBySource && Object.keys(data.subscribersBySource).length > 0 && (
            <div className="glass rounded-2xl p-5 mb-4">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Lead Sources</p>
              <div className="space-y-2">
                {Object.entries(data.subscribersBySource)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, count]) => {
                    const pct = data.totalSubscribers > 0 ? Math.round((count / data.totalSubscribers) * 100) : 0
                    const label = src.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    return (
                      <div key={src}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-white/60">{label}</span>
                          <span className="text-xs text-white/40">{count}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Project status */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Project Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Active',    key: 'active',    color: 'text-green-400' },
                { label: 'Completed', key: 'completed', color: 'text-blue-400' },
                { label: 'On Hold',   key: 'on-hold',   color: 'text-yellow-400' },
                { label: 'Archived',  key: 'archived',  color: 'text-white/30' },
              ].map(({ label, key, color }) => (
                <div key={key} className="text-center bg-white/[0.03] rounded-xl py-3">
                  <p className={`font-display font-bold text-xl ${color}`}>
                    {data.projectStatus[key] || 0}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </AdminLayout>
  )
}
