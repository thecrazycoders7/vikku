import { useEffect, useMemo, useState } from 'react'
import { Repeat } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { ErrorState, KpiSkeletons, PageHead, Panel, ViewAll } from '../ui'
import { MoneyTile } from './Lists'
import {
  LEAD_SOURCES, activeMrr, listClients, listExpenses, listLeads, listPayments,
  listProjects, listRetainers, moneyText, monthStats, pipelineStats,
} from '../../../lib/crmService'

function Card({ title, to, children }) {
  return <Panel title={title} action={to && <ViewAll to={to}>View</ViewAll>} bodyClass="p-4">{children}</Panel>
}

function Mini({ label, value }) {
  return (
    <div className="rounded-ui bg-slate-100 px-3 py-2.5 min-w-0">
      <p className="text-[12px] text-slate-500">{label}</p>
      <p className="text-[14px] font-semibold text-slate-900 break-words tabular-nums">{value}</p>
    </div>
  )
}

export default function CrmDashboard() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    setError('')
    Promise.all([listLeads(), listClients(), listProjects(), listPayments(), listRetainers(), listExpenses()])
      .then(([leads, clients, projects, payments, retainers, expenses]) => setD({ leads, clients, projects, payments, retainers, expenses }))
      .catch(e => setError(e.message))
  }
  useEffect(load, [])

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
      <PageHead title="CRM" sub={`Here's how your client business is doing · ${monthName}`} />

      {error ? <div className="card"><ErrorState title="Couldn't load the CRM" onRetry={load}>{error}</ErrorState></div> : !view ? (
        <KpiSkeletons />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MoneyTile label="New business" sums={view.month.revenue} hint={`${view.month.newProjects} new project(s) this month`} />
            <MoneyTile label="Received" sums={view.month.received} tone="!text-[var(--green)]" hint="Payments collected this month" />
            <MoneyTile label="Expenses" sums={view.month.expenses} tone="!text-[var(--red)]" hint="Tools, freelancers and other costs" />
            <MoneyTile label="Money in account" sums={view.month.net} hint="Received minus expenses" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Sales pipeline" to="/admin/crm/leads">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Mini label="Open" value={view.pipeline.open} />
                <Mini label="Pipeline" value={moneyText(view.pipeline.pipeline)} />
                <Mini label="Won / month" value={view.pipeline.wonThisMonth} />
                <Mini label="Win rate" value={`${view.pipeline.winRate}%`} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px]">
                <span className="text-slate-500 mr-1">Leads by source</span>
                {view.bySource.length ? view.bySource.map(([label, n]) => <span key={label} className="inline-flex h-6 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 text-slate-700">{label} <b className="font-semibold tabular-nums">{n}</b></span>) : <span className="text-slate-500">No leads yet</span>}
              </div>
            </Card>

            <Card title="Projects" to="/admin/crm/projects">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Mini label="New" value={view.count('new')} />
                <Mini label="Ongoing" value={view.count('ongoing')} />
                <Mini label="Completed" value={view.count('completed')} />
                <Mini label="Active clients" value={d.clients.filter(c => c.status === 'active').length} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-[13px] text-slate-600">
                <Repeat size={16} aria-hidden="true" className="text-slate-400" />
                Retainers: <span className="font-semibold text-slate-900 tabular-nums">{moneyText(view.mrr)}</span>/month from {d.retainers.filter(r => r.status === 'active').length} active
              </div>
            </Card>
          </div>

        </div>
      )}
    </AdminLayout>
  )
}
