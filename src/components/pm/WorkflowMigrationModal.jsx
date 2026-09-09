import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, AlertCircle, Loader2, X } from 'lucide-react'
import { DEFAULT_WORKFLOW_STAGES } from '../../lib/pmConstants'
import { migrateTaskStatuses } from '../../lib/pmService'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

export default function WorkflowMigrationModal({ projectId, projectTasks, targetWorkflow, onDone, onClose }) {
  useLockBodyScroll()
  const targetStages = targetWorkflow ? targetWorkflow.stages : DEFAULT_WORKFLOW_STAGES

  // Find all current status_keys that exist in tasks but not in target workflow
  const currentKeys = [...new Set(projectTasks.map((t) => t.status))]
  const targetKeys = new Set(targetStages.map((s) => s.status_key))
  const orphanKeys = currentKeys.filter((k) => !targetKeys.has(k))

  // Build initial mapping: try to auto-match by name similarity, else pick first target
  const autoMap = (key) => {
    const lower = key.toLowerCase().replace(/_/g, ' ')
    const match = targetStages.find((s) => s.name.toLowerCase() === lower || s.status_key === key)
    return match?.status_key || targetStages[0]?.status_key || ''
  }

  const [mapping, setMapping] = useState(() =>
    Object.fromEntries(orphanKeys.map((k) => [k, autoMap(k)]))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const orphanTaskCount = (key) => projectTasks.filter((t) => t.status === key).length

  async function handleConfirm() {
    const invalid = orphanKeys.find((k) => !mapping[k])
    if (invalid) { setError('Map all stages before continuing'); return }

    setSaving(true)
    setError('')
    try {
      await migrateTaskStatuses(projectId, mapping)
      onDone(targetWorkflow?.id ?? null)
    } catch (err) {
      setError(err.message || 'Migration failed')
      setSaving(false)
    }
  }

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-yellow-400" />
            <h3 className="font-semibold text-white text-sm">Map existing stages</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-white/50 leading-relaxed">
            Some task stages don't exist in <strong className="text-white/80">{targetWorkflow?.name || 'Default Workflow'}</strong>.
            Choose where to move them before switching.
          </p>

          <div className="space-y-3">
            {orphanKeys.map((key) => {
              const count = orphanTaskCount(key)
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">
                      {key.replace(/_/g, ' ')}
                      <span className="text-white/30 ml-1.5">({count} task{count !== 1 ? 's' : ''})</span>
                    </p>
                  </div>
                  <ArrowRight size={12} className="text-white/25 flex-shrink-0" />
                  <select
                    value={mapping[key] || ''}
                    onChange={(e) => setMapping((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-white/20 transition-colors appearance-none"
                  >
                    <option value="">- pick stage -</option>
                    {targetStages.map((s) => (
                      <option key={s.status_key} value={s.status_key}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.08]">
          <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : null}
            {saving ? 'Migrating…' : 'Migrate & switch'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
