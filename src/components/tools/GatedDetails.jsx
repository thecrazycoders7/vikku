import { Lock, ArrowRight } from 'lucide-react'

/**
 * Shows the headline result for free but blurs the detailed breakdown until the
 * visitor enters their email (or is logged in). Raises lead quality — people give
 * a real email to see the detail, not before seeing value.
 */
export default function GatedDetails({ unlocked, onUnlock, children }) {
  if (unlocked) return <>{children}</>
  return (
    <div className="relative">
      <div className="blur-[6px] select-none pointer-events-none max-h-[460px] overflow-hidden" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-transparent via-black/40 to-black/80 print:hidden">
        <div className="glass-strong rounded-2xl p-6 max-w-sm">
          <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Lock size={18} className="text-white/70" />
          </div>
          <h3 className="font-display font-bold text-white text-base mb-1">See the full breakdown</h3>
          <p className="text-white/50 text-sm mb-5">Enter your email to unlock the detailed breakdown, recommendations, and a shareable report. No spam.</p>
          <button
            onClick={onUnlock}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
          >
            Unlock full results <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
