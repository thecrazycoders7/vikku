import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getConsent, setConsent, loadAnalytics } from '../lib/analyticsLoader'

// Privacy-first cookie banner. Analytics load ONLY after "Accept all".
export default function CookieConsent() {
  const [choice, setChoice] = useState(() => getConsent())

  // If the visitor already accepted on a previous visit, load analytics.
  useEffect(() => { if (choice === 'accepted') loadAnalytics() }, [choice])

  if (choice) return null // a decision was already made

  const accept = () => { setConsent('accepted'); loadAnalytics(); setChoice('accepted') }
  const decline = () => { setConsent('declined'); setChoice('declined') }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[100]"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="font-display font-bold text-xl text-white mb-3">🍪 We value your privacy!</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Our website uses tracking cookies to understand how you interact with it. The
            tracking will be enabled only if you accept.{' '}
            <Link to="/cookies" className="text-[var(--brand-primary)] hover:underline">Manage preferences</Link>
          </p>
        </div>

        <div className="px-6 pb-5 pt-1 border-t border-white/[0.06] grid grid-cols-2 gap-3">
          <button
            onClick={accept}
            className="rounded-xl py-3 text-sm font-semibold text-[#fff] transition-transform active:scale-95"
            style={{ background: '#0F172A' }}
          >
            Accept all
          </button>
          <button
            onClick={decline}
            className="rounded-xl py-3 text-sm font-semibold text-[#fff] transition-transform active:scale-95"
            style={{ background: '#0F172A' }}
          >
            Reject all
          </button>
        </div>

        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center gap-6 text-xs">
          <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-white/60 hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
