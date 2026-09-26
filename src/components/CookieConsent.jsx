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
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-xs z-[100]"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-4">
          <h2 className="font-display font-bold text-base text-white mb-1.5">🍪 We value your privacy!</h2>
          <p className="text-xs text-white/60 leading-relaxed">
            We use tracking cookies to understand how you use the site — only if you accept.{' '}
            <Link to="/cookies" className="text-[var(--brand-primary)] hover:underline">Manage preferences</Link>
          </p>
        </div>

        <div className="px-4 pb-3.5 grid grid-cols-2 gap-2.5">
          <button
            onClick={accept}
            className="rounded-lg py-2.5 text-[13px] font-semibold text-[#fff] transition-transform active:scale-95"
            style={{ background: '#0F172A' }}
          >
            Accept all
          </button>
          <button
            onClick={decline}
            className="rounded-lg py-2.5 text-[13px] font-semibold text-[#fff] transition-transform active:scale-95"
            style={{ background: '#0F172A' }}
          >
            Reject all
          </button>
        </div>

        <div className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-4 text-[11px]">
          <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-white/60 hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
