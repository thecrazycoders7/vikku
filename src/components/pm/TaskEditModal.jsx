import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import {
  X, Trash2, Loader2, MessageCircle, Send, Trash,
  CheckSquare, Square, Plus, Clock, User, Timer, Link, ExternalLink, Check,
  Paperclip, Download, FileText, Bell, BellOff, TrendingUp, TrendingDown,
  GitMerge, RotateCcw, Eye, EyeOff, ThumbsUp, ThumbsDown, Activity,
} from 'lucide-react'
import {
  updateTask, deleteTask, getTaskComments, createTaskComment, deleteTaskComment,
  getSubtasks, createSubtask, updateSubtask, deleteSubtask,
  getTimeLogs, createTimeLog, deleteTimeLog, getProjectMembers,
  getTaskAttachments, uploadTaskAttachment, deleteTaskAttachment, getAttachmentUrl,
  getTasks, getTaskDependencies, addTaskDependency, removeTaskDependency,
  getStorageUsedMb, toggleAttachmentVisibility,
  getProjectLabels, saveProjectLabels, logActivity, getEntityActivity,
} from '../../lib/pmService'
import { STORAGE_LIMITS_MB } from '../../lib/entitlements'
import { DEFAULT_LABELS, LABEL_COLORS, getLabelStyle, taskAssignees } from '../../lib/pmConstants'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import useSubscription from '../../hooks/useSubscription'
import TaskTimer from './TaskTimer'
import UpgradeModal from './UpgradeModal'
import { notifyTaskAssigned, insertPmNotification, getMemberUserId } from '../../lib/notificationService'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']

function isValidUrl(str) {
  try { return Boolean(new URL(str)) } catch { return false }
}

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:    'bg-white/10 text-white/40 border-white/10',
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const ACTIVITY_FALLBACK_TEXT = {
  task_created: 'created this task',
  task_updated: 'updated this task',
  task_done: 'marked this task done',
  task_assigned: 'changed the assignee',
  task_unassigned: 'unassigned this task',
  task_deleted: 'deleted this task',
  subtask_added: 'added a subtask',
  subtask_done: 'completed a subtask',
  subtask_reopened: 'reopened a subtask',
  subtask_deleted: 'removed a subtask',
}

function describeActivity(item) {
  return item.detail || ACTIVITY_FALLBACK_TEXT[item.action] || 'updated this task'
}

function fmtMins(m) {
  if (!m || m === 0) return '0m'
  const h = Math.floor(m / 60)
  const mins = m % 60
  if (h === 0) return `${mins}m`
  if (mins === 0) return `${h}h`
  return `${h}h ${mins}m`
}

export default function TaskEditModal({ task, onClose, onUpdated, onDeleted }) {
  useLockBodyScroll()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { isPro } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium',
    due_date: task.due_date || '',
    reminder_enabled: task.reminder_enabled || false,
    assigned_to_emails: taskAssignees(task),
    label: task.label || '',
    task_link: task.task_link || '',
    estimated_minutes: task.estimated_minutes || '',
    recurrence: task.recurrence || '',
  })
  const [deleting, setDeleting] = useState(false)
  const [commentError, setCommentError] = useState('')

  const toggleAssignee = (email) => setForm((f) => ({
    ...f,
    assigned_to_emails: f.assigned_to_emails.includes(email)
      ? f.assigned_to_emails.filter((e) => e !== email)
      : [...f.assigned_to_emails, email],
  }))

  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [taskActivity, setTaskActivity] = useState([])
  const notesRef = useRef(null)

  // Auto-grow the Notes textarea to fit its content (capped, then scrolls)
  useEffect(() => {
    const el = notesRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 320) + 'px'
  }, [form.description])

  const [members, setMembers] = useState([])
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false)

  const [subtasks, setSubtasks] = useState([])
  const [newSubtask, setNewSubtask] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)

  const [timeLogs, setTimeLogs] = useState([])
  const [logMinutes, setLogMinutes] = useState('')
  const [logDesc, setLogDesc] = useState('')
  const [logBillable, setLogBillable] = useState(false)
  const [loggingTime, setLoggingTime] = useState(false)
  const [timeLogError, setTimeLogError] = useState('')

  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  const [dependencies, setDependencies] = useState([]) // [{depends_on_task_id}]
  const [projectTasks, setProjectTasks] = useState([])
  const [depSearch, setDepSearch] = useState('')
  const [showDepPicker, setShowDepPicker] = useState(false)

  const [projectLabels, setProjectLabels] = useState([])
  const [addingLabel, setAddingLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])

  useEffect(() => {
    getTaskComments(task.id).then(setComments)
    getEntityActivity(task.id).then(setTaskActivity)
    getSubtasks(task.id).then(setSubtasks)
    getTimeLogs(task.id).then(setTimeLogs)
    getTaskAttachments(task.id).then(setAttachments)
    if (task.project_id) {
      getProjectMembers(task.project_id).then(setMembers)
      getTasks(task.project_id).then(setProjectTasks)
      getTaskDependencies(task.id).then(setDependencies)
      getProjectLabels(task.project_id).then((lbls) => setProjectLabels(lbls.length > 0 ? lbls : DEFAULT_LABELS))
    }
  }, [task.id, task.project_id])

  const handleAddLabel = async () => {
    const name = newLabelName.trim()
    if (!name) return
    if (projectLabels.some((l) => l.name === name)) { setAddingLabel(false); setNewLabelName(''); return }
    const updated = [...projectLabels, { name, color: newLabelColor }]
    setProjectLabels(updated)
    setNewLabelName('')
    setNewLabelColor(LABEL_COLORS[updated.length % LABEL_COLORS.length])
    setAddingLabel(false)
    await saveProjectLabels(task.project_id, updated)
  }

  const handleDeleteLabel = async (labelName) => {
    const updated = projectLabels.filter((l) => l.name !== labelName)
    setProjectLabels(updated)
    setForm((prev) => prev.label === labelName ? { ...prev, label: '' } : prev)
    await saveProjectLabels(task.project_id, updated)
  }

  const totalLogged = timeLogs.reduce((s, l) => s + (l.minutes || 0), 0)
  const subtasksDone = subtasks.filter((s) => s.completed).length

  const activityFeed = [
    ...comments.map((c) => ({ _kind: 'comment', id: `c-${c.id}`, created_at: c.created_at, data: c })),
    ...taskActivity.map((a) => ({ _kind: 'activity', id: `a-${a.id}`, created_at: a.created_at, data: a })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const handleSave = () => {
    if (!form.title.trim()) return
    if (String(task.id).startsWith('temp-')) return
    const updated = { ...task, ...form }
    onUpdated(updated)
    onClose()
    updateTask(task.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      due_date: form.due_date || null,
      reminder_enabled: form.due_date ? form.reminder_enabled : false,
      assigned_to_emails: form.assigned_to_emails,
      assigned_to_email: form.assigned_to_emails[0] || null,
      label: form.label || null,
      task_link: form.task_link.trim() || null,
      estimated_minutes: form.estimated_minutes ? parseInt(form.estimated_minutes) : null,
      recurrence: form.recurrence || null,
    }).catch((err) => {
      console.error('updateTask failed:', err)
    })
    const prevAssignees = taskAssignees(task)
    const nextAssignees = form.assigned_to_emails
    const addedAssignees = nextAssignees.filter((e) => !prevAssignees.includes(e))
    const changed = addedAssignees.length > 0 || nextAssignees.length !== prevAssignees.length
    if (user && changed) {
      logActivity({
        project_id: task.project_id,
        user_id: user.id,
        user_email: user.email,
        action: nextAssignees.length === 0 ? 'task_unassigned' : 'task_assigned',
        entity_type: 'task',
        entity_id: task.id,
        entity_title: form.title.trim(),
        detail: addedAssignees.length ? `assigned to ${addedAssignees.join(', ')}` : undefined,
      })
    }
    if (user) {
      const fieldChanges = []
      if (form.title.trim() !== task.title) fieldChanges.push(`renamed to "${form.title.trim()}"`)
      if (form.priority !== task.priority) fieldChanges.push(`priority changed to ${form.priority}`)
      if ((form.due_date || null) !== (task.due_date || null)) {
        fieldChanges.push(form.due_date ? `due date set to ${form.due_date}` : 'due date removed')
      }
      if ((form.label || null) !== (task.label || null)) {
        fieldChanges.push(form.label ? `label set to ${form.label}` : 'label removed')
      }
      fieldChanges.forEach((detail) => {
        logActivity({
          project_id: task.project_id,
          user_id: user.id,
          user_email: user.email,
          action: 'task_updated',
          entity_type: 'task',
          entity_id: task.id,
          entity_title: form.title.trim(),
          detail,
        })
      })
    }
    // Notify each newly-added assignee (skip self)
    addedAssignees.filter((email) => email !== user?.email).forEach((email) => {
      notifyTaskAssigned({
        taskTitle: form.title.trim(),
        projectName: task._projectName || '',
        assigneeEmail: email,
        dueDate: form.due_date || undefined,
      })
      getMemberUserId(task.project_id, email).then(assigneeId => {
        if (assigneeId) insertPmNotification({
          userId: assigneeId,
          type: 'task_assigned',
          message: `You were assigned "${form.title.trim()}"`,
          subText: task._projectName || '',
          projectId: task.project_id,
          entityId: task.id,
        })
      })
    })
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    setDeleting(true)
    try {
      await deleteTask(task.id)
      if (user) logActivity({ project_id: task.project_id, user_id: user.id, user_email: user.email, action: 'task_deleted', entity_type: 'task', entity_id: task.id, entity_title: task.title })
      onDeleted(task.id)
      onClose()
    } catch (err) {
      setDeleting(false)
      alert(err?.message || 'Failed to delete task')
    }
  }

  const handleSendComment = async () => {
    if (!newComment.trim() || !user) return
    if (String(task.id).startsWith('temp-')) return
    setCommentError('')
    setSendingComment(true)
    const tempId = `temp-comment-${Date.now()}`
    const tempComment = { id: tempId, task_id: task.id, user_id: user.id, user_email: user.email, content: newComment.trim(), created_at: new Date().toISOString() }
    setComments((prev) => [...prev, tempComment])
    setNewComment('')
    try {
      const saved = await createTaskComment({ task_id: task.id, user_id: user.id, user_email: user.email, content: tempComment.content })
      if (saved) {
        setComments((prev) => prev.map((c) => c.id === tempId ? saved : c))
      }
    } catch (err) {
      console.error('createTaskComment failed:', err)
      setComments((prev) => prev.filter((c) => c.id !== tempId))
      setCommentError(err?.message || 'Failed to save comment')
      setNewComment(tempComment.content)
    } finally {
      setSendingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    await deleteTaskComment(commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  // Log a subtask change against the PARENT task's activity feed, and
  // optimistically prepend it so it shows in the panel immediately.
  const logSubtaskActivity = (action, detail) => {
    if (!user) return
    logActivity({
      project_id: task.project_id, user_id: user.id, user_email: user.email,
      action, entity_type: 'task', entity_id: task.id, entity_title: task.title, detail,
    })
    setTaskActivity((prev) => [
      { id: `local-${Date.now()}`, action, detail, user_email: user.email, created_at: new Date().toISOString() },
      ...prev,
    ])
  }

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return
    const title = newSubtask.trim()
    setAddingSubtask(true)
    try {
      const st = await createSubtask({ task_id: task.id, title, completed: false })
      setSubtasks((prev) => [...prev, st])
      setNewSubtask('')
      logSubtaskActivity('subtask_added', `added subtask "${title}"`)
    } catch (err) {
      console.error('Failed to add subtask:', err)
    } finally {
      setAddingSubtask(false)
    }
  }

  const handleToggleSubtask = async (st) => {
    const updated = await updateSubtask(st.id, { completed: !st.completed })
    setSubtasks((prev) => prev.map((s) => (s.id === st.id ? updated : s)))
    logSubtaskActivity(
      updated.completed ? 'subtask_done' : 'subtask_reopened',
      `${updated.completed ? 'completed' : 'reopened'} subtask "${st.title}"`,
    )
  }

  const handleDeleteSubtask = async (st) => {
    await deleteSubtask(st.id)
    setSubtasks((prev) => prev.filter((s) => s.id !== st.id))
    logSubtaskActivity('subtask_deleted', `removed subtask "${st.title}"`)
  }

  const handleAddDependency = async (blockerTask) => {
    if (dependencies.some((d) => d.depends_on_task_id === blockerTask.id)) return
    await addTaskDependency(task.id, blockerTask.id, task.project_id)
    setDependencies((prev) => [...prev, { depends_on_task_id: blockerTask.id }])
    setDepSearch('')
    setShowDepPicker(false)
  }

  const handleRemoveDependency = async (dependsOnId) => {
    await removeTaskDependency(task.id, dependsOnId)
    setDependencies((prev) => prev.filter((d) => d.depends_on_task_id !== dependsOnId))
  }

  const handleLogTime = async (mins) => {
    const m = parseInt(mins)
    if (!m || m <= 0) return
    setLoggingTime(true)
    setTimeLogError('')
    try {
      const log = await createTimeLog({
        task_id: task.id,
        project_id: task.project_id,
        user_id: user?.id,
        user_email: user?.email || null,
        minutes: m,
        note: logDesc.trim() || null,
        billable: logBillable,
      })
      setTimeLogs((prev) => [log, ...prev])
      setLogMinutes('')
      setLogDesc('')
      setLogBillable(false)
    } catch (err) {
      setTimeLogError(err.message || 'Failed to log time')
    } finally {
      setLoggingTime(false)
    }
  }

  const handleDeleteTimeLog = async (id) => {
    await deleteTimeLog(id)
    setTimeLogs((prev) => prev.filter((l) => l.id !== id))
  }

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const limitMb = STORAGE_LIMITS_MB[isPro ? 'pro' : 'free']
      const usedMb = await getStorageUsedMb(user.id)
      if (usedMb + file.size / (1024 * 1024) > limitMb) {
        alert(`Storage limit reached (${limitMb >= 1024 ? `${limitMb / 1024} GB` : `${limitMb} MB`}). Upgrade your plan to upload more files.`)
        return
      }
      const att = await uploadTaskAttachment(task.id, user.id, file)
      setAttachments((prev) => [...prev, att])
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleToggleAttachmentVisibility = async (att) => {
    const next = !att.visible_to_client
    setAttachments(prev => prev.map(a => a.id === att.id ? { ...a, visible_to_client: next } : a))
    await toggleAttachmentVisibility(att.id, next)
  }

  const handleDeleteAttachment = async (att) => {
    await deleteTaskAttachment(att.id, att.file_path)
    setAttachments((prev) => prev.filter((a) => a.id !== att.id))
  }

  const handleDownloadAttachment = async (att) => {
    const url = await getAttachmentUrl(att.file_path)
    if (url) window.open(url, '_blank')
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
  const labelStyle = form.label ? getLabelStyle(form.label, projectLabels) : null

  const modal = (
    <>
    {showUpgradeModal && (
      <UpgradeModal
        reason="Time tracking with timer is a Pro feature."
        onClose={() => setShowUpgradeModal(false)}
        onUpgraded={() => { setShowUpgradeModal(false); window.location.reload() }}
      />
    )}
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg sm:max-w-3xl lg:max-w-4xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Task</p>
            {isOverdue && <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-medium">OVERDUE</span>}
            {totalLogged > 0 && (
              <span className="text-[9px] bg-white/[0.06] text-white/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Timer size={8} /> {fmtMins(totalLogged)}
              </span>
            )}
            {form.label && labelStyle && (
              <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium" style={{ background: labelStyle.bg, color: labelStyle.color, borderColor: labelStyle.border }}>
                {form.label}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X size={14} />
          </button>
        </div>

        {(task.created_by_email || task.created_at) && (
          <div className="px-5 pt-3 -mb-1 flex-shrink-0">
            <p className="text-[10px] text-white/25">
              Added by {task.created_by_email ? task.created_by_email.split('@')[0] : 'someone'}
              {task.created_at && ` · ${timeAgo(task.created_at)}`}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 sm:border-r sm:border-white/[0.08]">
          <div className="p-5 space-y-4">

            {/* Title */}
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Title</label>
              <input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                placeholder="Task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Notes</label>
              <textarea
                ref={notesRef}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors resize-none overflow-y-auto min-h-[4.5rem]"
                placeholder="Add notes or details..."
              />
            </div>

            {/* Label */}
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Label</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setForm({ ...form, label: '' })}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${
                    !form.label ? 'bg-white/10 text-white/60 border-white/20' : 'border-white/[0.08] text-white/25 hover:border-white/20'
                  }`}
                >
                  None
                </button>
                {projectLabels.map((lbl) => {
                  const active = form.label === lbl.name
                  return (
                    <div key={lbl.name} className="flex items-stretch rounded-lg overflow-hidden border" style={{ borderColor: active ? `${lbl.color}60` : 'rgba(255,255,255,0.1)' }}>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, label: active ? '' : lbl.name })}
                        className="text-[10px] px-2 py-1 font-medium transition-all"
                        style={active
                          ? { backgroundColor: `${lbl.color}22`, color: lbl.color }
                          : { backgroundColor: 'transparent', color: theme === 'light' ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.55)' }
                        }
                      >
                        {lbl.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLabel(lbl.name)}
                        className="text-[9px] px-1.5 border-l transition-all text-white/20 hover:text-red-400 hover:bg-red-500/10"
                        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                        title={`Remove ${lbl.name}`}
                      >×</button>
                    </div>
                  )
                })}
                {addingLabel ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      autoFocus
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddLabel(); if (e.key === 'Escape') setAddingLabel(false) }}
                      placeholder="Label name"
                      className="text-[10px] bg-white/[0.06] border border-white/20 rounded-lg px-2 py-1 text-white/80 w-24 outline-none"
                    />
                    <div className="flex gap-1">
                      {LABEL_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setNewLabelColor(c)}
                          className="w-3.5 h-3.5 rounded-full transition-transform hover:scale-125"
                          style={{ background: c, outline: newLabelColor === c ? `2px solid ${c}` : 'none', outlineOffset: '1px' }}
                        />
                      ))}
                    </div>
                    <button onClick={handleAddLabel} className="text-[10px] text-white/60 hover:text-white px-1.5 py-0.5 rounded border border-white/20 hover:border-white/40 transition-all">Add</button>
                    <button onClick={() => setAddingLabel(false)} className="text-[10px] text-white/30 hover:text-white/60">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingLabel(true)}
                    className="text-[10px] px-2 py-1 rounded-lg border border-dashed border-white/20 text-white/30 hover:text-white/60 hover:border-white/40 transition-all flex items-center gap-1"
                  >
                    <Plus size={9} /> Label
                  </button>
                )}
              </div>
            </div>

            {/* Priority + Due date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Priority</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-medium capitalize transition-all ${
                        form.priority === p ? PRIORITY_STYLES[p] : 'border-white/[0.08] text-white/30 hover:border-white/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 outline-none focus:border-white/20 transition-colors"
                />
                {form.due_date && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <button onClick={() => setForm({ ...form, due_date: '' })} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">
                      Clear date
                    </button>
                    <button
                      onClick={() => setForm({ ...form, reminder_enabled: !form.reminder_enabled })}
                      className={`flex items-center gap-1 text-[10px] transition-colors ${form.reminder_enabled ? 'text-blue-400' : 'text-white/30 hover:text-white/60'}`}
                    >
                      {form.reminder_enabled ? <Bell size={10} /> : <BellOff size={10} />}
                      {form.reminder_enabled ? 'Reminder on' : 'Remind me'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Recurrence</label>
              <select
                value={form.recurrence}
                onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 outline-none focus:border-white/20 transition-colors"
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {form.recurrence && (
                <p className="text-[10px] text-white/30 mt-1">When completed, a new {form.recurrence} copy will be created.</p>
              )}
            </div>

            {/* Assignee */}
            <div className="relative">
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Assignee</label>
              <button
                onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
                className="w-full flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-left transition-colors hover:border-white/20"
              >
                <User size={12} className="text-white/30 flex-shrink-0" />
                {form.assigned_to_emails.length === 0 ? (
                  <span className="text-white/30">Unassigned</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-white/70 min-w-0">
                    <span className="flex items-center">
                      {form.assigned_to_emails.slice(0, 4).map((email, i) => (
                        <span key={email} className={`w-5 h-5 rounded-full bg-white/10 border border-[#111] flex items-center justify-center text-[9px] ${i > 0 ? '-ml-1.5' : ''}`}>{email[0].toUpperCase()}</span>
                      ))}
                    </span>
                    <span className="truncate">{form.assigned_to_emails.length === 1 ? form.assigned_to_emails[0] : `${form.assigned_to_emails.length} assignees`}</span>
                  </span>
                )}
              </button>
              {showAssigneeMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden max-h-56 overflow-y-auto">
                  <button onClick={() => { setForm((f) => ({ ...f, assigned_to_emails: [] })); }} className="w-full text-left px-3 py-2 text-xs text-white/40 hover:bg-white/[0.05] transition-colors">Unassigned</button>
                  {[...(user?.email ? [{ id: 'me', email: user.email, isMe: true }] : []), ...members.filter((m) => m.email !== user?.email)].map((m) => {
                    const selected = form.assigned_to_emails.includes(m.email)
                    return (
                      <button key={m.id} onClick={() => toggleAssignee(m.email)} className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px]">{(m.email || '?')[0].toUpperCase()}</span>
                        <span className="truncate">{m.email}</span>
                        {m.isMe && <span className="text-white/30">me</span>}
                        {selected && <Check size={13} className="text-green-400 ml-auto flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* External Link */}
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">External Link</label>
              <div className="relative">
                <Link size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  value={form.task_link}
                  onChange={(e) => setForm({ ...form, task_link: e.target.value })}
                  placeholder="https://github.com/... or Figma, Notion link"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                />
              </div>
              {form.task_link && !isValidUrl(form.task_link) && (
                <p className="text-[10px] text-yellow-400/70 mt-1">Must start with https://</p>
              )}
              {form.task_link && isValidUrl(form.task_link) && (
                <a href={form.task_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-400/70 hover:text-blue-400 mt-1 transition-colors">
                  <ExternalLink size={9} /> Open link
                </a>
              )}
            </div>

            {/* Subtasks */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <CheckSquare size={12} className="text-white/30" />
                <label className="text-[10px] text-white/40 uppercase tracking-wider">
                  Subtasks {subtasks.length > 0 && `(${subtasksDone}/${subtasks.length})`}
                </label>
              </div>
              {subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-green-400/60 rounded-full transition-all duration-300" style={{ width: `${(subtasksDone / subtasks.length) * 100}%` }} />
                  </div>
                  <div className="space-y-1.5">
                    {subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2 group">
                        <button onClick={() => handleToggleSubtask(st)} className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors">
                          {st.completed ? <CheckSquare size={13} className="text-green-400" /> : <Square size={13} />}
                        </button>
                        <span className={`text-xs flex-1 leading-snug ${st.completed ? 'line-through text-white/30' : 'text-white/70'}`}>{st.title}</span>
                        <button onClick={() => handleDeleteSubtask(st)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"><Trash size={10} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask() } }}
                  placeholder="Add subtask..."
                  className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                />
                <button onClick={handleAddSubtask} disabled={addingSubtask || !newSubtask.trim()} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all disabled:opacity-30">
                  {addingSubtask ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                </button>
              </div>
            </div>

            {/* Dependencies */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <GitMerge size={12} className="text-white/30" />
                <label className="text-[10px] text-white/40 uppercase tracking-wider">
                  Blocked by {dependencies.length > 0 && `(${dependencies.length})`}
                </label>
              </div>
              {dependencies.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {dependencies.map((dep) => {
                    const blocker = projectTasks.find((t) => t.id === dep.depends_on_task_id)
                    if (!blocker) return null
                    const isDone = blocker.status === 'done'
                    return (
                      <div key={dep.depends_on_task_id} className="flex items-center gap-2 group">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDone ? 'bg-green-400' : 'bg-red-400/70'}`} />
                        <span className={`text-xs flex-1 leading-snug truncate ${isDone ? 'line-through text-white/30' : 'text-white/70'}`}>{blocker.title}</span>
                        <button onClick={() => handleRemoveDependency(dep.depends_on_task_id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all flex-shrink-0">
                          <X size={10} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="relative">
                <input
                  value={depSearch}
                  onChange={(e) => { setDepSearch(e.target.value); setShowDepPicker(true) }}
                  onFocus={() => setShowDepPicker(true)}
                  placeholder="Search tasks to block on..."
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                />
                {showDepPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-10 max-h-40 overflow-y-auto">
                    {projectTasks
                      .filter((t) => t.id !== task.id && !dependencies.some((d) => d.depends_on_task_id === t.id) && (!depSearch || t.title.toLowerCase().includes(depSearch.toLowerCase())))
                      .slice(0, 8)
                      .map((t) => (
                        <button key={t.id} onClick={() => handleAddDependency(t)} className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.status === 'done' ? 'bg-green-400' : 'bg-white/30'}`} />
                          <span className="truncate">{t.title}</span>
                          <span className="text-white/25 ml-auto flex-shrink-0">{t.status.replace('_', ' ')}</span>
                        </button>
                      ))}
                    {projectTasks.filter((t) => t.id !== task.id && !dependencies.some((d) => d.depends_on_task_id === t.id)).length === 0 && (
                      <p className="px-3 py-2 text-xs text-white/25">No other tasks</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Time Tracking */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-white/30" />
                  <label className="text-[10px] text-white/40 uppercase tracking-wider">
                    Time {totalLogged > 0 && `· ${fmtMins(totalLogged)} logged`}
                  </label>
                </div>
                <TaskTimer
                  task={task}
                  projectId={task.project_id}
                  user={user}
                  isPro={isPro}
                  onTimerStop={(saved) => {
                    if (saved) setTimeLogs((prev) => [saved, ...prev])
                  }}
                  onShowUpgrade={() => setShowUpgradeModal(true)}
                />
              </div>

              {/* Estimate + variance */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-1">
                  <label className="text-[10px] text-white/30 whitespace-nowrap">Estimate (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.estimated_minutes}
                    onChange={(e) => setForm({ ...form, estimated_minutes: e.target.value })}
                    placeholder="-"
                    className="w-20 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                  />
                  {form.estimated_minutes && parseInt(form.estimated_minutes) > 0 && (
                    <span className="text-[10px] text-white/25">=&nbsp;{fmtMins(parseInt(form.estimated_minutes))}</span>
                  )}
                </div>
                {form.estimated_minutes && totalLogged > 0 && (() => {
                  const est = parseInt(form.estimated_minutes)
                  const diff = totalLogged - est
                  const over = diff > 0
                  return (
                    <div className={`flex items-center gap-1 text-[10px] ${over ? 'text-red-400' : 'text-green-400'}`}>
                      {over ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {over ? '+' : ''}{fmtMins(Math.abs(diff))} {over ? 'over' : 'under'}
                    </div>
                  )
                })()}
              </div>

              <div className="flex gap-1.5 mb-2">
                {[15, 30, 60, 120].map((m) => (
                  <button type="button" key={m} onClick={() => handleLogTime(m)} disabled={loggingTime} className="text-[10px] px-2 py-1 rounded-lg border border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/70 transition-all disabled:opacity-40">
                    +{fmtMins(m)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-1">
                <input type="number" min="1" value={logMinutes} onChange={(e) => setLogMinutes(e.target.value)} placeholder="Minutes" className="w-20 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors" />
                <input value={logDesc} onChange={(e) => setLogDesc(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLogTime(logMinutes) } }} placeholder="Note (optional)" className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors" />
                <button
                  type="button"
                  onClick={() => setLogBillable((b) => !b)}
                  title={logBillable ? 'Billable - click to toggle' : 'Non-billable - click to toggle'}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all text-[9px] font-semibold flex-shrink-0 ${logBillable ? 'bg-green-500/15 border-green-500/25 text-green-400' : 'bg-white/[0.04] border-white/[0.08] text-white/25 hover:border-white/20'}`}
                >
                  $
                </button>
                <button type="button" onClick={() => handleLogTime(logMinutes)} disabled={loggingTime || !logMinutes} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all disabled:opacity-30">
                  {loggingTime ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                </button>
              </div>
              {timeLogError && (
                <p className="text-[10px] text-red-400 mb-2">{timeLogError}</p>
              )}
              {timeLogs.length > 0 && (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {timeLogs.slice(0, 5).map((l) => (
                    <div key={l.id} className="flex items-center gap-2 group">
                      <span className="text-[10px] text-white/50 font-medium w-10 flex-shrink-0">{fmtMins(l.minutes)}</span>
                      {l.billable && <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/15 px-1 py-0.5 rounded flex-shrink-0">B</span>}
                      <span className="text-[10px] text-white/30 flex-1 truncate">{l.note || timeAgo(l.created_at)}</span>
                      <button onClick={() => handleDeleteTimeLog(l.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"><Trash size={10} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client approval status */}
            {task.client_approval_status && (
              <div className={`border rounded-xl px-4 py-3 flex items-start gap-3 ${
                task.client_approval_status === 'approved'
                  ? 'border-green-500/20 bg-green-500/10'
                  : 'border-orange-500/20 bg-orange-500/10'
              }`}>
                {task.client_approval_status === 'approved'
                  ? <ThumbsUp size={13} className="text-green-400 flex-shrink-0 mt-0.5" />
                  : <ThumbsDown size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
                }
                <div>
                  <p className={`text-xs font-medium ${task.client_approval_status === 'approved' ? 'text-green-400' : 'text-orange-400'}`}>
                    {task.client_approval_status === 'approved' ? 'Approved by client' : 'Client requested revision'}
                  </p>
                  {task.client_approval_note && (
                    <p className="text-[10px] text-white/40 mt-0.5">"{task.client_approval_note}"</p>
                  )}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Paperclip size={12} className="text-white/30" />
                  <label className="text-[10px] text-white/40 uppercase tracking-wider">
                    Attachments {attachments.length > 0 && `(${attachments.length})`}
                  </label>
                </div>
                <label className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 cursor-pointer transition-colors border border-white/[0.08] hover:border-white/20 px-2 py-1 rounded-lg">
                  {uploading ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                  {uploading ? 'Uploading...' : 'Add file'}
                  <input type="file" className="hidden" onChange={handleUploadAttachment} disabled={uploading} />
                </label>
              </div>
              {attachments.length > 0 ? (
                <div className="space-y-1.5">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 group bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                      <FileText size={11} className="text-white/30 flex-shrink-0" />
                      <span className="text-[11px] text-white/60 flex-1 truncate">{att.file_name}</span>
                      {att.file_size && (
                        <span className="text-[10px] text-white/20 flex-shrink-0">
                          {att.file_size > 1024 * 1024
                            ? `${(att.file_size / 1024 / 1024).toFixed(1)} MB`
                            : `${Math.round(att.file_size / 1024)} KB`}
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleAttachmentVisibility(att)}
                        title={att.visible_to_client ? 'Client can see this file' : 'Hidden from client'}
                        className={`flex-shrink-0 transition-all ${att.visible_to_client ? 'text-green-400' : 'opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/50'}`}
                      >
                        {att.visible_to_client ? <Eye size={11} /> : <EyeOff size={11} />}
                      </button>
                      <button onClick={() => handleDownloadAttachment(att)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white transition-all flex-shrink-0">
                        <Download size={11} />
                      </button>
                      <button onClick={() => handleDeleteAttachment(att)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all flex-shrink-0">
                        <Trash size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-white/20 text-center py-2">No attachments yet. Add files, screenshots, or docs.</p>
              )}
            </div>
          </div>
          </div>

          {/* Comments and activity */}
          <div className="overflow-y-auto flex-1 sm:w-80 sm:flex-shrink-0 p-5 flex flex-col">
            <div className="flex items-center gap-1.5 mb-3">
              <MessageCircle size={12} className="text-white/30" />
              <label className="text-[10px] text-white/40 uppercase tracking-wider">Comments and activity</label>
            </div>
            {commentError && <p className="text-[10px] text-red-400 mb-2">{commentError}</p>}
            <div className="flex gap-2 mb-4">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
                placeholder="Add a comment..."
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
              />
              <button onClick={handleSendComment} disabled={sendingComment || !newComment.trim()} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all disabled:opacity-30">
                {sendingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
            {activityFeed.length > 0 && (
              <div className="space-y-3">
                {activityFeed.map((item) => item._kind === 'comment' ? (
                  <div key={item.id} className="flex gap-2.5 group">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] text-white/50">{(item.data.user_email || '?')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40">{item.data.user_email?.split('@')[0]}</span>
                        <span className="text-[10px] text-white/20">{timeAgo(item.data.created_at)}</span>
                        {item.data.user_id === user?.id && (
                          <button onClick={() => handleDeleteComment(item.data.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all ml-auto"><Trash size={10} /></button>
                        )}
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed mt-0.5">{item.data.content}</p>
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity size={9} className="text-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/50 leading-snug">
                        <span className="text-white/40">{item.data.user_email?.split('@')[0] || 'Someone'}</span>
                        {' '}{describeActivity(item.data)}
                      </p>
                      <p className="text-[10px] text-white/20 mt-0.5">{timeAgo(item.data.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.08] flex-shrink-0">
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-40">
            <Trash2 size={12} /> {deleting ? 'Deleting...' : 'Delete task'}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">Cancel</button>
            <button onClick={handleSave} disabled={!form.title.trim()} className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )

  return createPortal(modal, document.body)
}
