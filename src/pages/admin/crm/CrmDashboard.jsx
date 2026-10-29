import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Repeat } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { MoneyTile } from './Lists'
import {
  LEAD_SOURCES, activeMrr, listClients, listExpenses, listLeads, listPayments,
  listProjects, listRetainers, moneyText, monthStats, pipelineStats,
} from '../../../lib/crmService'

function Card({ title, to, children, className = '' }) {
  return (
    <section className={`glass rounded-2xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {to && <Link to={to} className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700">View <ArrowRight size={12} /></Link>}
      </div>
      {children}
    </section>
  )
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl bg-black/[0.03] px-3 py-2.5 min-w-0">
      <p className="text-[10px] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-white break-words">{value}</p>
    </div>
  )
}

export default function CrmDashboard() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listLeads(), listClients(), listProjects(), listPayments(), listRetainers(), listExpenses()])
      .then(([leads, clients, projects, payments, retainers, expenses]) => setD({ leads, clients, projects, payments, retainers, expenses }))
      .catch(e => setError(e.message))
  }, [])

  const view = useMemo(() => {
    if (!d) return null
    const bySource = {}
    for (const l of d.leads) bySource[l.source] = (bySource[l.source] || 0) + 1
    return {
      month: monthStats(d),
      pipeline: pipelineStats(d.leads),
      bySource: LEAD_SOURCES.filter(s => bySource[s.id]).map(s => [s.label, bySource[s.id]]),
      mrr: activeMrr(d.retainers),
      count: (stage) => d.projects.filter(p => p.stage === stage).length,
    }
  }, [d])

  const monthName = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <AdminLayout>
      <div className="mb-5">
        <h1 className="font-display font-bold text-lg text-white">CRM</h1>
        <p className="text-xs text-white/40">Here's how your client business is doing · {monthName}</p>
      </div>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
      {!view ? (
        !error && <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MoneyTile label="New business" sums={view.month.revenue} hint={`${view.month.newProjects} new project(s) this month`} />
            <MoneyTile label="Received" sums={view.month.received} tone="text-emerald-600" hint="Payments collected this month" />
            <MoneyTile label="Expenses" sums={view.month.expenses} tone="text-rose-600" hint="Tools, freelancers and other costs" />
            <MoneyTile label="Money in account" sums={view.month.net} tone="text-orange-600" hint="Received minus expenses" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Sales pipeline" to="/admin/crm/leads">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Mini label="Open" value={view.pipeline.open} />
                <Mini label="Pipeline" value={moneyText(view.pipeline.pipeline)} />
                <Mini label="Won / month" value={view.pipeline.wonThisMonth} />
                <Mini label="Win rate" value={`${view.pipeline.winRate}%`} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-white/40 mr-1">Leads by source</span>
                {view.bySource.length ? view.bySource.map(([label, n]) => <span key={label} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{label} {n}</span>) : <span className="text-white/30">No leads yet</span>}
              </div>
            </Card>

            <Card title="Projects" to="/admin/crm/projects">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Mini label="New" value={view.count('new')} />
                <Mini label="Ongoing" value={view.count('ongoing')} />
                <Mini label="Completed" value={view.count('completed')} />
                <Mini label="Active clients" value={d.clients.filter(c => c.status === 'active').length} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                <Repeat size={13} className="text-orange-600" />
                Retainers: <span className="font-semibold text-white">{moneyText(view.mrr)}</span>/month from {d.retainers.filter(r => r.status === 'active').length} active
              </div>
            </Card>
          </div>

        </div>
      )}
    </AdminLayout>
  )
}
