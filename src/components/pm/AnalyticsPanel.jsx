import { BarChart2, TrendingDown, Users } from 'lucide-react'
import { DEFAULT_WORKFLOW_STAGES, taskAssignees } from '../../lib/pmConstants'

const FALLBACK_STATUS_COLORS = {
  done:        '#22c55e',
  in_progress: '#3b82f6',
  review:      '#eab308',
  todo:        '#6b7280',
}

const PRIORITY_CONFIG = [
  { key: 'urgent', label: 'Urgent', color: 'bg-red-400' },
  { key: 'high',   label: 'High',   color: 'bg-orange-400' },
  { key: 'medium', label: 'Medium', color: 'bg-yellow-400' },
  { key: 'low',    label: 'Low',    color: 'bg-white/30' },
]

function Bar({ hex, label, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[11px] text-white/50 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: hex ? hex + 'aa' : 'rgba(255,255,255,0.3)' }}
        />
      </div>
      <span className="text-[11px] text-white/30 w-8 text-right">{count}</span>
    </div>
  )
}

function BurndownChart({ tasks, doneKeys }) {
  const days = 7
  const now = new Date()
  const points = []
  for (let i = days - 1; i >= 0; i--) {
    const dayEnd = new Date(now)
    dayEnd.setDate(now.getDate() - i)
    dayEnd.setHours(23, 59, 59, 999)
    const existedCount = tasks.filter((t) => new Date(t.created_at) <= dayEnd).length
    const doneCount = tasks.filter((t) => {
      if (!doneKeys.has(t.status)) return false
      const completedAt = new Date(t.completed_at || t.updated_at || t.created_at)
      return completedAt <= dayEnd
    }).length
    points.push({
      label: dayEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      remaining: Math.max(0, existedCount - doneCount),
    })
  }

  const maxVal = Math.max(...points.map((p) => p.remaining), 1)
  const width = 280
  const height = 80
  const padX = 8
  const padY = 8

  const pts = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (width - padX * 2)
    const y = padY + (1 - p.remaining / maxVal) * (height - padY * 2)
    return { x, y, ...p }
  })

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${height} L ${pts[0].x} ${height} Z`

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown size={13} className="text-white/40" />
        <p className="text-xs font-semibold text-white/70">7-Day Task Burndown</p>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#burnGrad)" />
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#fff" fillOpacity="0.8" />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {points.filter((_, i) => i % 2 === 0).map((p) => (
          <span key={p.label} className="text-[9px] text-white/25">{p.label}</span>
        ))}
      </div>
    </div>
  )
}

function VelocityChart({ tasks, doneKeys }) {
  const assignees = {}
  tasks.forEach((t) => {
    taskAssignees(t).forEach((email) => {
      if (!assignees[email]) assignees[email] = { email, done: 0, total: 0 }
      assignees[email].total++
      if (doneKeys.has(t.status)) assignees[email].done++
    })
  })

  const rows = Object.values(assignees).sort((a, b) => b.done - a.done)
  const unassigned = tasks.filter((t) => taskAssignees(t).length === 0)

  if (rows.length === 0) {
    return (
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={13} className="text-white/40" />
          <p className="text-xs font-semibold text-white/70">Team Velocity</p>
        </div>
        <p className="text-xs text-white/25 text-center py-4">Assign tasks to team members to see velocity</p>
      </div>
    )
  }

  const maxDone = Math.max(...rows.map((r) => r.done), 1)

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={13} className="text-white/40" />
        <p className="text-xs font-semibold text-white/70">Team Velocity</p>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.email} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/50 flex-shrink-0">
              {r.email?.[0]?.toUpperCase() || '?'}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/50 truncate max-w-[120px]">{r.email.split('@')[0]}</span>
                <span className="text-[10px] text-white/40">{r.done}/{r.total}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400/60 rounded-full transition-all duration-700"
                  style={{ width: `${(r.done / maxDone) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        {unassigned.length > 0 && (
          <p className="text-[10px] text-white/25 pt-1">{unassigned.length} task{unassigned.length !== 1 ? 's' : ''} unassigned</p>
        )}
      </div>
    </div>
  )
}

function CreatorBreakdown({ tasks }) {
  const creators = {}
  tasks.filter((t) => t.created_by_email).forEach((t) => {
    creators[t.created_by_email] = (creators[t.created_by_email] || 0) + 1
  })
  const rows = Object.entries(creators).map(([email, count]) => ({ email, count })).sort((a, b) => b.count - a.count)
  const unknown = tasks.filter((t) => !t.created_by_email).length

  if (rows.length === 0) return null

  const maxCount = Math.max(...rows.map((r) => r.count), 1)

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={13} className="text-white/40" />
        <p className="text-xs font-semibold text-white/70">Tasks Added</p>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.email} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/50 flex-shrink-0">
              {r.email[0].toUpperCase()}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/50 truncate max-w-[120px]">{r.email.split('@')[0]}</span>
                <span className="text-[10px] text-white/40">{r.count}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400/60 rounded-full transition-all duration-700"
                  style={{ width: `${(r.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        {unknown > 0 && (
          <p className="text-[10px] text-white/25 pt-1">{unknown} task{unknown !== 1 ? 's' : ''} with no creator on record</p>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsPanel({ tasks, milestones, stages }) {
  const activeStages = (stages && stages.length > 0) ? stages : DEFAULT_WORKFLOW_STAGES
  const doneKeys = new Set(activeStages.filter((s) => s.is_done).map((s) => s.status_key))
  const total = tasks.length
  const done = tasks.filter((t) => doneKeys.has(t.status)).length
  const overdueTasks = tasks.filter(
    (t) => t.due_date && !doneKeys.has(t.status) && new Date(t.due_date) < new Date()
  ).length
  const overdueMilestones = milestones.filter(
    (m) => !m.completed && new Date(m.due_date) < new Date()
  ).length
  const milestoneDone = milestones.filter((m) => m.completed).length
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0

  if (total === 0 && milestones.length === 0) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center py-24 text-center">
        <BarChart2 size={36} className="text-white/15 mb-4" />
        <p className="text-sm text-white/40 mb-1">No data yet</p>
        <p className="text-xs text-white/25">Add tasks and milestones to see analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tasks', value: total, sub: `${done} done`, color: 'text-white' },
          { label: 'Completion', value: `${completionPct}%`, sub: `${total - done} remaining`, color: completionPct === 100 ? 'text-green-400' : 'text-white' },
          { label: 'Overdue Tasks', value: overdueTasks, sub: overdueTasks > 0 ? 'needs attention' : 'all on track', color: overdueTasks > 0 ? 'text-red-400' : 'text-green-400' },
          { label: 'Milestones', value: `${milestoneDone}/${milestones.length}`, sub: overdueMilestones > 0 ? `${overdueMilestones} overdue` : 'on track', color: overdueMilestones > 0 ? 'text-red-400' : 'text-white' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="glass rounded-xl p-3">
            <p className="text-[10px] text-white/40 mb-0.5">{label}</p>
            <p className={`font-display font-bold text-lg ${color}`}>{value}</p>
            <p className="text-[9px] text-white/25">{sub}</p>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-white/70">Overall Progress</p>
          <span className="text-sm font-bold text-white">{completionPct}%</span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-gradient-to-r from-white/60 to-white rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-[10px] text-white/30">{done} of {total} tasks completed</p>
      </div>

      {/* Tasks by status */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-semibold text-white/70 mb-3">Tasks by Status</p>
        {activeStages.map((stage) => (
          <Bar
            key={stage.status_key}
            label={stage.name}
            hex={stage.color || FALLBACK_STATUS_COLORS[stage.status_key] || '#6b7280'}
            count={tasks.filter((t) => t.status === stage.status_key).length}
            total={total}
          />
        ))}
      </div>

      {/* Tasks by priority */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-semibold text-white/70 mb-3">Tasks by Priority</p>
        {PRIORITY_CONFIG.map(({ key, label, color }) => (
          <Bar
            key={key}
            label={label}
            color={color}
            count={tasks.filter((t) => t.priority === key).length}
            total={total}
          />
        ))}
      </div>

      {/* Burndown + Velocity */}
      {total > 0 && <BurndownChart tasks={tasks} doneKeys={doneKeys} />}
      {total > 0 && <VelocityChart tasks={tasks} doneKeys={doneKeys} />}
      {total > 0 && <CreatorBreakdown tasks={tasks} />}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-white/70">Milestones</p>
            <span className="text-xs text-white/40">{milestoneDone}/{milestones.length}</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-700"
              style={{ width: milestones.length > 0 ? `${(milestoneDone / milestones.length) * 100}%` : '0%' }}
            />
          </div>
          <div className="space-y-2">
            {[...milestones]
              .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
              .map((m) => {
                const isPast = !m.completed && new Date(m.due_date) < new Date()
                return (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      m.completed ? 'bg-green-400' : isPast ? 'bg-red-400' : 'bg-white/30'
                    }`} />
                    <span className={`text-[11px] flex-1 ${m.completed ? 'line-through text-white/30' : 'text-white/70'}`}>
                      {m.title}
                    </span>
                    <span className={`text-[10px] ${isPast && !m.completed ? 'text-red-400/60' : 'text-white/30'}`}>
                      {new Date(m.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
