import { useTheme } from '../contexts/ThemeContext'

/*
 * VibeLevel — UI clone (design reference), ported from the standalone HTML.
 * Self-contained: tokens/font/keyframes are scoped to `.vl-page` (see <style> below),
 * so nothing here leaks into the rest of the vikku site. Dark mode follows the global
 * `.dark` class that ThemeContext toggles on <html>.
 *
 * NOTE: icons, copy, and names are placeholders approximating the reference — the
 * layout and design system are the point, not shipping VibeLevel's actual brand.
 */

// ---- icon path sets (injected raw so hyphenated SVG attrs stay valid) ----
const PICON = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" stroke-linejoin="round"/>',
  spark:   '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
  target:  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  idcard:  '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2M14.5 10h4M14.5 13.5h4"/>',
  code:    '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
  doc:     '<path d="M8 4h8v3H8zM6 6h2M16 6h2v14H6V6"/><path d="M9 12h6M9 16h4"/>',
  bot:     '<rect x="4" y="8" width="16" height="11" rx="2.5"/><path d="M12 8V4.5M8.5 13h.01M15.5 13h.01"/>',
  cube:    '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
  users:   '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3 2.9-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><path d="M16 5.2a3 3 0 010 5.6M18.5 19c-.3-1.8-1-3.2-2-4.2"/>',
  shield:  '<path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  medal:   '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5"/>',
  gauge:   '<circle cx="12" cy="12" r="9"/><path d="M12 12V3a9 9 0 016.36 15.36z"/>',
  file:    '<path d="M8 4h8v3H8zM6 6h2M16 6h2v14H6V6"/><path d="M9 12h6M9 16h4"/>',
}

// ---- tile tones: complete literal class names so Tailwind's scanner sees them ----
const PTONE = {
  green:  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blue:   'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  iris:   'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  amber:  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  pink:   'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  slate:  'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  teal:   'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  sky:    'bg-sky-500/10 text-sky-600 dark:text-sky-400',
}

function Icon({ name, size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: PICON[name] }} />
  )
}

// variant: 'lg' (w-10 rounded-lg, 18px) | 'sm' (w-7 rounded-md, 14px)
function Tile({ tone, icon, variant = 'lg' }) {
  const box = variant === 'sm' ? 'w-7 h-7 rounded-md' : 'w-10 h-10 rounded-lg'
  return (
    <span className={`${box} shrink-0 ${PTONE[tone]} grid place-items-center`}>
      <Icon name={icon} size={variant === 'sm' ? 14 : 18} />
    </span>
  )
}

const Chevron = () => (
  <svg className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
)

// ---- data ----
const BUILDERS = [
  ['1', 'AgileBuilder_4b12', '8.2', 'EXPERT', 'text-iris'],
  ['2', 'SharpBuilder_3985', '8.2', 'EXPERT', 'text-iris'],
  ['3', 'EchoBuilder_94b4', '8.0', 'PROFICIENT', 'text-brandS'],
  ['4', 'LunarBuilder_e454', '7.9', 'PROFICIENT', 'text-brandS'],
  ['5', 'AgileBuilder_27de', '7.9', 'PROFICIENT', 'text-brandS'],
  ['6', 'NovaBuilder_7c31', '7.6', 'PROFICIENT', 'text-brandS'],
  ['7', 'PixelBuilder_a90f', '7.4', 'PROFICIENT', 'text-brandS'],
]

// Platform mega menu — 3 columns of {title, desc, tone, icon}
const PLATFORM = [
  { head: 'Aura', items: [
    ['MCP Connector', 'Wire your dev tools in to score real work.', 'green', 'compass'],
    ['Session Analysis', 'Deep reads on the sessions you already run.', 'green', 'spark'],
    ['Scoring Engine & Dimensions', 'Multi-dimensional collaboration scoring.', 'green', 'target'],
    ['Archetype & Profile', 'Find your AI working style.', 'green', 'idcard'],
  ] },
  { head: 'Assessments', items: [
    ['AI-Native IDE', 'Code, run, and evaluate in one place.', 'indigo', 'code'],
    ['Multi-Role Assessments', 'Technical and business, every role.', 'indigo', 'doc'],
    ['AI Assessment Builder', 'Gather, design, validate, publish.', 'indigo', 'bot'],
    ['Dedicated VM Runtime', 'Real VMs with terminal and file system.', 'indigo', 'cube'],
  ] },
  { head: 'Features', items: [
    ['Collaboration Scoring Engine', 'Human-AI collaboration, scored.', 'orange', 'users'],
    ['Proctoring & Anti-Cheat', 'Proctoring with AI cheat detection.', 'pink', 'shield'],
    ['Identity Verification', 'ID and LinkedIn checks you can trust.', 'amber', 'idcard'],
    ['AI Agents', 'Multi-agent workflows across the lifecycle.', 'sky', 'bot'],
    ['Verified Badges', 'Novice to Expert, shareable to LinkedIn.', 'teal', 'medal'],
  ] },
]

// Products mega menu — 4 divided columns
const PRODUCTS = [
  { title: 'Aura', titleTone: 'text-brandS', tone: 'green', icon: 'target',
    desc: 'Your AI style, read from real sessions.',
    items: [['Aura Profile', 'green', 'idcard'], ['Leaderboard', 'orange', 'medal'], ['Human Contribution Score', 'pink', 'gauge'], ['Verified Skill Badges', 'green', 'medal']] },
  { title: 'Teams', titleTone: 'text-azure', tone: 'blue', icon: 'users',
    desc: 'Workforce AI fluency, measured and raised.',
    items: [['AI Skills Sprints', 'orange', 'target'], ['Org Challenges Library', 'green', 'file'], ['Org Leaderboard', 'orange', 'medal'], ['Proctoring & Anti-Cheat', 'pink', 'shield']] },
  { title: 'Hiring', titleTone: 'text-iris', tone: 'iris', icon: 'file',
    desc: 'Funnel, pre-screen, and live tech interviews.',
    items: [['AI Resume Scoring & Auto-Filter', 'orange', 'file'], ['ID & LinkedIn Verification', 'amber', 'idcard'], ['Proctoring & Anti-Cheat', 'amber', 'shield'], ['Human Contribution Score', 'pink', 'gauge'], ['AI Assessment Builder', 'blue', 'bot']] },
  { title: 'Campus', titleTone: 'text-fg', tone: 'slate', icon: 'compass',
    desc: 'Challenges, campus leaderboard, talent pipeline.',
    items: [['Proctoring & Anti-Cheat', 'iris', 'shield'], ['Human Contribution Score', 'pink', 'gauge'], ['Live Leaderboard', 'orange', 'medal'], ['Roster Management', 'pink', 'users'], ['AI Assessment Builder', 'blue', 'bot']] },
]

// Browse Assessments dropdown
const ASSESSMENTS = [
  { emoji: '🐍', tileBg: 'bg-emerald-500/10', title: 'Document Q&A Bot', desc: 'Build a retrieval pipeline that answers from a document set.', badge: 'Beginner', badgeTone: 'green' },
  { emoji: '🐍', tileBg: 'bg-emerald-500/10', title: 'LangChain Agent + Tool Calling', desc: 'Wire a tool into a FastAPI chat app to look up live prices.', badge: 'Advanced', badgeTone: 'rose' },
  { emoji: '☕', tileBg: 'bg-rose-500/10', title: 'Seat Booking Service', desc: 'Fix a concurrency bug so bookings stay correct under load.', badge: 'Intermediate', badgeTone: 'amber' },
]
const BADGE = {
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

// Resources menu — 2 divided columns
const RESOURCES = [
  { head: 'Resources', items: [
    ["Who It's For", 'Builders, students, hiring, campus.', 'amber', 'users'],
    ['Sample Report', 'A 7-dimension breakdown.', 'green', 'file'],
    ['Compare', 'How we stack up against the others.', 'blue', 'medal'],
  ] },
  { head: 'Company', items: [
    ['About', 'Our story, team, and address.', 'teal', 'compass'],
    ['Contact', 'Get in touch with our team.', 'iris', 'idcard'],
    ['Terms', 'Terms of service.', 'pink', 'shield'],
  ] },
]

const CHIPS = ['💻 Engineers', '📋 Product / TPM', '💼 Sales', '🎧 Customer Support', '📊 Finance', '⚙️ Operations']
const INPUTS = ['💬 Prompts', '🤝 AI Pairing', '🧩 Design Thinking', '🎯 Product Thinking', '🔍 Code Understanding', '🧪 Testing', '📋 Requirements', '♟️ Strategic Thinking']
const LADDER = [
  ['Expert', 'text-iris', 'bg-irisSurf'],
  ['Proficient', 'text-brandS', 'bg-brandSurf'],
  ['Developing', 'text-warn', 'bg-warnSurf'],
  ['Novice', 'text-mutedfg', 'bg-card'],
]
const CAPS = ['MCP Connector', 'AI Style Insights', 'Style & Signature', 'Teams for Workforce', 'AI-Native IDE', 'Coding & Non-Coding', 'Custom Rubrics', 'Hiring & Campus']
const AURA_METRICS = [['Delegation', 81], ['Verification', 74], ['Context Setting', 86], ['Iteration', 70]]
const SCORES = [['Prompting', '8.5'], ['AI Pairing', '8.0'], ['Design Thinking', '8.0'], ['Requirements', '9.0']]
const AURA_LEVELS = [
  ['Exceptional', '(8.0+)', 'text-brandS', 'Consistent, high-impact collaboration.'],
  ['Strong', '(6.0–8.0)', 'text-brandS', 'Reliable style, strong execution.'],
  ['Capable', '(3.0–6.0)', 'text-warn', 'Clear momentum, room to sharpen.'],
  ['Emerging', '(0–3.0)', 'text-mutedfg', 'Early signal. Keep practicing.'],
]
const BADGES = [
  ['Expert', '(8.0+)', 'text-iris', 'Architects with AI. Full command.'],
  ['Proficient', '(6.0–8.0)', 'text-brandS', 'Steers AI with intent and precision.'],
  ['Developing', '(3.0–6.0)', 'text-warn', 'Solid foundation. Keep building.'],
  ['Novice', '(0–3.0)', 'text-mutedfg', 'Pointed in the right direction.'],
]

// comparison cells
const Yes = <span className="text-brandS text-base font-bold">✓</span>
const No = <span className="text-mutedfg/40 text-base">—</span>
const dim = (t) => <span className="text-xs text-mutedfg">{t}</span>
const strong = (t) => <span className="text-xs font-bold text-brandS">{t}</span>
const CMP = [
  ['AI Coding Agent (Copilot-class)', No, Yes],
  ['AI Non-Coding Assessments', No, Yes],
  ['Full IDE (editor, terminal, tree)', dim('Basic'), Yes],
  ['AI-Native Assessment Scoring', No, Yes],
  ['Human Contribution Detection', No, Yes],
  ['Anti-Cheating & Proctoring', dim('Basic'), Yes],
  ['AI Resume Scoring', No, Yes],
  ['End-to-End Hiring Funnel', No, Yes],
  ['Agentic Auto-Filter & Screening', No, Yes],
  ['Multi-Dimensional Scoring', No, Yes],
  ['Candidate Comparison & Ranking', dim('Limited'), Yes],
  ['Campus Events & Talent Pipeline', No, Yes],
  ['Pricing', dim('$300–$500/seat/yr'), strong('Pay-as-you-go')],
  ['Free Tier', dim('Limited'), strong('Generous')],
]

const StarSvg = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 2.5l2.2 5.6 6 .4-4.6 3.9 1.5 5.8L12 15.1 6.9 18.2l1.5-5.8L3.8 8.5l6-.4z" strokeLinejoin="round" />
  </svg>
)
const EngineArrow = () => (
  <svg className="w-16 h-3 text-brand" viewBox="0 0 64 12" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M0 6h56M50 2l6 4-6 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function TickerRow() {
  return (
    <div className="flex items-center shrink-0">
      {BUILDERS.map(([rank, name, score, level, tone], i) => (
        <span key={i} className="flex items-center gap-2.5 px-6 whitespace-nowrap">
          <span className="text-xs font-bold text-mutedfg">#{rank}</span>
          <span className="text-sm font-semibold">{name}</span>
          <span className={`text-sm font-bold ${tone}`}>{score}</span>
          <span className={`eyebrow text-[10px] font-bold ${tone} uppercase`}>{level}</span>
          <span className="text-mutedfg/40 text-[8px]">◆</span>
        </span>
      ))}
    </div>
  )
}

const SCOPED_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.vl-page {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  --vl-background: 150 5% 96%; --vl-foreground: 147 19% 9%; --vl-card: 0 0% 100%;
  --vl-muted: 140 21% 95%; --vl-muted-foreground: 147 11% 33%; --vl-border: 215 12% 86%;
  --vl-brand: 152 80% 42%; --vl-brand-strong: 146 85% 26%; --vl-brand-surface: 144 45% 94%;
  --vl-iris: 262 83% 58%; --vl-iris-strong: 263 70% 50%; --vl-iris-surface: 257 90% 96%;
  --vl-azure: 221 83% 53%; --vl-azure-surface: 220 91% 95%;
  --vl-warning: 46 86% 29%; --vl-warning-surface: 49 88% 94%;
  --vl-elev-1: 0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.1);
  --vl-elev-2: 0 4px 10px -2px rgba(16,24,40,.1), 0 2px 6px -2px rgba(16,24,40,.06);
  --vl-elev-3: 0 18px 28px -8px rgba(16,24,40,.18), 0 8px 12px -6px rgba(16,24,40,.08);
}
html.dark .vl-page {
  --vl-background: 220 40% 6%; --vl-foreground: 210 20% 96%; --vl-card: 220 30% 11%;
  --vl-muted: 220 20% 16%; --vl-muted-foreground: 210 15% 50%; --vl-border: 210 20% 17%;
  --vl-brand: 151 100% 45%; --vl-brand-strong: 151 100% 45%; --vl-brand-surface: 156 38% 11%;
  --vl-iris: 256 95% 72%; --vl-iris-strong: 269 97% 85%; --vl-iris-surface: 260 30% 15%;
  --vl-azure: 213 94% 68%; --vl-azure-surface: 216 42% 15%;
  --vl-warning: 47 100% 63%; --vl-warning-surface: 44 45% 11%;
  --vl-elev-1: none; --vl-elev-2: none; --vl-elev-3: none;
}
.vl-page .eyebrow { letter-spacing: .12em; }
.vl-page .h1 { letter-spacing: -1.8px; }
@keyframes vl-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.vl-page .ticker-track { animation: vl-ticker 40s linear infinite; }
.vl-page .ticker:hover .ticker-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .vl-page .ticker-track { animation: none; } }
`

export default function VibeLevel() {
  const theme = useTheme()
  const toggle = theme?.toggle
  const isDark = theme?.theme !== 'light'

  return (
    <div className="vl-page min-h-screen bg-bg text-fg antialiased">
      <style>{SCOPED_CSS}</style>

      {/* ============ NAVBAR ============ */}
      <header className="sticky top-0 z-50">
        <nav className="bg-card border-b border-line relative z-10">
          <div className="mx-auto max-w-[1400px] px-6 h-[68px] flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 shrink-0">
              <StarSvg className="w-6 h-6 text-brandS" />
              <span className="text-[22px] font-extrabold tracking-tight">Vibe<span className="text-brandS">Level</span></span>
            </a>

            <ul className="hidden lg:flex items-center gap-7 text-[15px] font-medium">
              <li><a href="#" className="text-brandS">Home</a></li>

              {/* Platform — 3-column, viewport-centred */}
              <li className="group static">
                <button className="flex items-center gap-1 hover:text-brandS transition-colors py-6">Platform<Chevron /></button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[1050px] max-w-[calc(100vw-2rem)]">
                  <div className="bg-card border border-line rounded-2xl shadow-e3 p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8">
                    {PLATFORM.map((col) => (
                      <div key={col.head}>
                        <p className="eyebrow text-[11px] font-bold text-mutedfg uppercase mb-4">{col.head}</p>
                        {col.items.map(([title, desc, tone, icon]) => (
                          <a key={title} href="#" className="flex gap-3 rounded-lg p-2.5 -mx-2.5 hover:bg-muted transition-colors">
                            <Tile tone={tone} icon={icon} />
                            <span>
                              <span className="block font-semibold text-[15px]">{title}</span>
                              <span className="block text-[13px] text-mutedfg mt-0.5 leading-snug">{desc}</span>
                            </span>
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </li>

              {/* Products — 4 divided columns */}
              <li className="group static">
                <button className="flex items-center gap-1 hover:text-brandS transition-colors py-6">Products<Chevron /></button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[1280px] max-w-[calc(100vw-2rem)]">
                  <div className="bg-card border border-line rounded-2xl shadow-e3 p-6 grid grid-cols-1 md:grid-cols-4 md:divide-x md:divide-line">
                    {PRODUCTS.map((c) => (
                      <div key={c.title} className="px-5">
                        <a href="#" className="flex gap-3 items-start rounded-lg p-2 -mx-2 hover:bg-muted transition-colors">
                          <Tile tone={c.tone} icon={c.icon} />
                          <span>
                            <span className={`block font-bold text-[17px] ${c.titleTone}`}>{c.title}</span>
                            <span className="block text-[13px] text-mutedfg mt-0.5 leading-snug">{c.desc}</span>
                          </span>
                        </a>
                        <hr className="my-4 border-line" />
                        {c.items.map(([label, tone, icon]) => (
                          <a key={label} href="#" className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-muted transition-colors">
                            <Tile tone={tone} icon={icon} variant="sm" />
                            <span className="text-sm font-medium">{label}</span>
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </li>

              {/* Browse Assessments — narrow, centred under its own item */}
              <li className="group relative">
                <a href="#" className="block hover:text-brandS transition-colors py-6">Browse Assessments</a>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[460px] max-w-[calc(100vw-2rem)]">
                  <div className="bg-card border border-line rounded-2xl shadow-e3 p-4">
                    <div className="flex items-center justify-between px-1 pb-2">
                      <p className="eyebrow text-[11px] font-bold text-mutedfg uppercase">Popular Assessments</p>
                      <p className="text-[11px] font-bold text-brandS whitespace-nowrap">✦ Free to try</p>
                    </div>
                    {ASSESSMENTS.map((a) => (
                      <a key={a.title} href="#" className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted transition-colors">
                        <span className={`w-9 h-9 shrink-0 rounded-lg ${a.tileBg} grid place-items-center text-base`}>{a.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-sm truncate">{a.title}</span>
                          <span className="block text-xs text-mutedfg truncate">{a.desc}</span>
                        </span>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md ${BADGE[a.badgeTone]}`}>{a.badge}</span>
                      </a>
                    ))}
                    <a href="#" className="mt-2 flex items-center justify-center gap-1.5 bg-brandSurf text-brandS font-semibold text-sm py-3 rounded-lg hover:opacity-80 transition-opacity">
                      Browse all assessments <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </li>

              {/* Resources — 2 divided columns */}
              <li className="group static">
                <button className="flex items-center gap-1 hover:text-brandS transition-colors py-6">Resources<Chevron /></button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[740px] max-w-[calc(100vw-2rem)]">
                  <div className="bg-card border border-line rounded-2xl shadow-e3 p-6 grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-line">
                    {RESOURCES.map((col) => (
                      <div key={col.head} className="px-6">
                        <p className="eyebrow text-[11px] font-bold text-mutedfg uppercase text-center mb-4">{col.head}</p>
                        {col.items.map(([title, desc, tone, icon]) => (
                          <a key={title} href="#" className="flex gap-3 rounded-lg p-2.5 -mx-2.5 hover:bg-muted transition-colors">
                            <Tile tone={tone} icon={icon} />
                            <span>
                              <span className="block font-semibold text-[15px]">{title}</span>
                              <span className="block text-[13px] text-mutedfg mt-0.5 leading-snug">{desc}</span>
                            </span>
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </li>

              <li><a href="#" className="hover:text-brandS transition-colors">Pricing</a></li>
            </ul>

            <div className="ml-auto flex items-center gap-4">
              <button onClick={toggle} aria-label="Toggle theme" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-muted transition-colors">
                {isDark ? (
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" strokeLinecap="round" /></svg>
                ) : (
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></svg>
                )}
              </button>
              <a href="#" className="hidden sm:block text-[15px] font-medium hover:text-brandS transition-colors">Sign In</a>
              <a href="#" className="bg-fg text-bg text-[15px] font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">Request Demo</a>
            </div>
          </div>
        </nav>

        {/* ============ TICKER ============ */}
        <div className="ticker bg-card border-b border-line flex items-stretch overflow-hidden">
          <div className="shrink-0 flex items-center px-6 border-r border-line">
            <span className="eyebrow text-[11px] font-bold uppercase whitespace-nowrap">Top Builders</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="ticker-track flex w-max items-center py-3">
              <TickerRow /><TickerRow />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="py-8">
          <div className="mx-auto max-w-[1400px] px-6">
            <h1 className="h1 text-center text-[44px] leading-[1.08] font-extrabold max-w-[1100px] mx-auto">
              <span className="text-brandS">Measure your AI craft.</span>{' '}
              <span className="text-iris">Hire people who ship.</span>
            </h1>
            <p className="mt-5 text-center text-[17px] leading-relaxed text-mutedfg max-w-[820px] mx-auto">
              Keep running the AI sessions you already run. Earn a <strong className="text-fg font-semibold">verified profile from real work</strong> — and let hiring teams shortlist on proof instead of résumés.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-[1160px] mx-auto">
              {CHIPS.map((c) => (
                <button key={c} className="bg-card border border-line rounded-full py-2.5 text-sm font-medium shadow-e1 hover:border-brand hover:text-brandS transition-colors">{c}</button>
              ))}
            </div>

            {/* scoring engine diagram */}
            <div className="mt-8 bg-card border border-line rounded-2xl shadow-e1 p-8 max-w-[1160px] mx-auto">
              <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
                <div>
                  <p className="eyebrow text-[11px] font-bold text-mutedfg uppercase text-right mb-3">Inputs</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {INPUTS.map((t) => (
                      <div key={t} className="bg-card border border-line rounded-lg px-3 py-2.5 text-sm font-medium">{t}</div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <EngineArrow />
                  <div className="w-[160px] aspect-square border-2 border-brand rounded-xl grid place-items-center text-center px-3">
                    <div>
                      <div className="text-2xl">⚙️</div>
                      <p className="mt-2 font-bold text-[15px] leading-tight">Human AI Collab</p>
                      <p className="font-bold text-[15px] text-brandS leading-tight">Scoring Engine</p>
                    </div>
                  </div>
                  <EngineArrow />
                </div>

                <div>
                  <p className="eyebrow text-[11px] font-bold text-mutedfg uppercase mb-3">4-Level Ladder</p>
                  <div className="space-y-2.5">
                    {LADDER.map(([label, tone, surf]) => (
                      <div key={label} className={`flex items-center gap-2.5 ${surf} border border-line rounded-lg px-3 py-2.5`}>
                        <span className="w-5 h-5 grid place-items-center rounded-full bg-card border border-line text-[10px]">★</span>
                        <span className={`text-sm font-semibold ${tone}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
                <span className="bg-fg text-bg text-xs font-bold px-4 py-2.5 rounded-lg">Claude Code</span>
                <span className="bg-card border border-line text-xs font-bold px-4 py-2.5 rounded-lg">GitHub Copilot</span>
                <span className="bg-fg text-bg text-xs font-bold px-4 py-2.5 rounded-lg">Perplexity</span>
                <span className="text-sm text-mutedfg">& more</span>
              </div>
            </div>

            {/* persona strips */}
            <div className="mt-10 grid md:grid-cols-3 gap-8 max-w-[1300px] mx-auto">
              {[
                ['🎯', 'Aura', 'text-brandS', 'bg-brandSurf', 'border-brand/30', 'Your AI style, read from real sessions.', 'Builders · Individuals'],
                ['🏢', 'Teams', 'text-azure', 'bg-azureSurf', 'border-azure/30', 'Workforce AI fluency, leveled up.', 'Employees · Management'],
                ['📋', 'Hiring', 'text-iris', 'bg-irisSurf', 'border-iris/30', 'Thousands in, a shortlist out.', 'Recruiters · Hiring Managers'],
              ].map(([emoji, title, tone, surf, brd, desc, meta]) => (
                <div key={title} className="flex items-center gap-4">
                  <div className={`w-14 h-14 shrink-0 rounded-full ${surf} border ${brd} grid place-items-center text-xl`}>{emoji}</div>
                  <div>
                    <p className={`font-bold text-lg ${tone}`}>{title}</p>
                    <p className="text-sm text-mutedfg mt-0.5">{desc}</p>
                    <p className="eyebrow text-[10px] font-bold text-mutedfg uppercase mt-1.5">{meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ AURA / HOW IT WORKS ============ */}
        <section className="py-16">
          <div className="mx-auto max-w-[1200px] px-6">
            <p className="eyebrow text-center text-[11px] font-bold text-brandS uppercase">✨ Aura · Your AI Style Insights</p>
            <h2 className="mt-3 text-center text-[34px] leading-tight font-extrabold tracking-tight max-w-[760px] mx-auto">
              Read your AI style straight from your sessions — in five minutes.
            </h2>
            <p className="mt-4 text-center text-[16px] text-mutedfg max-w-[720px] mx-auto leading-relaxed">
              Connect your tools and get scoring on the work you're already doing. A multi-dimensional profile, an archetype, and a spot on the leaderboard. Nothing to sit down and take.
            </p>

            <div className="mt-7 flex items-center justify-center gap-3">
              <button className="bg-brandSurf text-brandS border border-brand/40 text-sm font-semibold px-5 py-2.5 rounded-lg">👩‍💻 Developers</button>
              <button className="bg-card border border-line text-sm font-semibold px-5 py-2.5 rounded-lg hover:border-brand transition-colors">📄 Non-Developers</button>
            </div>
            <div className="mt-5 flex justify-center">
              <a href="#" className="bg-brandS text-white text-[15px] font-semibold px-6 py-3 rounded-lg shadow-e2 hover:opacity-90 transition-opacity">Discover your Aura free</a>
            </div>

            <p className="mt-14 text-center text-sm font-bold uppercase eyebrow text-mutedfg">How it works</p>
            <div className="mt-6 grid md:grid-cols-3 gap-5">
              {[
                ['🔌', '1.', 'Connect via MCP', 'Drop one connector into Claude Code, Cursor, Codex, Claude Desktop, or VS Code.'],
                ['🎯', '2.', 'Get style insights', 'Your agent summarizes each session and sends redacted evidence for scoring, archetype, and dimensions.'],
                ['🔗', '3.', 'Build a shareable profile', 'Publish a public profile, climb the leaderboard, and sharpen the weak spots with challenges.'],
              ].map(([emoji, n, title, desc]) => (
                <div key={title} className="bg-card border border-line rounded-xl shadow-e1 p-6">
                  <div className="w-11 h-11 rounded-lg bg-brandSurf grid place-items-center text-lg">{emoji}</div>
                  <p className="mt-4 font-bold"><span className="text-brandS">{n}</span> {title}</p>
                  <p className="mt-2 text-sm text-mutedfg leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PERSONAS ============ */}
        <section className="py-12">
          <div className="mx-auto max-w-[1200px] px-6">
            <p className="eyebrow text-center text-[11px] font-bold text-mutedfg uppercase">Personas · Product Lines</p>
            <h2 className="mt-3 text-center text-[30px] font-extrabold tracking-tight">Pick your journey. Start with the right pillar.</h2>

            <p className="mt-10 eyebrow text-[11px] font-bold text-brandS uppercase">Aura · Your AI Style Insights</p>
            <p className="mt-1 text-sm text-mutedfg">For builders, individuals, and workforce teams.</p>
            <div className="mt-4 grid md:grid-cols-2 gap-5">
              {[
                ['🎯', 'bg-brandSurf', 'Aura', 'For builders & individuals', 'Your AI style, read from the sessions you already run.', 'text-brandS'],
                ['🏢', 'bg-azureSurf', 'Teams', 'For employees & management', 'Workforce AI fluency, measured and leveled up.', 'text-azure'],
              ].map(([emoji, surf, title, meta, desc, tone]) => (
                <PersonaCard key={title} {...{ emoji, surf, title, meta, desc, tone }} />
              ))}
            </div>

            <p className="mt-10 eyebrow text-[11px] font-bold text-iris uppercase">Assessments</p>
            <p className="mt-1 text-sm text-mutedfg">For hiring funnels and campus skill evaluation.</p>
            <div className="mt-4 grid md:grid-cols-2 gap-5">
              {[
                ['📋', 'bg-irisSurf', 'Hiring', 'For recruiters & hiring managers', 'Thousands of applicants in, a short list out — no panel burnout.', 'text-iris'],
                ['🎓', 'bg-warnSurf', 'Campus', 'For students & coordinators', 'AI-ready students, with the proof employers ask for.', 'text-warn'],
              ].map(([emoji, surf, title, meta, desc, tone]) => (
                <PersonaCard key={title} {...{ emoji, surf, title, meta, desc, tone }} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ TWO PILLARS ============ */}
        <section className="py-16 bg-bg/60">
          <div className="mx-auto max-w-[1240px] px-6">
            <p className="eyebrow text-center text-[11px] font-bold text-mutedfg uppercase">Platform Architecture</p>
            <h2 className="mt-3 text-center text-[32px] font-extrabold tracking-tight">Two pillars. One platform.</h2>
            <p className="mt-4 text-center text-[16px] text-mutedfg max-w-[860px] mx-auto leading-relaxed">
              Two ways to understand AI skill on one AI-native platform: read your working style from the real sessions you already run, or run structured evaluations in the IDE.
            </p>

            <p className="mt-10 eyebrow text-[11px] font-bold text-mutedfg uppercase text-center">Two Pillars</p>
            <div className="mt-5 grid md:grid-cols-2 gap-6">
              <div className="bg-card border-2 border-brand/40 rounded-2xl shadow-e1 p-7">
                <p className="text-xl font-extrabold text-brandS">Aura</p>
                <p className="eyebrow text-[10px] font-bold text-mutedfg uppercase mt-1">Discover your AI style & signature</p>
                <p className="mt-3 text-sm text-mutedfg leading-relaxed">Connect your tools via MCP and read your working style out of the AI work you already do — nothing to sit. For individuals (Aura) and the workforce (Teams).</p>
              </div>
              <div className="bg-card border-2 border-iris/40 rounded-2xl shadow-e1 p-7">
                <p className="text-xl font-extrabold text-iris">Assessments</p>
                <p className="eyebrow text-[10px] font-bold text-mutedfg uppercase mt-1">Structured evaluation in the IDE</p>
                <p className="mt-3 text-sm text-mutedfg leading-relaxed">Run role-aligned, structured evaluations in the AI-native IDE. Powers hiring funnels and campus events.</p>
              </div>
            </div>

            <p className="mt-10 eyebrow text-[11px] font-bold text-mutedfg uppercase text-center">Pillar Capabilities</p>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {CAPS.map((t) => (
                <div key={t} className="bg-card border border-line rounded-lg px-4 py-3 text-sm font-medium text-center shadow-e1">{t}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SAMPLE REPORTS ============ */}
        <section className="py-14">
          <div className="mx-auto max-w-[1200px] px-6">
            <p className="eyebrow text-center text-[11px] font-bold text-mutedfg uppercase">Human-AI Collaboration</p>
            <h2 className="mt-3 text-center text-[30px] font-extrabold tracking-tight">See a style profile and a score report</h2>
            <p className="mt-4 text-center text-[16px] text-mutedfg max-w-[820px] mx-auto leading-relaxed">
              Both outputs, side by side: style insights built from redacted, agent-submitted evidence, and structured assessment scoring with a human-contribution read.
            </p>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {/* Aura sample */}
              <div className="bg-card border border-line rounded-2xl shadow-e1 p-7">
                <p className="eyebrow text-[10px] font-bold text-mutedfg uppercase">Aura Style Sample</p>
                <p className="mt-1 text-sm text-mutedfg">Real-work style view, driven by redacted evidence.</p>
                <div className="mt-6 flex items-center gap-5">
                  <div className="w-28 h-28 shrink-0 rounded-full border-[6px] border-brand/25 border-t-brandS grid place-items-center">
                    <div className="text-center">
                      <p className="text-2xl font-extrabold text-brandS leading-none">7.8</p>
                      <p className="text-[10px] font-bold text-mutedfg mt-0.5">/10</p>
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow text-[10px] font-bold text-mutedfg uppercase">Archetype</p>
                    <p className="text-lg font-extrabold">The Architect</p>
                    <span className="mt-1.5 inline-block bg-brandSurf text-brandS text-[11px] font-bold px-2.5 py-1 rounded-full">Strong</span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {AURA_METRICS.map(([label, pct]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs font-semibold"><span className="text-mutedfg">{label}</span><span>{(pct / 10).toFixed(1)}</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-brandS" style={{ width: `${pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment sample */}
              <div className="bg-card border border-line rounded-2xl shadow-e1 p-7">
                <p className="eyebrow text-[10px] font-bold text-mutedfg uppercase">Assessment Score Sample</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-[44px] font-extrabold leading-none text-iris">8.4</span>
                  <span className="text-lg font-bold text-mutedfg">/10</span>
                  <span className="ml-2 bg-irisSurf text-iris text-[11px] font-bold px-2.5 py-1 rounded-full">Expert</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {SCORES.map(([label, val]) => (
                    <div key={label} className="bg-muted rounded-lg p-4">
                      <p className="eyebrow text-[10px] font-bold text-mutedfg uppercase">{label}</p>
                      <p className="text-xl font-extrabold mt-1">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-line">
                  <div className="flex justify-between text-xs font-semibold"><span className="text-mutedfg">Human Contribution</span><span className="text-brandS">72%</span></div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-brandS" style={{ width: '72%' }} /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ LEVELS + BADGES ============ */}
        <section className="py-14">
          <div className="mx-auto max-w-[1200px] px-6">
            <p className="eyebrow text-center text-[11px] font-bold text-mutedfg uppercase">AI Skill Signals</p>
            <h2 className="mt-3 text-center text-[30px] font-extrabold tracking-tight">Aura levels and verified skill badges</h2>
            <p className="mt-4 text-center text-[16px] text-mutedfg max-w-[820px] mx-auto leading-relaxed">
              Levels summarize your real-work AI style. Badges are earned from structured assessments and challenge performance.
            </p>

            <p className="mt-10 eyebrow text-[11px] font-bold text-brandS uppercase">Aura Levels</p>
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {AURA_LEVELS.map(([label, range, tone, desc]) => (
                <div key={label} className="bg-card border border-line rounded-xl shadow-e1 p-5">
                  <p className={`font-bold ${tone}`}>{label} <span className="text-mutedfg font-medium text-xs">{range}</span></p>
                  <p className="mt-1.5 text-sm text-mutedfg">{desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 eyebrow text-[11px] font-bold text-iris uppercase">Verified Skill Badges</p>
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {BADGES.map(([label, range, tone, desc]) => (
                <div key={label} className="bg-card border border-line rounded-xl shadow-e1 p-5">
                  <p className={`font-bold ${tone}`}>{label} <span className="text-mutedfg font-medium text-xs">{range}</span></p>
                  <p className="mt-1.5 text-sm text-mutedfg">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ COMPARISON ============ */}
        <section className="py-10">
          <div className="mx-auto max-w-[1000px] px-6">
            <p className="eyebrow text-center text-[11px] font-bold text-mutedfg uppercase">VibeLevel vs Others</p>
            <h2 className="mt-3 text-center text-[30px] font-extrabold tracking-tight">Built for the AI-first era</h2>
            <p className="mt-4 text-center text-[16px] text-mutedfg max-w-[760px] mx-auto leading-relaxed">
              More capability, less cost. Two pillars on one AI-native platform.
            </p>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="text-left eyebrow text-[10px] font-bold text-mutedfg uppercase px-4 py-3">Feature</th>
                    <th className="eyebrow text-[10px] font-bold text-mutedfg uppercase px-4 py-3 w-[140px]">Others</th>
                    <th className="eyebrow text-[10px] font-bold text-brandS uppercase px-4 py-3 w-[160px]">VibeLevel.ai</th>
                  </tr>
                </thead>
                <tbody>
                  {CMP.map(([feature, others, vibe], i) => (
                    <tr key={feature} className={i % 2 ? '' : 'bg-card'}>
                      <td className="px-4 py-3 font-medium border-t border-line rounded-l-lg">{feature}</td>
                      <td className="px-4 py-3 text-center border-t border-line">{others}</td>
                      <td className="px-4 py-3 text-center border-t border-line bg-brandSurf/40 rounded-r-lg">{vibe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="py-14">
          <div className="mx-auto max-w-[900px] px-6 text-center">
            <h2 className="text-[32px] font-extrabold tracking-tight leading-tight">Find your AI style. Hire the best. Assess your students.</h2>
            <p className="mt-4 text-[16px] text-mutedfg leading-relaxed max-w-[720px] mx-auto">Pick a path. Two pillars, one AI-native platform.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a href="#" className="bg-brandS text-white text-[15px] font-semibold px-6 py-3 rounded-lg shadow-e2 hover:opacity-90 transition-opacity">Discover your AI style</a>
              <a href="#" className="bg-card border border-line text-[15px] font-semibold px-6 py-3 rounded-lg hover:border-brand transition-colors">Start hiring</a>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-line bg-card">
        <div className="mx-auto max-w-[1400px] px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <StarSvg className="w-5 h-5 text-brandS" />
            <span className="font-extrabold">Vibe<span className="text-brandS">Level</span></span>
          </div>
          <p className="text-sm text-mutedfg">Placeholder footer — layout clone for design reference.</p>
          <div className="flex items-center gap-5 text-sm text-mutedfg">
            <a href="#" className="hover:text-fg">Privacy</a>
            <a href="#" className="hover:text-fg">Terms</a>
            <a href="#" className="hover:text-fg">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PersonaCard({ emoji, surf, title, meta, desc, tone }) {
  return (
    <div className="bg-card border border-line rounded-xl shadow-e1 p-6 hover:shadow-e2 transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 shrink-0 rounded-lg ${surf} grid place-items-center text-xl`}>{emoji}</div>
        <div>
          <p className="font-bold text-lg">{title}</p>
          <p className="eyebrow text-[10px] font-bold text-mutedfg uppercase mt-0.5">{meta}</p>
          <p className="mt-2 text-sm text-mutedfg">{desc}</p>
          <a href="#" className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold ${tone}`}>Explore <span>→</span></a>
        </div>
      </div>
    </div>
  )
}
