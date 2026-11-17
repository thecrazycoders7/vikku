import { Fragment, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import NotFound from './NotFound'
import { AUTHOR, POSTS, postBySlug, relatedPosts } from '../data/blog'
import { parseArticle, readMinutes } from '../lib/blogMarkdown'
import './home3d.css'

const SITE = 'https://www.vikku.in'
const fmtDate = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
// Google cuts titles at about 60 characters, so the brand is added only when it fits.
const pageTitle = (t) => (t.length + 13 <= 65 ? `${t} | Vikku Labs` : t)

function Parts({ parts }) {
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p.href ? <Link to={p.href}>{p.text}</Link> : p.bold ? <strong>{p.text}</strong> : p.text}
    </Fragment>
  ))
}

function Article({ body }) {
  return parseArticle(body).map((b, i) => {
    if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>
    if (b.type === 'h3') return <h3 key={i}>{b.text}</h3>
    if (b.type === 'callout') return <blockquote key={i}><Parts parts={b.parts} /></blockquote>
    if (b.type === 'ul' || b.type === 'ol') {
      const List = b.type
      return <List key={i}>{b.items.map((it, j) => <li key={j}><Parts parts={it} /></li>)}</List>
    }
    if (b.type === 'table') {
      return (
        <div key={i} className="post-table">
          <table>
            <thead><tr>{b.head.map((c, j) => <th key={j} scope="col"><Parts parts={c} /></th>)}</tr></thead>
            <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}><Parts parts={c} /></td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    }
    return <p key={i}><Parts parts={b.parts} /></p>
  })
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = postBySlug(slug)
  // Links between articles change only the slug, so start each article at the top.
  useEffect(() => { window.scrollTo(0, 0) }, [slug])
  if (!post) return <NotFound />

  const url = `${SITE}/blog/${post.slug}`
  const minutes = readMinutes(post)
  const related = relatedPosts(post)
  const index = POSTS.indexOf(post)
  const prev = POSTS[index - 1], next = POSTS[index + 1]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description: post.description,
        abstract: post.summary,
        url,
        mainEntityOfPage: url,
        datePublished: post.date,
        dateModified: post.updated || post.date,
        inLanguage: 'en-IN',
        articleSection: post.category,
        timeRequired: `PT${minutes}M`,
        image: `${SITE}/og-vikku-ai.jpg`,
        author: { '@type': 'Person', name: AUTHOR.name, jobTitle: AUTHOR.role, url: AUTHOR.url, sameAs: [AUTHOR.url] },
        publisher: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Vikku Labs', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` } },
        isPartOf: { '@id': `${SITE}/blog#blog` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: post.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  }

  return (
    <div className="v3d svc">
      <Seo title={pageTitle(post.seoTitle || post.title)} description={post.description} canonical={`/blog/${post.slug}`} jsonLd={jsonLd} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><Link to="/blog">Blog</Link><span>/</span><span>{post.category}</span></nav>
          <p className="eyebrow">{post.category} · {minutes} min read</p>
          <h1>{post.title}</h1>
          <p className="post-byline">By <a href={AUTHOR.url} target="_blank" rel="noopener noreferrer author">{AUTHOR.name}</a>, {AUTHOR.role} · <time dateTime={post.date}>{fmtDate(post.date)}</time></p>
        </header>

        <article className="post">
          <section className="post-answer" aria-label="Short answer">
            <p className="eyebrow">Short answer</p>
            <p>{post.summary}</p>
          </section>

          <section className="post-takeaways" aria-label="Key takeaways">
            <h2>Key takeaways</h2>
            <ul>{post.takeaways.map(t => <li key={t}>{t}</li>)}</ul>
          </section>

          <div className="post-body"><Article body={post.body} /></div>

          <section className="post-faq" aria-label="Frequently asked questions">
            <h2>Frequently asked <em>questions</em></h2>
            <div className="faq">
              {post.faqs.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </section>

          {post.related && <p className="proof">Next step: <Link to={post.related.to}>{post.related.label}</Link>, free.</p>}
        </article>

        <section className="svc-section">
          <h2>Keep <em>reading</em></h2>
          <ul className="post-list">
            {related.map(p => (
              <li key={p.slug}><Link to={`/blog/${p.slug}`}><span className="post-meta">{p.category} · {readMinutes(p)} min read</span><strong>{p.title}</strong><span>{p.description}</span></Link></li>
            ))}
          </ul>
          <nav className="post-pager" aria-label="Previous and next articles">
            {prev ? <Link to={`/blog/${prev.slug}`}>← {prev.title}</Link> : <span />}
            {next ? <Link to={`/blog/${next.slug}`}>{next.title} →</Link> : <Link to="/blog">All articles →</Link>}
          </nav>
        </section>

        <section className="svc-cta">
          <h2>Want an honest answer for <em>your business?</em></h2>
          <p>Book a free 30-minute call. We'll tell you what's worth building, what it should cost, and what you don't need.</p>
          <div className="ctas"><BookButton short="Book an AI Discovery Call" location={`blog-${post.slug}`} /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
