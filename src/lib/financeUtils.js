import { activeMrr, sumByCurrency, overduePayments } from './crmUtils.js'

// Numbers for the admin Finances page (src/pages/admin/crm/CrmFinances.jsx). Pure, tested by financeUtils.test.mjs.
// Built from the CRM's payments and expenses. Each currency stands alone: INR and USD are never converted.
const dayOf = (y, m, d) => {
  const date = new Date(y, m, d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const shortYear = (y) => String(y).slice(2)

// Indian financial years run from 1 April to 31 March.
export function financePeriods(now = new Date()) {
  const y = now.getFullYear(), m = now.getMonth()
  const fy = m >= 3 ? y : y - 1
  const year = (start) => ({ label: `FY ${start}-${shortYear(start + 1)}`, from: dayOf(start, 3, 1), to: dayOf(start + 1, 2, 31) })
  return [
    { id: 'this-month', label: 'This month', from: dayOf(y, m, 1), to: dayOf(y, m + 1, 0) },
    { id: 'last-month', label: 'Last month', from: dayOf(y, m - 1, 1), to: dayOf(y, m, 0) },
    { id: 'this-fy', ...year(fy) },
    { id: 'last-fy', ...year(fy - 1) },
    { id: 'all', label: 'All time', from: '0000-01-01', to: '9999-12-31' },
  ]
}

const within = (date, { from, to }) => !!date && date.slice(0, 10) >= from && date.slice(0, 10) <= to
const total = (items) => items.reduce((sum, it) => sum + Number(it.amount || 0), 0)
const received = (payments) => payments.filter(p => p.status === 'received')

export function currenciesIn({ payments, expenses, retainers }) {
  const found = new Set(['INR'])
  for (const it of [...payments, ...expenses, ...retainers]) found.add(it.currency || 'INR')
  return [...found]
}

// The last 12 months, oldest first, whatever period is selected.
export function monthlyTotals({ payments, expenses }, currency = 'INR', now = new Date()) {
  const money = (it) => (it.currency || 'INR') === currency
  return Array.from({ length: 12 }, (_, i) => {
    const y = now.getFullYear(), m = now.getMonth() - 11 + i
    const range = { from: dayOf(y, m, 1), to: dayOf(y, m + 1, 0) }
    const date = new Date(y, m, 1)
    return {
      key: range.from.slice(0, 7),
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
      title: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      in: total(received(payments).filter(p => money(p) && within(p.paid_on, range))),
      out: total(expenses.filter(e => money(e) && within(e.spent_on, range))),
    }
  })
}

export function financeView(data, period, currency = 'INR', now = new Date()) {
  const { payments, expenses, retainers, clients, projects } = data
  const money = (it) => (it.currency || 'INR') === currency
  const paidIn = received(payments).filter(p => money(p) && within(p.paid_on, period))
  const spent = expenses.filter(e => money(e) && within(e.spent_on, period))
  const moneyIn = total(paidIn), moneyOut = total(spent), profit = moneyIn - moneyOut

  // Unpaid money and retainers are about today, so the selected period doesn't change them.
  const pending = payments.filter(p => p.status === 'pending' && money(p))
  const overdue = overduePayments(pending, dayOf(now.getFullYear(), now.getMonth(), now.getDate()))

  const byCategory = Object.entries(sumByCurrency(spent.map(e => ({ amount: e.amount, currency: e.category || 'other' }))))
    .map(([id, amount]) => ({ id, amount })).sort((a, b) => b.amount - a.amount)

  // An expense counts against a client if it names them, or names one of their projects.
  const projectClient = Object.fromEntries(projects.map(p => [p.id, p.client_id]))
  const rows = new Map()
  const row = (id) => {
    if (!rows.has(id)) {
      const client = clients.find(c => c.id === id)
      rows.set(id, { id, name: id ? (client?.company || client?.name || 'Unknown client') : 'Not linked to a client', in: 0, out: 0 })
    }
    return rows.get(id)
  }
  for (const p of paidIn) row(p.client_id).in += Number(p.amount || 0)
  for (const e of spent) row(e.client_id || projectClient[e.project_id] || null).out += Number(e.amount || 0)
  const byClient = [...rows.values()].map(r => ({ ...r, profit: r.in - r.out })).sort((a, b) => b.profit - a.profit)

  return {
    moneyIn, moneyOut, profit,
    margin: moneyIn > 0 ? Math.round((profit / moneyIn) * 100) : null,
    toCollect: total(pending), overdue: total(overdue), overdueCount: overdue.length,
    retainers: activeMrr(retainers)[currency] || 0,
    byCategory, byClient,
  }
}

// A round top for the chart's scale, so its axis labels are easy to read.
export function niceMax(value) {
  if (!(value > 0)) return 1
  const step = 10 ** Math.floor(Math.log10(value))
  return [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10].map(n => n * step).find(n => n >= value)
}

// For the CA: every received payment and expense in the period, in any currency.
export function financeCsv({ payments, expenses, clients }, period, label = (c) => c) {
  const clientName = (id) => { const c = clients.find(x => x.id === id); return c ? c.company || c.name : '' }
  const lines = [
    ...received(payments).filter(p => within(p.paid_on, period)).map(p => [p.paid_on, 'Money in', clientName(p.client_id), label(p.kind), p.notes, p.reference, p.currency || 'INR', p.amount]),
    ...expenses.filter(e => within(e.spent_on, period)).map(e => [e.spent_on, 'Money out', clientName(e.client_id), label(e.category), e.description, '', e.currency || 'INR', e.amount]),
  ].sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  // A leading = + - or @ would run as a formula in Excel, so text like that is kept as plain text.
  const cell = (v) => {
    const s = String(v ?? '')
    const safe = typeof v === 'string' && /^[=+\-@]/.test(s) ? `'${s}` : s
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
  }
  return [['Date', 'Type', 'Client', 'Category', 'Description', 'Reference', 'Currency', 'Amount'], ...lines].map(l => l.map(cell).join(',')).join('\n')
}
