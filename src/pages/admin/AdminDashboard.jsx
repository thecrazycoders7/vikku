import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { TrendingUp, Users, Folder, IndianRupee, RefreshCw, Mail } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { StatCard, Section } from './AdminAnalytics'
import { ErrorState, KpiSkeletons, PageHead } from './ui'
import { getAdminOverview } from '../../lib/adminService'

function PlanBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-slate-700">{label}</span>
        <span className="text-[12.5px] text-slate-500 tabular-nums">{count}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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

  const kpis = [
    { icon: IndianRupee, label: 'MRR', value: `₹${data?.mrr.toLocaleString('en-IN')}`, sub: `${data?.proUsers} pro · ${data?.teamUsers} team` },
    { icon: IndianRupee, label: 'ARR', value: `₹${((data?.mrr * 12) / 100000).toFixed(1)}L`, sub: 'annual run rate' },
    { icon: Users, label: 'Total Users', value: data?.totalUsers, sub: `${data?.freeUsers} free` },
    { icon: Users, label: 'Active 7d', value: data?.activeUsers ?? '-', sub: 'signed in recently' },
    { icon: TrendingUp, label: 'Paid', value: data ? data.proUsers + data.teamUsers : 0, sub: `${data && totalPlans > 0 ? Math.round(((data.proUsers + data.teamUsers) / totalPlans) * 100) : 0}% conversion` },
    { icon: Folder, label: 'Projects', value: data?.totalProjects, sub: 'across all users' },
    { icon: Mail, label: 'Subscribers', value: data?.totalSubscribers ?? '-', sub: 'newsletter + leads' },
  ]

  return (
    <AdminLayout>
      <PageHead title="Tool stats" sub="Live data from Supabase">
        <button onClick={load} disabled={loading} className="btn btn-ghost text-slate-600">
          <RefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </PageHead>

      {error && data && <div role="alert" className="mb-4 rounded-ui border border-[var(--red-bd)] bg-[var(--red-bg)] px-4 py-2.5 text-[13px] text-[var(--red)]">{error}</div>}

      {error && !data ? (
        <div className="card"><ErrorState title="Couldn't load tool stats" onRetry={load}>{error}</ErrorState></div>
      ) : loading && !data ? (
        <KpiSkeletons />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-4 mb-4">
            {kpis.map(k => <StatCard key={k.label} {...k} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Section title="Plan Breakdown" className="">
              <div className="space-y-3">
                <PlanBar label="Free"  count={data.freeUsers}  total={totalPlans} color="bg-slate-400" />
                <PlanBar label="Pro"   count={data.proUsers}   total={totalPlans} color="bg-[var(--violet)]" />
                <PlanBar label="Team"  count={data.teamUsers}  total={totalPlans} color="bg-[var(--series-1)]" />
              </div>
            </Section>

            <Section title="Signups - Last 30 Days" className="">
              <div className="flex items-end gap-0.5 h-20">
                {data.signupsByDay.map(({ date, count }) => (
                  <div
                    key={date}
                    className="flex-1 bg-[var(--series-1)] hover:opacity-80 rounded-t-sm transition-opacity cursor-default"
                    style={{ height: `${Math.max((count / maxSignup) * 100, count > 0 ? 6 : 2)}%` }}
                    title={`${date}: ${count}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[11px] text-slate-400 tabular-nums">
                <span>{data.signupsByDay[0]?.date?.slice(5)}</span>
                <span>{data.signupsByDay[data.signupsByDay.length - 1]?.date?.slice(5)}</span>
              </div>
            </Section>
          </div>

          {data.subscribersBySource && Object.keys(data.subscribersBySource).length > 0 && (
            <Section title="Lead Sources">
              <div className="space-y-2">
                {Object.entries(data.subscribersBySource)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, count]) => {
                    const pct = data.totalSubscribers > 0 ? Math.round((count / data.totalSubscribers) * 100) : 0
                    const label = src.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    return (
                      <div key={src}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] text-slate-700">{label}</span>
                          <span className="text-[12.5px] text-slate-500 tabular-nums">{count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--series-1)] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </Section>
          )}

          <Section title="Project Status" className="">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Active',    key: 'active' },
                { label: 'Completed', key: 'completed' },
                { label: 'On Hold',   key: 'on-hold' },
                { label: 'Archived',  key: 'archived' },
              ].map(({ label, key }) => (
                <div key={key} className="rounded-ui bg-slate-100 px-3 py-3">
                  <p className="text-[20px] font-semibold text-slate-900 tabular-nums">{data.projectStatus[key] || 0}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </Section>
        </>
      ) : null}
    </AdminLayout>
  )
}
