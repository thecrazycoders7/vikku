import { useState } from 'react'
import {
  UserPlus,
  Building2,
  GitBranch,
  Clock,
  Receipt,
  BarChart2,
  Users,
  Briefcase,
  Settings,
  DollarSign,
  User,
  FileText,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  UserCheck,
  Link2,
  PieChart,
  CreditCard,
  AlertCircle,
  ClipboardList,
  ShieldCheck,
  Monitor,
  LayoutDashboard,
  Camera,
  Search,
  Layers,
  Info,
  Wrench,
  Phone,
  Plus,
  Pencil,
  Trash2,
  List,
  Tag,
  ImageIcon,
} from 'lucide-react'

const roleData = [
  {
    icon: Settings,
    label: 'Admin',
    desc: 'Full system access',
    summary: 'Complete control over all modules, users, settings, and data across the entire platform.',
    features: [
      { icon: Users,         title: 'Employee Management',  desc: 'Add, edit, approve and deactivate any employee or consultant in the system.' },
      { icon: Building2,     title: 'Client Management',    desc: 'Create and manage all client accounts, contracts, and billing configurations.' },
      { icon: GitBranch,     title: 'Project Oversight',    desc: 'View and manage every employee-client project assignment across the org.' },
      { icon: ClipboardList, title: 'Timesheet Control',    desc: 'Access, review, approve or reject any timesheet across all employees.' },
      { icon: Receipt,       title: 'Invoicing & Billing',  desc: 'Full invoice generation, status management, and payment tracking.' },
      { icon: BarChart2,     title: 'All Reports',          desc: 'Access every report type   employee, client, financial, and operational.' },
      { icon: UserCheck,     title: 'User Management',      desc: 'Create portal users, assign roles, and manage permissions system-wide.' },
      { icon: ShieldCheck,   title: 'System Settings',      desc: 'Configure notifications, data retention, compliance policies, and audit logs.' },
    ],
    dashboard: ['Total Employees', 'Active Clients', 'Active Projects', 'Revenue This Month', 'Pending Approvals'],
  },
  {
    icon: Users,
    label: 'HR Team',
    desc: 'Onboarding & docs',
    summary: 'Handles the full employee lifecycle   from onboarding new hires to managing compliance and documentation.',
    features: [
      { icon: UserPlus,    title: 'Employee Onboarding',    desc: 'Add new employees/consultants and enter all profile details including employment type.' },
      { icon: FileText,    title: 'Document Management',    desc: 'Upload and manage resumes, offer letters, I-9 forms, and ID proof documents.' },
      { icon: FileCheck,   title: 'Visa & Compliance',      desc: 'Track visa status, work authorization expiry dates, and SSN information.' },
      { icon: CreditCard,  title: 'Payroll Setup',          desc: 'Configure W2 / 1099 / C2C payment type and enter ACH bank details.' },
      { icon: CheckCircle2,title: 'Profile Approval',       desc: 'Review completed employee profiles and approve to set status Active.' },
    ],
    dashboard: ['New Onboardings', 'Pending Approvals', 'Visa Expiry Alerts', 'Incomplete Profiles'],
  },
  {
    icon: Briefcase,
    label: 'Operations / PM',
    desc: 'Assignments & projects',
    summary: 'Manages employee-to-client project assignments, billing rates, and project timelines.',
    features: [
      { icon: GitBranch,     title: 'Create Assignments',   desc: 'Tag employees to clients and projects with role, start/end dates, and work location.' },
      { icon: DollarSign,    title: 'Rate Configuration',   desc: 'Set bill rate and pay rate for each assignment to drive accurate invoicing.' },
      { icon: Clock,         title: 'Timesheet Monitoring', desc: 'Monitor submitted timesheets and escalate pending manager approvals.' },
      { icon: Link2,         title: 'Client Coordination',  desc: 'Manage client contacts, reporting managers, and project communication.' },
      { icon: AlertCircle,   title: 'Assignment Alerts',    desc: 'Get notified on expiring assignments, missing timesheets, and upcoming deadlines.' },
    ],
    dashboard: ['Active Assignments', 'Missing Timesheets', 'Expiring Assignments', 'Active Projects'],
  },
  {
    icon: DollarSign,
    label: 'Finance',
    desc: 'Invoices & payments',
    summary: 'Generates client invoices from approved timesheets and tracks all financial activity.',
    features: [
      { icon: Receipt,      title: 'Invoice Generation',   desc: 'Auto-generate invoices from approved timesheets   Hours × Bill Rate = Amount.' },
      { icon: CheckCircle2, title: 'Payment Tracking',     desc: 'Track invoice lifecycle: Draft → Sent → Paid / Overdue.' },
      { icon: TrendingUp,   title: 'Revenue Reports',      desc: 'View monthly revenue, profitability by client, and payment received reports.' },
      { icon: AlertCircle,  title: 'Overdue Alerts',       desc: 'Get notified on overdue invoices and take action before they age further.' },
      { icon: PieChart,     title: 'Financial Analytics',  desc: 'Profitability reports, outstanding summaries, and revenue trend dashboards.' },
    ],
    dashboard: ['Pending Invoices', 'Outstanding Payments', 'Revenue This Month', 'Overdue Invoices'],
  },
  {
    icon: User,
    label: 'Employee',
    desc: 'Timesheets & profile',
    summary: 'Submits weekly timesheets, views current assignments, and manages their own profile and documents.',
    features: [
      { icon: Clock,        title: 'Timesheet Submission', desc: 'Log daily hours per week for each assigned project and submit for approval.' },
      { icon: GitBranch,    title: 'View Assignments',     desc: 'See current and past client/project assignments and billing details.' },
      { icon: UserPlus,     title: 'Profile Management',   desc: 'Update personal information, bank details, and upload required documents.' },
      { icon: CheckCircle2, title: 'Approval Tracking',    desc: 'Track real-time timesheet status: Draft, Submitted, Approved, or Rejected.' },
      { icon: BarChart2,    title: 'Hours History',        desc: 'View total approved hours, historical timesheets, and monthly summaries.' },
    ],
    dashboard: ['Assigned Client', 'Pending Timesheets', 'Approved Hours', 'Total Hours Logged'],
  },
]

/* ── Catalog case data ───────────────────────────────────────────── */
const catalogTabs = [
  { id: 'website', icon: Monitor,          label: 'Website',     desc: 'Customer-facing pages' },
  { id: 'admin',   icon: LayoutDashboard, label: 'Admin Portal', desc: 'Product management' },
]

const websiteFeatures = [
  { icon: Search,      title: 'Product Catalog',     desc: 'Filterable product listing with category navigation, search, and sorting.' },
  { icon: Camera,      title: 'Product Detail Pages', desc: 'Rich pages with specs, images, features, and enquiry/buy CTA.' },
  { icon: Layers,      title: 'Category Pages',       desc: 'Dedicated pages for HD, IP, and WiFi/4G camera categories.' },
  { icon: Info,        title: 'About Us',             desc: 'Company story, team, certifications, and brand trust elements.' },
  { icon: Wrench,      title: 'Services Page',        desc: 'Installation, maintenance, and AMC service offerings.' },
  { icon: Phone,       title: 'Contact / Enquiry',    desc: 'Contact form, phone, WhatsApp integration, and Google Maps.' },
]

const adminFeatures = [
  { icon: Plus,    title: 'Add Product',          desc: 'Add new products with name, category, price, description, specs, and images.' },
  { icon: Pencil,  title: 'Edit Product',          desc: 'Update any product field   title, pricing, specs, availability, or images.' },
  { icon: Trash2,  title: 'Remove Product',        desc: 'Delete products from the catalog with confirmation prompt.' },
  { icon: List,    title: 'Line Item Management',  desc: 'Manage product specs as structured key-value pairs (e.g. Resolution: 4MP).' },
  { icon: Tag,     title: 'Category Management',   desc: 'Create, rename, or remove product categories and reassign items.' },
  { icon: ImageIcon, title: 'Media Management',      desc: 'Upload, reorder, or remove product images and thumbnails.' },
]

const lineItems = [
  ['Resolution',  '4MP / 8MP / 4K'],
  ['Night Vision','Up to 30m IR range'],
  ['Connectivity','WiFi 2.4GHz / 4G LTE'],
  ['Storage',     'MicroSD up to 256GB / Cloud'],
  ['IP Rating',   'IP67 Weatherproof'],
  ['Power',       'PoE / DC 12V'],
]

/* ── Case switcher cards ─────────────────────────────────────────── */
const cases = [
  {
    id:    'staffing',
    num:   '01',
    title: 'Staffing & HR Management Platform',
    desc:  'End-to-end workforce management for staffing agencies   employee onboarding, client contracts, timesheets, invoicing, and analytics.',
  },
  {
    id:    'catalog',
    num:   '02',
    title: 'Product Catalog + Admin Portal',
    desc:  'A customer-facing product website with category navigation and rich product pages, paired with a full admin portal to manage products without code.',
  },
]

/* ── NavPreview mini component ───────────────────────────────────── */
const navItems = ['Home', 'Products ▾', 'About Us', 'Services', 'Contact Us']

function NavPreview() {
  return (
    <div className="glass rounded-2xl overflow-hidden mb-6">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.05]">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/10" />)}
        </div>
        <div className="flex-1 mx-3 glass rounded-md px-3 py-1 text-[10px] text-white font-mono">
          www.client-site.com
        </div>
      </div>
      <div className="px-6 py-3 flex items-center gap-6 border-b border-white/[0.04] flex-wrap">
        <span className="font-display font-bold text-sm text-white">Brand</span>
        {navItems.map(item => (
          <span key={item} className="text-xs text-white hover:text-white/60 cursor-default transition-colors">
            {item}
          </span>
        ))}
        <button className="ml-auto text-[10px] glass px-3 py-1.5 rounded-lg text-white">Get Quote</button>
      </div>
      <div className="px-6 py-6 text-center">
        <p className="text-[10px] text-white uppercase tracking-widest mb-3">Hero Banner</p>
        <div className="w-48 h-2.5 bg-white/[0.05] rounded mx-auto mb-2" />
        <div className="w-32 h-2 bg-white/[0.03] rounded mx-auto" />
      </div>
    </div>
  )
}

/* ── Main export ─────────────────────────────────────────────────── */
export default function Solution() {
  const [activeCase, setActiveCase]         = useState('staffing')
  const [activeRole, setActiveRole]         = useState(null)
  const [activeCatalogTab, setCatalogTab]   = useState('website')

  const activeRoleData = roleData.find((r) => r.label === activeRole)

  const switchCase = (id) => {
    setActiveCase(id)
    setActiveRole(null)
    setCatalogTab('website')
  }

  return (
    <section id="solution" className="py-20 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 30%, rgba(255,255,255,0.015) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto relative">

        {/* ── Shared header ── */}
        <div className="mb-10">
          <div className="section-tag">What We Build</div>
          <h2 className="font-display font-extrabold text-white" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}>
            Real Products We&apos;ve Shipped
          </h2>
        </div>

        {/* ── Case switcher ── */}
        <div className="grid md:grid-cols-2 gap-2.5 mb-10">
          {cases.map(({ id, num, title, desc }) => {
            const isActive = activeCase === id
            return (
              <button
                key={id}
                onClick={() => switchCase(id)}
                className="text-left p-5 rounded-xl transition-all duration-300"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span className="font-mono text-[9px] text-white block mb-2.5">{num}</span>
                <h3 className={`font-display font-bold text-sm mb-2 transition-colors ${isActive ? 'text-white' : 'text-white'}`}>
                  {title}
                </h3>
                <p className={`text-[10px] leading-relaxed transition-colors ${isActive ? 'text-white' : 'text-white'}`}>
                  {desc}
                </p>
              </button>
            )
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CASE 01   Staffing & HR                                   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeCase === 'staffing' && (
          <div style={{ animation: 'fadeSlideUp 0.35s ease forwards' }}>
            <p className="text-[10px] text-white uppercase tracking-widest mb-4">
              Key Users   click a role to explore
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {roleData.map(({ icon: Icon, label, desc }) => {
                const isActive = activeRole === label
                return (
                  <button
                    key={label}
                    onClick={() => setActiveRole(isActive ? null : label)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg transition-all duration-300 text-left"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                      border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Icon size={12} className={isActive ? 'text-white' : 'text-white'} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-semibold leading-none mb-0.5 ${isActive ? 'text-white' : 'text-white'}`}>{label}</p>
                      <p className={`text-[10px] ${isActive ? 'text-white' : 'text-white'}`}>{desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Role panel */}
            {activeRoleData && (
              <div className="glass-strong rounded-xl p-6 mt-3 overflow-visible">
                <div className="flex items-start gap-4 mb-8 pb-6 border-b border-white/[0.06]">
                  <div className="w-9 h-9 rounded-lg glass flex items-center justify-center flex-shrink-0">
                    <activeRoleData.icon size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base mb-1">{activeRoleData.label} Portal</h3>
                    <p className="text-white text-xs leading-relaxed max-w-2xl">{activeRoleData.summary}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-6">
                  {activeRoleData.features.map(({ icon: FIcon, title, desc }) => (
                    <div key={title} className="glass rounded-lg p-4 group hover:border-white/15 transition-all">
                      <div className="w-8 h-8 rounded-lg glass flex items-center justify-center mb-4 group-hover:border-white/20 transition-all">
                        <FIcon size={12} className="text-white group-hover:text-white/70 transition-colors" />
                      </div>
                      <p className="font-display font-semibold text-xs text-white mb-1.5">{title}</p>
                      <p className="text-[10px] text-white leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[9px] text-white uppercase tracking-widest mb-2.5">Dashboard Metrics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRoleData.dashboard.map((m) => (
                      <span key={m} className="glass px-2.5 py-1 rounded-lg text-[10px] text-white">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CASE 02   Product Catalog                                  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeCase === 'catalog' && (
          <div style={{ animation: 'fadeSlideUp 0.35s ease forwards' }}>
            {/* Sub-tabs */}
            <div className="flex gap-2 mb-6">
              {catalogTabs.map(({ id, icon: Icon, label, desc }) => {
                const isActive = activeCatalogTab === id
                return (
                  <button
                    key={id}
                    onClick={() => setCatalogTab(id)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all duration-300"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                      border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Icon size={14} className={isActive ? 'text-white' : 'text-white'} />
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-semibold leading-none mb-0.5 ${isActive ? 'text-white' : 'text-white'}`}>{label}</p>
                      <p className={`text-[10px] ${isActive ? 'text-white' : 'text-white'}`}>{desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Website tab */}
            {activeCatalogTab === 'website' && (
              <div style={{ animation: 'fadeSlideUp 0.3s ease forwards' }}>
                <NavPreview />
                <p className="text-[10px] text-white uppercase tracking-widest mb-4">Pages & Features</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {websiteFeatures.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="glass rounded-2xl p-5 group hover:border-white/15 transition-all">
                      <div className="w-8 h-8 rounded-lg glass flex items-center justify-center mb-4 group-hover:border-white/20 transition-all">
                        <Icon size={14} className="text-white group-hover:text-white/70 transition-colors" />
                      </div>
                      <p className="font-display font-semibold text-sm text-white mb-1.5">{title}</p>
                      <p className="text-xs text-white leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin tab */}
            {activeCatalogTab === 'admin' && (
              <div style={{ animation: 'fadeSlideUp 0.3s ease forwards' }}>
                <div className="glass-strong rounded-xl p-6 mb-5">
                  <div className="flex items-start gap-4 mb-8 pb-6 border-b border-white/[0.06]">
                    <div className="w-9 h-9 rounded-lg glass flex items-center justify-center flex-shrink-0">
                      <LayoutDashboard size={15} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-base mb-1">Admin Portal</h3>
                      <p className="text-white text-xs max-w-2xl leading-relaxed">
                        A secure dashboard to manage the entire product catalog without any coding  
                        add, edit, remove products and manage all content in real time.
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {adminFeatures.map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="glass rounded-lg p-4 group hover:border-white/15 transition-all">
                        <div className="w-8 h-8 rounded-lg glass flex items-center justify-center mb-4 group-hover:border-white/20 transition-all">
                          <Icon size={12} className="text-white group-hover:text-white/70 transition-colors" />
                        </div>
                        <p className="font-display font-semibold text-xs text-white mb-1.5">{title}</p>
                        <p className="text-[10px] text-white leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line items preview */}
                <div className="glass rounded-xl p-5">
                  <p className="text-[9px] text-white uppercase tracking-widest mb-4">Line Item Example   Product Spec Table</p>
                  <div className="space-y-1">
                    {lineItems.map(([key, val]) => (
                      <div key={key} className="flex items-center gap-4 py-2 border-b border-white/[0.04] last:border-0">
                        <span className="text-[10px] text-white w-28 flex-shrink-0">{key}</span>
                        <div className="h-px flex-1 bg-white/[0.04]" />
                        <span className="text-[10px] text-white">{val}</span>
                        <div className="flex gap-1.5 ml-2">
                          <button className="w-4.5 h-4.5 glass rounded flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity">
                            <Pencil size={8} className="text-white" />
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
        )}

      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
