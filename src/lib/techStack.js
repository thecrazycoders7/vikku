// Tech Stack Recommender — deterministic rules engine.
// Answers → an opinionated, reasoned stack per layer with alternatives.
// GPT (phase 2) can later enrich the reasoning; the picks come from these rules.

export const Q = {
  type: {
    q: 'What are you building?',
    options: [
      { key: 'website',   label: 'Marketing website' },
      { key: 'webapp',    label: 'Web application' },
      { key: 'mobile',    label: 'Mobile app' },
      { key: 'saas',      label: 'SaaS platform' },
      { key: 'ecommerce', label: 'E-commerce' },
      { key: 'internal',  label: 'Internal tool' },
    ],
  },
  platforms: {
    q: 'Which platforms?', multi: true,
    options: [
      { key: 'web',     label: 'Web' },
      { key: 'android', label: 'Android' },
      { key: 'ios',     label: 'iOS' },
    ],
  },
  priority: {
    q: 'What matters most right now?',
    options: [
      { key: 'speed', label: 'Ship fast', hint: 'Launch quickly, iterate later' },
      { key: 'scale', label: 'Scale', hint: 'Built to handle heavy growth' },
      { key: 'balanced', label: 'Balanced', hint: 'A sensible middle ground' },
    ],
  },
  scale: {
    q: 'Expected users?',
    options: [
      { key: 'small',  label: '< 10,000' },
      { key: 'medium', label: '10K – 100K' },
      { key: 'large',  label: '100K+' },
      { key: 'unsure', label: 'Not sure' },
    ],
  },
  realtime: { q: 'Need real-time features? (chat, live updates, presence)', options: [
    { key: 'yes', label: 'Yes' }, { key: 'no', label: 'No' },
  ]},
  ai: { q: 'Any AI features?', options: [
    { key: 'none', label: 'No AI' },
    { key: 'api',  label: 'AI via APIs (chatbot, extraction)' },
    { key: 'heavy',label: 'Heavy ML / custom models' },
  ]},
  team: {
    q: 'Any team language preference?',
    options: [
      { key: 'none',   label: 'No preference' },
      { key: 'js',     label: 'JavaScript / TypeScript' },
      { key: 'python', label: 'Python' },
    ],
  },
}
export const Q_ORDER = ['type', 'platforms', 'priority', 'scale', 'realtime', 'ai', 'team']

const pick = (layer, name, reason, alternatives = []) => ({ layer, name, reason, alternatives })

export function recommend(a = {}) {
  const {
    type = 'webapp', platforms = ['web'], priority = 'balanced',
    scale = 'unsure', realtime = 'no', ai = 'none', team = 'none',
  } = a
  const wantsWeb = platforms.includes('web') || platforms.length === 0
  const wantsMobile = platforms.includes('android') || platforms.includes('ios')
  const bothMobile = platforms.includes('android') && platforms.includes('ios')
  const large = scale === 'large'
  const pythonBackend = ai === 'heavy' || team === 'python'

  const layers = []

  // Frontend (web)
  if (wantsWeb) {
    if (type === 'website' || type === 'ecommerce') {
      layers.push(pick('Frontend', 'Next.js + Tailwind CSS',
        'Server-side rendering gives you the SEO and fast first-load that marketing and storefront pages need.',
        ['Astro (content-heavy sites)', 'React + Vite (if SEO is not critical)']))
    } else {
      layers.push(pick('Frontend', 'React + Vite + Tailwind CSS',
        'A fast, modern SPA stack — great DX, huge ecosystem, and quick to build interactive app UIs.',
        ['Next.js (if you need SSR/SEO)', 'Vue + Vite']))
    }
  }

  // Mobile
  if (wantsMobile) {
    if (bothMobile) {
      layers.push(pick('Mobile', 'React Native (Expo)',
        'One codebase ships to both Android and iOS — and shares skills with your React web app, cutting cost and time.',
        ['Flutter (if you prefer Dart / heavy custom UI)', 'Native Kotlin + Swift (max performance)']))
    } else {
      const p = platforms.includes('ios') ? 'iOS' : 'Android'
      layers.push(pick('Mobile', 'React Native (Expo)',
        `Fast to build for ${p} now and easy to add the other platform later without a rewrite.`,
        [p === 'iOS' ? 'Native Swift/SwiftUI' : 'Native Kotlin', 'Flutter']))
    }
  } else if (wantsWeb && wantsMobile === false && (type === 'webapp' || type === 'saas')) {
    layers.push(pick('Mobile', 'Responsive PWA',
      'A responsive web app installs like an app and avoids app-store overhead — add native later if needed.',
      ['React Native when you need native features']))
  }

  // Backend
  if (pythonBackend) {
    layers.push(pick('Backend', 'Python + FastAPI',
      ai === 'heavy'
        ? 'Python is the home of the ML ecosystem (PyTorch, transformers, pandas) — keep your models and API in one language.'
        : 'Your team knows Python, and FastAPI is a fast, typed, modern framework.',
      ['Node.js + NestJS', 'Django (batteries-included)']))
  } else if (priority === 'speed' && !large && ai !== 'heavy') {
    layers.push(pick('Backend', 'Supabase (Postgres + Edge Functions)',
      'A managed backend gives you database, auth, storage and serverless functions out of the box — the fastest path to launch.',
      ['Node.js + Express (more control)', 'Firebase']))
  } else {
    layers.push(pick('Backend', 'Node.js + NestJS (TypeScript)',
      'One language across front and back, strong structure for a growing codebase, and easy hiring.',
      ['Node.js + Express (lighter)', 'Python + FastAPI']))
  }

  // Database
  if (type === 'ecommerce' || type === 'saas' || large) {
    layers.push(pick('Database', 'PostgreSQL' + (large ? ' + Redis cache' : ''),
      large
        ? 'Postgres is rock-solid for relational, transactional data; Redis caches hot reads to keep it fast at scale.'
        : 'Postgres handles relational, transactional data (orders, subscriptions, users) reliably.',
      ['MySQL', 'MongoDB (if data is document-shaped)']))
  } else {
    layers.push(pick('Database', 'PostgreSQL (via Supabase)',
      'A reliable relational database that scales with you, with realtime and auth built in through Supabase.',
      ['MongoDB', 'SQLite (tiny/internal tools)']))
  }

  // Realtime
  if (realtime === 'yes') {
    layers.push(pick('Real-time', 'Supabase Realtime / WebSockets',
      'Postgres change-streams and channels give you chat, presence and live updates without extra infrastructure.',
      ['Socket.IO (custom events)', 'Ably / Pusher (managed)']))
  }

  // AI
  if (ai === 'api') {
    layers.push(pick('AI', 'OpenAI API + server-side calls',
      'Call hosted models from your backend (keys never touch the client) — the quickest way to add chat, extraction or recommendations.',
      ['Anthropic Claude API', 'Google Gemini API']))
  } else if (ai === 'heavy') {
    layers.push(pick('AI', 'Python ML services + pgvector',
      'Run/serve your own models in Python and store embeddings in Postgres (pgvector) for retrieval-augmented features.',
      ['Pinecone / Weaviate (managed vector DB)', 'Hugging Face Inference']))
  }

  // Hosting
  if (large || type === 'saas' && priority === 'scale') {
    layers.push(pick('Hosting', 'AWS (or GCP)' ,
      'At this scale you want control over compute, networking and cost — cloud primitives (containers, queues, CDN) give you that.',
      ['Render / Railway (simpler ops)', 'Vercel + managed DB']))
  } else if (pythonBackend) {
    layers.push(pick('Hosting', 'Vercel (web) + Render (API)',
      'Vercel hosts the frontend with a global CDN; Render runs the Python API with simple, affordable deploys.',
      ['Railway', 'AWS (when you outgrow it)']))
  } else {
    layers.push(pick('Hosting', 'Vercel + Supabase',
      'Push-to-deploy frontend on Vercel with Supabase for backend, DB and auth — minimal ops, fast to ship.',
      ['Netlify + Supabase', 'AWS (for full control later)']))
  }

  // Auth (always useful for apps)
  if (type !== 'website') {
    layers.push(pick('Auth', 'Supabase Auth',
      'Email, phone-OTP and social logins with row-level security — secure and quick to wire up.',
      ['Clerk (polished UX)', 'Auth0']))
  }

  // Summary / considerations
  const considerations = []
  if (priority === 'speed') considerations.push('Optimised for speed to launch — you can harden and scale specific parts later.')
  if (large) considerations.push('At 100K+ users, plan for caching, background jobs, and load testing early.')
  if (bothMobile) considerations.push('A cross-platform mobile choice keeps one team maintaining both apps.')
  if (ai === 'heavy') considerations.push('Heavy ML shifts the backend to Python; budget for GPU/inference costs.')
  if (team === 'js') considerations.push('An all-TypeScript stack lets the same devs move across front and back.')
  considerations.push('This is a strong default — the right stack still depends on your team and constraints.')

  return { layers, considerations, meta: { type, priority, scale } }
}
