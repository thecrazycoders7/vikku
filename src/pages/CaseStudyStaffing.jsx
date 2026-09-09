import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import { trackCaseStudyView } from '../utils/analytics'
import { ArrowLeft, CheckCircle2, Users, FileText, Clock, BarChart2, Building2, Settings, Briefcase, DollarSign, User, GitBranch, ClipboardList, Receipt, UserCheck, ShieldCheck } from 'lucide-react'

const problems = [
  'Tracked employees across WhatsApp groups - messages got lost',
  'Timesheets submitted via Excel - manual errors and delays',
  'Documents (visas, contracts, IDs) stored across email threads',
  'No visibility for clients on project status or hours',
  'Payroll calculations done manually each month',
  'Zero audit trail - no history of approvals or changes',
]

const solution = [
  { icon: Settings,   title: 'Admin Dashboard',     desc: 'Full control over employees, clients, projects, and reports from one screen.' },
  { icon: FileText,   title: 'Document Management', desc: 'Upload and manage resumes, visas, I-9s, offer letters, and IDs in one place.' },
  { icon: Clock,      title: 'Timesheet System',     desc: 'Employees log hours daily. Clients approve. Payroll auto-calculates.' },
  { icon: Building2,  title: 'Client Portal',        desc: 'Clients view their assigned consultants, approve timesheets, and track project status.' },
  { icon: BarChart2,  title: 'Reports & Analytics',  desc: 'Revenue, hours, headcount, and compliance reports - exportable at any time.' },
]

const roles = [
  {
    id: 'admin',
    name: 'Admin',
    access: 'Full system access',
    icon: Settings,
    title: 'Admin Portal',
    description: 'Complete control over all modules, users, settings, and data across the entire platform.',
    features: [
      { icon: Users, title: 'Employee Management', desc: 'Add, edit, approve and deactivate any employee or consultant in the system.' },
      { icon: Building2, title: 'Client Management', desc: 'Create and manage all client accounts, contracts, and billing configurations.' },
      { icon: GitBranch, title: 'Project Oversight', desc: 'View and manage every employee-client project assignment across the org.' },
      { icon: ClipboardList, title: 'Timesheet Control', desc: 'Access, review, approve or reject any timesheet across all employees.' },
      { icon: Receipt, title: 'Invoicing & Billing', desc: 'Full invoice generation, status management, and payment tracking.' },
      { icon: BarChart2, title: 'All Reports', desc: 'Access every report type - employee, client, financial, and operational.' },
      { icon: UserCheck, title: 'User Management', desc: 'Create portal users, assign roles, and manage permissions system-wide.' },
      { icon: ShieldCheck, title: 'System Settings', desc: 'Configure notifications, data retention, compliance policies, and audit logs.' },
    ],
    metrics: ['Total Employees', 'Active Clients', 'Active Projects', 'Revenue This Month', 'Pending Approvals'],
  },
  {
    id: 'hr',
    name: 'HR Team',
    access: 'Onboarding & docs',
    icon: Users,
    title: 'HR Portal',
    description: 'Manage employee onboarding, documents, and profile information from a dedicated workspace.',
    features: [
      { icon: FileText, title: 'Document Upload', desc: 'Upload and manage resumes, visas, I-9s, offer letters, and IDs in one place.' },
      { icon: UserCheck, title: 'Profile Management', desc: 'Update employee details, contact info, and emergency contacts.' },
      { icon: ClipboardList, title: 'Onboarding Checklist', desc: 'Track completion of all required onboarding tasks and documents.' },
      { icon: ShieldCheck, title: 'Compliance Tracking', desc: 'Monitor visa expiration dates, work permits, and certification renewals.' },
    ],
    metrics: ['New Hires This Month', 'Pending Onboarding', 'Expiring Documents', 'Active Employees'],
  },
  {
    id: 'ops',
    name: 'Operations / PM',
    access: 'Assignments & projects',
    icon: Briefcase,
    title: 'Operations Portal',
    description: 'Assign employees to projects, track status, and manage client deliverables.',
    features: [
      { icon: GitBranch, title: 'Project Assignment', desc: 'Assign employees to client projects and manage allocation percentages.' },
      { icon: Building2, title: 'Client Coordination', desc: 'Communicate with clients on project status and resource needs.' },
      { icon: ClipboardList, title: 'Timesheet Review', desc: 'Review and approve timesheets for assigned projects before client sign-off.' },
      { icon: BarChart2, title: 'Utilization Reports', desc: 'Track employee utilization rates and project profitability.' },
    ],
    metrics: ['Active Projects', 'Open Assignments', 'Pending Timesheets', 'Utilization Rate'],
  },
  {
    id: 'finance',
    name: 'Finance',
    access: 'Invoices & payments',
    icon: DollarSign,
    title: 'Finance Portal',
    description: 'Generate invoices, track payments, and manage financial reporting.',
    features: [
      { icon: Receipt, title: 'Invoice Generation', desc: 'Auto-generate invoices based on approved timesheets and billing rates.' },
      { icon: BarChart2, title: 'Revenue Tracking', desc: 'Monitor revenue by client, project, and time period.' },
      { icon: ClipboardList, title: 'Payment Status', desc: 'Track invoice status, payment due dates, and aging reports.' },
      { icon: ShieldCheck, title: 'Financial Reports', desc: 'Export financial statements, tax reports, and payroll summaries.' },
    ],
    metrics: ['Invoices This Month', 'Outstanding Balance', 'Revenue YTD', 'Days Sales Outstanding'],
  },
  {
    id: 'employee',
    name: 'Employee',
    access: 'Timesheets & profile',
    icon: User,
    title: 'Employee Portal',
    description: 'Log hours, view assignments, and manage personal profile information.',
    features: [
      { icon: Clock, title: 'Time Logging', desc: 'Submit daily timesheets with project and task breakdown.' },
      { icon: GitBranch, title: 'My Assignments', desc: 'View current project assignments, clients, and allocation percentages.' },
      { icon: FileText, title: 'My Documents', desc: 'Access and update personal documents, certifications, and contact info.' },
      { icon: Receipt, title: 'Timesheet History', desc: 'View past timesheets, approval status, and payment history.' },
    ],
    metrics: ['Hours This Week', 'Hours This Month', 'Current Projects', 'Pending Timesheets'],
  },
]

const results = [
  '5+ tools replaced by a single platform',
  'Timesheet approval time reduced from days to hours',
  'Zero lost documents - everything in one place',
  'Clients onboarded with their own portal access',
  'Payroll errors eliminated with automated calculations',
  'Full audit trail on every action in the system',
]

export default function CaseStudyStaffing() {
  const navigate = useNavigate()
  const [expandedRole, setExpandedRole] = useState('admin')

  usePageMeta({
    title:       'Staffing & HR Platform - Vikku Case Study',
    description: 'How Vikku built a unified staffing & HR platform for Jobly Solutions and Unisys Infotech, replacing WhatsApp, Excel, and 5+ tools with one system.',
    url:         'https://vikku.in/work/staffing-platform',
  })
  useEffect(() => { window.scrollTo(0, 0); trackCaseStudyView('staffing-platform', 'Staffing & HR Platform') }, [])

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
          <span className="text-xs text-white font-mono">Case Study 01</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">

        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-tag">01</span>
            <span className="section-tag">Staffing & HR</span>
            <span className="section-tag">SaaS Platform</span>
          </div>
          <h1
            className="font-display font-extrabold text-white mb-6 leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
          >
            Staffing & HR<br />
            <span className="text-white">Management Platform</span>
          </h1>
          <p className="text-white text-base leading-relaxed max-w-2xl">
            End-to-end workforce management for staffing agencies - employee onboarding, client contracts, timesheets, invoicing, and analytics.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { label: 'Client', value: 'Jobly Solutions + Unisys Infotech' },
              { label: 'Industry', value: 'Staffing & Recruitment' },
              { label: 'Timeline', value: '4 months' },
              { label: 'Stack', value: 'React · Node.js · PostgreSQL' },
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
            A fast-growing staffing agency managing 50+ consultants across multiple clients - with zero proper tooling.
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
            A full-stack staffing platform with 5 role types, real-time data, and complete workflow automation.
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

        {/* Role-Based Access */}
        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">Role-Based Access</h2>
          <p className="text-white text-sm mb-8">
            Each role sees exactly what they need - no more, no less.
          </p>
          <div className="glass rounded-xl p-4">
            <p className="text-[10px] text-white uppercase tracking-widest mb-4">Key Users - click a role to explore</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {roles.map((role) => {
                const Icon = role.icon
                const isSelected = expandedRole === role.id
                return (
                  <button
                    key={role.id}
                    onClick={() => setExpandedRole(role.id)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg transition-all duration-300 text-left"
                    style={{
                      background: isSelected ? 'rgba(59,111,240,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid rgba(59,111,240,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Icon size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold leading-none mb-0.5 text-white">{role.name}</p>
                      <p className="text-[10px] text-white">{role.access}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            {expandedRole && (() => {
              const selectedRole = roles.find(r => r.id === expandedRole)
              if (!selectedRole) return null
              const RoleIcon = selectedRole.icon
              return (
                <div className="glass-strong rounded-xl p-6 mt-3 overflow-visible">
                  <div className="flex items-start gap-4 mb-8 pb-6 border-b border-white/[0.06]">
                    <div className="w-9 h-9 rounded-lg glass flex items-center justify-center flex-shrink-0">
                      <RoleIcon size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-base mb-1">{selectedRole.title}</h3>
                      <p className="text-white text-xs leading-relaxed max-w-2xl">{selectedRole.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-6">
                    {selectedRole.features.map((feature) => {
                      const FeatureIcon = feature.icon
                      return (
                        <div key={feature.title} className="glass rounded-lg p-4 group hover:border-white/15 transition-all">
                          <div className="w-8 h-8 rounded-lg glass flex items-center justify-center mb-4 group-hover:border-white/20 transition-all">
                            <FeatureIcon size={12} className="text-white group-hover:text-white/70 transition-colors" />
                          </div>
                          <p className="font-display font-semibold text-xs text-white mb-1.5">{feature.title}</p>
                          <p className="text-[10px] text-white leading-relaxed">{feature.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                  <div>
                    <p className="text-[9px] text-white uppercase tracking-widest mb-2.5">Dashboard Metrics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRole.metrics.map((metric) => (
                        <span key={metric} className="glass px-2.5 py-1 rounded-lg text-[10px] text-white">{metric}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Results */}
        <div className="mb-14">
          <h2 className="font-display font-bold text-lg text-white mb-2">The Results</h2>
          <p className="text-white text-sm mb-8">
            Deployed and adopted within the first week. The team never went back.
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

        {/* CTA */}
        <div className="glass rounded-xl p-8 text-center">
          <h3 className="font-display font-bold text-lg text-white mb-3">Have a similar challenge?</h3>
          <p className="text-white text-sm mb-6 max-w-sm mx-auto">
            We have built this before. Tell us about your operation and we will scope a solution.
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
