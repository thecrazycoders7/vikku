import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Share2, Trash2, Copy, Check, LayoutDashboard, GitBranch, BarChart2, Calendar, Lock, UserPlus, FileDown, Search, X as XIcon, Receipt, Timer, Sparkles, MessageSquare, AlertCircle, Clock, Layers, MoreHorizontal, Paperclip } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProject, getTasks, getMilestones, deleteProject, getWorkflow, getClientComments, updateProject, getProjectDependencies, getSubtaskCounts } from '../../lib/pmService'
import { supabase } from '../../lib/supabaseClient'
import KanbanBoard from '../../components/pm/KanbanBoard'
import MilestoneList from '../../components/pm/MilestoneList'
import TimelineView from '../../components/pm/TimelineView'
import CalendarView from '../../components/pm/CalendarView'
import AnalyticsPanel from '../../components/pm/AnalyticsPanel'
import AIAssistant from '../../components/pm/AIAssistant'
import InviteMemberModal from '../../components/pm/InviteMemberModal'
import MembersPanel from '../../components/pm/MembersPanel'
import ActivityFeed from '../../components/pm/ActivityFeed'
import WorkflowEditor from '../../components/pm/WorkflowEditor'
import TimeTrackingPanel from '../../components/pm/TimeTrackingPanel'
import FilesPanel from '../../components/pm/FilesPanel'
import useSubscription from '../../hooks/useSubscription'
import UpgradeModal from '../../components/pm/UpgradeModal'
import AppHeader from '../../components/AppHeader'
import { DEFAULT_WORKFLOW_STAGES } from '../../lib/pmConstants'

const TABS = [
  { key: 'kanban',    label: 'Kanban',    icon: LayoutDashboard },
  { key: 'timeline',  label: 'Timeline',  icon: GitBranch },
  { key: 'analytics', label: 'Analytics', icon: BarChart2 },
  { key: 'calendar',  label: 'Calendar',  icon: Calendar },
  { key: 'time',      label: 'Time',      icon: Clock, pro: true },
  { key: 'files',     label: 'Files',     icon: Paperclip },
]

const UPGRADE_REASONS = {
  share:    'Client share links are Pro-only. Share a read-only link with clients - no login needed.',
  ai:       'AI Project Planner is a Pro feature. Describe your project and get tasks + milestones in seconds.',
  time:     'Time tracking is a Pro feature. Track time per task, run reports, and export billable hours.',
  workflow: 'Custom workflows are a Pro feature. Create stages that match your team\'s actual process.',
  branding: 'Client portal branding is a Pro feature. Add your logo and accent color to the client share page.',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function ProjectDetail() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const aiRef = useRef(null)
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState('kanban')
  const [shareTab, setShareTab] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [showOnboard, setShowOnboard] = useState(false)
  const [clientComments, setClientComments] = useState([])
  const [seenCommentCount, setSeenCommentCount] = useState(0)
  const [workflow, setWorkflow] = useState(null)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [dependencies, setDependencies] = useState([]) // [{task_id, depends_on_task_id}]
  const [pinValue, setPinValue] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { isPro } = useSubscription()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user || !id) return
    async function load() {
      setFetching(true)
      const p = await getProject(id)
      if (!p) { navigate('/pm/dashboard'); return }
      // Redirect UUID URLs to clean slug URL
      if (UUID_RE.test(id) && p.slug) {
        navigate(`/pm/projects/${p.slug}`, { replace: true })
        return
      }
      const [t, m] = await Promise.all([getTasks(p.id), getMilestones(p.id)])
      setProject(p)
      setMilestones(m)
      // Annotate tasks with subtask counts so TaskCard badges are accurate
      if (t.length) {
        const counts = await getSubtaskCounts(t.map((task) => task.id))
        setTasks(t.map((task) => ({
          ...task,
          _subtasksTotal: counts[task.id]?.total || 0,
          _subtasksDone: counts[task.id]?.done || 0,
        })))
      } else {
        setTasks(t)
      }
      setFetching(false)
      if (p.workflow_id) getWorkflow(p.workflow_id).then(setWorkflow)
      getProjectDependencies(p.id).then(setDependencies)
      if (p.share_token) getClientComments(p.share_token).then((comments) => {
        setClientComments(comments)
        setSeenCommentCount(Number(localStorage.getItem(`seen_comments_${p.id}`) || 0))
      })
      if (searchParams.get('onboard') === '1') {
        setShowOnboard(true)
        setSearchParams({}, { replace: true })
      }
    }
    load()
  }, [user, id, navigate])

  const projectUuid = project?.id
  useEffect(() => {
    if (!projectUuid || !supabase) return
    let channel
    try {
      channel = supabase
        .channel(`tasks_${projectUuid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pm_tasks', filter: `project_id=eq.${projectUuid}` }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => prev.some((t) => t.id === payload.new.id) ? prev : [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) => prev.map((t) => t.id === payload.new.id ? { ...t, ...payload.new } : t))
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        })
        .subscribe()
    } catch {
      // WebSocket unavailable (e.g. iOS Safari security restriction) — live updates disabled
    }
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [projectUuid])

  // Keep the workflow in sync for every viewer: the owner can assign a
  // different workflow (or edit stages) while members have the project open
  const workflowIdRef = useRef(null)
  useEffect(() => { workflowIdRef.current = project?.workflow_id || null }, [project?.workflow_id])

  const syncWorkflow = async (wfId) => {
    if (!wfId) { setWorkflow(null); return }
    const wf = await getWorkflow(wfId)
    if (wf) setWorkflow(wf)
  }

  useEffect(() => {
    if (!projectUuid || !supabase) return
    let channel
    try {
      channel = supabase
        .channel(`project_${projectUuid}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pm_projects', filter: `id=eq.${projectUuid}` }, (payload) => {
          const next = payload.new
          if ((next.workflow_id || null) !== workflowIdRef.current) syncWorkflow(next.workflow_id)
          setProject((prev) => (prev ? { ...prev, ...next } : prev))
        })
        .subscribe()
    } catch {
      // WebSocket unavailable - the visibility refetch below still applies
    }
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [projectUuid])

  // Returning to the tab refetches project + workflow: catches stage edits
  // (which don't touch pm_projects) and anything realtime missed
  useEffect(() => {
    if (!projectUuid) return
    const onVisible = async () => {
      if (document.visibilityState !== 'visible') return
      const p = await getProject(projectUuid)
      if (!p) return
      setProject((prev) => (prev ? { ...prev, ...p } : p))
      syncWorkflow(p.workflow_id)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [projectUuid])

  const triggerUpgrade = (reason) => {
    setUpgradeReason(UPGRADE_REASONS[reason] || '')
    setShowUpgrade(true)
  }

  const handleTabClick = (tab) => {
    if (tab.pro && !isPro) { triggerUpgrade(tab.key); return }
    setActiveTab(tab.key)
  }

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    if (project?.id) setPinValue(project.share_pin || '')
  }, [project?.id])

  // Owner-only controls must mirror RLS: invites, sharing, project settings,
  // and deletion are all restricted to pm_projects.user_id on the backend
  const isOwner = !!user && project?.user_id === user.id

  const shareUrl = project ? `${window.location.origin}/pm/share/${project.share_token}` : ''

  const handleSaveAndCopy = async () => {
    // Copy FIRST - clipboard writes must happen inside the user gesture
    // (iOS Safari drops the gesture after an awaited network call).
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const ta = document.createElement('textarea')
        ta.value = shareUrl
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus(); ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
    } catch {
      // Clipboard blocked - the link is still visible above for manual copy
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    // Then persist the PIN
    const pin = pinValue.trim()
    if (pin !== (project?.share_pin || '')) {
      const updated = await updateProject(project.id, { share_pin: pin || null }).catch(() => null)
      if (updated) setProject(updated)
    }
  }

  const escHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  const handleExportPDF = () => {
    const done = tasks.filter((t) => t.status === 'done').length
    const total = tasks.length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><title>${escHtml(project.name)} - Project Report</title>
    <style>
      body{font-family:system-ui,sans-serif;background:#fff;color:#111;padding:40px;max-width:700px;margin:0 auto}
      h1{font-size:24px;font-weight:800;margin-bottom:4px}
      .meta{color:#888;font-size:13px;margin-bottom:32px}
      .stat-row{display:flex;gap:24px;margin-bottom:32px}
      .stat{background:#f5f5f5;border-radius:12px;padding:16px 20px;flex:1;text-align:center}
      .stat .val{font-size:28px;font-weight:800;color:#111}
      .stat .lbl{font-size:11px;color:#888;margin-top:2px}
      .progress-bar{height:8px;background:#eee;border-radius:99px;overflow:hidden;margin-bottom:32px}
      .progress-fill{height:100%;background:#111;border-radius:99px}
      h2{font-size:14px;font-weight:700;margin:24px 0 12px;text-transform:uppercase;letter-spacing:.05em;color:#888}
      .task{padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;display:flex;align-items:center;gap:8px}
      .badge{font-size:10px;padding:2px 7px;border-radius:99px;font-weight:600}
      .todo{background:#f0f0f0;color:#888}
      .in_progress{background:#dbeafe;color:#1d4ed8}
      .review{background:#fef9c3;color:#854d0e}
      .done{background:#dcfce7;color:#166534;text-decoration:line-through}
      .milestone{padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;display:flex;justify-content:space-between}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>${escHtml(project.name)}</h1>
    <p class="meta">Generated ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}${project.client_name ? ' · Client: '+escHtml(project.client_name) : ''}</p>
    <div class="stat-row">
      <div class="stat"><div class="val">${pct}%</div><div class="lbl">Progress</div></div>
      <div class="stat"><div class="val">${done}/${total}</div><div class="lbl">Tasks Done</div></div>
      <div class="stat"><div class="val">${milestones.filter(m=>m.completed).length}/${milestones.length}</div><div class="lbl">Milestones</div></div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <h2>Tasks</h2>
    ${tasks.map(t=>`<div class="task"><span class="badge ${escHtml(t.status||'')}">${escHtml((t.status||'').replace('_',' '))}</span>${escHtml(t.title)}</div>`).join('')}
    ${milestones.length>0?`<h2>Milestones</h2>${milestones.map(m=>`<div class="milestone"><span>${m.completed?'✓ ':''} ${escHtml(m.title)}</span><span style="color:#888">${new Date(m.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span></div>`).join('')}`:''}
    <script>window.onload=()=>window.print()</script></body></html>`)
    win.document.close()
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}"? This will delete all tasks and milestones too. This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteProject(project.id)
      navigate('/pm/dashboard')
    } catch (err) {
      setDeleting(false)
      alert(err?.message || 'Failed to delete project')
    }
  }

  const workflowStages = workflow?.stages || DEFAULT_WORKFLOW_STAGES
  const doneKeys = new Set(workflowStages.filter((s) => s.is_done).map((s) => s.status_key))
  // Annotate tasks with _isBlocked: true when any blocker is not done
  const doneTaskIds = new Set(tasks.filter((t) => doneKeys.has(t.status)).map((t) => t.id))
  const annotatedTasks = tasks.map((t) => ({
    ...t,
    _isBlocked: dependencies.some((d) => d.task_id === t.id && !doneTaskIds.has(d.depends_on_task_id)),
  }))
  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => doneKeys.has(t.status)).length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {showUpgrade && (
        <UpgradeModal
          reason={upgradeReason}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); window.location.reload() }}
        />
      )}

      {showInviteModal && (
        <InviteMemberModal
          projectId={project.id}
          projectName={project.name}
          ownerUserId={project.user_id}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {showWorkflow && (
        <WorkflowEditor
          projectId={project.id}
          currentWorkflowId={project.workflow_id || null}
          projectTasks={tasks}
          onClose={() => setShowWorkflow(false)}
          onWorkflowAssigned={(wf) => {
            // wf is the full workflow object, or null when reverting to the default workflow
            const wfId = wf?.id || null
            setProject((prev) => ({ ...prev, workflow_id: wfId }))
            if (wf) {
              setWorkflow(wf)
            } else if (wfId) {
              getWorkflow(wfId).then(setWorkflow)
            } else {
              setWorkflow(null)
            }
            setShowWorkflow(false)
          }}
        />
      )}

      <AppHeader
        breadcrumbs={[
          { label: 'Projects', href: '/pm/dashboard' },
          { label: project.name },
        ]}
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Desktop-only actions */}
            {isOwner && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
              >
                <UserPlus size={14} />
                <span className="hidden sm:inline">Invite</span>
              </button>
            )}
            <AIAssistant
              projectId={project.id}
              projectName={project.name}
              workflow={workflowStages}
              isPro={isPro}
              onDone={async () => {
                const [t, m] = await Promise.all([getTasks(project.id), getMilestones(project.id)])
                setTasks(t)
                setMilestones(m)
              }}
            />
            <button
              onClick={handleExportPDF}
              className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              <FileDown size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
            {project.user_id === user?.id && (
              <button
                onClick={() => isPro ? setShowWorkflow(true) : triggerUpgrade('workflow')}
                className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                title="Customize workflow stages"
              >
                <Layers size={14} />
                <span className="hidden sm:inline">Workflow</span>
                {!isPro && <span className="text-[10px] text-yellow-400/60">Pro</span>}
              </button>
            )}
            <button
              onClick={() => navigate(`/pm/projects/${project?.slug || project?.id}/invoice`)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              <Receipt size={14} />
              <span className="hidden sm:inline">Invoice</span>
            </button>
            {isOwner && (
              <button
                onClick={() => isPro ? setShareTab(!shareTab) : triggerUpgrade('share')}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">Share</span>
                {!isPro && <span className="hidden sm:inline text-[10px] text-yellow-400/60">Pro</span>}
              </button>
            )}
            {/* Mobile-only overflow menu */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center text-white/50 hover:text-white transition-colors p-1"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMobileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
                  <div className="absolute right-0 top-8 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[140px]">
                    {isOwner && (
                      <button
                        onClick={() => { setShowInviteModal(true); setShowMobileMenu(false) }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <UserPlus size={13} /> Invite
                      </button>
                    )}
                    <button
                      onClick={() => { handleExportPDF(); setShowMobileMenu(false) }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <FileDown size={13} /> Export PDF
                    </button>
                    {project.user_id === user?.id && (
                      <button
                        onClick={() => { isPro ? setShowWorkflow(true) : triggerUpgrade('workflow'); setShowMobileMenu(false) }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <Layers size={13} /> Workflow {!isPro && <span className="text-[10px] text-yellow-400/60 ml-auto">Pro</span>}
                      </button>
                    )}
                    <button
                      onClick={() => { navigate(`/pm/projects/${project?.slug || id}/invoice`); setShowMobileMenu(false) }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <Receipt size={13} /> Invoice
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      {/* Share panel */}
      {shareTab && (
        <div className="border-b border-white/[0.05] bg-white/[0.02] px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50 mb-2">Client share link - anyone with this link can view the project (read-only, no login needed)</p>
                <code className="block text-xs text-white/70 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 truncate">
                  {shareUrl}
                </code>
              </div>
              <button
                onClick={() => setShareTab(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 mt-0.5"
                title="Close"
              >
                <XIcon size={13} />
              </button>
            </div>
            {isPro ? (
              <div className="space-y-2 pt-1 border-t border-white/[0.05]">
                <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Client portal branding</p>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-white/30 w-20 flex-shrink-0">Brand name</label>
                  <input
                    type="text"
                    defaultValue={project?.client_brand_name || ''}
                    placeholder="e.g. Acme Studio"
                    onBlur={(e) => {
                      const val = e.target.value.trim()
                      if (val !== (project?.client_brand_name || '')) {
                        updateProject(project.id, { client_brand_name: val || null })
                          .then((updated) => setProject(updated))
                          .catch(() => {})
                      }
                    }}
                    className="flex-1 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-white/30 w-20 flex-shrink-0">Logo URL</label>
                  <input
                    type="url"
                    defaultValue={project?.client_brand_logo || ''}
                    placeholder="https://your-logo.png"
                    onBlur={(e) => {
                      const val = e.target.value.trim()
                      if (val !== (project?.client_brand_logo || '')) {
                        updateProject(project.id, { client_brand_logo: val || null })
                          .then((updated) => setProject(updated))
                          .catch(() => {})
                      }
                    }}
                    className="flex-1 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                  />
                  {project?.client_brand_logo && (
                    <img src={project.client_brand_logo} alt="logo preview" className="w-6 h-6 rounded object-contain flex-shrink-0 bg-white/10" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-white/30 w-20 flex-shrink-0">Accent color</label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      defaultValue={project?.client_brand_color || '#ffffff'}
                      onChange={(e) => {
                        updateProject(project.id, { client_brand_color: e.target.value })
                          .then((updated) => setProject(updated))
                          .catch(() => {})
                      }}
                      className="w-8 h-7 rounded cursor-pointer bg-transparent border border-white/[0.08] p-0.5"
                    />
                    <span className="text-[10px] text-white/30">{project?.client_brand_color || 'Default'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-white/30 w-20 flex-shrink-0">PIN protection</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value)}
                    placeholder="Leave blank for no PIN"
                    className="flex-1 min-w-0 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors font-mono tracking-widest"
                  />
                </div>
                <div className="flex sm:justify-end pt-1">
                  <button
                    onClick={handleSaveAndCopy}
                    className="flex items-center justify-center gap-1.5 text-xs bg-white text-black px-3 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors w-full sm:w-auto"
                  >
                    {copied ? <><Check size={12} /> Saved & Copied!</> : <><Copy size={12} /> Save & Copy link</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1 border-t border-white/[0.05]">
                <span className="text-[10px] text-white/20">Custom branding</span>
                <span className="text-[9px] text-yellow-400/60 border border-yellow-400/20 rounded px-1.5 py-0.5">Pro</span>
                <button onClick={() => triggerUpgrade('branding')} className="text-[10px] text-white/30 hover:text-white/60 transition-colors ml-auto">Upgrade to customise →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onboarding banner */}
      {showOnboard && (
        <div className="border-b border-white/[0.05] bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Sparkles size={16} className="text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Project created! Add tasks to get started.</p>
                <p className="text-xs text-white/50">Use AI to generate a task plan instantly, or add tasks manually.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span ref={aiRef} />
              {isPro ? (
                <button
                  onClick={() => { setShowOnboard(false); aiRef.current?.previousSibling?.click?.() }}
                  className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
                >
                  <Sparkles size={11} /> Plan with AI
                </button>
              ) : (
                <button
                  onClick={() => { setShowOnboard(false); triggerUpgrade('ai') }}
                  className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
                >
                  <Sparkles size={11} /> Plan with AI (Pro)
                </button>
              )}
              <button
                onClick={() => setShowOnboard(false)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <XIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 pb-20 sm:pb-8">
        {/* Progress bar */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span>{doneTasks}/{totalTasks} tasks done</span>
              {project.client_name && <span>Client: {project.client_name}</span>}
              <span className="capitalize">{project.status}</span>
            </div>
            <span className="text-sm font-bold text-white">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Search + Tabs row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors w-44"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              <XIcon size={11} />
            </button>
          )}
        </div>
        {/* Overdue filter */}
        {(() => {
          const overdueCount = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && !doneKeys.has(t.status)).length
          return overdueCount > 0 ? (
            <button
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                overdueOnly ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'border-white/[0.08] text-red-400/60 hover:border-red-500/30 hover:text-red-400'
              }`}
            >
              <AlertCircle size={10} />
              {overdueCount} overdue
            </button>
          ) : null
        })()}
        {/* Tabs */}
        <div className="hidden sm:flex items-center gap-0.5 sm:gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 overflow-x-auto max-w-full">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            const locked = tab.pro && !isPro
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                  active
                    ? 'bg-white text-black'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{tab.label}</span>
                {locked && <Lock size={9} className="text-yellow-400/60" />}
              </button>
            )
          })}
        </div>
        </div>

        {/* Mobile tab bar - fixed to bottom of screen */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/[0.06] flex overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            const locked = tab.pro && !isPro
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium flex-shrink-0 ${
                  active ? 'text-white' : 'text-white/40'
                }`}
              >
                <Icon size={16} />
                <span className="flex items-center gap-1">
                  {tab.label}
                  {locked && <Lock size={8} className="text-yellow-400/60" />}
                </span>
              </button>
            )
          })}
        </div>

        {/* Main + Sidebar */}
        <div className="flex flex-col gap-4 xl:flex-row xl:gap-6">
          <div className="flex-1 min-w-0">
            {(() => {
              let filtered = annotatedTasks
              if (debouncedSearch) filtered = filtered.filter((t) => t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || (t.description || '').toLowerCase().includes(debouncedSearch.toLowerCase()))
              if (overdueOnly) filtered = filtered.filter((t) => t.due_date && new Date(t.due_date) < new Date() && !doneKeys.has(t.status))
              return (
                <>
                  {activeTab === 'kanban' && <KanbanBoard projectId={project.id} projectName={project.name} tasks={filtered} onTasksChange={setTasks} user={user} workflow={workflowStages} projectLabels={project.labels || []} />}
                  {activeTab === 'timeline' && <TimelineView milestones={milestones} onMilestonesChange={setMilestones} tasks={tasks} />}
                  {activeTab === 'analytics' && <AnalyticsPanel tasks={filtered} milestones={milestones} stages={workflowStages} />}
                  {activeTab === 'calendar' && <CalendarView tasks={filtered} milestones={milestones} />}
                  {activeTab === 'time' && <TimeTrackingPanel projectId={project.id} tasks={tasks} />}
                  {activeTab === 'files' && <FilesPanel projectId={project.id} isOwner={isOwner} />}
                </>
              )
            })()}
          </div>

          {/* Sidebar */}
          <div className="w-full xl:w-64 xl:flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            <div className="glass rounded-2xl p-5">
              <MilestoneList projectId={project.id} milestones={milestones} onMilestonesChange={setMilestones} />
            </div>

            <div className="glass rounded-2xl p-5">
              <MembersPanel
                projectId={project.id}
                ownerUserId={project.user_id}
                currentUserId={user?.id}
              />
            </div>

            {project.description && (
              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-white/40 mb-2">About</p>
                <p className="text-xs text-white/70 leading-relaxed">{project.description}</p>
              </div>
            )}

            <ActivityFeed projectId={project.id} />

            {clientComments.length > 0 && (
              <div
                className="glass rounded-2xl p-5 cursor-pointer"
                onClick={() => {
                  localStorage.setItem(`seen_comments_${project.id}`, String(clientComments.length))
                  setSeenCommentCount(clientComments.length)
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={13} className="text-white/40" />
                  <p className="text-xs text-white/40">Client Feedback</p>
                  {clientComments.length > seenCommentCount && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                  <span className="text-[10px] text-white/25 bg-white/[0.05] px-1.5 py-0.5 rounded-full ml-auto">{clientComments.length}</span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {clientComments.map((c) => (
                    <div key={c.id} className="border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/50 flex-shrink-0">
                          {c.author_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-[10px] font-medium text-white/60">{c.author_name}</span>
                        <span className="text-[9px] text-white/20 ml-auto">
                          {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed pl-6">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isOwner && (
              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-white/40 mb-3">Danger zone</p>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  <Trash2 size={12} /> {deleting ? 'Deleting...' : 'Delete project'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
