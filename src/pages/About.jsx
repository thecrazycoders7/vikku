import { Link } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import { FOUNDER, STATS, WHY_VIKKU } from '../data/company'
import { servicePages } from '../data/servicePages'
import './home3d.css'

const DESCRIPTION = 'Vikku is an AI agency founded by Harsha Vardhan Reddy Sanikommu. We build AI agents, automation and AI software for businesses in India and the USA.'

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Vikku',
  url: 'https://www.vikku.in/about',
  description: DESCRIPTION,
  mainEntity: { '@type': 'Organization', name: 'Vikku', url: 'https://www.vikku.in' },
}

export default function About() {
  return (
    <div className="v3d svc">
      <Seo title="About Vikku | AI Agency Founded by Harsha Vardhan Reddy" description={DESCRIPTION} canonical="/about" jsonLd={JSON_LD} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>About</span></nav>
          <p className="eyebrow">About Vikku</p>
          <h1>We turn complex business problems into <em>practical AI</em></h1>
          <p className="lead">Vikku is an AI agency. We build AI-powered products, intelligent agents and business automation systems that help companies work smarter, operate faster and scale efficiently.</p>
          <div className="ctas">
            <BookButton short="Book an AI Discovery Call" location="about" />
            <Link className="btn btn-ghost" to="/work">See our work</Link>
          </div>
        </header>

        <section className="svc-section">
          <ul className="cards">
            {STATS.map(([n, label]) => <li key={label}><strong>{n}</strong><span>{label}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>Why <em>Vikku</em></h2>
          <ul className="cards">
            {WHY_VIKKU.map(([title, desc]) => <li key={title}><strong>{title}</strong><span>{desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>Meet the <em>founder</em></h2>
          <div className="founder">
            <img src={FOUNDER.photo} alt={FOUNDER.name} width="112" height="112" loading="lazy" />
            <div>
              <strong>{FOUNDER.name}</strong>
              <span>{FOUNDER.role}</span>
              <a className="founder-link" href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="bio">{FOUNDER.bio.map(p => <p key={p}>{p}</p>)}</div>
        </section>

        <section className="svc-section">
          <h2>What we <em>do</em></h2>
          <ul className="cards">
            {servicePages.map(s => <li key={s.slug}><strong><Link to={`/${s.slug}`}>{s.navLabel}</Link></strong></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>Our <em>vision</em></h2>
          <div className="bio">{FOUNDER.vision.map(p => <p key={p}>{p}</p>)}</div>
        </section>

        <section className="svc-cta">
          <h2>Let's build something that <em>matters</em></h2>
          <p>We're always open to connecting with founders, business leaders and innovators who want to explore how AI can transform their businesses.</p>
          <div className="ctas"><BookButton short="Book an AI Discovery Call" location="about-footer" /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
