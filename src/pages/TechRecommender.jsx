import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutDashboard, Loader2, AlertTriangle, ExternalLink, AlertCircle } from 'lucide-react'
import { recommendStack } from '../lib/openaiService'
import LeadCaptureModal from '../components/LeadCaptureModal'
import ToolResultActions from '../components/tools/ToolResultActions'
import ToolFAQ from '../components/tools/ToolFAQ'
import ToolSocialProof from '../components/tools/ToolSocialProof'
import GatedDetails from '../components/tools/GatedDetails'
import { saveToolResult } from '../lib/toolResultsService'
import { TOOL_FAQ, TOOL_SEO, faqJsonLd } from '../lib/toolContent'
import Seo from '../components/Seo'
import { useAuth } from '../contexts/AuthContext'

const PROJECT_TYPES = [
  'Business / Portfolio Website',
  'E-Commerce Store',
  'SaaS Web Application',
  'Staffing / HR Platform',
  'Booking / Scheduling System',
  'Admin Dashboard / Internal Tool',
  'Marketplace (multiple sellers)',
  'Mobile App (iOS + Android)',
  'API / Backend Service',
  'AI-Powered Application',
]

const SCALE_OPTIONS = [
  { label: 'MVP - under 100 users', value: 'MVP (under 100 users, validate the idea fast)' },
  { label: 'Small - up to 1,000 users', value: 'Small scale (up to 1,000 users)' },
  { label: 'Medium - up to 50,000 users', value: 'Medium scale (up to 50,000 users)' },
  { label: 'Large - 100,000+ users', value: 'Large scale (100,000+ users, needs to be highly scalable)' },
]

const BUDGET_OPTIONS = [
  { label: 'Under ₹50,000 / $600', value: 'Very low budget (under ₹50k / $600)' },
  { label: '₹50k–₹2L / $600–$2,500', value: 'Low budget (₹50k–₹2L / $600–$2,500)' },
  { label: '₹2L–₹10L / $2,500–$12k', value: 'Medium budget (₹2L–₹10L / $2,500–$12k)' },
  { label: '₹10L+ / $12k+', value: 'High budget (₹10L+ / $12k+)' },
]

const REQUIREMENTS = [
  'SEO-critical (must rank on Google)',
  'Real-time features (chat, live updates)',
  'Payment processing',
  'Mobile app alongside web',
  'Admin panel / CMS',
  'AI / ML features',
  'Third-party integrations (CRMs, APIs)',
  'Offline support (PWA)',
  'Multi-language / internationalization',
  'High security / compliance (HIPAA, etc.)',
]

export default function TechRecommender() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    projectType: '',
    scale: '',
    budget: '',
    hasDevTeam: '',
    requirements: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [shareId, setShareId] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [showLead, setShowLead] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)
  const resultRef = useRef(null)

  const TIPS = [
    'Evaluating your requirements...',
    'Comparing tech stacks...',
    'Checking team fit...',
    'Finalizing recommendation...',
  ]

  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 1800)
    return () => clearInterval(t)
  }, [loading])


  const toggleReq = (req) => {
    setForm(f => ({
      ...f,
      requirements: f.requirements.includes(req)
        ? f.requirements.filter(r => r !== req)
        : [...f.requirements, req],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.projectType) return setError('Please select what you are building')
    if (!form.scale) return setError('Please select expected scale')
    if (!form.budget) return setError('Please select a budget range')
    if (!form.hasDevTeam) return setError('Please tell us about your development team')
    setLoading(true)
    try {
      const res = await recommendStack(form)
      setResult(res)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      setUnlocked(false)
      if (user) setUnlocked(true)
      else setShowLead(true)
      saveToolResult({
        tool: 'tech_recommender',
        title: [res.recommendedStack?.frontend, res.recommendedStack?.backend, res.recommendedStack?.database].filter(Boolean).join(' · ') || 'Tech stack',
        input: form,
        result: res,
      }).then(({ shareId }) => setShareId(shareId))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo {...TOOL_SEO.tech_recommender} jsonLd={faqJsonLd('tech_recommender')} />
      <LeadCaptureModal open={showLead} onClose={() => setShowLead(false)} source="tech_recommender" shareId={shareId} onUnlock={() => setUnlocked(true)} />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(user ? '/dashboard' : '/')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> {user ? 'Back to Dashboard' : 'Back to Home'}
          </button>
          <h1 className="font-display font-bold text-lg text-white">Tech Stack Recommender</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">What Tech Should You Build With?</h2>
              <p className="text-white/60 text-sm max-w-xl mb-4">
                Get an AI architect's recommendation for the best tech stack - with reasoning, costs, and tradeoffs.
              </p>
              <ToolSocialProof tool="tech_recommender" />
            </div>

            <div className="glass rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">What are you building?</label>
                  <select
                    value={form.projectType}
                    onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-white bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-black">Select project type...</option>
                    {PROJECT_TYPES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Expected scale?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SCALE_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setForm(f => ({ ...f, scale: opt.value }))}
                        className={`glass rounded-xl px-4 py-3 text-sm text-left transition-all ${form.scale === opt.value ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Budget range?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {BUDGET_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setForm(f => ({ ...f, budget: opt.value }))}
                        className={`glass rounded-xl px-4 py-3 text-sm text-left transition-all ${form.budget === opt.value ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Do you have an in-house development team?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { label: 'Yes - senior devs', value: 'Yes - experienced senior developers' },
                      { label: 'Partial - junior devs', value: 'Partial - junior developers who need guidance' },
                      { label: 'No - outsourcing fully', value: 'No - fully outsourcing to an agency' },
                    ].map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setForm(f => ({ ...f, hasDevTeam: opt.value }))}
                        className={`glass rounded-xl px-4 py-3 text-xs text-left transition-all ${form.hasDevTeam === opt.value ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Key requirements (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {REQUIREMENTS.map(req => (
                      <button key={req} type="button" onClick={() => toggleReq(req)}
                        className={`text-xs px-3 py-2 rounded-lg glass transition-all ${form.requirements.includes(req) ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'}`}
                      >{req}</button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="glass rounded-lg p-4 flex items-start gap-3 border border-red-500/20">
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-400">{error}</p>
                      <button onClick={() => handleSubmit({ preventDefault: () => {} })} className="text-xs text-white/60 hover:text-white mt-1 underline">Try again</button>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> {TIPS[tipIdx]}</> : 'Get My Recommendation'}
                </button>
              </form>
            </div>

            <ToolFAQ content={TOOL_FAQ.tech_recommender} />
          </>
        ) : (
          <>
            <div className="mb-10" ref={resultRef}>
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">Your Tech Stack Recommendation</h2>
            </div>

            <ToolResultActions shareId={shareId} tool="tech_recommender" navigate={navigate} result={result} title="Recommended tech stack" />

            {/* Stack overview */}
            <div className="glass-strong rounded-2xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Recommended Stack</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {result.recommendedStack?.frontend} · {result.recommendedStack?.backend} · {result.recommendedStack?.database}
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{result.whyThisStack}</p>
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div>
                  <span className="text-xs text-white/40">Hosting: </span>
                  <span className="text-xs text-white/70">{result.recommendedStack?.hosting}</span>
                </div>
                <div>
                  <span className="text-xs text-white/40">Monthly infra cost: </span>
                  <span className="text-xs text-white/70">{result.totalMonthlyCost}</span>
                </div>
              </div>
              {result.recommendedStack?.extras?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.recommendedStack.extras.map((e, i) => (
                    <span key={i} className="text-[10px] glass px-2 py-1 rounded-md text-white/50">{e}</span>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-white/30 text-center mt-2 mb-6">AI-generated recommendation. Final choice should factor in your team's existing skills and infrastructure.</p>

            <GatedDetails unlocked={unlocked} onUnlock={() => setShowLead(true)}>
            {/* Technology breakdown */}
            {result.technologies?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-6">Technology Breakdown</h3>
                <div className="space-y-4">
                  {result.technologies.map((tech, i) => (
                    <div key={i} className="glass rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-white text-sm">{tech.name}</span>
                          <span className="text-xs text-white/40 ml-2">{tech.role}</span>
                        </div>
                        <span className="text-xs text-white/50">{tech.monthlyCost}</span>
                      </div>
                      <p className="text-xs text-white/60 mb-3">{tech.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        {tech.pros?.map((p, j) => (
                          <span key={j} className="text-[10px] text-green-400 glass px-2 py-1 rounded-md">+ {p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative */}
            {result.alternativeStack && (
              <div className="glass rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                  <ExternalLink size={16} className="text-white/40" /> Alternative: {result.alternativeStack.name}
                </h3>
                <p className="text-sm text-white/60 mb-1"><span className="text-white/40">Stack: </span>{result.alternativeStack.stack}</p>
                <p className="text-xs text-white/50"><span className="text-white/40">Choose this when: </span>{result.alternativeStack.whenToChoose}</p>
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div className="glass rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                  <AlertCircle size={16} className="text-orange-400" /> Watch Out For
                </h3>
                <ul className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0 mt-2" />{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </GatedDetails>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="font-display font-semibold text-lg text-white mb-3">Want us to build it with this stack?</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                We specialize in exactly these technologies. Let's talk about your project.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate('/dashboard/cost-estimator')}
                  className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors text-sm"
                >
                  Get Cost Estimate
                </button>
                <button
                  onClick={() => { navigate('/'); setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 300) }}
                  className="glass text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  Start a Project
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-5">
              <button onClick={() => { setResult(null); setError('') }}
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
              >
                ↺ Refine &amp; regenerate
              </button>
              <button onClick={() => { setResult(null); setForm({ projectType: '', scale: '', budget: '', hasDevTeam: '', requirements: [] }); setError('') }}
                className="text-white/50 hover:text-white transition-colors text-sm"
              >
                Different project
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
