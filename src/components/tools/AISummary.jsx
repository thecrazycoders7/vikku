import { useState } from 'react'
import { Sparkles, Loader2, Check } from 'lucide-react'
import { generateSummary } from '../../lib/openaiService'

// AI "CFO" narrative over a deterministic model result. GPT explains the
// numbers it's given; it never recomputes them. `kind` is 'estimate' | 'impact'.
export default function AISummary({ kind, data }) {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  const run = async () => {
    setState('loading'); setError('')
    try {
      const res = await generateSummary(kind, data)
      setSummary(res)
      setState('done')
    } catch (e) {
      setError(e.message || 'Could not generate summary')
      setState('error')
    }
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={18} className="text-[var(--brand-primary)]" />
        <h2 className="font-display font-bold text-lg text-white">AI executive summary</h2>
      </div>

      {state === 'idle' && (
        <>
          <p className="text-white/50 text-sm mb-5">Turn this into a stakeholder-ready summary — the biggest driver, the key risk, and a recommended next step.</p>
          <button onClick={run} className="btn-primary active:scale-95 px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
            <Sparkles size={15} /> Generate summary
          </button>
        </>
      )}

      {state === 'loading' && (
        <div className="flex items-center gap-3 text-white/60 text-sm py-2"><Loader2 size={18} className="animate-spin text-[var(--brand-primary)]" /> Writing your summary…</div>
      )}

      {state === 'error' && (
        <div>
          <p className="text-sm text-red-400 mb-3">Couldn’t generate the summary right now. {error}</p>
          <button onClick={run} className="text-sm text-white/70 hover:text-white underline underline-offset-2">Try again</button>
        </div>
      )}

      {state === 'done' && summary && (
        <div>
          {summary.executiveSummary && <p className="text-white/80 text-sm leading-relaxed mb-5">{summary.executiveSummary}</p>}
          {summary.points?.length > 0 && (
            <div className="space-y-3 mb-5">
              {summary.points.map((p) => (
                <div key={p.title} className="glass rounded-xl p-4">
                  <p className="text-sm font-semibold text-white mb-0.5">{p.title}</p>
                  <p className="text-xs text-white/60 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          )}
          {summary.recommendation && (
            <div className="flex items-start gap-2 text-sm">
              <Check size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-white/80"><span className="text-white/40">Recommended next step: </span>{summary.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
