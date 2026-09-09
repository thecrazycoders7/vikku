import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') || 'sanikommuharshavardhanreddy6@gmail.com')
  .split(',').map(e => e.trim()).filter(Boolean)

// Pre-GST base prices in ₹ (mirrors src/lib/razorpayService.js PLAN_PRICES)
const PLAN_PRICE: Record<string, { monthly: number; annual: number }> = {
  pro:  { monthly: 299, annual: 2999 },
  team: { monthly: 999, annual: 9999 },
}
// Normalized monthly recurring revenue for a subscription (annual ÷ 12)
function monthlyRevenue(plan?: string, cycle?: string): number {
  const p = PLAN_PRICE[plan || '']
  if (!p) return 0
  return cycle === 'annual' ? p.annual / 12 : p.monthly
}
const isPaidStatus = (s?: string) => s === 'active' || s === 'cancelling'

const ALLOWED_ORIGINS = new Set(['https://vikku.in', 'https://www.vikku.in'])

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.vikku.in'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

const json = (req: Request, data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey    = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization') || ''

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user || !ADMIN_EMAILS.includes(user.email!)) {
      return json(req, { error: 'Unauthorized' }, 403)
    }

    const admin = createClient(supabaseUrl, serviceKey)
    const url   = new URL(req.url)
    const type  = url.searchParams.get('type') || 'overview'

    // ── POST ──────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const body = await req.json()

      if (body.action === 'change_plan') {
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)
        const { error } = await admin.from('user_subscriptions').upsert({
          user_id: body.userId,
          plan: body.plan,
          status: body.plan === 'free' ? 'cancelled' : 'active',
          current_period_end: body.plan === 'free' ? null : periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        if (error) throw error
        return json(req, { ok: true })
      }

      if (body.action === 'create_announcement') {
        const { error } = await admin.from('admin_announcements').insert({
          title: body.title,
          body: body.body,
          target: body.target || 'all',
          expires_at: body.expires_at || null,
        })
        if (error) throw error
        return json(req, { ok: true })
      }

      if (body.action === 'toggle_announcement') {
        const { error } = await admin.from('admin_announcements').update({ active: body.active }).eq('id', body.id)
        if (error) throw error
        return json(req, { ok: true })
      }

      if (body.action === 'delete_announcement') {
        const { error } = await admin.from('admin_announcements').delete().eq('id', body.id)
        if (error) throw error
        return json(req, { ok: true })
      }

      if (body.action === 'delete_user') {
        const { error } = await admin.auth.admin.deleteUser(body.userId)
        if (error) throw error
        return json(req, { ok: true })
      }

      if (body.action === 'send_email') {
        const resendKey = Deno.env.get('RESEND_API_KEY')
        if (!resendKey) throw new Error('RESEND_API_KEY not configured')

        // Fetch target users
        const usersRes = await admin.auth.admin.listUsers({ perPage: 1000 })
        const allUsers = usersRes.data?.users || []

        let targets: string[] = []
        if (body.audience === 'all') {
          targets = allUsers.map(u => u.email).filter(Boolean) as string[]
        } else {
          const subsRes = await admin.from('user_subscriptions').select('user_id, plan, status')
          const subs = subsRes.data || []
          const emailMap: Record<string, string> = {}
          allUsers.forEach(u => { if (u.email) emailMap[u.id] = u.email })
          if (body.audience === 'pro') {
            targets = subs.filter(s => (s.plan === 'pro' || s.plan === 'team') && s.status === 'active')
              .map(s => emailMap[s.user_id]).filter(Boolean) as string[]
          } else {
            const paidIds = new Set(subs.filter(s => s.status === 'active').map(s => s.user_id))
            targets = allUsers.filter(u => !paidIds.has(u.id)).map(u => u.email).filter(Boolean) as string[]
          }
        }

        // Send via Resend (batch in groups of 50)
        let sent = 0
        for (let i = 0; i < targets.length; i += 50) {
          const batch = targets.slice(i, i + 50)
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Vikku <hello@vikku.in>',
              to: batch,
              subject: body.subject,
              html: body.body.includes('<') ? body.body : `<p>${body.body.replace(/\n/g, '<br>')}</p>`,
            }),
          })
          sent += batch.length
        }
        return json(req, { ok: true, count: sent })
      }

      return json(req, { error: 'Unknown action' }, 400)
    }

    // Helper: fetch all auth users with pagination
    async function listAllUsers() {
      let all: any[] = []
      let pg = 1
      while (true) {
        const r = await admin.auth.admin.listUsers({ perPage: 1000, page: pg })
        const batch = r.data?.users || []
        all = all.concat(batch)
        if (batch.length < 1000) break
        pg++
      }
      return all
    }

    // ── GET: overview ─────────────────────────────────────────────────
    if (type === 'overview') {
      const [users, subsRes, projectsRes, subscribersRes] = await Promise.all([
        listAllUsers(),
        admin.from('user_subscriptions').select('plan, status, updated_at, billing_cycle'),
        admin.from('pm_projects').select('status, created_at'),
        admin.from('subscribers').select('source, created_at', { count: 'exact', head: false }),
      ])

      const subs        = subsRes.data || []
      const projects    = projectsRes.data || []
      const subscribers = subscribersRes.data || []

      const subscribersBySource: Record<string, number> = {}
      subscribers.forEach((s: { source?: string }) => {
        const src = s.source || 'other'
        subscribersBySource[src] = (subscribersBySource[src] || 0) + 1
      })

      const proSubs  = subs.filter(s => s.plan === 'pro'  && isPaidStatus(s.status))
      const teamSubs = subs.filter(s => s.plan === 'team' && isPaidStatus(s.status))
      const mrr      = Math.round([...proSubs, ...teamSubs].reduce((sum, s) => sum + monthlyRevenue(s.plan, s.billing_cycle), 0))

      const now = Date.now()
      const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString()
      const activeUsers = users.filter(u => u.last_sign_in_at && u.last_sign_in_at >= sevenDaysAgo).length

      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const churnedThisMonth = subs.filter(s => s.status === 'cancelled' && s.updated_at >= monthStart).length

      const signupsByDay: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now - i * 86400000).toISOString().split('T')[0]
        signupsByDay[d] = 0
      }
      users.forEach(u => {
        const d = u.created_at?.split('T')[0]
        if (d && signupsByDay[d] !== undefined) signupsByDay[d]++
      })

      const projectStatus: Record<string, number> = { active: 0, completed: 0, 'on-hold': 0, archived: 0 }
      projects.forEach(p => { if (p.status in projectStatus) projectStatus[p.status]++ })

      return json(req, {
        totalUsers: users.length,
        proUsers: proSubs.length,
        teamUsers: teamSubs.length,
        freeUsers: users.length - proSubs.length - teamSubs.length,
        mrr,
        activeUsers,
        churnedThisMonth,
        totalProjects: projects.length,
        signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
        projectStatus,
        totalSubscribers: subscribers.length,
        subscribersBySource,
      })
    }

    // ── GET: users ────────────────────────────────────────────────────
    if (type === 'users') {
      const [allUsers, subsRes, projectsRes] = await Promise.all([
        listAllUsers(),
        admin.from('user_subscriptions').select('*'),
        admin.from('pm_projects').select('user_id'),
      ])
      const subs     = subsRes.data || []
      const projects = projectsRes.data || []

      const subMap: Record<string, any> = {}
      subs.forEach(s => { subMap[s.user_id] = s })

      const projectCounts: Record<string, number> = {}
      projects.forEach(p => { projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1 })

      const result = allUsers
        .map(u => {
          const sub = subMap[u.id]
          // Effective plan: only active/cancelling paid subs grant paid access
          const effectivePlan = (sub && (sub.status === 'active' || sub.status === 'cancelling') && sub.plan !== 'free')
            ? sub.plan : 'free'
          return {
            id:           u.id,
            email:        u.email,
            joinedAt:     u.created_at,
            lastSignIn:   u.last_sign_in_at,
            projectCount: projectCounts[u.id] || 0,
            plan:         effectivePlan,
            planStatus:   sub?.status || null,
            periodEnd:    sub?.current_period_end || null,
            paymentId:    sub?.razorpay_payment_id || null,
          }
        })
        .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())

      return json(req, { users: result })
    }

    // ── GET: billing ──────────────────────────────────────────────────
    if (type === 'billing') {
      const [users, subsRes] = await Promise.all([
        listAllUsers(),
        admin.from('user_subscriptions').select('*').order('updated_at', { ascending: false }),
      ])
      const subs = subsRes.data || []

      const emailMap: Record<string, string> = {}
      users.forEach(u => { if (u.email) emailMap[u.id] = u.email })

      const result = subs.map(s => ({ ...s, email: emailMap[s.user_id] || 'Unknown' }))
      return json(req, { subscriptions: result })
    }

    // ── GET: analytics ────────────────────────────────────────────────
    if (type === 'analytics') {
      const [users, subsRes, projectsRes] = await Promise.all([
        listAllUsers(),
        admin.from('user_subscriptions').select('plan, status, updated_at, user_id, billing_cycle'),
        admin.from('pm_projects').select('user_id, created_at'),
      ])
      const subs     = subsRes.data || []
      const projects = projectsRes.data || []

      const now          = Date.now()
      const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString()
      const monthStart   = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      const proSubs  = subs.filter(s => s.plan === 'pro'  && isPaidStatus(s.status))
      const teamSubs = subs.filter(s => s.plan === 'team' && isPaidStatus(s.status))
      const mrr      = Math.round([...proSubs, ...teamSubs].reduce((sum, s) => sum + monthlyRevenue(s.plan, s.billing_cycle), 0))
      const arr      = mrr * 12

      const activeUsers      = users.filter(u => u.last_sign_in_at && u.last_sign_in_at >= sevenDaysAgo).length
      const paidUsers        = proSubs.length + teamSubs.length
      const freeUsers        = users.length - paidUsers
      const churnedThisMonth = subs.filter(s => s.status === 'cancelled' && s.updated_at >= monthStart).length
      const conversionPct    = users.length > 0 ? Math.round((paidUsers / users.length) * 100) : 0

      const signupsByDay: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now - i * 86400000).toISOString().split('T')[0]
        signupsByDay[d] = 0
      }
      users.forEach(u => {
        const d = u.created_at?.split('T')[0]
        if (d && signupsByDay[d] !== undefined) signupsByDay[d]++
      })

      const projectCounts: Record<string, number> = {}
      projects.forEach(p => { projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1 })

      const emailMap: Record<string, string> = {}
      users.forEach(u => { if (u.email) emailMap[u.id] = u.email })

      const topUsers = Object.entries(projectCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId, count]) => ({ email: emailMap[userId] || userId, projectCount: count }))

      return json(req, {
        arr, mrr, activeUsers, paidUsers, freeUsers,
        totalUsers: users.length,
        churnedThisMonth, conversionPct,
        signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
        topUsers,
      })
    }

    // ── GET: announcements ────────────────────────────────────────────
    if (type === 'announcements') {
      const { data, error } = await admin.from('admin_announcements')
        .select('*').order('created_at', { ascending: false })
      if (error) throw error
      return json(req, { announcements: data || [] })
    }

    // ── GET: mrr_history ─────────────────────────────────────────────
    if (type === 'mrr_history') {
      const { data: subs } = await admin.from('user_subscriptions')
        .select('plan, status, updated_at, billing_cycle')
      const allSubs = subs || []

      // Build last 6 months of MRR snapshots. The table has no created_at, so we
      // use updated_at as the best proxy for when a sub became active/changed.
      const months: { label: string; mrr: number; users: number }[] = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59).toISOString()
        const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
        const activeInMonth = allSubs.filter(s =>
          (s.plan === 'pro' || s.plan === 'team') && s.updated_at <= end &&
          (s.status === 'active' || s.status === 'cancelling' || (s.status === 'cancelled' && s.updated_at > end))
        )
        const mrr = Math.round(activeInMonth.reduce((sum, s) => sum + monthlyRevenue(s.plan, s.billing_cycle), 0))
        months.push({ label, mrr, users: activeInMonth.length })
      }
      return json(req, { months })
    }

    // ── GET: user_growth ─────────────────────────────────────────────
    if (type === 'user_growth') {
      const users = await listAllUsers()

      const months: { label: string; total: number; new: number }[] = []
      const now = new Date()
      let cumulative = 0
      for (let i = 5; i >= 0; i--) {
        const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59).toISOString()
        const start = d.toISOString()
        const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
        const newThisMonth = users.filter(u => u.created_at >= start && u.created_at <= end).length
        cumulative += newThisMonth
        months.push({ label, total: cumulative, new: newThisMonth })
      }
      // Fix cumulative: count all users created before each month end
      const fixed = []
      for (let i = 5; i >= 0; i--) {
        const d   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59).toISOString()
        const s   = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString()
        const label = new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
        fixed.push({
          label,
          total: users.filter(u => u.created_at <= d).length,
          new:   users.filter(u => u.created_at >= s && u.created_at <= d).length,
        })
      }
      return json(req, { months: fixed })
    }

    // ── GET: activity ─────────────────────────────────────────────────
    if (type === 'activity') {
      const [users, subsRes, projectsRes] = await Promise.all([
        listAllUsers(),
        admin.from('user_subscriptions').select('user_id, plan, status, updated_at').order('updated_at', { ascending: false }).limit(30),
        admin.from('pm_projects').select('user_id, name, created_at').order('created_at', { ascending: false }).limit(30),
      ])
      const subs     = subsRes.data  || []
      const projects = projectsRes.data || []

      const emailMap: Record<string, string> = {}
      users.forEach(u => { if (u.email) emailMap[u.id] = u.email })

      const events: { type: string; email: string; detail: string; timestamp: string }[] = []

      // Signups (last 30 days)
      const cutoff = new Date(Date.now() - 30 * 86400000).toISOString()
      users
        .filter(u => u.created_at >= cutoff)
        .forEach(u => events.push({ type: 'signup', email: u.email || '', detail: '', timestamp: u.created_at }))

      // Upgrades
      subs
        .filter(s => s.status === 'active' && (s.plan === 'pro' || s.plan === 'team'))
        .forEach(s => events.push({ type: 'upgrade', email: emailMap[s.user_id] || '', detail: s.plan, timestamp: s.updated_at }))

      // Projects created
      projects.forEach(p => events.push({ type: 'project', email: emailMap[p.user_id] || '', detail: p.name, timestamp: p.created_at }))

      // Recent sign-ins (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      users
        .filter(u => u.last_sign_in_at && u.last_sign_in_at >= sevenDaysAgo)
        .slice(0, 20)
        .forEach(u => events.push({ type: 'signin', email: u.email || '', detail: '', timestamp: u.last_sign_in_at! }))

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      return json(req, { events: events.slice(0, 50) })
    }

    // ── POST: send_email ──────────────────────────────────────────────
    // (handled in POST block above)

    // ── GET: expiring ─────────────────────────────────────────────────
    if (type === 'expiring') {
      const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString()
      const [subsRes, users] = await Promise.all([
        admin.from('user_subscriptions')
          .select('*')
          .in('status', ['active', 'cancelling'])
          .lte('current_period_end', sevenDaysFromNow)
          .gte('current_period_end', new Date().toISOString()),
        listAllUsers(),
      ])
      const subs = subsRes.data || []
      const emailMap: Record<string, string> = {}
      users.forEach(u => { if (u.email) emailMap[u.id] = u.email })
      return json(req, { expiring: subs.map(s => ({ ...s, email: emailMap[s.user_id] || 'Unknown' })) })
    }

    // ── GET: user_detail ──────────────────────────────────────────────
    if (type === 'user_detail') {
      const userId = url.searchParams.get('userId')
      if (!userId) return json(req, { error: 'userId required' }, 400)

      const [userRes, subRes, projectsRes] = await Promise.all([
        admin.auth.admin.getUserById(userId),
        admin.from('user_subscriptions').select('*').eq('user_id', userId).maybeSingle(),
        admin.from('pm_projects').select('id, name, status, created_at').eq('user_id', userId),
      ])

      return json(req, {
        user:         userRes.data?.user,
        subscription: subRes.data,
        projects:     projectsRes.data || [],
      })
    }

    return json(req, { error: 'Unknown type' }, 400)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return json(req, { error: msg }, 500)
  }
})
