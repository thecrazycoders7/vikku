import { Link } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import './home3d.css'

const SITE = 'https://www.vikku.in'
const PATH = '/products/restaurant-management-system'
const IMG = '/products/restaurant-management-system'
const DEMO = 'https://kavari-grand-rms.vercel.app'
const DESCRIPTION = 'A restaurant management system for Indian restaurants: POS, kitchen display, recipes and food cost, inventory, delivery, staff and online ordering in one place. Live demo with sample data.'

const AT_A_GLANCE = [
  { label: 'Product', value: 'Restaurant management system' },
  { label: 'Built for', value: 'Indian restaurants with dine-in, takeaway and delivery' },
  { label: 'Users', value: '7 roles: owner, manager, cashier, waiter, kitchen, inventory and accounts' },
  { label: 'Size', value: 'About 20 screens and 5,700 lines of code, plus a customer ordering page' },
]

const PROBLEMS = [
  { title: 'Separate tools that never agree', desc: 'Billing in one app, orders on paper slips, stock in a notebook, delivery on the phone and staff on WhatsApp. Nothing adds up at closing.' },
  { title: 'Food cost nobody can see', desc: 'Prices are set once and ingredient costs keep rising. Without recipes linked to stock, a popular dish can quietly lose money.' },
  { title: 'Cash that leaks', desc: 'Discounts with no limits, cash-on-delivery that never reaches the counter, and shifts that close without anyone checking.' },
  { title: 'A kitchen that runs on shouting', desc: 'Slips get lost, nobody knows which order is late, and the same table waits twice as long as the next one.' },
]

const MODULES = [
  { title: 'Service', desc: 'Point of sale with split, merge and held bills, role-limited discounts, coupons, split payments and GST invoices. Orders, tables with transfers and waitlist, and reservations.' },
  { title: 'Kitchen display', desc: 'Tickets by station, timers against target times, delayed and rush flags, and a performance view.' },
  { title: 'Menu, recipes and food cost', desc: 'Portions, add-ons, combos, happy hours and serving times. Every dish has a recipe, so food cost and margin update as ingredient prices change.' },
  { title: 'Stock and purchasing', desc: 'Inventory with batches and expiry, wastage, stock counts and transfers. Purchase orders, goods received, supplier returns, ledgers and payments.' },
  { title: 'Delivery and online orders', desc: 'Own-fleet delivery for website and phone orders, OTP at the door, and cash-on-delivery tracked per rider. Customers order for delivery, pickup or at the table by QR code, then track it.' },
  { title: 'People and business', desc: 'Customers and feedback, staff attendance, roster, leave and payroll, editable role access, finance, branches, reports and insights.' },
]

const FLOW = [
  'An order comes in from the counter, a table QR code, the website or a phone call.',
  'A kitchen ticket goes to the right station, with a timer against its target time.',
  'Sending the ticket takes the ingredients out of stock, using each dish\'s recipe.',
  'The kitchen marks it ready, and late tickets are flagged before the guest complains.',
  'The bill is split across UPI, card or cash, with discounts limited by role and GST shown on the invoice.',
  'Cash, including cash collected by delivery riders, is checked against the shift when it closes.',
]

const SCREENS = [
  { file: 'dashboard', label: 'Dashboard', alt: 'Restaurant dashboard with net sales, orders, gross profit, food cost and hourly revenue' },
  { file: 'pos', label: 'Point of sale', alt: 'Point of sale with menu categories, dishes and the order panel with GST' },
  { file: 'kitchen', label: 'Kitchen display', alt: 'Kitchen display with new, preparing and ready tickets, timers and delayed flags' },
  { file: 'recipes', label: 'Recipes and food cost', alt: 'Recipe costing table with food cost percentage and margin for each dish' },
  { file: 'inventory', label: 'Inventory', alt: 'Inventory with stock levels, reorder points, suppliers and expiring batches' },
  { file: 'delivery', label: 'Delivery', alt: 'Delivery board with orders in the kitchen, ready to assign, with riders and out for delivery' },
]

const DECISIONS = [
  { title: 'Recipes drive stock', desc: 'Stock moves when the kitchen ticket is sent, not when someone remembers to update it. Food cost becomes a live number instead of a yearly guess.' },
  { title: 'One cash shift for all money', desc: 'Counter cash and delivery cash end up in the same shift, so cash-on-delivery can\'t go missing between the rider and the till.' },
  { title: 'Limits by role', desc: 'Each role sees only its own screens, and discounts are capped by role. The owner can change who can do what.' },
  { title: 'Built for speed at the counter', desc: 'Keyboard shortcuts, quick search and number keys to add dishes, because a slow POS is the one a busy cashier stops using.' },
]

const NEXT_STEPS = [
  'Connect a real backend for shared data across devices and branches.',
  'Add live payment, WhatsApp and printer integrations.',
  'Add barcode scanning and a multi-restaurant admin console.',
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Restaurant management system: one place for the whole restaurant',
  description: DESCRIPTION,
  url: `${SITE}${PATH}`,
  author: { '@type': 'Organization', name: 'Vikku Labs', url: SITE },
  publisher: { '@type': 'Organization', name: 'Vikku Labs', url: SITE, logo: `${SITE}/logo.png` },
}

export default function CaseStudyRestaurant() {
  return (
    <div className="v3d svc">
      <Seo title="Restaurant Management System Case Study | Vikku Labs" description={DESCRIPTION} canonical={PATH} image={`${SITE}${IMG}/dashboard.webp`} jsonLd={JSON_LD} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><Link to="/products">Products</Link><span>/</span><span>Restaurant management system</span></nav>
          <p className="eyebrow">Case study · Restaurant operations</p>
          <h1>One system for the whole <em>restaurant</em></h1>
          <p className="lead">A restaurant management system that runs billing, the kitchen, recipes and food cost, stock, delivery, staff and online ordering from one place, built around how Indian restaurants actually work.</p>
          <p className="lead">It is a working front-end demo with a sample restaurant and sample data. It has not run in a real restaurant yet.</p>
          <div className="ctas">
            <a className="btn btn-ghost" href={DEMO} target="_blank" rel="noopener noreferrer">Try the live demo</a>
            <BookButton short="Book a free consultation" location="case-restaurant" />
          </div>
        </header>

        <section className="svc-section">
          <ul className="cards">
            {AT_A_GLANCE.map((f, i) => <li key={f.label} className={i === AT_A_GLANCE.length - 1 ? 'full' : ''}><span>{f.label}</span><strong>{f.value}</strong></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>The <em>problem</em></h2>
          <p className="lead">Most restaurants run on several tools that don't talk to each other, and the gaps between them are where money disappears.</p>
          <ul className="cards">
            {PROBLEMS.map(p => <li key={p.title}><strong>{p.title}</strong><span>{p.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>What it <em>covers</em></h2>
          <ul className="cards">
            {MODULES.map(m => <li key={m.title}><strong>{m.title}</strong><span>{m.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>How an order <em>moves</em></h2>
          <ul className="cards">
            {FLOW.map((s, i) => <li key={s}><strong>Step {i + 1}</strong><span>{s}</span></li>)}
          </ul>
        </section>

        <section className="svc-section" id="screens">
          <h2>Inside the <em>system</em></h2>
          <p className="lead">Screens from the live demo, shown with a sample restaurant and sample data.</p>
          <div className="cs-shots">
            {SCREENS.map(s => (
              <figure className="cs-shot" key={s.file}>
                <img src={`${IMG}/${s.file}.webp`} alt={s.alt} width="1200" height="750" loading="lazy" />
                <figcaption>{s.label}</figcaption>
              </figure>
            ))}
          </div>
          <figure className="cs-shot" style={{ maxWidth: 260, marginTop: 20 }}>
            <img src={`${IMG}/order-phone.webp`} alt="Customer ordering page on a phone with delivery and pickup and the menu" width="520" height="1125" loading="lazy" />
            <figcaption>Customer ordering page, on a phone</figcaption>
          </figure>
        </section>

        <section className="svc-section">
          <h2>Key <em>decisions</em></h2>
          <ul className="cards">
            {DECISIONS.map(d => <li key={d.title}><strong>{d.title}</strong><span>{d.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>Status and <em>next steps</em></h2>
          <p className="lead">Everything shown works in the browser, including the customer ordering page, but data is stored on the device, so it isn't shared between devices yet. There is no backend, live payments or printer connection.</p>
          <ul className="cards">
            {NEXT_STEPS.map((s, i) => <li key={s} className={i === NEXT_STEPS.length - 1 ? 'full' : ''}><strong>Step {i + 1}</strong><span>{s}</span></li>)}
          </ul>
          <p className="proof">Thinking about software for your own restaurant? Read <Link to="/blog/scaling-to-multiple-locations">one outlet to five: what breaks first</Link>, or try the free <Link to="/tools/project-estimator">Project Estimator</Link>.</p>
        </section>

        <section className="svc-cta">
          <h2>Running a restaurant on <em>paper and five apps?</em></h2>
          <p>Book a free consultation. Tell us how your restaurant runs today, and we'll show you what one system could look like.</p>
          <div className="ctas"><BookButton short="Book a free consultation" location="case-restaurant-footer" /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
