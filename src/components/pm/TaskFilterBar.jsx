import { useEffect, useRef, useState } from 'react'
import {
  SlidersHorizontal, ChevronDown, X, Check, User, AlertCircle, CalendarClock,
  Flame, Clock, CheckCircle, UserX, GitMerge, ArrowUpDown, Bookmark, Plus, Star, Trash2, Pencil, Sparkles,
} from 'lucide-react'
import {
  getFilterPresets, createFilterPreset, updateFilterPreset, deleteFilterPreset,
} from '../../lib/pmService'

export const DEFAULT_FILTERS = {
  priorities: [],          // 'none' | 'low' | 'medium' | 'high' | 'urgent'
  assignedToMe: false,
  createdByMe: false,
  createdByMembers: [],    // emails
  overdue: false,
  dueToday: false,
  recentlyUpdated: false,
  completed: false,
  unassigned: false,
  blocked: false,
  smartView: '',           // '' | 'myWork' | 'dueSoon' | 'needsAttention' | 'recentlyUpdated' | 'completedThisWeek'
  sortField: '',           // '' | 'due_date' | 'priority' | 'created_at' | 'updated_at' | 'title' | 'assigned_to_email'
  sortDir: 'asc',
}

const SMART_VIEWS = [
  { key: 'myWork',            label: 'My Work',             hint: 'Assigned to me, not completed' },
  { key: 'dueSoon',           label: 'Due Soon',            hint: 'Due within 7 days, not completed' },
  { key: 'needsAttention',    label: 'Needs Attention',     hint: 'Overdue, unassigned, or blocked' },
  { key: 'recentlyUpdated',   label: 'Recently Updated',    hint: 'Updated within the last 48 hours' },
  { key: 'completedThisWeek', label: 'Completed This Week', hint: 'Completed during the current week' },
]

const PRIORITY_OPTIONS = [
  { key: 'none',   label: 'No Priority', color: 'transparent', ring: true },
  { key: 'low',    label: 'Low',    color: '#6b7280' },
  { key: 'medium', label: 'Medium', color: '#3b82f6' },
  { key: 'high',   label: 'High',   color: '#f97316' },
  { key: 'urgent', label: 'Urgent', color: '#ef4444' },
]

const SORT_FIELDS = [
  { key: 'due_date',           label: 'Due Date' },
  { key: 'priority',           label: 'Priority' },
  { key: 'created_at',         label: 'Created Date' },
  { key: 'updated_at',         label: 'Last Updated' },
  { key: 'title',              label: 'Card Name' },
  { key: 'assigned_to_email',  label: 'Assignee' },
]

const QUICK_CHIPS = [
  { key: 'assignedToMe',    label: 'My Tasks',         icon: User },
  { key: 'overdue',         label: 'Overdue',          icon: AlertCircle },
  { key: 'dueToday',        label: 'Due Today',        icon: CalendarClock },
  { key: 'priorityHigh',    label: 'High Priority',    icon: Flame },
  { key: 'priorityUrgent',  label: 'Urgent',           icon: Flame },
  { key: 'recentlyUpdated', label: 'Recently Updated', icon: Clock },
  { key: 'completed',       label: 'Completed',        icon: CheckCircle },
  { key: 'unassigned',      label: 'Unassigned',       icon: UserX },
]

function isChipActive(key, filters) {
  if (key === 'priorityHigh') return filters.priorities.includes('high')
  if (key === 'priorityUrgent') return filters.priorities.includes('urgent')
  return !!filters[key]
}

function toggleChip(key, filters, onChange) {
  if (key === 'priorityHigh') {
    const has = filters.priorities.includes('high')
    onChange({ priorities: has ? filters.priorities.filter((p) => p !== 'high') : [...filters.priorities, 'high'] })
    return
  }
  if (key === 'priorityUrgent') {
    const has = filters.priorities.includes('urgent')
    onChange({ priorities: has ? filters.priorities.filter((p) => p !== 'urgent') : [...filters.priorities, 'urgent'] })
    return
  }
  onChange({ [key]: !filters[key] })
}

function priorityLabel(key) {
  return PRIORITY_OPTIONS.find((p) => p.key === key)?.label || key
}

export function countActiveFilters(filters) {
  let n = 0
  n += filters.priorities.length
  if (filters.assignedToMe) n++
  if (filters.createdByMe) n++
  n += filters.createdByMembers.length
  if (filters.overdue) n++
  if (filters.dueToday) n++
  if (filters.recentlyUpdated) n++
  if (filters.completed) n++
  if (filters.unassigned) n++
  if (filters.blocked) n++
  if (filters.smartView) n++
  return n
}

export default function TaskFilterBar({ filters, onChange, creators, user, projectId }) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [presetsOpen, setPresetsOpen] = useState(false)
  const [presets, setPresets] = useState([])
  const [savingName, setSavingName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)
  const panelRef = useRef(null)
  const presetsRef = useRef(null)

  useEffect(() => {
    if (user && projectId) getFilterPresets(user.id, projectId).then(setPresets)
  }, [user, projectId])

  useEffect(() => {
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setPanelOpen(false)
      if (presetsRef.current && !presetsRef.current.contains(e.target)) { setPresetsOpen(false); setShowSaveInput(false) }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const activeCount = countActiveFilters(filters)

  const togglePriority = (key) => {
    const has = filters.priorities.includes(key)
    onChange({ priorities: has ? filters.priorities.filter((p) => p !== key) : [...filters.priorities, key] })
  }

  const toggleCreator = (email) => {
    const has = filters.createdByMembers.includes(email)
    onChange({ createdByMembers: has ? filters.createdByMembers.filter((e) => e !== email) : [...filters.createdByMembers, email] })
  }

  const clearAll = () => onChange({ ...DEFAULT_FILTERS, sortField: filters.sortField, sortDir: filters.sortDir })

  const handleSavePreset = async () => {
    if (!savingName.trim() || !user) return
    const saved = await createFilterPreset({ user_id: user.id, project_id: projectId, name: savingName.trim(), filters })
    setPresets((prev) => [...prev, saved])
    setSavingName('')
    setShowSaveInput(false)
  }

  const applyPreset = (preset) => {
    onChange({ ...DEFAULT_FILTERS, ...preset.filters })
    setPresetsOpen(false)
  }

  const handleRenamePreset = async (preset) => {
    const name = window.prompt('Rename preset', preset.name)
    if (!name || !name.trim() || name.trim() === preset.name) return
    const updated = await updateFilterPreset(preset.id, { name: name.trim() })
    setPresets((prev) => prev.map((p) => p.id === preset.id ? updated : p))
  }

  const handleDeletePreset = async (preset) => {
    if (!window.confirm(`Delete preset "${preset.name}"?`)) return
    await deleteFilterPreset(preset.id)
    setPresets((prev) => prev.filter((p) => p.id !== preset.id))
  }

  const handleSetDefault = async (preset) => {
    const next = !preset.is_default
    await Promise.all(presets.filter((p) => p.is_default && p.id !== preset.id).map((p) => updateFilterPreset(p.id, { is_default: false })))
    const updated = await updateFilterPreset(preset.id, { is_default: next })
    setPresets((prev) => prev.map((p) => p.id === preset.id ? updated : { ...p, is_default: p.id === preset.id ? p.is_default : false }))
  }

  // Build removable summary pills
  const pills = []
  if (filters.assignedToMe) pills.push({ key: 'assignedToMe', label: 'Assigned: Me', clear: () => onChange({ assignedToMe: false }) })
  filters.priorities.forEach((p) => pills.push({ key: `p-${p}`, label: `Priority: ${priorityLabel(p)}`, clear: () => togglePriority(p) }))
  if (filters.createdByMe) pills.push({ key: 'createdByMe', label: 'Created by: Me', clear: () => onChange({ createdByMe: false }) })
  filters.createdByMembers.forEach((email) => pills.push({ key: `c-${email}`, label: `Created by: ${email.split('@')[0]}`, clear: () => toggleCreator(email) }))
  if (filters.overdue) pills.push({ key: 'overdue', label: 'Due: Overdue', clear: () => onChange({ overdue: false }) })
  if (filters.dueToday) pills.push({ key: 'dueToday', label: 'Due: Today', clear: () => onChange({ dueToday: false }) })
  if (filters.recentlyUpdated) pills.push({ key: 'recentlyUpdated', label: 'Recently Updated', clear: () => onChange({ recentlyUpdated: false }) })
  if (filters.completed) pills.push({ key: 'completed', label: 'Completed', clear: () => onChange({ completed: false }) })
  if (filters.unassigned) pills.push({ key: 'unassigned', label: 'Unassigned', clear: () => onChange({ unassigned: false }) })
  if (filters.blocked) pills.push({ key: 'blocked', label: 'Blocked', clear: () => onChange({ blocked: false }) })
  if (filters.smartView) {
    const view = SMART_VIEWS.find((v) => v.key === filters.smartView)
    if (view) pills.push({ key: 'smartView', label: `View: ${view.label}`, clear: () => onChange({ smartView: '' }) })
  }

  return (
    <div className="mb-3">
      {/* Filters + Sort + Presets */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {/* Filters panel */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
              activeCount > 0 ? 'bg-white/10 text-white/70 border-white/20' : 'border-white/[0.08] text-white/30 hover:border-white/20'
            }`}
          >
            <SlidersHorizontal size={10} />
            Filters {activeCount > 0 && `(${activeCount})`}
            <ChevronDown size={10} />
          </button>
          {panelOpen && (
            <div className="fixed inset-0 z-20 bg-black/40" onClick={() => setPanelOpen(false)} />
          )}
          {panelOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-80 max-h-[80vh] overflow-y-auto bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-30 p-3 space-y-4">
              {/* Smart Views */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={10} className="text-white/30" />
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Smart Views</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SMART_VIEWS.map((view) => {
                    const active = filters.smartView === view.key
                    return (
                      <button
                        key={view.key}
                        onClick={() => onChange({ smartView: active ? '' : view.key })}
                        title={view.hint}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${
                          active ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'border-white/[0.08] text-white/30 hover:border-white/20'
                        }`}
                      >
                        {view.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick chips */}
              <div className="border-t border-white/[0.06] pt-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Quick Filters</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CHIPS.map(({ key, label, icon: Icon }) => {
                    const active = isChipActive(key, filters)
                    return (
                      <button
                        key={key}
                        onClick={() => toggleChip(key, filters, onChange)}
                        className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${
                          active ? 'bg-white/10 text-white/70 border-white/20' : 'border-white/[0.08] text-white/30 hover:border-white/20'
                        }`}
                      >
                        <Icon size={10} />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Priority */}
              <div className="border-t border-white/[0.06] pt-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Priority</p>
                <div className="space-y-1">
                  {PRIORITY_OPTIONS.map((p) => {
                    const active = filters.priorities.includes(p.key)
                    return (
                      <button
                        key={p.key}
                        onClick={() => togglePriority(p.key)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors text-left"
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border flex-shrink-0 ${active ? 'bg-white border-white' : 'border-white/25'}`}>
                          {active && <Check size={9} className="text-black" />}
                        </div>
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p.color, border: p.ring ? '1px solid rgba(255,255,255,0.3)' : 'none' }}
                        />
                        <span className="text-xs text-white/70">{p.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Created By */}
              <div className="border-t border-white/[0.06] pt-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Created By</p>
                <button
                  onClick={() => onChange({ createdByMe: !filters.createdByMe })}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors text-left"
                >
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border flex-shrink-0 ${filters.createdByMe ? 'bg-white border-white' : 'border-white/25'}`}>
                    {filters.createdByMe && <Check size={9} className="text-black" />}
                  </div>
                  <span className="text-xs text-white/70">Created by me</span>
                </button>
                {creators.length > 0 && (
                  <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                    {creators.map((email) => {
                      const active = filters.createdByMembers.includes(email)
                      return (
                        <button
                          key={email}
                          onClick={() => toggleCreator(email)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors text-left"
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border flex-shrink-0 ${active ? 'bg-white border-white' : 'border-white/25'}`}>
                            {active && <Check size={9} className="text-black" />}
                          </div>
                          <span className="text-xs text-white/70 truncate">{email}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Blocked */}
              <div className="border-t border-white/[0.06] pt-3">
                <button
                  onClick={() => onChange({ blocked: !filters.blocked })}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors text-left"
                >
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border flex-shrink-0 ${filters.blocked ? 'bg-white border-white' : 'border-white/25'}`}>
                    {filters.blocked && <Check size={9} className="text-black" />}
                  </div>
                  <GitMerge size={11} className="text-white/40" />
                  <span className="text-xs text-white/70">Blocked tasks</span>
                </button>
              </div>

              {activeCount > 0 && (
                <button onClick={clearAll} className="w-full text-[10px] text-white/40 hover:text-white/70 border-t border-white/[0.06] pt-3 transition-colors">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={filters.sortField}
            onChange={(e) => onChange({ sortField: e.target.value })}
            className="text-[10px] px-2 py-1 rounded-lg border border-white/[0.08] bg-transparent text-white/50 outline-none hover:border-white/20 transition-all appearance-none pr-5"
          >
            <option value="" className="bg-[#1a1a1a]">Sort: Default</option>
            {SORT_FIELDS.map((f) => (
              <option key={f.key} value={f.key} className="bg-[#1a1a1a]">Sort: {f.label}</option>
            ))}
          </select>
        </div>
        {filters.sortField && (
          <button
            onClick={() => onChange({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border border-white/[0.08] text-white/40 hover:border-white/20 transition-all"
            title={filters.sortDir === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpDown size={10} />
            {filters.sortDir === 'asc' ? 'Asc' : 'Desc'}
          </button>
        )}

        {/* Presets */}
        <div className="relative" ref={presetsRef}>
          <button
            onClick={() => setPresetsOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border border-white/[0.08] text-white/30 hover:border-white/20 transition-all"
          >
            <Bookmark size={10} />
            Presets
            <ChevronDown size={10} />
          </button>
          {presetsOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-30 p-2">
              {presets.length === 0 && !showSaveInput && (
                <p className="text-[10px] text-white/25 text-center py-3">No saved presets yet</p>
              )}
              {presets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1 group px-2 py-1.5 rounded-lg hover:bg-white/[0.05]">
                  <button
                    onClick={() => handleSetDefault(preset)}
                    className={`flex-shrink-0 ${preset.is_default ? 'text-yellow-400' : 'text-white/15 hover:text-white/40'}`}
                    title={preset.is_default ? 'Default preset' : 'Set as default'}
                  >
                    <Star size={10} fill={preset.is_default ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => applyPreset(preset)} className="flex-1 text-left min-w-0 text-xs text-white/70 truncate">
                    {preset.name}
                  </button>
                  <button onClick={() => handleRenamePreset(preset)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/60 transition-all flex-shrink-0"><Pencil size={10} /></button>
                  <button onClick={() => handleDeletePreset(preset)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all flex-shrink-0"><Trash2 size={10} /></button>
                </div>
              ))}
              <div className="border-t border-white/[0.06] mt-1 pt-1">
                {showSaveInput ? (
                  <div className="flex gap-1.5 p-1">
                    <input
                      autoFocus
                      value={savingName}
                      onChange={(e) => setSavingName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSavePreset(); if (e.key === 'Escape') setShowSaveInput(false) }}
                      placeholder="Preset name"
                      className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white placeholder-white/20 outline-none focus:border-white/20"
                    />
                    <button onClick={handleSavePreset} className="text-[10px] px-2 py-1 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all">Save</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    disabled={activeCount === 0}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-white/40 hover:text-white/70 disabled:opacity-30 transition-colors"
                  >
                    <Plus size={10} /> Save current filters as preset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active filter summary bar */}
      {pills.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {pills.map((pill) => (
            <button
              key={pill.key}
              onClick={pill.clear}
              className="flex items-center gap-1 text-[10px] pl-2 pr-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
            >
              {pill.label}
              <X size={9} />
            </button>
          ))}
          <button onClick={clearAll} className="text-[10px] text-white/25 hover:text-white/50 transition-colors">Clear all</button>
        </div>
      )}
    </div>
  )
}
