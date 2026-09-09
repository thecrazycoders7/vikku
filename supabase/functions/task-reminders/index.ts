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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendKey = Deno.env.get('RESEND_API_KEY')

    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().slice(0, 10)

    // Find all tasks due tomorrow with reminder_enabled = true, not yet done
    const { data: tasks, error } = await supabase
      .from('pm_tasks')
      .select('*, pm_projects(name, user_id)')
      .eq('reminder_enabled', true)
      .eq('due_date', tomorrowStr)
      .neq('status', 'done')

    if (error) throw error
    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send' }), {
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Group tasks by user_id
    const byUser: Record<string, { email: string; tasks: any[] }> = {}

    for (const task of tasks) {
      const userId = task.pm_projects?.user_id
      if (!userId) continue
      if (!byUser[userId]) {
        const { data: userData } = await supabase.auth.admin.getUserById(userId)
        const email = userData?.user?.email
        if (!email) continue
        byUser[userId] = { email, tasks: [] }
      }
      byUser[userId].tasks.push(task)
    }

    const results = []

    for (const [userId, { email, tasks: userTasks }] of Object.entries(byUser)) {
      const taskList = userTasks
        .map((t: any) => `<li style="margin-bottom:8px"><strong>${t.title}</strong> — ${t.pm_projects?.name}</li>`)
        .join('')

      const html = `<!DOCTYPE html>
<html>
<head><style>
  body { font-family: system-ui, sans-serif; background: #f9f9f9; margin: 0; padding: 20px; color: #111; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
  .header { background: #111; padding: 28px 32px; }
  .header h1 { color: #fff; font-size: 20px; margin: 0 0 4px; font-weight: 700; }
  .header p { color: rgba(255,255,255,.5); font-size: 13px; margin: 0; }
  .body { padding: 24px 32px; }
  ul { margin: 0 0 16px; padding-left: 20px; font-size: 14px; color: #333; line-height: 1.6; }
  .footer { padding: 20px 32px; border-top: 1px solid #f0f0f0; text-align: center; font-size: 12px; color: #aaa; }
</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Task Reminder</h1>
    <p>The following tasks are due tomorrow</p>
  </div>
  <div class="body">
    <ul>${taskList}</ul>
    <a href="https://vikku.in/pm/dashboard" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600">Open Dashboard →</a>
  </div>
  <div class="footer">Sent by Vikku PM · <a href="https://vikku.in/pm/dashboard" style="color:#888">Manage reminders</a></div>
</div>
</body>
</html>`

      if (!resendKey) {
        results.push({ userId, email, preview: true, count: userTasks.length })
        continue
      }

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Vikku PM <noreply@vikku.in>',
          to: [email],
          subject: `Reminder: ${userTasks.length} task${userTasks.length !== 1 ? 's' : ''} due tomorrow`,
          html,
        }),
      })

      const emailData = await emailRes.json()
      results.push({ userId, email, sent: emailRes.ok, id: emailData.id })
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
