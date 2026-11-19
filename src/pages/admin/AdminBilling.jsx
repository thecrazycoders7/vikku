import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { RefreshCw, Copy, Check, CreditCard } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { Badge, DataTable, EmptyState, ErrorState, PageHead } from './ui'
import { getAdminBilling } from '../../lib/adminService'
import { monthlyRevenue } from '../../lib/razorpayService'

const PLAN_TONE = { free: 'slate', pro: 'violet', team: 'blue' }
const STATUS_TONE = { active: 'green', cancelled: 'red', expired: 'amber', cancelling: 'amber' }

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  if (!text) return <span className="text-slate-400">-</span>
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} aria-label={`Copy Razorpay ID ${text}`} className="btn btn-ghost btn-sm font-mono !text-[12px] text-slate-600">
      {text.slice(0, 12)}…
      {copied ? <Check size={14} className="text-[var(--green)]" /> : <Copy size={14} />}
    </button>
  )
}

function fmt(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminBilling() {
  const [subs, setSubs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await getAdminBilling()
      setSubs(d.subscriptions || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useAutoRefresh(load)

  const activePro   = subs.filter(s => s.plan === 'pro'  && (s.status === 'active' || s.status === 'cancelling'))
  const activeTeam  = subs.filter(s => s.plan === 'team' && (s.status === 'active' || s.status === 'cancelling'))
  const mrr         = Math.round([...activePro, ...activeTeam].reduce((sum, s) => sum + monthlyRevenue(s.plan, s.billing_cycle), 0))
  const arr         = mrr * 12
  const cancelled   = subs.filter(s => s.status === 'cancelled').length
  const churnRate   = subs.length > 0 ? ((cancelled / subs.length) * 100).toFixed(1) : '0.0'
  const thisMonth   = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const netNew      = subs.filter(s => s.status === 'active' && s.updated_at >= thisMonth).length

  const columns = [
    { key: 'email', label: 'Email', sort: s => s.email?.toLowerCase(), render: s => <span className="font-mono text-[12.5px] text-slate-900 block max-w-[300px] truncate">{s.email}</span> },
    { key: 'plan', label: 'Plan', sort: s => ({ free: 0, pro: 1, team: 2 })[s.plan] ?? 0, render: s => <Badge tone={PLAN_TONE[s.plan] || 'slate'}><span className="capitalize">{s.plan}</span></Badge> },
    { key: 'status', label: 'Status', sort: s => s.status, render: s => <Badge tone={STATUS_TONE[s.status] || 'slate'}><span className="capitalize">{s.status}</span></Badge> },
    { key: 'razorpay', label: 'Razorpay ID', className: 'max-lg:hidden', render: s => <CopyBtn text={s.razorpay_payment_id} /> },
    { key: 'period', label: 'Period end', className: 'max-sm:hidden', sort: s => s.current_period_end, render: s => <span className="text-slate-600">{fmt(s.current_period_end)}</span> },
    { key: 'updated', label: 'Updated', className: 'max-md:hidden', sort: s => s.updated_at, render: s => <span className="text-slate-600">{fmt(s.updated_at)}</span> },
  ]
  const statusFilter = { key: 'status', label: 'Status', all: 'All', options: [{ value: 'active', label: 'Active' }, { value: 'cancelled', label: 'Cancelled' }], test: (s, v) => s.status === v }
  const kpis = [
    ['MRR', `₹${mrr.toLocaleString('en-IN')}`], ['ARR', `₹${(arr / 100000).toFixed(1)}L`], ['Active Paid', activePro.length + activeTeam.length],
    ['Net New MTD', netNew], ['Cancelled', cancelled], ['Churn (all-time)', `${churnRate}%`],
  ]

  return (
    <AdminLayout>
      <PageHead title="Billing">
        <button onClick={load} disabled={loading} className="btn btn-ghost text-slate-600">
          <RefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </PageHead>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-5">
        {kpis.map(([label, value]) => (
          <div key={label} className="card kpi">
            <p className="kpi-label">{label}</p>
            <p className="kpi-value">{value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {error && !subs.length ? <ErrorState title="Couldn't load billing" onRetry={load}>{error}</ErrorState> : (
          <DataTable rows={subs} columns={columns} loading={loading && !subs.length} filters={[statusFilter]} initialSort={{ key: 'updated', dir: 'desc' }}
            search={s => [s.email, s.razorpay_payment_id].filter(Boolean).join(' ')} searchLabel="Search email or Razorpay ID"
            empty={<EmptyState icon={CreditCard} title="No subscriptions yet" />} />
        )}
      </div>
    </AdminLayout>
  )
}
