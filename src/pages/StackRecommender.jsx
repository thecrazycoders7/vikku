import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Check, Layers } from 'lucide-react'
import Seo from '../components/Seo'
import { CAL_ATTRS } from '../lib/cal'
import { useAuth } from '../contexts/AuthContext'
import { Q, Q_ORDER, recommend } from '../lib/techStack'

const CHEERS = ['Nice.', 'Got it.', 'Great.', 'Perfect.', 'Almost there!', 'Last one!']

export default function StackRecommender() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const homePath = user ? '/dashboard' : '/'
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [a, setA] = useState({ type: '', platforms: [], priority: '', scale: '', realtime: '', ai: '', team: '' })

  useEffect(() => { window.scrollTo(0, 0) }, [step, done])

  const total = Q_ORDER.length
  const key = Q_ORDER[step]
  const def = Q[key]
  const pct = Math.round(((step + (done ? 1 : 0)) / total) * 100)

  const set = (v) => setA((p) => ({ ...p, [key]: v }))
  const toggle = (v) => setA((p) => ({ ...p, [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v] }))
  const next = () => (step < total - 1 ? setStep(step + 1) : setDone(true))
  const back = () => (done ? setDone(false) : setStep(Math.max(0, step - 1)))

  const rec = useMemo(() => (done ? recommend(a) : null), [done, a])
  const canContinue = def.multi ? true : !!a[key]

  if (done && rec) return <Result a={a} rec={rec} navigate={navigate} onEdit={() => setDone(false)} onRestart={() => { setDone(false); setStep(0); setA({ type: '', platforms: [], priority: '', scale: '', realtime: '', ai: '', team: '' }) }} />

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="Tech Stack Recommender — Vikku" description="Answer a few questions and get an opinionated, reasoned tech stack for your project — frontend, backend, database, hosting and more." url="https://vikku.in/tools/tech-recommender" />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(homePath)} className="flex items-center gap-2 text-white hover:text-white/70 text-sm"><ArrowLeft size={16} /> {user ? 'Dashboard' : 'Back'}</button>
          <span className="text-xs text-white/50 font-mono">Step {step + 1} of {total}</span>
        </div>
        <div className="h-1 w-full bg-white/[0.06]"><div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: 'var(--brand-gradient)' }} /></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div key={key} style={{ animation: 'stkIn .4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] mb-2">
            {step === 0 ? 'Let’s find your stack' : CHEERS[Math.min(step - 1, CHEERS.length - 1)]}
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-8">{def.q}</h1>

          {def.multi ? (
            <div className="flex flex-wrap gap-2.5">
              {def.options.map((o) => (
                <button key={o.key} onClick={() => toggle(o.key)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all active:scale-95 flex items-center gap-1.5 ${a[key].includes(o.key) ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium' : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'}`}>
                  {a[key].includes(o.key) && <Check size={13} />}{o.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {def.options.map((o) => (
                <button key={o.key} onClick={() => { set(o.key); setTimeout(next, 180) }}
                  className={`text-left rounded-2xl border p-4 transition-all active:scale-[0.98] ${a[key] === o.key ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]'}`}>
                  {o.icon && <div className="text-2xl mb-2">{o.icon}</div>}
                  <div className="text-sm font-semibold text-white">{o.label}</div>
                  {o.hint && <div className="text-xs text-white/50 mt-1">{o.hint}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-10">
          <button onClick={back} disabled={step === 0} className="text-sm text-white/50 hover:text-white disabled:opacity-0 flex items-center gap-1.5"><ArrowLeft size={14} /> Back</button>
          <button onClick={next} disabled={!canContinue} className="btn-primary active:scale-95 px-7 py-3 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {step === total - 1 ? 'See my stack' : 'Continue'} <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <style>{`@keyframes stkIn { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}

function Result({ rec, navigate, onEdit, onRestart }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="Your Recommended Stack — Vikku" description="Your recommended tech stack." url="https://vikku.in/tools/tech-recommender" />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onEdit} className="flex items-center gap-2 text-white hover:text-white/70 text-sm"><ArrowLeft size={16} /> Edit answers</button>
          <button onClick={onRestart} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white"><RotateCcw size={13} /> Start over</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] mb-2">Your recommended stack</div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-2">Built for how you want to build</h1>
        <p className="text-white/50 text-sm mb-8">An opinionated starting point with the reasoning behind each choice — and solid alternatives.</p>

        <div className="space-y-3 mb-8">
          {rec.layers.map((l) => (
            <div key={l.layer} className="glass rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 sm:w-24 flex-shrink-0">{l.layer}</span>
                <h3 className="font-display font-bold text-white text-lg">{l.name}</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-3 sm:pl-[7.5rem]">{l.reason}</p>
              {l.alternatives.length > 0 && (
                <div className="flex flex-wrap gap-2 sm:pl-[7.5rem]">
                  <span className="text-[11px] text-white/30 self-center">Alternatives:</span>
                  {l.alternatives.map((alt) => (
                    <span key={alt} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.05] text-white/60">{alt}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Considerations */}
        <div className="glass rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-3"><Layers size={16} className="text-[var(--brand-primary)]" /><h2 className="font-display font-bold text-lg text-white">Things to keep in mind</h2></div>
          <ul className="space-y-2">
            {rec.considerations.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-white/60"><Check size={13} className="text-emerald-400/70 mt-0.5 flex-shrink-0" />{c}</li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="glass-strong rounded-2xl p-8 text-center">
          <Sparkles size={22} className="text-[var(--brand-primary)] mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-white mb-2">Want us to build it on this stack?</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Book a free call and we’ll validate the architecture for your exact needs — and scope the build.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button {...CAL_ATTRS} className="btn-primary active:scale-95 px-7 py-3 rounded-xl text-sm">Discuss my architecture</button>
            <button {...CAL_ATTRS} className="px-7 py-3 rounded-xl text-sm border border-white/15 text-white hover:bg-white/5 transition-colors">Talk to a Vikku Expert</button>
          </div>
        </div>
      </div>
    </div>
  )
}
