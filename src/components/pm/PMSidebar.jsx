import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LayoutGrid, Plus, Gift } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProjects, getSharedProjects } from '../../lib/pmService'
import { Sidebar } from '../SideNav'

// Left bar for Vikku PM (dashboard and project pages): your projects to jump between, plus any
// page-specific groups (a project's views and actions). Pass `projects` when the page already has
// them, otherwise they're loaded here. Sits under AppHeader, which is 64px (h-16) tall.
export default function PMSidebar({ projects: given, currentId, sections = [] }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [loaded, setLoaded] = useState([])

  useEffect(() => {
    if (given || !user) return
    Promise.all([getProjects(user.id), getSharedProjects(user.id).catch(() => [])])
      .then(([own, shared]) => setLoaded([...own, ...shared]))
      .catch(() => setLoaded([]))
  }, [given, user])

  const projects = (given || loaded).filter(p => p.status !== 'archived')
  const nav = [
    { items: [{ key: 'home', label: 'My projects', icon: LayoutGrid, to: '/pm/dashboard', active: pathname === '/pm/dashboard' }] },
    { title: 'Projects', items: [
      ...projects.map(p => ({ key: p.id, label: p.name, dot: p.color || '#94A3B8', to: `/pm/projects/${p.slug || p.id}`, active: p.id === currentId })),
      // The dashboard opens New project itself so the free-plan limit still applies.
      { key: 'new', label: 'New project', icon: Plus, to: '/pm/dashboard?new=1' },
    ] },
    ...sections,
    { title: 'Account', items: [{ key: 'refer', label: 'Refer & earn', icon: Gift, to: '/pm/refer', active: pathname === '/pm/refer' }] },
  ]
  return <Sidebar sections={nav} storageKey="vikku_pm_sidebar" stick="top-16 h-[calc(100vh-4rem)]" />
}
