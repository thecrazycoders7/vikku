import { useState } from 'react'
import { CheckCircle2, Circle, Plus, Trash2, Flag, ThumbsUp, ThumbsDown, Clock } from 'lucide-react'
import { createMilestone, updateMilestone, deleteMilestone } from '../../lib/pmService'

export default function MilestoneList({ projectId, milestones, onMilestonesChange }) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDate) return
    const milestone = await createMilestone({
      project_id: projectId,
      title: newTitle.trim(),
      due_date: newDate,
      completed: false,
    })
    onMilestonesChange([...milestones, milestone])
    setNewTitle('')
    setNewDate('')
    setAdding(false)
  }

  const handleToggle = async (m) => {
    const updated = await updateMilestone(m.id, { completed: !m.completed })
    onMilestonesChange(milestones.map((x) => x.id === m.id ? { ...x, ...updated } : x))
  }

  const handleDelete = async (id) => {
    await deleteMilestone(id)
    onMilestonesChange(milestones.filter((m) => m.id !== id))
  }

  const sorted = [...milestones].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-white/60" />
          <h3 className="font-display font-semibold text-sm text-white">Milestones</h3>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/80 transition-colors"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {sorted.map((m) => {
          const isPast = !m.completed && new Date(m.due_date) < new Date()
          return (
            <div key={m.id} className="flex items-center gap-3 group">
              <button onClick={() => handleToggle(m)} className="flex-shrink-0 transition-colors">
                {m.completed
                  ? <CheckCircle2 size={16} className="text-green-400" />
                  : <Circle size={16} className={isPast ? 'text-red-400/60' : 'text-white/30'} />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium leading-snug ${m.completed ? 'line-through text-white/30' : 'text-white'}`}>
                  {m.title}
                </p>
                <p className={`text-[10px] mt-0.5 ${
                  m.completed ? 'text-white/20' : isPast ? 'text-red-400/60' : 'text-white/40'
                }`}>
                  {isPast && !m.completed ? 'Overdue - ' : ''}
                  {new Date(m.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {/* Client approval status (only relevant once completed) */}
                {m.completed && m.approval_status === 'approved' && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-green-400">
                    <ThumbsUp size={9} /> Client approved
                    {m.client_note && <span className="text-white/30 truncate">· &ldquo;{m.client_note}&rdquo;</span>}
                  </span>
                )}
                {m.completed && m.approval_status === 'rejected' && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-400">
                    <ThumbsDown size={9} /> Revision requested
                    {m.client_note && <span className="text-white/30 truncate">· &ldquo;{m.client_note}&rdquo;</span>}
                  </span>
                )}
                {m.completed && (!m.approval_status || m.approval_status === 'pending') && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-yellow-400/60">
                    <Clock size={9} /> Awaiting client approval
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )
        })}

        {milestones.length === 0 && !adding && (
          <p className="text-[11px] text-white/30 py-2">No milestones yet. Add key dates for your project.</p>
        )}

        {adding && (
          <div className="glass rounded-xl p-3 mt-2">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Milestone title..."
              className="w-full bg-transparent text-xs text-white placeholder-white/30 outline-none mb-2"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-transparent text-xs text-white/60 outline-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="text-[10px] bg-white text-black px-2.5 py-1 rounded-lg font-medium hover:bg-white/90"
              >
                Add milestone
              </button>
              <button
                onClick={() => setAdding(false)}
                className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
