import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Sparkles, Loader2, AlertCircle, Check, Minus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { openRazorpayCheckout, PLAN_PRICING, priceBreakdown } from '../../lib/razorpayService'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

// Feature comparison table: [label, free, pro, team]
// true = check, false = dash, string = custom text
const FEATURE_GROUPS = [
  {
    title: 'Pro Features',
    rows: [
      ['AI Project Planner',       '6/month',    'Unlimited',  'Unlimited'],
      ['Active projects',          '3',          'Unlimited',  'Unlimited'],
      ['Custom workflows',         false,        true,         true],
      ['Time tracking + timer',    false,        true,         true],
      ['Time reports & export',    false,        true,         true],
      ['Billable hours tracking',  false,        true,         true],
      ['Client share links (PIN)', false,        true,         true],
    ],
  },
  {
    title: 'Team Collaboration',
    rows: [
      ['Members per project',      '3',          '10',         'Unlimited'],
      ['Member invite links',      true,         true,         true],
      ['Shared project access',    true,         true,         true],
    ],
  },
  {
    title: 'Projects & Tasks',
    rows: [
      ['Unlimited tasks',         true,         true,         true],
      ['Kanban board',            true,         true,         true],
      ['List view (mobile)',      true,         true,         true],
      ['Task labels & priorities', true,        true,         true],
      ['Due dates',               true,         true,         true],
      ['Task comments & activity', true,        true,         true],
      ['Bulk task actions',       true,         true,         true],
      ['Cmd+K quick-add',         true,         true,         true],
    ],
  },
  {
    title: 'Planning & Views',
    rows: [
      ['Milestones & timeline',   true,         true,         true],
      ['Calendar view',           true,         true,         true],
      ['Project analytics',       true,         true,         true],
      ['Project templates',       true,         true,         true],
      ['Manual time logging',     true,         true,         true],
      ['PDF export',              true,         true,         true],
    ],
  },
]

function Cell({ value, isHighlight }) {
  if (value === true)
    return (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto ${isHighlight ? 'bg-green-500/20' : 'bg-yellow-500/15'}`}>
        <Check size={11} strokeWidth={3} className={isHighlight ? 'text-green-600' : 'text-yellow-400'} />
      </div>
    )
  if (value === false)
    return <Minus size={14} strokeWidth={2} className="text-white/20 mx-auto" />
  return (
    <span className={`text-[11px] font-medium leading-tight text-center ${isHighlight ? 'text-white' : 'text-white/50'}`}>
      {value}
    </span>
  )
}

export default function UpgradeModal({ onClose, onUpgraded, reason, currentPlan = 'free', initialBillingCycle = 'monthly' }) {
  useLockBodyScroll()
  const { user } = useAuth()
  const [processing, setProcessing] = useState(null)
  const [error, setError] = useState('')
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle === 'annual' ? 'annual' : 'monthly')

  const isAnnual = billingCycle === 'annual'
  const fmt = (n) => `₹${n.toLocaleString('en-IN')}`
  const fmt2 = (n) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const priceFor = (planKey) => fmt(PLAN_PRICING[planKey][billingCycle])
  const totalFor = (planKey) => fmt2(priceBreakdown(planKey, billingCycle).total)

  const handleUpgrade = (planKey) => {
    setError('')
    setProcessing(planKey)
    openRazorpayCheckout({
      plan: planKey,
      billingCycle,
      mode: 'once',
      user,
      onSuccess: () => {
        setProcessing(null)
        onUpgraded?.()
        onClose?.()
      },
      onFailure: (msg) => {
        setProcessing(null)
        setError(msg || 'Payment failed. Please try again.')
      },
      onDismiss: () => setProcessing(null),
    })
  }

  const modal = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div>
            <h2 className="font-display font-bold text-white text-base">
            {currentPlan === 'pro' ? 'Upgrade to Team' : 'Compare plans'}
          </h2>
            {reason && <p className="text-xs text-white/40 mt-0.5">{reason}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
           aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-5">
            {/* Billing cycle toggle */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center bg-white/[0.06] border border-white/[0.08] rounded-xl p-0.5">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`text-[11px] font-semibold px-4 py-1.5 rounded-lg transition-all ${!isAnnual ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`text-[11px] font-semibold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'}`}
                >
                  Annual
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isAnnual ? 'bg-green-500/20 text-green-600' : 'bg-green-500/15 text-green-400'}`}>
                    Save ~16%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan header row */}
            <div className="grid grid-cols-[0.7fr_1fr_1fr_1fr] gap-1.5 mb-4">
              {/* Feature label column */}
              <div />
              {/* Free */}
              <div className="min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-xl px-1.5 py-2.5 text-center">
                <p className="text-[10px] font-semibold text-white/40 mb-0.5">Free</p>
                <p className="font-display font-extrabold text-xs text-white">₹0</p>
                <p className="text-[9px] text-white/30">forever</p>
                <div className="mt-2 py-1 rounded-lg bg-white/[0.06] text-[9px] text-white/30 font-medium">
                  {currentPlan === 'free' ? 'Current plan' : '-'}
                </div>
              </div>
              {/* Pro */}
              <div className={`min-w-0 rounded-xl px-1.5 py-2.5 text-center relative ${currentPlan === 'pro' ? 'bg-white/[0.04] border border-violet-500/30' : 'bg-white'}`}>
                {currentPlan !== 'pro' && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                    POPULAR
                  </div>
                )}
                <p className={`text-[10px] font-semibold mb-0.5 ${currentPlan === 'pro' ? 'text-violet-400' : 'text-black/50'}`}>Pro</p>
                <p className={`font-display font-extrabold text-xs ${currentPlan === 'pro' ? 'text-white' : 'text-black'}`}>{priceFor('pro')}</p>
                <p className={`text-[9px] ${currentPlan === 'pro' ? 'text-white/30' : 'text-black/40'}`}>{isAnnual ? '/year' : '/month'}</p>
                <p className={`text-[8px] leading-tight mt-0.5 ${currentPlan === 'pro' ? 'text-white/30' : 'text-black/40'}`}>+18% GST<br />= {totalFor('pro')}</p>
                {currentPlan === 'pro' ? (
                  <div className="mt-2 py-1 rounded-lg bg-violet-500/15 text-[9px] text-violet-400 font-semibold">
                    Current plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade('pro')}
                    disabled={!!processing || currentPlan === 'team'}
                    className="mt-2 w-full py-1 rounded-lg bg-black text-white font-semibold text-[9px] hover:bg-black/80 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {processing === 'pro' ? <><Loader2 size={9} className="animate-spin" /> Processing</> : <><Sparkles size={9} /> Upgrade</>}
                  </button>
                )}
              </div>
              {/* Team */}
              <div className={`min-w-0 rounded-xl px-1.5 py-2.5 text-center ${currentPlan === 'team' ? 'bg-white/[0.04] border border-violet-500/30' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
                <p className={`text-[10px] font-semibold mb-0.5 ${currentPlan === 'team' ? 'text-violet-400' : 'text-white/40'}`}>Team</p>
                <p className="font-display font-extrabold text-xs text-white">{priceFor('team')}</p>
                <p className="text-[9px] text-white/30">{isAnnual ? '/year' : '/month'}</p>
                <p className="text-[8px] leading-tight mt-0.5 text-white/30">+18% GST<br />= {totalFor('team')}</p>
                {currentPlan === 'team' ? (
                  <div className="mt-2 py-1 rounded-lg bg-violet-500/15 text-[9px] text-violet-400 font-semibold">
                    Current plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade('team')}
                    disabled={!!processing}
                    className="mt-2 w-full py-1 rounded-lg bg-white text-black font-semibold text-[9px] hover:bg-white/90 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {processing === 'team' ? <><Loader2 size={9} className="animate-spin" /> Processing</> : 'Upgrade'}
                  </button>
                )}
              </div>
            </div>

            {/* Feature groups */}
            {FEATURE_GROUPS.map((group) => (
              <div key={group.title} className="mb-4">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5 px-1">
                  {group.title}
                </p>
                <div className="rounded-xl overflow-hidden">
                  {group.rows.map((row, i) => {
                    const [label, free, pro, team] = row
                    return (
                      <div
                        key={label}
                        className="grid grid-cols-[0.7fr_1fr_1fr_1fr] gap-1.5 items-center px-3 py-2"
                      >
                        <span className="text-[11px] text-white/50 col-span-1">{label}</span>
                        <div className="flex justify-center"><Cell value={free} isHighlight={false} /></div>
                        <div className="flex justify-center"><Cell value={pro} isHighlight={true} /></div>
                        <div className="flex justify-center"><Cell value={team} isHighlight={false} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/10 px-4 py-2.5 rounded-xl mb-3">
                <AlertCircle size={12} />
                {error}
              </div>
            )}

            <p className="text-center text-[10px] text-white/20">
              Secured by Razorpay · One-time payment · No auto-renew · Incl. 18% GST
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
