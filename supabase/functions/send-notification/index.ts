import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM = 'Vikku PM <noreply@vikku.in>'

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': origin === 'https://vikku.in' ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

const json = (req: Request, data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })

async function send(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}

function escHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── Email templates ────────────────────────────────────────────────────────────

function base(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{background:#0a0a0a;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0}
    .wrap{max-width:560px;margin:0 auto;padding:40px 24px}
    .logo{font-size:18px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;margin-bottom:32px}
    .card{background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px}
    h2{color:#ffffff;font-size:18px;font-weight:700;margin:0 0 8px}
    p{color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin:0 0 16px}
    .badge{display:inline-block;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;margin-bottom:16px}
    .cta{display:inline-block;background:#ffffff;color:#000000;padding:10px 22px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;margin-top:8px}
    .meta{color:rgba(255,255,255,0.25);font-size:11px;margin-top:32px}
    blockquote{border-left:2px solid rgba(255,255,255,0.15);margin:16px 0;padding:8px 16px;color:rgba(255,255,255,0.5);font-size:13px;font-style:italic}
  </style></head><body><div class="wrap">
    <div class="logo">vikku</div>
    <div class="card">${content}</div>
    <p class="meta">You're receiving this because you're part of a Vikku project. <a href="https://vikku.in" style="color:rgba(255,255,255,0.4)">vikku.in</a></p>
  </div></body></html>`
}

function taskAssignedHtml(d: { taskTitle: string; projectName: string; assignorName: string; dueDate?: string }) {
  return base(`
    <h2>You've been assigned a task</h2>
    <p style="margin-bottom:4px"><strong style="color:#fff">${escHtml(d.taskTitle)}</strong></p>
    <p>in <strong style="color:#fff">${escHtml(d.projectName)}</strong>${d.assignorName ? ` — assigned by ${escHtml(d.assignorName)}` : ''}</p>
    ${d.dueDate ? `<p style="margin:0"><span class="badge" style="background:rgba(234,179,8,0.12);color:#eab308">Due ${escHtml(d.dueDate)}</span></p>` : ''}
    <a href="https://vikku.in/pm/dashboard" class="cta">Open Project Manager</a>
  `)
}

function clientCommentHtml(d: { projectName: string; authorName: string; comment: string; shareUrl: string }) {
  return base(`
    <h2>New client comment</h2>
    <p><strong style="color:#fff">${escHtml(d.authorName)}</strong> left a comment on <strong style="color:#fff">${escHtml(d.projectName)}</strong>:</p>
    <blockquote>${escHtml(d.comment)}</blockquote>
    <a href="https://vikku.in/pm/share/${escHtml(d.shareUrl.split('/').pop() ?? '')}" class="cta">View Project</a>
  `)
}

function clientApprovalHtml(d: { projectName: string; taskTitle: string; status: string; note?: string; shareUrl: string }) {
  const isApproved = d.status === 'approved'
  const badgeColor = isApproved
    ? 'background:rgba(34,197,94,0.12);color:#22c55e'
    : 'background:rgba(234,179,8,0.12);color:#eab308'
  const statusLabel = isApproved ? 'Approved' : 'Needs revision'
  return base(`
    <h2>${isApproved ? '✓ Task approved' : '↩ Revision requested'}</h2>
    <p>Your client reviewed <strong style="color:#fff">${escHtml(d.taskTitle)}</strong> in <strong style="color:#fff">${escHtml(d.projectName)}</strong>.</p>
    <span class="badge" style="${badgeColor}">${statusLabel}</span>
    ${d.note ? `<blockquote>${escHtml(d.note)}</blockquote>` : ''}
    <a href="https://vikku.in/pm/share/${escHtml(d.shareUrl.split('/').pop() ?? '')}" class="cta">View Details</a>
  `)
}

function milestoneApprovalHtml(d: { projectName: string; milestoneTitle: string; status: string; note?: string; shareUrl: string }) {
  const isApproved = d.status === 'approved'
  const badgeColor = isApproved
    ? 'background:rgba(34,197,94,0.12);color:#22c55e'
    : 'background:rgba(234,179,8,0.12);color:#eab308'
  return base(`
    <h2>${isApproved ? '✓ Milestone approved' : '↩ Milestone revision requested'}</h2>
    <p>Your client reviewed milestone <strong style="color:#fff">${escHtml(d.milestoneTitle)}</strong> in <strong style="color:#fff">${escHtml(d.projectName)}</strong>.</p>
    <span class="badge" style="${badgeColor}">${isApproved ? 'Approved' : 'Needs revision'}</span>
    ${d.note ? `<blockquote>${escHtml(d.note)}</blockquote>` : ''}
    <a href="https://vikku.in/pm/share/${escHtml(d.shareUrl.split('/').pop() ?? '')}" class="cta">View Project</a>
  `)
}

// ── Handler ────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey    = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin      = createClient(supabaseUrl, serviceKey)

    const body = await req.json() as Record<string, string>
    const { type } = body

    // ── task_assigned: requires user auth token ────────────────────────────
    if (type === 'task_assigned') {
      const authHeader = req.headers.get('Authorization') || ''
      const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
      const { data: { user } } = await userClient.auth.getUser()
      if (!user) return json(req, { error: 'Unauthorized' }, 401)

      const { taskTitle, projectName, assigneeEmail, dueDate } = body
      if (!assigneeEmail || assigneeEmail === user.email) return json(req, { ok: true })

      await send(
        assigneeEmail,
        `Assigned to you: ${taskTitle}`,
        taskAssignedHtml({
          taskTitle,
          projectName,
          assignorName: user.email?.split('@')[0] || '',
          dueDate,
        }),
      )
      return json(req, { ok: true })
    }

    // ── Rate limit helper for share-token-based notifications (10/hour per token) ─
    async function checkTokenRateLimit(shareToken: string): Promise<boolean> {
      const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { count } = await admin
        .from('notification_rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('share_token', shareToken)
        .gte('created_at', windowStart)
      if ((count ?? 0) >= 10) return false
      await admin.from('notification_rate_limits').insert({ share_token: shareToken })
      return true
    }

    // ── client_comment: verified via share_token ───────────────────────────
    if (type === 'client_comment') {
      const { shareToken, authorName, comment } = body
      if (!comment || comment.length > 2000) return json(req, { error: 'Invalid comment' }, 400)
      const { data: project } = await admin
        .from('pm_projects')
        .select('user_id, name')
        .eq('share_token', shareToken)
        .single()
      if (!project) return json(req, { error: 'Invalid token' }, 400)
      if (!(await checkTokenRateLimit(shareToken))) return json(req, { error: 'Rate limit exceeded' }, 429)

      const { data: { user: owner } } = await admin.auth.admin.getUserById(project.user_id)
      if (!owner?.email) return json(req, { ok: true })

      const shareUrl = `https://vikku.in/pm/share/${shareToken}`
      await send(
        owner.email,
        `${authorName} commented on ${project.name}`,
        clientCommentHtml({ projectName: project.name, authorName, comment, shareUrl }),
      )
      return json(req, { ok: true })
    }

    // ── client_approval (task): verified via share_token ──────────────────
    if (type === 'client_approval') {
      const { shareToken, taskTitle, status, note } = body
      const { data: project } = await admin
        .from('pm_projects')
        .select('user_id, name')
        .eq('share_token', shareToken)
        .single()
      if (!project) return json(req, { error: 'Invalid token' }, 400)
      if (!(await checkTokenRateLimit(shareToken))) return json(req, { error: 'Rate limit exceeded' }, 429)

      const { data: { user: owner } } = await admin.auth.admin.getUserById(project.user_id)
      if (!owner?.email) return json(req, { ok: true })

      const shareUrl = `https://vikku.in/pm/share/${shareToken}`
      const isApproved = status === 'approved'
      await send(
        owner.email,
        `Client ${isApproved ? 'approved' : 'requested revision on'}: ${taskTitle}`,
        clientApprovalHtml({ projectName: project.name, taskTitle, status, note, shareUrl }),
      )
      return json(req, { ok: true })
    }

    // ── milestone_approval: verified via share_token ───────────────────────
    if (type === 'milestone_approval') {
      const { shareToken, milestoneTitle, status, note } = body
      const { data: project } = await admin
        .from('pm_projects')
        .select('user_id, name')
        .eq('share_token', shareToken)
        .single()
      if (!project) return json(req, { error: 'Invalid token' }, 400)
      if (!(await checkTokenRateLimit(shareToken))) return json(req, { error: 'Rate limit exceeded' }, 429)

      const { data: { user: owner } } = await admin.auth.admin.getUserById(project.user_id)
      if (!owner?.email) return json(req, { ok: true })

      const shareUrl = `https://vikku.in/pm/share/${shareToken}`
      const isApproved = status === 'approved'
      await send(
        owner.email,
        `Client ${isApproved ? 'approved' : 'requested revision on'} milestone: ${milestoneTitle}`,
        milestoneApprovalHtml({ projectName: project.name, milestoneTitle, status, note, shareUrl }),
      )
      return json(req, { ok: true })
    }

    return json(req, { error: 'Unknown type' }, 400)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return json(req, { error: msg }, 500)
  }
})
