import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': new Set(['https://vikku.in', 'https://www.vikku.in']).has(origin) ? origin : 'https://www.vikku.in',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {
    const reqUrl = new URL(req.url)
    const shareToken = reqUrl.searchParams.get('share_token')
    const fileId = reqUrl.searchParams.get('file_id')
    const listMode = reqUrl.searchParams.get('list') === '1'

    if (!shareToken) {
      return new Response(JSON.stringify({ error: 'Missing share_token' }), {
        status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const sb = createClient(supabaseUrl, serviceKey)

    // Verify the share token belongs to a real project
    const { data: project } = await sb
      .from('pm_projects')
      .select('id')
      .eq('share_token', shareToken)
      .maybeSingle()

    if (!project) {
      return new Response(JSON.stringify({ error: 'Invalid share token' }), {
        status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // List mode: return all visible_to_client files for the project
    if (listMode) {
      const { data: tasks } = await sb.from('pm_tasks').select('id').eq('project_id', project.id)
      if (!tasks?.length) {
        return new Response(JSON.stringify({ files: [] }), {
          status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
        })
      }
      const { data: files } = await sb
        .from('pm_task_attachments')
        .select('id, file_name, file_size, mime_type')
        .in('task_id', tasks.map((t: any) => t.id))
        .eq('visible_to_client', true)
        .order('created_at', { ascending: false })
      return new Response(JSON.stringify({ files: files || [] }), {
        status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Download mode: return signed URL for a specific file
    if (!fileId) {
      return new Response(JSON.stringify({ error: 'Missing file_id' }), {
        status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const { data: attachment } = await sb
      .from('pm_task_attachments')
      .select('file_path, file_name, mime_type, task_id')
      .eq('id', fileId)
      .eq('visible_to_client', true)
      .maybeSingle()

    if (!attachment) {
      return new Response(JSON.stringify({ error: 'File not found or not shared with client' }), {
        status: 404, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Verify the task belongs to this project
    const { data: task } = await sb
      .from('pm_tasks')
      .select('project_id')
      .eq('id', attachment.task_id)
      .maybeSingle()

    if (!task || task.project_id !== project.id) {
      return new Response(JSON.stringify({ error: 'File does not belong to this project' }), {
        status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    // Create a short-lived signed URL (15 min)
    const { data: signed } = await sb.storage
      .from('pm-attachments')
      .createSignedUrl(attachment.file_path, 900)

    if (!signed?.signedUrl) {
      return new Response(JSON.stringify({ error: 'Could not generate download URL' }), {
        status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url: signed.signedUrl, file_name: attachment.file_name }), {
      status: 200,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
