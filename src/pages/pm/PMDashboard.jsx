import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutDashboard, Lock, Users, Gift, Zap, Mail, Settings, X, CreditCard, Sparkles, LayoutGrid } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProjects, getTasks, getSharedProjects, getStorageUsedMb } from '../../lib/pmService'
import { STORAGE_LIMITS_MB } from '../../lib/entitlements'
import { sendWeeklyDigest } from '../../lib/openaiService'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

import ProjectCard from '../../components/pm/ProjectCard'
import UpgradeModal from '../../components/pm/UpgradeModal'
import QuickAdd from '../../components/pm/QuickAdd'
import TemplateGallery from '../../components/pm/TemplateGallery'
import useSubscription from '../../hooks/useSubscription'
import AppHeader from '../../components/AppHeader'
import { KpiCard } from '../admin/ui'
import PMSidebar from '../../components/pm/PMSidebar'
import useOpenOnParam from '../../hooks/useOpenOnParam'

const FREE_PROJECT_LIMIT = 3

export default function PMDashboard() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [sharedProjects, setSharedProjects] = useState([])
  const [taskCounts, setTaskCounts] = useState({})
  const [fetching, setFetching] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [pendingCycle, setPendingCycle] = useState('monthly')
  const [showManageSub, setShowManageSub] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  useLockBodyScroll(showManageSub || showTemplates)
  const [sendingDigest, setSendingDigest] = useState(false)
  const [digestSent, setDigestSent] = useState(false)
  const [storageUsedMb, setStorageUsedMb] = useState(null)
  const { isPro, plan, subscription, setSubscription, loading: subLoading } = useSubscription()

  // Auto-show upgrade modal if user signed up via a plan CTA
  useEffect(() => {
    const pending = sessionStorage.getItem('vikku_pending_plan')
    if (pending && user) {
      sessionStorage.removeItem('vikku_pending_plan')
      const cycle = sessionStorage.getItem('vikku_pending_cycle')
      if (cycle) { setPendingCycle(cycle); sessionStorage.removeItem('vikku_pending_cycle') }
      setShowUpgrade(true)
    }
  }, [user])


  const handleSendDigest = async () => {
    setSendingDigest(true)
    try {
      await sendWeeklyDigest(user.id)
      setDigestSent(true)
      setTimeout(() => setDigestSent(false), 4000)
    } catch (err) {
      console.error('Digest error:', err)
    } finally {
      setSendingDigest(false)
    }
  }

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    async function load() {
      setFetching(true)
      const [data, shared] = await Promise.all([
        getProjects(user.id),
        getSharedProjects(user.id).catch(() => []),
      ])
      setProjects(data)
      setSharedProjects(shared)
      const counts = {}
      const allProjects = [...data, ...shared]
      await Promise.all(
        allProjects.map(async (p) => {
          const tasks = await getTasks(p.id)
          counts[p.id] = tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1
            return acc
          }, {})
        })
      )
      setTaskCounts(counts)
      setFetching(false)
    }
    load()
    getStorageUsedMb(user.id).then(setStorageUsedMb)
  }, [user])

  const atProjectLimit = () => !isPro && projects.filter((p) => p.status !== 'archived').length >= FREE_PROJECT_LIMIT

  const handleNewProject = () => {
    if (atProjectLimit()) { setShowUpgrade(true); return }
    navigate('/pm/projects/new')
  }

  const handleStartFromTemplate = () => {
    if (atProjectLimit()) { setShowUpgrade(true); return }
    setShowTemplates(true)
  }

  // The PM sidebar's "New project" links here with ?new=1 so the free-plan limit is checked.
  useOpenOnParam('new', () => handleNewProject(), !!user && !fetching && !subLoading)

  const pickTemplate = (key) => {
    setShowTemplates(false)
    navigate('/pm/projects/new', { state: { templateKey: key } })
  }

  if (loading || fetching || subLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const active = projects.filter((p) => p.status === 'active').length
  const done = projects.filter((p) => p.status === 'completed').length
  const atLimit = !isPro && projects.filter((p) => p.status !== 'archived').length >= FREE_PROJECT_LIMIT

  const onHold = projects.filter((p) => p.status === 'on_hold' || p.status === 'on-hold').length
  // Task totals cover every project on this page (yours and shared with you), counted the same
  // way as the project cards: all statuses, with "done" as finished.
  const allCounts = [...projects, ...sharedProjects].map((p) => taskCounts[p.id] || {})
  const totalTasks = allCounts.reduce((s, c) => s + Object.values(c).reduce((a, b) => a + b, 0), 0)
  const doneTasks = allCounts.reduce((s, c) => s + (c.done || 0), 0)
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const scope = sharedProjects.length ? `across ${projects.length} yours + ${sharedProjects.length} shared` : `across ${projects.length} project${projects.length === 1 ? '' : 's'}`
  const limitMb = STORAGE_LIMITS_MB[plan] || STORAGE_LIMITS_MB.free
  const storagePct = storageUsedMb === null ? 0 : Math.min(Math.round((storageUsedMb / limitMb) * 100), 100)
  const limitText = limitMb >= 1024 ? `${limitMb / 1024} GB` : `${limitMb} MB`
  const slotsLeft = FREE_PROJECT_LIMIT - Math.min(projects.filter((p) => p.status !== 'archived').length, FREE_PROJECT_LIMIT)

  return (
    <div className="adm min-h-screen">
      {/* Start from Template modal */}
      {showTemplates && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center p-4 sm:py-10 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowTemplates(false)}
        >
          <div
            className="glass rounded-2xl w-full max-w-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-lg text-white">Start from a template</h2>
                <p className="text-xs text-white/50 mt-0.5">Pick one to prefill your project with tasks and milestones.</p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X size={16} />
              </button>
            </div>
            <TemplateGallery selectedKey={null} onPick={pickTemplate} includeBlank={false} />
          </div>
        </div>
      )}

      {showUpgrade && (
        <UpgradeModal
          currentPlan={plan}
          initialBillingCycle={pendingCycle}
          reason={plan === 'pro' ? 'Upgrade to Team for unlimited members across your projects.' : 'Free plan allows 3 active projects. Upgrade to Pro for unlimited projects.'}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); window.location.reload() }}
        />
      )}

      {/* Manage Subscription Modal */}
      {showManageSub && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => { setShowManageSub(false) }}
        >
          <div
            className="w-full max-w-[300px] bg-[#111] border border-white/10 rounded-2xl p-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-white text-sm">My Subscription</h2>
              <button onClick={() => { setShowManageSub(false) }} className="text-white/60 hover:text-white transition-colors" aria-label="Close">
                <X size={15} />
              </button>
            </div>

            <div className="glass rounded-xl p-3 mb-2.5">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Current plan</p>
                  <p className="font-display font-bold text-white capitalize text-sm">{plan}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <CreditCard size={13} className="text-violet-400" />
                </div>
              </div>
              {subscription?.current_period_end && (
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Access until</p>
                  <p className="text-xs text-white">
                    {new Date(subscription.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-white/60 mt-2">One-time plan - it won't auto-renew. Pay again before this date to keep access.</p>
                </div>
              )}
            </div>

            {plan === 'pro' && subscription?.status !== 'cancelling' && (
              <button
                onClick={() => { setShowManageSub(false); setShowUpgrade(true) }}
                className="w-full text-xs font-semibold text-white bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl py-2 mb-2 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles size={12} className="text-violet-400" />
                Upgrade to Team - ₹999/mo
              </button>
            )}

            <button
              onClick={() => { setShowManageSub(false); setShowUpgrade(true) }}
              className="w-full text-xs font-semibold text-white/70 hover:text-white transition-colors py-2 border border-white/[0.06] rounded-xl"
            >
              Renew {plan === 'team' ? 'Team' : 'Pro'}
            </button>
          </div>
        </div>
      )}

      <AppHeader
        breadcrumbs={[{ label: 'Projects' }]}
        badge={
          !isPro ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-[11px] text-yellow-400 hover:text-yellow-300 transition-colors border border-yellow-400/30 px-2 sm:px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                <span className="hidden sm:inline">Free · </span>Upgrade
              </button>
              <button
                onClick={() => navigate('/pm/refer')}
                className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white transition-colors border border-white/10 px-2 sm:px-2.5 py-1 rounded-lg whitespace-nowrap"
                aria-label="Refer & Earn"
                title="Refer & Earn"
              >
                <Gift size={11} className="flex-shrink-0" /> <span className="hidden sm:inline">Refer &amp; Earn</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => navigate('/pm/refer')}
                className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white transition-colors border border-white/10 px-2 sm:px-2.5 py-1 rounded-lg whitespace-nowrap"
                aria-label="Refer & Earn"
                title="Refer & Earn"
              >
                <Gift size={11} className="flex-shrink-0" /> <span className="hidden sm:inline">Refer &amp; Earn</span>
              </button>
              <button
                onClick={() => setShowManageSub(true)}
                className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-2 sm:px-2.5 py-1 rounded-lg transition-all capitalize whitespace-nowrap"
                aria-label={`${plan} plan, manage subscription`}
                title="Manage subscription"
              >
                <Settings size={10} className="flex-shrink-0" /> <span className="hidden sm:inline">{plan} · Manage</span>
              </button>
            </div>
          )
        }
      />

      <div className="flex">
      <PMSidebar projects={[...projects, ...sharedProjects]} />
      <main className="flex-1 min-w-0 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 sm:pb-12">
        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-[26px] leading-8 font-semibold tracking-tight text-slate-900">My projects</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-slate-500">
              <span>{projects.length} project{projects.length === 1 ? '' : 's'} · {active} active · {done} completed</span>
              {!isPro && (
                <button type="button" onClick={() => setShowUpgrade(true)}
                  className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[12px] font-medium text-amber-800 ring-1 ring-inset ring-amber-600/15 hover:bg-amber-100">
                  {slotsLeft} of {FREE_PROJECT_LIMIT} free projects left · Upgrade
                </button>
              )}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button type="button" onClick={handleStartFromTemplate}
              className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900">
              <LayoutGrid size={15} className="text-slate-400" /> Start from template
            </button>
            <button type="button" onClick={handleNewProject}
              className={`inline-flex items-center gap-1.5 h-9 rounded-lg px-3.5 text-[13px] font-semibold ${atLimit ? 'border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100' : 'btn-primary'}`}>
              {atLimit ? <Lock size={14} /> : <Plus size={15} />} New project
            </button>
          </div>
        </div>

        {/* Numbers */}
        {projects.length + sharedProjects.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <KpiCard label="Active projects" value={active}
              sub={`${done} completed${onHold ? ` · ${onHold} on hold` : ''}${sharedProjects.length ? ` · ${sharedProjects.length} shared with you` : ''}`} />
            <KpiCard label="Tasks done" value={<>{doneTasks}<span className="text-[16px] font-medium text-slate-400"> / {totalTasks}</span></>} sub={scope} />
            <KpiCard label="Completion" value={`${completionRate}%`}
              sub={<span className="block w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1" role="progressbar" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100} aria-label="Tasks completed"><span className="block h-full rounded-full bg-orange-500" style={{ width: `${completionRate}%` }} /></span>} />
            <KpiCard label="Storage" value={storageUsedMb === null ? '—' : `${storageUsedMb} MB`}
              sub={storageUsedMb === null ? 'Checking…' : (
                <>
                  <span className="block w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1" role="progressbar" aria-valuenow={storagePct} aria-valuemin={0} aria-valuemax={100} aria-label="Storage used">
                    <span className={`block h-full rounded-full ${storagePct >= 80 ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${storagePct}%` }} />
                  </span>
                  <span>of {limitText}{storagePct >= 80 && !isPro && <> · <button type="button" onClick={() => setShowUpgrade(true)} className="font-medium text-amber-700 hover:underline">Upgrade</button></>}</span>
                </>
              )} />
          </div>
        )}

        {/* Limit banner */}
        {atLimit && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[13px] text-amber-900">You've used all <b className="font-semibold">{FREE_PROJECT_LIMIT} free projects</b>. Archive one or upgrade to add more.</p>
            <button type="button" onClick={() => setShowUpgrade(true)} className="text-[13px] font-semibold text-amber-800 hover:underline">Upgrade to Pro →</button>
          </div>
        )}

        {/* My projects, grouped by status */}
        {projects.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white flex flex-col items-center text-center px-6 py-12">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-4"><LayoutDashboard size={20} /></span>
            <h2 className="text-[16px] font-semibold text-slate-900">No projects yet</h2>
            <p className="mt-1 max-w-xs text-[13px] text-slate-500">Create your first project to track tasks, milestones and client progress.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => navigate('/pm/projects/new')} className="btn-primary inline-flex items-center gap-1.5 h-9 rounded-lg px-3.5 text-[13px] font-semibold"><Plus size={15} /> Create first project</button>
              <button type="button" onClick={handleStartFromTemplate} className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 hover:border-slate-300"><LayoutGrid size={15} className="text-slate-400" /> Use a template</button>
            </div>
          </div>
        ) : (
          <>
            {[
              { key: 'active',    label: 'Active',    dot: 'bg-emerald-500' },
              { key: 'on_hold',   label: 'On hold',   dot: 'bg-amber-500' },
              { key: 'completed', label: 'Completed', dot: 'bg-sky-500' },
              { key: 'archived',  label: 'Archived',  dot: 'bg-slate-300' },
            ].map(({ key, label, dot }) => {
              const group = projects.filter((p) => (p.status || 'active') === key)
              if (group.length === 0) return null
              return (
                <section key={key} className="mb-8">
                  <h2 className="flex items-center gap-2 mb-3 text-[13px] font-semibold text-slate-700">
                    <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
                    <span className="text-[11px] font-medium tabular-nums px-1.5 rounded-md bg-slate-100 text-slate-500">{group.length}</span>
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        taskCounts={taskCounts[p.id] || {}}
                        onDuplicated={(newP) => setProjects((prev) => [newP, ...prev])}
                      />
                    ))}
                    {key === 'active' && (
                      <button type="button" onClick={handleNewProject}
                        className="flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-transparent text-[13px] font-medium text-slate-500 hover:border-orange-300 hover:bg-orange-50/40 hover:text-orange-700">
                        {atLimit ? <Lock size={16} /> : <Plus size={18} />}
                        {atLimit ? 'Upgrade to add more' : 'New project'}
                      </button>
                    )}
                  </div>
                </section>
              )
            })}
          </>
        )}

        {/* Shared with me */}
        {sharedProjects.length > 0 && (
          <section className="mt-2 mb-8">
            <h2 className="flex items-center gap-2 mb-3 text-[13px] font-semibold text-slate-700">
              <Users size={14} className="text-slate-400" /> Shared with you
              <span className="text-[11px] font-medium tabular-nums px-1.5 rounded-md bg-slate-100 text-slate-500">{sharedProjects.length}</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} taskCounts={taskCounts[p.id] || {}} />
              ))}
            </div>
          </section>
        )}

        {/* Quick add hint + weekly digest */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="flex items-center gap-2 text-[12px] text-slate-500">
            <Zap size={12} className="text-slate-400" />
            Press <kbd className="rounded border border-slate-200 bg-white px-1.5 text-[11px] font-medium text-slate-500">{typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'} K</kbd> to quick-add a task anywhere
          </p>
          {projects.length > 0 && (
            <button type="button" onClick={handleSendDigest} disabled={sendingDigest || digestSent} className="act gap-1.5 disabled:opacity-60">
              <Mail size={13} /> {digestSent ? 'Digest sent' : sendingDigest ? 'Sending…' : 'Email me a weekly digest'}
            </button>
          )}
        </div>
      </main>
      </div>

      {/* Phone action bar */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={handleStartFromTemplate}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700">
          <LayoutGrid size={15} className="text-slate-400" /> Template
        </button>
        <button type="button" onClick={handleNewProject}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-lg text-[13px] font-semibold ${atLimit ? 'border border-slate-200 bg-slate-50 text-slate-500' : 'btn-primary'}`}>
          {atLimit ? <Lock size={14} /> : <Plus size={15} />} New project
        </button>
      </div>
      <QuickAdd />
    </div>
  )
}
