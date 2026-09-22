// Project Timeline model — deterministic. Turns a few answers into a
// phase-by-phase schedule with milestones, a realistic range, and drivers.

export const TYPES = [
  { key: 'website',   label: 'Website', weeks: 3 },
  { key: 'webapp',    label: 'Web Application', weeks: 8 },
  { key: 'mobile',    label: 'Mobile App', weeks: 9 },
  { key: 'saas',      label: 'SaaS Platform', weeks: 12 },
  { key: 'ecommerce', label: 'E-commerce', weeks: 9 },
  { key: 'ai',        label: 'AI Product', weeks: 11 },
]

export const SIZE = [
  { key: 'small',  label: 'Small', hint: 'A handful of screens/features', mult: 0.7 },
  { key: 'medium', label: 'Medium', hint: 'A full product with several modules', mult: 1.0 },
  { key: 'large',  label: 'Large', hint: 'Many modules, roles, integrations', mult: 1.5 },
]

export const PLATFORMS = [
  { key: 'web', label: 'Web', add: 0 },
  { key: 'android', label: 'Android', add: 0.15 },
  { key: 'ios', label: 'iOS', add: 0.15 },
]

export const TEAM = [
  { key: 'solo',  label: 'Solo (1 dev)',  factor: 1.5 },
  { key: 'small', label: 'Small (2–3)',   factor: 1.0 },
  { key: 'full',  label: 'Full team (4+)', factor: 0.75 },
]

export const DESIGN = [
  { key: 'ready', label: 'Designs ready', add: 0 },
  { key: 'some',  label: 'Some designs',  add: 0.1 },
  { key: 'none',  label: 'No designs',    add: 0.2 },
]

export const COMPLEXITY = [
  { key: 'payments',     label: 'Payments' },
  { key: 'realtime',     label: 'Chat / real-time' },
  { key: 'ai',           label: 'AI features' },
  { key: 'integrations', label: 'Third-party integrations' },
  { key: 'roles',        label: 'Multiple user roles' },
]
const COMPLEXITY_ADD = 0.08 // each adds 8%

// Phase distribution of total build weeks.
const PHASES = [
  { key: 'discovery', label: 'Discovery', pct: 0.12 },
  { key: 'design',    label: 'Design',    pct: 0.18 },
  { key: 'dev',       label: 'Development', pct: 0.45 },
  { key: 'testing',   label: 'Testing & QA', pct: 0.15 },
  { key: 'launch',    label: 'Launch',    pct: 0.10 },
]

export function estimateTimeline(a = {}) {
  const { type = 'webapp', size = 'medium', platforms = ['web'], team = 'small', design = 'some', complexity = [] } = a
  const base = TYPES.find((t) => t.key === type)?.weeks || 8
  const sizeMult = SIZE.find((s) => s.key === size)?.mult || 1
  const platformAdd = platforms.reduce((s, p) => s + (PLATFORMS.find((x) => x.key === p)?.add || 0), 0)
  const teamFactor = TEAM.find((t) => t.key === team)?.factor || 1
  const designAdd = DESIGN.find((d) => d.key === design)?.add || 0
  const complexityAdd = complexity.length * COMPLEXITY_ADD

  const weeks = base * sizeMult * (1 + platformAdd + designAdd + complexityAdd) * teamFactor
  const totalMin = Math.max(2, Math.round(weeks))
  const totalMax = Math.max(3, Math.round(weeks * 1.25)) // +25% buffer for the realistic upper bound

  // Phases use the min timeline; each phase gets a week span.
  let cursor = 0
  const phases = PHASES.map((p) => {
    const wk = Math.max(1, Math.round(totalMin * p.pct))
    const startWeek = cursor + 1
    cursor += wk
    return { ...p, weeks: wk, startWeek, endWeek: cursor }
  })
  const scheduleWeeks = cursor // may differ slightly from totalMin after rounding

  // Milestones at phase ends.
  const milestones = [
    { label: 'Kickoff & requirements locked', week: phases[0].endWeek },
    { label: 'Design sign-off', week: phases[1].endWeek },
    { label: 'Core build complete', week: phases[2].endWeek },
    { label: 'QA passed / release candidate', week: phases[3].endWeek },
    { label: 'Launch 🚀', week: phases[4].endWeek },
  ]

  const drivers = []
  if (size === 'large') drivers.push('Large scope — many modules to build and test')
  if (platforms.length > 1) drivers.push(`${platforms.length} platforms to build and ship`)
  if (team === 'solo') drivers.push('Solo team — less parallel work')
  if (design === 'none') drivers.push('No designs yet — design phase is on the critical path')
  complexity.forEach((c) => drivers.push(`${COMPLEXITY.find((x) => x.key === c)?.label} adds build & test time`))

  const assumptions = [
    'Assumes timely feedback and sign-offs at each phase.',
    'Assumes scope stays stable — new features extend the timeline.',
    team === 'solo' ? 'Based on one developer working the project.' : 'Based on a small, focused team.',
  ]

  return { totalMin, totalMax, scheduleWeeks, phases, milestones, drivers, assumptions }
}

// Add `weeks` to today, return "Mon DD" label.
export function weekDate(weeksFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + weeksFromNow * 7)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
