import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, MessageCircle, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { CAL_ATTRS } from '../lib/cal'
import { toolLinks } from './Navbar'
import { servicePages } from '../data/servicePages'
import { trackEvent } from '../utils/analytics'
import '../pages/home3d.css'

// Shared header for the homepage and the AI service pages (styles live under .v3d in home3d.css).

// WhatsApp business number in international format, digits only.
const WHATSAPP_NUMBER = '919393979892'
const WHATSAPP_TEXT = "Hi Vikku Labs, I'd like to talk about automating part of my business."

const serviceLinks = servicePages.map(({ slug, navLabel }) => ({ label: navLabel, path: `/${slug}` }))

export function BookButton({ className = '', short = 'Book a call', location }) {
  return (
    <button type="button" {...CAL_ATTRS} className={`btn btn-primary ${className}`}
      onClick={() => trackEvent('book_call_click', { event_category: 'conversion', location })}>
      <span className="cta-long">Book an AI Discovery Call</span>
      <span className="cta-short">{short}</span>
    </button>
  )
}

export function WhatsAppButton() {
  return (
    <a className="wa" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`} target="_blank" rel="noopener noreferrer"
      aria-label="Chat with Vikku Labs on WhatsApp" onClick={() => trackEvent('whatsapp_click', { event_category: 'conversion' })}>
      <MessageCircle size={20} /><span>Chat on WhatsApp</span>
    </a>
  )
}

function Dropdown({ label, items, open, setOpen, go }) {
  return (
    <div className="tools" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="nav-link" aria-expanded={open} onClick={() => setOpen(!open)}>
        {label} <ChevronDown size={14} />
      </button>
      {open && (
        <div className="tools-menu">
          <div>{items.map(({ label: l, path }) => <button key={path} type="button" className="menu-item" onClick={() => go(path)}>{l}</button>)}</div>
        </div>
      )}
    </div>
  )
}

// Links use "/#…" so they scroll on the homepage and navigate there from any other page.
export default function SiteNav() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(null) // 'services' | 'tools' | null
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(null); setMenuOpen(false) } }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  const go = (path) => { setOpen(null); setMenuOpen(false); navigate(path); scrollTo(0, 0) }
  const toggle = (name) => (v) => setOpen(v ? name : null)
  const auth = user ? (
    <div className="auth">
      <button type="button" className="nav-link" onClick={() => go('/dashboard')}>Dashboard</button>
      <button type="button" className="nav-link" onClick={async () => { await signOut(); setMenuOpen(false) }}>Sign out</button>
    </div>
  ) : (
    <div className="auth">
      <button type="button" className="nav-link" onClick={() => go('/login')}>Sign in</button>
      <button type="button" className="nav-link" onClick={() => go('/signup')}>Sign up</button>
    </div>
  )

  return (
    <>
      <header className="top">
        <div className="top-inner">
          <a className="logo" href="/#top" onClick={() => setMenuOpen(false)}><img className="logo-mark" src="/logo.png" alt="" />Vikku Labs</a>
          <nav className="nav" aria-label="Main">
            <div className="nav-links">
              <a className="nav-link" href="/products">Products</a>
              <Dropdown label="Services" items={serviceLinks} open={open === 'services'} setOpen={toggle('services')} go={go} />
              <a className="nav-link" href="/about">About</a>
              <Dropdown label="Free tools" items={toolLinks} open={open === 'tools'} setOpen={toggle('tools')} go={go} />
            </div>
            {auth}
            <BookButton className="btn-sm" location="nav" />
            <button type="button" className="menu-btn" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </nav>
        </div>
        <div className="progress" id="progress" />
      </header>
      {/* Outside the header: its backdrop-filter would trap a fixed child inside the 64px bar. */}
      {menuOpen && (
        <div className="mobile-menu">
          <a className="menu-item" href="/products" onClick={() => setMenuOpen(false)}>Products</a>
          <a className="menu-item" href="/about" onClick={() => setMenuOpen(false)}>About</a>
          <a className="menu-item" href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <p className="label">Services</p>
          {serviceLinks.map(({ label, path }) => <button key={path} type="button" className="menu-item" onClick={() => go(path)}>{label}</button>)}
          <p className="label">Free tools</p>
          {toolLinks.map(({ label, path }) => <button key={path} type="button" className="menu-item" onClick={() => go(path)}>{label}</button>)}
          {auth}
        </div>
      )}
    </>
  )
}
