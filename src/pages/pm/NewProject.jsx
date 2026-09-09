import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TEMPLATES } from '../../lib/projectTemplates'
import { useAuth } from '../../contexts/AuthContext'
import { createProject, bulkCreateTasks, bulkCreateMilestones } from '../../lib/pmService'
import AppHeader from '../../components/AppHeader'
import TemplateGallery from '../../components/pm/TemplateGallery'

const COLORS = [
  '#ffffff', '#6ee7b7', '#93c5fd', '#fbbf24', '#f87171',
  '#c084fc', '#fb923c', '#34d399', '#60a5fa', '#f472b6',
]

const STATUS_OPTIONS = ['active', 'on-hold']

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}


export default function NewProject() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fromEstimate = location.state?.fromEstimate || null
  const [selectedTemplate, setSelectedTemplate] = useState(location.state?.templateKey || 'blank')
  const [form, setForm] = useState({
    name: fromEstimate?.name || '',
    description: fromEstimate?.description || '',
    client_name: '',
    client_email: '',
    color: '#ffffff',
    status: 'active',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const template = TEMPLATES.find((t) => t.key === selectedTemplate)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedName = form.name.trim()
    if (!trimmedName) { setError('Project name is required'); return }
    if (trimmedName.length > 100) { setError('Project name must be under 100 characters'); return }
    if (form.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client_email)) {
      setError('Please enter a valid client email address')
      return
    }
    setSaving(true)
    setError('')
    try {
      const project = await createProject({ ...form, name: trimmedName, user_id: user.id })

      if (template && template.tasks.length > 0) {
        await bulkCreateTasks(template.tasks.map((t) => ({ ...t, project_id: project.id, created_by_email: user.email })))
      }
      const estimateMilestones = fromEstimate?.phases?.length && (!template || template.milestones.length === 0)
        ? fromEstimate.phases
        : null
      if (estimateMilestones) {
        await bulkCreateMilestones(estimateMilestones.map((m) => ({
          project_id: project.id,
          title: m.title,
          due_date: daysFromNow(m.daysFromNow),
          completed: false,
        })))
      } else if (template && template.milestones.length > 0) {
        await bulkCreateMilestones(template.milestones.map((m) => ({
          project_id: project.id,
          title: m.title,
          due_date: daysFromNow(m.daysFromNow),
          completed: false,
        })))
      }

      const isBlank = !template || template.tasks.length === 0
      navigate(`/pm/projects/${project.slug || project.id}${isBlank ? '?onboard=1' : ''}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumbs={[{ label: 'Projects', href: '/pm/dashboard' }, { label: 'New Project' }]} />

      <div className="max-w-6xl mx-auto px-6 py-10">

        {fromEstimate && !bannerDismissed && (
          <div className="mb-6 flex items-center gap-3 bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3">
            <span className="text-xs text-white/80 flex-1">Pre-filled from your estimate. You can edit any field before creating.</span>
            <button onClick={() => setBannerDismissed(true)} className="text-white/30 hover:text-white/60 transition-colors text-xs">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Template picker */}
          <div>
            <label className="text-xs text-white/50 mb-3 block">Choose a template</label>
            <TemplateGallery selectedKey={selectedTemplate} onPick={setSelectedTemplate} />
            {template && template.key !== 'blank' && (
              <div className="mt-3 flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
                <template.Icon size={16} className="text-white/50 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white font-medium">{template.name} template</p>
                  <p className="text-[10px] text-white/40">{template.description} will be created automatically</p>
                </div>
              </div>
            )}
          </div>

        <form onSubmit={handleSubmit} className="space-y-6 lg:sticky lg:top-6">
          {/* Color picker */}
          <div>
            <label className="text-xs text-white/50 mb-3 block">Project Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === c ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Project Name *</label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. HSO CCTV Website"
              maxLength={200}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="What are you building? Keep it brief."
              maxLength={2000}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`text-xs px-4 py-2 rounded-lg border transition-all capitalize ${
                    form.status === s
                      ? 'bg-white text-black border-white font-semibold'
                      : 'border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Client */}
          <div className="glass rounded-xl p-5">
            <p className="text-xs font-semibold text-white/60 mb-4">Client Details (optional)</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-2 block">Client Name</label>
                <input
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="e.g. Suresh Reddy"
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 block">Client Email</label>
                <input
                  type="email"
                  value={form.client_email}
                  onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              {saving ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/pm/dashboard')}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
