import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import useLockBodyScroll from '../hooks/useLockBodyScroll'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { label: 'Services', href: '#services' },
  {
    label: 'Work', href: '#solution', footerLabel: 'View all work',
    dropdown: [
      { label: 'Staffing & HR Platform',    path: '/work/staffing-platform' },
      { label: 'HSO CCTV - Online Store',    path: '/work/hso-cctv' },
      { label: 'Rolex Ads - 4x Leads',       path: '/work/rolex-ads' },
      { label: 'Media Manager - 6 Clients',  path: '/work/media-manager' },
    ],
  },
  { label: 'Process',  href: '#process' },
  { label: 'About',    href: '#about' },
  {
    label: 'Tools', href: '#tools', footerLabel: 'Explore all free tools', dropdownOnly: true,
    dropdown: [
      { label: 'Free PM Tool',           path: '/pm' },
      { label: 'AI Visibility Score',    path: '/tools/ai-visibility-score' },
      { label: 'Cost Estimator',         path: '/tools/cost-estimator' },
      { label: 'ROI Calculator',         path: '/tools/roi-calculator' },
      { label: 'Timeline Calculator',    path: '/tools/timeline-calculator' },
      { label: 'Tech Stack Recommender', path: '/tools/tech-recommender' },
      { label: 'Maintenance Calculator', path: '/tools/maintenance-calculator' },
    ],
  },
  { label: 'Contact',  href: '#contact' },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  useLockBodyScroll(menuOpen)
  const [activeId,       setActiveId]       = useState('')
  const [openDropdown,   setOpenDropdown]   = useState(null)
  const [mobileExpanded, setMobileExpanded] = useState(null)
  const dropRef = useRef(null)
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = navLinks.map(({ href }) => href.slice(1))
    const observers = ids.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id) },
        { rootMargin: '-40% 0px -55% 0px' }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [])

  const handleNav = (href) => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 300)
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogo = () => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass border-b border-white/[0.05] py-1.5'
          : 'bg-transparent py-2'
      }`}
      // 30% more blur than the shared .glass (20px → 26px), navbar only
      style={scrolled ? { backdropFilter: 'blur(26px)', WebkitBackdropFilter: 'blur(26px)' } : undefined}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button onClick={handleLogo} className="flex items-center overflow-hidden" style={{ width: '96px', height: '38px' }}>
          <img src="/logo.png" alt="Vikku" className="w-full h-full object-cover object-center" />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href, dropdown, footerLabel, dropdownOnly }) => {
            const isActive = activeId === href.slice(1)
            if (dropdown) {
              const isOpen = openDropdown === label
              return (
                <div
                  key={label}
                  ref={dropRef}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() => dropdownOnly ? setOpenDropdown(isOpen ? null : label) : handleNav(href)}
                    className={`flex items-center gap-1 text-xs transition-colors duration-200 tracking-wide relative ${
                      isActive ? 'text-white' : 'text-white hover:text-white/90'
                    }`}
                  >
                    {label}
                    <ChevronDown
                      size={10}
                      className="opacity-50 transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                    {isActive && <span className="absolute -bottom-1 left-0 right-0 h-px bg-white/40 rounded-full" />}
                  </button>
                  {/* Dropdown panel */}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-56 z-50"
                    style={{
                      opacity:       isOpen ? 1 : 0,
                      pointerEvents: isOpen ? 'auto' : 'none',
                      transform:     `translateX(-50%) translateY(${isOpen ? '0px' : '6px'})`,
                      transition:    'opacity 0.2s ease, transform 0.2s ease',
                    }}
                  >
                    <div className="glass rounded-xl p-1.5">
                      {dropdown.map(({ label: dl, path }) => (
                        <button
                          key={dl}
                          onClick={() => { navigate(path); setOpenDropdown(null) }}
                          className="w-full text-left px-3 py-2.5 text-[10px] text-white hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                        >
                          {dl}
                        </button>
                      ))}
                      <div className="border-t border-white/[0.06] mt-1 pt-1">
                        <button
                          onClick={() => { handleNav(href); setOpenDropdown(null) }}
                          className="w-full text-left px-3 py-2 text-[10px] text-white hover:text-white/60 hover:bg-white/[0.03] rounded-lg transition-all"
                        >
                          {footerLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
            return (
              <button
                key={label}
                onClick={() => handleNav(href)}
                className={`text-xs transition-colors duration-200 tracking-wide relative ${
                  isActive ? 'text-white' : 'text-white hover:text-white/90'
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-white/40 rounded-full" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={async () => {
                  await signOut()
                  navigate('/')
                }}
                className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="text-xs bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-colors font-medium"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 -mr-2 text-white active:opacity-60 transition-opacity"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

    </header>

      {/* Mobile menu - full screen overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col pt-16">
          <div className="overflow-y-auto flex-1 px-4 py-4">
            <div className="glass rounded-2xl overflow-hidden mb-4">
              {navLinks.map(({ label, href, dropdown }) => {
                const isExpanded = mobileExpanded === label
                return (
                <div key={label} className="border-b border-white/[0.05] last:border-0">
                  <button
                    onClick={() => dropdown ? setMobileExpanded(isExpanded ? null : label) : handleNav(href)}
                    className="w-full flex items-center justify-between px-5 py-4 text-sm text-white font-medium active:bg-white/[0.05] transition-colors"
                  >
                    {label}
                    {dropdown && (
                      <ChevronDown
                        size={14}
                        className="text-white/40 transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    )}
                  </button>
                  {dropdown && isExpanded && (
                    <div className="bg-white/[0.02] border-t border-white/[0.04]">
                      {dropdown.map(({ label: dl, path }) => (
                        <button
                          key={dl}
                          onClick={() => { navigate(path); setMenuOpen(false) }}
                          className="w-full text-left px-5 py-3.5 text-xs text-white/60 active:bg-white/[0.06] active:text-white transition-colors border-b border-white/[0.03] last:border-0 flex items-center gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-white/30 flex-shrink-0" />
                          {dl}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                )
              })}
            </div>

            <div className="mb-2.5">
              <ThemeToggle className="glass !w-9 !h-9" />
            </div>

            <div className="space-y-2.5">
              {user ? (
                <>
                  <button
                    onClick={() => { navigate('/dashboard'); setMenuOpen(false) }}
                    className="glass w-full py-3.5 rounded-xl text-sm text-white font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={async () => { await signOut(); navigate('/'); setMenuOpen(false) }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm text-white/50 border border-white/[0.08]"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/login'); setMenuOpen(false) }}
                    className="glass w-full py-3.5 rounded-xl text-sm text-white font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { navigate('/signup'); setMenuOpen(false) }}
                    className="bg-white text-black w-full py-3.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
