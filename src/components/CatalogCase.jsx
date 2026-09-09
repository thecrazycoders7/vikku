import { useState } from 'react'
import {
  Globe,
  LayoutDashboard,
  ChevronDown,
  Camera,
  Wifi,
  Shield,
  ShoppingBag,
  Plus,
  Trash2,
  Edit3,
  List,
  Tag,
  Image,
  Search,
  Phone,
  Info,
  Wrench,
  Package,
} from 'lucide-react'

const tabs = [
  { id: 'website', icon: Globe,           label: 'Website',      desc: 'Customer-facing pages' },
  { id: 'admin',   icon: LayoutDashboard, label: 'Admin Portal',  desc: 'Product management' },
]

const navItems = [
  { label: 'Home',     icon: Globe,    active: true },
  { label: 'Products', icon: Package,  dropdown: ['All Products', 'HD Cameras', 'IP Cameras', 'WiFi & 4G Cameras'] },
  { label: 'About Us', icon: Info,     active: false },
  { label: 'Services', icon: Wrench,   active: false },
  { label: 'Contact',  icon: Phone,    active: false },
]

const categories = [
  {
    icon: Camera,
    label: 'HD Cameras',
    desc: 'High-definition CCTV cameras for indoor and outdoor surveillance.',
    count: 'Multiple SKUs',
  },
  {
    icon: Shield,
    label: 'IP Cameras',
    desc: 'Network-connected IP cameras with remote viewing and smart features.',
    count: 'Multiple SKUs',
  },
  {
    icon: Wifi,
    label: 'WiFi & 4G Cameras',
    desc: 'Wireless cameras with WiFi and 4G LTE connectivity for flexible installs.',
    count: 'Multiple SKUs',
  },
]

const websiteFeatures = [
  { icon: Search,      title: 'Product Catalog',      desc: 'Filterable product listing with category navigation, search, and sorting.' },
  { icon: Camera,      title: 'Product Detail Pages',  desc: 'Rich product pages with specs, images, features, and inquiry/buy CTA.' },
  { icon: ShoppingBag, title: 'Category Pages',        desc: 'Dedicated pages for HD, IP, and WiFi/4G camera categories.' },
  { icon: Info,        title: 'About Us',              desc: 'Company story, team, certifications, and brand trust elements.' },
  { icon: Wrench,      title: 'Services Page',         desc: 'Installation, maintenance, and AMC service offerings with details.' },
  { icon: Phone,       title: 'Contact / Enquiry',     desc: 'Contact form, phone, email, WhatsApp integration, and Google Maps.' },
]

const adminFeatures = [
  { icon: Plus,          title: 'Add Product',          desc: 'Add new products with name, category, price, description, specs, and images.' },
  { icon: Edit3,         title: 'Edit Product',         desc: 'Update any product field   title, pricing, specs, availability status, or images.' },
  { icon: Trash2,        title: 'Remove Product',       desc: 'Delete products from the catalog with a single action and confirmation prompt.' },
  { icon: List,          title: 'Line Item Management', desc: 'Manage product specifications as structured key-value line items (e.g. Resolution: 4MP).' },
  { icon: Tag,           title: 'Category Management',  desc: 'Create, rename, or delete product categories and assign products to them.' },
  { icon: Image,         title: 'Media Management',     desc: 'Upload, reorder, or remove product images and thumbnails from the dashboard.' },
]

function NavPreview() {
  const [openDrop, setOpenDrop] = useState(false)

  return (
    <div className="glass rounded-xl overflow-hidden mb-5">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-white/[0.05]">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <div className="flex-1 mx-2.5 glass rounded-md px-2.5 py-1 text-[9px] text-white font-mono">
          www.yourclient.com
        </div>
      </div>

      {/* Simulated navbar */}
      <div className="px-5 py-2.5 flex items-center gap-6 border-b border-white/[0.04]">
        <span className="font-display font-bold text-xs text-white">Brand</span>
        <div className="flex items-center gap-6">
          {navItems.map(({ label, dropdown }) => (
            <div key={label} className="relative">
              <button
                className="flex items-center gap-1 text-[10px] text-white hover:text-white/70 transition-colors"
                onClick={() => dropdown && setOpenDrop(openDrop === label ? null : label)}
              >
                {label}
                {dropdown && <ChevronDown size={9} className={`transition-transform ${openDrop === label ? 'rotate-180' : ''}`} />}
              </button>
              {dropdown && openDrop === label && (
                <div className="absolute top-full left-0 mt-1 glass-strong rounded-xl py-2 min-w-[160px] z-10">
                  {dropdown.map((item) => (
                    <div key={item} className="px-4 py-1.5 text-xs text-white hover:text-white/70 hover:bg-white/[0.04] transition-all cursor-default">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="ml-auto text-[9px] glass px-2.5 py-1.5 rounded-lg text-white hover:text-white transition-colors">
          Get Quote
        </button>
      </div>

      {/* Hero hint */}
      <div className="px-5 py-6 text-center">
        <p className="text-[9px] text-white uppercase tracking-widest mb-2.5">Hero Section</p>
        <div className="w-40 h-2.5 bg-white/[0.06] rounded mx-auto mb-2" />
        <div className="w-28 h-1.5 bg-white/[0.04] rounded mx-auto" />
      </div>
    </div>
  )
}

export default function CatalogCase() {
  const [activeTab, setActiveTab] = useState('website')

  return (
    <section id="catalog" className="py-20 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 60%, rgba(255,255,255,0.012) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="mb-10">
          <div className="section-tag">Case Study</div>
          <h2
            className="font-display font-extrabold text-white mb-3"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}
          >
            Product Catalog + Admin Portal
          </h2>
          <p className="text-white text-sm max-w-2xl leading-relaxed">
            A customer-facing product website with category navigation and rich product pages  
            paired with a full admin portal to manage products, specs, and categories without touching code.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(({ id, icon: Icon, label, desc }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all duration-300"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-white'} />
                </div>
                <div className="text-left">
                  <p className={`text-xs font-semibold leading-none mb-0.5 ${isActive ? 'text-white' : 'text-white'}`}>{label}</p>
                  <p className={`text-[9px] ${isActive ? 'text-white' : 'text-white'}`}>{desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'website' && (
          <div className="animate-fade-in-fast">
            {/* Nav preview */}
            <NavPreview />

            {/* Product categories */}
            <div className="mb-6">
              <p className="text-[9px] text-white uppercase tracking-widest mb-3">Product Categories</p>
              <div className="grid md:grid-cols-3 gap-2.5 mb-5">
                {categories.map(({ icon: Icon, label, desc, count }) => (
                  <div key={label} className="glass rounded-lg p-4 group hover:border-white/15 transition-all">
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center mb-3 group-hover:border-white/20 transition-all">
                      <Icon size={13} className="text-white group-hover:text-white/70 transition-colors" />
                    </div>
                    <p className="font-display font-semibold text-xs text-white mb-1.5">{label}</p>
                    <p className="text-[10px] text-white leading-relaxed mb-2.5">{desc}</p>
                    <span className="text-[9px] glass px-2 py-1 rounded-lg text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Page features */}
            <div>
              <p className="text-[9px] text-white uppercase tracking-widest mb-3">Website Pages & Features</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {websiteFeatures.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="glass rounded-lg p-4 group hover:border-white/15 transition-all">
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center mb-4 group-hover:border-white/20 transition-all">
                      <Icon size={13} className="text-white group-hover:text-white/70 transition-colors" />
                    </div>
                    <p className="font-display font-semibold text-xs text-white mb-1.5">{title}</p>
                    <p className="text-xs text-white leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-fade-in-fast">
            {/* Admin dashboard hint */}
            <div className="glass-strong rounded-xl p-6 mb-5">
              <div className="flex items-start gap-2.5 mb-6 pb-5 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-lg glass flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base mb-1">Admin Portal</h3>
                  <p className="text-white text-xs leading-relaxed max-w-2xl">
                    A secure dashboard for the business owner to manage the entire product catalog
                    without any coding knowledge   add, edit, remove products and manage all content in real time.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {adminFeatures.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="glass rounded-lg p-4 group hover:border-white/15 transition-all">
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center mb-4 group-hover:border-white/20 transition-all">
                      <Icon size={13} className="text-white group-hover:text-white/70 transition-colors" />
                    </div>
                    <p className="font-display font-semibold text-xs text-white mb-1.5">{title}</p>
                    <p className="text-xs text-white leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Line items example */}
            <div className="glass rounded-lg p-4">
              <p className="text-[9px] text-white uppercase tracking-widest mb-4">Line Item Example   Product Spec Table</p>
              <div className="space-y-1.5">
                {[
                  ['Resolution',       '4MP / 8MP / 4K'],
                  ['Night Vision',     'Up to 30m IR range'],
                  ['Connectivity',     'WiFi 2.4GHz / 4G LTE'],
                  ['Storage',          'MicroSD up to 256GB / Cloud'],
                  ['IP Rating',        'IP67 Weatherproof'],
                  ['Power',            'PoE / DC 12V'],
                ].map(([key, val]) => (
                  <div key={key} className="flex items-center gap-4 py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-[10px] text-white w-28 flex-shrink-0">{key}</span>
                    <div className="h-px flex-1 bg-white/[0.04]" />
                    <span className="text-[10px] text-white">{val}</span>
                    <div className="flex gap-1.5 ml-2">
                      <button className="w-4.5 h-4.5 glass rounded flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity">
                        <Edit3 size={8} className="text-white" />
                      </button>
                      <button className="w-4.5 h-4.5 glass rounded flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity">
                        <Trash2 size={8} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex items-center gap-2 text-[10px] text-white hover:text-white/60 transition-colors glass px-2.5 py-1.5 rounded-lg">
                <Plus size={10} /> Add Line Item
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-fade-in-fast {
          animation: fadeInFast 0.3s ease forwards;
        }
        @keyframes fadeInFast {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
