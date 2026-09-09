// Prefill presets (shown as clickable chips) and SEO FAQ content for each free tool.

export const COST_PRESETS = [
  { label: 'SaaS MVP', text: 'A SaaS web app MVP with user authentication, subscription billing (Stripe/Razorpay), a dashboard with charts, and an admin panel. React frontend, Node backend, Postgres database.' },
  { label: 'E-commerce app', text: 'An e-commerce mobile + web app with product catalog, cart, checkout with online payments, order tracking, push notifications, and an admin dashboard for inventory.' },
  { label: 'Marketing website', text: 'A 6-page marketing website with custom design, CMS for blog, contact forms, SEO optimization, and analytics. Fast, responsive, animated.' },
  { label: 'Booking platform', text: 'A booking/appointment platform with calendar availability, online payments, automated reminders (email + SMS), customer accounts, and a provider dashboard.' },
]

export const TIMELINE_PRESETS = COST_PRESETS

export const STACK_PRESETS = [
  { label: 'Realtime app', text: 'A realtime collaborative app like a chat or live dashboard, expecting 10k+ concurrent users, small team, fast iteration.' },
  { label: 'Data-heavy SaaS', text: 'A data-heavy analytics SaaS with complex reporting, large datasets, and integrations. Needs to scale and be maintainable by a small team.' },
  { label: 'Mobile-first MVP', text: 'A mobile-first consumer MVP for iOS and Android, solo founder, limited budget, needs to ship fast and iterate.' },
]

// Per-tool SEO metadata (unique title + description + canonical path)
export const TOOL_SEO = {
  cost_estimator: {
    title: 'Free App & Website Cost Estimator (India) | Vikku',
    description: 'Get an instant, itemised cost estimate for your app, website, or software project in your local currency. Free AI estimator - no sales call.',
    canonical: '/tools/cost-estimator',
  },
  roi_calculator: {
    title: 'Website ROI Calculator - How Much Are You Losing? | Vikku',
    description: 'See how much revenue your business loses to missed leads and how fast a website pays for itself. Free ROI calculator for any business type.',
    canonical: '/tools/roi-calculator',
  },
  timeline_calculator: {
    title: 'Software Project Timeline Calculator | Vikku',
    description: 'Get a realistic, phase-by-phase timeline for building your software, app, or website - discovery to launch. Free AI estimate.',
    canonical: '/tools/timeline-calculator',
  },
  tech_recommender: {
    title: 'Tech Stack Recommender - Which Stack Should You Use? | Vikku',
    description: 'Describe your product and get an opinionated, modern tech stack recommendation (frontend, backend, database, hosting) with reasoning. Free.',
    canonical: '/tools/tech-recommender',
  },
  maintenance_calculator: {
    title: 'Software Maintenance Cost Calculator (India) | Vikku',
    description: 'Find out how much it really costs to maintain your app or website every month - hosting, monitoring, bug fixes, security, and support. Free AI estimate.',
    canonical: '/tools/maintenance-calculator',
  },
  ai_visibility_score: {
    title: 'AI Visibility Score - Will ChatGPT Recommend Your Business? | Vikku',
    description: 'Paste your URL and see how likely AI assistants are to find and recommend your business - plus exactly what to fix. Free instant check.',
    canonical: '/tools/ai-visibility-score',
  },
}

// Build FAQPage structured data from a tool's FAQ block (rich results in Google).
export function faqJsonLd(toolKey) {
  const c = TOOL_FAQ[toolKey]
  if (!c) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export const TOOL_FAQ = {
  cost_estimator: {
    heading: 'How much does it cost to build an app or website?',
    intro: 'Software costs depend on scope, complexity, integrations, and where your team is based. This AI estimator gives you a realistic, itemised range in your local currency in seconds - no sales call required.',
    faqs: [
      { q: 'How accurate is the estimate?', a: 'It uses current market rates and your described scope to produce a conservative min–max range. Treat it as a planning ballpark, not a fixed quote.' },
      { q: 'What affects the cost most?', a: 'Number of features, third-party integrations, custom design, and whether you need web, mobile, or both. The breakdown shows where the money goes.' },
      { q: 'Is it really free?', a: 'Yes. Generate as many estimates as you like, email them to yourself, and share the report - completely free.' },
    ],
  },
  roi_calculator: {
    heading: 'What is the ROI of a website for my business?',
    intro: 'Most small businesses lose revenue every month to missed leads. This calculator estimates how much you’re leaving on the table and how fast a website pays for itself.',
    faqs: [
      { q: 'How is ROI calculated?', a: 'We model your current lead volume and average deal value against the additional leads a professional website typically captures for your industry.' },
      { q: 'What payback period is realistic?', a: 'For most service businesses, a website pays for itself within a few months. Your specific payback period is in the report.' },
      { q: 'Will this work for my industry?', a: 'Yes - the model adjusts to your business type, from restaurants to SaaS to local services.' },
    ],
  },
  timeline_calculator: {
    heading: 'How long does it take to build software?',
    intro: 'Get a realistic, phase-by-phase project timeline based on your scope - from discovery and design through development, testing, and launch.',
    faqs: [
      { q: 'How is the timeline estimated?', a: 'The AI breaks your project into standard phases and assigns realistic durations based on scope and complexity.' },
      { q: 'Can timelines be compressed?', a: 'Often yes - with a larger team or reduced scope. The phase breakdown shows where time is spent so you can prioritise.' },
    ],
  },
  tech_recommender: {
    heading: 'Which tech stack should I use?',
    intro: 'Describe your product and constraints and get an opinionated, modern tech stack recommendation - frontend, backend, database, and hosting - with the reasoning behind each choice.',
    faqs: [
      { q: 'Why trust the recommendation?', a: 'It favours proven, well-supported technologies matched to your scale, team size, and budget - not hype.' },
      { q: 'Can I change it later?', a: "Yes. The recommendation is a strong default; the reasoning helps you adapt it to your team's strengths." },
    ],
  },
  maintenance_calculator: {
    heading: 'How much does it cost to maintain software?',
    intro: "Building is only the beginning. Ongoing hosting, monitoring, bug fixes, security patches, and support add up fast. This calculator breaks it down so you can budget accurately - whether you're planning a retainer or just want to know what you're in for.",
    faqs: [
      { q: "What's typically included in maintenance?", a: 'Hosting & infrastructure, uptime monitoring, security updates, bug fixes, minor feature tweaks, and support hours depending on your SLA.' },
      { q: 'Why does scale affect maintenance cost?', a: 'More users means higher server costs, more support tickets, stricter uptime requirements, and greater risk from downtime - all of which raise the maintenance budget.' },
      { q: 'Is this the same as a retainer?', a: 'A maintenance retainer covers most of this. The estimate shows what a realistic retainer should cost for your product type and scale.' },
      { q: 'What happens if I skip maintenance?', a: 'Security vulnerabilities accumulate, performance degrades, third-party integrations break, and tech debt compounds - often costing far more to fix later.' },
    ],
  },
  ai_visibility_score: {
    heading: 'Will AI recommend your business?',
    intro: 'AI assistants like ChatGPT and Perplexity are becoming a new front door for customers. This tool checks whether your website gives them what they need to find, understand, and recommend you.',
    faqs: [
      { q: 'How is the score calculated?', a: 'We check structured data, page clarity, crawler access, and content signals AI systems rely on, then combine that with an AI-driven read of your content quality.' },
      { q: "Is my site's content sent anywhere?", a: 'Only a short excerpt of your public page text is analyzed to generate your report - nothing is stored beyond your saved result.' },
      { q: 'Does this check if AI crawlers can access my site?', a: 'Yes - we check your robots.txt for blocks on GPTBot, ClaudeBot, PerplexityBot and other known AI crawlers.' },
    ],
  },
}
