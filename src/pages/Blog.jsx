import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import { AUTHOR, CATEGORIES, POSTS } from '../data/blog'
import { readMinutes } from '../lib/blogMarkdown'
import './home3d.css'

const SITE = 'https://www.vikku.in'
const DESCRIPTION = 'Practical, honest guides for Indian business owners on AI, automation and software: what to build, what it costs, and what to avoid. Written by Vikku Labs.'

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      '@id': `${SITE}/blog#blog`,
      name: 'Vikku Labs Blog',
      url: `${SITE}/blog`,
      description: DESCRIPTION,
      inLanguage: 'en-IN',
      publisher: { '@id': `${SITE}/#organization` },
      blogPost: POSTS.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE}/blog/${p.slug}`, datePublished: p.date })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
      ],
    },
  ],
}

export default function Blog() {
  const [category, setCategory] = useState('All')
  const shown = useMemo(() => category === 'All' ? POSTS : POSTS.filter(p => p.category === category), [category])

  return (
    <div className="v3d svc">
      <Seo title="Blog: AI, Automation and Software Guides | Vikku Labs" description={DESCRIPTION} canonical="/blog" jsonLd={JSON_LD} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Blog</span></nav>
          <p className="eyebrow">Blog</p>
          <h1>Straight answers about <em>AI and software</em></h1>
          <p className="lead">Practical guides for Indian business owners: what to build, what it really costs, and what you don't need. Written by {AUTHOR.name}, founder of Vikku Labs.</p>
        </header>

        <section className="svc-section">
          <div className="post-filters" role="group" aria-label="Filter by topic">
            {['All', ...CATEGORIES].map(c => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <ul className="post-list">
            {shown.map(p => (
              <li key={p.slug}>
                <Link to={`/blog/${p.slug}`}>
                  <span className="post-meta">{p.category} · {readMinutes(p)} min read</span>
                  <strong>{p.title}</strong>
                  <span>{p.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="svc-cta">
          <h2>Want an answer for <em>your business?</em></h2>
          <p>Book a free 30-minute call. Tell us how your team works today, and we'll tell you honestly what's worth building and what isn't.</p>
          <div className="ctas"><BookButton short="Book an AI Discovery Call" location="blog" /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
