import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Radar, Loader2, AlertTriangle, CheckCircle, Zap, Search, ArrowRight, Check } from 'lucide-react'
import { checkAIVisibility } from '../lib/openaiService'
import ToolResultActions from '../components/tools/ToolResultActions'
import ToolFAQ from '../components/tools/ToolFAQ'
import ToolSocialProof from '../components/tools/ToolSocialProof'
import { saveToolResult } from '../lib/toolResultsService'
import { TOOL_FAQ, TOOL_SEO, faqJsonLd } from '../lib/toolContent'
import Seo from '../components/Seo'
import { useAuth } from '../contexts/AuthContext'
import { CAL_ATTRS } from '../lib/cal'

// Staged progress — makes the analysis feel like real work is happening.
const STAGES = [
  'Checking website structure',
  'Reading key pages',
  'Checking AI crawler access',
  'Understanding your content',
  'Testing AI visibility',
  'Analyzing citations',
  'Generating recommendations',
]

const REPORT_INCLUDES = [
  { big: '0–100', label: 'AI Visibility Score' },
  { big: 'Signals', label: 'What AI can & can’t see' },
  { big: 'Blockers', label: 'Ranked by impact' },
  { big: 'Fixes', label: 'Plain-English, actionable' },
]

const METHODOLOGY = [
  { label: 'AI crawler access', weight: 25 },
  { label: 'Structured data', weight: 20 },
  { label: 'Content depth & clarity', weight: 20 },
  { label: 'Metadata & alt text', weight: 20 },
  { label: 'Discoverability (llms.txt, sitemap)', weight: 15 },
]

const SEVERITY_STYLES = {
  high:   'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low:    'bg-white/5 text-white/40 border-white/10',
}

function ScoreGauge({ score }) {
  const pct = Math.min(Math.max(score || 0, 0), 100)
  const r = 54, cx = 64, cy = 64
  const arcLen = Math.PI * r
  const color = pct >= 70 ? '#4ade80' : pct >= 40 ? '#facc15' : '#f87171'
  return (
    <svg viewBox="0 0 128 72" className="w-40 text-white">
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="10" strokeLinecap="round" />
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * arcLen} ${arcLen}`} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="currentColor" fontSize="20" fontWeight="bold">{pct}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="currentColor" fillOpacity=".4" fontSize="8">AI VISIBILITY</text>
    </svg>
  )
}

// Derive readiness dimensions from the on-page signals we collect.
function deriveDimensions(signals) {
  if (!signals) return []
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)))
  const crawler = signals.aiCrawlersBlocked ? 25 : 100
  const structured = signals.hasStructuredData ? 90 : 35
  const content = clamp((signals.wordCount || 0) / 8) // ~800 words → 100
  const meta = clamp((signals.metaDescriptionPresent ? 50 : 0) + (signals.altTextCoveragePercent || 0) / 2)
  const discover = signals.llmsTxtPresent ? 100 : 55
  return [
    { label: 'AI crawler access', value: crawler },
    { label: 'Structured data', value: structured },
    { label: 'Content depth', value: content },
    { label: 'Metadata & alt text', value: meta },
    { label: 'Discoverability', value: discover },
  ]
}

function normalizeUrl(raw) {
  let v = raw.trim()
  if (!v) return ''
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`
  return v
}

export default function AIVisibilityScore() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [shareId, setShareId] = useState(null)
  const [stage, setStage] = useState(0)
  const resultRef = useRef(null)
  const stageTimer = useRef(null)

  useEffect(() => () => clearInterval(stageTimer.current), [])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')

    const normalized = normalizeUrl(url)
    if (!normalized) return setError('Please enter your website URL')
    let parsed
    try { parsed = new URL(normalized) } catch { return setError('Please enter a valid URL, e.g. https://example.com') }
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || /^(127\.|10\.|192\.168\.)/.test(host)) return setError('Please enter a public website URL')

    setLoading(true)
    setStage(0)
    // Advance the stage checklist, holding on the last step until the result lands.
    stageTimer.current = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 2)), 1100)
    try {
      const res = await checkAIVisibility(normalized)
      clearInterval(stageTimer.current)
      setStage(STAGES.length - 1)
      setResult(res)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      saveToolResult({
        tool: 'ai_visibility_score',
        title: `AI Visibility Score: ${res.score}/100 for ${(() => { try { return new URL(res.analyzedUrl || normalized).hostname } catch { return host } })()}`,
        input: { url: normalized },
        result: res,
      }).then(({ shareId }) => setShareId(shareId))
    } catch (err) {
      setError(err.message)
    } finally {
      clearInterval(stageTimer.current)
      setLoading(false)
    }
  }

  const dimensions = result ? deriveDimensions(result.signals) : []

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo {...TOOL_SEO.ai_visibility_score} jsonLd={faqJsonLd('ai_visibility_score')} />

      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(user ? '/dashboard' : '/')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> {user ? 'Back to Dashboard' : 'Back to Home'}
          </button>
          <h1 className="font-display font-bold text-lg text-white">AI Visibility Score</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!result ? (
          <>
            {/* HERO — input above the fold */}
            <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] mb-3">AI Visibility Score</p>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4 leading-tight">
                  Is AI recommending your business?
                </h2>
                <p className="text-white/60 text-base leading-relaxed mb-6">
                  See how AI assistants understand, mention, and recommend your brand — and exactly what to improve.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full glass rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                  {error && (
                    <div className="glass rounded-lg p-3 flex items-start gap-2 border border-red-500/20">
                      <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full btn-primary py-3.5 rounded-xl active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing…</> : <>Check My AI Visibility <ArrowRight size={16} /></>}
                  </button>
                </form>
                <p className="text-xs text-white/40 mt-3">Free • ~60-second analysis • No credit card</p>
                <p className="text-[11px] text-white/30 mt-1.5 flex items-center gap-1.5">🔒 We only analyze publicly accessible information.</p>
                <div className="mt-4"><ToolSocialProof tool="ai_visibility_score" /></div>
              </div>

              <img src="/tools/visibility.png" alt="AI Visibility Score" className="w-full rounded-2xl border border-white/[0.06] hidden lg:block" />
            </div>

            {/* Progress experience */}
            {loading && (
              <div className="glass-strong rounded-2xl p-6 sm:p-8 mb-14 max-w-xl mx-auto">
                <p className="text-sm text-white/60 mb-4">Analyzing <span className="text-white font-medium">{normalizeUrl(url).replace(/^https?:\/\//, '')}</span></p>
                <ul className="space-y-2.5">
                  {STAGES.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 text-sm">
                      {i < stage ? <Check size={16} className="text-emerald-400 flex-shrink-0" />
                        : i === stage ? <Loader2 size={16} className="text-[var(--brand-primary)] animate-spin flex-shrink-0" />
                        : <span className="w-4 h-4 rounded-full border border-white/15 flex-shrink-0" />}
                      <span className={i <= stage ? 'text-white' : 'text-white/35'}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What you'll get */}
            {!loading && (
              <>
                <div className="mb-14">
                  <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-5">Your report includes</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {REPORT_INCLUDES.map((r) => (
                      <div key={r.label} className="glass rounded-2xl p-5 text-center">
                        <p className="font-display font-extrabold text-2xl text-[var(--brand-primary)] mb-1">{r.big}</p>
                        <p className="text-xs text-white/60">{r.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why this matters */}
                <div className="glass rounded-2xl p-6 sm:p-8 mb-14 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3">Why this matters</p>
                  <h3 className="font-display font-bold text-xl text-white mb-2">Your customers are asking AI about your industry</h3>
                  <p className="text-sm text-white/60 max-w-xl mx-auto mb-4">When they ask ChatGPT, Gemini, or Perplexity for the best company in your space — does your brand show up, and does AI describe it correctly?</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Copilot'].map((n) => (
                      <span key={n} className="text-xs px-3 py-1 rounded-full bg-white/[0.05] text-white/60">{n}</span>
                    ))}
                  </div>
                </div>

                {/* Methodology */}
                <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
                  <h3 className="font-display font-bold text-lg text-white mb-1">How we calculate your score</h3>
                  <p className="text-white/50 text-sm mb-5">Based on the evidence collected during this audit of your public pages.</p>
                  <div className="space-y-3">
                    {METHODOLOGY.map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-sm mb-1"><span className="text-white/70">{m.label}</span><span className="text-white/50">{m.weight}%</span></div>
                        <div className="h-1.5 rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: `${m.weight * 4}%`, background: 'var(--brand-gradient)' }} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                <ToolFAQ content={TOOL_FAQ.ai_visibility_score} />
              </>
            )}
          </>
        ) : (
          <>
            <div className="mb-8" ref={resultRef}>
              <h2 className="font-display font-extrabold text-3xl text-white mb-1">Your AI Visibility Report</h2>
              {result.analyzedUrl && <p className="text-sm text-white/40">{(() => { try { return new URL(result.analyzedUrl).hostname } catch { return '' } })()}</p>}
            </div>

            <ToolResultActions shareId={shareId} tool="ai_visibility_score" navigate={navigate} result={result} title="AI Visibility Score" />

            {/* Score + verdict */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="glass-strong rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center md:col-span-1">
                <ScoreGauge score={result.score} />
              </div>
              <div className="glass-strong rounded-2xl p-6 border border-white/10 md:col-span-2">
                <p className="text-lg font-semibold text-white mb-2">{result.verdict}</p>
                <p className="text-sm text-white/60 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Dimension breakdown (derived from on-page signals) */}
            {dimensions.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-1">AI-readiness breakdown</h3>
                <p className="text-white/50 text-xs mb-5">Derived from the on-page signals AI systems rely on.</p>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                  {dimensions.map((d) => {
                    const color = d.value >= 70 ? '#4ade80' : d.value >= 40 ? '#facc15' : '#f87171'
                    return (
                      <div key={d.label}>
                        <div className="flex justify-between text-sm mb-1"><span className="text-white/70">{d.label}</span><span className="text-white font-medium">{d.value}</span></div>
                        <div className="h-1.5 rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: `${d.value}%`, background: color }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Fix these first (blockers) */}
            {result.blockers?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-1 flex items-center gap-2">
                  <Radar size={20} className="text-red-400" /> Fix these first
                </h3>
                <p className="text-white/50 text-xs mb-6">Ranked by impact on how AI finds and understands you.</p>
                <div className="space-y-4">
                  {result.blockers.map((b, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold text-white"><span className="text-white/30 font-mono mr-2">{String(i + 1).padStart(2, '0')}</span>{b.issue}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 flex-shrink-0 ${SEVERITY_STYLES[b.severity] || SEVERITY_STYLES.low}`}>
                          {b.severity || 'low'}
                        </span>
                      </div>
                      {b.why_it_matters && <p className="text-xs text-white/50 mb-1 sm:pl-7">{b.why_it_matters}</p>}
                      {b.fix && <p className="text-xs text-white/70 sm:pl-7"><span className="text-white/40">What to do: </span>{b.fix}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick wins */}
            {result.quickWins?.length > 0 && (
              <div className="glass-strong rounded-2xl p-8 mb-6 border border-yellow-500/20">
                <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-400" /> Quick Wins</h3>
                <ul className="space-y-3">
                  {result.quickWins.map((qw, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/80"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0 mt-2" />{qw}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-green-400" /> Strengths</h3>
                <ul className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/80"><span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-2" />{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signals panel */}
            {result.signals && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-4">What AI can see on your page</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <Signal label="Structured data" value={result.signals.hasStructuredData ? (result.signals.structuredDataTypes?.join(', ') || 'Yes') : 'Not found'} />
                  <Signal label="Word count" value={result.signals.wordCount ?? '-'} />
                  <Signal label="Alt-text coverage" value={`${result.signals.altTextCoveragePercent ?? '-'}%`} />
                  <Signal label="Meta description" value={result.signals.metaDescriptionPresent ? 'Present' : 'Missing'} />
                  <Signal label="AI crawlers blocked" value={result.signals.aiCrawlersBlocked ? (result.signals.blockedCrawlers?.join(', ') || 'Yes') : 'No'} />
                  <Signal label="llms.txt" value={result.signals.llmsTxtPresent ? 'Found' : 'Not found'} />
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="font-display font-semibold text-xl text-white mb-3">Want help fixing what AI can’t see?</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Let’s fix the blockers and get your business showing up where customers are asking. Free consultation, no commitment.</p>
              <button {...CAL_ATTRS} className="btn-primary px-8 py-3 rounded-xl">Get a Free Consultation</button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-5">
              <button onClick={() => { setResult(null); setError(''); setUrl('') }} className="text-white hover:text-white/80 transition-colors text-sm font-medium">↺ Check a different URL</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Signal({ label, value }) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-white/40 mb-1">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  )
}
