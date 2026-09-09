import { useEffect, useRef } from 'react'
import { LayoutDashboard, ShoppingCart, Users, FileText, BarChart2, Settings } from 'lucide-react'

const webApps = [
  {
    icon: LayoutDashboard,
    title: 'Admin Dashboards',
    desc: 'Custom control panels and back-office portals with real-time data, role-based access, and complex workflows.',
  },
  {
    icon: Users,
    title: 'HR & Staffing Platforms',
    desc: 'End-to-end workforce management   employee onboarding, timesheets, client billing, and payroll in one system.',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce & Marketplaces',
    desc: 'Full-featured online stores and multi-vendor marketplaces with payments, inventory, and order management.',
  },
  {
    icon: FileText,
    title: 'CRM & Client Portals',
    desc: 'Client-facing portals and CRM systems to manage leads, contracts, communications, and project pipelines.',
  },
  {
    icon: BarChart2,
    title: 'Analytics & Reporting Tools',
    desc: 'Data-rich web apps with interactive charts, custom reports, filters, and exportable insights for any industry.',
  },
  {
    icon: Settings,
    title: 'SaaS Platforms',
    desc: 'Subscription-based web products with multi-tenancy, billing integrations, onboarding flows, and scalable APIs.',
  },
]

function AppCard({ app, index }) {
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1'
          entry.target.style.transform = 'translateY(0)'
        }
      },
      { threshold: 0.1 }
    )
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  const Icon = app.icon

  return (
    <div
      ref={cardRef}
      className="glass rounded-lg p-5 group cursor-default transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.14] hover:-translate-y-1"
      style={{
        opacity: 0,
        transform: 'translateY(20px)',
        transition: `opacity 0.5s ease ${index * 60}ms, transform 0.5s ease ${index * 60}ms, background 0.3s ease, border-color 0.3s ease`,
      }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 glass group-hover:border-white/20 transition-all">
        <Icon size={16} className="text-white" />
      </div>
      <h3 className="font-display font-semibold text-sm text-white mb-2">{app.title}</h3>
      <p className="text-xs text-white/60 leading-relaxed">{app.desc}</p>
    </div>
  )
}

export default function Services() {
  return (
    <section id="services" className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="section-tag">What We Build</div>
          <h2
            className="font-display font-extrabold text-white mb-3 leading-[1.05]"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}
          >
            Web Apps for Every Industry
          </h2>
          <p className="text-white/70 text-sm max-w-xl leading-relaxed">
            We specialise in building custom web applications   from complex enterprise platforms
            to sleek client-facing products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {webApps.map((app, i) => (
            <AppCard key={app.title} app={app} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
