import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, BarChart2, Megaphone, User, Mail, Activity, Search, X } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import { getAdminUsers } from '../../lib/adminService'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

const nav = [
  { label: 'Overview',   path: '/admin',                icon: LayoutDashboard },
  { label: 'Users',      path: '/admin/users',           icon: Users },
  { label: 'Billing',    path: '/admin/billing',         icon: CreditCard },
  { label: 'Analytics',  path: '/admin/analytics',       icon: BarChart2 },
  { label: 'Announce',   path: '/admin/announcements',   icon: Megaphone },
  { label: 'Email',      path: '/admin/email',           icon: Mail },
  { label: 'Activity',   path: '/admin/activity',        icon: Activity },
  { label: 'Profile',    path: '/admin/profile',         icon: User },
]

function GlobalSearch({ onClose }) {
  useLockBodyScroll()
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [allUsers, setAllUsers] = useState(null)
  const navigate = useNavigate()

  const handleSearch = async (q) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    if (!allUsers) {
      setLoading(true)
      try {
        const d = await getAdminUsers()
        setAllUsers(d.users || [])
        setResults((d.users || []).filter(u => u.email?.toLowerCase().includes(q.toLowerCase())).slice(0, 8))
      } catch { setResults([]) }
      finally { setLoading(false) }
    } else {
      setResults(allUsers.filter(u => u.email?.toLowerCase().includes(q.toLowerCase())).slice(0, 8))
    }
  }

  const PLAN_COLORS = { pro: 'text-violet-400', team: 'text-blue-400', free: 'text-white/30' }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md glass rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search size={14} className="text-white/40 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search users by email…"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
          />
          {loading && <div className="w-3.5 h-3.5 border border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />}
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>

        {results.length > 0 && (
          <div className="max-h-72 overflow-y-auto">
            {results.map(u => (
              <button
                key={u.id}
                onClick={() => { navigate('/admin/users'); onClose() }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-0 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 font-mono truncate">{u.email}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{u.projectCount} projects · joined {new Date(u.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`text-[10px] font-medium flex-shrink-0 ${PLAN_COLORS[u.plan] || 'text-white/30'}`}>{u.plan}</span>
              </button>
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-white/30">No users found for "{query}"</div>
        )}

        {!query && (
          <div className="px-4 py-4 text-center text-xs text-white/20">Type to search across all users</div>
        )}
      </div>
    </div>
  )
}

export default function AdminLayout({ children, title }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <AppHeader breadcrumbs={[{ label: 'Admin' }]} />
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 gap-6">
        {/* Sidebar */}
        <aside className="w-44 flex-shrink-0 hidden sm:block">
          <div className="glass rounded-2xl p-2 sticky top-24">
            <p className="text-[9px] text-white/30 uppercase tracking-widest px-3 py-2">Admin</p>

            {/* Global search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all mb-2 text-white/30 hover:text-white hover:bg-white/[0.05] border border-white/[0.06]"
            >
              <Search size={11} />
              <span className="flex-1 text-left">Search users</span>
              <kbd className="text-[9px] bg-white/[0.06] px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>

            {nav.map(({ label, path, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all mb-0.5 ${
                  pathname === path
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile tab row - scrollable */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/[0.06] flex overflow-x-auto">
          {nav.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 py-3 px-3 text-[10px] ${
                pathname === path ? 'text-white' : 'text-white/40'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {title && (
            <h1 className="font-display font-bold text-lg text-white mb-5">{title}</h1>
          )}
          {children}
        </main>
      </div>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
