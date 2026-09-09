import { useState } from 'react'
import { ArrowRight, CheckCircle2, Mail, AlertCircle } from 'lucide-react'
import { trackContactSubmit } from '../utils/analytics'

const budgets      = ['Under ₹50k', '₹50k – ₹2L', '₹2L – ₹10L', '₹10L – ₹20L', '₹20L+', 'Not sure yet']
const services     = ['Business / Corporate Website', 'E-Commerce Store', 'Product Catalog + Admin Portal', 'Staffing & HR Management Platform', 'Booking & Appointment System', 'CRM / Client Management Portal', 'Custom Web Application', 'Landing Page / Marketing Site']
const projectTypes = ['New Project (from scratch)', 'Revamp / Redesign existing', 'Add features to existing', 'Bug fixes & maintenance', 'Tech consulting only']
const timelines    = ['ASAP', 'Within 1 month', '1 – 3 months', '3 – 6 months', 'Flexible / Not sure']

export default function Contact() {
  const [form, setForm]           = useState({ name: '', email: '', company: '', phone: '', service: '', budget: '', projectType: '', timeline: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [website, setWebsite]     = useState('') // honeypot: real users leave this empty

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Honeypot: if filled, silently treat as success without sending (bot)
    if (website) {
      setSubmitted(true)
      return
    }

    setLoading(true)
    fetch('/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...form, website }),
    })
      .then((res) => { if (!res.ok) throw new Error('Failed to send'); return res.json() })
      .then(() => { setLoading(false); setSubmitted(true); trackContactSubmit(form.service || 'not specified') })
      .catch(() => { setLoading(false); setError('Something went wrong while sending your message. Please try again or email us directly at connect@vikku.in.') })
  }

  return (
    <section id="contact" className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="section-tag">Get In Touch</div>
          <h2
            className="font-display font-extrabold text-white"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}
          >
            Let&apos;s Build Something Great
          </h2>
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-3 items-start">
          {/* Form */}
          <div className="glass-strong rounded-2xl p-5 md:p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-14 gap-5 text-center">
                <div className="w-14 h-14 rounded-full glass flex items-center justify-center">
                  <CheckCircle2 size={26} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-white">Message Sent</h3>
                <p className="text-white text-sm max-w-xs">
                  We&apos;ll review your project and respond within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', phone: '', service: '', budget: '', projectType: '', timeline: '', message: '' }) }}
                  className="btn-ghost mt-2 text-sm"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot anti-spam field (hidden from real users) */}
                <div className="absolute left-[-9999px]" aria-hidden="true">
                  <label htmlFor="website-hp">Leave this field empty</label>
                  <input
                    id="website-hp"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                {error && (
                  <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {/* Row 1 - Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white mb-1.5 tracking-wider uppercase">Name *</label>
                    <input type="text" name="name" required placeholder="Jane Smith" value={form.name} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white mb-1.5 tracking-wider uppercase">Email *</label>
                    <input type="email" name="email" required placeholder="jane@company.com" value={form.email} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all" />
                  </div>
                </div>

                {/* Row 2 - Company + Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white mb-1.5 tracking-wider uppercase">Company / Organisation</label>
                    <input type="text" name="company" placeholder="Acme Inc. (optional)" value={form.company} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white mb-1.5 tracking-wider uppercase">Phone</label>
                    <input type="tel" name="phone" placeholder="+1 234 567 8900 (optional)" value={form.phone} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all" />
                  </div>
                </div>

                {/* Row 3 - Service + Budget */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white mb-1.5 tracking-wider uppercase">Service Needed</label>
                    <select name="service" value={form.service} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all cursor-pointer">
                      <option value="" disabled className="bg-black">Select…</option>
                      {services.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-white mb-1.5 tracking-wider uppercase">Budget Range</label>
                    <select name="budget" value={form.budget} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all cursor-pointer">
                      <option value="" disabled className="bg-black">Select…</option>
                      {budgets.map((b) => <option key={b} value={b} className="bg-black">{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 4 - Project Type + Timeline */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white mb-1.5 tracking-wider uppercase">Project Type</label>
                    <select name="projectType" value={form.projectType} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all cursor-pointer">
                      <option value="" disabled className="bg-black">Select…</option>
                      {projectTypes.map((p) => <option key={p} value={p} className="bg-black">{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-white mb-1.5 tracking-wider uppercase">Timeline</label>
                    <select name="timeline" value={form.timeline} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all cursor-pointer">
                      <option value="" disabled className="bg-black">Select…</option>
                      {timelines.map((t) => <option key={t} value={t} className="bg-black">{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] text-white mb-1.5 tracking-wider uppercase">Tell us about your project *</label>
                  <textarea name="message" required rows={3} placeholder="Describe your idea, goals, or any specific requirements…" value={form.message} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all resize-none" />
                </div>

                <button type="submit" disabled={loading} className="btn-primary active:scale-95 w-full justify-center py-2.5 text-xs rounded-lg flex items-center gap-2">
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <> Send Message <ArrowRight size={14} /> </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] text-white uppercase tracking-wider mb-2">Email us</p>
              <a href="mailto:connect@vikku.in" className="flex items-center gap-2 text-white hover:text-white transition-colors text-xs">
                <Mail size={14} />
                connect@vikku.in
              </a>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] text-white uppercase tracking-wider mb-2">Response time</p>
              <p className="text-white text-xs">Within 24 hours</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] text-white uppercase tracking-wider mb-3">What happens next?</p>
              <ol className="space-y-2 text-xs text-white">
                <li className="flex gap-3"><span className="text-white font-mono">01</span>We review your brief</li>
                <li className="flex gap-3"><span className="text-white font-mono">02</span>Schedule a discovery call</li>
                <li className="flex gap-3"><span className="text-white font-mono">03</span>Send a proposal & scope</li>
              </ol>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] text-white uppercase tracking-wider mb-2">Prefer to talk first?</p>
              <p className="text-white/50 text-[10px] mb-3">Book a free 30-min discovery call - no commitment.</p>
              <a
                href="mailto:connect@vikku.in?subject=Book a Discovery Call&body=Hi, I'd like to book a free 30-min call to discuss my project."
                className="block w-full text-center text-xs text-white glass rounded-lg py-2 hover:bg-white/10 transition-colors"
              >
                Book a Free Call →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
