import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import { trackCaseStudyView } from '../utils/analytics'
import { ArrowLeft, CheckCircle2, Search, Camera, Phone, Layers, Wrench, ShoppingBag } from 'lucide-react'

const problems = [
  '100% offline - no website, no Google presence, zero online discovery',
  'All sales via phone calls and walk-in customers only',
  'No way for customers to browse the product range before visiting',
  'Lost business to competitors who had online catalogs',
  'No way to showcase 50+ products with specs and pricing',
  'Relied entirely on word-of-mouth - no scalable channel',
]

const solution = [
  { icon: Search,     title: 'Product Catalog',      desc: 'Filterable listing of all CCTV products with category navigation, search, and sorting.' },
  { icon: Camera,     title: 'Product Detail Pages',  desc: 'Rich pages per product with specs, resolution, night vision range, connectivity, and images.' },
  { icon: Layers,     title: 'Category Pages',        desc: 'Dedicated pages for HD Cameras, IP Cameras, and WiFi & 4G Camera categories.' },
  { icon: Wrench,     title: 'Services Page',         desc: 'Installation, AMC (Annual Maintenance Contract), and repair service offerings.' },
  { icon: Phone,      title: 'Enquiry System',        desc: 'Contact form, WhatsApp integration, and Google Maps embed for walk-in customers.' },
  { icon: ShoppingBag,title: 'Admin Portal',          desc: 'Owner can add, edit, remove products and manage specs as line items - no developer needed.' },
]

const results = [
  'Business now discoverable on Google Search and Maps',
  'Customers browse products before calling - higher quality leads',
  'WhatsApp enquiries increased within the first month of launch',
  'Owner manages product catalog independently via admin panel',
  '50+ products listed with full specs and category pages',
  'Online presence established for the first time in business history',
]

export default function CaseStudyHSO() {
  const navigate = useNavigate()

  usePageMeta({
    title:       'HSO CCTV - Taking an Offline Business Online - Vikku Case Study',
    description: 'How Vikku built a product catalog website and admin portal for HSO CCTV, taking their offline security camera business online and making it discoverable on Google.',
    url:         'https://vikku.in/work/hso-cctv',
  })
  useEffect(() => { window.scrollTo(0, 0); trackCaseStudyView('hso-cctv', 'HSO CCTV') }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={14} /> Back to Vikku
          </button>
          <span className="text-xs text-white font-mono">Case Study 02</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">

        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-tag">E-Commerce</span>
            <span className="section-tag">Offline to Online</span>
          </div>
          <h1
            className="font-display font-extrabold text-white mb-6 leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
          >
            Taking an Offline<br />
            <span className="text-white">Business Online</span>
          </h1>
          <p className="text-white text-base leading-relaxed max-w-2xl">
            HSO CCTV had been selling security cameras for years - entirely offline. No website, no Google presence, no online catalog. We built them a full product website with an admin portal they could run themselves.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: 'Client',    value: 'HSO CCTV' },
              { label: 'Industry',  value: 'Security & Surveillance' },
              { label: 'Timeline',  value: '6 weeks' },
              { label: 'Stack',     value: 'React · Node.js · MongoDB' },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-xl p-4">
                <p className="text-[10px] text-white uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm text-white font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Problem */}
        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">The Problem</h2>
          <p className="text-white text-sm mb-8">
            A well-established local business with great products and zero digital presence - invisible to anyone searching online.
          </p>
          <div className="glass rounded-xl p-6 space-y-4">
            {problems.map((p) => (
              <div key={p} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/40 mt-2 flex-shrink-0" />
                <p className="text-white text-sm leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What We Built */}
        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">What We Built</h2>
          <p className="text-white text-sm mb-8">
            A product catalog website with an admin portal - designed for a non-technical owner to manage independently.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {solution.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-xl p-5 flex gap-4 hover:border-white/15 transition-all">
                <div className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-white mb-1">{title}</p>
                  <p className="text-xs text-white leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">The Results</h2>
          <p className="text-white text-sm mb-8">
            From zero online presence to a fully operational digital storefront in 6 weeks.
          </p>
          <div className="glass rounded-xl p-6 space-y-4">
            {results.map((r) => (
              <div key={r} className="flex items-start gap-3">
                <CheckCircle2 size={14} className="text-emerald-400/60 mt-0.5 flex-shrink-0" />
                <p className="text-white text-sm leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live link */}
        <div className="glass rounded-xl p-5 flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-white uppercase tracking-wider mb-1">Live Website</p>
            <p className="text-sm text-white">hsocctv.com</p>
          </div>
          <a
            href="https://www.hsocctv.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-sm px-5 py-2.5 rounded-xl"
          >
            Visit Site
          </a>
        </div>

        {/* CTA */}
        <div className="glass rounded-xl p-8 text-center">
          <h3 className="font-display font-bold text-lg text-white mb-3">Running an offline business?</h3>
          <p className="text-white text-sm mb-6 max-w-sm mx-auto">
            We can take you online - product catalog, enquiry system, and admin portal included.
          </p>
          <button
            onClick={() => { navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100) }}
            className="btn-primary active:scale-95 px-8 py-3 rounded-xl text-sm"
          >
            Start a Conversation
          </button>
        </div>
      </div>
    </div>
  )
}
