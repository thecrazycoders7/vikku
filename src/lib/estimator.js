// AI Project Estimator — deterministic estimation model.
// GPT (phase 2) interprets free-text/custom features; the NUMBERS come from
// this model so estimates are consistent and defensible. All hours are dev
// effort; pricing is hours × blended rate. Currency: INR.

// ---- Option catalogs (drive the wizard UI) --------------------------------
export const PROJECT_TYPES = [
  { key: 'website',    label: 'Website',          icon: '🌐', base: 90  },
  { key: 'webapp',     label: 'Web Application',   icon: '🖥️', base: 160 },
  { key: 'mobile',     label: 'Mobile App',        icon: '📱', base: 170 },
  { key: 'saas',       label: 'SaaS Platform',     icon: '☁️', base: 220 },
  { key: 'ecommerce',  label: 'E-commerce',        icon: '🛒', base: 190 },
  { key: 'ai',         label: 'AI Product',        icon: '🤖', base: 210 },
  { key: 'internal',   label: 'Internal Software', icon: '🏢', base: 150 },
  { key: 'other',      label: 'Other',             icon: '✨', base: 150 },
]

export const PLATFORMS = [
  { key: 'web',     label: 'Website',  hours: 120 },
  { key: 'android', label: 'Android',  hours: 150 },
  { key: 'ios',     label: 'iOS',      hours: 150 },
  { key: 'windows', label: 'Windows',  hours: 130 },
  { key: 'macos',   label: 'macOS',    hours: 130 },
]

export const ROLES = [
  { key: 'customer', label: 'Customer' },
  { key: 'admin',    label: 'Admin' },
  { key: 'employee', label: 'Employee' },
  { key: 'vendor',   label: 'Vendor' },
  { key: 'manager',  label: 'Manager' },
  { key: 'partner',  label: 'Partner' },
]
export const ROLE_HOURS = 60 // per role: auth, permissions, its own views

export const ROLE_ACTIONS = [
  'Signup / login', 'Browse', 'Search', 'Book', 'Pay', 'Chat', 'Track', 'Review',
  'Dashboard', 'Manage content', 'Reports', 'Approvals',
]

// Feature groups → each feature has an hour weight.
export const FEATURE_GROUPS = [
  { group: 'Authentication', features: [
    { key: 'email_login', label: 'Email login', hours: 14 },
    { key: 'phone_otp',   label: 'Phone OTP',   hours: 18 },
    { key: 'google_login',label: 'Google login',hours: 10 },
    { key: 'apple_login', label: 'Apple login', hours: 10 },
    { key: '2fa',         label: '2FA',         hours: 18 },
  ]},
  { group: 'User management', features: [
    { key: 'profile',      label: 'Profile',      hours: 20 },
    { key: 'documents',    label: 'Documents',    hours: 30 },
    { key: 'verification', label: 'Verification', hours: 40 },
    { key: 'permissions',  label: 'Permissions',  hours: 40 },
  ]},
  { group: 'Communication', features: [
    { key: 'chat',          label: 'Chat',          hours: 80 },
    { key: 'voice_calls',   label: 'Voice calls',   hours: 110 },
    { key: 'video_calls',   label: 'Video calls',   hours: 150 },
    { key: 'notifications',  label: 'Notifications', hours: 30 },
  ]},
  { group: 'Payments', features: [
    { key: 'one_time',     label: 'One-time payment', hours: 40 },
    { key: 'subscription', label: 'Subscription',     hours: 70 },
    { key: 'wallet',       label: 'Wallet',           hours: 90 },
    { key: 'refunds',      label: 'Refunds',          hours: 30 },
    { key: 'coupons',      label: 'Coupons',          hours: 30 },
    { key: 'payouts',      label: 'Vendor payouts',   hours: 70 },
  ]},
  { group: 'Location', features: [
    { key: 'maps',           label: 'Maps',                 hours: 40 },
    { key: 'gps',            label: 'GPS',                  hours: 30 },
    { key: 'live_tracking',  label: 'Live tracking',        hours: 90 },
    { key: 'geo_search',     label: 'Location-based search', hours: 40 },
  ]},
  { group: 'Content', features: [
    { key: 'blog',        label: 'Blog',        hours: 30 },
    { key: 'cms',         label: 'CMS',         hours: 60 },
    { key: 'file_uploads',label: 'File uploads',hours: 25 },
    { key: 'images',      label: 'Images',      hours: 20 },
    { key: 'videos',      label: 'Videos',      hours: 45 },
  ]},
  { group: 'Analytics', features: [
    { key: 'dashboard',   label: 'Dashboard',        hours: 60 },
    { key: 'reports',     label: 'Reports',          hours: 50 },
    { key: 'user_analytics',    label: 'User analytics',    hours: 40 },
    { key: 'revenue_analytics', label: 'Revenue analytics', hours: 40 },
  ]},
]

// Flat lookup of every feature's hours.
export const FEATURE_HOURS = Object.fromEntries(
  FEATURE_GROUPS.flatMap((g) => g.features.map((f) => [f.key, f.hours]))
)
export const FEATURE_LABELS = Object.fromEntries(
  FEATURE_GROUPS.flatMap((g) => g.features.map((f) => [f.key, f.label]))
)
// Features considered "nice to have" — dropped from the MVP package.
const NON_CORE = new Set([
  'apple_login', '2fa', 'voice_calls', 'video_calls', 'wallet', 'coupons',
  'payouts', 'live_tracking', 'blog', 'cms', 'videos', 'user_analytics',
  'revenue_analytics', 'verification',
])

export const INTEGRATIONS = [
  'Razorpay', 'Stripe', 'Google Maps', 'WhatsApp', 'Twilio', 'Firebase',
  'AWS', 'Google Cloud', 'Salesforce', 'HubSpot', 'Zoho',
]
const INTEGRATION_HOURS = 20

export const AI_CAPS = [
  { key: 'chatbot',      label: 'Chatbot',              hours: 120 },
  { key: 'extraction',   label: 'Document extraction',  hours: 100 },
  { key: 'recommend',    label: 'Recommendations',      hours: 90 },
  { key: 'classify',     label: 'Classification',       hours: 80 },
  { key: 'image_gen',    label: 'Image generation',     hours: 90 },
  { key: 'image_analysis',label: 'Image analysis',      hours: 90 },
  { key: 'voice',        label: 'Voice',                hours: 120 },
  { key: 'predictive',   label: 'Predictive analytics', hours: 120 },
  { key: 'rag',          label: 'RAG / knowledge base', hours: 150 },
  { key: 'custom_model', label: 'Custom AI model',      hours: 200 },
]
export const AI_HOURS = Object.fromEntries(AI_CAPS.map((a) => [a.key, a.hours]))
export const AI_LABELS = Object.fromEntries(AI_CAPS.map((a) => [a.label ? a.key : a.key, a.label]))

export const SCALE_USERS = [
  { key: 'lt1k',   label: '< 1,000',          mult: 1.0 },
  { key: '1k10k',  label: '1,000 – 10,000',   mult: 1.1 },
  { key: '10k100k',label: '10,000 – 100,000', mult: 1.25 },
  { key: 'gt100k', label: '100,000+',         mult: 1.5 },
  { key: 'unsure', label: 'Not sure',         mult: 1.1 },
]
export const SECURITY_LEVELS = [
  { key: 'basic',      label: 'Basic',      desc: 'Standard auth & best practices', mult: 1.0 },
  { key: 'business',   label: 'Business',   desc: 'Role-based access, audit logs',   mult: 1.15 },
  { key: 'enterprise', label: 'Enterprise', desc: 'Encryption, compliance, SSO',     mult: 1.35 },
]
export const BUDGETS = [
  '₹50K–₹1L', '₹1L–₹3L', '₹3L–₹5L', '₹5L–₹10L', '₹10L–₹25L', '₹25L+', 'Not decided',
]
export const DESIGN_OPTIONS = [
  { key: 'figma',   label: 'Yes — Figma ready',   hours: 0 },
  { key: 'some',    label: 'Some designs',         hours: 40 },
  { key: 'none',    label: 'No designs — you design it', hours: 90 },
]
export const MAINTENANCE = [
  'Bug fixing', 'Server management', 'Security updates',
  'New features', 'Dedicated developer', '24/7 support',
]

// Blended rate band (INR/hour) for a senior small-team build.
const RATE_MIN = 700
const RATE_MAX = 850

const round = (n, step) => Math.round(n / step) * step

function complexityLabel(hours) {
  if (hours < 400) return 'Low'
  if (hours < 900) return 'Medium'
  if (hours < 1800) return 'High'
  return 'Very High'
}

// ---- The engine -----------------------------------------------------------
// answers: {
//   type, platforms:[], roles:[], features:[], integrations:[], ai:[],
//   scale, security, design, maintenance:[]
// }
export function estimate(answers = {}) {
  const {
    type = 'webapp', platforms = [], roles = [], features = [],
    integrations = [], ai = [], scale = 'unsure', security = 'basic',
    design = 'some',
  } = answers

  const typeBase = (PROJECT_TYPES.find((t) => t.key === type)?.base) || 150
  const platformHours = platforms.reduce((s, p) => s + (PLATFORMS.find((x) => x.key === p)?.hours || 0), 0)
  const roleHours = roles.length * ROLE_HOURS
  const featureHours = features.reduce((s, f) => s + (FEATURE_HOURS[f] || 0), 0)
  const integrationHours = integrations.length * INTEGRATION_HOURS
  const aiHours = ai.reduce((s, a) => s + (AI_HOURS[a] || 0), 0)
  const designHours = DESIGN_OPTIONS.find((d) => d.key === design)?.hours || 0

  const scaleMult = SCALE_USERS.find((s) => s.key === scale)?.mult || 1.1
  const securityMult = SECURITY_LEVELS.find((s) => s.key === security)?.mult || 1.0

  const raw = typeBase + platformHours + roleHours + featureHours + integrationHours + aiHours + designHours
  const total = Math.max(120, Math.round(raw * scaleMult * securityMult))

  // Split into disciplines (ratios tuned to a typical product build).
  const hours = {
    ui_ux:    Math.round(total * 0.15),
    frontend: Math.round(total * 0.34),
    backend:  Math.round(total * 0.32),
    qa:       Math.round(total * 0.13),
    devops:   Math.round(total * 0.06),
  }
  const totalHours = Object.values(hours).reduce((a, b) => a + b, 0)

  const weeks = {
    min: Math.max(3, Math.round(totalHours / 75)),
    max: Math.max(4, Math.round(totalHours / 58)),
  }

  const priceMin = round(totalHours * RATE_MIN, 5000)
  const priceMax = round(totalHours * RATE_MAX, 5000)

  // Cost drivers — the human explanation of the number.
  const drivers = []
  if (platforms.length > 1) drivers.push({ label: `${platforms.length} platforms`, detail: platforms.map((p) => PLATFORMS.find((x) => x.key === p)?.label).join(' + ') })
  if (roles.length > 1) drivers.push({ label: `${roles.length} user roles`, detail: roles.map((r) => ROLES.find((x) => x.key === r)?.label).join(' + ') })
  if (features.some((f) => ['one_time','subscription','wallet','payouts'].includes(f))) drivers.push({ label: 'Payments', detail: 'Secure transaction handling' })
  if (features.some((f) => ['maps','gps','live_tracking','geo_search'].includes(f))) drivers.push({ label: 'Location services', detail: 'Maps & tracking' })
  if (features.some((f) => ['chat','voice_calls','video_calls','notifications'].includes(f))) drivers.push({ label: 'Real-time communication', detail: 'Chat / calls / notifications' })
  if (ai.length) drivers.push({ label: 'AI capabilities', detail: ai.map((a) => AI_LABELS[a]).filter(Boolean).join(', ') })
  if (integrations.length) drivers.push({ label: `${integrations.length} integrations`, detail: integrations.join(', ') })
  if (security !== 'basic') drivers.push({ label: `${SECURITY_LEVELS.find((s) => s.key === security)?.label} security`, detail: 'Higher compliance & hardening' })
  if (['10k100k','gt100k'].includes(scale)) drivers.push({ label: 'High scale', detail: SCALE_USERS.find((s) => s.key === scale)?.label + ' users' })

  // Packages — scope changes, not just price inflation.
  const coreFeatures = features.filter((f) => !NON_CORE.has(f))
  const droppedFeatures = features.filter((f) => NON_CORE.has(f))
  const mvpPrice = round(priceMin * 0.7, 5000)
  const enterprisePrice = round(priceMax * 1.3, 5000)
  const packages = [
    {
      key: 'mvp', name: 'MVP', price: mvpPrice, tone: 'muted',
      tagline: 'Launch the core, fast',
      includes: [
        `${coreFeatures.length} core features`,
        platforms.length > 1 ? 'Primary platform first' : '1 platform',
        'Standard security',
        'Essential integrations',
      ],
      excludes: droppedFeatures.length ? droppedFeatures.map((f) => FEATURE_LABELS[f]) : ['Advanced/optional features'],
    },
    {
      key: 'business', name: 'Business', price: round((priceMin + priceMax) / 2, 5000), tone: 'brand', recommended: true,
      tagline: 'Everything you asked for',
      includes: [
        `All ${features.length} features`,
        `${platforms.length || 1} platform${platforms.length > 1 ? 's' : ''}`,
        `${roles.length || 1} user role${roles.length > 1 ? 's' : ''}`,
        integrations.length ? `${integrations.length} integrations` : 'Core integrations',
        ai.length ? 'AI capabilities included' : 'Analytics dashboard',
      ],
      excludes: [],
    },
    {
      key: 'enterprise', name: 'Enterprise', price: enterprisePrice, tone: 'muted',
      tagline: 'Built to scale & secure',
      includes: [
        'Everything in Business',
        'Enterprise security & audit logs',
        'High-scale infrastructure',
        'Load testing & monitoring',
        'Priority support',
      ],
      excludes: [],
    },
  ]

  return {
    complexity: complexityLabel(totalHours),
    hours, totalHours, weeks, priceMin, priceMax, drivers, packages,
    droppedFeatures,
  }
}

export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
// Compact INR for headline prices: ₹8.5L, ₹1.2Cr
export function inrShort(n) {
  n = Number(n || 0)
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2).replace(/\.00$/, '') + 'Cr'
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1).replace(/\.0$/, '') + 'L'
  if (n >= 1e3) return '₹' + Math.round(n / 1e3) + 'K'
  return '₹' + n
}
