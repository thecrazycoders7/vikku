import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react'
import { estimateProjectCost } from '../lib/openaiService'
import LeadCaptureModal from '../components/LeadCaptureModal'
import ToolResultActions from '../components/tools/ToolResultActions'
import ToolFAQ from '../components/tools/ToolFAQ'
import ToolSocialProof from '../components/tools/ToolSocialProof'
import GatedDetails from '../components/tools/GatedDetails'
import { saveToolResult } from '../lib/toolResultsService'
import { COST_PRESETS, TOOL_FAQ, TOOL_SEO, faqJsonLd } from '../lib/toolContent'
import Seo from '../components/Seo'
import { useAuth } from '../contexts/AuthContext'

function formatCurrency(amount, symbol) {
  return (symbol || '₹') + new Intl.NumberFormat('en-IN').format(amount)
}

function Tip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center ml-1 cursor-pointer" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="text-white/30 text-[10px] border border-white/20 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</span>
      {show && <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 text-[10px] text-white/70 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 z-10 shadow-xl pointer-events-none">{text}</span>}
    </span>
  )
}

export default function CostEstimator() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [shareId, setShareId] = useState(null)
  const [showLead, setShowLead] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)
  const resultRef = useRef(null)

  const TIPS = [
    'Analyzing your requirements...',
    'Checking market rates...',
    'Calculating team costs...',
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
    setResult(null)
    setShareId(null)
    setUnlocked(false)

    if (!requirements.trim()) return

    setLoading(true)
    try {
      const estimate = await estimateProjectCost(requirements, null)
      setResult(estimate)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      // Logged-in users see everything; anonymous users unlock the detail with email.
      if (user) setUnlocked(true)
      else setShowLead(true)
      saveToolResult({
        tool: 'cost_estimator',
        title: `${estimate.currencySymbol || '₹'}${(estimate.totalCostMin || 0).toLocaleString('en-IN')}–${(estimate.totalCostMax || 0).toLocaleString('en-IN')} estimate`,
        input: { requirements },
        result: estimate,
      }).then(({ shareId }) => setShareId(shareId))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo {...TOOL_SEO.cost_estimator} jsonLd={faqJsonLd('cost_estimator')} />
      <LeadCaptureModal open={showLead} onClose={() => setShowLead(false)} source="cost_estimator" shareId={shareId} onUnlock={() => setUnlocked(true)} />
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> {user ? 'Back to Dashboard' : 'Back to Home'}
          </button>
          <h1 className="font-display font-bold text-lg text-white">AI Cost Estimator</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">Estimate Your Project Cost</h2>
              <p className="text-white/60 text-sm max-w-xl mb-4">
                Describe your project requirements and get an AI-powered cost estimate with detailed breakdown.
              </p>
              <ToolSocialProof tool="cost_estimator" />
            </div>

            <div className="glass rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs text-white/40 self-center mr-1">Try:</span>
                    {COST_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setRequirements(p.text)}
                        className="text-xs px-3 py-1.5 rounded-lg glass text-white/60 hover:text-white transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors min-h-[200px] resize-none"
                    placeholder="Describe your project - type of app, key features, tech needs, design complexity..."
                    required
                  />
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> {TIPS[tipIdx]}</>
                  ) : (
                    'Generate Estimate'
                  )}
                </button>
              </form>
            </div>

            <ToolFAQ content={TOOL_FAQ.cost_estimator} />
          </>
        ) : (
          <>
            <div className="mb-10" ref={resultRef}>
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">Cost Estimate</h2>
              <p className="text-white/60 text-sm max-w-xl">
                Based on your requirements, here's a detailed cost breakdown for your project.
              </p>
            </div>

            <ToolResultActions shareId={shareId} tool="cost_estimator" navigate={navigate} result={result} title="Project cost estimate" />

            {/* Total Cost Card */}
            <div className="glass-strong rounded-2xl p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider flex items-center">Estimated Cost <Tip text="Range based on your project description. Lower end = lean team/simpler execution. Upper end = senior developers, more polish." /></p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(result.totalCostMin, result.currencySymbol)} – {formatCurrency(result.totalCostMax, result.currencySymbol)}
                  </p>
                  {result.currency && result.currency !== 'INR' && (
                    <p className="text-xs text-white/40 mt-1">{result.currency}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Timeline</p>
                  <p className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock size={18} /> {result.timeline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Complexity:</span>
                <span className={`text-xs font-semibold ${
                  result.complexity === 'Low' ? 'text-green-400' :
                  result.complexity === 'Medium' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {result.complexity}
                </span>
              </div>
            </div>

            <p className="text-xs text-white/30 text-center mt-2 mb-6">AI-generated estimate, not a quote. Actual costs depend on vendor, team location, and scope.</p>

            <GatedDetails unlocked={unlocked} onUnlock={() => setShowLead(true)}>
            {/* Breakdown */}
            <div className="glass rounded-2xl p-8 mb-6">
              <h3 className="font-display font-semibold text-lg text-white mb-6">Cost Breakdown</h3>
              <div className="space-y-4">
                {result.breakdown.map((item, index) => {
                  const pct = Math.round((item.costMax / result.totalCostMax) * 100)
                  return (
                    <div key={index} className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white text-sm">{item.category}</h4>
                        <p className="text-sm text-white font-medium">
                          {formatCurrency(item.costMin, result.currencySymbol)} – {formatCurrency(item.costMax, result.currencySymbol)}
                        </p>
                      </div>
                      <p className="text-xs text-white/60">{item.description}</p>
                      <div className="mt-2 h-1 rounded-full bg-white/[0.08] overflow-hidden">
                        <div className="h-full rounded-full bg-white/40 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass rounded-2xl p-8 mb-6">
              <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-400" /> Recommendations
              </h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0 mt-2" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="glass rounded-2xl p-8 mb-6">
              <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-orange-400" /> Potential Risks
              </h3>
              <ul className="space-y-3">
                {result.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0 mt-2" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            </GatedDetails>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="font-display font-semibold text-lg text-white mb-3">Want this built - for a fixed price?</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Book a free 30-minute scoping call and we'll turn this estimate into a fixed-price proposal with scope, timeline, and deliverables.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => { navigate('/'); setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 300) }}
                  className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors"
                >
                  Book a free scoping call
                </button>
                <button
                  onClick={() => {
                    if (!user) { navigate('/signup?from=cost-estimator'); return }
                    navigate('/pm/new', {
                      state: {
                        fromEstimate: {
                          name: requirements.slice(0, 60) || 'New Project',
                          description: requirements,
                          budget: `${result.currencySymbol || '₹'}${(result.totalCostMin || 0).toLocaleString('en-IN')}–${(result.totalCostMax || 0).toLocaleString('en-IN')}`,
                          phases: result.breakdown?.map((b, i) => ({ title: b.category, daysFromNow: (i + 1) * 14 })) || [],
                        }
                      }
                    })
                  }}
                  className="glass text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  Create PM Project from this estimate
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-5">
              <button
                onClick={() => { setResult(null); setError('') }}
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
              >
                ↺ Refine &amp; regenerate
              </button>
              <button
                onClick={() => { setResult(null); setRequirements(''); setError('') }}
                className="text-white/50 hover:text-white transition-colors text-sm"
              >
                Start over
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
