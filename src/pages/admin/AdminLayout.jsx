import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, BarChart2, Megaphone, Settings, Mail, Activity, Search, X, Target, Briefcase,
  PieChart, FolderKanban, Wallet, CalendarDays, FileText, CalendarClock, Menu as MenuIcon,
  LogOut, Globe, LayoutGrid, BellRing, ChevronDown,
} from 'lucide-react'
import NotificationBell from '../../components/pm/NotificationBell'
import { useAuth } from '../../contexts/AuthContext'
import { getAdminUsers } from '../../lib/adminService'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import { Menu, MenuItem } from './ui'
import { SideNav, Sidebar } from '../../components/SideNav'

// Sidebar groups. Every entry is an existing route; "Follow-ups" is the Leads board filtered to due follow-ups.
const sections = [
  { title: 'Workspace', items: [
    { label: 'Overview',     path: '/admin',              icon: LayoutDashboard },
    { label: 'CRM overview', path: '/admin/crm',          icon: PieChart },
    { label: 'Leads',        path: '/admin/crm/leads',    icon: Target },
    { label: 'Clients',      path: '/admin/crm/clients',  icon: Briefcase },
    { label: 'Projects',     path: '/admin/crm/projects', icon: FolderKanban },
  ] },
  { title: 'Operations', items: [
    { label: 'Meetings',   path: '/admin/crm/meetings',              icon: CalendarDays },
    { label: 'Follow-ups', path: '/admin/crm/leads?view=followups',  icon: CalendarClock },
    { label: 'Payments',   path: '/admin/crm/payments',              icon: Wallet },
    { label: 'Quotes',     path: '/admin/crm/quotes',                icon: FileText },
  ] },
  { title: 'Insights', items: [
    { label: 'Analytics',       path: '/admin/analytics', icon: BarChart2 },
    { label: 'Tool statistics', path: '/admin/overview',  icon: LayoutGrid },
    { label: 'Activity log',    path: '/admin/activity',  icon: Activity },
  ] },
  { title: 'Administration', items: [
    { label: 'Users',         path: '/admin/users',         icon: Users },
    { label: 'Billing',       path: '/admin/billing',       icon: CreditCard },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Email',         path: '/admin/email',         icon: Mail },
    { label: 'Settings',      path: '/admin/profile',       icon: Settings },
  ] },
]

function GlobalSearch({ onClose }) {
  useLockBodyScroll()
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [allUsers, setAllUsers] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSearch = async (q) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    const match = (users) => users.filter(u => u.email?.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    if (!allUsers) {
      setLoading(true)
      try {
        const d = await getAdminUsers()
        setAllUsers(d.users || [])
        setResults(match(d.users || []))
      } catch { setResults([]) }
      finally { setLoading(false) }
    } else {
      setResults(match(allUsers))
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/30" onClick={onClose}>
      <div role="dialog" aria-label="Search users" className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 h-12 border-b border-slate-100">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search users by email…"
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {loading && <div className="w-3.5 h-3.5 border border-slate-200 border-t-slate-500 rounded-full animate-spin flex-shrink-0" />}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close search"><X size={15} /></button>
        </div>

        {results.length > 0 && (
          <div className="max-h-72 overflow-y-auto py-1">
            {results.map(u => (
              <button
                key={u.id}
                onClick={() => { navigate('/admin/users'); onClose() }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-900 truncate">{u.email}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{u.projectCount} projects · joined {new Date(u.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                </div>
                <span className="text-[11px] font-medium text-slate-500 capitalize">{u.plan}</span>
              </button>
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="px-4 py-6 text-center text-[13px] text-slate-500">No users found for "{query}"</div>
        )}
        {!query && <div className="px-4 py-5 text-center text-[13px] text-slate-400">Type to search across all users</div>}
      </div>
    </div>
  )
}

// Marks the current page. Overview and CRM overview are exact matches; other pages keep their item
// lit on sub-pages (a client's detail page). The Follow-ups entry is the Leads route plus its filter.
function useNavSections() {
  const { pathname, search } = useLocation()
  const isActive = (path) => {
    const [p, q] = path.split('?')
    if (q) return pathname === p && search === `?${q}`
    if (p === '/admin/crm/leads' && search.includes('view=followups')) return false
    return pathname === p || (!['/admin', '/admin/crm'].includes(p) && pathname.startsWith(p + '/'))
  }
  return sections.map(({ title, items }) => ({
    title, items: items.map(({ label, path, icon }) => ({ label, icon, to: path, active: isActive(path) })),
  }))
}

export default function AdminLayout({ children, title }) {
  const { user, displayName, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const navSections = useNavSections()

  useEffect(() => {
    setDrawer(false)
    // Keep the current page visible in a sidebar that scrolls (e.g. Users near the bottom).
    document.querySelector('aside [aria-current=page]')?.scrollIntoView({ block: 'nearest' })
  }, [pathname])
  useEffect(() => {
    const onKey = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const name = displayName || user?.email?.split('@')[0] || 'Admin'
  const initials = name.split(/[\s.]+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')

  return (
    <div className="adm min-h-screen">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-slate-200 bg-white">
        <div className="flex h-full items-center gap-3 px-3 sm:px-5">
          <button type="button" onClick={() => setDrawer(true)} className="md:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Open navigation">
            <MenuIcon size={18} />
          </button>
          <Link to="/admin" className="flex items-center gap-2 rounded-md">
            <img src="/logo-sm.png" alt="" width="28" height="28" className="h-7 w-7 object-contain" />
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">Vikku</span>
          </Link>
          <span aria-hidden="true" className="hidden sm:block h-5 w-px bg-slate-200" />
          <span className="hidden sm:inline text-[13px] font-medium text-slate-500">Admin</span>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto md:ml-6 md:mr-auto flex items-center gap-2 h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-500 hover:border-slate-300 md:w-72"
            aria-label="Search users"
          >
            <Search size={15} className="text-slate-400" />
            <span className="hidden md:inline flex-1 text-left">Search users…</span>
            <kbd className="hidden md:inline text-[11px] font-medium text-slate-400 border border-slate-200 bg-white rounded px-1.5">⌘K</kbd>
          </button>

          <div className="flex items-center gap-1 text-slate-600 [&_button]:rounded-lg">
            <NotificationBell />
            <Link to="/admin/profile" className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100" aria-label="Settings" title="Settings"><Settings size={17} /></Link>
          </div>

          <Menu width="w-64" trigger={({ open, toggle }) => (
            <button type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-[11px] font-semibold text-orange-800">{initials}</span>
              <span className="hidden lg:block max-w-[140px] truncate text-[13px] font-medium text-slate-700">{name}</span>
              <ChevronDown size={14} className="hidden lg:block text-slate-400" />
            </button>
          )}>
            <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
              <p className="text-[13px] font-medium text-slate-900 truncate">{name}</p>
              <p className="text-[12px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <MenuItem icon={Settings} to="/admin/profile">Admin settings</MenuItem>
            <MenuItem icon={BellRing} to="/dashboard/notifications">Email preferences</MenuItem>
            <MenuItem icon={LayoutGrid} to="/dashboard">Your tools dashboard</MenuItem>
            <MenuItem icon={Globe} to="/">View website</MenuItem>
            <div className="my-1 border-t border-slate-100" />
            <MenuItem icon={LogOut} danger onClick={async () => { await signOut(); navigate('/') }}>Sign out</MenuItem>
          </Menu>
        </div>
      </header>

      <div className="flex pt-16">
        <Sidebar sections={navSections} storageKey="vikku_admin_sidebar" stick="top-16 h-[calc(100vh-4rem)]" />

        {/* Mobile drawer */}
        {drawer && (
          <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation">
            <div className="absolute inset-0 bg-slate-900/30" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white px-3 pb-6 shadow-xl">
              <div className="flex h-16 items-center justify-between px-2">
                <span className="text-[15px] font-semibold text-slate-900">Vikku Admin</span>
                <button type="button" onClick={() => setDrawer(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close navigation"><X size={18} /></button>
              </div>
              <SideNav sections={navSections} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-[1360px]">
            {title && <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 mb-5">{title}</h1>}
            {children}
          </div>
        </main>
      </div>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
