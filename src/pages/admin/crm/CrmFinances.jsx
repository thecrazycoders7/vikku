import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Plus, Wallet } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { ExpenseForm } from './Forms'
import { EmptyState, KpiCard, Panel } from '../ui'
import { EXPENSE_CATEGORIES, PAYMENT_KINDS, formatMoney, labelOf, listClients, listExpenses, listPayments, listProjects, listRetainers } from '../../../lib/crmService'
import { currenciesIn, financeCsv, financePeriods, financeView, monthlyTotals, niceMax } from '../../../lib/financeUtils'

// Series colours are checked for contrast and colour blindness; money in is blue, money out orange everywhere.
const IN = '#2A78D6', OUT = '#EA580C'
const EMPTY = { payments: [], expenses: [], retainers: [], clients: [], projects: [] }

const compact = (n, currency) => new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 2 }).format(n)

function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
      {[['Money in', IN], ['Money out', OUT]].map(([label, color]) => (
        <span key={label} className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />{label}</span>
      ))}
    </div>
  )
}

function MonthlyChart({ months, currency }) {
  const [active, setActive] = useState(null)
  const top = niceMax(Math.max(...months.flatMap(m => [m.in, m.out])))
  return (
    <div className="flex gap-2" role="img" aria-label="Money in and out for each of the last 12 months. The same numbers are in the table view.">
      <div className="flex h-56 w-12 flex-none flex-col justify-between pb-6 text-right text-[11px] tabular-nums text-slate-400">
        <span className="-translate-y-1.5">{compact(top, currency)}</span>
        <span>{compact(top / 2, currency)}</span>
        <span className="translate-y-1.5">{compact(0, currency)}</span>
      </div>
      <div className="relative min-w-0 flex-1">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-slate-100" />
        <div aria-hidden="true" className="absolute inset-x-0 top-[calc((100%-1.5rem)/2)] border-t border-slate-100" />
        <div className="relative flex h-56">
          {months.map((m, i) => (
            <div key={m.key} tabIndex={0} aria-label={`${m.title}: ${formatMoney(m.in, currency)} in, ${formatMoney(m.out, currency)} out`}
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
              className={`relative flex min-w-0 flex-1 flex-col rounded outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${active === i ? 'bg-slate-50' : ''}`}>
              <div className="flex flex-1 items-end justify-center gap-0.5 border-b border-slate-300 px-px">
                {[[m.in, IN], [m.out, OUT]].map(([value, color]) => (
                  <span key={color} className="block w-full max-w-[18px] rounded-t" style={{ height: value ? `max(${(value / top) * 100}%, 2px)` : 0, background: color }} />
                ))}
              </div>
              <span className={`h-6 pt-1.5 text-center text-[11px] text-slate-500 ${i % 2 ? 'invisible sm:visible' : ''}`}>{m.label}</span>
              {active === i && (
                <div role="tooltip" className={`absolute bottom-full z-10 mb-1 w-44 rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-md ${i < 3 ? 'left-0' : i > 8 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                  <p className="mb-1 font-medium text-slate-900">{m.title}</p>
                  {[['Money in', m.in], ['Money out', m.out], ['Profit', m.in - m.out]].map(([k, v]) => (
                    <p key={k} className="flex justify-between gap-3 text-slate-600"><span>{k}</span><span className="tabular-nums text-slate-900">{formatMoney(v, currency)}</span></p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MonthlyTable({ months, currency }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead><tr className="text-left text-xs text-slate-500"><th className="py-1.5 font-medium">Month</th>{['Money in', 'Money out', 'Profit'].map(h => <th key={h} className="py-1.5 text-right font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100 tabular-nums text-slate-900">
          {[...months].reverse().map(m => <tr key={m.key}><td className="py-1.5">{m.title}</td><td className="text-right">{formatMoney(m.in, currency)}</td><td className="text-right">{formatMoney(m.out, currency)}</td><td className="text-right">{formatMoney(m.in - m.out, currency)}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

export default function CrmFinances() {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const periods = useMemo(() => financePeriods(), [])
  const [periodId, setPeriodId] = useState('this-fy')
  const [currency, setCurrency] = useState('INR')
  const [asTable, setAsTable] = useState(false)
  const [adding, setAdding] = useState(false)

  const load = async () => {
    setError('')
    try {
      const [payments, expenses, retainers, clients, projects] = await Promise.all([listPayments(), listExpenses(), listRetainers(), listClients(), listProjects()])
      setData({ payments, expenses, retainers, clients, projects })
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const period = periods.find(p => p.id === periodId)
  const view = useMemo(() => financeView(data, period, currency), [data, period, currency])
  const months = useMemo(() => monthlyTotals(data, currency), [data, currency])
  const currencies = currenciesIn(data)
  const money = (n) => formatMoney(n, currency)
  const nothingYet = !loading && !data.payments.length && !data.expenses.length
  const biggest = view.byCategory[0]?.amount || 1

  const exportCsv = () => {
    const blob = new Blob([financeCsv(data, period, (c) => labelOf([...EXPENSE_CATEGORIES, ...PAYMENT_KINDS], c))], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `vikku-labs-finances-${period.label.toLowerCase().replace(/\s+/g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <AdminLayout>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="mr-auto min-w-0">
          <h1 className="font-display text-lg font-bold text-slate-900">Finances</h1>
          <p className="text-xs text-slate-500">What came in, what went out and what's left</p>
        </div>
        <select aria-label="Period" value={periodId} onChange={e => setPeriodId(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900">
          {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        {currencies.length > 1 && (
          <select aria-label="Currency" value={currency} onChange={e => setCurrency(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <button type="button" onClick={exportCsv} className="act h-8"><Download size={13} className="mr-1" /> Export CSV</button>
        <button type="button" onClick={() => setAdding(true)} className="btn-primary flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs"><Plus size={13} /> Add expense</button>
      </div>

      {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Money in" value={money(view.moneyIn)} sub={period.label} />
        <KpiCard label="Money out" value={money(view.moneyOut)} sub={period.label} />
        <KpiCard label="Profit" value={money(view.profit)} sub={view.margin === null ? 'No money in yet' : `${view.margin}% of money in`} />
        <KpiCard label="Still to collect" value={money(view.toCollect)} to="/admin/crm/payments" sub={view.overdueCount ? `${money(view.overdue)} overdue · ${view.overdueCount} payment${view.overdueCount === 1 ? '' : 's'}` : 'Nothing overdue'} />
      </div>

      {nothingYet ? (
        <Panel><EmptyState icon={Wallet} title="No money recorded yet">Record payments on the Payments page and add your expenses here. Your profit and charts will build from those.</EmptyState></Panel>
      ) : (
        <div className="space-y-4">
          <Panel title="Last 12 months" action={<button type="button" className="act" onClick={() => setAsTable(t => !t)}>{asTable ? 'View as chart' : 'View as table'}</button>}>
            <div className="space-y-3 p-5">
              {asTable ? <MonthlyTable months={months} currency={currency} /> : <><Legend /><MonthlyChart months={months} currency={currency} /></>}
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title={`Where the money went · ${period.label}`}>
              {view.byCategory.length === 0 ? <EmptyState icon={Wallet} title="No expenses in this period" /> : (
                <ul className="space-y-3 p-5">
                  {view.byCategory.map(c => (
                    <li key={c.id}>
                      <div className="mb-1 flex justify-between gap-3 text-[13px]"><span className="text-slate-700">{labelOf(EXPENSE_CATEGORIES, c.id)}</span><span className="tabular-nums text-slate-900">{money(c.amount)}</span></div>
                      <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded" style={{ width: `${(c.amount / biggest) * 100}%`, background: OUT }} /></div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title={`Profit by client · ${period.label}`}>
              {view.byClient.length === 0 ? <EmptyState icon={Wallet} title="Nothing in this period" /> : (
                <div className="overflow-x-auto px-5 py-3">
                  <table className="w-full text-[13px]">
                    <thead><tr className="text-left text-xs text-slate-500"><th className="py-1.5 font-medium">Client</th>{['In', 'Out', 'Profit'].map(h => <th key={h} className={`py-1.5 pl-3 text-right font-medium ${h === 'Profit' ? '' : 'hidden sm:table-cell'}`}>{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100 tabular-nums">
                      {view.byClient.map(c => (
                        <tr key={c.id || 'none'}>
                          <td className="max-w-[160px] truncate py-2 text-slate-900">{c.id ? <Link to={`/admin/crm/clients/${c.id}`} className="hover:text-orange-700">{c.name}</Link> : <span className="text-slate-500">{c.name}</span>}</td>
                          <td className="hidden pl-3 text-right text-slate-600 sm:table-cell">{money(c.in)}</td>
                          <td className="hidden pl-3 text-right text-slate-600 sm:table-cell">{money(c.out)}</td>
                          <td className="pl-3 text-right font-medium text-slate-900">{money(c.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-slate-500">Link an expense to a client when you add it, so it counts against them.</p>
                </div>
              )}
            </Panel>
          </div>

          <p className="text-xs text-slate-500">
            Monthly retainers: {money(view.retainers)}. Money in counts payments marked received on the <Link to="/admin/crm/payments" className="underline hover:text-slate-900">Payments page</Link>. INR and USD are never converted or added together.
          </p>
        </div>
      )}

      {adding && <ExpenseForm clients={data.clients} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); load() }} />}
    </AdminLayout>
  )
}
