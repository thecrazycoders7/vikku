import { Link } from 'react-router-dom'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import DemoRequest from '../components/DemoRequest'
import './home3d.css'

const SITE = 'https://www.vikku.in'
const PATH = '/products/school-management-system'
const IMG = '/products/school-management-system'
const DESCRIPTION = 'A school management system for Indian schools: admissions, students and parents, attendance, timetable, exams, fees, transport, library, hostel, HR and payroll, and reports in one place.'

const AT_A_GLANCE = [
  { label: 'Product', value: 'School management system' },
  { label: 'Built for', value: 'Schools with one or more campuses' },
  { label: 'Modules', value: '22 modules, from admissions to payroll, with an overview dashboard' },
  { label: 'Demo', value: 'Available on request' },
]

const MODULES = [
  { title: 'Admissions', desc: 'A pipeline from inquiry to enrolment, with applications, documents, entrance tests, follow-ups and fee payment.' },
  { title: 'Students and parents', desc: 'Student records, parent contacts, class-wise strength and enrolment over the years.' },
  { title: 'Attendance', desc: 'Class-wise marking, late arrivals, corrections that need approval, leave, and staff attendance from biometrics.' },
  { title: 'Academics and exams', desc: 'Timetable, homework and assignments, exam schedules, hall tickets, marks entry with approval, results and report cards.' },
  { title: 'Fees and finance', desc: 'Fee structures by term, collection with receipts, outstanding dues, discounts and scholarships, refunds and payment methods.' },
  { title: 'Transport', desc: 'Routes, vehicles, drivers and student allocation, a live map of buses, and maintenance and fitness reminders.' },
  { title: 'Campus operations', desc: 'Library, hostel, inventory and assets, health and medical records, and discipline.' },
  { title: 'People and reports', desc: 'HR and payroll, circulars and communication, events and the school calendar, documents, reports and an audit log.' },
]

const SCREENS = [
  { file: 'overview', label: 'Overview', alt: 'School overview dashboard with students, teachers, attendance, fees collected and pending, and pending approvals' },
  { file: 'admissions', label: 'Admissions', alt: 'Admissions pipeline board with inquiry, application submitted, documents pending and under review columns' },
  { file: 'fees', label: 'Fees and finance', alt: 'Fees dashboard with total expected, collected, pending and overdue, monthly collections and fee heads' },
  { file: 'attendance', label: 'Attendance', alt: 'Attendance dashboard with class-wise attendance, late arrivals and the monthly trend' },
  { file: 'exams', label: 'Examinations', alt: 'Examinations list with unit tests, quarterly and half-yearly exams and their marks approval status' },
  { file: 'transport', label: 'Transport', alt: 'Transport live map with bus routes and each bus with its next stop and arrival time' },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'School management system: one place to run the whole school',
  description: DESCRIPTION,
  url: `${SITE}${PATH}`,
  author: { '@type': 'Organization', name: 'Vikku Labs', url: SITE },
  publisher: { '@type': 'Organization', name: 'Vikku Labs', url: SITE, logo: `${SITE}/logo.png` },
}

export default function CaseStudySchool() {
  return (
    <div className="v3d svc">
      <Seo title="School Management System | Vikku Labs" description={DESCRIPTION} canonical={PATH} image={`${SITE}${IMG}/overview.webp`} jsonLd={JSON_LD} />
      <SiteNav />
      <WhatsAppButton />

      <main className="svc-main">
        <header className="svc-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><Link to="/products">Products</Link><span>/</span><span>School management system</span></nav>
          <p className="eyebrow">Product · School operations</p>
          <h1>One system to run the whole <em>school</em></h1>
          <p className="lead">A school management system that brings admissions, attendance, exams, fees, transport, staff and parents into one place, so the office, teachers and management work from the same numbers.</p>
          <div className="ctas">
            <DemoRequest product="school" />
            <BookButton short="Book a free consultation" location="case-school" />
          </div>
        </header>

        <section className="svc-section">
          <ul className="cards">
            {AT_A_GLANCE.map(f => <li key={f.label}><span>{f.label}</span><strong>{f.value}</strong></li>)}
          </ul>
        </section>

        <section className="svc-section">
          <h2>What it <em>covers</em></h2>
          <ul className="cards">
            {MODULES.map(m => <li key={m.title}><strong>{m.title}</strong><span>{m.desc}</span></li>)}
          </ul>
        </section>

        <section className="svc-section" id="screens">
          <h2>Inside the <em>system</em></h2>
          <p className="lead">Screens from the demo, shown with a sample school and sample data.</p>
          <div className="cs-shots">
            {SCREENS.map(s => (
              <figure className="cs-shot" key={s.file}>
                <img src={`${IMG}/${s.file}.webp`} alt={s.alt} width="1200" height="750" loading="lazy" />
                <figcaption>{s.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="svc-cta">
          <h2>See it with <em>your school in mind</em></h2>
          <p>Request the live demo and we'll send you a link, or book a free consultation to walk through how your school runs today.</p>
          <div className="ctas">
            <DemoRequest product="school" />
            <BookButton short="Book a free consultation" location="case-school-footer" />
          </div>
        </section>
      </main>

      <div className="v3d-footer"><Footer /></div>
    </div>
  )
}
