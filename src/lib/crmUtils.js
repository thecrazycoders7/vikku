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
