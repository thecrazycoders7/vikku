import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import { trackCaseStudyView } from '../utils/analytics'
import { ArrowLeft, CheckCircle2, BarChart2, Globe, Users, FileText, TrendingUp, Briefcase } from 'lucide-react'

const problems = [
  'Digital marketing agency with zero online presence and zero inbound leads',
  'No website meant no credibility when pitching to potential clients',
  'All outreach was cold - no warm leads, no discovery traffic',
  'Difficult to explain service offerings without a portfolio page',
  'Prospects had nowhere to go to learn about the agency before a call',
  'Business was stagnant - revenue capped by personal network size',
]

const solution = [
  { icon: Globe,      title: 'Agency Website',        desc: 'Professional website presenting the agency, services, and past results clearly.' },
  { icon: Briefcase,  title: 'Services Breakdown',    desc: 'Dedicated sections for each offering - SEO, paid ads, content, and social media management.' },
  { icon: BarChart2,  title: 'Results & Case Studies',desc: 'Real numbers and outcomes from past campaigns displayed to build instant trust.' },
  { icon: FileText,   title: 'Lead Capture System',   desc: 'Contact form with project type and budget fields to qualify leads before the first call.' },
  { icon: Users,      title: 'Client Testimonials',   desc: 'Social proof section with client quotes and company names to convert hesitant visitors.' },
  { icon: TrendingUp, title: 'SEO & Discoverability', desc: 'On-page SEO and Google Business Profile setup for local digital marketing searches.' },
]

const results = [
  'Closed 6+ new clients within months of the website going live',
  'Inbound leads started flowing in - no more cold outreach only',
  'Website acts as a 24/7 pitch deck for the agency',
  'Credibility established - prospects come pre-sold from the site',
  'Revenue no longer capped by personal referral network',
  'Agency now positioned to scale beyond the founder\'s network',
]

export default function CaseStudyMediaManager() {
  const navigate = useNavigate()

  usePageMeta({
    title:       'Media Manager 4U - From Zero Leads to 6 Closed Clients - Vikku Case Study',
    description: 'How Vikku built a lead-generation website for Media Manager 4U, a digital marketing agency that had no online presence and went on to close 6+ new clients after launch.',
    url:         'https://vikku.in/work/media-manager',
  })
  useEffect(() => { window.scrollTo(0, 0); trackCaseStudyView('media-manager', 'Media Manager 4U') }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white hover:text-white transition-colors text-sm">
            <ArrowLeft size={14} /> Back to Vikku
          </button>
          <span className="text-xs text-white font-mono">Case Study 04</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-tag">Digital Marketing</span>
            <span className="section-tag">Lead Generation</span>
          </div>
          <h1 className="font-display font-extrabold text-white mb-6 leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Zero Leads to<br />
            <span className="text-white">6 Closed Clients</span>
          </h1>
          <p className="text-white text-base leading-relaxed max-w-2xl">
            Media Manager 4U was a digital marketing agency with strong skills but no online presence. No website meant no leads. After launching their new site, they closed over 6 clients in a matter of months.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: 'Client',    value: 'Media Manager 4U' },
              { label: 'Industry',  value: 'Digital Marketing' },
              { label: 'Timeline',  value: '4 weeks' },
              { label: 'Stack',     value: 'React · Tailwind · Node.js' },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-xl p-4">
                <p className="text-[10px] text-white uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm text-white font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">The Problem</h2>
          <p className="text-white text-sm mb-8">Skilled team, no pipeline. No website meant no trust, no discovery, no growth.</p>
          <div className="glass rounded-xl p-6 space-y-4">
            {problems.map((p) => (
              <div key={p} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/40 mt-2 flex-shrink-0" />
                <p className="text-white text-sm leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">What We Built</h2>
          <p className="text-white text-sm mb-8">A lead-generation-first website designed to convert visitors into paying clients.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {solution.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-xl p-5 flex gap-4 hover:border-white/15 transition-all">
                <div className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-white mb-1">{title}</p>
                  <p className="text-xs text-white leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">The Results</h2>
          <p className="text-white text-sm mb-8">The website unlocked a growth channel that didn't exist before.</p>
          <div className="glass rounded-xl p-6 space-y-4">
            {results.map((r) => (
              <div key={r} className="flex items-start gap-3">
                <CheckCircle2 size={14} className="text-emerald-400/60 mt-0.5 flex-shrink-0" />
                <p className="text-white text-sm leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-5 flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] text-white uppercase tracking-wider mb-1">Live Website</p>
            <p className="text-sm text-white">mediamanager4u.com</p>
          </div>
          <a href="https://www.mediamanager4u.com/#/" target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm px-5 py-2.5 rounded-xl">Visit Site</a>
        </div>

        <div className="glass rounded-xl p-8 text-center">
          <h3 className="font-display font-bold text-lg text-white mb-3">Struggling to get leads online?</h3>
          <p className="text-white text-sm mb-6 max-w-sm mx-auto">A well-built website is your most consistent lead source. Let us build yours.</p>
          <button
            onClick={() => { navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100) }}
            className="btn-primary active:scale-95 px-8 py-3 rounded-xl text-sm"
          >
            Start a Conversation
          </button>
        </div>
      </div>
    </div>
  )
}
