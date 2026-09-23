import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': origin === 'https://vikku.in' ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

function escHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendKey  = Deno.env.get('RESEND_API_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Builds and sends one user's digest; returns a plain result object.
    async function runForUser(userId: string) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const userEmail = userData?.user?.email
      if (!userEmail) return { userId, skipped: 'no_email' }

      // Respect the user's "Digests & summaries" preference (defaults on).
      const { data: prefOn } = await supabase.rpc('get_email_pref', { p_email: userEmail, p_category: 'digests' })
      if (prefOn === false) return { userId, email: userEmail, skipped: 'pref_off' }

      const { data: projects } = await supabase
        .from('pm_projects').select('*').eq('user_id', userId).eq('status', 'active')
      if (!projects || projects.length === 0) return { userId, email: userEmail, skipped: 'no_projects' }

      const now = new Date()
      const summaries = []
      for (const project of projects.slice(0, 10)) {
        const [tasksRes, milestonesRes] = await Promise.all([
          supabase.from('pm_tasks').select('*').eq('project_id', project.id),
          supabase.from('pm_milestones').select('*').eq('project_id', project.id),
        ])
        const tasks = tasksRes.data || []
        const milestones = milestonesRes.data || []
        const totalTasks = tasks.length
        const doneTasks = tasks.filter((t: any) => t.status === 'done').length
        const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
        const overdue = tasks.filter((t: any) => t.due_date && new Date(t.due_date) < now && t.status !== 'done')
        const dueSoon = tasks.filter((t: any) => {
          if (!t.due_date || t.status === 'done') return false
          const d = new Date(t.due_date)
          return d > now && d < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        })
        const nextMilestone = milestones
          .filter((m: any) => !m.completed)
          .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
        summaries.push({
          name: project.name, progress, totalTasks, doneTasks,
          overdueCount: overdue.length,
          dueSoonTasks: dueSoon.slice(0, 3).map((t: any) => t.title),
          nextMilestone: nextMilestone ? { title: nextMilestone.title, due: nextMilestone.due_date } : null,
        })
      }

      const html = `<!DOCTYPE html><html><head><style>
  body { font-family: system-ui, sans-serif; background: #f9f9f9; margin: 0; padding: 20px; color: #111; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
  .header { background: #111; padding: 28px 32px; } .header h1 { color: #fff; font-size: 20px; margin: 0 0 4px; font-weight: 700; } .header p { color: rgba(255,255,255,.5); font-size: 13px; margin: 0; }
  .body { padding: 24px 32px; }
  .project { border: 1px solid #f0f0f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 16px; }
  .project-name { font-weight: 700; font-size: 15px; margin: 0 0 12px; }
  .progress-bar { height: 6px; background: #f0f0f0; border-radius: 99px; overflow: hidden; margin-bottom: 12px; } .progress-fill { height: 100%; background: #111; border-radius: 99px; }
  .stats { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 12px; } .stat { font-size: 12px; color: #888; } .stat strong { color: #111; font-size: 14px; display: block; }
  .tag { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 99px; font-weight: 600; margin-right: 4px; }
  .overdue { background: #fef2f2; color: #dc2626; } .due-soon { background: #fefce8; color: #854d0e; } .milestone { background: #eff6ff; color: #1d4ed8; }
  .footer { padding: 20px 32px; border-top: 1px solid #f0f0f0; text-align: center; font-size: 12px; color: #aaa; }
</style></head><body><div class="wrapper">
  <div class="header"><h1>Weekly Project Digest</h1><p>${now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
  <div class="body">
    ${summaries.map((s) => `
    <div class="project">
      <p class="project-name">${escHtml(s.name)}</p>
      <div class="progress-bar"><div class="progress-fill" style="width:${s.progress}%"></div></div>
      <div class="stats">
        <div class="stat"><strong>${s.progress}%</strong>Progress</div>
        <div class="stat"><strong>${s.doneTasks}/${s.totalTasks}</strong>Tasks done</div>
        ${s.overdueCount > 0 ? `<div class="stat"><strong style="color:#dc2626">${s.overdueCount}</strong>Overdue</div>` : ''}
      </div>
      ${s.overdueCount > 0 ? `<span class="tag overdue">${s.overdueCount} overdue task${s.overdueCount !== 1 ? 's' : ''}</span>` : ''}
      ${s.dueSoonTasks.length > 0 ? `<span class="tag due-soon">Due this week: ${s.dueSoonTasks.map(escHtml).join(', ')}</span>` : ''}
      ${s.nextMilestone ? `<br><span class="tag milestone" style="margin-top:6px;">Next milestone: ${escHtml(s.nextMilestone.title)} · ${new Date(s.nextMilestone.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>` : ''}
    </div>`).join('')}
  </div>
  <div class="footer">Sent by Vikku PM · <a href="https://vikku.in/dashboard/notifications" style="color:#888">Manage email preferences</a></div>
</div></body></html>`

      if (!resendKey) return { userId, email: userEmail, preview: true, projects: summaries.length }

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'Vikku PM <connect@vikku.in>',
          to: [userEmail],
          subject: `Your weekly project digest — ${summaries.length} active project${summaries.length !== 1 ? 's' : ''}`,
          html,
        }),
      })
      if (!emailRes.ok) { const err = await emailRes.json(); return { userId, email: userEmail, error: err.message || 'send failed' } }
      const emailData = await emailRes.json()
      return { userId, email: userEmail, sent: true, id: emailData.id }
    }

    const body = await req.json().catch(() => ({}))
    const single: string | undefined = body.user_id

    // Single user (explicit user_id) — used by manual/test calls.
    if (single) return json(await runForUser(single))

    // No user_id → weekly cron: send to every owner of an active project.
    const { data: owners } = await supabase.from('pm_projects').select('user_id').eq('status', 'active')
    const ids = [...new Set((owners || []).map((o: any) => o.user_id).filter(Boolean))]
    const results = []
    for (const id of ids) {
      try { results.push(await runForUser(id)) }
      catch (e) { results.push({ userId: id, error: e instanceof Error ? e.message : 'error' }) }
    }
    return json({ count: ids.length, results })
  } catch (err: unknown) {
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
