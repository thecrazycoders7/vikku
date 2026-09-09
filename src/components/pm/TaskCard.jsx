import { useState } from 'react'
import { Calendar, CheckSquare, ExternalLink, GitMerge, RotateCcw, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react'
import TaskEditModal from './TaskEditModal'
import { getLabelStyle, taskAssignees } from '../../lib/pmConstants'

const PRIORITY_COLOR = {
  urgent: '#ef4444',
  high:   '#f97316',
  medium: '#eab308',
  low:    '#6b7280',
}

const PRIORITY_DOT = {
  urgent: 'bg-red-500',
  high:   'bg-orange-500',
  medium: 'bg-yellow-500',
  low:    'bg-white/20',
}

export default function TaskCard({ task, onTaskRemoved, onUpdate, draggable, onDragStart, selectMode, selected, onToggleSelect, projectLabels }) {
  const [editing, setEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const assignees = taskAssignees(task)
  const hasSubtasks = task._subtasksTotal > 0
  const labelStyle = task.label ? getLabelStyle(task.label, projectLabels) : null
  const isBlocked = task._isBlocked
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
  const needsAlert = isOverdue || isBlocked

  const handleClick = () => {
    if (selectMode) { onToggleSelect?.(); return }
    if (!isDragging) setEditing(true)
  }

  const priorityColor = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.medium
  const priorityDot = PRIORITY_DOT[task.priority] || PRIORITY_DOT.medium

  return (
    <>
      {editing && !selectMode && (
        <TaskEditModal
          task={task}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => { onUpdate?.(updated); setEditing(false) }}
          onDeleted={(id) => { onTaskRemoved?.(id); setEditing(false) }}
        />
      )}
      <div
        draggable={draggable && !selectMode}
        onDragStart={(e) => { e.stopPropagation(); onDragStart?.(); setIsDragging(true) }}
        onDragEnd={() => setIsDragging(false)}
        onClick={handleClick}
        className={`relative rounded-xl p-3 cursor-pointer transition-all duration-150 select-none border group
          ${isDragging ? 'scale-105 rotate-1 shadow-2xl shadow-black/60 opacity-70' : ''}
          ${selected ? 'border-white/25 bg-white/[0.07]' : 'bg-[#111] border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04]'}
          ${needsAlert && !selected ? 'border-red-500/25' : ''}
        `}
        style={{ borderLeft: `2px solid ${priorityColor}33` }}
        title={task.created_by_email ? `Added by ${task.created_by_email}` : undefined}
      >
        {/* Select checkbox */}
        {selectMode && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              selected ? 'bg-white border-white' : 'border-white/40 bg-transparent'
            }`}>
              {selected && <div className="w-2 h-2 bg-black rounded-sm" />}
            </div>
          </div>
        )}

        <div className={selectMode ? 'pl-6' : ''}>
          {/* Top row: label + alert badge */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {labelStyle && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wide shrink-0" style={{ background: labelStyle.bg, color: labelStyle.color }}>
                  {task.label}
                </span>
              )}
              {task.recurrence && (
                <RotateCcw size={9} className="text-blue-400/50 shrink-0" title={`Repeats ${task.recurrence}`} />
              )}
            </div>
            {needsAlert && (
              <div className="shrink-0 text-red-400" title={isBlocked ? 'Blocked' : 'Overdue'}>
                <AlertCircle size={12} />
              </div>
            )}
          </div>

          {/* Title */}
          <p className="text-[13px] text-white font-medium leading-snug mb-2.5 line-clamp-2">
            {task.title}
          </p>

          {/* Bottom meta row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Priority dot */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${priorityDot}`}
                title={task.priority}
              />

              {/* Subtasks */}
              {hasSubtasks && (
                <span className={`flex items-center gap-0.5 text-[10px] ${
                  task._subtasksDone === task._subtasksTotal ? 'text-green-400/70' : 'text-white/35'
                }`}>
                  <CheckSquare size={9} />
                  {task._subtasksDone}/{task._subtasksTotal}
                </span>
              )}

              {/* Client status */}
              {task.client_approval_status === 'approved' && (
                <span className="text-green-400/60" title="Approved by client">
                  <ThumbsUp size={10} />
                </span>
              )}
              {task.client_approval_status === 'needs_revision' && (
                <span className="text-orange-400/60" title="Revision requested">
                  <ThumbsDown size={10} />
                </span>
              )}

              {/* Blocked text */}
              {isBlocked && (
                <span className="flex items-center gap-0.5 text-[9px] text-red-400/60">
                  <GitMerge size={9} /> blocked
                </span>
              )}

              {/* External link */}
              {task.task_link && (
                <a
                  href={task.task_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-white/25 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink size={9} />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Due date */}
              {task.due_date && (
                <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-400' : 'text-white/35'}`}>
                  <Calendar size={9} />
                  {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              )}

              {/* Assignees */}
              {assignees.length > 0 && (
                <span className="flex items-center shrink-0" title={assignees.join(', ')}>
                  {assignees.slice(0, 3).map((email, i) => (
                    <span
                      key={email}
                      className={`w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-[9px] text-indigo-300 font-semibold ${i > 0 ? '-ml-1.5' : ''}`}
                    >
                      {email[0].toUpperCase()}
                    </span>
                  ))}
                  {assignees.length > 3 && (
                    <span className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px] text-white/60 font-semibold -ml-1.5">
                      +{assignees.length - 3}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
