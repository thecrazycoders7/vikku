import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Check, Flag } from 'lucide-react'
import Seo from '../components/Seo'
import ToolFAQ from '../components/tools/ToolFAQ'
import { TOOL_FAQ, faqJsonLd } from '../lib/toolContent'
import { CAL_ATTRS } from '../lib/cal'
import { useAuth } from '../contexts/AuthContext'
import { TYPES, SIZE, PLATFORMS, TEAM, DESIGN, COMPLEXITY, estimateTimeline, weekDate } from '../lib/timelineModel'

const STEPS = [
  { id: 'type',       q: 'What are you building?', hint: 'Pick the closest match.' },
  { id: 'size',       q: 'How big is it?', hint: 'A rough sense of scope is fine.' },
  { id: 'platforms',  q: 'Which platforms?', hint: 'Each platform adds build time.' },
  { id: 'team',       q: 'Who’s building it?', hint: 'Team size changes how fast it moves.' },
  { id: 'design',     q: 'Do you have designs?', hint: 'No designs means a longer design phase.' },
  { id: 'complexity', q: 'Any of these involved?', hint: 'Select all that apply — skip what doesn’t.' },
]
const CHEERS = ['Nice.', 'Got it.', 'Great.', 'Perfect.', 'Last one!']
const PHASE_COLORS = ['#f59e0b', '#f97316', '#ea580c', '#c2410c', '#9a3412']

export default function TimelineTool() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const homePath = user ? '/dashboard' : '/'
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [a, setA] = useState({ type: '', size: '', platforms: [], team: '', design: '', complexity: [] })
  useEffect(() => { window.scrollTo(0, 0) }, [step, done])

  const total = STEPS.length
  const cur = STEPS[step]
  const pct = Math.round(((step + (done ? 1 : 0)) / total) * 100)
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }))
  const toggle = (k, v) => setA((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }))
  const next = () => (step < total - 1 ? setStep(step + 1) : setDone(true))
  const back = () => (done ? setDone(false) : setStep(Math.max(0, step - 1)))
  const r = useMemo(() => (done ? estimateTimeline(a) : null), [done, a])
  const canContinue = cur.id === 'type' ? !!a.type : true

  if (done && r) return <Result a={a} r={r} navigate={navigate} onEdit={() => setDone(false)} onRestart={() => { setDone(false); setStep(0); setA({ type: '', size: '', platforms: [], team: '', design: '', complexity: [] }) }} />

  const single = { type: TYPES, size: SIZE, team: TEAM, design: DESIGN }[cur.id]
  const multi = { platforms: PLATFORMS, complexity: COMPLEXITY }[cur.id]

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="Project Timeline Calculator — Vikku" description="Get a realistic, phase-by-phase project timeline with milestones and dates." canonical="/tools/timeline" jsonLd={faqJsonLd('timeline')} />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(homePath)} className="flex items-center gap-2 text-white hover:text-white/70 text-sm"><ArrowLeft size={16} /> {user ? 'Dashboard' : 'Back'}</button>
          <span className="text-xs text-white/50 font-mono">Step {step + 1} of {total}</span>
        </div>
        <div className="h-1 w-full bg-white/[0.06]"><div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: 'var(--brand-gradient)' }} /></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div key={cur.id} style={{ animation: 'tlIn .4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] mb-2">{step === 0 ? 'Plan your timeline' : CHEERS[Math.min(step - 1, CHEERS.length - 1)]}</div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-8">{cur.q}</h1>

          {single && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {single.map((o) => (
                <button key={o.key} onClick={() => { set(cur.id, o.key); setTimeout(next, 180) }}
                  className={`text-left rounded-2xl border p-4 transition-all active:scale-[0.98] ${a[cur.id] === o.key ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]'}`}>
                  {o.icon && <div className="text-2xl mb-2">{o.icon}</div>}
                  <div className="text-sm font-semibold text-white">{o.label}</div>
                  {o.hint && <div className="text-xs text-white/50 mt-1">{o.hint}</div>}
                </button>
              ))}
            </div>
          )}
          {multi && (
            <div className="flex flex-wrap gap-2.5">
              {multi.map((o) => (
                <button key={o.key} onClick={() => toggle(cur.id, o.key)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all active:scale-95 flex items-center gap-1.5 ${a[cur.id].includes(o.key) ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium' : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'}`}>
                  {a[cur.id].includes(o.key) && <Check size={13} />}{o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-10">
          <button onClick={back} disabled={step === 0} className="text-sm text-white/50 hover:text-white disabled:opacity-0 flex items-center gap-1.5"><ArrowLeft size={14} /> Back</button>
          <button onClick={next} disabled={!canContinue} className="btn-primary active:scale-95 px-7 py-3 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {step === total - 1 ? 'See my timeline' : 'Continue'} <ArrowRight size={15} />
          </button>
        </div>

        {step === 0 && <ToolFAQ content={TOOL_FAQ.timeline} />}
      </div>
      <style>{`@keyframes tlIn { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}

function Result({ r, navigate, onEdit, onRestart }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="Your Project Timeline — Vikku" description="Your project timeline." canonical="/tools/timeline" />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onEdit} className="flex items-center gap-2 text-white hover:text-white/70 text-sm"><ArrowLeft size={16} /> Edit answers</button>
          <button onClick={onRestart} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white"><RotateCcw size={13} /> Start over</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] mb-2">Your project timeline</div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-1">{r.totalMin}–{r.totalMax} weeks</h1>
        <p className="text-white/50 text-sm mb-8">Estimated end to end, including a realistic buffer. Target launch around <span className="text-white/80">{weekDate(r.totalMax)}</span>.</p>

        {/* Gantt-ish phases */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-5">Phase breakdown</h2>
          <div className="space-y-3">
            {r.phases.map((p, i) => (
              <div key={p.key}>
                <div className="flex justify-between text-sm mb-1"><span className="text-white/70">{p.label}</span><span className="text-white/40">{p.weeks}w · wk {p.startWeek}–{p.endWeek}</span></div>
                <div className="h-3 rounded-full bg-white/[0.05] relative">
                  <div className="h-full rounded-full absolute" style={{ left: `${((p.startWeek - 1) / r.scheduleWeeks) * 100}%`, width: `${(p.weeks / r.scheduleWeeks) * 100}%`, background: PHASE_COLORS[i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-4">Milestones</h2>
          <div className="space-y-3">
            {r.milestones.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <Flag size={14} className="text-[var(--brand-primary)] flex-shrink-0" />
                <span className="text-sm text-white/80 flex-1">{m.label}</span>
                <span className="text-xs text-white/40">Week {m.week} · {weekDate(m.week)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Drivers */}
        {r.drivers.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-display font-bold text-lg text-white mb-3">What’s shaping the timeline</h2>
            <ul className="space-y-2">{r.drivers.map((d) => <li key={d} className="flex items-start gap-2 text-sm text-white/60"><span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-1.5 flex-shrink-0" />{d}</li>)}</ul>
          </div>
        )}

        <div className="glass rounded-2xl p-6 mb-8">
          <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Assumptions</p>
          <ul className="space-y-1.5">{r.assumptions.map((s) => <li key={s} className="text-xs text-white/50">• {s}</li>)}</ul>
        </div>

        <div className="glass-strong rounded-2xl p-8 text-center">
          <Sparkles size={22} className="text-[var(--brand-primary)] mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-white mb-2">Want a committed delivery date?</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Book a free call and we’ll turn this into a firm plan with milestones and a fixed timeline.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button {...CAL_ATTRS} className="btn-primary active:scale-95 px-7 py-3 rounded-xl text-sm">Plan my project</button>
            <button {...CAL_ATTRS} className="px-7 py-3 rounded-xl text-sm border border-white/15 text-white hover:bg-white/5 transition-colors">Talk to a Vikku Expert</button>
          </div>
        </div>
      </div>
    </div>
  )
}
