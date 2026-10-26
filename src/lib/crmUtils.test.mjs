// Run: node src/lib/crmUtils.test.mjs
import assert from 'node:assert/strict'
import { pipelineStats, whatsappNumber, formatMoney } from './crmUtils.js'

const now = new Date('2026-10-26T12:00:00Z')
const leads = [
  { stage: 'new',       value: 100000, currency: 'INR', next_follow_up: '2026-10-25', updated_at: '2026-10-20' },
  { stage: 'proposal',  value: 50000,  currency: 'INR', next_follow_up: '2026-10-30', updated_at: '2026-10-21' },
  { stage: 'qualified', value: 2000,   currency: 'USD', next_follow_up: null,         updated_at: '2026-10-22' },
  { stage: 'won',       value: 80000,  currency: 'INR', next_follow_up: '2026-10-01', updated_at: '2026-10-10' },
  { stage: 'lost',      value: 9000,   currency: 'INR', next_follow_up: null,         updated_at: '2026-10-11' },
  { stage: 'won',       value: 7000,   currency: 'INR', next_follow_up: null,         updated_at: '2026-09-15' }, // last month
]
const s = pipelineStats(leads, now)
assert.equal(s.open, 3)
assert.deepEqual(s.pipeline, { INR: 150000, USD: 2000 })   // won/lost excluded, currencies kept apart
assert.equal(s.wonThisMonth, 1)
assert.equal(s.winRate, 50)                               // 1 won of 2 closed this month
assert.equal(s.followUpsDue, 1)                           // only the overdue open lead; won lead ignored
assert.equal(pipelineStats([], now).winRate, 0)

assert.equal(whatsappNumber('09393979892'), '919393979892')
assert.equal(whatsappNumber('+91 93939 79892'), '919393979892')
assert.equal(whatsappNumber('9393979892'), '919393979892')
assert.equal(whatsappNumber('+1 (415) 555-0100'), '14155550100')
assert.equal(whatsappNumber(''), null)

assert.equal(formatMoney(1100000, 'INR'), '₹11,00,000')
assert.equal(formatMoney(2500, 'USD'), '$2,500')
console.log('crmUtils: all checks passed')

// ---- Phase 2 money helpers ----
import { moneySummary, monthStats, moneyText, overduePayments, activeMrr, billingSoon } from './crmUtils.js'

const projects = [
  { stage: 'ongoing',   budget: 250000, currency: 'INR', created_at: '2026-10-05T10:00:00Z' },
  { stage: 'new',       budget: 4000,   currency: 'USD', created_at: '2026-10-20T10:00:00Z' },
  { stage: 'cancelled', budget: 99999,  currency: 'INR', created_at: '2026-10-21T10:00:00Z' },
  { stage: 'completed', budget: 80000,  currency: 'INR', created_at: '2026-09-02T10:00:00Z' },
]
const payments = [
  { status: 'received', amount: 100000, currency: 'INR', paid_on: '2026-10-06' },
  { status: 'received', amount: 80000,  currency: 'INR', paid_on: '2026-09-10' },
  { status: 'received', amount: 1000,   currency: 'USD', paid_on: '2026-10-22' },
  { status: 'pending',  amount: 150000, currency: 'INR', due_on: '2026-10-20' },
  { status: 'pending',  amount: 3000,   currency: 'USD', due_on: '2026-11-15' },
]
const expenses = [
  { amount: 2000, currency: 'INR', spent_on: '2026-10-03' },
  { amount: 500,  currency: 'INR', spent_on: '2026-09-28' },
]

const m = moneySummary(projects, payments)
assert.deepEqual(m.budget, { INR: 330000, USD: 4000 })        // cancelled excluded
assert.deepEqual(m.paid, { INR: 180000, USD: 1000 })          // pending excluded
assert.deepEqual(m.balance, { INR: 150000, USD: 3000 })
// A retainer payment counts as paid but doesn't reduce the project balance.
const withRetainer = moneySummary(projects, [...payments, { status: 'received', kind: 'retainer', amount: 15000, currency: 'INR', paid_on: '2026-10-25' }])
assert.deepEqual(withRetainer.paid, { INR: 195000, USD: 1000 })
assert.deepEqual(withRetainer.balance, { INR: 150000, USD: 3000 })

const ms = monthStats({ projects, payments, expenses }, now)
assert.deepEqual(ms.revenue, { INR: 250000, USD: 4000 })      // October, not cancelled
assert.deepEqual(ms.received, { INR: 100000, USD: 1000 })
assert.deepEqual(ms.expenses, { INR: 2000 })
assert.deepEqual(ms.net, { INR: 98000, USD: 1000 })
assert.equal(ms.newProjects, 2)

assert.equal(moneyText({ INR: 250000, USD: 4000 }), '₹2,50,000 + $4,000')
assert.equal(moneyText({}), '₹0')

assert.equal(overduePayments(payments, '2026-10-26').length, 1)
const retainers = [
  { status: 'active', amount: 15000, currency: 'INR', next_billing_date: '2026-10-30' },
  { status: 'active', amount: 200,   currency: 'USD', next_billing_date: '2026-12-01' },
  { status: 'paused', amount: 9000,  currency: 'INR', next_billing_date: '2026-10-27' },
]
assert.deepEqual(activeMrr(retainers), { INR: 15000, USD: 200 })
assert.equal(billingSoon(retainers, '2026-10-26').length, 1)
console.log('crmUtils phase 2: all checks passed')

import { nextMonth } from './crmUtils.js'
assert.equal(nextMonth('2026-10-15'), '2026-11-15')
assert.equal(nextMonth('2027-01-31'), '2027-02-28')
assert.equal(nextMonth('2028-01-31'), '2028-02-29')   // leap year
assert.equal(nextMonth('2026-03-31'), '2026-04-30')
assert.equal(nextMonth('2026-12-10'), '2027-01-10')   // year rollover
console.log('nextMonth: all checks passed')

import { quoteTotals, pdfMoney, meetingsByDay } from './crmUtils.js'
const q = quoteTotals([{ qty: 1, rate: 200000 }, { qty: 2, rate: 10000 }], 18, 20000)
assert.deepEqual(q, { subtotal: 220000, discount: 20000, taxable: 200000, tax: 36000, total: 236000 })
assert.equal(quoteTotals([{ qty: 1, rate: 100 }], 18, 500).total, 0)        // discount can't go negative
assert.equal(quoteTotals([{ qty: '1.5', rate: '99.99' }], 0, 0).total, 149.99) // strings and decimals
assert.equal(quoteTotals([], 18, 0).total, 0)
assert.equal(pdfMoney(236000, 'INR'), 'INR 2,36,000.00')
assert.equal(pdfMoney(4000, 'USD'), 'USD 4,000.00')
const days = meetingsByDay([{ starts_at: '2026-10-28T20:00:00Z' }, { starts_at: '2026-10-28T05:30:00Z' }])
assert.deepEqual(days.map(([d, ms]) => [d, ms.length]), [['2026-10-28', 1], ['2026-10-29', 1]]) // 20:00 UTC = next day IST
console.log('crmUtils phase 3: all checks passed')
