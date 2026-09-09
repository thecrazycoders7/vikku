import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { DollarSign, Clock, LayoutDashboard, TrendingUp, ArrowRight, FileText, Wrench, Radar, Kanban, Sparkles, Share2, Flag, LayoutGrid } from 'lucide-react'
import AppHeader from '../components/AppHeader'
import ToolArt from '../components/ToolArt'
import { getMyToolResults } from '../lib/toolResultsService'

export default function Dashboard() {
  const { user, loading, displayName } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, toolsUsed: 0 })
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('vikku_onboarded'))

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    getMyToolResults(user.id).then((rows) => {
      const toolsUsed = new Set(rows.map((r) => r.tool)).size
      setStats({ total: rows.length, toolsUsed })
    })
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Tools grouped by where the visitor is in their project journey, so a
  // first-time user can find "their" tool by the question they came with.
  const toolGroups = [
    {
      step: '00',
      title: 'Check what you already have',
      question: 'Will AI recommend your business today?',
      tools: [
        {
          icon: Radar,
          title: 'AI Visibility Score',
          description: "Paste your URL and see how likely AI is to recommend your business - and what's blocking you",
          useWhen: 'You already have a website and want to know if AI assistants can find and recommend it',
          gives: 'A visibility score, a prioritized list of blockers, and concrete fixes',
          art: 'visibility', path: '/dashboard/ai-visibility-score',
        },
      ],
    },
    {
      step: '01',
      title: 'Decide & budget',
      question: 'Is this project worth it, and what will it cost?',
      tools: [
        {
          icon: TrendingUp,
          title: 'ROI Calculator',
          description: 'See how much revenue you\'re losing without a website - and how fast it pays back',
          useWhen: 'You\'re not sure a website or app is worth the money',
          gives: 'Payback period + the monthly revenue you\'re leaving on the table',
          art: 'roi', path: '/dashboard/roi-calculator',
        },
        {
          icon: DollarSign,
          title: 'AI Cost Estimator',
          description: 'Describe your project in plain words and get a cost estimate in your local currency',
          useWhen: 'You have an idea but no budget number to plan around',
          gives: 'A realistic cost range with a feature-by-feature breakdown',
          art: 'cost', path: '/dashboard/cost-estimator',
        },
      ],
    },
    {
      step: '02',
      title: 'Plan the build',
      question: 'How long will it take, and what should it be built with?',
      tools: [
        {
          icon: Clock,
          title: 'Project Timeline Calculator',
          description: 'Get a realistic timeline with phase breakdown and milestones',
          useWhen: 'You need a delivery date you can commit to',
          gives: 'Week-by-week phases with clear milestones',
          art: 'timeline', path: '/dashboard/timeline-calculator',
        },
        {
          icon: LayoutDashboard,
          title: 'Tech Stack Recommender',
          description: 'Get an AI architect\'s pick for the best tech stack for your project',
          useWhen: 'You don\'t know which technologies to build on',
          gives: 'A recommended stack with the reasoning behind each choice',
          art: 'stack', path: '/dashboard/tech-recommender',
        },
      ],
    },
    {
      step: '03',
      title: 'Run & maintain',
      question: 'What does it cost to keep it alive after launch?',
      tools: [
        {
          icon: Wrench,
          title: 'Maintenance Calculator',
          description: 'Estimate the ongoing monthly cost to maintain and support your product',
          useWhen: 'You want to budget beyond launch day',
          gives: 'A monthly figure covering hosting, support and updates',
          art: 'maintenance', path: '/dashboard/maintenance-calculator',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumbs={[{ label: 'AI Tools' }]} />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-3xl text-white mb-3">AI Tools</h2>
            <p className="text-white/60 text-sm max-w-xl">
              Six free tools, organised by the question you're trying to answer, from checking
              whether AI can already find you, to costing and planning what's next.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/saved')}
            className="self-start flex-shrink-0 flex items-center gap-1.5 text-xs text-white/60 hover:text-white glass rounded-xl px-3 py-2 transition-colors"
          >
            <FileText size={13} /> My saved results
          </button>
        </div>

        {/* First-time welcome banner */}
        {showWelcome && (
          <div className="mb-8 glass rounded-2xl p-5 border border-white/10">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold text-white mb-1">
                  Welcome{displayName ? `, ${displayName.split(' ')[0]}` : ''}! 👋
                </p>
                <p className="text-sm text-white/60">Every tool here works the same way, no forms, no jargon:</p>
              </div>
              <button
                onClick={() => { setShowWelcome(false); localStorage.setItem('vikku_onboarded', '1') }}
                className="text-white/30 hover:text-white transition-colors text-xs flex-shrink-0 mt-0.5"
              >
                Dismiss
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {[
                ['1', 'Describe your project', 'A few plain sentences is enough'],
                ['2', 'AI crunches the numbers', 'Costs, timelines or stack, in seconds'],
                ['3', 'Save & share the result', 'Keep it in "My saved results" or send a link'],
              ].map(([n, title, sub]) => (
                <div key={n} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
                  <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                  <div>
                    <p className="text-xs font-medium text-white/80">{title}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/dashboard/cost-estimator')}
              className="text-xs bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
            >
              Not sure where to start? Try the Cost Estimator →
            </button>
          </div>
        )}

        {/* PM Tool banner */}
        <div
          onClick={() => navigate('/pm')}
          className="mb-8 glass rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-all group"
        >
          <div className="h-32 sm:h-40 w-full overflow-hidden">
            <ToolArt art="pm" />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white">Vikku PM — Project Management</h3>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">New</span>
              </div>
              <ArrowRight size={20} className="text-white/30 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
            </div>
            <p className="text-sm text-white/60 mb-6 max-w-2xl">
              Run client projects end to end — plan with AI, track work on a board, and share live
              progress with clients. Free to start, no credit card.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {[
                { icon: Kanban,    title: 'Kanban boards',    sub: 'Drag-and-drop task board with custom stages' },
                { icon: Sparkles,  title: 'AI project planning', sub: 'Describe it, AI builds tasks + milestones' },
                { icon: Share2,    title: 'Client share links', sub: 'Read-only progress link, no login needed' },
                { icon: Flag,      title: 'Milestones & timeline', sub: 'Deadlines with a visual timeline view' },
                { icon: Clock,     title: 'Time tracking',    sub: 'Timers + billable hours and reports' },
                { icon: LayoutGrid, title: '100+ templates',  sub: 'Start from a proven project template' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-start gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-white/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white">{title}</p>
                    <p className="text-[11px] text-white/40 mt-0.5 leading-tight">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/pm') }}
              className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
            >
              Open Vikku PM →
            </button>
          </div>
        </div>

        {toolGroups.map((group) => (
          <div key={group.step} className="mb-10">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-xs font-mono text-white/25">{group.step}</span>
              <h3 className="font-display font-bold text-xl text-white">{group.title}</h3>
            </div>
            <p className="text-sm text-white/40 italic mb-4">"{group.question}"</p>
            <div className="grid md:grid-cols-2 gap-4">
              {group.tools.map((tool) => (
                <div
                  key={tool.title}
                  onClick={() => navigate(tool.path)}
                  className="glass rounded-2xl overflow-hidden group transition-all hover:border-white/20 cursor-pointer flex flex-col"
                >
                  <div className="h-28 w-full overflow-hidden">
                    <ToolArt art={tool.art} />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-3">
                      <h3 className="font-display font-semibold text-lg text-white mb-1">{tool.title}</h3>
                      <p className="text-sm text-white/60">{tool.description}</p>
                    </div>
                    <div className="space-y-1.5 mb-4 text-xs flex-1">
                      <p className="text-white/40">
                        <span className="text-white/70 font-medium">Best when:</span> {tool.useWhen}
                      </p>
                      <p className="text-white/40">
                        <span className="text-white/70 font-medium">You get:</span> {tool.gives}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(tool.path) }}
                      className="w-full bg-white text-black font-semibold py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
                    >
                      Open Tool
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Stats section */}
        <div className="mt-12 glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-4">Your Usage</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">{stats.toolsUsed}</p>
              <p className="text-xs text-white/60">Tools Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">{stats.total}</p>
              <p className="text-xs text-white/60">Estimates Generated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">Free</p>
              <p className="text-xs text-white/60">Plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
