import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { RefreshCw, TrendingUp, Users, IndianRupee, BarChart2 } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { ErrorState, KpiSkeletons, PageHead } from './ui'
import { getAdminAnalytics, getAdminMrrHistory, getAdminUserGrowth } from '../../lib/adminService'

export function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card kpi">
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        <Icon size={16} aria-hidden="true" className="text-slate-400" />
      </div>
      <p className="kpi-value">{value}</p>
      {sub && <p className="kpi-foot">{sub}</p>}
    </div>
  )
}

export function Section({ title, children, className = 'mb-4' }) {
  return (
    <section className={`card ${className}`}>
      <header className="card-head"><h2>{title}</h2></header>
      <div className="p-4">{children}</div>
    </section>
  )
}

function BarChart({ data, valueKey, labelKey, color, height = 80, prefix = '', formatVal }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div>
      <div className={`flex items-end gap-1`} style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="relative flex-1 group flex flex-col justify-end">
            <div
              className={`w-full ${color} rounded-t-sm transition-opacity hover:opacity-80`}
              style={{ height: `${Math.max((d[valueKey] / max) * height, d[valueKey] > 0 ? 4 : 2)}px` }}
            />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-[var(--primary-fg)] text-[11px] px-1.5 py-0.5 rounded tabular-nums whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {d[labelKey]}: {prefix}{formatVal ? formatVal(d[valueKey]) : d[valueKey]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[11px] text-slate-400">
        <span>{data[0]?.[labelKey]}</span>
        <span>{data[data.length - 1]?.[labelKey]}</span>
      </div>
    </div>
  )
}

function LineChart({ data, valueKey, labelKey, color, height = 80 }) {
  const max  = Math.max(...data.map(d => d[valueKey]), 1)
  const min  = Math.min(...data.map(d => d[valueKey]), 0)
  const range = max - min || 1
  const w = 100 / (data.length - 1 || 1)

  const points = data.map((d, i) => {
    const x = i * w
    const y = 100 - ((d[valueKey] - min) / range) * 90
    return `${x},${y}`
  }).join(' ')

  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height, width: '100%' }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={i * w} cy={100 - ((d[valueKey] - min) / range) * 90} r="1.5" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between mt-1 text-[11px] text-slate-400">
        <span>{data[0]?.[labelKey]}</span>
        <span>{data[data.length - 1]?.[labelKey]}</span>
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const [data, setData]         = useState(null)
  const [mrrHist, setMrrHist]   = useState(null)
  const [growth, setGrowth]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [a, m, g] = await Promise.all([getAdminAnalytics(), getAdminMrrHistory(), getAdminUserGrowth()])
      setData(a); setMrrHist(m); setGrowth(g)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useAutoRefresh(load)

  const maxSignup = data ? Math.max(...data.signupsByDay.map(d => d.count), 1) : 1

  // Revenue forecast
  const forecast = data && mrrHist ? (() => {
    const months = mrrHist.months || []
    if (months.length < 2) return null
    const last  = months[months.length - 1].mrr
    const prev  = months[months.length - 2].mrr
    const growth = last - prev
    const churnFactor = data.churnedThisMonth > 0 ? 0.97 : 1
    return {
      next1: Math.round((last + growth) * churnFactor),
      next3: Math.round((last + growth * 3) * churnFactor),
      next12arr: Math.round((last + growth * 6) * 12 * churnFactor),
    }
  })() : null

  return (
    <AdminLayout>
      <PageHead title="Analytics" sub="Aggregated from live data">
        <button onClick={load} disabled={loading} className="btn btn-ghost text-slate-600">
          <RefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </PageHead>

      {error && data && <div role="alert" className="mb-4 rounded-ui border border-[var(--red-bd)] bg-[var(--red-bg)] px-4 py-2.5 text-[13px] text-[var(--red)]">{error}</div>}

      {error && !data ? (
        <div className="card"><ErrorState title="Couldn't load analytics" onRetry={load}>{error}</ErrorState></div>
      ) : loading && !data ? (
        <KpiSkeletons />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard icon={IndianRupee} label="ARR" value={`₹${(data.arr / 100000).toFixed(1)}L`} sub={`MRR ₹${data.mrr.toLocaleString('en-IN')}`} />
            <StatCard icon={Users} label="Active 7d" value={data.activeUsers} sub={`of ${data.totalUsers} total`} />
            <StatCard icon={TrendingUp} label="Conversion" value={`${data.conversionPct}%`} sub={`${data.paidUsers} paid`} />
            <StatCard icon={BarChart2} label="Churn MTD" value={data.churnedThisMonth} sub="cancelled this month" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {mrrHist?.months?.length > 0 && (
              <Section title="MRR - Last 6 Months" className="">
                <LineChart data={mrrHist.months} valueKey="mrr" labelKey="label" color="var(--series-1)" height={80} />
                <div className="flex justify-between mt-3 text-[12.5px] tabular-nums">
                  <span className="text-slate-500">₹{mrrHist.months[0]?.mrr?.toLocaleString('en-IN') || 0}</span>
                  <span className="text-slate-900 font-medium">₹{mrrHist.months[mrrHist.months.length - 1]?.mrr?.toLocaleString('en-IN') || 0}</span>
                </div>
              </Section>
            )}

            {growth?.months?.length > 0 && (
              <Section title="User Growth - Last 6 Months" className="">
                <BarChart data={growth.months} valueKey="new" labelKey="label" color="bg-[var(--series-1)]" height={80} />
                <div className="flex justify-between mt-3 text-[12.5px] tabular-nums">
                  <span className="text-slate-500">Total: {growth.months[growth.months.length - 1]?.total || 0}</span>
                  <span className="text-[var(--green)] font-medium">+{growth.months[growth.months.length - 1]?.new || 0} this month</span>
                </div>
              </Section>
            )}
          </div>

          {forecast && (
            <Section title="Revenue Forecast">
              <div className="grid grid-cols-3 gap-3">
                {[[`₹${forecast.next1.toLocaleString('en-IN')}`, 'Next Month MRR'], [`₹${forecast.next3.toLocaleString('en-IN')}`, '3-Month MRR'], [`₹${(forecast.next12arr / 100000).toFixed(1)}L`, '12-Month ARR']].map(([v, l]) => (
                  <div key={l} className="rounded-ui bg-slate-100 px-3 py-3">
                    <p className="text-[18px] font-semibold text-slate-900 tabular-nums break-words">{v}</p>
                    <p className="text-[12px] text-slate-500 mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-slate-500 mt-3">Based on last 2 months' growth trend with {data.churnedThisMonth > 0 ? '3% churn adjustment' : 'no churn adjustment'}</p>
            </Section>
          )}

          {/* Conversion funnel */}
          <Section title="Conversion Funnel">
            <div className="space-y-3">
              {[
                { label: 'Total Users', count: data.totalUsers, pct: 100, color: 'bg-slate-300' },
                { label: 'Free Users',  count: data.freeUsers,  pct: data.totalUsers > 0 ? Math.round(data.freeUsers / data.totalUsers * 100) : 0, color: 'bg-slate-400' },
                { label: 'Paid Users',  count: data.paidUsers,  pct: data.conversionPct, color: 'bg-[var(--series-1)]' },
              ].map(({ label, count, pct, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-slate-700">{label}</span>
                    <span className="text-[12.5px] text-slate-500 tabular-nums">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Signup trend */}
          <Section title="Signups - Last 30 Days">
            <div className="flex items-end gap-0.5 h-24">
              {data.signupsByDay.map(({ date, count }) => (
                <div key={date} className="relative flex-1 group">
                  <div
                    className="w-full bg-[var(--series-1)] hover:opacity-80 rounded-t-sm transition-opacity"
                    style={{ height: `${Math.max((count / maxSignup) * 96, count > 0 ? 6 : 2)}px` }}
                  />
                  {count > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-[var(--primary-fg)] text-[11px] tabular-nums px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {date.slice(5)}: {count}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[11px] text-slate-400 tabular-nums">
              <span>{data.signupsByDay[0]?.date?.slice(5)}</span>
              <span>{data.signupsByDay[data.signupsByDay.length - 1]?.date?.slice(5)}</span>
            </div>
          </Section>

          {/* Top users */}
          {data.topUsers?.length > 0 && (
            <Section title="Top Users by Projects" className="">
              <ol className="divide-y divide-slate-200 -my-2">
                {data.topUsers.map((u, i) => (
                  <li key={u.email} className="flex items-center gap-3 py-2">
                    <span className="text-[12px] text-slate-400 w-4 tabular-nums">{i + 1}</span>
                    <span className="text-[12.5px] text-slate-900 font-mono flex-1 truncate">{u.email}</span>
                    <span className="text-[12.5px] text-slate-500 tabular-nums">{u.projectCount} projects</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </>
      ) : null}
    </AdminLayout>
  )
}
