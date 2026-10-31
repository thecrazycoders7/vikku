import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import { getServicePage, serviceStack } from '../data/servicePages'
import './home3d.css'

const SITE = 'https://www.vikku.in'

function structuredData(page) {
  const url = `${SITE}/${page.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: page.navLabel,
        serviceType: page.eyebrow,
        description: page.description,
        url,
        provider: { '@type': 'Organization', name: 'Vikku Labs', url: SITE, logo: `${SITE}/logo.png` },
        areaServed: ['India', 'United States', 'United Kingdom', 'Middle East'],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: page.navLabel, item: url },
        ],
      },
    ],
  }
}

export default function ServicePage({ slug }) {
  const page = getServicePage(slug)
  const jsonLd = useMemo(() => page && structuredData(page), [page])
  if (!page) return <Navigate to="/" replace />

  return (
    <div className="v3d svc">
      <Seo title={page.title} description={page.description} canonical={`/${page.slug}`} jsonLd={jsonLd} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>{page.navLabel}</span></nav>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.h1[0]} <em>{page.h1[1]}</em></h1>
          {page.intro.map(p => <p key={p.slice(0, 24)} className="lead">{p}</p>)}
          <div className="ctas">
            <BookButton short="Book an AI Discovery Call" location={`service-${page.slug}`} />
            <a className="btn btn-ghost" href="#faq">Read the FAQ</a>
          </div>
        </header>

        <section className="svc-section">
          <h2>What you <em>get</em></h2>
          <ul className="cards">
            {page.outcomes.map(o => <li key={o.title}><strong>{o.title}</strong><span>{o.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>Where it <em>helps</em></h2>
          <ul className="cards">
            {page.useCases.map(u => <li key={u.title}><strong>{u.title}</strong><span>{u.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>How we <em>build it</em></h2>
          <ol className="cards steps">
            {page.steps.map((s, i) => <li key={s.title} className={i === page.steps.length - 1 ? 'full' : ''}><strong><i>{String(i + 1).padStart(2, '0')}</i> {s.title}</strong><span>{s.desc}</span></li>)}
          </ol>
          <p className="note">AI isn't finished at launch. Every system we ship is evaluated and monitored in real use.</p>
        </section>

        <section className="svc-section">
          <h2>Safeguards, <em>built in</em></h2>
          <ul className="cards">
            {page.safeguards.map(s => <li key={s.title}><strong>{s.title}</strong><span>{s.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>What we build <em>with</em></h2>
          <div className="stack">
            {serviceStack.map(s => <p key={s.label}><b>{s.label}</b>{s.items}</p>)}
          </div>
          <p className="proof">See our AI in action: try the <Link to="/tools/ai-visibility-score">AI Visibility Score</Link> or the <Link to="/pm">AI Project Planner</Link>, both running GPT-4o in production.</p>
        </section>

        <section className="svc-section" id="faq">
          <h2>Frequently asked <em>questions</em></h2>
          <div className="faq">
            {page.faqs.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>
                  {a.includes('Project Estimator')
                    ? <>{a.replace('try our free Project Estimator.', '')}try our free <Link to="/tools/project-estimator">Project Estimator</Link>.</>
                    : a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="svc-section">
          <h2>Related <em>services</em></h2>
          <ul className="cards related">
            {page.related.map(r => {
              const rp = getServicePage(r)
              return <li key={r}><strong><Link to={`/${r}`}>{rp.navLabel}</Link></strong><span>{rp.description}</span></li>
            })}
          </ul>
        </section>

        <section className="svc-cta">
          <h2>Tell us what you want <em>AI to do.</em></h2>
          <p>Book a free AI discovery call. We'll tell you honestly whether AI is the right fit, and what the practical next step is.</p>
          <div className="ctas"><BookButton short="Book an AI Discovery Call" location={`service-${page.slug}-footer`} /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
