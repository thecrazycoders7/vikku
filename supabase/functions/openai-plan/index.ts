import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': new Set(['https://vikku.in','https://www.vikku.in']).has(origin) ? origin : 'https://www.vikku.in',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) })
  }

  try {
    // Verify user and check Pro subscription
    const authHeader = req.headers.get('Authorization') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const FREE_MONTHLY_LIMIT = 6

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()

    // AI planning is authenticated-only
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Please sign in to use the AI planner.' }),
        { status: 401, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: sub } = await adminClient
      .from('user_subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()

    const subActive = sub && sub.status !== 'cancelled' &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date())
    const plan = subActive ? (sub.plan || 'free') : 'free'

    // Free tier: enforce 6 AI plans / calendar month server-side
    if (plan === 'free') {
      const period = new Date().toISOString().slice(0, 7) // YYYY-MM
      const { data: usage } = await adminClient
        .from('ai_plan_usage')
        .select('count')
        .eq('user_id', user.id)
        .eq('period', period)
        .maybeSingle()
      const used = usage?.count || 0
      if (used >= FREE_MONTHLY_LIMIT) {
        return new Response(
          JSON.stringify({ error: 'limit_reached', message: `You've used all ${FREE_MONTHLY_LIMIT} free AI plans this month. Upgrade to Pro for unlimited.` }),
          { status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
        )
      }
      await adminClient
        .from('ai_plan_usage')
        .upsert({ user_id: user.id, period, count: used + 1, updated_at: new Date().toISOString() }, { onConflict: 'user_id,period' })
    }

    const { description: rawDesc } = await req.json()
    const description = String(rawDesc ?? '').slice(0, 1000)

    if (!description || description.length < 10) {
      return new Response(JSON.stringify({ error: 'Description too short' }), {
        status: 400,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const today = new Date().toISOString().split('T')[0]
    const prompt = `You are an expert project manager. Generate a practical project plan for: ${description}\n\nToday: ${today}\n\nRespond with JSON:\n{\n  "summary": "1-2 sentence overview",\n  "tasks": [{"title": "string", "description": "string", "status": "todo|in_progress|review|done", "priority": "low|medium|high|urgent"}],\n  "milestones": [{"title": "string", "due_date": "YYYY-MM-DD", "completed": false}]\n}\n\nGenerate 10-15 tasks across all statuses, 3-5 milestones with future dates.`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a project manager. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.json()
      throw new Error(err.error?.message || 'OpenAI request failed')
    }

    const data = await openaiRes.json()
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(result), {
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
