import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, TrendingUp, ShieldCheck, HelpCircle } from 'lucide-react'
import Seo from '../components/Seo'
import ToolFAQ from '../components/tools/ToolFAQ'
import { TOOL_FAQ, faqJsonLd } from '../lib/toolContent'
import { CAL_ATTRS } from '../lib/cal'
import AISummary from '../components/tools/AISummary'
import { useAuth } from '../contexts/AuthContext'
import {
  CATEGORIES, CATEGORY_FIELDS, CAPACITY_OPTIONS, ADOPTION, RISK_FACTORS,
  computeModel, inr, inrShort,
} from '../lib/roiModel'

const SOURCE_TAG = {
  client:    { label: 'You provided',       cls: 'text-emerald-400 bg-emerald-500/10' },
  assumption:{ label: 'Assumption',         cls: 'text-orange-400 bg-orange-500/10' },
  benchmark: { label: 'Industry benchmark', cls: 'text-blue-400 bg-blue-500/10' },
}

export default function BusinessImpact() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stage, setStage] = useState('category') // category | questions | result
  const [category, setCategory] = useState('')
  const [values, setValues] = useState({})
  const [notSure, setNotSure] = useState({}) // key -> true
  const [opts, setOpts] = useState({ capacity: 'unsure', adoption: '75', risks: [], discountRate: 10 })

  useEffect(() => { window.scrollTo(0, 0) }, [stage])

  const fields = CATEGORY_FIELDS[category] || []
  const setVal = (k, v) => { setValues((p) => ({ ...p, [k]: v })); setNotSure((p) => ({ ...p, [k]: false })) }
  const markUnsure = (k) => { setValues((p) => ({ ...p, [k]: '' })); setNotSure((p) => ({ ...p, [k]: true })) }
  const toggleRisk = (r) => setOpts((p) => ({ ...p, risks: p.risks.includes(r) ? p.risks.filter((x) => x !== r) : [...p.risks, r] }))

  const model = useMemo(
    () => (category ? computeModel(category, values, opts) : null),
    [category, values, opts]
  )

  // ---- Category ----
  if (stage === 'category') {
    return (
      <Shell navigate={navigate} home={user ? '/dashboard' : '/'}>
        <Head eyebrow="Business Impact Calculator" title="What are you evaluating?" sub="We’ll build a small financial model of your business — not just an ROI number." />
        <div className="grid sm:grid-cols-2 gap-3">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => { setCategory(c.key); setValues({}); setNotSure({}); setStage('questions') }}
              className="text-left rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 p-5 transition-all active:scale-[0.98]">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-display font-semibold text-white">{c.label}</div>
              <div className="text-xs text-white/50 mt-1">{c.blurb}</div>
            </button>
          ))}
        </div>
        <ToolFAQ content={TOOL_FAQ.business_impact} />
      </Shell>
    )
  }

  // ---- Questions ----
  if (stage === 'questions') {
    return (
      <Shell navigate={navigate} onBack={() => setStage('category')}>
        <Head eyebrow={CATEGORIES.find((c) => c.key === category)?.label} title="Tell us what you know" sub="Not sure about a number? Tap “I’m not sure” and we’ll use a safe benchmark." />

        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="text-sm text-white">{f.label}</label>
                <button
                  onClick={() => (notSure[f.key] ? setVal(f.key, f.benchmark) : markUnsure(f.key))}
                  className={`text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${notSure[f.key] ? 'bg-blue-500/15 text-blue-400' : 'text-white/40 hover:text-white/70 border border-white/10'}`}
                >
                  <HelpCircle size={11} /> {notSure[f.key] ? 'Using benchmark' : 'I’m not sure'}
                </button>
              </div>
              {f.unit === 'text' ? (
                <input type="text" value={values[f.key] ?? ''} onChange={(e) => setVal(f.key, e.target.value)}
                  placeholder={f.benchmark}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[var(--brand-primary)]" />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number" inputMode="numeric"
                    value={notSure[f.key] ? '' : (values[f.key] ?? '')}
                    onChange={(e) => setVal(f.key, e.target.value)}
                    placeholder={notSure[f.key] ? `${f.benchmark} (benchmark)` : String(f.benchmark)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[var(--brand-primary)]" />
                  <span className="text-xs text-white/40 whitespace-nowrap w-16 text-right">{f.unit}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modelling assumptions */}
        <h3 className="font-display font-bold text-white mt-8 mb-3">A few modelling choices</h3>
        <div className="glass rounded-xl p-4 mb-3">
          <p className="text-sm text-white mb-2.5">What happens to saved capacity?</p>
          <div className="flex flex-wrap gap-2">
            {CAPACITY_OPTIONS.map((c) => (
              <Chip key={c.key} on={opts.capacity === c.key} onClick={() => setOpts((p) => ({ ...p, capacity: c.key }))}>{c.label}</Chip>
            ))}
          </div>
          <p className="text-[11px] text-white/40 mt-2">{CAPACITY_OPTIONS.find((c) => c.key === opts.capacity)?.note}</p>
        </div>
        <div className="glass rounded-xl p-4 mb-3">
          <p className="text-sm text-white mb-2.5">Expected team adoption</p>
          <div className="flex flex-wrap gap-2">
            {ADOPTION.map((a) => <Chip key={a.key} on={opts.adoption === a.key} onClick={() => setOpts((p) => ({ ...p, adoption: a.key }))}>{a.label}</Chip>)}
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-white mb-2.5">Any risk factors? <span className="text-white/40 text-xs">(trims the estimate)</span></p>
          <div className="flex flex-wrap gap-2">
            {RISK_FACTORS.map((r) => <Chip key={r} on={opts.risks.includes(r)} onClick={() => toggleRisk(r)}>{r}</Chip>)}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button onClick={() => setStage('result')} className="btn-primary active:scale-95 px-7 py-3 rounded-xl text-sm inline-flex items-center gap-2">
            Build my financial model <ArrowRight size={15} />
          </button>
        </div>
      </Shell>
    )
  }

  // ---- Result ----
  return <Result navigate={navigate} category={category} model={model} values={values} setValues={setValues} fields={fields} opts={opts} setOpts={setOpts}
    onEdit={() => setStage('questions')} onRestart={() => { setStage('category'); setCategory(''); setValues({}); setNotSure({}); setOpts({ capacity: 'unsure', adoption: '75', risks: [], discountRate: 10 }) }} />
}

// ---- shared UI ----
function Shell({ children, navigate, onBack, home = '/' }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="Business Impact Calculator — Vikku" description="Model the financial impact of automation, software, or marketing on your business — TCO, ROI, NPV, payback, and a full business case." canonical="/tools/business-impact" jsonLd={faqJsonLd('business_impact')} />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => (onBack ? onBack() : navigate(home))} className="flex items-center gap-2 text-white hover:text-white/70 text-sm"><ArrowLeft size={16} /> {!onBack && home !== '/' ? 'Dashboard' : 'Back'}</button>
          <span className="text-xs text-white/50">Vikku Business Impact</span>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10">{children}</div>
    </div>
  )
}
function Head({ eyebrow, title, sub }) {
  return (
    <div className="mb-8">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)] mb-2">{eyebrow}</div>
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">{title}</h1>
      <p className="text-white/50 text-sm">{sub}</p>
    </div>
  )
}
function Chip({ on, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs transition-all active:scale-95 ${on ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium' : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'}`}>
      {children}
    </button>
  )
}

// ---- Result screen ----
function Result({ navigate, category, model, values, setValues, fields, opts, setOpts, onEdit, onRestart }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const m = model
  const confColor = { High: 'text-emerald-400', Medium: 'text-yellow-400', Low: 'text-orange-400' }[m.confidence]
  const totalDrivers = m.drivers.reduce((s, d) => s + d.amount, 0) || 1
  const sliderFields = fields.filter((f) => f.driver)
  const maxNet = Math.max(...m.years.map((y) => Math.abs(y.net)), 1)

  return (
    <div className="min-h-screen bg-black text-white">
      <Seo title="Your Business Case — Vikku" description="Your financial model." canonical="/tools/business-impact" />
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onEdit} className="flex items-center gap-2 text-white hover:text-white/70 text-sm"><ArrowLeft size={16} /> Edit inputs</button>
          <button onClick={onRestart} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white"><RotateCcw size={13} /> Start over</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)]">Your business case</div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] ${confColor}`}>Confidence: {m.confidence}</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-8">{CATEGORIES.find((c) => c.key === category)?.label} impact</h1>

        {/* Headline metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Metric label="Annual benefit" value={inrShort(m.annualBenefit)} accent />
          <Metric label="3-year ROI" value={`${m.roi3}%`} />
          <Metric label="Payback" value={m.paybackMonth ? `${m.paybackMonth} mo` : '> 5 yrs'} />
          <Metric label={`NPV @ ${opts.discountRate}%`} value={inrShort(m.npv)} />
        </div>

        {/* TCO table */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-4">3-year total cost of ownership</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left font-medium pb-2">Year</th><th className="text-right font-medium pb-2">Investment</th><th className="text-right font-medium pb-2">Benefit</th><th className="text-right font-medium pb-2">Net impact</th>
              </tr></thead>
              <tbody>
                {m.years.map((y) => (
                  <tr key={y.year} className="border-t border-white/[0.06]">
                    <td className="py-2.5 text-white/70">Year {y.year}</td>
                    <td className="py-2.5 text-right text-white/70">{inr(y.investment)}</td>
                    <td className="py-2.5 text-right text-white/70">{inr(y.benefit)}</td>
                    <td className={`py-2.5 text-right font-semibold ${y.net >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>{y.net >= 0 ? '+' : ''}{inr(y.net)}</td>
                  </tr>
                ))}
                <tr className="border-t border-white/15 font-semibold">
                  <td className="py-2.5 text-white">3-year total</td>
                  <td className="py-2.5 text-right text-white">{inr(m.totalInvest)}</td>
                  <td className="py-2.5 text-right text-white">{inr(m.totalBenefit)}</td>
                  <td className={`py-2.5 text-right ${m.totalBenefit - m.totalInvest >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>{inr(m.totalBenefit - m.totalInvest)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Break-even */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-1">Break-even</h2>
          <p className="text-white/50 text-sm mb-4">{m.paybackMonth ? `You recover the investment around month ${m.paybackMonth}.` : 'Payback takes longer than 5 years with these assumptions.'}</p>
          <div className="relative h-2 rounded-full bg-white/[0.06]">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, ((m.paybackMonth || 60) / 36) * 100)}%`, background: 'var(--brand-gradient)' }} />
            {m.paybackMonth && <div className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-[var(--brand-primary)]" style={{ left: `calc(${Math.min(100, (m.paybackMonth / 36) * 100)}% - 8px)` }} />}
          </div>
          <div className="flex justify-between text-[10px] text-white/30 mt-1"><span>0</span><span>12 mo</span><span>24 mo</span><span>36 mo</span></div>
        </div>

        {/* Value drivers */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-1">Where does the value come from?</h2>
          <p className="text-white/50 text-sm mb-4">{m.capacityNote}</p>
          <div className="space-y-3">
            {m.drivers.map((d) => (
              <div key={d.key}>
                <div className="flex justify-between text-sm mb-1"><span className="text-white/70">{d.label}</span><span className="text-white font-medium">{inr(d.amount)}/yr</span></div>
                <div className="h-2 rounded-full bg-white/[0.06]"><div className="h-full rounded-full" style={{ width: `${(d.amount / totalDrivers) * 100}%`, background: 'var(--brand-gradient)' }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Sensitivity */}
        {sliderFields.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-[var(--brand-primary)]" /><h2 className="font-display font-bold text-lg text-white">Play with the assumptions</h2></div>
            <p className="text-white/50 text-sm mb-5">Drag to see how sensitive the result is. Everything above updates live.</p>
            <div className="space-y-5">
              {sliderFields.map((f) => {
                const val = +(values[f.key] ?? f.benchmark)
                return (
                  <div key={f.key}>
                    <div className="flex justify-between text-sm mb-1.5"><span className="text-white/70">{f.label}</span><span className="text-[var(--brand-primary)] font-medium">{f.unit === '₹' || f.unit.startsWith('₹') ? inrShort(val) : val.toLocaleString('en-IN')}{f.unit === '%' ? '%' : ''}</span></div>
                    <input type="range" min={f.min} max={f.max} step={(f.max - f.min) / 100} value={val}
                      onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full accent-[var(--brand-primary)]" />
                  </div>
                )
              })}
              <div>
                <div className="flex justify-between text-sm mb-1.5"><span className="text-white/70">Discount rate (NPV)</span><span className="text-[var(--brand-primary)] font-medium">{opts.discountRate}%</span></div>
                <input type="range" min={4} max={20} step={1} value={opts.discountRate} onChange={(e) => setOpts((p) => ({ ...p, discountRate: +e.target.value }))} className="w-full accent-[var(--brand-primary)]" />
              </div>
            </div>
          </div>
        )}

        {/* Risk adjustment note */}
        <div className="glass rounded-2xl p-6 mb-6 flex items-start gap-3">
          <ShieldCheck size={18} className="text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white mb-1">Risk-adjusted result</p>
            <p className="text-xs text-white/50">Before risk adjustment the 3-year ROI is <span className="text-white/80">{m.roiRaw}%</span>; after applying the {opts.risks.length} risk factor{opts.risks.length === 1 ? '' : 's'} you selected it is <span className="text-white/80">{m.roi3}%</span>. Higher risk trims the modelled benefit.</p>
          </div>
        </div>

        {/* Assumptions & sources */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-1">Inputs & sources</h2>
          <p className="text-white/50 text-sm mb-4">Every number is labelled so you know what’s yours vs. an assumption.</p>
          <div className="space-y-1.5">
            {fields.filter((f) => f.unit !== 'text').map((f) => {
              const tag = SOURCE_TAG[m.provenance[f.key]] || SOURCE_TAG.benchmark
              const raw = m.values[f.key]
              const shown = f.unit.startsWith('₹') || f.unit === '₹' ? inr(raw) : `${(+raw).toLocaleString('en-IN')}${f.unit === '%' ? '%' : ''}`
              return (
                <div key={f.key} className="flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-sm text-white/70">{f.label}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-white">{shown}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${tag.cls}`}>{tag.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-[11px] text-white/30 text-center mb-10">This is a financial model based on your inputs and industry benchmarks — not a guarantee. Validate with a pilot before committing.</p>

        <AISummary kind="impact" data={{
          category: CATEGORIES.find((c) => c.key === category)?.label,
          annualBenefit: inrShort(m.annualBenefit),
          roi3yr: `${m.roi3}%`, roiBeforeRisk: `${m.roiRaw}%`,
          paybackMonths: m.paybackMonth, npv: inrShort(m.npv),
          firstYearInvestment: inr(m.firstYearInvestment),
          threeYear: m.years.map((y) => ({ year: y.year, investment: inr(y.investment), benefit: inr(y.benefit), net: inr(y.net) })),
          valueDrivers: m.drivers.map((d) => ({ label: d.label, amount: inr(d.amount) })),
          confidence: m.confidence,
          risksSelected: opts.risks,
        }} />

        {/* CTA */}
        <div className="glass-strong rounded-2xl p-8 text-center">
          <Sparkles size={22} className="text-[var(--brand-primary)] mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-white mb-2">Want a validated business case?</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Book a free call and we’ll pressure-test these numbers, propose a pilot, and turn this into a CFO-ready business case.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button {...CAL_ATTRS} className="btn-primary active:scale-95 px-7 py-3 rounded-xl text-sm">Get a validated business case</button>
            <button {...CAL_ATTRS} className="px-7 py-3 rounded-xl text-sm border border-white/15 text-white hover:bg-white/5 transition-colors">Talk to a Vikku Expert</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, accent }) {
  return (
    <div className={`glass-strong rounded-2xl p-5 ${accent ? 'border border-[var(--brand-primary)]/30' : ''}`}>
      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</p>
      <p className={`text-xl font-display font-bold ${accent ? 'text-[var(--brand-primary)]' : 'text-white'}`}>{value}</p>
    </div>
  )
}
