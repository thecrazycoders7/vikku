import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Circle, Zap, ExternalLink } from 'lucide-react'
import { getProjectByToken, getTasks, getMilestones } from '../../lib/pmService'

const STATUS_COLORS = {
  todo:        { bg: 'bg-white/[0.06]',    text: 'text-white/40',  dot: 'bg-white/30' },
  in_progress: { bg: 'bg-blue-500/10',     text: 'text-blue-400',  dot: 'bg-blue-400' },
  review:      { bg: 'bg-yellow-500/10',   text: 'text-yellow-400',dot: 'bg-yellow-400' },
  done:        { bg: 'bg-green-500/10',    text: 'text-green-400', dot: 'bg-green-400' },
}

export default function PublicShowcase() {
  const { token } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const p = await getProjectByToken(token)
      if (!p) { setNotFound(true); setLoading(false); return }
      const [t, m] = await Promise.all([getTasks(p.id), getMilestones(p.id)])
      setProject(p)
      setTasks(t)
      setMilestones(m.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)))
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl mb-2">Project not found</h1>
          <p className="text-white/50 text-sm">This link may have expired or is invalid.</p>
        </div>
      </div>
    )
  }

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const milestoneDone = milestones.filter((m) => m.completed).length
  const nextMilestone = milestones.find((m) => !m.completed)

  const statusCounts = ['todo', 'in_progress', 'review', 'done'].map((s) => ({
    status: s,
    count: tasks.filter((t) => t.status === s).length,
  }))

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div
        className="relative overflow-hidden border-b border-white/[0.05]"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% -10%, ${project.color}22 0%, transparent 70%), #000` }}
      >
        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color, boxShadow: `0 0 12px ${project.color}80` }}
            />
            <span className="text-xs text-white/40 uppercase tracking-widest">Project Showcase</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-3 leading-tight">{project.name}</h1>
          {project.description && (
            <p className="text-base text-white/50 max-w-xl leading-relaxed mb-6">{project.description}</p>
          )}
          {project.client_name && (
            <p className="text-xs text-white/30">Built for <span className="text-white/60">{project.client_name}</span></p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* Progress ring + stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Progress', value: `${progress}%`, sub: `${doneTasks} of ${totalTasks} tasks`, highlight: progress === 100 },
            { label: 'In Progress', value: inProgress, sub: 'tasks active' },
            { label: 'Milestones', value: `${milestoneDone}/${milestones.length}`, sub: 'completed' },
            { label: 'Status', value: project.status === 'active' ? 'Active' : project.status, sub: 'project status' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <p className={`font-display font-bold text-2xl mb-1 ${stat.highlight ? 'text-green-400' : 'text-white'}`}>{stat.value}</p>
              <p className="text-[10px] text-white/40 leading-tight">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/70">Overall Completion</p>
            <span className="text-sm font-bold text-white">{progress}%</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, backgroundColor: project.color || '#fff' }}
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            {statusCounts.filter((s) => s.count > 0).map(({ status, count }) => {
              const cfg = STATUS_COLORS[status]
              return (
                <div key={status} className={`flex items-center gap-1.5 ${cfg.text}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className="text-[11px] capitalize">{status.replace('_', ' ')} ({count})</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Milestones roadmap */}
        {milestones.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-white/70 mb-4">Milestones</h2>
            <div className="space-y-2">
              {milestones.map((m, idx) => {
                const isPast = !m.completed && new Date(m.due_date) < new Date()
                const isNext = m.id === nextMilestone?.id
                return (
                  <div
                    key={m.id}
                    className={`glass rounded-xl px-4 py-4 flex items-center gap-4 transition-all ${isNext ? 'border-white/20' : ''}`}
                  >
                    <div className="flex-shrink-0">
                      {m.completed
                        ? <CheckCircle2 size={18} className="text-green-400" />
                        : <Circle size={18} className={isPast ? 'text-red-400/60' : 'text-white/25'} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${m.completed ? 'line-through text-white/40' : 'text-white'}`}>{m.title}</p>
                      {isNext && <p className="text-[10px] text-yellow-400/70 mt-0.5">Next milestone</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs ${isPast && !m.completed ? 'text-red-400/60' : 'text-white/40'}`}>
                        {new Date(m.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {m.approval_status === 'approved' && (
                        <p className="text-[10px] text-green-400/70 mt-0.5">Client approved</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tasks highlight - in progress */}
        {inProgress > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white/70">Currently Working On</h2>
            </div>
            <div className="space-y-2">
              {tasks.filter((t) => t.status === 'in_progress').map((t) => (
                <div key={t.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                  <p className="text-sm text-white">{t.title}</p>
                  {t.due_date && (
                    <p className="text-[10px] text-white/30 ml-auto flex-shrink-0">
                      {new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-white/[0.05]">
          <p className="text-xs text-white/20 mb-2">Want a project page like this for your business?</p>
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            Built with Vikku PM <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}
