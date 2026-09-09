import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight, ChevronLeft, UserCircle, Menu, X as CloseIcon, Sun, Moon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import NotificationBell from './pm/NotificationBell'
import ThemeToggle from './ThemeToggle'

/**
 * Shared app header for all authenticated pages.
 *
 * Props:
 *   breadcrumbs: [{ label, href? }]  - shown after the logo
 *   actions: ReactNode                - optional right-side buttons (e.g. AI + Share)
 *   badge: ReactNode                  - optional badge next to user email (e.g. plan pill)
 */
export default function AppHeader({ breadcrumbs = [], actions, badge }) {
  const { user, displayName, signOut } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Left: back arrow (mobile) + logo + breadcrumbs */}
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Mobile back button - navigates to the last breadcrumb that has an href */}
          {(() => {
            const backCrumb = [...breadcrumbs].reverse().find((c) => c.href)
            return backCrumb ? (
              <button
                onClick={() => navigate(backCrumb.href)}
                className="sm:hidden flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                aria-label="Back"
              >
                <ChevronLeft size={16} />
              </button>
            ) : null
          })()}
          <button
            onClick={() => navigate('/')}
            className="flex items-center overflow-hidden flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            style={{ width: '64px', height: '25px' }}
            aria-label="Vikku home"
          >
            <img src="/logo.png" alt="Vikku" className="w-full h-full object-cover object-center" />
          </button>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <div key={i} className={`flex items-center gap-1.5 min-w-0 ${!isLast ? 'hidden sm:flex' : ''}`}>
                <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
                {crumb.href && !isLast ? (
                  <button
                    onClick={() => navigate(crumb.href)}
                    className="text-sm text-white/50 hover:text-white transition-colors truncate"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-white truncate">{crumb.label}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {actions}

          {badge}

          <NotificationBell />

          {/* Desktop: theme, account, sign out inline */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => navigate('/account')}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
              title={user?.email}
            >
              <UserCircle size={15} />
              <span className="truncate max-w-[120px]">{displayName || user?.email?.split('@')[0]}</span>
            </button>

            <button
              onClick={async () => { await signOut(); navigate('/') }}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>

          {/* Mobile: hamburger opens a vertical menu with the same items */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-8 h-8 text-white/60 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <CloseIcon size={18} /> : <Menu size={18} />}
            </button>
            {mobileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[170px]">
                  <button
                    onClick={() => { toggleTheme(); setMobileMenuOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                  <button
                    onClick={() => { navigate('/account'); setMobileMenuOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <UserCircle size={13} />
                    <span className="truncate">{displayName || user?.email?.split('@')[0]}</span>
                  </button>
                  <button
                    onClick={async () => { setMobileMenuOpen(false); await signOut(); navigate('/') }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
