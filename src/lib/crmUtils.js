// Pure CRM helpers and constants (no Supabase), so they can be tested with plain node.

export const LEAD_STAGES = [
  { id: 'new',       label: 'New',           tint: 'bg-blue-50 border-blue-100',       dot: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted',     tint: 'bg-violet-50 border-violet-100',   dot: 'bg-violet-500' },
  { id: 'qualified', label: 'Qualified',     tint: 'bg-amber-50 border-amber-100',     dot: 'bg-amber-500' },
  { id: 'proposal',  label: 'Proposal sent', tint: 'bg-orange-50 border-orange-100',   dot: 'bg-orange-500' },
  { id: 'won',       label: 'Won',           tint: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' },
  { id: 'lost',      label: 'Lost',          tint: 'bg-rose-50 border-rose-100',       dot: 'bg-rose-500' },
]

export const LEAD_SOURCES = [
  { id: 'website',     label: 'Website' },
  { id: 'cal_booking', label: 'Cal.com booking' },
  { id: 'whatsapp',    label: 'WhatsApp' },
  { id: 'instagram',   label: 'Instagram' },
  { id: 'linkedin',    label: 'LinkedIn' },
  { id: 'referral',    label: 'Referral' },
  { id: 'cold_call',   label: 'Cold call' },
  { id: 'free_tool',   label: 'Free tool' },
  { id: 'other',       label: 'Other' },
]

export const SERVICES = ['AI Agents', 'AI Automation', 'AI Integration', 'AI Software Development', 'AI Voice Agents', 'Custom Software', 'AI Consulting']

export const ACTIVITY_KINDS = [
  { id: 'note',     label: 'Note' },
  { id: 'call',     label: 'Call' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email',    label: 'Email' },
  { id: 'meeting',  label: 'Meeting' },
]

export const sourceLabel = (id) => LEAD_SOURCES.find(s => s.id === id)?.label || id
export const stageLabel = (id) => LEAD_STAGES.find(s => s.id === id)?.label || id

export function formatMoney(value, currency = 'INR') {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

// Digits for a wa.me link; 10-digit numbers are assumed Indian.
export function whatsappNumber(phone) {
  const digits = (phone || '').replace(/\D/g, '').replace(/^0+/, '')
  if (!digits) return null
  return digits.length === 10 ? `91${digits}` : digits
}

// Pipeline numbers for the leads header. Value is summed per currency so INR and USD never mix.
export function pipelineStats(leads, now = new Date()) {
  const open = leads.filter(l => !['won', 'lost'].includes(l.stage))
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const closedThisMonth = leads.filter(l => ['won', 'lost'].includes(l.stage) && new Date(l.updated_at) >= monthStart)
  const wonThisMonth = closedThisMonth.filter(l => l.stage === 'won').length
  const pipeline = {}
  for (const l of open) pipeline[l.currency] = (pipeline[l.currency] || 0) + Number(l.value || 0)
  const today = now.toISOString().slice(0, 10)
  return {
    open: open.length,
    pipeline,
    wonThisMonth,
    winRate: closedThisMonth.length ? Math.round((wonThisMonth / closedThisMonth.length) * 100) : 0,
    followUpsDue: open.filter(l => l.next_follow_up && l.next_follow_up <= today).length,
  }
}

// ---- Phase 2: projects, payments, retainers, expenses ----

export const PROJECT_STAGES = [
  { id: 'new',       label: 'New',       tint: 'bg-violet-50 border-violet-100',   dot: 'bg-violet-500' },
  { id: 'ongoing',   label: 'Ongoing',   tint: 'bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' },
  { id: 'completed', label: 'Completed', tint: 'bg-blue-50 border-blue-100',       dot: 'bg-blue-500' },
  { id: 'cancelled', label: 'Cancelled', tint: 'bg-rose-50 border-rose-100',       dot: 'bg-rose-500' },
]
export const PAYMENT_KINDS = [
  { id: 'advance', label: 'Advance' }, { id: 'milestone', label: 'Milestone' }, { id: 'final', label: 'Final' },
  { id: 'retainer', label: 'Retainer' }, { id: 'other', label: 'Other' },
]
export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI' }, { id: 'bank', label: 'Bank transfer' }, { id: 'razorpay', label: 'Razorpay' },
  { id: 'card', label: 'Card' }, { id: 'cash', label: 'Cash' }, { id: 'other', label: 'Other' },
]
export const EXPENSE_CATEGORIES = [
  { id: 'tools', label: 'Tools & software' }, { id: 'freelancer', label: 'Freelancers' }, { id: 'hosting', label: 'Hosting' },
  { id: 'ads', label: 'Ads' }, { id: 'travel', label: 'Travel' }, { id: 'other', label: 'Other' },
]
export const labelOf = (list, id) => list.find(x => x.id === id)?.label || id

// Money is always summed per currency (INR and USD are never mixed or converted).
export function sumByCurrency(items, field = 'amount') {
  const out = {}
  for (const it of items) out[it.currency || 'INR'] = (out[it.currency || 'INR'] || 0) + Number(it[field] || 0)
  return out
}
export function subtractSums(a, b) {
  const out = { ...a }
  for (const [cur, v] of Object.entries(b)) out[cur] = (out[cur] || 0) - v
  return out
}
// "₹2,50,000 + $4,000", or "₹0" when empty.
export function moneyText(sums) {
  const parts = Object.entries(sums).filter(([, v]) => v !== 0).map(([cur, v]) => formatMoney(v, cur))
  return parts.length ? parts.join(' + ') : formatMoney(0)
}

const inMonth = (date, now) => {
  if (!date) return false
  const d = new Date(date)
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

// Budget, paid and balance for one client or project. Cancelled projects and pending payments don't count;
// "paid" is all money received, but retainer payments don't reduce what is still owed on project budgets.
export function moneySummary(projects, payments) {
  const received = payments.filter(p => p.status === 'received')
  const budget = sumByCurrency(projects.filter(p => p.stage !== 'cancelled'), 'budget')
  const paid = sumByCurrency(received)
  return { budget, paid, balance: subtractSums(budget, sumByCurrency(received.filter(p => p.kind !== 'retainer'))) }
}

// This month's numbers for the CRM dashboard.
export function monthStats({ projects, payments, expenses }, now = new Date()) {
  const revenue = sumByCurrency(projects.filter(p => p.stage !== 'cancelled' && inMonth(p.created_at, now)), 'budget')
  const received = sumByCurrency(payments.filter(p => p.status === 'received' && inMonth(p.paid_on, now)))
  const spent = sumByCurrency(expenses.filter(e => inMonth(e.spent_on, now)))
  return {
    revenue, received, expenses: spent, net: subtractSums(received, spent),
    newProjects: projects.filter(p => p.stage !== 'cancelled' && inMonth(p.created_at, now)).length,
  }
}

export const isoDay = (d = new Date()) => d.toISOString().slice(0, 10)
export const overduePayments = (payments, today = isoDay()) => payments.filter(p => p.status === 'pending' && p.due_on && p.due_on < today)
export const activeMrr = (retainers) => sumByCurrency(retainers.filter(r => r.status === 'active'))
export function billingSoon(retainers, today = isoDay(), days = 7) {
  const end = new Date(today); end.setDate(end.getDate() + days)
  const last = isoDay(end)
  return retainers.filter(r => r.status === 'active' && r.next_billing_date && r.next_billing_date <= last)
}

// Next billing date one month on, end-of-month safe (31 Jan -> 28/29 Feb, 31 Mar -> 30 Apr).
export function nextMonth(dateStr) {
  const [y, m, d] = (dateStr || isoDay()).split('-').map(Number)
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m, Math.min(d, last))).toISOString().slice(0, 10)
}
