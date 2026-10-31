import { Link } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import './home3d.css'

const SITE = 'https://www.vikku.in'
const PATH = '/products/harsha-farms'
const IMG = '/products/harsha-farms'
const DESCRIPTION = 'Harsha Farms is a pre-launch Flutter app that runs a daily milk delivery business, with subscriptions, routes and billing for customers, delivery partners, vendors and administrators.'

const AT_A_GLANCE = [
  { label: 'Product', value: 'Dairy subscription and delivery platform' },
  { label: 'Platform', value: 'Flutter, one codebase for Android and iOS' },
  { label: 'Users', value: 'Customers, delivery partners, vendors, administrators' },
  { label: 'Size', value: 'About 7,500 lines of Dart in the app, plus 38 automated tests' },
  { label: 'Status', value: 'Runs on Android with sample data; not launched, so no customer or revenue results yet' },
]

const ROLES = [
  { title: 'Customer', desc: 'Shop and cart, flexible subscriptions, pause and vacation mode, delivery calendar, prepaid wallet or monthly billing, offers, complaints.' },
  { title: 'Delivery partner', desc: 'Route in stop order, consolidated load sheet, customer instructions, code check at the door, missed-delivery reporting, history.' },
  { title: 'Vendor', desc: 'Tomorrow\'s requirement, stock shortages, inventory, procurement, suppliers, pricing, cutoffs, holidays, complaint refunds.' },
  { title: 'Administrator', desc: 'Monthly recurring revenue, active and paused subscriptions, milk volume, churn, failed payments, partner performance, vendor approvals.' },
]

const DAY = [
  'Each subscription follows its own rule: daily, alternate days, chosen weekdays or every few days.',
  'Customers can change any day until the vendor\'s cutoff, such as 10 PM for Harsha Farms.',
  'At the cutoff, the engine applies quantity changes, skips, pauses and holidays, then creates the day\'s orders.',
  'Prepaid wallets are charged. If stock or money runs short, the order is held and released automatically once that is fixed.',
  'Orders flow into each partner\'s route and load sheet. One code per household confirms the whole drop at the door.',
  'Delivered orders close into monthly invoices, and missed prepaid deliveries are refunded to the wallet.',
]

const SCREENS = [
  { file: 'sign-in', label: 'Sign-in', alt: 'Sign-in screen with role tabs and demo accounts' },
  { file: 'home', label: 'Customer home', alt: 'Customer home showing today\'s delivery, delivery code and offers' },
  { file: 'shop', label: 'Shop', alt: 'Shop screen with milk products and prices' },
  { file: 'subscriptions', label: 'Subscriptions', alt: 'Subscriptions screen with quantity controls and pause buttons' },
  { file: 'calendar', label: 'Delivery calendar', alt: 'Delivery calendar with the nightly cutoff notice' },
  { file: 'wallet', label: 'Wallet', alt: 'Wallet screen with balance, add money and spending' },
  { file: 'partner-today', label: 'Partner: today', alt: 'Delivery partner screen with the next stop and instructions' },
  { file: 'partner-routes', label: 'Partner: routes and load sheet', alt: 'Delivery partner load sheet and stops in order' },
  { file: 'vendor-dashboard', label: 'Vendor dashboard', alt: 'Vendor dashboard with orders, milk needed and revenue' },
  { file: 'vendor-inventory', label: 'Vendor inventory', alt: 'Vendor inventory with stock levels and suppliers' },
  { file: 'admin-overview', label: 'Admin overview', alt: 'Admin overview with recurring revenue and subscriptions' },
  { file: 'admin-analytics', label: 'Admin analytics', alt: 'Admin analytics with revenue, milk volume and churn' },
]

const DECISIONS = [
  { title: 'Flutter instead of Swift', desc: 'One codebase for Android and iOS. The first version was a Swift build, which was retired. iOS builds still need Xcode or a cloud Mac.' },
  { title: 'One order per subscription per day', desc: 'An order\'s ID is its subscription and day, and each subscription records how far it has been generated. The automation can run any number of times without creating or charging an order twice.' },
  { title: 'Cutoffs follow the city\'s time zone', desc: 'A phone\'s clock should not decide when a day locks. Tests confirm the cutoff follows the city, not the device.' },
  { title: 'Cart built on the same engine', desc: 'Checkout creates one-time subscriptions with a locked price, charged the evening before. Charging, orders and refunds need no second code path.' },
]

const DESIGN = [
  { title: 'Identity', desc: 'Deep forest green, warm milk white and soft gold, with Fraunces for headings and DM Sans for information.' },
  { title: 'Design system', desc: 'Shared colour, type, spacing and motion tokens plus reusable components keep all four roles feeling like one product.' },
  { title: 'Built for the job', desc: 'Customer screens are photo-led, while partner screens use large targets and big text for use outdoors.' },
  { title: 'Motion', desc: 'A milk bottle fills when an order is placed, the product flies into the cart, and a gold burst marks a finished route.' },
]

const NEXT_STEPS = [
  'Connect a cloud backend for real accounts, shared data and a server-side scheduler.',
  'Add phone sign-in and live payments through a gateway such as Razorpay.',
  'Complete the iOS build.',
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Harsha Farms: one app for a daily milk delivery business',
  description: DESCRIPTION,
  url: `${SITE}${PATH}`,
  author: { '@type': 'Organization', name: 'Vikku Labs', url: SITE },
  publisher: { '@type': 'Organization', name: 'Vikku Labs', url: SITE, logo: `${SITE}/logo.png` },
}

export default function CaseStudyHarshaFarms() {
  return (
    <div className="v3d svc">
      <Seo title="Harsha Farms Case Study: Dairy Delivery App | Vikku Labs" description={DESCRIPTION} canonical={PATH} jsonLd={JSON_LD} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><Link to="/products">Products</Link><span>/</span><span>Harsha Farms</span></nav>
          <p className="eyebrow">Case study · Dairy subscription and delivery</p>
          <h1>One app for a <em>daily milk delivery business</em></h1>
          <p className="lead">Harsha Farms is a working, pre-launch mobile platform that runs a daily milk delivery business from one app, for customers, delivery partners, vendors and administrators.</p>
          <div className="ctas">
            <BookButton short="Book a free consultation" location="case-harsha-farms" />
            <a className="btn btn-ghost" href="#screens">See the app</a>
          </div>
        </header>

        <section className="svc-section">
          <ul className="cards">
            {AT_A_GLANCE.map((f, i) => <li key={f.label} className={i === AT_A_GLANCE.length - 1 ? 'full' : ''}><span>{f.label}</span><strong>{f.value}</strong></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>The <em>problem</em></h2>
          <p className="lead">Milk repeats every day, and every household's schedule is different, so a normal shopping app can't run this business.</p>
          <p className="lead">One family wants a litre of cow milk each morning, buffalo milk each evening and curd on alternate days. They travel, skip a Sunday, or double an order for guests. Each change has to reach the right vendor and delivery partner before a nightly cutoff.</p>
          <p className="lead">The business needs those small decisions turned into exact daily quantities, routes and charges, with no double orders and no missed changes.</p>
        </section>

        <section className="svc-section">
          <h2>The <em>solution</em></h2>
          <p className="lead">One app gives each role the tools for its own job, and all four work from the same schedule.</p>
          <ul className="cards">
            {ROLES.map(r => <li key={r.title}><strong>{r.title}</strong><span>{r.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>How a day <em>moves</em></h2>
          <ul className="cards">
            {DAY.map((s, i) => <li key={s}><strong>Step {i + 1}</strong><span>{s}</span></li>)}
          </ul>
        </section>

        <section className="svc-section" id="screens">
          <h2>Inside the <em>app</em></h2>
          <p className="lead">Screens for all four roles, shown with sample data.</p>
          <div className="cs-phones">
            {SCREENS.map(s => (
              <figure className="cs-shot" key={s.file}>
                <img src={`${IMG}/${s.file}.webp`} alt={s.alt} width="520" height="1167" loading="lazy" />
                <figcaption>{s.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="svc-section">
          <h2>Key <em>decisions</em></h2>
          <p className="lead">Four decisions shaped the build, and each one traded a little flexibility for fewer ways to go wrong.</p>
          <ul className="cards">
            {DECISIONS.map(d => <li key={d.title}><strong>{d.title}</strong><span>{d.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2><em>Design</em></h2>
          <p className="lead">The brand is designed to feel like a premium Indian dairy, not a generic delivery app.</p>
          <ul className="cards">
            {DESIGN.map(d => <li key={d.title}><strong>{d.title}</strong><span>{d.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2><em>Testing</em></h2>
          <p className="lead">The project has 38 automated tests, and 37 passed on the latest run on 31 October 2026.</p>
          <p className="lead">The one failure is a calendar test that taps tomorrow on the current month's grid. On the last day of a month, tomorrow is on the next page, so the test can't find it. The problem is in the test's date assumption, not in the delivery logic.</p>
          <p className="lead">Four engine tests cover the rules that cost money when they break, including generation, cutoffs, wallet charges, refunds and billing. Interface tests drive sign-up, subscribing, checkout and the code check at delivery, then check each role's main screens at four screen sizes and with large system text.</p>
        </section>

        <section className="svc-section">
          <h2>Status and <em>next steps</em></h2>
          <p className="lead">Harsha Farms works end to end on one device, but it needs a backend before real customers can use it.</p>
          <p className="lead">Data is stored on the device as JSON, and sign-in uses demo accounts. Payments always approve through a simulated gateway, and the scheduler runs inside the app. Push notifications and QR scanning are not built.</p>
          <ul className="cards">
            {NEXT_STEPS.map((s, i) => <li key={s} className={i === NEXT_STEPS.length - 1 ? 'full' : ''}><strong>Step {i + 1}</strong><span>{s}</span></li>)}
          </ul>
        </section>

        <section className="svc-cta">
          <h2>Planning a subscription or <em>delivery app?</em></h2>
          <p>Book a free consultation. Tell us how your business runs today, and we'll show you what one app could look like.</p>
          <div className="ctas"><BookButton short="Book a free consultation" location="case-harsha-farms-footer" /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
