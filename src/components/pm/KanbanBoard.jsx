import { useState, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, X, ClipboardList, Zap, Eye, CheckCircle, Trash2, MousePointer, List, Columns } from 'lucide-react'
import TaskCard from './TaskCard'
import TaskCreateModal from './TaskCreateModal'
import TaskFilterBar, { DEFAULT_FILTERS } from './TaskFilterBar'
import { createTask, updateTask, deleteTask, logActivity } from '../../lib/pmService'
import { notifyTaskAssigned, insertPmNotification, getMemberUserId } from '../../lib/notificationService'
import { useTheme } from '../../contexts/ThemeContext'

const PRIORITY_SORT_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }

function compareTasks(a, b, field, dir) {
  let av, bv
  switch (field) {
    case 'due_date':
      av = a.due_date ? new Date(a.due_date).getTime() : Infinity
      bv = b.due_date ? new Date(b.due_date).getTime() : Infinity
      break
    case 'priority':
      av = PRIORITY_SORT_ORDER[a.priority] ?? 4
      bv = PRIORITY_SORT_ORDER[b.priority] ?? 4
      break
    case 'created_at':
      av = new Date(a.created_at).getTime()
      bv = new Date(b.created_at).getTime()
      break
    case 'updated_at':
      av = new Date(a.updated_at || a.created_at).getTime()
      bv = new Date(b.updated_at || b.created_at).getTime()
      break
    case 'title':
      av = (a.title || '').toLowerCase()
      bv = (b.title || '').toLowerCase()
      break
    case 'assigned_to_email':
      av = taskAssignees(a)[0] || '￿'
      bv = taskAssignees(b)[0] || '￿'
      break
    default:
      return 0
  }
  if (av < bv) return dir === 'asc' ? -1 : 1
  if (av > bv) return dir === 'asc' ? 1 : -1
  return 0
}

function encodeFiltersToParams(params, filters) {
  const next = new URLSearchParams(params)
  const set = (key, val) => { val ? next.set(key, val) : next.delete(key) }
  set('priority', filters.priorities.join(',') || '')
  const created = [...(filters.createdByMe ? ['me'] : []), ...filters.createdByMembers]
  set('created', created.join(',') || '')
  set('assigned', filters.assignedToMe ? 'me' : '')
  set('overdue', filters.overdue ? '1' : '')
  set('due', filters.dueToday ? 'today' : '')
  set('recent', filters.recentlyUpdated ? '1' : '')
  set('completed', filters.completed ? '1' : '')
  set('unassigned', filters.unassigned ? '1' : '')
  set('blocked', filters.blocked ? '1' : '')
  set('view', filters.smartView || '')
  set('sort', filters.sortField || '')
  set('dir', filters.sortField ? filters.sortDir : '')
  return next
}

function decodeParamsToFilters(params) {
  const created = (params.get('created') || '').split(',').filter(Boolean)
  return {
    priorities: (params.get('priority') || '').split(',').filter(Boolean),
    assignedToMe: params.get('assigned') === 'me',
    createdByMe: created.includes('me'),
    createdByMembers: created.filter((c) => c !== 'me'),
    overdue: params.get('overdue') === '1',
    dueToday: params.get('due') === 'today',
    recentlyUpdated: params.get('recent') === '1',
    completed: params.get('completed') === '1',
    unassigned: params.get('unassigned') === '1',
    blocked: params.get('blocked') === '1',
    smartView: params.get('view') || '',
    sortField: params.get('sort') || '',
    sortDir: params.get('dir') === 'desc' ? 'desc' : 'asc',
  }
}

function matchesSmartView(t, view, userEmail, doneKeys) {
  const isDone = doneKeys.has(t.status)
  switch (view) {
    case 'myWork':
      return taskAssignees(t).includes(userEmail) && !isDone
    case 'dueSoon': {
      if (!t.due_date || isDone) return false
      const due = new Date(t.due_date + 'T00:00:00')
      const now = new Date(); now.setHours(0, 0, 0, 0)
      const in7 = new Date(now); in7.setDate(in7.getDate() + 7)
      return due >= now && due <= in7
    }
    case 'needsAttention': {
      const overdue = t.due_date && new Date(t.due_date) < new Date() && !isDone
      return overdue || taskAssignees(t).length === 0 || !!t._isBlocked
    }
    case 'recentlyUpdated': {
      const ts = new Date(t.updated_at || t.created_at).getTime()
      return Date.now() - ts <= 48 * 3600 * 1000
    }
    case 'completedThisWeek': {
      if (!isDone || !t.completed_at) return false
      const completedAt = new Date(t.completed_at)
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      return completedAt >= startOfWeek
    }
    default:
      return true
  }
}

function getNextDueDate(dueDate, recurrence) {
  if (!dueDate) return null
  const d = new Date(dueDate + 'T00:00:00')
  if (recurrence === 'daily') d.setDate(d.getDate() + 1)
  else if (recurrence === 'weekly') d.setDate(d.getDate() + 7)
  else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1)
  return d.toISOString().split('T')[0]
}
import { getLabelStyle, DEFAULT_WORKFLOW_STAGES, taskAssignees } from '../../lib/pmConstants'

const DEFAULT_EMPTY = {
  todo:        { Icon: ClipboardList, hint: 'Add tasks to get started' },
  in_progress: { Icon: Zap,          hint: 'Drag tasks here to start working' },
  review:      { Icon: Eye,          hint: 'Move tasks here when ready to review' },
  done:        { Icon: CheckCircle,  hint: 'Completed tasks will appear here' },
}

function stageColor(hexColor) {
  // Convert a hex color to a subtle Tailwind-compatible inline style
  return hexColor || '#6b7280'
}

export default function KanbanBoard({ projectId, projectName, tasks, onTasksChange, user, workflow, projectLabels }) {
  // workflow = array of stage objects [{status_key, name, color, is_done, position}, ...]
  // or null/undefined → use DEFAULT_WORKFLOW_STAGES
  const stages = (workflow && workflow.length > 0) ? workflow : DEFAULT_WORKFLOW_STAGES
  const { theme } = useTheme()

  const [createModalStage, setCreateModalStage] = useState(null) // { status_key, name }
  const [dragTaskId, setDragTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [dragOverTaskId, setDragOverTaskId] = useState(null)
  const [dragInsertBefore, setDragInsertBefore] = useState(true)
  const dragOverTaskIdRef = useRef(null)
  const dragInsertBeforeRef = useRef(true)
  const [labelFilter, setLabelFilter] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFiltersState] = useState(() => ({ ...DEFAULT_FILTERS, ...decodeParamsToFilters(searchParams) }))
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [bulkWorking, setBulkWorking] = useState(false)
  const [migratingOrphans, setMigratingOrphans] = useState(false)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'list'

  const updateFilters = (patch) => {
    setFiltersState((prev) => {
      const next = { ...prev, ...patch }
      setSearchParams(encodeFiltersToParams(searchParams, next), { replace: true })
      return next
    })
  }

  const doneKeys = useMemo(() => new Set(stages.filter((s) => s.is_done).map((s) => s.status_key)), [stages])
  const creators = useMemo(() => [...new Set(tasks.map((t) => t.created_by_email).filter(Boolean))].sort(), [tasks])

  const taskMatchesFilters = (t) => {
    if (filters.priorities.length && !filters.priorities.includes(t.priority || 'none')) return false
    if (filters.assignedToMe && !taskAssignees(t).includes(user?.email)) return false
    if (filters.createdByMe && t.created_by_email !== user?.email) return false
    if (filters.createdByMembers.length && !filters.createdByMembers.includes(t.created_by_email)) return false
    if (filters.overdue) {
      const isOverdue = t.due_date && new Date(t.due_date) < new Date() && !doneKeys.has(t.status)
      if (!isOverdue) return false
    }
    if (filters.dueToday) {
      if (!t.due_date) return false
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const due = new Date(t.due_date + 'T00:00:00')
      if (due.getTime() !== today.getTime()) return false
    }
    if (filters.recentlyUpdated) {
      const ts = new Date(t.updated_at || t.created_at).getTime()
      if (Date.now() - ts > 48 * 3600 * 1000) return false
    }
    if (filters.completed && !doneKeys.has(t.status)) return false
    if (filters.unassigned && taskAssignees(t).length > 0) return false
    if (filters.blocked && !t._isBlocked) return false
    if (filters.smartView && !matchesSmartView(t, filters.smartView, user?.email, doneKeys)) return false
    return true
  }

  let filteredTasks = tasks
    .filter((t) => !labelFilter || t.label === labelFilter)
    .filter(taskMatchesFilters)

  if (filters.sortField) {
    filteredTasks = [...filteredTasks].sort((a, b) => compareTasks(a, b, filters.sortField, filters.sortDir))
  }

  const tasksByStage = stages.reduce((acc, stage) => {
    acc[stage.status_key] = filteredTasks.filter((t) => t.status === stage.status_key)
    return acc
  }, {})

  // Collect tasks with status keys not in current workflow (orphaned tasks)
  const stageKeys = new Set(stages.map((s) => s.status_key))
  const orphanedTasks = filteredTasks.filter((t) => !stageKeys.has(t.status))

  const usedLabels = [...new Set(tasks.map((t) => t.label).filter(Boolean))]

  const handleCreateSubmit = async (fields) => {
    const { status, title, description, priority, due_date, assigned_to_emails = [], label, task_link } = fields
    const tempId = `temp-${Date.now()}`
    const tempTask = { id: tempId, project_id: projectId, created_at: new Date().toISOString(), ...fields }
    onTasksChange((prev) => [...prev, tempTask])
    try {
      const task = await createTask({
        project_id: projectId, title, status,
        priority: priority || 'medium',
        description: description || null,
        due_date: due_date || null,
        assigned_to_emails,
        assigned_to_email: assigned_to_emails[0] || null,
        created_by_email: user?.email || null,
        label: label || null,
        task_link: task_link || null,
      })
      if (!task) throw new Error('no task returned')
      onTasksChange((prev) => prev.map((t) => t.id === tempId ? task : t))
      if (user) logActivity({ project_id: projectId, user_id: user.id, user_email: user.email, action: 'task_created', entity_type: 'task', entity_id: task.id, entity_title: title })
      // Notify each assignee (other than self) a task was created assigned to them
      assigned_to_emails.filter((email) => email !== user?.email).forEach((email) => {
        notifyTaskAssigned({
          taskTitle: title,
          projectName: projectName || '',
          assigneeEmail: email,
          dueDate: due_date || undefined,
        })
        getMemberUserId(projectId, email).then(assigneeId => {
          if (assigneeId) insertPmNotification({
            userId: assigneeId,
            type: 'task_assigned',
            message: `You were assigned "${title}"`,
            subText: projectName || '',
            projectId,
            entityId: task.id,
          })
        })
      })
    } catch {
      onTasksChange((prev) => prev.filter((t) => t.id !== tempId))
    }
  }

  const handleTaskRemoved = (taskId) => {
    onTasksChange(tasks.filter((t) => t.id !== taskId))
  }

  const handleUpdate = (updated) => {
    onTasksChange(tasks.map((t) => t.id === updated.id ? { ...t, ...updated } : t))
  }

  const handleDragStart = (taskId) => setDragTaskId(taskId)

  // ── Touch drag-and-drop (mobile) ─────────────────────────────
  const touchDragRef = useRef({ taskId: null, ghost: null, moved: false })

  const handleTouchStart = (e, taskId) => {
    if (selectMode) return
    touchDragRef.current = { taskId, ghost: null, moved: false }
  }

  const handleTouchMove = (e) => {
    const { taskId } = touchDragRef.current
    if (!taskId) return
    const touch = e.touches[0]

    if (!touchDragRef.current.moved) {
      touchDragRef.current.moved = true
      // Clone the card as a floating ghost
      const cardEl = e.currentTarget
      const rect = cardEl.getBoundingClientRect()
      const ghost = cardEl.cloneNode(true)
      ghost.style.cssText = `position:fixed;width:${rect.width}px;opacity:0.85;pointer-events:none;z-index:9999;transform:scale(1.03);border-radius:12px;left:${rect.left}px;top:${rect.top}px;`
      document.body.appendChild(ghost)
      touchDragRef.current.ghost = ghost
      touchDragRef.current.offsetX = touch.clientX - rect.left
      touchDragRef.current.offsetY = touch.clientY - rect.top
      setDragTaskId(taskId)
    }

    e.preventDefault()
    const { ghost, offsetX, offsetY } = touchDragRef.current
    if (ghost) {
      ghost.style.left = (touch.clientX - offsetX) + 'px'
      ghost.style.top  = (touch.clientY - offsetY) + 'px'
    }

    // Highlight the column underneath
    if (ghost) ghost.style.display = 'none'
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (ghost) ghost.style.display = ''
    let col = el
    while (col && !col.dataset.statusKey) col = col.parentElement
    setDragOverCol(col?.dataset.statusKey || null)
  }

  const handleTouchEnd = (e) => {
    const { taskId, ghost } = touchDragRef.current
    if (ghost) { document.body.removeChild(ghost); touchDragRef.current.ghost = null }
    touchDragRef.current.taskId = null

    if (!taskId || !touchDragRef.current.moved) { setDragTaskId(null); setDragOverCol(null); return }

    const touch = e.changedTouches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    let col = el
    while (col && !col.dataset.statusKey) col = col.parentElement
    if (col?.dataset.statusKey) {
      handleDrop(col.dataset.statusKey)
    } else {
      setDragTaskId(null)
      setDragOverCol(null)
    }
  }

  const handleTaskDragOver = (e, taskId) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const before = e.clientY < rect.top + rect.height / 2
    dragOverTaskIdRef.current = taskId
    dragInsertBeforeRef.current = before
    setDragOverTaskId(taskId)
    setDragInsertBefore(before)
  }

  const handleDrop = async (newStatusKey) => {
    const overTaskId = dragOverTaskIdRef.current
    const insertBefore = dragInsertBeforeRef.current
    dragOverTaskIdRef.current = null
    setDragOverCol(null)
    setDragOverTaskId(null)
    if (!dragTaskId) return
    const task = tasks.find((t) => t.id === dragTaskId)
    if (!task) { setDragTaskId(null); return }

    const sameCol = task.status === newStatusKey

    if (overTaskId && overTaskId !== dragTaskId) {
      const colTasks = tasks
        .filter((t) => t.status === newStatusKey && t.id !== dragTaskId)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      const targetIdx = colTasks.findIndex((t) => t.id === overTaskId)
      const insertAt = targetIdx === -1 ? colTasks.length : (insertBefore ? targetIdx : targetIdx + 1)
      colTasks.splice(insertAt, 0, { ...task, status: newStatusKey })
      const positioned = colTasks.map((t, i) => ({ ...t, position: i * 100 }))
      onTasksChange(tasks.map((t) => {
        const p = positioned.find((pt) => pt.id === t.id)
        return p ? p : t
      }))
      await Promise.all(positioned.map((t) => updateTask(t.id, { status: newStatusKey, position: t.position })))
    } else if (!sameCol) {
      onTasksChange(tasks.map((t) => t.id === dragTaskId ? { ...t, status: newStatusKey } : t))
      await updateTask(dragTaskId, { status: newStatusKey })
    }

    const isDoneStage = stages.find((s) => s.status_key === newStatusKey)?.is_done
    const wasDoneStage = stages.find((s) => s.status_key === task.status)?.is_done
    if (!sameCol) {
      const completedAt = isDoneStage ? new Date().toISOString() : null
      if (isDoneStage !== wasDoneStage) updateTask(dragTaskId, { completed_at: completedAt })
    }
    if (user && !sameCol) {
      const targetStageName = stages.find((s) => s.status_key === newStatusKey)?.name || newStatusKey
      logActivity({ project_id: projectId, user_id: user.id, user_email: user.email, action: isDoneStage ? 'task_done' : 'task_updated', entity_type: 'task', entity_id: task.id, entity_title: task.title, detail: isDoneStage ? undefined : `moved to ${targetStageName}` })
    }

    // Recurring task: create next occurrence when completed
    if (isDoneStage && !sameCol && task.recurrence) {
      const firstStage = stages.find((s) => !s.is_done) || stages[0]
      createTask({
        project_id: projectId,
        title: task.title,
        description: task.description || null,
        priority: task.priority || 'medium',
        status: firstStage.status_key,
        due_date: getNextDueDate(task.due_date, task.recurrence),
        assigned_to_emails: taskAssignees(task),
        assigned_to_email: taskAssignees(task)[0] || null,
        created_by_email: task.created_by_email || null,
        label: task.label || null,
        recurrence: task.recurrence,
      }).then((newTask) => {
        if (newTask) onTasksChange((prev) => [...prev, newTask])
      }).catch(() => {})
    }

    setDragTaskId(null)
  }

  const toggleSelect = (taskId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(taskId) ? next.delete(taskId) : next.add(taskId)
      return next
    })
  }

  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()) }

  const handleBulkMove = async (statusKey) => {
    if (!selected.size) return
    setBulkWorking(true)
    const ids = [...selected]
    onTasksChange(tasks.map((t) => selected.has(t.id) ? { ...t, status: statusKey } : t))
    await Promise.all(ids.map((id) => updateTask(id, { status: statusKey })))
    exitSelectMode()
    setBulkWorking(false)
  }

  const handleBulkDelete = async () => {
    if (!selected.size || !window.confirm(`Delete ${selected.size} task${selected.size !== 1 ? 's' : ''}?`)) return
    setBulkWorking(true)
    const ids = [...selected]
    const deletedTasks = tasks.filter((t) => selected.has(t.id))
    onTasksChange(tasks.filter((t) => !selected.has(t.id)))
    const results = await Promise.allSettled(ids.map((id) => deleteTask(id)))
    const failedIds = new Set(ids.filter((_, i) => results[i].status === 'rejected'))
    if (failedIds.size) {
      const failedTasks = tasks.filter((t) => failedIds.has(t.id))
      onTasksChange((prev) => [...prev, ...failedTasks])
      alert(`${failedIds.size} task${failedIds.size !== 1 ? 's' : ''} couldn't be deleted - you may not have permission`)
    }
    if (user) {
      deletedTasks.filter((t) => !failedIds.has(t.id)).forEach((t) => {
        logActivity({ project_id: projectId, user_id: user.id, user_email: user.email, action: 'task_deleted', entity_type: 'task', entity_id: t.id, entity_title: t.title })
      })
    }
    exitSelectMode()
    setBulkWorking(false)
  }

  return (
    <div>
      {/* Priority/Created-by/quick filters + sort + presets */}
      <TaskFilterBar filters={filters} onChange={updateFilters} creators={creators} user={user} projectId={projectId} />

      {/* Label filter + Select/List toggle */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {usedLabels.length > 0 && (
          <>
            <button
              onClick={() => setLabelFilter('')}
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                !labelFilter ? 'bg-white/10 text-white/70 border-white/20' : 'border-white/[0.08] text-white/30 hover:border-white/20'
              }`}
            >
              All
            </button>
            {usedLabels.map((lbl) => {
              const s = getLabelStyle(lbl, projectLabels)
              const active = labelFilter === lbl
              return (
                <button
                  key={lbl}
                  onClick={() => setLabelFilter(active ? '' : lbl)}
                  className="text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all"
                  style={active && s
                    ? { background: s.bg, color: s.color, borderColor: s.border }
                    : { borderColor: 'rgba(255,255,255,0.08)', color: theme === 'light' ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.3)' }
                  }
                >
                  {lbl}
                </button>
              )
            })}
            <div className="w-px h-4 bg-white/[0.08]" />
          </>
        )}
        <button
          onClick={() => { setSelectMode(!selectMode); if (selectMode) exitSelectMode() }}
          className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
            selectMode ? 'bg-white/10 text-white/70 border-white/20' : 'border-white/[0.08] text-white/30 hover:border-white/20'
          }`}
        >
          <MousePointer size={10} />
          {selectMode ? 'Cancel' : 'Select'}
        </button>
        <button
          onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
          className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
            viewMode === 'list' ? 'bg-white/10 text-white/70 border-white/20' : 'border-white/[0.08] text-white/30 hover:border-white/20'
          }`}
        >
          {viewMode === 'kanban' ? <List size={10} /> : <Columns size={10} />}
          {viewMode === 'kanban' ? 'List' : 'Board'}
        </button>
      </div>

      {/* Orphaned tasks warning */}
      {orphanedTasks.length > 0 && (() => {
        const firstStage = stages.find((s) => !s.is_done) || stages[0]
        const moveOrphans = async () => {
          if (!firstStage || migratingOrphans) return
          setMigratingOrphans(true)
          const ids = orphanedTasks.map((t) => t.id)
          onTasksChange(tasks.map((t) => ids.includes(t.id) ? { ...t, status: firstStage.status_key } : t))
          try {
            await Promise.all(ids.map((id) => updateTask(id, { status: firstStage.status_key })))
          } finally {
            setMigratingOrphans(false)
          }
        }
        return (
          <div className="mb-4 px-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] text-[10px] text-yellow-400/80 flex items-center justify-between gap-3">
            <span>
              {orphanedTasks.length} task{orphanedTasks.length !== 1 ? 's' : ''} have stages not in the current workflow.
            </span>
            {firstStage && (
              <button
                onClick={moveOrphans}
                disabled={migratingOrphans}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-300 font-medium transition-colors disabled:opacity-50"
              >
                {migratingOrphans ? 'Moving…' : `Move all to "${firstStage.name}"`}
              </button>
            )}
          </div>
        )
      })()}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {stages.map((stage) => {
            const stageTasks = tasksByStage[stage.status_key] || []
            if (stageTasks.length === 0) return null
            return (
              <div key={stage.status_key}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stageColor(stage.color) }} />
                  <span className="text-xs font-semibold text-white/70">{stage.name}</span>
                  <span className="text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded-full">{stageTasks.length}</span>
                </div>
                <div className="space-y-1.5">
                  {stageTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onTaskRemoved={handleTaskRemoved}
                      onUpdate={handleUpdate}
                      draggable={false}
                      selectMode={selectMode}
                      selected={selected.has(task.id)}
                      onToggleSelect={() => toggleSelect(task.id)}
                      projectLabels={projectLabels}
                    />
                  ))}
                </div>
              </div>
            )
          })}
          {filteredTasks.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-xs text-white/30">No tasks yet. Add one with the + button on each column in board view.</p>
            </div>
          )}
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ minWidth: 0 }}>
          {stages.map((stage) => {
            const isOver = dragOverCol === stage.status_key
            const stageTasks = filters.sortField
              ? (tasksByStage[stage.status_key] || [])
              : (tasksByStage[stage.status_key] || []).sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            const DefaultIcon = DEFAULT_EMPTY[stage.status_key]?.Icon || ClipboardList
            const defaultHint = DEFAULT_EMPTY[stage.status_key]?.hint || 'Drop tasks here'
            const wipLimit = stage.wip_limit || 0
            const wipExceeded = wipLimit > 0 && stageTasks.length > wipLimit

            return (
              <div
                key={stage.status_key}
                data-status-key={stage.status_key}
                style={{ minWidth: '200px', flex: '1 0 200px', maxWidth: '320px' }}
                className={`flex flex-col min-h-[300px] rounded-2xl p-3 transition-all duration-200 ${
                  wipExceeded
                    ? 'bg-orange-500/[0.06] ring-1 ring-orange-500/30'
                    : isOver
                    ? 'bg-white/[0.06] ring-1 ring-white/20'
                    : stage.is_done
                    ? 'bg-green-500/[0.04]'
                    : 'bg-white/[0.025]'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(stage.status_key) }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverCol(null)
                    setDragOverTaskId(null)
                    dragOverTaskIdRef.current = null
                  }
                }}
                onDrop={() => handleDrop(stage.status_key)}
              >
                <div className="h-0.5 rounded-full mb-3 -mx-1" style={{ backgroundColor: wipExceeded ? '#f97316aa' : `${stageColor(stage.color)}55` }} />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stageColor(stage.color) }} />
                    <span className="text-xs font-semibold text-white/80">{stage.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${wipExceeded ? 'bg-orange-500/20 text-orange-400' : 'bg-white/[0.05] text-white/30'}`}>
                      {stageTasks.length}{wipLimit > 0 ? `/${wipLimit}` : ''}
                    </span>
                    {wipExceeded && (
                      <span className="text-[8px] text-orange-400/80 bg-orange-500/10 px-1 py-0.5 rounded">WIP limit</span>
                    )}
                    {stage.is_done && !wipExceeded && (
                      <span className="text-[8px] text-green-400/60 bg-green-500/10 px-1 py-0.5 rounded">Done</span>
                    )}
                  </div>
                  {!selectMode && (
                    <button
                      onClick={() => setCreateModalStage({ status_key: stage.status_key, name: stage.name })}
                      className="text-white/30 hover:text-white/70 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  {stageTasks.map((task) => (
                    <div
                      key={task.id}
                      onDragOver={(e) => handleTaskDragOver(e, task.id)}
                      onTouchStart={(e) => handleTouchStart(e, task.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className="relative"
                      style={{ touchAction: dragTaskId ? 'none' : 'auto' }}
                    >
                      {dragOverTaskId === task.id && dragInsertBefore && (
                        <div className="h-0.5 bg-blue-400/60 rounded-full mx-1 mb-1" />
                      )}
                      <TaskCard
                        task={task}
                        onTaskRemoved={handleTaskRemoved}
                        onUpdate={handleUpdate}
                        draggable={!selectMode}
                        onDragStart={() => handleDragStart(task.id)}
                        selectMode={selectMode}
                        selected={selected.has(task.id)}
                        onToggleSelect={() => toggleSelect(task.id)}
                        projectLabels={projectLabels}
                      />
                      {dragOverTaskId === task.id && !dragInsertBefore && (
                        <div className="h-0.5 bg-blue-400/60 rounded-full mx-1 mt-1" />
                      )}
                    </div>
                  ))}

                  {stageTasks.length === 0 && (
                    <div
                      className={`flex-1 rounded-xl border border-dashed flex flex-col items-center justify-center min-h-[100px] gap-2 transition-all duration-200 ${
                        isOver ? 'border-white/40 bg-white/[0.06]' : 'border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <DefaultIcon size={16} className="text-white/20" />
                      <p className="text-[10px] text-white/25 text-center px-3">{defaultHint}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {createModalStage && (
        <TaskCreateModal
          projectId={projectId}
          initialStatus={createModalStage.status_key}
          initialStatusName={createModalStage.name}
          stages={stages}
          user={user}
          onSubmit={handleCreateSubmit}
          onClose={() => setCreateModalStage(null)}
        />
      )}

      {/* Bulk action floating bar */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1a1a1a] border border-white/20 rounded-2xl px-4 py-3 shadow-2xl whitespace-nowrap">
          <span className="text-xs text-white/60 mr-1 font-medium">{selected.size} selected</span>
          <span className="text-[10px] text-white/30">Move to →</span>
          {stages.map((stage) => (
            <button
              key={stage.status_key}
              onClick={() => handleBulkMove(stage.status_key)}
              disabled={bulkWorking}
              className="text-[10px] px-2.5 py-1.5 rounded-lg bg-white/[0.08] text-white/60 hover:bg-white/15 hover:text-white transition-all disabled:opacity-40"
            >
              {stage.name}
            </button>
          ))}
          <div className="w-px h-5 bg-white/[0.08]" />
          <button
            onClick={handleBulkDelete}
            disabled={bulkWorking}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
          >
            <Trash2 size={11} /> Delete
          </button>
          <button onClick={exitSelectMode} className="text-white/30 hover:text-white/60 transition-colors ml-1">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
