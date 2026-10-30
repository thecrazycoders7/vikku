import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import { JOBLY_PORTALS } from '../data/joblyPortals'
import './home3d.css'

const SITE = 'https://www.vikku.in'
const PATH = '/work/jobly-solutions'
const DESCRIPTION = 'How Vikku moved Jobly Solutions, a US staffing company, from WhatsApp groups and Excel sheets to one platform for HR, timesheets, invoicing and immigration cases.'

const AT_A_GLANCE = [
  { label: 'Client', value: 'Jobly Solutions' },
  { label: 'Industry', value: 'Recruitment and staffing' },
  { label: 'Location', value: 'Cumming, Georgia, USA' },
  { label: 'What we built', value: 'A workforce management platform' },
]

const WORKFLOWS = [
  { title: 'From hours to invoice', desc: 'Consultants log their week and attach client proof. A manager approves it or sends it back with a reason. Finance turns approved hours into an invoice, sends it with a secure link, and tracks it until it is paid.' },
  { title: 'Immigration in one place', desc: 'H-1B, PERM, STEM OPT, TN and L-1 cases sit on one 11-step timeline, from the first questionnaire to the USCIS response, with receipts, RFEs, attorney and petitioner on the same record.' },
  { title: 'Expiring documents surface early', desc: 'Visa and document expiry dates feed a single queue for HR, so a lapse shows up as a task instead of a surprise.' },
  { title: 'One record for every team', desc: 'HR, Operations and Finance work from the same employee and client data, so details are entered once and every role sees only what it should.' },
]

const SCOPE = [
  { title: '5 portals, 6 roles', desc: 'Admin, HR, Operations, Finance and Employee, plus Legal review.' },
  { title: '70+ screens', desc: 'Built to work on desktop and on a phone.' },
  { title: '48 database tables', desc: 'People, clients, timesheets, invoices, cases and more.' },
  { title: '400+ commits', desc: 'Shipped in small steps, shaped by real daily use.' },
]

const STACK = [
  { label: 'Frontend', items: 'React, TypeScript, Tailwind CSS' },
  { label: 'Backend', items: 'Node.js, Express, PostgreSQL' },
  { label: 'Cloud', items: 'AWS Lambda, RDS, Cognito, S3' },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Jobly Solutions: from WhatsApp and Excel to one staffing platform',
  description: DESCRIPTION,
  url: `${SITE}${PATH}`,
  author: { '@type': 'Organization', name: 'Vikku', url: SITE },
  publisher: { '@type': 'Organization', name: 'Vikku', url: SITE, logo: `${SITE}/logo.png` },
}

// One portal at a time. All panels stay in the page (hidden) so search engines and the prerender see them.
function PortalTabs() {
  const [active, setActive] = useState(0)
  const tabs = useRef([])
  const onKey = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = (active + step + JOBLY_PORTALS.length) % JOBLY_PORTALS.length
    setActive(next)
    tabs.current[next]?.focus()
  }
  return (
    <>
      <div className="cs-tabs" role="tablist" aria-label="The five portals" onKeyDown={onKey}>
        {JOBLY_PORTALS.map((p, i) => (
          <button key={p.id} type="button" role="tab" id={`tab-${p.id}`} aria-selected={i === active} aria-controls={`panel-${p.id}`}
            tabIndex={i === active ? 0 : -1} ref={el => { tabs.current[i] = el }} onClick={() => setActive(i)}>
            {p.name}
          </button>
        ))}
      </div>
      {JOBLY_PORTALS.map((p, i) => (
        <div key={p.id} className="cs-panel" role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tab-${p.id}`} hidden={i !== active}>
          <p className="eyebrow">For {p.audience.toLowerCase()}</p>
          <h3>{p.tagline}</h3>
          <p className="lead">{p.summary}</p>
          <div className="cs-shots">
            {p.shots.map(([file, alt, caption]) => (
              <figure className="cs-shot" key={file}>
                <a href={`/case-studies/jobly/${file}.webp`} target="_blank" rel="noopener noreferrer" aria-label={`Open full size: ${caption}`}>
                  <img src={`/case-studies/jobly/${file}.webp`} alt={alt} width="1600" height="1000" loading="lazy" />
                </a>
                <figcaption>{caption}</figcaption>
              </figure>
            ))}
          </div>
          <ul className="cards">
            {p.features.map(([title, desc]) => <li key={title}><strong>{title}</strong><span>{desc}</span></li>)}
          </ul>
          <h4>A typical week</h4>
          <ol className="cs-week">{p.week.map(step => <li key={step}>{step}</li>)}</ol>
        </div>
      ))}
    </>
  )
}

export default function CaseStudyJobly() {
  return (
    <div className="v3d svc">
      <Seo title="Jobly Solutions Case Study | Vikku" description={DESCRIPTION} canonical={PATH} jsonLd={JSON_LD} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/#work">Work</a><span>/</span><span>Jobly Solutions</span></nav>
          <p className="eyebrow">Case study · Recruitment and staffing</p>
          <h1>From WhatsApp and Excel to <em>one staffing platform</em></h1>
          <p className="lead">
            <a href="https://www.joblysolutions.com/" target="_blank" rel="noopener noreferrer">Jobly Solutions</a> is a US staffing company.
            Vikku moved its day-to-day operations out of group chats and spreadsheets and into a single platform that covers the whole
            consultant lifecycle, from onboarding to the paid invoice.
          </p>
          <div className="ctas">
            <BookButton short="Book a free consultation" location="case-jobly" />
            <a className="btn btn-ghost" href="#built">See what we built</a>
          </div>
        </header>

        <section className="svc-section">
          <ul className="cards">
            {AT_A_GLANCE.map(f => <li key={f.label}><span>{f.label}</span><strong>{f.value}</strong></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>The <em>challenge</em></h2>
          <p className="lead">
            A staffing company runs on detail. Every consultant comes with a client assignment, weekly hours, an invoice to raise and,
            often, a visa with an expiry date. At Jobly, that work lived in WhatsApp groups and Excel sheets.
          </p>
          <p className="lead">
            That setup leaves no single current version of anything. Information sits in chat threads, spreadsheets get copied between
            people, and each team has its own picture of the same consultant. Jobly needed one place for all of it.
          </p>
        </section>

        <section className="svc-section" id="built">
          <h2>What we <em>built</em></h2>
          <p className="lead">Five portals on one shared record, with a dedicated workspace for each role. Access is enforced on the server, so each person sees only what their job needs. Pick a portal to see its screens.</p>
          <PortalTabs />
          <p className="note">Screens are from a demo build with sample data, so they show Vikku's branding and made-up people, clients and amounts. No real Jobly employee or client data appears on this page.</p>
        </section>

        <section className="svc-section">
          <h2>How the work <em>flows now</em></h2>
          <ul className="cards">
            {WORKFLOWS.map(w => <li key={w.title}><strong>{w.title}</strong><span>{w.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>Built for <em>real use</em></h2>
          <p className="lead">
            The platform kept growing after launch. Legal review, an org chart and overdue invoice digests were all added along the way,
            in small updates.
          </p>
          <p className="lead">
            In September 2026 we moved the platform onto AWS, including its production data, logins and documents.
          </p>
          <ul className="cards">
            {SCOPE.map(s => <li key={s.title}><strong>{s.title}</strong><span>{s.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>The <em>result</em></h2>
          <p className="lead">Jobly replaced its Excel and WhatsApp workflows with one central app, and its teams now work from the same record.</p>
          <div className="quotes">
            <figure>
              <blockquote>“Vikku took our entire staffing workflow from WhatsApp groups and Excel sheets into a proper platform.”</blockquote>
              <figcaption><strong>Jagan</strong> · Director, Jobly Solutions</figcaption>
            </figure>
          </div>
        </section>

        <section className="svc-section">
          <h2>What we built it <em>with</em></h2>
          <div className="stack">
            {STACK.map(s => <p key={s.label}><b>{s.label}</b>{s.items}</p>)}
          </div>
          <p className="proof">Planning something similar? Try our free <Link to="/tools/project-estimator">Project Estimator</Link>.</p>
        </section>

        <section className="svc-cta">
          <h2>Still running on <em>WhatsApp and Excel?</em></h2>
          <p>Book a free consultation. Tell us how your team works today, and we'll show you what a single platform could look like.</p>
          <div className="ctas"><BookButton short="Book a free consultation" location="case-jobly-footer" /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
