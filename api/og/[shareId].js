import { createClient } from '@supabase/supabase-js'

const SITE = 'https://www.vikku.in'

const TOOL_LABELS = {
  cost_estimator: 'Cost Estimate',
  roi_calculator: 'ROI Report',
  timeline_calculator: 'Project Timeline',
  tech_recommender: 'Tech Stack',
  maintenance_calculator: 'Maintenance Cost',
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const lakh = (n) => {
  const num = Number(n || 0)
  return num >= 100000 ? `${(num / 100000).toFixed(1)}L` : num.toLocaleString('en-IN')
}

function buildOg(tool, r) {
  const sym = r?.currencySymbol || '₹'
  switch (tool) {
    case 'cost_estimator':
      return {
        title: `Cost Estimate: ${sym}${lakh(r.totalCostMin)}–${sym}${lakh(r.totalCostMax)} | Vikku`,
        description: `AI project estimate · Timeline: ${r.timeline || 'TBD'} · Complexity: ${r.complexity || 'custom'}. See full breakdown on Vikku.`,
      }
    case 'roi_calculator':
      return {
        title: `ROI ${r.roiPercent}% · Losing ${sym}${lakh(r.monthlyRevenueLost)}/mo without a website | Vikku`,
        description: `${sym}${lakh(r.annualRevenueLost)} lost per year. Payback period: ${r.paybackPeriodMonths} months. See full ROI analysis.`,
      }
    case 'timeline_calculator': {
      const weeks = r.totalWeeksMin != null ? `${r.totalWeeksMin}–${r.totalWeeksMax} weeks` : (r.totalDuration || 'custom timeline')
      return {
        title: `Project Timeline: ${weeks} | Vikku`,
        description: `AI timeline estimate with ${r.phases?.length || 0} phases. See phase breakdown and milestones on Vikku.`,
      }
    }
    case 'tech_recommender': {
      const stack = r.recommendations?.[0]?.name || r.stack?.frontend || 'Custom Stack'
      return {
        title: `Tech Stack: ${stack} recommended | Vikku`,
        description: `AI-recommended tech stack for your project. See full stack breakdown and reasoning on Vikku.`,
      }
    }
    case 'maintenance_calculator':
      return {
        title: `Maintenance Cost: ${sym}${lakh(r.monthlyCostMin)}–${sym}${lakh(r.monthlyCostMax)}/mo | Vikku`,
        description: `Ongoing maintenance estimate. Annual: ${sym}${lakh(r.annualCostMin)}–${sym}${lakh(r.annualCostMax)}. See full breakdown.`,
      }
    default:
      return {
        title: `AI Project Estimate | Vikku`,
        description: `Free AI-powered project planning. See this estimate on Vikku.`,
      }
  }
}

export default async function handler(req, res) {
  const { shareId } = req.query
  if (!shareId) return res.redirect(302, '/')

  let title = 'AI Project Estimate | Vikku'
  let description = 'Free AI-powered project planning tools. See this estimate on Vikku.'

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
    const { data } = await supabase.rpc('get_tool_result', { p_share_id: shareId })
    const row = Array.isArray(data) ? data[0] : data
    if (row?.tool) {
      const og = buildOg(row.tool, row.result || {})
      title = og.title
      description = og.description
    }
  } catch { /* fall through to defaults */ }

  const pageUrl = `${SITE}/r/${shareId}`
  const ogImage = `${SITE}/og-image.png`
  const ua = req.headers['user-agent'] || ''
  const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|discordbot|telegrambot|googlebot|bingbot|applebot/i.test(ua)

  if (!isBot) {
    // Redirect users to the SPA route (not /r/* which loops back to this function)
    res.setHeader('Location', `${SITE}/r-view/${shareId}`)
    return res.status(302).end()
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(pageUrl)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:site_name" content="Vikku">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(ogImage)}">
</head>
<body></body>
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(html)
}
