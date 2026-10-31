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
    title: 'Free App & Website Cost Estimator (India) | Vikku Labs',
    description: 'Get an instant, itemised cost estimate for your app, website, or software project in your local currency. Free AI estimator - no sales call.',
    canonical: '/tools/cost-estimator',
  },
  roi_calculator: {
    title: 'Website ROI Calculator - How Much Are You Losing? | Vikku Labs',
    description: 'See how much revenue your business loses to missed leads and how fast a website pays for itself. Free ROI calculator for any business type.',
    canonical: '/tools/roi-calculator',
  },
  timeline_calculator: {
    title: 'Software Project Timeline Calculator | Vikku Labs',
    description: 'Get a realistic, phase-by-phase timeline for building your software, app, or website - discovery to launch. Free AI estimate.',
    canonical: '/tools/timeline-calculator',
  },
  tech_recommender: {
    title: 'Tech Stack Recommender - Which Stack Should You Use? | Vikku Labs',
    description: 'Describe your product and get an opinionated, modern tech stack recommendation (frontend, backend, database, hosting) with reasoning. Free.',
    canonical: '/tools/tech-recommender',
  },
  maintenance_calculator: {
    title: 'Software Maintenance Cost Calculator (India) | Vikku Labs',
    description: 'Find out how much it really costs to maintain your app or website every month - hosting, monitoring, bug fixes, security, and support. Free AI estimate.',
    canonical: '/tools/maintenance-calculator',
  },
  // The six tools in the sitemap. `h1` is the page's main heading (the step question is an h2).
  project_estimator: {
    h1: 'Free software project cost estimator',
    title: 'Software Cost Calculator: Free Project Estimator | Vikku Labs',
    description: 'How much will your app, website or AI product cost? Answer a few questions and get an effort range, cost drivers and risks in minutes. Free.',
    canonical: '/tools/project-estimator',
  },
  business_impact: {
    h1: 'Free business impact and ROI calculator',
    title: 'Free ROI Calculator for Software and Automation | Vikku Labs',
    description: 'Is your software, automation or marketing project worth it? Build a 3-year model with ROI, NPV, payback and total cost of ownership. Free.',
    canonical: '/tools/business-impact',
  },
  timeline: {
    h1: 'Free software project timeline calculator',
    title: 'Software Project Timeline Calculator (Free) | Vikku Labs',
    description: 'How long will your project take? Get a realistic phase-by-phase timeline with milestones, from discovery and design to testing and launch. Free.',
    canonical: '/tools/timeline',
  },
  stack_recommender: {
    h1: 'Free tech stack recommender',
    title: 'Tech Stack Recommender: Which Stack Should You Use? | Vikku Labs',
    description: 'Not sure what to build on? Answer a few questions and get a reasoned tech stack for each layer of your project, with alternatives. Free.',
    canonical: '/tools/stack-recommender',
  },
  maintenance: {
    h1: 'Free software maintenance cost calculator',
    title: 'Software Maintenance Cost Calculator (Free) | Vikku Labs',
    description: 'What does it cost to keep your app or website running? See monthly hosting, monitoring, security, fixes and support, with three support tiers. Free.',
    canonical: '/tools/maintenance',
  },
  ai_visibility_score: {
    title: 'AI Visibility Score - Will ChatGPT Recommend Your Business? | Vikku Labs',
    description: 'Paste your URL and see how likely AI assistants are to find and recommend your business - plus exactly what to fix. Free instant check.',
    canonical: '/tools/ai-visibility-score',
  },
}

// Build FAQPage structured data from a tool's FAQ block (rich results in Google).
// "Who it's for / what you get / how it works" and related links, shown with the FAQ on each indexed tool.
const SERVICE_LINKS = {
  agents: ['AI agent development', '/ai-agents'],
  automation: ['AI business automation', '/ai-automation'],
  integration: ['AI integration', '/ai-integration'],
  software: ['AI software development', '/ai-software-development'],
}
const TOOL_LINKS = {
  estimator: ['Project cost estimator', '/tools/project-estimator'],
  impact: ['ROI calculator', '/tools/business-impact'],
  timeline: ['Timeline calculator', '/tools/timeline'],
  stack: ['Tech stack recommender', '/tools/stack-recommender'],
  maintenance: ['Maintenance calculator', '/tools/maintenance'],
  visibility: ['AI Visibility Score', '/tools/ai-visibility-score'],
}
export const TOOL_ABOUT = {
  project_estimator: {
    who: 'Founders and teams who have an idea for a website, app, SaaS or AI product but no budget number to plan around yet.',
    gets: ['An effort range in hours and a likely timeline', 'An investment range with MVP, Business and Enterprise options', 'The biggest cost drivers and risks in your scope', 'A short AI summary you can share with your team'],
    steps: ['Pick what you want to build', 'Answer questions on platforms, features, integrations, design and security', 'Read your estimate, then save it or email it to yourself'],
    related: [TOOL_LINKS.impact, TOOL_LINKS.timeline, TOOL_LINKS.maintenance, SERVICE_LINKS.software],
  },
  business_impact: {
    who: "Business owners and decision-makers deciding whether an automation, software or marketing investment is worth making.",
    gets: ['A 3-year financial model', 'Total cost of ownership, ROI, NPV and payback period', 'The value drivers behind the numbers', 'Risk adjustment, and a live simulator to test your assumptions'],
    steps: ['Choose the kind of investment', 'Enter your numbers, or mark the ones you are not sure about', 'Review your business case and adjust the assumptions'],
    related: [TOOL_LINKS.estimator, TOOL_LINKS.maintenance, SERVICE_LINKS.automation, SERVICE_LINKS.agents],
  },
  timeline: {
    who: 'Anyone who needs a delivery date they can commit to, whether you are planning a launch or checking a quote from a vendor.',
    gets: ['A total timeline in weeks', 'A phase-by-phase schedule from discovery to launch', 'Dated milestones', 'What is driving the timeline up or down'],
    steps: ['Describe what you are building and how big it is', 'Tell us about your platforms, team and designs', 'Get your schedule and see what affects it'],
    related: [TOOL_LINKS.estimator, TOOL_LINKS.stack, TOOL_LINKS.maintenance, SERVICE_LINKS.software],
  },
  stack_recommender: {
    who: 'Founders and product teams who need to choose technologies but do not want to spend weeks comparing frameworks.',
    gets: ['A recommended stack for each layer of your product', 'The reasoning behind each choice', 'Alternatives worth considering'],
    steps: ['Describe your product', 'Tell us about your scale and constraints', 'Get your stack, with the reasons behind it'],
    related: [TOOL_LINKS.estimator, TOOL_LINKS.timeline, SERVICE_LINKS.software, SERVICE_LINKS.integration],
  },
  maintenance: {
    who: 'Anyone budgeting beyond launch day, or checking whether a monthly support quote is fair.',
    gets: ['A monthly cost estimate', 'A breakdown across hosting, monitoring, security, fixes and support', 'Basic, Standard and Premium support tiers'],
    steps: ['Choose what you are maintaining', 'Tell us your user numbers, support level and AI usage', 'See your monthly cost, broken down'],
    related: [TOOL_LINKS.estimator, TOOL_LINKS.impact, SERVICE_LINKS.software, SERVICE_LINKS.integration],
  },
  ai_visibility_score: {
    who: 'Business owners with a website who want to know whether AI assistants like ChatGPT can find, understand and recommend them.',
    gets: ['A visibility score for your site', 'A prioritised list of what is blocking you', 'Concrete fixes you can act on'],
    steps: ['Paste your website address', 'We check how readable your site is for AI assistants', 'Read your score and the fixes'],
    related: [SERVICE_LINKS.agents, SERVICE_LINKS.integration, TOOL_LINKS.estimator, TOOL_LINKS.impact],
  },
}

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
  project_estimator: {
    heading: 'How much does it cost to build custom software?',
    intro: 'A real estimate depends on scope, platforms, features, integrations, and the level of design and security you need. This estimator turns your answers into an itemised cost and effort range in minutes - no sales call.',
    faqs: [
      { q: 'How accurate is the estimate?', a: 'It maps your selected scope - features, platforms, integrations, AI, design and security - to current build effort and market rates, producing a conservative range. Use it as a planning ballpark; a scoping call firms it into a fixed proposal.' },
      { q: 'What drives the price the most?', a: 'The number and complexity of features, third-party and AI integrations, whether you need web plus mobile, custom design, and security or compliance needs. The breakdown shows where each rupee goes.' },
      { q: 'What do I get at the end?', a: 'A costed scope with an effort range, the biggest cost drivers and risks, an AI executive summary, and a recommended next step - plus the option to turn it into a fixed-price proposal on a free call.' },
      { q: 'Is it free?', a: 'Yes - run as many estimates as you like, generate the AI summary, and email the report to yourself for free.' },
    ],
  },
  business_impact: {
    heading: 'What is the business impact of building this software?',
    intro: 'Beyond cost, what will this project actually return? This tool builds a simple financial model - revenue gained or saved, payback period, and multi-year value - so you can decide with numbers, not gut feel.',
    faqs: [
      { q: 'How is the impact calculated?', a: 'It models your inputs - current volumes, conversion, average value, time saved - against the improvement the software is expected to deliver, then projects payback period and multi-year return.' },
      { q: 'Is this a guaranteed return?', a: 'No - it is a scenario model built from your assumptions. Adjust the inputs to see best and worst cases; the report explains which levers move the numbers most.' },
      { q: 'Who is this for?', a: 'Founders and teams deciding whether a build is worth it, or who need a credible business case to justify the investment internally.' },
    ],
  },
  timeline: {
    heading: 'How long does it take to build software?',
    intro: 'Get a realistic, phase-by-phase timeline for your project - discovery, design, development, testing and launch - based on your actual scope, not a generic guess.',
    faqs: [
      { q: 'How is the timeline estimated?', a: 'Your scope is broken into standard delivery phases with realistic durations based on complexity, so you see a start-to-launch schedule rather than a single number.' },
      { q: 'Can the timeline be compressed?', a: 'Often yes - with a larger team or a tighter initial scope. The phase breakdown shows where the time goes so you can decide what ships first.' },
      { q: 'Does it account for testing and launch?', a: 'Yes - QA, revisions, and launch or handover are their own phases, since skipping them is the most common cause of blown deadlines.' },
    ],
  },
  stack_recommender: {
    heading: 'Which tech stack should I use for my project?',
    intro: 'Describe your product, scale, and constraints and get an opinionated, modern tech stack - frontend, backend, database, and hosting - with the reasoning behind each pick.',
    faqs: [
      { q: 'Why trust the recommendation?', a: 'It favours proven, well-supported technologies matched to your scale, team size, and budget - not whatever is trending.' },
      { q: 'Does it consider cost and scale?', a: 'Yes - it weighs hosting cost, how well each choice scales, and how easy it is to hire for, not just technical fit.' },
      { q: 'Can I change it later?', a: "Yes - it's a strong default, and the reasoning helps you adapt it to your team's existing strengths." },
    ],
  },
  maintenance: {
    heading: 'How much does it cost to maintain software?',
    intro: "Building is only the start. Hosting, monitoring, security patches, bug fixes and support add up every month. This calculator breaks it down so you can budget a realistic retainer - or just know what you're in for.",
    faqs: [
      { q: "What's typically included in maintenance?", a: 'Hosting and infrastructure, uptime monitoring, security updates, bug fixes, minor feature tweaks, and support hours depending on your SLA.' },
      { q: 'Why does scale affect maintenance cost?', a: 'More users means higher server costs, more support tickets, stricter uptime requirements, and greater risk from downtime - all of which raise the budget.' },
      { q: 'Is this the same as a retainer?', a: 'A maintenance retainer covers most of this. The estimate shows what a realistic retainer should cost for your product type and scale.' },
      { q: 'What happens if I skip maintenance?', a: 'Security holes accumulate, performance degrades, integrations break, and tech debt compounds - usually costing far more to fix later.' },
    ],
  },
}
