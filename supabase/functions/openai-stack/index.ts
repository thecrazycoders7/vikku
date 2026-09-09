import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': new Set(['https://vikku.in','https://www.vikku.in']).has(origin) ? origin : 'https://www.vikku.in',
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
    if (await hit(`${fn}:${ip}`, 30, 3600)) return true   // 30 / hour / IP
    if (await hit(`${fn}:global`, 1000, 86400)) return true // 1000 / day total
    return false
  } catch { return false }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    if (await rateLimited('stack', ip)) return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a bit.' }), { status: 429, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    const rawBody = await req.text()
    if (rawBody.length > 8000) return new Response(JSON.stringify({ error: "Request too large" }), { status: 413, headers: { ...corsHeaders(req), "Content-Type": "application/json" } })
    const inputs = JSON.parse(rawBody)

    const prompt = `You are a senior software architect. Recommend the best tech stack for this project:

Project Type: ${inputs.projectType}
Expected Scale: ${inputs.scale}
Budget: ${inputs.budget}
Dev Team: ${inputs.hasDevTeam}
Key Requirements: ${inputs.requirements?.join(', ') || 'None specified'}

Respond with this exact JSON:
{
  "recommendedStack": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "hosting": "string",
    "extras": ["string"]
  },
  "whyThisStack": "string (2-3 sentences explaining the choice)",
  "totalMonthlyCost": "string (e.g. '$20-50/month')",
  "technologies": [
    {
      "name": "string",
      "role": "string",
      "reason": "string",
      "monthlyCost": "string",
      "pros": ["string"]
    }
  ],
  "alternativeStack": {
    "name": "string",
    "stack": "string",
    "whenToChoose": "string"
  },
  "warnings": ["string"]
}

Provide 4-6 technologies, 2-3 warnings. Be specific and practical.`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a software architect. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
