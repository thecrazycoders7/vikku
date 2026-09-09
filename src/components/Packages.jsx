import { Check, Gift, ArrowRight } from 'lucide-react'

// Fixed-price productized offers. Edit prices / deliverables freely - just data.
const PACKAGES = [
  {
    name: 'Business Website',
    price: '₹40,000',
    feels: 'I can start getting leads immediately.',
    deliverables: [
      '5–6 custom pages',
      'Mobile responsive design',
      'Basic SEO setup',
      'Contact forms',
      'WhatsApp integration',
      'Google Analytics setup',
      'Google Search Console setup',
      'SSL & security configuration',
      'Speed optimization',
      '1 month support',
      'Domain & hosting assistance',
    ],
    bonus: ['3 custom banners', 'Business email setup', 'Google Business Profile optimization guide'],
    highlight: false,
  },
  {
    name: 'MVP / Web App',
    price: '₹1,50,000',
    feels: 'I can validate my startup idea without hiring a full team.',
    deliverables: [
      'Discovery workshop',
      'Wireframes',
      'UI/UX design',
      'Authentication (Login/Signup)',
      'Dashboard',
      '3–5 core features',
      'Payment gateway integration',
      'Admin panel',
      'Email notifications',
      'Production deployment',
      'Basic analytics',
      'Documentation',
      '30 days support',
    ],
    bonus: ['AI feature consultation', 'Landing page included', 'Investor demo version'],
    highlight: true,
  },
  {
    name: 'Custom Platform',
    price: '₹3,00,000+',
    feels: 'This is a serious business system, not just a website.',
    deliverables: [
      'Requirements gathering',
      'System architecture',
      'Custom workflows',
      'Multiple user roles',
      'Advanced dashboards',
      'API integrations',
      'Payment systems',
      'Security implementation',
      'Audit logs',
      'Documentation',
      'CI/CD deployment',
      'Performance optimization',
      'Team training',
      '3 months support',
    ],
    bonus: ['Product roadmap session', 'Growth strategy consultation', 'Dedicated project manager'],
    highlight: false,
  },
]

function scrollToContact() {
  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
}

export default function Packages() {
  return (
    <section id="packages" className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="section-tag">Fixed-Price Packages</div>
          <h2 className="font-display font-extrabold text-white mb-3 leading-[1.05]" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}>
            Know exactly what you'll pay
          </h2>
          <p className="text-white/70 text-sm max-w-xl leading-relaxed">
            No vague quotes or surprise invoices. Pick a package, book a free scoping call,
            and we'll get your project moving - fast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {PACKAGES.map((p) => (
            <div
              key={p.name}
              className={`relative glass rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                p.highlight ? 'border-violet-500/40 bg-violet-500/[0.04]' : 'hover:border-white/[0.14]'
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-6 bg-violet-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Most popular
                </span>
              )}
              <h3 className="font-display font-bold text-white text-lg">{p.name}</h3>
              <div className="flex items-baseline gap-1.5 mt-2 mb-5">
                <span className="font-display font-extrabold text-2xl text-white">{p.price}</span>
              </div>

              <ul className="space-y-2 mb-5">
                {p.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-[13px] text-white/70">
                    <Check size={13} className={`flex-shrink-0 mt-0.5 ${p.highlight ? 'text-violet-400' : 'text-white/40'}`} />
                    {d}
                  </li>
                ))}
              </ul>

              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 mb-5 flex-1">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                  <Gift size={11} className="text-yellow-400/70" /> Bonus
                </p>
                <ul className="space-y-1.5">
                  {p.bonus.map((b) => (
                    <li key={b} className="text-[12px] text-white/55">{b}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={scrollToContact}
                className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                  p.highlight ? 'bg-white text-black hover:bg-white/90' : 'glass text-white hover:bg-white/[0.08]'
                }`}
              >
                Book a free scoping call <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Not sure which fits? <button onClick={scrollToContact} className="text-white/60 hover:text-white underline underline-offset-2">Tell us about your project</button> and we'll recommend one.
        </p>
      </div>
    </section>
  )
}
