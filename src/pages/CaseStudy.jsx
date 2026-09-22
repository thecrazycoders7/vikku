import { useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import { trackCaseStudyView } from '../utils/analytics'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { CASE_STUDIES } from '../lib/caseStudies'
import { CAL_ATTRS } from '../lib/cal'

// Shared, data-driven case study page. One entry per client in
// src/lib/caseStudies.js, routed at /work/:slug.
export default function CaseStudy() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const cs = CASE_STUDIES[slug]

  usePageMeta({
    title:       cs ? `${cs.name} — Vikku Case Study` : 'Case Study — Vikku',
    description: cs ? cs.intro : 'Vikku case study.',
    url:         `https://vikku.in/work/${slug}`,
  })
  useEffect(() => {
    window.scrollTo(0, 0)
    if (cs) trackCaseStudyView(slug, cs.name)
  }, [slug, cs])

  if (!cs) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white hover:text-white transition-colors text-sm">
            <ArrowLeft size={14} /> Back to Vikku
          </button>
          <span className="text-xs text-white font-mono">Case Study</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">
        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {cs.tags.map((t) => <span key={t} className="section-tag">{t}</span>)}
          </div>
          <h1 className="font-display font-extrabold text-white mb-6 leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            {cs.heroTop}<br />
            <span className="gradient-text">{cs.heroBottom}</span>
          </h1>
          <p className="text-white text-base leading-relaxed max-w-2xl">{cs.intro}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: 'Client',   value: cs.name },
              { label: 'Industry', value: cs.industry },
              { label: 'Timeline', value: cs.timeline },
              { label: 'Stack',    value: cs.stack },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-xl p-4">
                <p className="text-[10px] text-white uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm text-white font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Screenshot */}
        {cs.image && (
          <div className="mb-14 glass rounded-2xl overflow-hidden">
            <img src={cs.image} alt={cs.name} className="w-full object-cover" />
          </div>
        )}

        {/* Problem */}
        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">The Problem</h2>
          <p className="text-white text-sm mb-8">{cs.problemSub}</p>
          <div className="glass rounded-xl p-6 space-y-4">
            {cs.problems.map((p) => (
              <div key={p} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/40 mt-2 flex-shrink-0" />
                <p className="text-white text-sm leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What we built */}
        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">What We Built</h2>
          <p className="text-white text-sm mb-8">{cs.solutionSub}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {cs.solution.map(({ icon: Icon, title, desc }) => (
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

        {/* Results */}
        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">The Results</h2>
          <p className="text-white text-sm mb-8">{cs.resultsSub}</p>
          <div className="glass rounded-xl p-6 space-y-4">
            {cs.results.map((r) => (
              <div key={r} className="flex items-start gap-3">
                <CheckCircle2 size={14} className="text-emerald-400/60 mt-0.5 flex-shrink-0" />
                <p className="text-white text-sm leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live site */}
        <div className="glass rounded-xl p-5 flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] text-white uppercase tracking-wider mb-1">Live Website</p>
            <p className="text-sm text-white">{cs.liveDomain}</p>
          </div>
          <a href={cs.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm px-5 py-2.5 rounded-xl">Visit Site</a>
        </div>

        {/* CTA */}
        <div className="glass rounded-xl p-8 text-center">
          <h3 className="font-display font-bold text-lg text-white mb-3">{cs.ctaHeading}</h3>
          <p className="text-white text-sm mb-6 max-w-sm mx-auto">{cs.ctaSub}</p>
          <button {...CAL_ATTRS} className="btn-primary active:scale-95 px-8 py-3 rounded-xl text-sm">
            Book a Call
          </button>
        </div>
      </div>
    </div>
  )
}
