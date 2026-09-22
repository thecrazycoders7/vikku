import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react'
import Seo from '../components/Seo'
import { CAL_ATTRS } from '../lib/cal'
import {
  PROJECT_TYPES, PLATFORMS, ROLES, FEATURE_GROUPS, INTEGRATIONS, AI_CAPS,
  SCALE_USERS, SECURITY_LEVELS, DESIGN_OPTIONS, MAINTENANCE,
  FEATURE_LABELS, AI_LABELS, estimate, inrShort, inr,
} from '../lib/estimator'

// Ordered wizard screens (result is rendered separately).
const STEPS = [
  { id: 'type',        q: 'What are you looking to build?', hint: 'Pick the closest match — you can add detail next.' },
  { id: 'about',       q: 'Tell us about your project', hint: 'One or two lines is plenty.' },
  { id: 'platforms',   q: 'Where should it work?', hint: 'Choose every platform you need.' },
  { id: 'roles',       q: 'Who will use it?', hint: 'Select all the types of users.' },
  { id: 'features',    q: 'What should it do?', hint: 'Tap everything you want. Skip what you don’t.' },
  { id: 'integrations',q: 'Any third-party integrations?', hint: 'Services it needs to connect to.' },
  { id: 'ai',          q: 'Need any AI?', hint: 'Optional — leave empty if not.' },
  { id: 'scale',       q: 'How many users do you expect?', hint: 'A rough range is fine.' },
  { id: 'security',    q: 'What level of security?', hint: 'Higher levels add compliance & hardening.' },
  { id: 'design',      q: 'Do you have designs?', hint: 'We can design it for you if not.' },
  { id: 'maintenance', q: 'Need post-launch support?', hint: 'Optional — pick what matters.' },
  { id: 'review',      q: 'Does this look right?', hint: 'Review, then get your estimate.' },
]

const CHEERS = ['Nice.', 'Great pick.', 'Got it.', 'Perfect.', 'Love it.', 'On a roll 🔥', 'Almost there!']

export default function ProjectEstimator() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [a, setA] = useState({
    type: '', description: '', platforms: [], roles: [], features: [],
    integrations: [], ai: [], scale: '', security: 'basic', design: 'some', maintenance: [],
  })

  const set = (k, v) => setA((prev) => ({ ...prev, [k]: v }))
  const toggle = (k, v) => setA((prev) => ({
    ...prev, [k]: prev[k].includes(v) ? prev[k].filter((x) => x !== v) : [...prev[k], v],
  }))

  useEffect(() => { window.scrollTo(0, 0) }, [step, done])

  const total = STEPS.length
  const pct = Math.round(((step + (done ? 1 : 0)) / total) * 100)
  const current = STEPS[step]

  const next = () => (step < total - 1 ? setStep(step + 1) : setDone(true))
  const back = () => (done ? setDone(false) : setStep(Math.max(0, step - 1)))

  const canContinue = current?.id === 'type' ? !!a.type : true

  const result = useMemo(() => (done ? estimate(a) : null), [done, a])

  if (done && result) return <Result a={a} r={result} navigate={navigate} onEdit={() => setDone(false)} onRestart={() => { setDone(false); setStep(0); setA({ type: '', description: '', platforms: [], roles: [], features: [], integrations: [], ai: [], scale: '', security: 'basic', design: 'some', maintenance: [] }) }} />

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="AI Project Estimator — Vikku" description="Answer a few quick questions and get a professional software project estimate in minutes." url="https://vikku.in/tools/project-estimator" />

      {/* Header + progress */}
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white hover:text-white/70 transition-colors text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-xs text-white/60 font-mono">Step {step + 1} of {total}</span>
        </div>
        <div className="h-1 w-full bg-white/[0.06]">
          <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: 'var(--brand-gradient)' }} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div key={current.id} style={{ animation: 'estIn .4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
            {step === 0 ? 'Let’s scope your project' : CHEERS[Math.min(step - 1, CHEERS.length - 1)]}
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">{current.q}</h1>
          <p className="text-white/50 text-sm mb-8">{current.hint}</p>

          <StepBody id={current.id} a={a} set={set} toggle={toggle} onPick={next} />
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-10">
          <button onClick={back} disabled={step === 0} className="text-sm text-white/50 hover:text-white disabled:opacity-0 transition-colors flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={next}
            disabled={!canContinue}
            className="btn-primary active:scale-95 px-7 py-3 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {current.id === 'review' ? 'Get my estimate' : 'Continue'} <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <style>{`@keyframes estIn { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}

// ---- Reusable option primitives -------------------------------------------
function BigCard({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition-all active:scale-[0.98] ${
        selected ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]'
      }`}
    >
      {children}
    </button>
  )
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-all active:scale-95 flex items-center gap-1.5 ${
        selected ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium' : 'border-white/[0.1] text-white/70 hover:border-white/30 hover:text-white'
      }`}
    >
      {selected && <Check size={13} />}{children}
    </button>
  )
}

// ---- Per-step body --------------------------------------------------------
function StepBody({ id, a, set, toggle, onPick }) {
  if (id === 'type') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PROJECT_TYPES.map((t) => (
          <BigCard key={t.key} selected={a.type === t.key} onClick={() => { set('type', t.key); setTimeout(onPick, 180) }}>
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="text-sm font-semibold text-white">{t.label}</div>
          </BigCard>
        ))}
      </div>
    )
  }

  if (id === 'about') {
    return (
      <textarea
        value={a.description}
        onChange={(e) => set('description', e.target.value)}
        rows={5}
        autoFocus
        placeholder="e.g. We want a platform where users can book doctors online, pay, and chat with them."
        className="w-full glass rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--brand-primary)]"
      />
    )
  }

  if (id === 'platforms') {
    return (
      <div className="flex flex-wrap gap-2.5">
        {PLATFORMS.map((p) => <Chip key={p.key} selected={a.platforms.includes(p.key)} onClick={() => toggle('platforms', p.key)}>{p.label}</Chip>)}
      </div>
    )
  }

  if (id === 'roles') {
    return (
      <div className="flex flex-wrap gap-2.5">
        {ROLES.map((r) => <Chip key={r.key} selected={a.roles.includes(r.key)} onClick={() => toggle('roles', r.key)}>{r.label}</Chip>)}
      </div>
    )
  }

  if (id === 'features') {
    return (
      <div className="space-y-6">
        {FEATURE_GROUPS.map((g) => (
          <div key={g.group}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2.5">{g.group}</p>
            <div className="flex flex-wrap gap-2.5">
              {g.features.map((f) => <Chip key={f.key} selected={a.features.includes(f.key)} onClick={() => toggle('features', f.key)}>{f.label}</Chip>)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (id === 'integrations') {
    return (
      <div className="flex flex-wrap gap-2.5">
        {INTEGRATIONS.map((x) => <Chip key={x} selected={a.integrations.includes(x)} onClick={() => toggle('integrations', x)}>{x}</Chip>)}
      </div>
    )
  }

  if (id === 'ai') {
    return (
      <div className="flex flex-wrap gap-2.5">
        {AI_CAPS.map((x) => <Chip key={x.key} selected={a.ai.includes(x.key)} onClick={() => toggle('ai', x.key)}>{x.label}</Chip>)}
      </div>
    )
  }

  if (id === 'scale') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SCALE_USERS.map((s) => (
          <BigCard key={s.key} selected={a.scale === s.key} onClick={() => { set('scale', s.key); setTimeout(onPick, 180) }}>
            <div className="text-sm font-semibold text-white">{s.label}</div>
          </BigCard>
        ))}
      </div>
    )
  }

  if (id === 'security') {
    return (
      <div className="grid sm:grid-cols-3 gap-3">
        {SECURITY_LEVELS.map((s) => (
          <BigCard key={s.key} selected={a.security === s.key} onClick={() => { set('security', s.key); setTimeout(onPick, 180) }}>
            <div className="text-sm font-semibold text-white mb-1">{s.label}</div>
            <div className="text-xs text-white/50">{s.desc}</div>
          </BigCard>
        ))}
      </div>
    )
  }

  if (id === 'design') {
    return (
      <div className="grid sm:grid-cols-3 gap-3">
        {DESIGN_OPTIONS.map((d) => (
          <BigCard key={d.key} selected={a.design === d.key} onClick={() => { set('design', d.key); setTimeout(onPick, 180) }}>
            <div className="text-sm font-semibold text-white">{d.label}</div>
          </BigCard>
        ))}
      </div>
    )
  }

  if (id === 'maintenance') {
    return (
      <div className="flex flex-wrap gap-2.5">
        {MAINTENANCE.map((m) => <Chip key={m} selected={a.maintenance.includes(m)} onClick={() => toggle('maintenance', m)}>{m}</Chip>)}
      </div>
    )
  }

  if (id === 'review') return <ReviewSummary a={a} />
  return null
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-white/[0.06] last:border-0">
      <span className="text-xs text-white/40 uppercase tracking-wider flex-shrink-0">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  )
}

function ReviewSummary({ a }) {
  const platforms = a.platforms.map((p) => PLATFORMS.find((x) => x.key === p)?.label).join(' + ')
  const roles = a.roles.map((r) => ROLES.find((x) => x.key === r)?.label).join(', ')
  const features = a.features.map((f) => FEATURE_LABELS[f]).join(', ')
  const ai = a.ai.map((x) => AI_LABELS[x]).filter(Boolean).join(', ')
  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <Row label="Project" value={PROJECT_TYPES.find((t) => t.key === a.type)?.label} />
      <Row label="About" value={a.description} />
      <Row label="Platforms" value={platforms} />
      <Row label="Users" value={roles} />
      <Row label="Features" value={features} />
      <Row label="Integrations" value={a.integrations.join(', ')} />
      <Row label="AI" value={ai || 'None'} />
      <Row label="Expected users" value={SCALE_USERS.find((s) => s.key === a.scale)?.label} />
      <Row label="Security" value={SECURITY_LEVELS.find((s) => s.key === a.security)?.label} />
      <Row label="Design" value={DESIGN_OPTIONS.find((d) => d.key === a.design)?.label} />
      <Row label="Support" value={a.maintenance.join(', ')} />
    </div>
  )
}

// ---- Result screen --------------------------------------------------------
function Result({ a, r, navigate, onEdit, onRestart }) {
  const disc = [
    ['UI/UX', r.hours.ui_ux], ['Frontend', r.hours.frontend], ['Backend', r.hours.backend],
    ['QA', r.hours.qa], ['DevOps', r.hours.devops],
  ]
  const complexityColor = { Low: 'text-emerald-400', Medium: 'text-yellow-400', High: 'text-orange-400', 'Very High': 'text-red-400' }[r.complexity]

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="Your Project Estimate — Vikku" description="Your software project estimate." url="https://vikku.in/tools/project-estimator" />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onEdit} className="flex items-center gap-2 text-white hover:text-white/70 text-sm"><ArrowLeft size={16} /> Edit answers</button>
          <button onClick={onRestart} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white"><RotateCcw size={13} /> Start over</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] mb-2">Your project estimate</div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-8">
          {PROJECT_TYPES.find((t) => t.key === a.type)?.label || 'Your project'}
        </h1>

        {/* Headline metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="glass-strong rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Complexity</p>
            <p className={`text-xl font-display font-bold ${complexityColor}`}>{r.complexity}</p>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Timeline</p>
            <p className="text-xl font-display font-bold text-white">{r.weeks.min}–{r.weeks.max} wks</p>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Effort</p>
            <p className="text-xl font-display font-bold text-white">{r.totalHours.toLocaleString('en-IN')}h</p>
          </div>
          <div className="glass-strong rounded-2xl p-5 border border-[var(--brand-primary)]/30">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Investment</p>
            <p className="text-xl font-display font-bold text-[var(--brand-primary)]">{inrShort(r.priceMin)}–{inrShort(r.priceMax)}</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-4">Estimated breakdown</h2>
          <div className="space-y-3">
            {disc.map(([label, h]) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1"><span className="text-white/70">{label}</span><span className="text-white/50">{h}h</span></div>
                <div className="h-1.5 rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: `${(h / r.totalHours) * 100}%`, background: 'var(--brand-gradient)' }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Drivers */}
        {r.drivers.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display font-bold text-lg text-white mb-4">What’s driving the cost?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {r.drivers.map((d) => (
                <div key={d.label} className="glass rounded-xl p-4">
                  <p className="text-sm font-semibold text-white mb-0.5">{d.label}</p>
                  <p className="text-xs text-white/50">{d.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packages */}
        <h2 className="font-display font-bold text-lg text-white mb-4">Choose your scope</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {r.packages.map((p) => (
            <div key={p.key} className={`rounded-2xl p-5 flex flex-col ${p.recommended ? 'border-2 border-[var(--brand-primary)] bg-[var(--brand-primary)]/[0.06]' : 'glass'}`}>
              {p.recommended && <span className="self-start text-[9px] font-bold uppercase tracking-wide bg-[var(--brand-primary)] text-white px-2 py-0.5 rounded-full mb-3">Recommended</span>}
              <p className="font-display font-bold text-white text-lg">{p.name}</p>
              <p className="text-xs text-white/50 mb-3">{p.tagline}</p>
              <p className="font-display font-extrabold text-2xl text-white mb-4">{inrShort(p.price)}</p>
              <ul className="space-y-1.5 flex-1">
                {p.includes.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/70"><Check size={13} className="text-emerald-400/70 mt-0.5 flex-shrink-0" />{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/30 text-center mb-10">Estimate based on typical build effort — not a fixed quote. Final scope and price are confirmed on a scoping call.</p>

        {/* CTA */}
        <div className="glass-strong rounded-2xl p-8 text-center">
          <Sparkles size={22} className="text-[var(--brand-primary)] mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-white mb-2">Want us to build it?</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Book a free scoping call and we’ll turn this estimate into a fixed-price proposal with scope, timeline, and deliverables.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button {...CAL_ATTRS} className="btn-primary active:scale-95 px-7 py-3 rounded-xl text-sm">Request Detailed Proposal</button>
            <button {...CAL_ATTRS} className="px-7 py-3 rounded-xl text-sm border border-white/15 text-white hover:bg-white/5 transition-colors">Talk to a Vikku Expert</button>
          </div>
        </div>
      </div>
    </div>
  )
}
