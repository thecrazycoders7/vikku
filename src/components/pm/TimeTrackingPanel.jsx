import { useState, useEffect, useMemo } from 'react'
import { Clock, Download, Users, List, BarChart2, DollarSign, Loader2, Filter } from 'lucide-react'
import { getProjectTimeLogs } from '../../lib/pmService'
import { formatMinutes } from '../../lib/pmConstants'

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-[10px] text-white/40 mb-1">{label}</p>
      <p className={`font-display font-bold text-xl mb-0.5 ${accent ? 'text-green-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-white/25">{sub}</p>}
    </div>
  )
}

function HoursBar({ label, minutes, maxMinutes, billable = null }) {
  const pct = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[11px] text-white/50 w-28 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full bg-blue-400/60 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-white/50 w-14 text-right flex-shrink-0">{formatMinutes(minutes)}</span>
      {billable !== null && (
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${billable ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.05] text-white/25'}`}>
          {billable ? 'B' : 'NB'}
        </span>
      )}
    </div>
  )
}

function DayChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.minutes), 1)
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => {
        const h = Math.max(2, (d.minutes / maxVal) * 64)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-blue-400/50 rounded-t transition-all duration-500 hover:bg-blue-400/70"
              style={{ height: `${h}px` }}
              title={`${d.label}: ${formatMinutes(d.minutes)}`}
            />
            <span className="text-[8px] text-white/25 leading-none">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function TimeTrackingPanel({ projectId, tasks }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')   // 'all' | 'billable' | 'nonbillable'
  const [view, setView] = useState('summary')   // 'summary' | 'byUser' | 'byTask' | 'entries'

  useEffect(() => {
    getProjectTimeLogs(projectId).then((data) => {
      setLogs(data.filter((l) => !l.is_running))
      setLoading(false)
    })
  }, [projectId])

  // Refresh when a new log entry is created (exposed via the parent's task reload)
  const taskMap = useMemo(() => {
    const m = {}
    tasks.forEach((t) => { m[t.id] = t.title })
    return m
  }, [tasks])

  const filteredLogs = useMemo(() => {
    if (filter === 'billable') return logs.filter((l) => l.billable)
    if (filter === 'nonbillable') return logs.filter((l) => !l.billable)
    return logs
  }, [logs, filter])

  // ── Aggregations ────────────────────────────────────────────────────────────

  // All aggregates use filteredLogs so percentages/bars stay correct under a filter
  const totalMins = filteredLogs.reduce((s, l) => s + (l.minutes || 0), 0)
  const billableMins = filteredLogs.filter((l) => l.billable).reduce((s, l) => s + (l.minutes || 0), 0)
  const nonBillableMins = filteredLogs.filter((l) => !l.billable).reduce((s, l) => s + (l.minutes || 0), 0)

  const byUser = useMemo(() => {
    const m = {}
    filteredLogs.forEach((l) => {
      const key = l.user_email || l.user_id || 'Unknown'
      if (!m[key]) m[key] = { email: l.user_email || key, minutes: 0, billable: 0 }
      m[key].minutes += l.minutes || 0
      if (l.billable) m[key].billable += l.minutes || 0
    })
    return Object.values(m).sort((a, b) => b.minutes - a.minutes)
  }, [filteredLogs])

  const byTask = useMemo(() => {
    const m = {}
    filteredLogs.forEach((l) => {
      const key = l.task_id
      if (!m[key]) m[key] = { title: taskMap[key] || 'Unknown task', minutes: 0, billable: 0 }
      m[key].minutes += l.minutes || 0
      if (l.billable) m[key].billable += l.minutes || 0
    })
    return Object.values(m).sort((a, b) => b.minutes - a.minutes)
  }, [filteredLogs, taskMap])

  const last7Days = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return { date: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), minutes: 0 }
    })
    filteredLogs.forEach((l) => {
      const day = new Date(l.end_time || l.created_at).toISOString().slice(0, 10)
      const slot = days.find((d) => d.date === day)
      if (slot) slot.minutes += l.minutes || 0
    })
    return days
  }, [filteredLogs])

  // ── CSV Export ──────────────────────────────────────────────────────────────

  function handleExport() {
    const rows = [
      ['Task', 'User', 'Duration (min)', 'Hours', 'Billable', 'Notes', 'Date'],
      ...filteredLogs.map((l) => [
        `"${(taskMap[l.task_id] || 'Unknown').replace(/"/g, '""')}"`,
        l.user_email || l.user_id || '',
        l.minutes || 0,
        ((l.minutes || 0) / 60).toFixed(2),
        l.billable ? 'Yes' : 'No',
        `"${(l.note || '').replace(/"/g, '""')}"`,
        new Date(l.created_at).toLocaleString('en-IN'),
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Empty / Loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center py-24 text-center">
        <Clock size={36} className="text-white/15 mb-4" />
        <p className="text-sm text-white/40 mb-1">No time logged yet</p>
        <p className="text-xs text-white/25">Open a task and use the timer or log minutes manually</p>
      </div>
    )
  }

  const maxUser = byUser[0]?.minutes || 1
  const maxTask = byTask[0]?.minutes || 1

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          {['summary', 'byUser', 'byTask', 'entries'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${view === v ? 'bg-white text-black font-semibold' : 'text-white/40 hover:text-white/70'}`}
            >
              {v === 'summary' ? 'Summary' : v === 'byUser' ? 'By User' : v === 'byTask' ? 'By Task' : 'Entries'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Billable filter */}
          <div className="flex items-center gap-1 text-[10px]">
            {['all', 'billable', 'nonbillable'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 rounded-lg border transition-all ${filter === f ? 'bg-white/10 text-white/70 border-white/20' : 'border-white/[0.06] text-white/30 hover:border-white/20'}`}
              >
                {f === 'all' ? 'All' : f === 'billable' ? 'Billable' : 'Non-billable'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-xl transition-all border border-white/[0.08]"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary view */}
      {view === 'summary' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Time" value={formatMinutes(totalMins)} sub={`${filteredLogs.length} entries`} />
            <StatCard label="Billable" value={formatMinutes(billableMins)} sub={`${totalMins > 0 ? Math.round((billableMins / totalMins) * 100) : 0}% of total`} accent />
            <StatCard label="Non-Billable" value={formatMinutes(nonBillableMins)} sub="internal time" />
            <StatCard label="Contributors" value={byUser.length} sub={`avg ${formatMinutes(byUser.length > 0 ? Math.round(totalMins / byUser.length) : 0)}/person`} />
          </div>

          {/* Billable breakdown bar */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/70 mb-4">Billable vs Non-Billable</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-3 bg-white/[0.06] rounded-full overflow-hidden flex">
                <div className="h-full bg-green-400/60 rounded-l-full transition-all duration-700" style={{ width: `${totalMins > 0 ? (billableMins / totalMins) * 100 : 0}%` }} />
                <div className="h-full bg-white/[0.08] rounded-r-full transition-all duration-700" style={{ width: `${totalMins > 0 ? (nonBillableMins / totalMins) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="flex gap-4 text-[10px]">
              <span className="flex items-center gap-1 text-green-400/80"><span className="w-2 h-2 rounded-full bg-green-400/60" />Billable {formatMinutes(billableMins)}</span>
              <span className="flex items-center gap-1 text-white/35"><span className="w-2 h-2 rounded-full bg-white/20" />Non-billable {formatMinutes(nonBillableMins)}</span>
            </div>
          </div>

          {/* 7-day chart */}
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/70 mb-4">Last 7 Days</p>
            <DayChart data={last7Days} />
          </div>
        </>
      )}

      {/* By User */}
      {view === 'byUser' && (
        <div className="glass rounded-2xl p-5 space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Users size={13} className="text-white/40" />
            <p className="text-xs font-semibold text-white/70">Time by Team Member</p>
          </div>
          {byUser.length === 0 ? (
            <p className="text-xs text-white/25 py-4 text-center">No entries match filter</p>
          ) : byUser.map((u) => (
            <HoursBar key={u.email} label={u.email.split('@')[0]} minutes={u.minutes} maxMinutes={maxUser} />
          ))}
        </div>
      )}

      {/* By Task */}
      {view === 'byTask' && (
        <div className="glass rounded-2xl p-5 space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <List size={13} className="text-white/40" />
            <p className="text-xs font-semibold text-white/70">Time by Task</p>
          </div>
          {byTask.length === 0 ? (
            <p className="text-xs text-white/25 py-4 text-center">No entries match filter</p>
          ) : byTask.map((t) => (
            <HoursBar key={t.title} label={t.title} minutes={t.minutes} maxMinutes={maxTask} />
          ))}
        </div>
      )}

      {/* Raw entries */}
      {view === 'entries' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-xs font-semibold text-white/70">All Time Entries ({filteredLogs.length})</p>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[480px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <p className="text-xs text-white/25 py-8 text-center">No entries match filter</p>
            ) : [...filteredLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((l) => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 truncate">{taskMap[l.task_id] || 'Unknown task'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/30">{l.user_email?.split('@')[0] || '-'}</span>
                    {l.note && <span className="text-[10px] text-white/25 truncate max-w-[140px]">· {l.note}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-white">{formatMinutes(l.minutes)}</p>
                  <p className="text-[9px] text-white/25">{new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${l.billable ? 'bg-green-500/10 text-green-400 border border-green-500/15' : 'bg-white/[0.04] text-white/25 border border-white/[0.06]'}`}>
                  {l.billable ? 'B' : 'NB'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
