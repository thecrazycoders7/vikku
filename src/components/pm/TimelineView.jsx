import { Flag, CheckSquare } from 'lucide-react'
import { updateMilestone } from '../../lib/pmService'

export default function TimelineView({ milestones, onMilestonesChange, tasks = [] }) {
  const milestoneSorted = [...milestones].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  const completedCount = milestoneSorted.filter((m) => m.completed).length

  const tasksDue = tasks
    .filter((t) => t.due_date && t.status !== 'done')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  const handleToggle = async (m) => {
    const updated = await updateMilestone(m.id, { completed: !m.completed })
    onMilestonesChange(milestones.map((x) => x.id === m.id ? { ...x, ...updated } : x))
  }

  const allItems = [
    ...milestoneSorted.map((m) => ({ ...m, _type: 'milestone' })),
    ...tasksDue.map((t) => ({ ...t, due_date: t.due_date, _type: 'task' })),
  ].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  if (allItems.length === 0) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center py-24 text-center">
        <Flag size={36} className="text-white/15 mb-4" />
        <p className="text-sm text-white/40 mb-1">No timeline items yet</p>
        <p className="text-xs text-white/25">Add milestones or tasks with due dates to see your project timeline</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-white/60" />
          <h3 className="font-display font-semibold text-sm text-white">Project Timeline</h3>
        </div>
        <span className="text-xs text-white/40">{completedCount}/{milestoneSorted.length} milestones · {tasksDue.length} tasks due</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="relative min-w-max" style={{ padding: '56px 48px 72px' }}>
          {/* Track */}
          <div className="absolute left-12 right-12 h-px bg-white/10" style={{ top: '50%' }} />

          <div className="relative flex items-center">
            {allItems.map((item) => {
              const isPast = new Date(item.due_date) < new Date()
              const isDone = item._type === 'milestone' ? item.completed : item.status === 'done'
              return (
                <div key={`${item._type}-${item.id}`} className="flex flex-col items-center" style={{ width: '140px' }}>
                  {/* Title above */}
                  <div className="mb-5 w-28 text-center">
                    <p className={`text-[11px] font-medium leading-snug ${
                      isDone ? 'text-white/30 line-through' : 'text-white'
                    }`}>
                      {item.title}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                      item._type === 'milestone'
                        ? 'bg-yellow-500/10 text-yellow-400/60'
                        : 'bg-blue-500/10 text-blue-400/60'
                    }`}>
                      {item._type === 'milestone' ? 'Milestone' : 'Task'}
                    </span>
                  </div>

                  {/* Node */}
                  {item._type === 'milestone' ? (
                    <button
                      onClick={() => handleToggle(item)}
                      title={isDone ? 'Mark incomplete' : 'Mark complete'}
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-200 hover:scale-125 relative z-10 ${
                        isDone
                          ? 'bg-green-400 border-green-400 shadow-lg shadow-green-400/30'
                          : isPast
                            ? 'bg-red-500/20 border-red-400 hover:bg-red-500/30'
                            : 'bg-black border-white/50 hover:border-white hover:bg-white/10'
                      }`}
                    />
                  ) : (
                    <div className={`w-4 h-4 rounded border-2 relative z-10 flex items-center justify-center ${
                      isPast
                        ? 'bg-orange-500/20 border-orange-400'
                        : 'bg-black border-blue-400/50'
                    }`}>
                      <CheckSquare size={8} className={isPast ? 'text-orange-400' : 'text-blue-400/50'} />
                    </div>
                  )}

                  {/* Date below */}
                  <div className="mt-5 w-24 text-center">
                    <p className={`text-[10px] ${isPast && !isDone ? 'text-red-400/70' : 'text-white/40'}`}>
                      {new Date(item.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                    {isDone && <p className="text-[9px] text-green-400/60 mt-0.5">Done</p>}
                    {isPast && !isDone && <p className="text-[9px] text-red-400/60 mt-0.5">Overdue</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 pt-4 border-t border-white/[0.06]">
        {[
          { cls: 'bg-green-400', label: 'Milestone done' },
          { cls: 'bg-black border border-white/40', label: 'Milestone pending' },
          { cls: 'bg-blue-500/20 border border-blue-400/50', label: 'Task due' },
          { cls: 'bg-red-500/30 border border-red-400', label: 'Overdue' },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
            <span className="text-[10px] text-white/35">{label}</span>
          </div>
        ))}
        <p className="ml-auto text-[10px] text-white/25">Click milestone to toggle</p>
      </div>
    </div>
  )
}
