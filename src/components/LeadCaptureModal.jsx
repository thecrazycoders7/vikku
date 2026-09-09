import { useState, useEffect } from 'react'
import { X, Mail, ArrowRight, CheckCircle, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { emailToolResult } from '../lib/toolResultsService'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

const SOURCE_LABELS = {
  roi_calculator: 'ROI Calculator',
  cost_estimator: 'Cost Estimator',
  timeline_calculator: 'Timeline Calculator',
  tech_recommender: 'Tech Recommender',
}

export default function LeadCaptureModal({ open, onClose, source, shareId, onUnlock }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error

  useEffect(() => {
    if (!open) { setEmail(''); setStatus('idle') }
  }, [open])

  useLockBodyScroll(open)

  if (!open) return null

  const label = SOURCE_LABELS[source] || 'this tool'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setStatus('loading')
    try {
      // If we have a saved result, email it with the booking CTA (also records the
      // email + adds them to subscribers server-side - the auto follow-up).
      if (shareId) {
        await emailToolResult({ shareId, email: email.trim().toLowerCase(), tool: source })
      } else {
        await supabase.from('subscribers').upsert(
          { email: email.trim().toLowerCase(), source },
          { onConflict: 'email', ignoreDuplicates: true }
        )
      }
      setStatus('done')
      onUnlock?.()
    } catch {
      // Fall back to at least capturing the lead so we never lose them.
      try {
        await supabase.from('subscribers').upsert(
          { email: email.trim().toLowerCase(), source },
          { onConflict: 'email', ignoreDuplicates: true }
        )
        setStatus('done')
        onUnlock?.()
      } catch {
        setStatus('error')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
         aria-label="Close">
          <X size={16} />
        </button>

        {status === 'done' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={24} className="text-green-400" />
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-2">You're in!</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              We'll send you a follow-up with tips based on your results. Meanwhile-
            </p>
            <div className="space-y-3">
              <a
                href="mailto:connect@vikku.in?subject=I%20used%20your%20tool%20and%20want%20to%20talk"
                className="flex items-center justify-between glass rounded-xl px-4 py-3 text-sm text-white hover:border-white/20 transition-all group"
              >
                <span>Book a free consultation</span>
                <ArrowRight size={14} className="text-white/30 group-hover:text-white transition-colors" />
              </a>
              <a
                href="/pm"
                className="flex items-center justify-between glass rounded-xl px-4 py-3 text-sm text-white hover:border-white/20 transition-all group"
              >
                <span>Try Vikku PM - free</span>
                <ArrowRight size={14} className="text-white/30 group-hover:text-white transition-colors" />
              </a>
            </div>
            <button onClick={onClose} className="mt-5 text-xs text-white/25 hover:text-white/50 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mb-5">
              <Mail size={20} className="text-white/60" />
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-1">Get your results by email</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              We'll send a breakdown of your {label} results + tips for your specific situation.
              No spam - one useful email.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Send me the results <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            {status === 'error' && (
              <p className="text-red-400 text-xs mt-2 text-center">Something went wrong. Try again.</p>
            )}

            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-white/30 text-xs">
                <Calendar size={11} />
                <span>Or email us directly to book a call</span>
              </div>
              <a
                href="mailto:connect@vikku.in"
                className="ml-auto text-xs text-white/40 hover:text-white transition-colors flex-shrink-0"
              >
                connect@vikku.in
              </a>
            </div>

            <button
              onClick={onClose}
              className="mt-4 text-xs text-white/20 hover:text-white/40 transition-colors block mx-auto"
            >
              Skip, just show results
            </button>
          </>
        )}
      </div>
    </div>
  )
}
