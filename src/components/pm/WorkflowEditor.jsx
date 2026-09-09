import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Trash2, ChevronUp, ChevronDown, Check, Loader2, Copy, Layers, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getWorkflows, createWorkflow, updateWorkflowName, deleteWorkflow, saveWorkflowStages,
} from '../../lib/pmService'
import { WORKFLOW_TEMPLATES, STAGE_COLORS, generateStatusKey } from '../../lib/pmConstants'
import WorkflowMigrationModal from './WorkflowMigrationModal'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

function ColorPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0 transition-transform hover:scale-110"
        style={{ backgroundColor: value }}
        title="Pick color"
      />
      {open && (
        <div className="absolute left-0 top-7 z-10 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 shadow-2xl grid grid-cols-5 gap-1.5">
          {STAGE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setOpen(false) }}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
              style={{ backgroundColor: c, borderColor: c === value ? '#fff' : 'transparent' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StageRow({ stage, index, total, onChange, onDelete, onMove }) {
  return (
    <div className="flex items-center gap-2 group">
      <ColorPicker value={stage.color} onChange={(c) => onChange({ ...stage, color: c })} />
      <input
        value={stage.name}
        onChange={(e) => onChange({ ...stage, name: e.target.value })}
        placeholder="Stage name"
        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/25 outline-none focus:border-white/20 transition-colors"
      />
      <button
        onClick={() => onChange({ ...stage, is_done: !stage.is_done })}
        title={stage.is_done ? 'Mark as in-progress' : 'Mark as completion stage'}
        className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all flex-shrink-0 ${
          stage.is_done
            ? 'bg-green-500/15 text-green-400 border-green-500/25'
            : 'border-white/[0.08] text-white/25 hover:text-white/50 hover:border-white/20'
        }`}
      >
        <Check size={9} />
        Done
      </button>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
          className="p-1 rounded text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors"
        >
          <ChevronUp size={12} />
        </button>
        <button
          disabled={index === total - 1}
          onClick={() => onMove(index, 1)}
          className="p-1 rounded text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors"
        >
          <ChevronDown size={12} />
        </button>
        <button
          onClick={onDelete}
          disabled={total <= 1}
          className="p-1 rounded text-white/25 hover:text-red-400 disabled:opacity-20 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

export default function WorkflowEditor({
  projectId,
  currentWorkflowId,
  projectTasks = [],
  onClose,
  onWorkflowAssigned,
}) {
  useLockBodyScroll()
  const { user } = useAuth()
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')          // 'list' | 'edit' | 'templates'
  const [editing, setEditing] = useState(null)       // { id?, name, stages[] }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [assigning, setAssigning] = useState(null)   // workflowId being assigned
  const [migration, setMigration] = useState(null)   // { workflow } to confirm migration

  useEffect(() => {
    if (!user) return
    getWorkflows(user.id).then((wfs) => { setWorkflows(wfs); setLoading(false) })
  }, [user])

  // ── Helpers ────────────────────────────────────────────────────────────────

  function newStage(name = '', color = STAGE_COLORS[0], existingKeys = []) {
    const status_key = generateStatusKey(name || 'stage', existingKeys)
    return { _tempId: Math.random().toString(36).slice(2), name, color, is_done: false, status_key }
  }

  function openBlankWorkflow() {
    setEditing({
      id: null,
      name: '',
      stages: [
        newStage('To Do', '#6b7280'),
        newStage('In Progress', '#3b82f6', ['to_do']),
        newStage('Done', '#22c55e', ['to_do', 'in_progress'], true),
      ].map((s, _, arr) => ({ ...s, status_key: generateStatusKey(s.name, arr.filter(x => x !== s).map(x => x.status_key)) })),
    })
    setView('edit')
  }

  function openEditWorkflow(wf) {
    setEditing({
      id: wf.id,
      name: wf.name,
      stages: wf.stages.map((s) => ({ ...s, _tempId: s.id })),
    })
    setView('edit')
  }

  function openTemplate(tpl) {
    const stages = tpl.stages.map((s, i, arr) => ({
      ...s,
      _tempId: Math.random().toString(36).slice(2),
      status_key: generateStatusKey(s.name, arr.slice(0, i).map((x) => generateStatusKey(x.name, []))),
    }))
    setEditing({ id: null, name: tpl.name, stages })
    setView('edit')
  }

  function handleStageChange(index, updated) {
    setEditing((prev) => {
      const stages = [...prev.stages]
      stages[index] = updated
      return { ...prev, stages }
    })
  }

  function handleStageMove(index, dir) {
    setEditing((prev) => {
      const stages = [...prev.stages]
      const target = index + dir
      if (target < 0 || target >= stages.length) return prev
      ;[stages[index], stages[target]] = [stages[target], stages[index]]
      return { ...prev, stages }
    })
  }

  function handleAddStage() {
    setEditing((prev) => {
      const existing = prev.stages.map((s) => s.status_key)
      return { ...prev, stages: [...prev.stages, newStage('', STAGE_COLORS[prev.stages.length % STAGE_COLORS.length], existing)] }
    })
  }

  function handleDeleteStage(index) {
    setEditing((prev) => ({ ...prev, stages: prev.stages.filter((_, i) => i !== index) }))
  }

  async function handleSave() {
    if (!editing.name.trim()) { setError('Workflow needs a name'); return }
    if (editing.stages.length < 1) { setError('Add at least one stage'); return }
    const emptyStage = editing.stages.find((s) => !s.name.trim())
    if (emptyStage) { setError('All stages need a name'); return }

    setSaving(true)
    setError('')
    try {
      const stagesToSave = editing.stages.map((s, i) => ({
        name: s.name.trim(),
        color: s.color,
        is_done: s.is_done,
        status_key: generateStatusKey(s.name.trim(), editing.stages.slice(0, i).map((x) => generateStatusKey(x.name.trim(), []))),
      }))

      let saved
      if (editing.id) {
        await updateWorkflowName(editing.id, editing.name.trim())
        await saveWorkflowStages(editing.id, stagesToSave)
        saved = { ...editing, stages: stagesToSave }
      } else {
        saved = await createWorkflow(user.id, editing.name.trim(), stagesToSave)
      }
      const updated = await import('../../lib/pmService').then((m) => m.getWorkflows(user.id))
      setWorkflows(updated)
      setView('list')
      setEditing(null)
    } catch (err) {
      setError(err.message || 'Failed to save workflow')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(wfId) {
    if (!window.confirm('Delete this workflow? Projects using it will revert to the default workflow.')) return
    await deleteWorkflow(wfId)
    setWorkflows((prev) => prev.filter((w) => w.id !== wfId))
  }

  async function handleClone(wf) {
    setSaving(true)
    try {
      const cloned = await createWorkflow(user.id, `${wf.name} (copy)`, wf.stages.map((s) => ({ ...s })))
      setWorkflows((prev) => [...prev, cloned])
    } finally {
      setSaving(false)
    }
  }

  function handleAssign(wf) {
    const currentStageKeys = new Set(projectTasks.map((t) => t.status))
    const newKeys = new Set(wf.stages.map((s) => s.status_key))
    const orphaned = [...currentStageKeys].filter((k) => !newKeys.has(k))

    if (orphaned.length > 0 && projectTasks.length > 0) {
      setMigration({ workflow: wf })
    } else {
      confirmAssign(wf.id)
    }
  }

  async function confirmAssign(workflowId) {
    setAssigning(workflowId)
    try {
      const { updateProject } = await import('../../lib/pmService')
      await updateProject(projectId, { workflow_id: workflowId })
      const wf = workflows.find((w) => w.id === workflowId)
      onWorkflowAssigned?.(wf)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to assign workflow')
    } finally {
      setAssigning(null)
    }
  }

  async function handleUseDefault() {
    const currentStageKeys = new Set(projectTasks.map((t) => t.status))
    const defaultKeys = new Set(['todo', 'in_progress', 'review', 'done'])
    const orphaned = [...currentStageKeys].filter((k) => !defaultKeys.has(k))

    if (orphaned.length > 0 && projectTasks.length > 0) {
      setMigration({ workflow: null }) // null = default
    } else {
      setAssigning('default')
      try {
        const { updateProject } = await import('../../lib/pmService')
        await updateProject(projectId, { workflow_id: null })
        onWorkflowAssigned?.(null)
        onClose()
      } finally {
        setAssigning(null)
      }
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-2">
            {view !== 'list' && (
              <button onClick={() => { setView('list'); setEditing(null); setError('') }} className="text-white/40 hover:text-white transition-colors mr-1">
                <ArrowLeft size={16} />
              </button>
            )}
            <Layers size={15} className="text-white/50" />
            <h3 className="font-display font-semibold text-white text-sm">
              {view === 'list' ? 'Workflows' : view === 'templates' ? 'Choose Template' : (editing?.id ? 'Edit Workflow' : 'New Workflow')}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">

          {/* ── LIST VIEW ─────────────────────────────────────────────── */}
          {view === 'list' && (
            <div className="p-5 space-y-3">
              {/* Default workflow card */}
              <div className={`rounded-xl border p-4 transition-all ${!currentWorkflowId ? 'border-white/20 bg-white/[0.04]' : 'border-white/[0.06]'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Default Workflow</p>
                    <p className="text-[10px] text-white/40 mt-0.5">To Do · In Progress · Review · Done</p>
                  </div>
                  {!currentWorkflowId ? (
                    <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">Active</span>
                  ) : (
                    <button
                      onClick={handleUseDefault}
                      disabled={!!assigning}
                      className="text-[10px] text-white/50 hover:text-white border border-white/[0.08] hover:border-white/20 px-2.5 py-1 rounded-lg transition-all"
                    >
                      {assigning === 'default' ? <Loader2 size={10} className="animate-spin" /> : 'Use'}
                    </button>
                  )}
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={16} className="animate-spin text-white/30" />
                </div>
              )}

              {!loading && workflows.map((wf) => (
                <div
                  key={wf.id}
                  className={`rounded-xl border p-4 transition-all ${currentWorkflowId === wf.id ? 'border-white/20 bg-white/[0.04]' : 'border-white/[0.06] hover:border-white/10'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold text-white">{wf.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {wf.stages.slice(0, 5).map((s) => (
                          <span key={s.id} className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} title={s.name} />
                        ))}
                        <span className="text-[10px] text-white/30 ml-1">{wf.stages.length} stages</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {currentWorkflowId === wf.id ? (
                        <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">Active</span>
                      ) : (
                        <button
                          onClick={() => handleAssign(wf)}
                          disabled={!!assigning}
                          className="text-[10px] text-white/50 hover:text-white border border-white/[0.08] hover:border-white/20 px-2.5 py-1 rounded-lg transition-all"
                        >
                          {assigning === wf.id ? <Loader2 size={10} className="animate-spin" /> : 'Use'}
                        </button>
                      )}
                      <button onClick={() => openEditWorkflow(wf)} className="text-[10px] text-white/30 hover:text-white/70 border border-white/[0.06] hover:border-white/20 px-2.5 py-1 rounded-lg transition-all">Edit</button>
                      <button onClick={() => handleClone(wf)} disabled={saving} className="text-[10px] text-white/25 hover:text-white/60 transition-colors p-1" title="Clone"><Copy size={11} /></button>
                      <button onClick={() => handleDelete(wf.id)} className="text-[10px] text-white/25 hover:text-red-400 transition-colors p-1" title="Delete"><Trash2 size={11} /></button>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {wf.stages.map((s) => (
                      <span key={s.id} className="text-[9px] text-white/40 border border-white/[0.06] px-1.5 py-0.5 rounded-full">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={openBlankWorkflow}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 py-2.5 rounded-xl transition-all"
                >
                  <Plus size={12} /> New workflow
                </button>
                <button
                  onClick={() => setView('templates')}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 py-2.5 rounded-xl transition-all"
                >
                  <Layers size={12} /> From template
                </button>
              </div>
            </div>
          )}

          {/* ── TEMPLATES VIEW ────────────────────────────────────────── */}
          {view === 'templates' && (
            <div className="p-5 space-y-2">
              {WORKFLOW_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  onClick={() => openTemplate(tpl)}
                  className="w-full text-left rounded-xl border border-white/[0.06] hover:border-white/20 p-4 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{tpl.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-white/90">{tpl.name}</p>
                      <p className="text-[10px] text-white/40">{tpl.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tpl.stages.map((s) => (
                      <div key={s.name} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-[9px] text-white/30">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── EDIT VIEW ─────────────────────────────────────────────── */}
          {view === 'edit' && editing && (
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Workflow Name</label>
                <input
                  autoFocus
                  value={editing.name}
                  onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Software Development"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider">Stages</label>
                  <span className="text-[10px] text-white/25">Tip: mark one stage as "Done" for completion tracking</span>
                </div>
                <div className="space-y-2">
                  {editing.stages.map((stage, i) => (
                    <StageRow
                      key={stage._tempId || stage.id || i}
                      stage={stage}
                      index={i}
                      total={editing.stages.length}
                      onChange={(updated) => handleStageChange(i, updated)}
                      onDelete={() => handleDeleteStage(i)}
                      onMove={(idx, dir) => handleStageMove(idx, dir)}
                    />
                  ))}
                </div>
                <button
                  onClick={handleAddStage}
                  className="mt-2 flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors py-1"
                >
                  <Plus size={12} /> Add stage
                </button>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        {view === 'edit' && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.08] flex-shrink-0">
            <button onClick={() => { setView('list'); setEditing(null); setError('') }} className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {saving ? 'Saving…' : 'Save workflow'}
            </button>
          </div>
        )}
      </div>

      {migration && (
        <WorkflowMigrationModal
          projectId={projectId}
          projectTasks={projectTasks}
          targetWorkflow={migration.workflow}
          onDone={(workflowId) => {
            setMigration(null)
            if (workflowId !== undefined) {
              setAssigning(workflowId)
              import('../../lib/pmService').then(({ updateProject }) =>
                updateProject(projectId, { workflow_id: workflowId || null })
              ).then(() => {
                const wf = workflowId ? workflows.find((w) => w.id === workflowId) : null
                onWorkflowAssigned?.(wf)
                onClose()
              }).finally(() => setAssigning(null))
            }
          }}
          onClose={() => setMigration(null)}
        />
      )}
    </div>
  )

  return createPortal(modal, document.body)
}
