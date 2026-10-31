import { useRef, useState } from 'react'
import { Mail, Instagram } from 'lucide-react'
import { subscribe, trapProps } from '../lib/signup'
import { CAL_ATTRS } from '../lib/cal'
import { servicePages } from '../data/servicePages'

const company = [
  { label: 'About',    href: '/about' },
  { label: 'Services', href: '/#services' },
  { label: 'Products', href: '/products' },
  { label: 'Work',     href: '/work' },
  { label: 'Contact',  cal: true },
]

const tools = [
  { label: 'Project Estimator',   href: '/tools/project-estimator' },
  { label: 'ROI Calculator',      href: '/tools/business-impact' },
  { label: 'Timeline Calculator', href: '/tools/timeline' },
  { label: 'Tech Stack Recommender', href: '/tools/stack-recommender' },
  { label: 'Maintenance Calculator', href: '/tools/maintenance' },
  { label: 'AI Visibility Score', href: '/tools/ai-visibility-score' },
]

const legal = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Refund Policy', href: '/refunds' },
  { label: 'Request Data Deletion', href: 'mailto:connect@vikku.in?subject=Data%20Deletion%20Request&body=Please%20delete%20the%20personal%20data%20associated%20with%20my%20account%3A%20' },
]

const socials = [
  { icon: Instagram, href: 'https://www.instagram.com/vikku.aiautomationagency/', label: 'Instagram' },
  { icon: Mail,      href: 'mailto:connect@vikku.in',              label: 'Email' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [trap, setTrap] = useState('')
  const [subStatus, setSubStatus] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'
  const [subError, setSubError] = useState('')
  const startedAt = useRef(Date.now())

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setSubStatus('loading')
    try {
      await subscribe({ email, source: 'footer', website: trap, startedAt: startedAt.current })
      setSubStatus('done')
      setEmail('')
    } catch (err) {
      setSubError(err.message)
      setSubStatus('error')
    }
  }

  return (
    <footer className="border-t border-white/[0.05] pt-12 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img src="/logo.png" alt="Vikku Labs" className="h-6 w-auto object-contain mb-2.5" />
            <p className="text-white text-xs leading-relaxed mb-2.5 max-w-[200px]">
              AI agents, business automation and intelligent software.
            </p>
            <a
              href="mailto:connect@vikku.in"
              className="text-white text-[10px] hover:text-white/60 transition-colors block mb-5"
            >
              connect@vikku.in
            </a>
            <div className="flex items-center gap-2.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-7 h-7 glass rounded-lg flex items-center justify-center text-white hover:text-white/70 hover:border-white/15 transition-all"
                >
                  <Icon size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] text-white uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-3">
              {company.map(({ label, href, cal }) => (
                <li key={label}>
                  {cal ? (
                    <button {...CAL_ATTRS} className="text-white text-xs hover:text-white/70 transition-colors">{label}</button>
                  ) : (
                    <a href={href} className="text-white text-xs hover:text-white/70 transition-colors">{label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* AI services */}
          <div>
            <h4 className="text-[10px] text-white uppercase tracking-widest mb-4">AI Services</h4>
            <ul className="space-y-3">
              {servicePages.map(({ slug, navLabel }) => (
                <li key={slug}>
                  <a href={`/${slug}`} className="text-white text-xs hover:text-white/70 transition-colors">{navLabel}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-[10px] text-white uppercase tracking-widest mb-4">Free Tools</h4>
            <ul className="space-y-3">
              {tools.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-white text-xs hover:text-white/70 transition-colors">{label}</a>
                </li>
              ))}
            </ul>
            <h4 className="text-[10px] text-white uppercase tracking-widest mb-3 mt-6">Legal</h4>
            <ul className="space-y-3">
              {legal.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-white text-xs hover:text-white/70 transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Email capture */}
          <div>
            <h4 className="text-[10px] text-white uppercase tracking-widest mb-4">Stay in the Loop</h4>
            <p className="text-white/50 text-[10px] mb-3 leading-relaxed">
              Tips on growing your business online. No spam.
            </p>
            {subStatus === 'done' ? (
              <p className="text-green-400 text-xs">You're in! We'll be in touch.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="relative space-y-2">
                <input {...trapProps} value={trap} onChange={e => setTrap(e.target.value)} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full glass rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={subStatus === 'loading'}
                  className="w-full glass rounded-lg px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {subStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
                {subStatus === 'error' && <p role="alert" className="text-red-400 text-[10px]">{subError}</p>}
                <p className="text-[9px] text-white/30 leading-relaxed">By subscribing you agree to our <a href="/privacy" className="underline underline-offset-2 hover:text-white/60">Privacy Policy</a>. Unsubscribe anytime.</p>
              </form>
            )}
          </div>
        </div>

        <hr className="divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-white">
          <p>© {new Date().getFullYear()} Vikku Labs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
