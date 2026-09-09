import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import { trackCaseStudyView } from '../utils/analytics'
import { ArrowLeft, CheckCircle2, MessageSquare, Globe, TrendingUp, Users, Star, Megaphone } from 'lucide-react'

const problems = [
  'No website - entire business ran through WhatsApp messages',
  'Potential clients had no way to discover the agency online',
  'No portfolio to showcase past campaigns and results',
  'Every lead came through personal referrals only',
  'Hard to appear credible or professional without a web presence',
  'Lost clients to competitors who had polished agency websites',
]

const solution = [
  { icon: Globe,        title: 'Agency Website',       desc: 'A clean, professional website showcasing services, portfolio, and agency story.' },
  { icon: Star,         title: 'Portfolio Showcase',   desc: 'Gallery of past campaigns, brand work, and client results to build credibility.' },
  { icon: Megaphone,    title: 'Services Pages',       desc: 'Dedicated pages for each service - digital ads, branding, social media, and SEO.' },
  { icon: Users,        title: 'About & Team Page',    desc: 'Agency story, team profiles, and values to build trust with prospective clients.' },
  { icon: MessageSquare,title: 'Lead Capture Forms',   desc: 'Contact form and WhatsApp CTA integrated so enquiries flow in automatically.' },
  { icon: TrendingUp,   title: 'SEO Foundation',       desc: 'On-page SEO setup so the agency ranks for local marketing agency searches.' },
]

const results = [
  'Leads increased 4x within months of launch',
  'Clients now find Rolex Ads on Google - no referral needed',
  'Portfolio gives instant credibility to cold prospects',
  'WhatsApp enquiries now come from the website, not cold outreach',
  'Professional online presence opened doors to larger clients',
  'Agency now visible across search, social shares, and direct visits',
]

export default function CaseStudyRolexAds() {
  const navigate = useNavigate()

  usePageMeta({
    title:       'Rolex Ads - 4x More Leads with a New Agency Website - Vikku Case Study',
    description: 'How Vikku built a professional agency website for Rolex Ads, taking them from WhatsApp-only referrals to 4x more inbound leads with a full online presence.',
    url:         'https://vikku.in/work/rolex-ads',
  })
  useEffect(() => { window.scrollTo(0, 0); trackCaseStudyView('rolex-ads', 'Rolex Ads') }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white hover:text-white transition-colors text-sm">
            <ArrowLeft size={14} /> Back to Vikku
          </button>
          <span className="text-xs text-white font-mono">Case Study 03</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-tag">Marketing Agency</span>
            <span className="section-tag">Online Visibility</span>
          </div>
          <h1 className="font-display font-extrabold text-white mb-6 leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            From WhatsApp DMs<br />
            <span className="text-white">to 4x More Leads</span>
          </h1>
          <p className="text-white text-base leading-relaxed max-w-2xl">
            Rolex Ads was a growing marketing agency running entirely on WhatsApp referrals - no website, no online presence. We built them a professional agency site that now generates 4x the leads they had before.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: 'Client',    value: 'Rolex Ads' },
              { label: 'Industry',  value: 'Marketing & Advertising' },
              { label: 'Timeline',  value: '5 weeks' },
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
          <p className="text-white text-sm mb-8">A capable agency invisible to anyone who didn't already know them personally.</p>
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
          <p className="text-white text-sm mb-8">A full agency website built to convert visitors into enquiries.</p>
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
          <p className="text-white text-sm mb-8">The website became the agency's best-performing sales tool.</p>
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
            <p className="text-sm text-white">rolexads.in</p>
          </div>
          <a href="https://www.rolexads.in" target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm px-5 py-2.5 rounded-xl">Visit Site</a>
        </div>

        <div className="glass rounded-xl p-8 text-center">
          <h3 className="font-display font-bold text-lg text-white mb-3">Running on referrals only?</h3>
          <p className="text-white text-sm mb-6 max-w-sm mx-auto">Let us build you a website that works as your 24/7 salesperson.</p>
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
