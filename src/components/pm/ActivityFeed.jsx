import { useEffect, useState } from 'react'
import { Activity, Plus, ArrowRight, CheckCircle, Flag, Loader2, ChevronDown, ChevronUp, UserPlus, UserMinus, Trash2, CheckSquare, RotateCcw } from 'lucide-react'
import { getProjectActivity } from '../../lib/pmService'

const VISIBLE_COUNT = 7

const ACTION_ICON = {
  task_created: Plus,
  task_updated: ArrowRight,
  task_done: CheckCircle,
  milestone_done: Flag,
  task_assigned: UserPlus,
  task_unassigned: UserMinus,
  task_deleted: Trash2,
  subtask_added: Plus,
  subtask_done: CheckSquare,
  subtask_reopened: RotateCcw,
  subtask_deleted: Trash2,
}

const ACTION_COLOR = {
  task_created: 'text-blue-400',
  task_updated: 'text-white/40',
  task_done: 'text-green-400',
  milestone_done: 'text-yellow-400',
  task_assigned: 'text-violet-400',
  task_unassigned: 'text-white/40',
  task_deleted: 'text-red-400',
  subtask_added: 'text-blue-400',
  subtask_done: 'text-green-400',
  subtask_reopened: 'text-white/40',
  subtask_deleted: 'text-red-400',
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ActivityFeed({ projectId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!projectId) return
    getProjectActivity(projectId).then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [projectId])

  const visibleItems = showAll ? items : items.slice(0, VISIBLE_COUNT)

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={13} className="text-white/30" />
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Activity</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={14} className="animate-spin text-white/20" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-[11px] text-white/20 text-center py-4">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item) => {
            const Icon = ACTION_ICON[item.action] || ArrowRight
            const color = ACTION_COLOR[item.action] || 'text-white/40'
            return (
              <div key={item.id} className="flex gap-2.5">
                <div className={`w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                  <Icon size={11} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60 leading-snug">
                    <span className="text-white/40">{item.user_email?.split('@')[0] || 'Someone'}</span>
                    {' '}
                    {item.action === 'task_created' && 'created'}
                    {item.action === 'task_updated' && 'updated'}
                    {item.action === 'task_done' && 'completed'}
                    {item.action === 'milestone_done' && 'reached milestone'}
                    {item.action === 'task_assigned' && 'changed assignee on'}
                    {item.action === 'task_unassigned' && 'unassigned'}
                    {item.action === 'task_deleted' && 'deleted'}
                    {item.action === 'subtask_added' && 'added a subtask to'}
                    {item.action === 'subtask_done' && 'completed a subtask in'}
                    {item.action === 'subtask_reopened' && 'reopened a subtask in'}
                    {item.action === 'subtask_deleted' && 'removed a subtask from'}
                    {' '}
                    <span className="text-white/80">{item.entity_title}</span>
                  </p>
                  <p className="text-[10px] text-white/20 mt-0.5">{timeAgo(item.created_at)}</p>
                </div>
              </div>
            )
          })}

          {items.length > VISIBLE_COUNT && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full flex items-center justify-center gap-1 text-[11px] text-white/40 hover:text-white/70 border border-white/[0.06] hover:border-white/15 rounded-lg py-1.5 mt-1 transition-all"
            >
              {showAll ? (
                <>Show less <ChevronUp size={12} /></>
              ) : (
                <>Show {items.length - VISIBLE_COUNT} more <ChevronDown size={12} /></>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
