import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Link, ExternalLink, Layers, Plus, Check } from 'lucide-react'
import { getProjectMembers, getProjectLabels, saveProjectLabels } from '../../lib/pmService'
import { DEFAULT_LABELS, LABEL_COLORS, getLabelStyle, DEFAULT_WORKFLOW_STAGES } from '../../lib/pmConstants'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { useTheme } from '../../contexts/ThemeContext'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']

const TASK_TEMPLATES = [
  { label: 'Bug Fix', fields: { title: 'Fix: ', priority: 'high', label: 'bug' } },
  { label: 'Design Review', fields: { title: 'Design review: ', priority: 'medium', label: 'design' } },
  { label: 'Code Review', fields: { title: 'Code review: ', priority: 'medium', label: 'dev' } },
  { label: 'Meeting', fields: { title: 'Meeting: ', priority: 'low', label: 'meeting' } },
  { label: 'Research', fields: { title: 'Research: ', priority: 'low', label: 'research' } },
  { label: 'Deploy', fields: { title: 'Deploy to production', priority: 'urgent', label: 'dev' } },
]

function isValidUrl(str) {
  try { return Boolean(new URL(str)) } catch { return false }
}

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:    'bg-white/10 text-white/40 border-white/10',
}

export default function TaskCreateModal({ projectId, initialStatus, initialStatusName, stages, user, onSubmit, onClose }) {
  useLockBodyScroll()
  const { theme } = useTheme()
  const activeStages = stages && stages.length > 0 ? stages : DEFAULT_WORKFLOW_STAGES

  // Resolve the display name for initialStatus
  const stageName = initialStatusName
    || activeStages.find((s) => s.status_key === initialStatus)?.name
    || initialStatus || 'To Do'

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to_emails: [],
    label: '',
    task_link: '',
    recurrence: '',
  })
  const [members, setMembers] = useState([])
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false)
  const [projectLabels, setProjectLabels] = useState([])
  const [addingLabel, setAddingLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])

  const toggleAssignee = (email) => setForm((f) => ({
    ...f,
    assigned_to_emails: f.assigned_to_emails.includes(email)
      ? f.assigned_to_emails.filter((e) => e !== email)
      : [...f.assigned_to_emails, email],
  }))

  useEffect(() => {
    if (projectId) {
      getProjectMembers(projectId).then(setMembers)
      getProjectLabels(projectId).then((lbls) => setProjectLabels(lbls.length > 0 ? lbls : DEFAULT_LABELS))
    }
  }, [projectId])

  const handleAddLabel = async () => {
    const name = newLabelName.trim()
    if (!name) return
    if (projectLabels.some((l) => l.name === name)) { setAddingLabel(false); setNewLabelName(''); return }
    const updated = [...projectLabels, { name, color: newLabelColor }]
    setProjectLabels(updated)
    setNewLabelName('')
    setNewLabelColor(LABEL_COLORS[updated.length % LABEL_COLORS.length])
    setAddingLabel(false)
    await saveProjectLabels(projectId, updated)
  }

  const handleDeleteLabel = async (labelName) => {
    const updated = projectLabels.filter((l) => l.name !== labelName)
    setProjectLabels(updated)
    setForm((prev) => prev.label === labelName ? { ...prev, label: '' } : prev)
    await saveProjectLabels(projectId, updated)
  }

  const handleCreate = () => {
    if (!form.title.trim()) return
    onSubmit({
      status: initialStatus,
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      due_date: form.due_date || null,
      assigned_to_emails: form.assigned_to_emails,
      label: form.label || null,
      task_link: form.task_link.trim() || null,
      recurrence: form.recurrence || null,
    })
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">New Task</p>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded border border-white/[0.08] text-white/50"
              style={{ backgroundColor: `${activeStages.find((s) => s.status_key === initialStatus)?.color || '#6b7280'}20` }}
            >
              {stageName}
            </span>
          </div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-5 space-y-4">

            {/* Templates */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Layers size={10} className="text-white/30" />
                <label className="text-[10px] text-white/30 uppercase tracking-wider">Templates</label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TASK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, ...tpl.fields }))}
                    className="text-[10px] px-2 py-1 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Title</label>
              <input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onClose() }}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                placeholder="Task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Notes</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors resize-none"
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
                  <button onClick={() => setForm({ ...form, due_date: '' })} className="text-[10px] text-white/30 hover:text-white/60 mt-1 transition-colors">
                    Clear date
                  </button>
                )}
              </div>
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
                  <button onClick={() => setForm((f) => ({ ...f, assigned_to_emails: [] }))} className="w-full text-left px-3 py-2 text-xs text-white/40 hover:bg-white/[0.05] transition-colors">Unassigned</button>
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
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.08] flex-shrink-0">
          <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!form.title.trim()}
            className="text-xs bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
