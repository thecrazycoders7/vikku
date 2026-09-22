// Maintenance / running-cost model — deterministic. Turns answers into a
// monthly cost breakdown with support tiers. Currency: INR.

export const TYPES = [
  { key: 'website',   label: 'Website', base: 4000 },
  { key: 'webapp',    label: 'Web Application', base: 12000 },
  { key: 'mobile',    label: 'Mobile App', base: 14000 },
  { key: 'saas',      label: 'SaaS Platform', base: 20000 },
  { key: 'ecommerce', label: 'E-commerce', base: 16000 },
  { key: 'ai',        label: 'AI Product', base: 22000 },
]

export const SCALE = [
  { key: 'small',  label: '< 10,000 users',   hostBase: 3000,  mult: 1.0 },
  { key: 'medium', label: '10K – 100K users', hostBase: 12000, mult: 1.3 },
  { key: 'large',  label: '100K+ users',      hostBase: 40000, mult: 1.8 },
  { key: 'unsure', label: 'Not sure',         hostBase: 6000,  mult: 1.1 },
]

export const SUPPORT = [
  { key: 'basic',    label: 'Basic',    hint: 'Bug fixes, best-effort',        devHours: 6,  sla: 'Next business day' },
  { key: 'standard', label: 'Standard', hint: 'Fixes + minor improvements',    devHours: 16, sla: 'Same business day' },
  { key: 'premium',  label: 'Premium',  hint: 'Priority + proactive + on-call', devHours: 40, sla: '24/7, ~2h response' },
]
const DEV_RATE = 900 // INR / hour blended for maintenance work

export const AI = [
  { key: 'none', label: 'No AI', monthly: 0 },
  { key: 'api',  label: 'AI via APIs', monthly: 12000 },
  { key: 'heavy',label: 'Heavy ML / inference', monthly: 45000 },
]

// Optional recurring services the client may need.
export const SERVICES = [
  { key: 'monitoring', label: 'Monitoring & alerts', monthly: 2500 },
  { key: 'backups',    label: 'Backups & DR',        monthly: 2000 },
  { key: 'sms_email',  label: 'SMS / email delivery', monthly: 3000 },
  { key: 'maps',       label: 'Maps / location APIs', monthly: 3500 },
  { key: 'payments',   label: 'Payment gateway fees', monthly: 4000 },
  { key: 'cdn',        label: 'CDN / media storage',  monthly: 2500 },
]

export function estimateMaintenance(a = {}) {
  const { type = 'webapp', scale = 'unsure', support = 'standard', ai = 'none', services = [] } = a
  const sc = SCALE.find((s) => s.key === scale) || SCALE[3]
  const sup = SUPPORT.find((s) => s.key === support) || SUPPORT[1]
  const typeBase = TYPES.find((t) => t.key === type)?.base || 12000

  // Line items.
  const hosting = Math.round(sc.hostBase * (type === 'ai' ? 1.4 : 1))
  const monitoring = 2500
  const security = Math.round(typeBase * 0.25)
  const bugFixing = Math.round(typeBase * 0.4 * sc.mult)
  const supportHours = Math.round(sup.devHours * DEV_RATE)
  const aiCost = AI.find((x) => x.key === ai)?.monthly || 0
  const serviceCost = services.reduce((s, k) => s + (SERVICES.find((x) => x.key === k)?.monthly || 0), 0)

  const items = [
    { key: 'hosting',    label: 'Hosting & infrastructure', amount: hosting },
    { key: 'monitoring', label: 'Monitoring & uptime',      amount: monitoring },
    { key: 'security',   label: 'Security & updates',       amount: security },
    { key: 'bugs',       label: 'Bug fixing & tweaks',      amount: bugFixing },
    { key: 'support',    label: `Support (${sup.label}, ~${sup.devHours}h/mo)`, amount: supportHours },
  ]
  if (aiCost) items.push({ key: 'ai', label: 'AI / inference', amount: aiCost })
  if (serviceCost) items.push({ key: 'services', label: 'Third-party services', amount: serviceCost })

  const monthly = items.reduce((s, i) => s + i.amount, 0)
  const annual = monthly * 12

  // Three support tiers (same infra, different support depth).
  const tiers = SUPPORT.map((t) => {
    const tSupport = Math.round(t.devHours * DEV_RATE)
    const tMonthly = hosting + monitoring + security + Math.round(typeBase * 0.4 * sc.mult) + tSupport + aiCost + serviceCost
    return { key: t.key, label: t.label, hint: t.hint, sla: t.sla, monthly: tMonthly, recommended: t.key === 'standard' }
  })

  return { items, monthly, annual, tiers, sla: sup.sla }
}

export const inr = (n) => '₹' + Math.round(Number(n || 0)).toLocaleString('en-IN')
export function inrShort(n) {
  n = Number(n || 0)
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2).replace(/\.?0+$/, '') + 'Cr'
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1).replace(/\.0$/, '') + 'L'
  if (n >= 1e3) return '₹' + Math.round(n / 1e3) + 'K'
  return '₹' + Math.round(n)
}
