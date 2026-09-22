import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

// Narrates a deterministic model result (project estimate or business-impact
// model) into a founder-ready executive summary. GPT does NOT recompute the
// numbers — they are supplied and it explains them.

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': new Set(['https://vikku.in', 'https://www.vikku.in']).has(origin) ? origin : 'https://www.vikku.in',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

async function rateLimited(fn: string, ip: string): Promise<boolean> {
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const hit = async (bucket: string, max: number, win: number) => {
      const r = await fetch(`${url}/rest/v1/rpc/ai_rate_hit`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_key: bucket, p_max: max, p_window_seconds: win }),
      })
      return (await r.json()) === false
    }
    if (await hit(`${fn}:${ip}`, 20, 3600)) return true    // 20 / hour / IP
    if (await hit(`${fn}:global`, 1000, 86400)) return true // 1000 / day total
    return false
  } catch { return false }
}

const PROMPTS: Record<string, string> = {
  estimate: `You are a pragmatic software delivery lead writing for a non-technical founder. You are given a project estimate that was already calculated by a deterministic model. DO NOT change or invent numbers — explain the ones provided.`,
  impact: `You are a pragmatic CFO/consultant writing for a non-technical founder. You are given a business-impact financial model that was already calculated deterministically from the client's inputs and industry benchmarks. DO NOT change or invent numbers — explain the ones provided, and be clear these rest on assumptions.`,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    if (await rateLimited('summary', ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a bit.' }), { status: 429, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    }

    const rawBody = await req.text()
    if (rawBody.length > 12000) {
      return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    }
    const { kind, data } = JSON.parse(rawBody)
    if (kind !== 'estimate' && kind !== 'impact') {
      return new Response(JSON.stringify({ error: 'Invalid kind' }), { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    }
    const dataStr = JSON.stringify(data ?? {}).slice(0, 8000)

    const prompt = `${PROMPTS[kind]}

Model result (JSON):
${dataStr}

Respond with this exact JSON:
{
  "executiveSummary": "2-4 sentences a founder could paste into a stakeholder update, using the provided figures",
  "points": [
    { "title": "Biggest ${kind === 'impact' ? 'opportunity' : 'cost driver'}", "text": "one or two sentences" },
    { "title": "Biggest risk", "text": "one or two sentences, name the key assumption the result is sensitive to" },
    { "title": "${kind === 'impact' ? 'What to validate' : 'What could change the estimate'}", "text": "one or two sentences" }
  ],
  "recommendation": "one concrete recommended next step (e.g. run a pilot, lock scope, phase the build)"
}

Be concise, specific, and honest. Use the currency and figures exactly as given. Do not output markdown, only JSON.`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You write concise, honest business summaries. Always respond with valid JSON and never invent numbers.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 900,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.json()
      throw new Error(err.error?.message || 'OpenAI request failed')
    }

    const out = await openaiRes.json()
    const result = JSON.parse(out.choices[0].message.content)
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
  }
})
