import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { RefreshCw, Copy, Check } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { getAdminBilling } from '../../lib/adminService'
import { monthlyRevenue } from '../../lib/razorpayService'

const PLAN_STYLES = {
  free:  'bg-white/10 text-white/50',
  pro:   'bg-violet-500/20 text-violet-300',
  team:  'bg-blue-500/20 text-blue-300',
}
const STATUS_STYLES = {
  active:    'bg-green-500/15 text-green-400',
  cancelled: 'bg-red-500/15 text-red-400',
  expired:   'bg-yellow-500/15 text-yellow-400',
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  if (!text) return <span className="text-white/20">-</span>
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors font-mono">
      {text.slice(0, 12)}…
      {copied ? <Check size={9} className="text-green-400" /> : <Copy size={9} />}
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
  const [filter, setFilter]   = useState('all')

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

  const filtered = filter === 'all' ? subs : subs.filter(s =>
    filter === 'active' ? s.status === 'active' :
    filter === 'cancelled' ? s.status === 'cancelled' : true
  )

  return (
    <AdminLayout title="Billing">
      {/* Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
        <div className="glass rounded-xl p-4 text-center">
          <p className="font-display font-bold text-xl text-green-400">₹{mrr.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-white/40 mt-0.5">MRR</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="font-display font-bold text-xl text-emerald-400">₹{(arr / 100000).toFixed(1)}L</p>
          <p className="text-[10px] text-white/40 mt-0.5">ARR</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="font-display font-bold text-xl text-violet-400">{activePro.length + activeTeam.length}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Active Paid</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="font-display font-bold text-xl text-blue-400">{netNew}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Net New MTD</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="font-display font-bold text-xl text-red-400">{cancelled}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Cancelled</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="font-display font-bold text-xl text-orange-400">{churnRate}%</p>
          <p className="text-[10px] text-white/40 mt-0.5">Churn (all-time)</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {['all', 'active', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${
              filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors ml-auto"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 mb-4 text-sm text-red-400 border border-red-500/20">{error}</div>
      )}

      {loading && !subs.length ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_72px_80px_140px_96px_96px] gap-3 px-4 py-2.5 border-b border-white/[0.06] text-[10px] text-white/30 uppercase tracking-widest">
            <span>Email</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Razorpay ID</span>
            <span>Period End</span>
            <span>Updated</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-white/30">No subscriptions yet</div>
          ) : (
            filtered.map((s, i) => (
              <div
                key={s.id}
                className={`grid grid-cols-[1fr_72px_80px_140px_96px_96px] gap-3 px-4 py-3 items-center ${
                  i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''
                } hover:bg-white/[0.02] transition-colors`}
              >
                <span className="text-xs text-white/80 truncate font-mono">{s.email}</span>
                <span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PLAN_STYLES[s.plan] || PLAN_STYLES.free}`}>
                    {s.plan}
                  </span>
                </span>
                <span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status] || ''}`}>
                    {s.status}
                  </span>
                </span>
                <CopyBtn text={s.razorpay_payment_id} />
                <span className="text-xs text-white/40">{fmt(s.current_period_end)}</span>
                <span className="text-xs text-white/40">{fmt(s.updated_at)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  )
}
