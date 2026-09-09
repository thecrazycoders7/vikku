import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Radar, Loader2, AlertTriangle, CheckCircle, Zap, Search } from 'lucide-react'
import { checkAIVisibility } from '../lib/openaiService'
import ToolResultActions from '../components/tools/ToolResultActions'
import ToolFAQ from '../components/tools/ToolFAQ'
import ToolSocialProof from '../components/tools/ToolSocialProof'
import { saveToolResult } from '../lib/toolResultsService'
import { TOOL_FAQ, TOOL_SEO, faqJsonLd } from '../lib/toolContent'
import Seo from '../components/Seo'
import { useAuth } from '../contexts/AuthContext'

const TIPS = [
  'Fetching your page...',
  'Reading your structured data...',
  'Checking what AI crawlers can see...',
  'Scoring your AI visibility...',
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
    <svg viewBox="0 0 128 72" className="w-32 text-white">
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="10" strokeLinecap="round" />
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * arcLen} ${arcLen}`} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="currentColor" fontSize="20" fontWeight="bold">{pct}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="currentColor" fillOpacity=".4" fontSize="8">AI VISIBILITY</text>
    </svg>
  )
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
  const [tipIdx, setTipIdx] = useState(0)
  const resultRef = useRef(null)
  const tipTimer = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const normalized = normalizeUrl(url)
    if (!normalized) return setError('Please enter your website URL')
    let parsed
    try {
      parsed = new URL(normalized)
    } catch {
      return setError('Please enter a valid URL, e.g. https://example.com')
    }
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || /^(127\.|10\.|192\.168\.)/.test(host)) {
      return setError('Please enter a public website URL')
    }

    setLoading(true)
    setTipIdx(0)
    tipTimer.current = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 1800)
    try {
      const res = await checkAIVisibility(normalized)
      setResult(res)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      saveToolResult({
        tool: 'ai_visibility_score',
        title: `AI Visibility Score: ${res.score}/100 for ${(() => { try { return new URL(res.analyzedUrl || normalized).hostname } catch { return host } })()}`,
        input: { url: normalized },
        result: res,
      }).then(({ shareId }) => setShareId(shareId))
    } catch (err) {
      setError(err.message)
    } finally {
      clearInterval(tipTimer.current)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo {...TOOL_SEO.ai_visibility_score} jsonLd={faqJsonLd('ai_visibility_score')} />

      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> {user ? 'Back to Dashboard' : 'Back to Home'}
          </button>
          <h1 className="font-display font-bold text-lg text-white">AI Visibility Score</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">
                Will AI Recommend Your Business?
              </h2>
              <p className="text-white/60 text-sm max-w-xl mb-4">
                Paste your URL and in seconds we'll tell you how likely AI assistants are to find,
                understand, and recommend your business - and exactly what's blocking you.
              </p>
              <ToolSocialProof tool="ai_visibility_score" />
            </div>

            <div className="glass rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Your website URL</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="e.g. example.com"
                      className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="glass rounded-lg p-4 flex items-start gap-3 border border-red-500/20">
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> {TIPS[tipIdx]}</> : 'Check My AI Visibility'}
                </button>
              </form>
            </div>

            <ToolFAQ content={TOOL_FAQ.ai_visibility_score} />
          </>
        ) : (
          <>
            <div className="mb-10" ref={resultRef}>
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">Your AI Visibility Report</h2>
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

            {/* Blockers */}
            {result.blockers?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-6 flex items-center gap-2">
                  <Radar size={20} className="text-red-400" /> What's Blocking You
                </h3>
                <div className="space-y-4">
                  {result.blockers.map((b, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold text-white">{b.issue}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 flex-shrink-0 ${SEVERITY_STYLES[b.severity] || SEVERITY_STYLES.low}`}>
                          {b.severity || 'low'}
                        </span>
                      </div>
                      {b.why_it_matters && <p className="text-xs text-white/50 mb-1">{b.why_it_matters}</p>}
                      {b.fix && <p className="text-xs text-white/70"><span className="text-white/40">Fix: </span>{b.fix}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick wins */}
            {result.quickWins?.length > 0 && (
              <div className="glass-strong rounded-2xl p-8 mb-6 border border-yellow-500/20">
                <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-400" /> Quick Wins
                </h3>
                <ul className="space-y-3">
                  {result.quickWins.map((qw, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0 mt-2" />
                      {qw}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-400" /> Strengths
                </h3>
                <ul className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-2" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signals panel */}
            {result.signals && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-4">Signals we checked</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="glass rounded-xl p-3">
                    <p className="text-white/40 mb-1">Structured data</p>
                    <p className="text-white font-semibold">{result.signals.hasStructuredData ? (result.signals.structuredDataTypes?.join(', ') || 'Yes') : 'Not found'}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-white/40 mb-1">Word count</p>
                    <p className="text-white font-semibold">{result.signals.wordCount ?? '-'}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-white/40 mb-1">Alt-text coverage</p>
                    <p className="text-white font-semibold">{result.signals.altTextCoveragePercent ?? '-'}%</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-white/40 mb-1">Meta description</p>
                    <p className="text-white font-semibold">{result.signals.metaDescriptionPresent ? 'Present' : 'Missing'}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-white/40 mb-1">AI crawlers blocked</p>
                    <p className="text-white font-semibold">{result.signals.aiCrawlersBlocked ? (result.signals.blockedCrawlers?.join(', ') || 'Yes') : 'No'}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-white/40 mb-1">llms.txt</p>
                    <p className="text-white font-semibold">{result.signals.llmsTxtPresent ? 'Found' : 'Not found'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="font-display font-semibold text-xl text-white mb-3">
                Want help fixing what AI can't see?
              </h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Let's fix the blockers and get your business showing up where customers are asking. Free consultation, no commitment.
              </p>
              <button
                onClick={() => { navigate('/'); setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 300) }}
                className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Get a Free Consultation
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-5">
              <button
                onClick={() => { setResult(null); setError('') }}
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
              >
                ↺ Check a different URL
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
