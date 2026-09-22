import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import usePageMeta from '../hooks/usePageMeta'

const SECTIONS = [
  {
    title: '1. What Are Cookies',
    body: `Cookies are small text files stored on your device when you visit a website. We also use similar technologies such as localStorage. Together these help the site function and help us understand how it is used.`,
  },
  {
    title: '2. Essential Cookies (always on)',
    body: `These are required for the site to work and cannot be switched off:

• Authentication: keeps you signed in to your account and the PM tool.
• Preferences: remembers lightweight choices such as your cookie decision and onboarding state.

These do not track you for advertising and are not shared with third parties.`,
  },
  {
    title: '3. Analytics Cookies (only with your consent)',
    body: `We load these only after you click "Accept" on the cookie banner:

• Google Analytics (G-VFDQ5CD808): aggregate traffic and usage statistics.
• Microsoft Clarity: anonymised usage insights and session trends.

If you decline, these are never loaded. We also never load analytics on non-production environments.`,
  },
  {
    title: '4. Managing Your Choice',
    body: `You can change your mind at any time:

• Decline or accept using the cookie banner shown on your first visit.
• To reset your choice, clear this site's data (cookies and localStorage) in your browser settings and reload — the banner will appear again.
• You can also block cookies entirely in your browser, though some features (like staying signed in) may stop working.`,
  },
  {
    title: '5. Third-Party Services',
    body: `Some features rely on third-party services that may set their own cookies when you use them, for example Razorpay (payments) during checkout and Cal.com when you open the booking widget. These are governed by those providers' own policies.`,
  },
  {
    title: '6. Contact',
    body: `Questions about our use of cookies? Email connect@vikku.in.`,
  },
]

export default function CookiePolicy() {
  usePageMeta({
    title:       'Cookie Policy - Vikku',
    description: 'How Vikku uses cookies and analytics, and how to manage your choice.',
    url:         'https://vikku.in/cookies',
  })
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-10">
          <ArrowLeft size={15} /> Back to Home
        </Link>
        <div className="mb-10">
          <h1 className="font-display font-extrabold text-4xl text-white mb-3">Cookie Policy</h1>
          <p className="text-white/40 text-sm">Last updated: September 2026</p>
        </div>
        <p className="text-white/60 text-sm leading-relaxed mb-10">
          This Cookie Policy explains how Vikku ("we", "us") uses cookies and similar technologies on vikku.in.
          Analytics cookies are loaded only with your consent. See also our{' '}
          <Link to="/privacy" className="text-[var(--brand-primary)] hover:underline">Privacy Policy</Link>.
        </p>
        <div className="space-y-8">
          {SECTIONS.map(({ title, body }) => (
            <div key={title} className="glass rounded-2xl p-6">
              <h2 className="font-display font-semibold text-white text-base mb-3">{title}</h2>
              <p className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
