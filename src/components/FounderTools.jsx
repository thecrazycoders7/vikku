import { useNavigate } from 'react-router-dom'
import { DollarSign, Clock, LayoutDashboard, TrendingUp, Kanban, ArrowRight, Sparkles, Wrench } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const TOOLS = [
  {
    icon: Kanban,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    name: 'PM Tool',
    tagline: 'Stop losing track of what needs to get done',
    desc: 'Kanban board, milestones, team collaboration, and AI project planner - all in one place. Built for founders, not enterprise teams.',
    cta: 'Open PM Tool',
    path: '/pm',
    badge: 'Most used',
  },
  {
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    name: 'AI Cost Estimator',
    tagline: 'Know the cost before you commit',
    desc: 'Describe your idea and get a detailed cost breakdown - development, design, infra - in minutes. No guesswork.',
    cta: 'Estimate your idea',
    path: '/dashboard/cost-estimator',
  },
  {
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    name: 'ROI Calculator',
    tagline: 'See how much you\'re leaving on the table',
    desc: 'Calculate the revenue impact of going digital versus staying offline. Present the numbers to stakeholders with confidence.',
    cta: 'Calculate ROI',
    path: '/dashboard/roi-calculator',
  },
  {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    name: 'Timeline Calculator',
    tagline: 'Get a realistic timeline, not a sales pitch',
    desc: 'Phase-by-phase breakdown - discovery, design, dev, testing, launch. Know what to expect before the project starts.',
    cta: 'Plan your timeline',
    path: '/dashboard/timeline-calculator',
  },
  {
    icon: LayoutDashboard,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    name: 'Tech Stack Recommender',
    tagline: 'Skip the "what tech should I use?" debate',
    desc: 'Describe your product and an AI architect picks the best tech stack - frontend, backend, database, hosting - with reasoning.',
    cta: 'Get a recommendation',
    path: '/dashboard/tech-recommender',
  },
  {
    icon: Wrench,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    name: 'Maintenance Calculator',
    tagline: 'Know what it costs to keep your product alive',
    desc: 'Get a monthly maintenance budget - hosting, monitoring, bug fixes, security patches, and support hours. No surprises.',
    cta: 'Estimate maintenance cost',
    path: '/dashboard/maintenance-calculator',
  },
]

export default function FounderTools() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <section id="tools" className="py-24 px-6 bg-black relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 mb-5">
            <Sparkles size={12} className="text-violet-400" />
            <span className="text-[11px] font-semibold text-white/50 tracking-wide uppercase">Free Tools for Founders</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight mb-4">
            Still figuring out what to build?<br />
            <span className="text-white/40">We made tools for exactly that.</span>
          </h2>
          <p className="text-white/50 text-sm max-w-xl leading-relaxed">
            Before you hire a dev or spend a rupee - use these to validate your idea, estimate costs, plan timelines, and manage your build.
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.name}
                onClick={() => navigate(tool.path)}
                className="group relative bg-white/[0.03] border border-white/[0.07] hover:border-white/15 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:bg-white/[0.05] flex flex-col"
              >
                {tool.badge && (
                  <span className="absolute top-4 right-4 text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {tool.badge}
                  </span>
                )}

                <div className={`w-9 h-9 rounded-xl ${tool.bg} flex items-center justify-center mb-4 flex-shrink-0`}>
                  <Icon size={17} className={tool.color} />
                </div>

                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">{tool.name}</p>
                <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{tool.tagline}</h3>
                <p className="text-xs text-white/40 leading-relaxed flex-1">{tool.desc}</p>

                <div className="flex items-center gap-1 mt-4 text-[11px] font-semibold text-white/40 group-hover:text-white/70 transition-colors">
                  {tool.cta}
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            )
          })}

          {/* Sign up CTA card */}
          <div
            onClick={() => navigate('/signup')}
            className="group bg-white hover:bg-white/90 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-semibold text-black/40 uppercase tracking-wider mb-2">Get started free</p>
              <h3 className="text-sm font-bold text-black leading-snug mb-2">
                All tools. Free account.<br />No credit card.
              </h3>
              <p className="text-xs text-black/50 leading-relaxed">
                Sign up and get instant access to every tool - plus the PM tool to manage your projects once you're ready to build.
              </p>
            </div>
            <div className="flex items-center gap-1 mt-4 text-[11px] font-bold text-black/60 group-hover:text-black transition-colors">
              Create free account
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
