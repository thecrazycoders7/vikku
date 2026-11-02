import assert from 'node:assert/strict'
import { currenciesIn, financeCsv, financePeriods, financeView, monthlyTotals, niceMax } from './financeUtils.js'

const now = new Date(2026, 10, 2)
const [thisMonth, lastMonth, thisFy, lastFy, all] = financePeriods(now)
assert.deepEqual([thisMonth.from, thisMonth.to], ['2026-11-01', '2026-11-30'])
assert.deepEqual([lastMonth.from, lastMonth.to], ['2026-10-01', '2026-10-31'])
assert.deepEqual([thisFy.from, thisFy.to, thisFy.label], ['2026-04-01', '2027-03-31', 'FY 2026-27'])
assert.deepEqual([lastFy.from, lastFy.to], ['2025-04-01', '2026-03-31'])
// January to March still belongs to the year that began the April before.
assert.equal(financePeriods(new Date(2027, 1, 15))[2].label, 'FY 2026-27')
assert.equal(financePeriods(new Date(2027, 3, 1))[2].label, 'FY 2027-28')

const data = {
  clients: [{ id: 'a', name: 'Asha', company: 'Acme' }, { id: 'b', name: 'Ravi', company: '' }],
  projects: [{ id: 'p1', client_id: 'b' }],
  retainers: [{ amount: 20000, currency: 'INR', status: 'active' }, { amount: 5000, currency: 'INR', status: 'paused' }],
  payments: [
    { client_id: 'a', amount: 100000, currency: 'INR', status: 'received', paid_on: '2026-11-01' },
    { client_id: 'b', amount: 50000, currency: 'INR', status: 'received', paid_on: '2026-10-31' },
    { client_id: 'a', amount: 999, currency: 'USD', status: 'received', paid_on: '2026-11-01' },
    { client_id: 'a', amount: 30000, currency: 'INR', status: 'pending', due_on: '2026-10-01' },
    { client_id: 'b', amount: 10000, currency: 'INR', status: 'pending', due_on: '2026-12-01' },
  ],
  expenses: [
    { amount: 8000, currency: 'INR', category: 'tools', spent_on: '2026-11-01' },
    { amount: 20000, currency: 'INR', category: 'freelancer', spent_on: '2026-11-01', client_id: 'a' },
    { amount: 5000, currency: 'INR', category: 'freelancer', spent_on: '2026-10-05', project_id: 'p1' },
  ],
}

const v = financeView(data, thisMonth, 'INR', now)
assert.equal(v.moneyIn, 100000, 'pending and USD stay out, and the 31 Oct payment is last month')
assert.equal(v.moneyOut, 28000)
assert.equal(v.profit, 72000)
assert.equal(v.margin, 72)
assert.equal(v.toCollect, 40000)
assert.equal(v.overdue, 30000)
assert.equal(v.overdueCount, 1)
assert.equal(v.retainers, 20000)
assert.deepEqual(v.byCategory.map(c => c.id), ['freelancer', 'tools'])
assert.deepEqual(v.byClient.map(c => [c.name, c.profit]), [['Acme', 80000], ['Not linked to a client', -8000]])

const october = financeView(data, lastMonth, 'INR', now)
assert.deepEqual(october.byClient.map(c => [c.name, c.in, c.out]), [['Ravi', 50000, 5000]], 'a project expense counts against its client')
assert.equal(financeView(data, all, 'USD', now).moneyIn, 999)
assert.equal(financeView({ ...data, payments: [] , expenses: [] }, thisMonth, 'INR', now).margin, null)

const months = monthlyTotals(data, 'INR', now)
assert.equal(months.length, 12)
assert.equal(months[0].key, '2025-12')
assert.deepEqual([months[10].in, months[10].out, months[11].in, months[11].out], [50000, 5000, 100000, 28000])
assert.deepEqual(currenciesIn(data), ['INR', 'USD'])

assert.equal(niceMax(137000), 150000)
assert.equal(niceMax(210000), 250000)
assert.equal(niceMax(100000), 100000)
assert.equal(niceMax(0), 1)

const csv = financeCsv({ ...data, expenses: [...data.expenses, { amount: 1, currency: 'INR', category: 'other', spent_on: '2026-11-02', description: '=HYPERLINK("x"), test' }] }, thisMonth)
const rows = csv.split('\n')
assert.equal(rows[0], 'Date,Type,Client,Category,Description,Reference,Currency,Amount')
assert.equal(rows.length, 6, 'header + 2 payments in both currencies + 3 expenses')
assert.ok(csv.includes(`"'=HYPERLINK(""x""), test"`), 'formulas are kept as text')
console.log('financeUtils: all checks passed')
