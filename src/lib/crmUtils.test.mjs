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
