import { useState } from 'react'
import { Mail, Link2, Download, Check, ArrowRight, Loader2, MessageCircle } from 'lucide-react'
import { emailToolResult, TOOL_LABELS } from '../../lib/toolResultsService'
import { downloadResultPdf } from '../../lib/pdfGenerator'

const CROSS_TOOL = {
  cost_estimator:         { to: '/tools/timeline-calculator',     label: 'See the timeline for this' },
  timeline_calculator:    { to: '/tools/tech-recommender',        label: 'Get tech stack recommendation' },
  tech_recommender:       { to: '/tools/maintenance-calculator',  label: 'Estimate maintenance cost' },
  maintenance_calculator: { to: '/tools/cost-estimator',          label: 'Estimate a rebuild cost' },
  roi_calculator:         { to: '/tools/ai-visibility-score',     label: 'Check your AI visibility' },
  ai_visibility_score:    { to: '/tools/cost-estimator',          label: 'Estimate the cost to fix this' },
}

/**
 * Shared actions shown under any tool result:
 * email the result, copy a shareable link, download as PDF, and a cross-tool next step.
 */
export default function ToolResultActions({ shareId, tool, navigate, result, title }) {
  const [emailing, setEmailing]   = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [email, setEmail]         = useState('')
  const [sent, setSent]           = useState(false)
  const [copied, setCopied]       = useState(false)
  const [err, setErr]             = useState('')
  const [pdfing, setPdfing]       = useState(false)

  const downloadPdf = async () => {
    if (!result) { window.print(); return }
    setPdfing(true)
    try { await downloadResultPdf({ tool, title, result }) }
    catch { window.print() }
    finally { setPdfing(false) }
  }

  const shareUrl = shareId ? `${window.location.origin}/r/${shareId}` : ''
  const cross = CROSS_TOOL[tool]
  const waText = encodeURIComponent(`My ${TOOL_LABELS[tool] || 'result'} from Vikku: ${shareUrl}`)
  const waUrl = `https://wa.me/?text=${waText}`

  const copyLink = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const sendEmail = async (e) => {
    e.preventDefault()
    if (!email.includes('@') || !shareId) return
    setEmailing(true); setErr('')
    try {
      await emailToolResult({ shareId, email: email.trim(), tool })
      setSent(true)
    } catch (e2) {
      setErr(e2.message || 'Failed to send')
    } finally {
      setEmailing(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-5 mb-6 print:hidden">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
        <button
          onClick={() => setEmailOpen((o) => !o)}
          className="flex items-center gap-2 text-sm glass rounded-xl px-4 py-2.5 text-white/80 hover:text-white transition-colors"
        >
          <Mail size={14} /> Email me this
        </button>
        <button
          onClick={copyLink}
          disabled={!shareId}
          className="flex items-center gap-2 text-sm glass rounded-xl px-4 py-2.5 text-white/80 hover:text-white transition-colors disabled:opacity-40"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Link2 size={14} />}
          {copied ? 'Link copied' : 'Copy share link'}
        </button>
        <a
          href={shareId ? waUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!shareId}
          className={`flex items-center gap-2 text-sm glass rounded-xl px-4 py-2.5 text-white/80 hover:text-white transition-colors ${!shareId ? 'opacity-40 pointer-events-none' : ''}`}
        >
          <MessageCircle size={14} className="text-green-400" /> WhatsApp
        </a>
        <button
          onClick={downloadPdf}
          disabled={pdfing}
          className="flex items-center gap-2 text-sm glass rounded-xl px-4 py-2.5 text-white/80 hover:text-white transition-colors disabled:opacity-50"
        >
          {pdfing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download PDF
        </button>
        {cross && (
          <button
            onClick={() => navigate(cross.to)}
            className="col-span-2 sm:col-span-1 sm:ml-auto flex items-center gap-2 text-sm bg-white/10 hover:bg-white/15 rounded-xl px-4 py-2.5 text-white transition-colors justify-center sm:justify-start"
          >
            {cross.label} <ArrowRight size={14} />
          </button>
        )}
      </div>

      {emailOpen && !sent && (
        <form onSubmit={sendEmail} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={emailing}
            className="flex items-center justify-center gap-2 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {emailing ? <Loader2 size={15} className="animate-spin" /> : 'Send'}
          </button>
        </form>
      )}
      {sent && <p className="mt-3 text-sm text-green-400 flex items-center gap-2"><Check size={14} /> Sent! Check your inbox.</p>}
      {err && <p className="mt-2 text-xs text-red-400">{err}</p>}

      {shareId && (
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-white/70">Want an exact quote from Vikku?</p>
            <p className="text-xs text-white/30 mt-0.5">We build exactly this kind of project. Free 30-min scoping call.</p>
          </div>
          <a
            href={`mailto:connect@vikku.in?subject=Project%20Quote%20Request&body=Hi%20Vikku%20team%2C%0A%0AI%20used%20your%20${encodeURIComponent(TOOL_LABELS[tool] || 'AI tool')}%20and%20would%20like%20an%20exact%20quote.%0A%0AEstimate%20link%3A%20${encodeURIComponent(shareId ? `${window.location.origin}/r/${shareId}` : '')}`}
            className="flex-shrink-0 flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/90 transition-colors"
          >
            Get a quote <ArrowRight size={12} />
          </a>
        </div>
      )}
    </div>
  )
}
