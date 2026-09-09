import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle, AlertCircle, X, ThumbsUp, ThumbsDown, Clock, Megaphone, CheckCheck, User } from 'lucide-react'
import { getProjects, getTasks, getMilestones } from '../../lib/pmService'
import { fetchPmNotifications, markPmNotificationRead, markAllPmNotificationsRead } from '../../lib/notificationService'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

function iconForType(type) {
  if (type === 'approved' || type === 'client_approved') return <ThumbsUp size={13} className="text-green-400 flex-shrink-0 mt-0.5" />
  if (type === 'revision' || type === 'client_rejected') return <ThumbsDown size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
  if (type === 'due_today') return <Clock size={13} className="text-yellow-400 flex-shrink-0 mt-0.5" />
  if (type === 'announcement') return <Megaphone size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
  if (type === 'task_assigned') return <User size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
  if (type === 'overdue') return <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
  return <AlertCircle size={13} className="text-yellow-400 flex-shrink-0 mt-0.5" />
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  // Initial load: polling-based (overdue tasks, milestones) + pm_notifications table
  useEffect(() => {
    if (!user) return
    let alive = true

    async function load() {
      const [pmNotes, projects] = await Promise.all([
        fetchPmNotifications(user.id),
        getProjects(user.id),
      ])

      const polledNotes = []
      await Promise.all(projects.slice(0, 10).map(async (p) => {
        const [tasks, milestones] = await Promise.all([getTasks(p.id), getMilestones(p.id)])
        const todayStr = new Date().toISOString().slice(0, 10)

        tasks.filter(t => t.due_date && t.due_date < todayStr && t.status !== 'done')
          .forEach(t => polledNotes.push({ id: `task-${t.id}`, type: 'overdue', message: `"${t.title}" is overdue`, sub: p.name }))

        tasks.filter(t => t.due_date === todayStr && t.status !== 'done')
          .forEach(t => polledNotes.push({ id: `due-today-${t.id}`, type: 'due_today', message: `"${t.title}" is due today`, sub: p.name }))

        milestones
          .filter(m => !m.completed && new Date(m.due_date) > new Date() && (new Date(m.due_date) - Date.now()) < 3 * 86400 * 1000)
          .forEach(m => polledNotes.push({ id: `ms-${m.id}`, type: 'milestone', message: `Milestone "${m.title}" due soon`, sub: p.name }))

        milestones
          .filter(m => m.approval_status === 'approved' || m.approval_status === 'rejected')
          .forEach(m => polledNotes.push({
            id: `ms-approval-${m.id}`,
            type: m.approval_status === 'approved' ? 'approved' : 'revision',
            message: m.approval_status === 'approved' ? `Client approved "${m.title}"` : `Client requested revision on "${m.title}"`,
            sub: p.name,
          }))
      }))

      // Announcements
      try {
        const { data: subData } = await supabase.from('user_subscriptions').select('plan').eq('user_id', user.id).maybeSingle()
        const userPlan = subData?.plan || 'free'
        const { data: announcements } = await supabase.from('admin_announcements').select('id, title, body, target').eq('active', true)
        const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]')
        ;(announcements || [])
          .filter(a => !readIds.includes(a.id) && (a.target === 'all' || a.target === userPlan))
          .forEach(a => polledNotes.push({ id: `ann-${a.id}`, annId: a.id, type: 'announcement', message: a.title, sub: a.body }))
      } catch { /* best-effort */ }

      // Merge pm_notifications (realtime ones) with polled ones, deduplicating by id
      const realtimeNotes = (pmNotes || []).map(n => ({
        id: n.id,
        dbId: n.id,
        type: n.type,
        message: n.message,
        sub: n.sub_text || '',
        fromDb: true,
      }))

      if (alive) setNotifications([...realtimeNotes, ...polledNotes])
    }

    load()
    return () => { alive = false }
  }, [user])

  // Realtime subscription on pm_notifications for this user
  useEffect(() => {
    if (!user || !supabase) return
    let channel
    try {
      channel = supabase
        .channel(`pm_notifications_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'pm_notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          const n = payload.new
          setNotifications(prev => {
            if (prev.some(x => x.id === n.id)) return prev
            return [{
              id: n.id,
              dbId: n.id,
              type: n.type,
              message: n.message,
              sub: n.sub_text || '',
              fromDb: true,
            }, ...prev]
          })
        })
        .subscribe()
    } catch {
      // WebSocket unavailable (e.g. iOS Safari security restriction) — live updates disabled
    }
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [user])

  // Close on outside click
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const dismiss = async (n) => {
    if (n.fromDb && n.dbId) {
      await markPmNotificationRead(n.dbId)
    } else if (n.type === 'announcement' && n.annId) {
      const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]')
      if (!readIds.includes(n.annId)) localStorage.setItem('readAnnouncements', JSON.stringify([...readIds, n.annId]))
    }
    setNotifications(prev => prev.filter(x => x.id !== n.id))
  }

  const dismissAll = async () => {
    if (user) await markAllPmNotificationsRead(user.id)
    setNotifications([])
  }

  const count = notifications.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
      >
        <Bell size={15} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed top-[60px] inset-x-4 sm:absolute sm:inset-x-auto sm:right-0 sm:top-10 sm:w-72 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <p className="text-xs font-semibold text-white">Notifications</p>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button onClick={dismissAll} className="text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                  <CheckCheck size={11} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <CheckCircle size={20} className="text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">All caught up</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                >
                  {iconForType(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 leading-snug">{n.message}</p>
                    {n.sub && <p className="text-[10px] text-white/30 mt-0.5 line-clamp-2">{n.sub}</p>}
                  </div>
                  <button
                    onClick={() => dismiss(n)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-white/60 mt-0.5"
                    title="Dismiss"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
