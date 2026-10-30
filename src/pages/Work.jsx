import { Link } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import { AI_PRODUCTS, CLIENT_WORK, TESTIMONIALS } from '../data/company'
import './home3d.css'

const DESCRIPTION = "Vikku's work: AI products running in production and software built for businesses in India and the USA, with a full case study and client testimonials."

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Our work',
  url: 'https://www.vikku.in/work',
  description: DESCRIPTION,
}

export default function Work() {
  return (
    <div className="v3d svc">
      <Seo title="Our Work: AI Products and Client Projects | Vikku" description={DESCRIPTION} canonical="/work" jsonLd={JSON_LD} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Work</span></nav>
          <p className="eyebrow">Our work</p>
          <h1>Work you can <em>try today</em></h1>
          <p className="lead">AI products we run in production, and software we built for real businesses in India and the USA.</p>
          <div className="ctas"><BookButton short="Book an AI Discovery Call" location="work" /></div>
        </header>

        <section className="svc-section">
          <p className="eyebrow">Case study</p>
          <h2>Jobly Solutions: from WhatsApp and Excel to <em>one staffing platform</em></h2>
          <p className="lead">A US staffing company moved its day-to-day operations out of group chats and spreadsheets into five connected portals for HR, operations, finance, employees and admins.</p>
          <p className="proof"><Link to="/work/jobly-solutions">Read the case study</Link></p>
        </section>

        <section className="svc-section">
          <h2>AI we've <em>shipped</em></h2>
          <p className="lead">Vikku's own AI products, running GPT-4o in production behind rate-limited server functions. Try any of them free.</p>
          <ul className="cards">
            {AI_PRODUCTS.map(p => <li key={p.name}><strong>{p.name}</strong><span>{p.desc}</span><Link className="try" to={p.to}>Try it</Link></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>Client <em>engineering</em></h2>
          <p className="lead">Software we built for real businesses. These were not AI projects; they show the engineering foundation behind our AI work.</p>
          <ul className="cards">
            {CLIENT_WORK.map(c => (
              <li key={c.name}>
                <strong><a href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a></strong>
                <span>{c.desc}</span>
                {c.note && <em>{c.note}</em>}
                {c.caseStudy && <Link className="try" to={c.caseStudy}>Read the case study</Link>}
              </li>
            ))}
          </ul>
        </section>

        <section className="svc-section">
          <h2>What clients <em>say</em></h2>
          <div className="quotes">
            {TESTIMONIALS.map(t => (
              <figure key={t.name}>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption><strong>{t.name}</strong> · {t.role}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="svc-cta">
          <h2>Want to be our <em>next case study?</em></h2>
          <p>Book a free 30-minute call. Tell us how your team works today, and we'll show you where AI can help.</p>
          <div className="ctas"><BookButton short="Book an AI Discovery Call" location="work-footer" /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
