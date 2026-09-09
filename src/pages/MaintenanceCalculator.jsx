import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench, AlertTriangle, Lightbulb, Loader2, ShieldAlert } from 'lucide-react'
import { estimateMaintenance } from '../lib/openaiService'
import LeadCaptureModal from '../components/LeadCaptureModal'
import ToolResultActions from '../components/tools/ToolResultActions'
import ToolFAQ from '../components/tools/ToolFAQ'
import ToolSocialProof from '../components/tools/ToolSocialProof'
import GatedDetails from '../components/tools/GatedDetails'
import { saveToolResult } from '../lib/toolResultsService'
import { TOOL_FAQ, TOOL_SEO, faqJsonLd } from '../lib/toolContent'
import Seo from '../components/Seo'
import { useAuth } from '../contexts/AuthContext'

function formatCurrency(amount, symbol) {
  return (symbol || '₹') + new Intl.NumberFormat('en-IN').format(amount)
}

const PRODUCT_TYPES = [
  'Business / Portfolio Website',
  'E-Commerce Store',
  'SaaS Web Application',
  'Mobile App (iOS + Android)',
  'Admin Dashboard / Internal Tool',
  'Marketplace Platform',
  'Booking / Scheduling System',
  'API / Backend Service',
  'AI-Powered Application',
  'Staffing / HR Platform',
]

const COMPLEXITY_OPTIONS = [
  { label: 'Simple - under 10 pages/screens', value: 'Simple (under 10 pages or screens, minimal integrations)' },
  { label: 'Medium - 10-30 pages, some integrations', value: 'Medium (10-30 screens, a few third-party integrations)' },
  { label: 'Complex - 30+ screens, many integrations', value: 'Complex (30+ screens, multiple integrations, custom logic)' },
  { label: 'Enterprise - very large or mission-critical', value: 'Enterprise (very large, mission-critical, complex architecture)' },
]

const SCALE_OPTIONS = [
  { label: 'Pre-launch / under 100 users', value: 'Pre-launch or under 100 users' },
  { label: 'Growing - 100 to 5,000 users', value: 'Growing (100 to 5,000 active users)' },
  { label: 'Established - 5k to 50k users', value: 'Established (5,000 to 50,000 users)' },
  { label: 'Large - 50k+ users', value: 'Large scale (50,000+ users, high availability required)' },
]

const SUPPORT_OPTIONS = [
  { label: 'Basic - bug fixes only', value: 'Basic (bug fixes only, no SLA)' },
  { label: 'Standard - bugs + minor features', value: 'Standard (bug fixes + minor feature updates, ~5 business day response)' },
  { label: 'Professional - dedicated support', value: 'Professional (dedicated support, same-day response, monthly retainer)' },
  { label: 'Enterprise - 24/7 SLA', value: 'Enterprise (24/7 on-call, strict SLA, multiple environments)' },
]

const TEAM_OPTIONS = [
  { label: 'Yes - in-house devs', value: 'Yes - has in-house developers' },
  { label: 'Partial - limited dev capacity', value: 'Partial - small or non-technical team, limited capacity' },
  { label: 'No - fully outsourced', value: 'No - fully outsourced to an agency or freelancers' },
]

export default function MaintenanceCalculator() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    productType: '',
    complexity: '',
    scale: '',
    supportLevel: '',
    hasTeam: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [shareId, setShareId] = useState(null)
  const [showLead, setShowLead] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)
  const resultRef = useRef(null)

  const TIPS = [
    'Estimating support costs...',
    'Checking vendor rates...',
    'Calculating hosting & infra...',
    'Building your estimate...',
  ]

  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 1800)
    return () => clearInterval(t)
  }, [loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.productType) return setError('Please select a product type')
    if (!form.complexity) return setError('Please select the complexity level')
    if (!form.scale) return setError('Please select your active user scale')
    if (!form.supportLevel) return setError('Please select a support level')
    if (!form.hasTeam) return setError('Please tell us about your dev team situation')
    setLoading(true)
    try {
      const res = await estimateMaintenance(form)
      setResult(res)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      setUnlocked(false)
      if (user) setUnlocked(true)
      else setShowLead(true)
      saveToolResult({
        tool: 'maintenance_calculator',
        title: `${res.currencySymbol || '₹'}${(res.monthlyCostMin || 0).toLocaleString('en-IN')}–${(res.monthlyCostMax || 0).toLocaleString('en-IN')}/mo maintenance`,
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
      <Seo {...TOOL_SEO.maintenance_calculator} jsonLd={faqJsonLd('maintenance_calculator')} />
      <LeadCaptureModal open={showLead} onClose={() => setShowLead(false)} source="maintenance_calculator" shareId={shareId} onUnlock={() => setUnlocked(true)} />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(user ? '/dashboard' : '/')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> {user ? 'Back to Dashboard' : 'Back to Home'}
          </button>
          <h1 className="font-display font-bold text-lg text-white">Maintenance Cost Calculator</h1>
          <div className="w-36" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">How Much Does It Cost to Maintain Your Product?</h2>
              <p className="text-white/60 text-sm max-w-xl mb-4">
                Get a realistic monthly maintenance budget - hosting, monitoring, bug fixes, security patches, and support hours.
              </p>
              <ToolSocialProof tool="maintenance_calculator" />
            </div>

            <div className="glass rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">What type of product are you maintaining?</label>
                  <select
                    value={form.productType}
                    onChange={e => setForm(f => ({ ...f, productType: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-white bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-black">Select product type...</option>
                    {PRODUCT_TYPES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Complexity / size?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COMPLEXITY_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setForm(f => ({ ...f, complexity: opt.value }))}
                        className={`glass rounded-xl px-4 py-3 text-sm text-left transition-all ${form.complexity === opt.value ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Active users / scale?</label>
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
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Support level expected?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUPPORT_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setForm(f => ({ ...f, supportLevel: opt.value }))}
                        className={`glass rounded-xl px-4 py-3 text-sm text-left transition-all ${form.supportLevel === opt.value ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Do you have an in-house dev team?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {TEAM_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setForm(f => ({ ...f, hasTeam: opt.value }))}
                        className={`glass rounded-xl px-4 py-3 text-xs text-left transition-all ${form.hasTeam === opt.value ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'}`}
                      >{opt.label}</button>
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
                  {loading ? <><Loader2 size={18} className="animate-spin" /> {TIPS[tipIdx]}</> : 'Get My Maintenance Estimate'}
                </button>
              </form>
            </div>

            <ToolFAQ content={TOOL_FAQ.maintenance_calculator} />
          </>
        ) : (
          <>
            <div className="mb-10" ref={resultRef}>
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">Your Maintenance Cost Estimate</h2>
            </div>

            <ToolResultActions shareId={shareId} tool="maintenance_calculator" navigate={navigate} result={result} title="Maintenance cost estimate" />

            {/* Monthly cost summary */}
            <div className="glass-strong rounded-2xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center flex-shrink-0">
                  <Wrench size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Estimated Monthly Cost</p>
                  <p className="text-2xl font-display font-bold text-white mt-0.5">
                    {formatCurrency(result.monthlyCostMin, result.currencySymbol)} – {formatCurrency(result.monthlyCostMax, result.currencySymbol)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap text-sm">
                <div>
                  <span className="text-white/40 text-xs">Annual estimate: </span>
                  <span className="text-white/80 font-semibold">
                    {formatCurrency(result.annualCostMin, result.currencySymbol)} – {formatCurrency(result.annualCostMax, result.currencySymbol)}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 text-xs">Currency: </span>
                  <span className="text-white/80">{result.currency}</span>
                </div>
              </div>
            </div>

            {/* Cost breakdown - always visible */}
            {result.breakdown?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-6">Cost Breakdown</h3>
                <div className="space-y-3">
                  {result.breakdown.map((item, i) => (
                    <div key={i} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white mb-0.5">{item.category}</p>
                        <p className="text-xs text-white/50 truncate">{item.description}</p>
                      </div>
                      <p className="text-sm font-semibold text-white flex-shrink-0">
                        {formatCurrency(item.costMin, result.currencySymbol)} – {formatCurrency(item.costMax, result.currencySymbol)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-white/30 text-center mt-2 mb-6">AI-generated estimate. Actual maintenance costs vary by team, vendor rates, and support model.</p>

            <GatedDetails unlocked={unlocked} onUnlock={() => setShowLead(true)}>

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-5 flex items-center gap-2">
                  <Lightbulb size={18} className="text-yellow-400" /> Recommendations
                </h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0 mt-2" />{rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks of skipping */}
            {result.risksOfSkipping?.length > 0 && (
              <div className="glass rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-400" /> Risks of Skipping Maintenance
                </h3>
                <ul className="space-y-2">
                  {result.risksOfSkipping.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />{risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </GatedDetails>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="font-display font-semibold text-lg text-white mb-3">Need help maintaining your product?</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                We offer flexible monthly retainers - bug fixes, updates, monitoring, and peace of mind.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate('/dashboard/cost-estimator')}
                  className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors text-sm"
                >
                  Estimate a New Build
                </button>
                <button
                  onClick={() => { navigate('/'); setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 300) }}
                  className="glass text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  Talk to Us
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-5">
              <button onClick={() => { setResult(null); setError('') }}
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
              >
                ↺ Refine &amp; regenerate
              </button>
              <button onClick={() => { setResult(null); setForm({ productType: '', complexity: '', scale: '', supportLevel: '', hasTeam: '' }); setError('') }}
                className="text-white/50 hover:text-white transition-colors text-sm"
              >
                Different product
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
