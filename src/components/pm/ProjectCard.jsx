import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Clock, Copy, Loader2 } from 'lucide-react'
import { duplicateProject } from '../../lib/pmService'

const STATUS = {
  active:    { label: 'Active',    cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' },
  completed: { label: 'Completed', cls: 'bg-sky-50 text-sky-700 ring-sky-600/10' },
  on_hold:   { label: 'On hold',   cls: 'bg-amber-50 text-amber-800 ring-amber-600/15' },
  'on-hold': { label: 'On hold',   cls: 'bg-amber-50 text-amber-800 ring-amber-600/15' },
  archived:  { label: 'Archived',  cls: 'bg-slate-50 text-slate-500 ring-slate-500/15' },
}

// Counts every task: "done" is finished, "todo" not started, every other stage (in progress,
// review, custom workflow stages) counts as in progress, so the three numbers add up to the total.
export function taskSummary(taskCounts = {}) {
  const total = Object.values(taskCounts).reduce((a, b) => a + b, 0)
  const done = taskCounts.done || 0
  const todo = taskCounts.todo || 0
  return { total, done, todo, doing: total - done - todo, progress: total ? Math.round((done / total) * 100) : 0 }
}

export default function ProjectCard({ project, taskCounts = {}, onDuplicated }) {
  const navigate = useNavigate()
  const [duplicating, setDuplicating] = useState(false)
  const { total, done, todo, doing, progress } = taskSummary(taskCounts)
  const status = STATUS[project.status] || STATUS.active
  const open = () => navigate(`/pm/projects/${project.slug || project.id}`)

  const handleDuplicate = async (e) => {
    e.stopPropagation()
    setDuplicating(true)
    try {
      const newProject = await duplicateProject(project.id)
      onDuplicated?.(newProject)
    } catch (err) {
      console.error('Failed to duplicate project:', err)
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter') open() }}
      className="group flex min-h-[148px] flex-col rounded-xl border border-slate-200 bg-white p-5 cursor-pointer transition-colors hover:border-slate-300"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full ring-1 ring-black/5" style={{ backgroundColor: project.color || '#94A3B8' }} />
        <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-6 text-slate-900 line-clamp-1">{project.name}</h3>
        <button
          type="button"
          onClick={handleDuplicate}
          disabled={duplicating}
          title="Duplicate project"
          aria-label={`Duplicate ${project.name}`}
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-40"
        >
          {duplicating ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />}
        </button>
        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${status.cls}`}>{status.label}</span>
      </div>

      {project.description && <p className="mt-2 text-[13px] leading-5 text-slate-500 line-clamp-2">{project.description}</p>}

      <div className="mt-auto pt-4">
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="text-slate-500">{total ? `${done} of ${total} tasks done` : 'No tasks yet'}</span>
          <span className="font-medium tabular-nums text-slate-700">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${project.name} progress`}>
          <div className="h-full rounded-full bg-orange-500 transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
          <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> {done} done</span>
          <span className="flex items-center gap-1"><Clock size={12} className="text-amber-500" /> {doing} in progress</span>
          <span className="flex items-center gap-1"><Circle size={12} className="text-slate-400" /> {todo} to do</span>
        </div>
        {project.client_name && (
          <p className="mt-3 truncate border-t border-slate-100 pt-3 text-[12px] text-slate-500">
            Client <span className="font-medium text-slate-700">{project.client_name}</span>
          </p>
        )}
      </div>
    </div>
  )
}
