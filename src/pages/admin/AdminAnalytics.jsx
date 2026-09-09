import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { RefreshCw, TrendingUp, Users, IndianRupee, BarChart2 } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { getAdminAnalytics, getAdminMrrHistory, getAdminUserGrowth } from '../../lib/adminService'

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

function BarChart({ data, valueKey, labelKey, color, height = 80, prefix = '', formatVal }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div>
      <div className={`flex items-end gap-1`} style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="relative flex-1 group flex flex-col justify-end">
            <div
              className={`w-full ${color} rounded-t-sm transition-all hover:opacity-80`}
              style={{ height: `${Math.max((d[valueKey] / max) * height, d[valueKey] > 0 ? 4 : 2)}px` }}
            />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {d[labelKey]}: {prefix}{formatVal ? formatVal(d[valueKey]) : d[valueKey]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-white/25">
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
      <div className="flex justify-between mt-1 text-[9px] text-white/25">
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
    <AdminLayout title="Analytics">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-white/40">Aggregated from live data</p>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && <div className="glass rounded-xl p-4 mb-5 text-sm text-red-400 border border-red-500/20">{error}</div>}

      {loading && !data ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard icon={IndianRupee} label="ARR" value={`₹${(data.arr / 100000).toFixed(1)}L`} sub={`MRR ₹${data.mrr.toLocaleString('en-IN')}`} color="text-green-400" />
            <StatCard icon={Users} label="Active 7d" value={data.activeUsers} sub={`of ${data.totalUsers} total`} color="text-cyan-400" />
            <StatCard icon={TrendingUp} label="Conversion" value={`${data.conversionPct}%`} sub={`${data.paidUsers} paid`} color="text-violet-400" />
            <StatCard icon={BarChart2} label="Churn MTD" value={data.churnedThisMonth} sub="cancelled this month" color="text-red-400" />
          </div>

          {/* Revenue over time + User growth side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {mrrHist?.months?.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-4">MRR - Last 6 Months</p>
                <LineChart
                  data={mrrHist.months}
                  valueKey="mrr"
                  labelKey="label"
                  color="#a78bfa"
                  height={80}
                />
                <div className="flex justify-between mt-3 text-xs">
                  <span className="text-white/40">₹{mrrHist.months[0]?.mrr?.toLocaleString('en-IN') || 0}</span>
                  <span className="text-violet-400 font-medium">₹{mrrHist.months[mrrHist.months.length - 1]?.mrr?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>
            )}

            {growth?.months?.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-4">User Growth - Last 6 Months</p>
                <BarChart
                  data={growth.months}
                  valueKey="new"
                  labelKey="label"
                  color="bg-cyan-500/60"
                  height={80}
                />
                <div className="flex justify-between mt-3 text-xs">
                  <span className="text-white/40">Total: {growth.months[growth.months.length - 1]?.total || 0}</span>
                  <span className="text-cyan-400 font-medium">+{growth.months[growth.months.length - 1]?.new || 0} this month</span>
                </div>
              </div>
            )}
          </div>

          {/* Revenue forecast */}
          {forecast && (
            <div className="glass rounded-2xl p-5 mb-4">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Revenue Forecast</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-white/[0.03] rounded-xl py-4">
                  <p className="font-display font-bold text-lg text-emerald-400">₹{forecast.next1.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-white/40 mt-1">Next Month MRR</p>
                </div>
                <div className="text-center bg-white/[0.03] rounded-xl py-4">
                  <p className="font-display font-bold text-lg text-emerald-400">₹{forecast.next3.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-white/40 mt-1">3-Month MRR</p>
                </div>
                <div className="text-center bg-white/[0.03] rounded-xl py-4">
                  <p className="font-display font-bold text-lg text-emerald-400">₹{(forecast.next12arr / 100000).toFixed(1)}L</p>
                  <p className="text-[10px] text-white/40 mt-1">12-Month ARR</p>
                </div>
              </div>
              <p className="text-[10px] text-white/20 mt-3 text-center">Based on last 2 months' growth trend with {data.churnedThisMonth > 0 ? '3% churn adjustment' : 'no churn adjustment'}</p>
            </div>
          )}

          {/* Conversion funnel */}
          <div className="glass rounded-2xl p-5 mb-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Conversion Funnel</p>
            <div className="space-y-3">
              {[
                { label: 'Total Users', count: data.totalUsers, pct: 100, color: 'bg-white/20' },
                { label: 'Free Users',  count: data.freeUsers,  pct: data.totalUsers > 0 ? Math.round(data.freeUsers / data.totalUsers * 100) : 0, color: 'bg-white/30' },
                { label: 'Paid Users',  count: data.paidUsers,  pct: data.conversionPct, color: 'bg-violet-500' },
              ].map(({ label, count, pct, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">{label}</span>
                    <span className="text-xs text-white/40">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signup trend */}
          <div className="glass rounded-2xl p-5 mb-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Signups - Last 30 Days</p>
            <div className="flex items-end gap-0.5 h-24">
              {data.signupsByDay.map(({ date, count }) => (
                <div key={date} className="relative flex-1 group">
                  <div
                    className="w-full bg-violet-500/50 hover:bg-violet-500/80 rounded-t-sm transition-colors"
                    style={{ height: `${Math.max((count / maxSignup) * 96, count > 0 ? 6 : 2)}px` }}
                  />
                  {count > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {date.slice(5)}: {count}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-white/25">
              <span>{data.signupsByDay[0]?.date?.slice(5)}</span>
              <span>{data.signupsByDay[data.signupsByDay.length - 1]?.date?.slice(5)}</span>
            </div>
          </div>

          {/* Top users */}
          {data.topUsers?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Top Users by Projects</p>
              <div className="space-y-2">
                {data.topUsers.map((u, i) => (
                  <div key={u.email} className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 w-4">{i + 1}</span>
                    <span className="text-xs text-white/70 font-mono flex-1 truncate">{u.email}</span>
                    <span className="text-xs text-white/50">{u.projectCount} projects</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </AdminLayout>
  )
}
