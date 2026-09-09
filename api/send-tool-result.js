import { createClient } from '@supabase/supabase-js'

const TOOL_LABELS = {
  cost_estimator:      'Cost Estimate',
  roi_calculator:      'ROI Report',
  timeline_calculator: 'Project Timeline',
  tech_recommender:    'Tech Stack Recommendation',
}

const money = (n, sym = '₹') => `${sym}${Number(n || 0).toLocaleString('en-IN')}`
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))

function renderBody(tool, r) {
  const sym = r.currencySymbol || '₹'
  const row = (label, val) => `<tr><td style="padding:6px 0;color:#666">${esc(label)}</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#111">${val}</td></tr>`
  const list = (items) => `<ul style="margin:8px 0 0;padding-left:18px;color:#333">${(items || []).map((i) => `<li style="margin:4px 0">${esc(typeof i === 'string' ? i : (i.benefit || i.category || JSON.stringify(i)))}</li>`).join('')}</ul>`

  if (tool === 'cost_estimator') {
    return `
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Estimated cost', `${money(r.totalCostMin, sym)} – ${money(r.totalCostMax, sym)}`)}
        ${row('Timeline', esc(r.timeline))}
        ${row('Complexity', esc(r.complexity))}
      </table>
      <h3 style="font-size:14px;margin:20px 0 6px">Recommendations</h3>${list(r.recommendations)}`
  }
  if (tool === 'roi_calculator') {
    return `
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Revenue lost / month', money(r.monthlyRevenueLost, sym))}
        ${row('Revenue lost / year', money(r.annualRevenueLost, sym))}
        ${row('Annual ROI', `${esc(r.roiPercent)}%`)}
        ${row('Payback period', `${esc(r.paybackPeriodMonths)} months`)}
      </table>
      <h3 style="font-size:14px;margin:20px 0 6px">Key insights</h3>${list(r.keyInsights)}`
  }
  if (tool === 'timeline_calculator') {
    const total = r.totalWeeksMin != null ? `${r.totalWeeksMin}–${r.totalWeeksMax} weeks` : (r.totalDuration || r.timeline)
    return `
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Total duration', esc(total))}
      </table>
      <h3 style="font-size:14px;margin:20px 0 6px">Phases</h3>${list((r.phases || []).map((p) => p.name || p.phase))}`
  }
  if (tool === 'tech_recommender') {
    const s = r.recommendedStack || {}
    return `
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${s.frontend ? row('Frontend', esc(s.frontend)) : ''}
        ${s.backend ? row('Backend', esc(s.backend)) : ''}
        ${s.database ? row('Database', esc(s.database)) : ''}
        ${s.hosting ? row('Hosting', esc(s.hosting)) : ''}
      </table>
      ${r.whyThisStack ? `<p style="font-size:13px;color:#444;margin-top:14px">${esc(r.whyThisStack)}</p>` : ''}`
  }
  return '<p>Your result is ready.</p>'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { shareId, email } = req.body || {}
  if (!shareId || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'Missing share id or valid email' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { data: rowData, error } = await supabase
      .from('tool_results').select('*').eq('share_id', shareId).maybeSingle()
    if (error || !rowData) return res.status(404).json({ error: 'Result not found' })

    const tool = rowData.tool
    const label = TOOL_LABELS[tool] || 'Result'
    // Hardcoded — never reflect a caller-controlled Origin header into an email we send.
    const shareUrl = `https://www.vikku.in/r/${shareId}`

    // Also record the email against the result + subscribers list
    await supabase.from('tool_results').update({ email: email.trim().toLowerCase() }).eq('share_id', shareId)
    await supabase.from('subscribers').upsert(
      { email: email.trim().toLowerCase(), source: tool },
      { onConflict: 'email', ignoreDuplicates: true }
    )

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;margin:0 0 4px">Your ${esc(label)}</h1>
        <p style="color:#666;font-size:13px;margin:0 0 20px">From Vikku — here's the summary you generated.</p>
        <div style="border:1px solid #eee;border-radius:12px;padding:20px">${renderBody(tool, rowData.result || {})}</div>
        <a href="${shareUrl}" style="display:inline-block;margin-top:20px;color:#111;text-decoration:none;padding:11px 20px;border:1px solid #ddd;border-radius:10px;font-weight:600;font-size:14px">View full report &amp; download PDF</a>
        <div style="margin-top:28px;padding:20px;background:#faf8ff;border:1px solid #e7defb;border-radius:12px">
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111">Want this built — for a fixed price?</p>
          <p style="margin:0 0 14px;font-size:13px;color:#555">Book a free 30-minute scoping call and we'll turn this into a fixed-price plan with scope, timeline, and deliverables.</p>
          <a href="https://www.vikku.in/#contact" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px">Book a free scoping call</a>
        </div>
        <p style="color:#999;font-size:12px;margin-top:24px">Or just reply to this email — a real person reads it.</p>
      </div>`

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Vikku <hello@vikku.in>',
        to: [email.trim().toLowerCase()],
        subject: `Your ${label} from Vikku`,
        html,
      }),
    })
    if (!resendRes.ok) {
      const detail = await resendRes.text()
      console.error('Resend error:', resendRes.status, detail)
      return res.status(502).json({ error: 'Email provider rejected the request' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('send-tool-result error:', err)
    return res.status(500).json({ error: 'Failed to send result' })
  }
}
