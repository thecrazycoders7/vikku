import { useState } from 'react'
import { Mail, Instagram } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const company = [
  { label: 'About',    href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Work',     href: '#solution' },
  { label: 'Clients',  href: '#clients' },
  { label: 'Contact',  href: '#contact' },
]

const tools = [
  { label: 'AI Cost Estimator', href: '/dashboard/cost-estimator' },
  { label: 'ROI Calculator',    href: '/dashboard/roi-calculator' },
  { label: 'Timeline Calculator', href: '/dashboard/timeline-calculator' },
  { label: 'Tech Recommender',  href: '/dashboard/tech-recommender' },
]

const legal = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

const socials = [
  { icon: Instagram, href: 'https://www.instagram.com/vikku.in__', label: 'Instagram' },
  { icon: Mail,      href: 'mailto:connect@vikku.in',              label: 'Email' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subStatus, setSubStatus] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setSubStatus('loading')
    try {
      await supabase.from('subscribers').insert({ email, source: 'footer' })
      setSubStatus('done')
      setEmail('')
    } catch {
      setSubStatus('error')
    }
  }

  return (
    <footer className="border-t border-white/[0.05] pt-12 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img src="/logo.png" alt="Vikku" className="h-6 w-auto object-contain mb-2.5" />
            <p className="text-white text-xs leading-relaxed mb-2.5 max-w-[200px]">
              Building digital products that shape the future.
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
              {company.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-white text-xs hover:text-white/70 transition-colors">{label}</a>
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
              <form onSubmit={handleSubscribe} className="space-y-2">
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
                {subStatus === 'error' && <p className="text-red-400 text-[10px]">Something went wrong. Try again.</p>}
              </form>
            )}
          </div>
        </div>

        <hr className="divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-white">
          <p>© {new Date().getFullYear()} Vikku. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
