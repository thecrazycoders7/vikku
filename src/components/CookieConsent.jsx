import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getConsent, setConsent, loadAnalytics } from '../lib/analyticsLoader'

// Privacy-first cookie banner. Analytics load ONLY after "Accept".
export default function CookieConsent() {
  const [choice, setChoice] = useState(() => getConsent())

  // If the visitor already accepted on a previous visit, load analytics.
  useEffect(() => { if (choice === 'accepted') loadAnalytics() }, [choice])

  if (choice) return null // a decision was already made

  const accept = () => { setConsent('accepted'); loadAnalytics(); setChoice('accepted') }
  const decline = () => { setConsent('declined'); setChoice('declined') }

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-5" role="dialog" aria-label="Cookie consent">
      <div className="glass-strong max-w-3xl mx-auto rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-white/70 flex-1 leading-relaxed">
          We use essential cookies to run the site and, with your consent, analytics cookies to understand usage.{' '}
          <Link to="/cookies" className="text-[var(--brand-primary)] hover:underline">Cookie Policy</Link>
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={decline} className="px-4 py-2 rounded-xl text-sm border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition-colors">Decline</button>
          <button onClick={accept} className="btn-primary px-5 py-2 rounded-xl text-sm">Accept</button>
        </div>
      </div>
    </div>
  )
}
