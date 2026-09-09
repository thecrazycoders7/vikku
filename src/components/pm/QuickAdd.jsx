import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Zap, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { getProjects, createTask } from '../../lib/pmService'
import { DEFAULT_LABELS, getLabelStyle } from '../../lib/pmConstants'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:    'bg-white/10 text-white/40 border-white/10',
}

export default function QuickAdd() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  useLockBodyScroll(open)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('todo')
  const [priority, setPriority] = useState('medium')
  const [label, setLabel] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open && user && projects.length === 0) {
      getProjects(user.id).then(setProjects)
    }
  }, [open, user])

  const handleSubmit = async () => {
    if (!title.trim() || !selectedProject) return
    setSaving(true)
    try {
      await createTask({
        project_id: selectedProject,
        title: title.trim(),
        status,
        priority,
        label: label || null,
        due_date: dueDate || null,
        created_by_email: user?.email || null,
      })
      setSaved(true)
      setTimeout(() => {
        setTitle('')
        setLabel('')
        setDueDate('')
        setPriority('medium')
        setSaved(false)
        setSaving(false)
        setOpen(false)
      }, 800)
    } catch {
      setSaving(false)
    }
  }

  if (!user || !open) return null

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-white/40" />
            <span className="text-xs font-semibold text-white/60">Quick Add Task</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/20 border border-white/[0.08] px-1.5 py-0.5 rounded">
              {navigator.platform?.includes('Mac') ? '⌘K' : 'Ctrl+K'} to toggle
            </span>
            <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/20 transition-colors appearance-none"
          >
            <option value="">Select project...</option>
            {projects.filter((p) => p.status !== 'archived').map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            placeholder="Task title..."
            maxLength={300}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
          />

          {/* Status */}
          <div className="flex gap-2">
            {['todo', 'in_progress', 'review'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex-1 text-[10px] py-1.5 rounded-lg border font-medium transition-all ${
                  status === s ? 'bg-white/10 border-white/20 text-white/80' : 'border-white/[0.08] text-white/30 hover:border-white/20'
                }`}
              >
                {s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Review'}
              </button>
            ))}
          </div>

          {/* Priority */}
          <div className="flex gap-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 text-[10px] py-1 rounded-lg border font-medium capitalize transition-all ${
                  priority === p ? PRIORITY_STYLES[p] : 'border-white/[0.08] text-white/30 hover:border-white/20'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Label */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setLabel('')}
              className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${!label ? 'bg-white/10 text-white/60 border-white/20' : 'border-white/[0.08] text-white/25 hover:border-white/20'}`}
            >
              No label
            </button>
            {DEFAULT_LABELS.map((lbl) => {
              const active = label === lbl.name
              const s = getLabelStyle(lbl.name, DEFAULT_LABELS)
              return (
                <button
                  key={lbl.name}
                  onClick={() => setLabel(active ? '' : lbl.name)}
                  className="text-[10px] px-2 py-1 rounded-lg border font-medium transition-all"
                  style={active && s
                    ? { background: s.bg, color: s.color, borderColor: s.border }
                    : { borderColor: 'rgba(255,255,255,0.08)', color: theme === 'light' ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.3)' }
                  }
                >
                  {lbl.name}
                </button>
              )
            })}
          </div>

          {/* Due date */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 outline-none focus:border-white/20 transition-colors"
          />

          <button
            onClick={handleSubmit}
            disabled={saving || !title.trim() || !selectedProject}
            className="w-full py-2.5 rounded-xl font-semibold text-sm bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saved ? '✓ Added!' : saving ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
