// Business Impact model — builds a small financial model of the client's
// business rather than a single ROI number. Deterministic; GPT (phase 2) only
// narrates the result. Currency: INR. Horizon: 3 years.

export const CATEGORIES = [
  { key: 'ai_automation', label: 'AI Automation', blurb: 'Automate a repetitive, high-volume process with AI' },
  { key: 'process',       label: 'Process Automation', blurb: 'Replace manual/operational work with software' },
  { key: 'marketing',     label: 'Marketing', blurb: 'Grow leads, conversion, and revenue' },
  { key: 'software',      label: 'Custom Software / SaaS', blurb: 'Replace tools & manual work with a custom system' },
]

// Field kinds:
//  'client'     — a real number the client should know (payback to benchmark if unsure)
//  'assumption' — forward-looking, always an assumption even when chosen
// Each field: key, label, unit, kind, benchmark (fallback), min/max/step (for sliders),
// and optional `driver` flag = participates in sensitivity.
export const CATEGORY_FIELDS = {
  ai_automation: [
    { key: 'process',    label: 'Which process?',                    unit: 'text',    kind: 'client', benchmark: 'A repetitive back-office task' },
    { key: 'employees',  label: 'People working on it',              unit: 'people',  kind: 'client', benchmark: 5,      min: 1,   max: 50 },
    { key: 'salary',     label: 'Avg annual salary / person',        unit: '₹/yr',    kind: 'client', benchmark: 480000, min: 200000, max: 2000000 },
    { key: 'timePct',    label: 'Their time spent on this process',  unit: '%',       kind: 'client', benchmark: 60,     min: 5,   max: 100 },
    { key: 'volume',     label: 'Items processed per month',         unit: '/mo',     kind: 'client', benchmark: 8000,   min: 100, max: 100000, driver: true },
    { key: 'errorRate',  label: 'Current error rate',                unit: '%',       kind: 'client', benchmark: 4,      min: 0,   max: 30 },
    { key: 'errorCost',  label: 'Cost to fix one error',             unit: '₹',       kind: 'client', benchmark: 300,    min: 0,   max: 10000 },
    { key: 'automation', label: 'Expected automation',              unit: '%',       kind: 'assumption', benchmark: 60,  min: 20,  max: 90, driver: true },
    { key: 'implCost',   label: 'Build / implementation cost',       unit: '₹',       kind: 'client', benchmark: 900000, min: 100000, max: 5000000, driver: true },
    { key: 'runMonthly', label: 'Monthly AI / cloud cost after launch', unit: '₹/mo', kind: 'assumption', benchmark: 25000, min: 0, max: 500000 },
  ],
  process: [
    { key: 'process',    label: 'Which process?',                    unit: 'text',    kind: 'client', benchmark: 'A manual operational task' },
    { key: 'employees',  label: 'People working on it',              unit: 'people',  kind: 'client', benchmark: 4,      min: 1,   max: 50 },
    { key: 'salary',     label: 'Avg annual salary / person',        unit: '₹/yr',    kind: 'client', benchmark: 420000, min: 200000, max: 2000000 },
    { key: 'timePct',    label: 'Their time spent on this process',  unit: '%',       kind: 'client', benchmark: 50,     min: 5,   max: 100 },
    { key: 'volume',     label: 'Items processed per month',         unit: '/mo',     kind: 'client', benchmark: 5000,   min: 100, max: 100000, driver: true },
    { key: 'errorRate',  label: 'Current error rate',                unit: '%',       kind: 'client', benchmark: 3,      min: 0,   max: 30 },
    { key: 'errorCost',  label: 'Cost to fix one error',             unit: '₹',       kind: 'client', benchmark: 250,    min: 0,   max: 10000 },
    { key: 'automation', label: 'Expected automation',              unit: '%',       kind: 'assumption', benchmark: 55,  min: 20,  max: 90, driver: true },
    { key: 'implCost',   label: 'Build / implementation cost',       unit: '₹',       kind: 'client', benchmark: 700000, min: 100000, max: 5000000, driver: true },
    { key: 'runMonthly', label: 'Monthly software / infra cost',     unit: '₹/mo',    kind: 'assumption', benchmark: 15000, min: 0, max: 500000 },
  ],
  marketing: [
    { key: 'leads',      label: 'Leads per month',                   unit: '/mo',     kind: 'client', benchmark: 500,    min: 10,  max: 100000, driver: true },
    { key: 'conv',       label: 'Lead → customer conversion',        unit: '%',       kind: 'client', benchmark: 3,      min: 0.1, max: 60 },
    { key: 'aov',        label: 'Average order value',               unit: '₹',       kind: 'client', benchmark: 4000,   min: 100, max: 1000000 },
    { key: 'spend',      label: 'Current monthly marketing spend',   unit: '₹/mo',    kind: 'client', benchmark: 150000, min: 0,   max: 5000000 },
    { key: 'trafficUp',  label: 'Expected traffic / lead increase',  unit: '%',       kind: 'assumption', benchmark: 30, min: 0,   max: 200, driver: true },
    { key: 'convUp',     label: 'Expected conversion improvement',   unit: '%',       kind: 'assumption', benchmark: 20, min: 0,   max: 200, driver: true },
    { key: 'implCost',   label: 'Project / build cost',              unit: '₹',       kind: 'client', benchmark: 400000, min: 50000, max: 5000000, driver: true },
    { key: 'runMonthly', label: 'Added monthly spend after launch',  unit: '₹/mo',    kind: 'assumption', benchmark: 30000, min: 0, max: 1000000 },
  ],
  software: [
    { key: 'toolCost',   label: 'Current tools cost',                unit: '₹/yr',    kind: 'client', benchmark: 300000, min: 0,   max: 5000000 },
    { key: 'employees',  label: 'People doing manual work',          unit: 'people',  kind: 'client', benchmark: 6,      min: 1,   max: 100 },
    { key: 'salary',     label: 'Avg annual salary / person',        unit: '₹/yr',    kind: 'client', benchmark: 450000, min: 200000, max: 2000000 },
    { key: 'timePct',    label: 'Time lost to manual work',          unit: '%',       kind: 'client', benchmark: 35,     min: 5,   max: 100, driver: true },
    { key: 'opsSaving',  label: 'Expected operational saving',       unit: '%',       kind: 'assumption', benchmark: 50, min: 10,  max: 90, driver: true },
    { key: 'implCost',   label: 'Build / implementation cost',       unit: '₹',       kind: 'client', benchmark: 1200000, min: 100000, max: 8000000, driver: true },
    { key: 'runMonthly', label: 'Monthly infra / maintenance',       unit: '₹/mo',    kind: 'assumption', benchmark: 30000, min: 0, max: 500000 },
  ],
}

// Answer for capacity of saved time — changes how savings are modelled.
export const CAPACITY_OPTIONS = [
  { key: 'reduce',   label: 'Reduce costs',        note: 'Saved capacity becomes direct cash savings', factor: 1.0 },
  { key: 'reallocate', label: 'Reallocate people', note: 'Saved capacity is redeployed, not cashed out', factor: 0.6 },
  { key: 'grow',     label: 'Increase output',     note: 'Saved capacity drives more revenue',           factor: 0.8 },
  { key: 'unsure',   label: 'Not sure',            note: 'Modelled conservatively',                      factor: 0.7 },
]

export const ADOPTION = [
  { key: '50', label: '~50% of team', value: 0.5 },
  { key: '75', label: '~75% of team', value: 0.75 },
  { key: '90', label: '~90% of team', value: 0.9 },
]

export const RISK_FACTORS = [
  'Integration complexity', 'Data quality', 'Employee adoption',
  'Third-party dependency', 'Regulatory requirements', 'Migration complexity',
]

// Ramp-up: fraction of full benefit realised each month of year 1.
const RAMP = [0.1, 0.25, 0.4, 0.55, 0.65, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]
const year1RampFactor = RAMP.reduce((a, b) => a + b, 0) / 12 // avg ~0.6

const clampNum = (v, f) => (Number.isFinite(+v) && v !== '' ? +v : f.benchmark)

// Compute annual gross benefit + value drivers for a category.
function benefitFor(category, v) {
  const drivers = []
  let annual = 0
  let recurringMonthly = clampNum(v.runMonthly, { benchmark: 0 })
  let implCost = clampNum(v.implCost, { benchmark: 0 })
  let capacityNote = ''

  if (category === 'ai_automation' || category === 'process') {
    const emp = +v.employees, sal = +v.salary, timePct = +v.timePct / 100
    const auto = +v.automation / 100
    const laborOnProcess = emp * sal * timePct
    const laborSaving = laborOnProcess * auto
    drivers.push({ key: 'labor', label: 'Labor efficiency', amount: laborSaving })

    const annualItems = (+v.volume) * 12
    const errCost = annualItems * (+v.errorRate / 100) * (+v.errorCost)
    const errSaving = errCost * auto
    drivers.push({ key: 'error', label: 'Error reduction', amount: errSaving })

    annual = laborSaving + errSaving
    capacityNote = `${Math.round(emp * 2000 * timePct * auto).toLocaleString('en-IN')} hours/year of capacity recovered`
  }

  if (category === 'marketing') {
    const leads = +v.leads, conv = +v.conv / 100, aov = +v.aov
    const curRev = leads * 12 * conv * aov
    const newRev = leads * (1 + (+v.trafficUp / 100)) * 12 * conv * (1 + (+v.convUp / 100)) * aov
    const revLift = Math.max(0, newRev - curRev)
    drivers.push({ key: 'revenue', label: 'Revenue growth', amount: revLift })
    annual = revLift
    capacityNote = `${Math.round((newRev - curRev) / (aov || 1)).toLocaleString('en-IN')} extra customers/year`
  }

  if (category === 'software') {
    const toolSaving = (+v.toolCost) * 0.6
    drivers.push({ key: 'tools', label: 'Tool consolidation', amount: toolSaving })
    const laborOnManual = (+v.employees) * (+v.salary) * (+v.timePct / 100)
    const laborSaving = laborOnManual * (+v.opsSaving / 100)
    drivers.push({ key: 'labor', label: 'Labor efficiency', amount: laborSaving })
    annual = toolSaving + laborSaving
    capacityNote = `${Math.round((+v.employees) * 2000 * (+v.timePct / 100) * (+v.opsSaving / 100)).toLocaleString('en-IN')} hours/year recovered`
  }

  return { annual, drivers: drivers.filter((d) => d.amount > 0), recurringMonthly, implCost, capacityNote }
}

// options: { capacity, adoption, risks:[], discountRate }
export function computeModel(category, values, options = {}) {
  const fields = CATEGORY_FIELDS[category] || []
  // Fill defaults & track provenance.
  const v = {}
  const provenance = {}
  for (const f of fields) {
    const raw = values[f.key]
    const provided = raw !== undefined && raw !== '' && raw !== null
    v[f.key] = provided ? raw : f.benchmark
    if (f.unit === 'text') { provenance[f.key] = provided ? 'client' : 'benchmark'; continue }
    if (f.kind === 'assumption') provenance[f.key] = 'assumption'
    else provenance[f.key] = provided ? 'client' : 'benchmark'
  }

  const capacity = CAPACITY_OPTIONS.find((c) => c.key === (options.capacity || 'unsure')) || CAPACITY_OPTIONS[3]
  const adoption = (ADOPTION.find((a) => a.key === options.adoption)?.value) ?? 0.75
  const riskCount = (options.risks || []).length
  const riskFactor = Math.max(0.6, 1 - riskCount * 0.07) // each risk trims ~7%, floor 0.6
  const discount = (options.discountRate ?? 10) / 100

  const base = benefitFor(category, v)
  // Adjusted annual benefit (capacity realisation × adoption).
  const grossAnnual = base.annual
  const adjAnnual = grossAnnual * capacity.factor * adoption

  // 3-year cash flow. Year 1 ramps; benefits grow slightly after.
  const yearBenefitRaw = [adjAnnual * year1RampFactor, adjAnnual, adjAnnual * 1.05]
  const yearBenefit = yearBenefitRaw.map((b) => b * riskFactor)
  const recurringYr = base.recurringMonthly * 12
  const yearInvest = [base.implCost + recurringYr, recurringYr, recurringYr]

  const years = [0, 1, 2].map((i) => ({
    year: i + 1,
    investment: Math.round(yearInvest[i]),
    benefit: Math.round(yearBenefit[i]),
    net: Math.round(yearBenefit[i] - yearInvest[i]),
  }))

  const totalInvest = years.reduce((s, y) => s + y.investment, 0)
  const totalBenefit = years.reduce((s, y) => s + y.benefit, 0)
  const roi3 = totalInvest > 0 ? ((totalBenefit - totalInvest) / totalInvest) * 100 : 0

  // NPV of net cash flows.
  const npv = years.reduce((s, y, i) => s + y.net / Math.pow(1 + discount, i + 1), 0)

  // Payback (break-even) — cumulative monthly net crosses zero.
  const monthlyBenefit = (m) => {
    if (m <= 12) return (adjAnnual * (RAMP[m - 1] || 0.7) / 12) * riskFactor
    return (adjAnnual * (m <= 24 ? 1 : 1.05) / 12) * riskFactor
  }
  const monthlyCost = base.recurringMonthly
  let cum = -base.implCost, paybackMonth = null
  for (let m = 1; m <= 60; m++) {
    cum += monthlyBenefit(m) - monthlyCost
    if (cum >= 0) { paybackMonth = m; break }
  }

  // Risk-adjusted vs raw ROI (before risk).
  const roiRaw = totalInvest > 0 ? (((totalBenefit / riskFactor) - totalInvest) / totalInvest) * 100 : 0

  // Value drivers scaled by the same realisation factors as benefit.
  const realise = capacity.factor * adoption * riskFactor
  const drivers = base.drivers.map((d) => ({ ...d, amount: Math.round(d.amount * realise) }))

  // Assumption confidence.
  const provVals = Object.values(provenance)
  const assumptionShare = provVals.filter((p) => p !== 'client').length / (provVals.length || 1)
  const confidence = assumptionShare < 0.25 ? 'High' : assumptionShare < 0.55 ? 'Medium' : 'Low'

  return {
    grossAnnual: Math.round(grossAnnual),
    annualBenefit: Math.round(adjAnnual * riskFactor),
    years, totalInvest, totalBenefit,
    roi3: Math.round(roi3), roiRaw: Math.round(roiRaw),
    npv: Math.round(npv), paybackMonth,
    drivers, capacityNote: base.capacityNote,
    provenance, confidence, riskFactor,
    firstYearInvestment: years[0].investment,
    values: v, fields,
  }
}

export const inr = (n) => '₹' + Math.round(Number(n || 0)).toLocaleString('en-IN')
export function inrShort(n) {
  n = Number(n || 0)
  const s = n < 0 ? '-' : ''
  n = Math.abs(n)
  if (n >= 1e7) return s + '₹' + (n / 1e7).toFixed(2).replace(/\.?0+$/, '') + 'Cr'
  if (n >= 1e5) return s + '₹' + (n / 1e5).toFixed(1).replace(/\.0$/, '') + 'L'
  if (n >= 1e3) return s + '₹' + Math.round(n / 1e3) + 'K'
  return s + '₹' + Math.round(n)
}
