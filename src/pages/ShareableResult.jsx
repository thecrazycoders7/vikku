import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight, Download, Loader2 } from 'lucide-react'
import { getToolResultByShareId, TOOL_LABELS } from '../lib/toolResultsService'
import { downloadResultPdf } from '../lib/pdfGenerator'

const money = (n, sym = '₹') => `${sym}${Number(n || 0).toLocaleString('en-IN')}`

function Section({ title, children }) {
  return (
    <div className="glass rounded-2xl p-6 mb-4">
      <h3 className="font-display font-semibold text-base text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

function renderResult(tool, r) {
  const sym = r.currencySymbol || '₹'
  const bullets = (items, key) => (
    <ul className="space-y-2">
      {(items || []).map((i, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0 mt-2" />
          {typeof i === 'string' ? i : (i[key] || i.benefit || i.category || i.name || JSON.stringify(i))}
        </li>
      ))}
    </ul>
  )

  if (tool === 'cost_estimator') {
    return (
      <>
        <Section title="Estimate">
          <p className="text-3xl font-bold text-white">{money(r.totalCostMin, sym)} – {money(r.totalCostMax, sym)}</p>
          <p className="text-sm text-white/50 mt-2">Timeline: {r.timeline} · Complexity: {r.complexity}</p>
        </Section>
        {r.breakdown?.length > 0 && (
          <Section title="Cost breakdown">
            <div className="space-y-3">
              {r.breakdown.map((b, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/70">{b.category}</span>
                  <span className="text-white">{money(b.costMin, sym)} – {money(b.costMax, sym)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
        {r.recommendations?.length > 0 && <Section title="Recommendations">{bullets(r.recommendations)}</Section>}
        {r.risks?.length > 0 && <Section title="Potential risks">{bullets(r.risks)}</Section>}
      </>
    )
  }
  if (tool === 'roi_calculator') {
    return (
      <>
        <Section title="Revenue impact">
          <div className="grid sm:grid-cols-3 gap-4">
            <div><p className="text-xs text-white/50">Lost / month</p><p className="text-2xl font-bold text-red-400">{money(r.monthlyRevenueLost, sym)}</p></div>
            <div><p className="text-xs text-white/50">Lost / year</p><p className="text-2xl font-bold text-orange-400">{money(r.annualRevenueLost, sym)}</p></div>
            <div><p className="text-xs text-white/50">Annual ROI</p><p className="text-2xl font-bold text-green-400">{r.roiPercent}%</p></div>
          </div>
          <p className="text-sm text-white/50 mt-3">Payback period: {r.paybackPeriodMonths} months</p>
        </Section>
        {r.keyInsights?.length > 0 && <Section title="Key insights">{bullets(r.keyInsights)}</Section>}
      </>
    )
  }
  if (tool === 'timeline_calculator') {
    return (
      <>
        <Section title="Timeline">
          <p className="text-2xl font-bold text-white">
            {r.totalWeeksMin != null ? `${r.totalWeeksMin}–${r.totalWeeksMax} weeks` : (r.totalDuration || r.timeline)}
          </p>
        </Section>
        {r.phases?.length > 0 && (
          <Section title="Phase breakdown">
            <div className="space-y-3">
              {r.phases.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/70">{p.name || p.phase}</span>
                  <span className="text-white/50">{p.weeksMin != null ? `${p.weeksMin}–${p.weeksMax} wks` : p.duration}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </>
    )
  }
  if (tool === 'tech_recommender') {
    const s = r.recommendedStack || {}
    const rowsArr = [
      ['Frontend', s.frontend], ['Backend', s.backend], ['Database', s.database], ['Hosting', s.hosting],
    ].filter(([, v]) => v)
    return (
      <>
        <Section title="Recommended stack">
          <div className="space-y-3">
            {rowsArr.map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-white/50">{k}</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
          </div>
          {r.whyThisStack && <p className="text-sm text-white/60 mt-4 leading-relaxed">{r.whyThisStack}</p>}
        </Section>
        {r.warnings?.length > 0 && <Section title="Watch out for">{bullets(r.warnings)}</Section>}
      </>
    )
  }
  if (tool === 'maintenance_calculator') {
    return (
      <>
        <Section title="Monthly maintenance cost">
          <p className="text-3xl font-bold text-white">{money(r.monthlyCostMin, sym)} – {money(r.monthlyCostMax, sym)}</p>
          <p className="text-sm text-white/50 mt-2">Annual: {money(r.annualCostMin, sym)} – {money(r.annualCostMax, sym)}</p>
        </Section>
        {r.breakdown?.length > 0 && (
          <Section title="Cost breakdown">
            <div className="space-y-3">
              {r.breakdown.map((b, i) => (
                <div key={i} className="flex justify-between text-sm gap-4">
                  <span className="text-white/70">{b.category}</span>
                  <span className="text-white flex-shrink-0">{money(b.costMin, sym)} – {money(b.costMax, sym)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
        {r.recommendations?.length > 0 && <Section title="Recommendations">{bullets(r.recommendations)}</Section>}
        {r.risksOfSkipping?.length > 0 && <Section title="Risks of skipping maintenance">{bullets(r.risksOfSkipping)}</Section>}
      </>
    )
  }
  if (tool === 'ai_visibility_score') {
    const sevColor = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-white/40' }
    return (
      <>
        <Section title="AI Visibility Score">
          <p className="text-3xl font-bold text-white">{r.score}/100</p>
          {r.verdict && <p className="text-sm text-white/70 mt-2">{r.verdict}</p>}
          {r.summary && <p className="text-sm text-white/50 mt-2 leading-relaxed">{r.summary}</p>}
        </Section>
        {r.blockers?.length > 0 && (
          <Section title="Blockers">
            <div className="space-y-4">
              {r.blockers.map((b, i) => (
                <div key={i}>
                  <p className="text-sm text-white/80">
                    <span className={`font-semibold ${sevColor[b.severity] || 'text-white/40'}`}>[{b.severity || 'low'}]</span>{' '}
                    {b.issue}
                  </p>
                  {b.fix && <p className="text-xs text-white/50 mt-1">Fix: {b.fix}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
        {r.strengths?.length > 0 && <Section title="Strengths">{bullets(r.strengths)}</Section>}
        {r.quickWins?.length > 0 && <Section title="Quick wins">{bullets(r.quickWins)}</Section>}
      </>
    )
  }
  return <Section title="Result"><pre className="text-xs text-white/60 whitespace-pre-wrap">{JSON.stringify(r, null, 2)}</pre></Section>
}

export default function ShareableResult() {
  const { shareId } = useParams()
  const navigate = useNavigate()
  const [row, setRow] = useState(undefined) // undefined = loading, null = not found

  useEffect(() => {
    getToolResultByShareId(shareId).then(setRow)
  }, [shareId])

  if (row === undefined) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white/40" /></div>
  }
  if (!row) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
        <p className="text-white/60 mb-4">This result could not be found.</p>
        <button onClick={() => navigate('/')} className="text-sm bg-white text-black px-5 py-2.5 rounded-xl font-semibold">Back to vikku.in</button>
      </div>
    )
  }

  const label = TOOL_LABELS[row.tool] || 'Result'

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4 print:hidden">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="font-display font-bold text-lg">vikku</a>
          <button onClick={() => downloadResultPdf({ tool: row.tool, title: row.title, result: row.result || {} }).catch(() => window.print())} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">{label}</p>
        <h1 className="font-display font-extrabold text-3xl mb-8">{row.title || label}</h1>

        {renderResult(row.tool, row.result || {})}

        <div className="glass-strong rounded-2xl p-8 text-center mt-8 print:hidden">
          <h3 className="font-display font-semibold text-lg mb-3">Want this built - for a fixed price?</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Vikku designs and ships software, websites, and apps. Book a free 30-min scoping call and we'll turn this into a fixed-price plan.</p>
          <button onClick={() => { navigate('/'); setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 300) }} className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors inline-flex items-center gap-2">
            Book a free scoping call <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
