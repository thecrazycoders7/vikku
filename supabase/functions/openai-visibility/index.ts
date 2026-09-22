import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const UA = 'VikkuAIVisibilityBot/1.0 (+https://vikku.in/dashboard/ai-visibility-score)'
const AI_BOTS = ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'CCBot', 'Bytespider', 'Applebot-Extended']
const MAX_BODY_BYTES = 3 * 1024 * 1024
const FETCH_TIMEOUT_MS = 10_000
const MAX_REDIRECTS = 3

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
    // Stricter than other tools: this function makes outbound fetches to
    // arbitrary third-party hosts at our cost/risk.
    if (await hit(`${fn}:${ip}`, 10, 3600)) return true    // 10 / hour / IP
    if (await hit(`${fn}:global`, 1000, 86400)) return true // 1000 / day total
    return false
  } catch { return false }
}

// ── SSRF-safe URL validation + fetch ────────────────────────────────────────

function isPrivateOrReservedIp(host: string): boolean {
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (v4) {
    const a = Number(v4[1]), b = Number(v4[2])
    if (a === 127) return true              // loopback 127.0.0.0/8
    if (a === 10) return true               // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
    if (a === 192 && b === 168) return true // 192.168.0.0/16
    if (a === 169 && b === 254) return true // 169.254.0.0/16 - blocks cloud metadata 169.254.169.254
    if (a === 0) return true
    return false
  }
  const v6 = host.replace(/^\[|\]$/g, '').toLowerCase()
  if (v6 === '::1') return true
  if (v6.startsWith('fe80:')) return true
  if (/^fc[0-9a-f]{2}:/.test(v6) || /^fd[0-9a-f]{2}:/.test(v6)) return true
  return false
}

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase()
  if (h === 'localhost' || h.endsWith('.localhost')) return true
  if (h === '0.0.0.0' || h === '::1') return true
  return isPrivateOrReservedIp(h)
}

function assertSafeUrl(raw: string): URL {
  let u: URL
  try { u = new URL(raw) } catch { throw new Error("That doesn't look like a valid URL.") }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Only http/https URLs are supported.')
  if (isBlockedHost(u.hostname)) throw new Error("That host can't be analyzed.")
  return u
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const c of chunks) { out.set(c, off); off += c.length }
  return out
}

// NOTE (v1 limitation): DNS rebinding - a host resolving safely at validation
// time but to a private IP at connection time - is not fully closed without
// custom DNS resolution in this runtime. Literal-IP blocking plus per-hop
// redirect re-validation covers the realistic threat model here (no
// privileged internal network is reachable from this edge runtime; the
// cloud-metadata-endpoint check above is the one that matters most).
async function safeFetch(rawUrl: string): Promise<{ finalUrl: string; status: number; text: string } | null> {
  let current = assertSafeUrl(rawUrl).toString()
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let res: Response
    try {
      res = await fetch(current, {
        redirect: 'manual',
        headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
    } catch { return null }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) return null
      if (hop === MAX_REDIRECTS) return null
      const nextUrl = new URL(loc, current)
      assertSafeUrl(nextUrl.toString())
      current = nextUrl.toString()
      continue
    }

    const reader = res.body?.getReader()
    if (!reader) return { finalUrl: current, status: res.status, text: '' }
    let received = 0
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      if (received > MAX_BODY_BYTES) { reader.cancel(); break }
      chunks.push(value)
    }
    return { finalUrl: current, status: res.status, text: new TextDecoder().decode(concatChunks(chunks)) }
  }
  return null
}

// ── robots.txt / llms.txt best-effort checks ────────────────────────────────
// This checks what the TARGET SITE blocks - it does not gate our own fetch
// of the page (we proceed regardless, since the user explicitly requested
// analysis of their own submitted URL, not indiscriminate crawling).

async function checkRobotsAndLlms(origin: string) {
  const out = { robotsFound: false, blocksAnyAiCrawler: false, blockedBots: [] as string[], llmsTxtFound: false }
  try {
    const r = await safeFetch(`${origin}/robots.txt`)
    if (r && r.status === 200 && r.text) {
      out.robotsFound = true
      const blocks = r.text.split(/\n(?=user-agent:)/i)
      for (const bot of AI_BOTS) {
        const hit = blocks.find((b) => new RegExp(`user-agent:\\s*${bot}`, 'i').test(b))
        if (hit && /disallow:\s*\/\s*($|\n)/im.test(hit)) out.blockedBots.push(bot)
      }
      out.blocksAnyAiCrawler = out.blockedBots.length > 0
    }
  } catch { /* best-effort */ }
  try {
    const l = await safeFetch(`${origin}/llms.txt`)
    out.llmsTxtFound = !!(l && l.status === 200 && l.text?.trim().length > 0)
  } catch { /* best-effort */ }
  return out
}

// ── Lightweight HTML signal extraction (regex-only, matches repo convention) ─

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSignals(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i)?.[1]
    || html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i)?.[1] || null
  const metaRobots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([\s\S]*?)["']/i)?.[1] || null
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([\s\S]*?)["']/i)?.[1] || null

  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => { try { return JSON.parse(m[1].trim()) } catch { return null } })
    .filter(Boolean)
  const jsonLdTypes = [...new Set(
    jsonLdBlocks.flatMap((b: any) => Array.isArray(b) ? b.map((x: any) => x?.['@type']) : [b?.['@type']]).filter(Boolean)
  )]

  const h1Count = (html.match(/<h1[\s>]/gi) || []).length
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length
  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)]
  const imgWithAlt = imgTags.filter((m) => /alt=["'][^"']+["']/i.test(m[0])).length
  const visibleText = stripTags(html)
  const wordCount = visibleText ? visibleText.split(/\s+/).filter(Boolean).length : 0

  return {
    title, metaDesc, metaRobots, canonical,
    hasJsonLd: jsonLdBlocks.length > 0, jsonLdTypes,
    h1Count, h2Count,
    imgTotal: imgTags.length, imgWithAlt,
    wordCount,
    visibleTextSample: visibleText.slice(0, 6000),
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    if (await rateLimited('visibility', ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a bit.' }), { status: 429, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    }

    const rawBody = await req.text()
    if (rawBody.length > 8000) {
      return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    }
    const { url } = JSON.parse(rawBody)
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Please provide a URL.' }), { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    }

    let validated: URL
    try {
      validated = assertSafeUrl(url)
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    }

    const page = await safeFetch(validated.toString())
    if (!page || page.status >= 400) {
      return new Response(JSON.stringify({ error: "We couldn't reach that URL. Check it's correct and publicly accessible, then try again." }), { status: 422, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    }
    if (!/<[a-z][\s\S]*>/i.test(page.text.slice(0, 2000))) {
      return new Response(JSON.stringify({ error: "That URL didn't return an HTML page we can analyze." }), { status: 422, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })
    }

    const origin = new URL(page.finalUrl).origin
    const signals = extractSignals(page.text)
    const crawlerAccess = await checkRobotsAndLlms(origin)

    const prompt = `You are an AI-visibility / answer-engine-optimization (AEO) analyst. A business owner submitted their website. Assess how likely AI assistants (ChatGPT, Perplexity, Gemini, Claude) are to find, understand, mention, and recommend this business when someone asks a relevant question.

IMPORTANT HONESTY RULES:
- You are NOT querying live AI systems. Base every judgment on (a) the page content and technical signals below, and (b) your own general knowledge of this business/industry if you recognise it.
- For "testedQueries" and "competitors": these are your EXPERT ESTIMATES of how this brand likely appears in AI answers, not live results. Be realistic and conservative. If you don't recognise the brand, assume low mention/citation likelihood.
- Never invent specific statistics or fake competitor names you aren't reasonably confident about. If unsure of real competitors, describe the competitor type generically (e.g. "Established regional agency").

URL analyzed: ${page.finalUrl}
Page title: ${signals.title || '(missing)'}
Meta description: ${signals.metaDesc || '(missing)'}
Meta robots directive: ${signals.metaRobots || '(none - default indexable)'}
Canonical link: ${signals.canonical || '(missing)'}
Structured data (JSON-LD) present: ${signals.hasJsonLd} - types: ${signals.jsonLdTypes.join(', ') || 'none'}
Heading counts: ${signals.h1Count} H1, ${signals.h2Count} H2
Visible text length: ~${signals.wordCount} words
Image alt-text coverage: ${signals.imgWithAlt}/${signals.imgTotal} images have alt text
robots.txt found: ${crawlerAccess.robotsFound} - blocks known AI crawlers: ${crawlerAccess.blocksAnyAiCrawler} (${crawlerAccess.blockedBots.join(', ') || 'none blocked'})
llms.txt found: ${crawlerAccess.llmsTxtFound}

Visible page text (truncated):
"""
${signals.visibleTextSample}
"""

Compute the overall "score" (0-100) as the weighted average of the six dimensions using these weights:
AI Mentions 30%, Brand Understanding 20%, Citation Visibility 15%, Content Coverage 15%, Entity Consistency 10%, External Authority 10%.

Respond with this exact JSON:
{
  "score": number,
  "verdict": "one short punchy line, e.g. 'AI understands you but rarely cites you'",
  "summary": "2-3 sentences in plain language explaining the score",
  "dimensions": [
    { "key": "ai_mentions",         "label": "AI Mentions",          "score": number, "note": "one short sentence" },
    { "key": "brand_understanding", "label": "Brand Understanding",  "score": number, "note": "one short sentence" },
    { "key": "citation",            "label": "Citation Visibility",  "score": number, "note": "one short sentence" },
    { "key": "content",             "label": "Content Coverage",     "score": number, "note": "one short sentence" },
    { "key": "entity",              "label": "Entity Consistency",   "score": number, "note": "one short sentence" },
    { "key": "authority",           "label": "External Authority",   "score": number, "note": "one short sentence" }
  ],
  "whatAiSees": {
    "statement": "one sentence describing what AI would understand this company does, in the AI's voice",
    "correct": ["things AI correctly associates with this brand"],
    "missing": ["positioning or services the site implies but AI would NOT strongly associate"],
    "misunderstood": ["things AI might describe inaccurately"]
  },
  "testedQueries": [
    { "query": "a realistic question a customer would ask an AI assistant", "mentioned": boolean, "cited": boolean, "note": "short reasoning for this estimate" }
  ],
  "competitors": [
    { "name": "competitor or competitor-type", "score": number, "note": "short reason" }
  ],
  "blockers": [{ "issue": "string", "severity": "high" | "medium" | "low", "why_it_matters": "string", "fix": "concrete actionable step" }],
  "strengths": ["string"],
  "quickWins": ["fastest highest-impact fix"],
  "actionPlan": [
    { "week": "Week 1", "focus": "short focus", "tasks": ["string"] }
  ],
  "signals": {
    "hasStructuredData": boolean,
    "structuredDataTypes": ["string"],
    "metaDescriptionPresent": boolean,
    "titlePresent": boolean,
    "wordCount": number,
    "altTextCoveragePercent": number,
    "aiCrawlersBlocked": boolean,
    "blockedCrawlers": ["string"],
    "llmsTxtPresent": boolean
  }
}

Rules: 6 dimensions always. 4-6 testedQueries. 3-4 competitors (the brand itself is NOT in this list). 3-6 blockers ordered by severity (high first). 2-4 strengths. 2-3 quickWins. actionPlan = exactly 4 entries (Week 1-4) building from foundational fixes to authority-building. Be specific and concrete for a non-technical business owner.`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an AI-visibility / answer-engine-optimization analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 3200,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.json()
      throw new Error(err.error?.message || 'OpenAI request failed')
    }

    const data = await openaiRes.json()
    const result = JSON.parse(data.choices[0].message.content)
    result.analyzedUrl = page.finalUrl

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
