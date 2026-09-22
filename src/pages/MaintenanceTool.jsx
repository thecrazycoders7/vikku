import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Check } from 'lucide-react'
import Seo from '../components/Seo'
import { CAL_ATTRS } from '../lib/cal'
import { useAuth } from '../contexts/AuthContext'
import { TYPES, SCALE, SUPPORT, AI, SERVICES, estimateMaintenance, inr, inrShort } from '../lib/maintenanceModel'

const STEPS = [
  { id: 'type',     q: 'What are you maintaining?', hint: 'Pick the closest match.' },
  { id: 'scale',    q: 'How many users?', hint: 'Drives hosting and infra cost.' },
  { id: 'support',  q: 'What support level do you need?', hint: 'How fast and how hands-on.' },
  { id: 'ai',       q: 'Any AI running in production?', hint: 'Inference has ongoing cost.' },
  { id: 'services', q: 'Which recurring services?', hint: 'Select all you use — skip the rest.' },
]
const CHEERS = ['Nice.', 'Got it.', 'Great.', 'Last one!']

export default function MaintenanceTool() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const homePath = user ? '/dashboard' : '/'
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [a, setA] = useState({ type: '', scale: '', support: '', ai: '', services: [] })
  useEffect(() => { window.scrollTo(0, 0) }, [step, done])

  const total = STEPS.length
  const cur = STEPS[step]
  const pct = Math.round(((step + (done ? 1 : 0)) / total) * 100)
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }))
  const toggle = (k, v) => setA((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }))
  const next = () => (step < total - 1 ? setStep(step + 1) : setDone(true))
  const back = () => (done ? setDone(false) : setStep(Math.max(0, step - 1)))
  const r = useMemo(() => (done ? estimateMaintenance(a) : null), [done, a])
  const canContinue = cur.id === 'type' ? !!a.type : true

  if (done && r) return <Result a={a} r={r} navigate={navigate} onEdit={() => setDone(false)} onRestart={() => { setDone(false); setStep(0); setA({ type: '', scale: '', support: '', ai: '', services: [] }) }} />

  const single = { type: TYPES, scale: SCALE, support: SUPPORT, ai: AI }[cur.id]
  const multi = cur.id === 'services' ? SERVICES : null

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="Maintenance Cost Calculator — Vikku" description="Estimate the monthly cost to run and maintain your software — hosting, support, security and more." url="https://vikku.in/tools/maintenance" />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(homePath)} className="flex items-center gap-2 text-white hover:text-white/70 text-sm"><ArrowLeft size={16} /> {user ? 'Dashboard' : 'Back'}</button>
          <span className="text-xs text-white/50 font-mono">Step {step + 1} of {total}</span>
        </div>
        <div className="h-1 w-full bg-white/[0.06]"><div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: 'var(--brand-gradient)' }} /></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div key={cur.id} style={{ animation: 'mtIn .4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] mb-2">{step === 0 ? 'Estimate your running cost' : CHEERS[Math.min(step - 1, CHEERS.length - 1)]}</div>
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
            {step === total - 1 ? 'See my cost' : 'Continue'} <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <style>{`@keyframes mtIn { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}

function Result({ r, navigate, onEdit, onRestart }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const maxItem = Math.max(...r.items.map((i) => i.amount), 1)
  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="Your Maintenance Cost — Vikku" description="Your monthly maintenance estimate." url="https://vikku.in/tools/maintenance" />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onEdit} className="flex items-center gap-2 text-white hover:text-white/70 text-sm"><ArrowLeft size={16} /> Edit answers</button>
          <button onClick={onRestart} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white"><RotateCcw size={13} /> Start over</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] mb-2">Your maintenance estimate</div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-1">{inrShort(r.monthly)}<span className="text-lg text-white/40 font-normal">/month</span></h1>
        <p className="text-white/50 text-sm mb-8">About {inrShort(r.annual)} per year · {r.sla} response</p>

        {/* Breakdown */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-5">Monthly breakdown</h2>
          <div className="space-y-3">
            {r.items.map((it) => (
              <div key={it.key}>
                <div className="flex justify-between text-sm mb-1"><span className="text-white/70">{it.label}</span><span className="text-white font-medium">{inr(it.amount)}</span></div>
                <div className="h-2 rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: `${(it.amount / maxItem) * 100}%`, background: 'var(--brand-gradient)' }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <h2 className="font-display font-bold text-lg text-white mb-4">Support tiers</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {r.tiers.map((t) => (
            <div key={t.key} className={`rounded-2xl p-5 flex flex-col ${t.recommended ? 'border-2 border-[var(--brand-primary)] bg-[var(--brand-primary)]/[0.06]' : 'glass'}`}>
              {t.recommended && <span className="self-start text-[9px] font-bold uppercase tracking-wide bg-[var(--brand-primary)] text-white px-2 py-0.5 rounded-full mb-3">Recommended</span>}
              <p className="font-display font-bold text-white text-lg">{t.label}</p>
              <p className="text-xs text-white/50 mb-3">{t.hint}</p>
              <p className="font-display font-extrabold text-2xl text-white mb-1">{inrShort(t.monthly)}<span className="text-sm text-white/40 font-normal">/mo</span></p>
              <p className="text-[11px] text-white/50">SLA: {t.sla}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/30 text-center mb-10">Estimate based on typical running costs — final pricing depends on exact infrastructure and scope.</p>

        <div className="glass-strong rounded-2xl p-8 text-center">
          <Sparkles size={22} className="text-[var(--brand-primary)] mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-white mb-2">Want us to run & maintain it?</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Book a free call and we’ll put together a maintenance plan that fits your product and budget.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button {...CAL_ATTRS} className="btn-primary active:scale-95 px-7 py-3 rounded-xl text-sm">Get a maintenance plan</button>
            <button {...CAL_ATTRS} className="px-7 py-3 rounded-xl text-sm border border-white/15 text-white hover:bg-white/5 transition-colors">Talk to a Vikku Expert</button>
          </div>
        </div>
      </div>
    </div>
  )
}
