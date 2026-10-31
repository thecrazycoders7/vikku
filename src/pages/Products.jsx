import { Link } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import './home3d.css'

const DESCRIPTION = 'Software built and run by Vikku Labs, including Vikku, an AI phone receptionist for hospitals, and Vikku PM, a project management tool.'

const PRODUCTS = [
  { name: 'Vikku AI Receptionist', status: 'In testing, no live hospital yet', desc: 'An AI phone receptionist for hospitals. It answers calls in Telugu, English and Hindi, books patients into the doctor\'s real queue, and hands emergencies to staff.', to: '/products/hospital-receptionist', cta: 'View product' },
  { name: 'Vikku PM', status: 'Live', desc: 'Project management for founders and small teams. Describe a project and the AI drafts a realistic task and milestone plan.', to: '/pm', cta: 'Open Vikku PM' },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Products by Vikku Labs',
  url: 'https://www.vikku.in/products',
  description: DESCRIPTION,
}

export default function Products() {
  return (
    <div className="v3d svc">
      <Seo title="Products | Vikku Labs" description={DESCRIPTION} canonical="/products" jsonLd={JSON_LD} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Products</span></nav>
          <p className="eyebrow">Products</p>
          <h1>Software we <em>build and run</em></h1>
          <p className="lead">Alongside custom work for clients, Vikku Labs builds products of its own.</p>
        </header>

        <section className="svc-section">
          <ul className="cards">
            {PRODUCTS.map(p => (
              <li key={p.name}>
                <strong>{p.name}</strong>
                <span>{p.desc}</span>
                <em>{p.status}</em>
                <Link className="try" to={p.to}>{p.cta}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="svc-cta">
          <h2>Need something <em>built for you?</em></h2>
          <p>Book a free 30-minute call. Tell us how your team works today, and we'll show you where AI can help.</p>
          <div className="ctas"><BookButton short="Book an AI Discovery Call" location="products" /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
