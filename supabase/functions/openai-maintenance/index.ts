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
    if (await hit(`${fn}:${ip}`, 30, 3600)) return true
    if (await hit(`${fn}:global`, 1000, 86400)) return true
    return false
  } catch { return false }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    if (await rateLimited('maintenance', ip)) return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a bit.' }), { status: 429, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    const rawBody = await req.text()
    if (rawBody.length > 8000) return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    const inputs = JSON.parse(rawBody)

    const prompt = `You are a software maintenance and support cost analyst. Estimate the ongoing monthly cost to maintain and support an existing software product.

Product type: ${inputs.productType}
Complexity / size: ${inputs.complexity}
Active users / scale: ${inputs.scale}
Support level expected: ${inputs.supportLevel}
Has in-house dev team: ${inputs.hasTeam}
Region: ${inputs.location ? `${inputs.location.city || ''} ${inputs.location.country}` : 'India'}

Respond with this EXACT JSON structure:
{
  "currency": "INR" or "USD" etc,
  "currencySymbol": "₹" or "$",
  "monthlyCostMin": number,
  "monthlyCostMax": number,
  "annualCostMin": number,
  "annualCostMax": number,
  "breakdown": [ { "category": "string (e.g. Hosting & infra, Monitoring, Bug fixes, Security updates, Feature tweaks, Support hours)", "costMin": number, "costMax": number, "description": "string" } ],
  "recommendations": ["string","string","string"],
  "risksOfSkipping": ["string","string"]
}

Use realistic local market rates for the region (INR for India). Provide 4-6 breakdown items, 3 recommendations, 2 risksOfSkipping.`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a software maintenance cost analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1400,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.json()
      throw new Error(err.error?.message || 'OpenAI request failed')
    }

    const data = await openaiRes.json()
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
  }
})
