import { Link } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import './home3d.css'

const SITE = 'https://www.vikku.in'
const PATH = '/products/hospital-receptionist'
const IMG = '/products/hospital-receptionist'
const DESCRIPTION = 'Vikku is an AI phone receptionist for hospitals in Andhra Pradesh and Telangana. It answers calls in Telugu, English and Hindi, books patients into the doctor\'s queue and hands emergencies to staff.'

const AT_A_GLANCE = [
  { label: 'Built for', value: 'Hospitals in Andhra Pradesh and Telangana' },
  { label: 'Languages', value: 'Telugu, English and Hindi, including mid-call switching' },
  { label: 'Used by', value: 'Patients who call, and front-desk staff on the dashboard' },
  { label: 'Stage', value: 'Working product, no live hospital yet' },
]

const PROBLEMS = [
  { title: 'Language', desc: 'Callers here speak Telugu, Hindi and English, and often mix them in one sentence.' },
  { title: 'Queues', desc: 'Most clinics do not run on exact appointment times. The doctor sees one patient, then calls the next, so a booking is really a place in line.' },
  { title: 'Risk', desc: 'A caller may describe chest pain or ask to change a dose. A bot must not handle those alone.' },
  { title: 'Trust', desc: 'Formal, wordy speech sounds like a machine, and callers lose patience with it.' },
]

const FEATURES = [
  { title: 'One view of the day', desc: 'The overview shows what needs attention first: urgent tasks, calls, AI bookings and who is next in the queue.' },
  { title: 'One queue for phone and desk patients', desc: 'Staff see every patient\'s number and rough arrival time, whichever way they booked. They can mark visits and no-shows, and keep time free for walk-ins.' },
  { title: 'Desk booking in a few fields', desc: 'For a walk-in, staff enter a phone number, name and doctor. The system offers the next number in each session.' },
  { title: 'Every call is reviewable', desc: 'Each call keeps a summary and a transcript, so staff can check what was said without calling back.' },
]

const CALL_FLOW = [
  { title: 'Routine requests', desc: 'Vikku handles these itself. A caller gets a place in the queue, such as "number 5, around 10:30".' },
  { title: 'Anything risky', desc: 'Emergencies get 108 advice and go to staff. Questions about medicine doses go to staff too.' },
  { title: 'Same dashboard', desc: 'Both paths end in the same place, so your staff see every call and every booking.' },
]

const DESIGN = [
  { title: 'Talks like a front-desk person', desc: 'Short replies, no list of abilities, and it changes language without making a point of it.' },
  { title: 'Honest about being AI', desc: 'One short "AI receptionist" mention stays in the call, and it answers truthfully if sincerely asked.' },
  { title: 'Queue numbers, not fixed slots', desc: 'Doctors see patients in turn, so callers get a number and a rough time, rounded down to 15 minutes.' },
  { title: 'Walk-in capacity protected', desc: 'Each hospital limits Vikku\'s share per doctor and holds times for walk-ins. Staff can book times the phone agent cannot.' },
  { title: 'No confirming three times', desc: 'Picking a time counts as a yes. Rescheduling and cancelling still confirm once.' },
  { title: 'A backup if a model fails', desc: 'The main AI model gets 6 seconds, then a backup takes over so the call keeps going.' },
]

const PRICING = [
  { title: '₹8 a minute', desc: 'Prepaid call time, so you only pay for use.' },
  { title: '₹499 a month', desc: 'For the phone number. There is no other monthly plan.' },
  { title: '₹500 free credit', desc: 'To get started.' },
]

const RESULTS = [
  { title: '1.4–1.7 s to first reply text', desc: 'Down from about 3.2 s, measured on local test calls.' },
  { title: '59 of 64 conversation checks passed', desc: 'Every booking check passed, in a scripted test over 2 rounds.' },
  { title: 'Hospital data kept separate', desc: 'Passed database tests, enforced by Postgres row-level security.' },
  { title: 'Backup model worked', desc: 'Tested with the main model deliberately broken.' },
]

const NEXT_STEPS = [
  'Make the first real call on the Exotel number.',
  'Connect WhatsApp Business for confirmations and emergency alerts.',
  'Move the database to Mumbai and the phone server to the cloud.',
  'Run a pilot with one hospital and measure missed calls before and after.',
  'Add no-show reduction: reminder calls, repeat-booking limits and a live "now serving" queue.',
]

const STACK = [
  { label: 'App', items: 'Next.js, TypeScript, Postgres on Supabase, Vercel' },
  { label: 'Voice', items: 'Exotel for phone calls, Sarvam for speech' },
  { label: 'AI', items: 'Claude Haiku, with Claude Sonnet as backup' },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Vikku AI Receptionist',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: DESCRIPTION,
  url: `${SITE}${PATH}`,
  provider: { '@type': 'Organization', name: 'Vikku Labs', url: SITE, logo: `${SITE}/logo.png` },
}

export default function ProductReceptionist() {
  return (
    <div className="v3d svc">
      <Seo title="AI Phone Receptionist for Hospitals | Vikku Labs" description={DESCRIPTION} canonical={PATH} image={`${SITE}${IMG}/caller-corridor.jpg`} jsonLd={JSON_LD} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><Link to="/products">Products</Link><span>/</span><span>Vikku AI Receptionist</span></nav>
          <p className="eyebrow">Product · For hospitals</p>
          <h1>An AI phone receptionist <em>for hospitals</em></h1>
          <p className="lead">Vikku answers hospital calls in Telugu, English and Hindi, books patients into the doctor's real queue, and hands emergencies to staff.</p>
          <p className="lead">It is a working product, tested with local test calls and scripted conversations. It has not yet run in a real hospital.</p>
          <div className="ctas">
            <BookButton short="Talk to us about a pilot" location="product-receptionist" />
            <a className="btn btn-ghost" href="#how-a-call-works">See how a call works</a>
          </div>
        </header>

        <section className="svc-section">
          <figure className="cs-shot">
            <img src={`${IMG}/caller-corridor.jpg`} alt="A man on the phone in a hospital corridor" width="1200" height="630" />
            <figcaption>Illustrative images throughout this page.</figcaption>
          </figure>
          <ul className="cards">
            {AT_A_GLANCE.map(f => <li key={f.label}><span>{f.label}</span><strong>{f.value}</strong></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>The <em>problem</em></h2>
          <p className="lead">A hospital front desk does two jobs at once: it serves the patients in front of it and answers the phone. When the desk is busy or closed, the caller gets no answer and may go elsewhere. Generic voice bots do not fit this setting, for four reasons.</p>
          <figure className="cs-shot">
            <img src={`${IMG}/night-desk.webp`} alt="An empty hospital front desk at night, with a phone on the counter" width="1400" height="788" loading="lazy" />
          </figure>
          <ul className="cards">
            {PROBLEMS.map(p => <li key={p.title}><strong>{p.title}</strong><span>{p.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>The <em>product</em></h2>
          <p className="lead">Vikku has two sides: a phone agent for patients and a dashboard for staff.</p>
          <ul className="cards">
            {FEATURES.map(f => <li key={f.title}><strong>{f.title}</strong><span>{f.desc}</span></li>)}
          </ul>
          <div className="cs-shots">
            <figure className="cs-shot">
              <img src={`${IMG}/patient-calling.webp`} alt="A woman at home talking on her phone" width="720" height="900" loading="lazy" />
              <figcaption>For patients: a phone agent that answers in their language.</figcaption>
            </figure>
            <figure className="cs-shot">
              <img src={`${IMG}/front-desk.webp`} alt="A hospital receptionist smiling while talking on the phone" width="720" height="900" loading="lazy" />
              <figcaption>For staff: calls and bookings on one dashboard.</figcaption>
            </figure>
          </div>
        </section>

        <section className="svc-section" id="how-a-call-works">
          <h2>How a call <em>works</em></h2>
          <p className="lead">The AI handles routine requests and passes anything risky to a person.</p>
          <ul className="cards">
            {CALL_FLOW.map((c, i) => <li key={c.title} className={i === CALL_FLOW.length - 1 ? 'full' : ''}><strong>{c.title}</strong><span>{c.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>Built around how a hospital <em>really runs</em></h2>
          <ul className="cards">
            {DESIGN.map(d => <li key={d.title}><strong>{d.title}</strong><span>{d.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2><em>Pricing</em></h2>
          <p className="lead">Prepaid, so a hospital only pays for use. If the balance runs out, calls go to your front desk.</p>
          <ul className="cards">
            {PRICING.map((p, i) => <li key={p.title} className={i === PRICING.length - 1 ? 'full' : ''}><strong>{p.title}</strong><span>{p.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>Results <em>so far</em></h2>
          <p className="lead">These results come from testing, not from hospital use. No patient has used Vikku through a real hospital yet.</p>
          <ul className="cards">
            {RESULTS.map(r => <li key={r.title}><strong>{r.title}</strong><span>{r.desc}</span></li>)}
          </ul>
          <p className="note">Not yet proven: answer rate, booking conversion, no-show change, cost per booking and staff time saved. A real call through the Exotel line has also not been tried yet.</p>
        </section>

        <section className="svc-section">
          <h2>What comes <em>next</em></h2>
          <ol className="cards">
            {NEXT_STEPS.map((s, i) => <li key={s} className={i === NEXT_STEPS.length - 1 ? 'full' : ''}><strong>Step {i + 1}</strong><span>{s}</span></li>)}
          </ol>
        </section>

        <section className="svc-section">
          <h2>What it's built <em>with</em></h2>
          <div className="stack">
            {STACK.map(s => <p key={s.label}><b>{s.label}</b>{s.items}</p>)}
          </div>
        </section>

        <section className="svc-cta">
          <h2>Want to be our <em>first pilot hospital?</em></h2>
          <p>Book a call. In a pilot, we would measure your missed calls before and after.</p>
          <div className="ctas"><BookButton short="Talk to us about a pilot" location="product-receptionist-footer" /></div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
