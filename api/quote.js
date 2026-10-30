import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { TOKEN_RE, publicQuote, respondError } from './_quote.js'
import { esc } from './_crm.js'

// Public quotation page (vikku.in/q/<token>).
//   GET  /api/quote?token=…                       -> the quote as the client may see it
//   POST /api/quote { token, accept, name, note } -> accept or decline, then email us
// The token is the quote's random share_token; the database work is crm_respond_to_quote
// (supabase/migrations/20261102_crm_quote_accept.sql), callable only with the service role.

const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const money = (n, c) => new Intl.NumberFormat(c === 'USD' ? 'en-US' : 'en-IN', { style: 'currency', currency: c || 'INR', maximumFractionDigits: 2 }).format(Number(n) || 0)

async function loadQuote(token) {
  const { data: d, error } = await supabase.from('crm_documents').select('*').eq('share_token', token).maybeSingle()
  if (error) throw error
  if (!d) return { d: null }
  const table = d.client_id ? 'crm_clients' : 'crm_leads'
  const { data: party } = await supabase.from(table).select('name, company').eq('id', d.client_id || d.lead_id).maybeSingle()
  return { d, party }
}

async function notify(d, result, name, note) {
  if (!process.env.RESEND_API_KEY) return
  const accepted = result.status === 'accepted'
  const to = (process.env.CRM_DIGEST_TO || 'connect@vikku.in').split(',').map(s => s.trim()).filter(Boolean)
  const subject = `${d.number} ${accepted ? 'accepted' : 'declined'}${name ? ` by ${name}` : ''} · ${money(d.total, d.currency)}`
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;color:#0f172a">
<h2 style="margin:0 0 6px">${accepted ? 'Quotation accepted' : 'Quotation declined'}</h2>
<p style="margin:0 0 16px;color:#64748b">${esc(d.number)} · ${esc(d.title)} · ${esc(money(d.total, d.currency))}</p>
${name ? `<p style="margin:0 0 8px"><b>${accepted ? 'Accepted' : 'Answered'} by:</b> ${esc(name)}</p>` : ''}
${note ? `<p style="margin:0 0 8px"><b>${accepted ? 'Note' : 'Reason'}:</b> ${esc(note)}</p>` : ''}
${accepted ? '<p style="margin:0 0 8px;color:#64748b">The client and a new CRM project were created automatically.</p>' : ''}
<p style="margin:24px 0 0"><a href="https://www.vikku.in/admin/crm/quotes" style="background:#ea580c;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Open quotations</a></p></div>`
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: 'Vikku CRM <noreply@vikku.in>', to, subject, html })
  if (error) console.error('quote notify failed:', error)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'GET') {
      const token = String(req.query?.token || '')
      if (!TOKEN_RE.test(token)) return res.status(404).json({ error: 'This quotation link is not valid.' })
      const { d, party } = await loadQuote(token)
      const q = publicQuote(d, party)
      return q ? res.status(200).json(q) : res.status(404).json({ error: 'This quotation link is not valid.' })
    }

    if (req.method === 'POST') {
      const { token, accept, name, note, website } = req.body || {}
      if (website) return res.status(200).json({ status: 'ignored' }) // hidden trap field
      if (!TOKEN_RE.test(String(token || ''))) return res.status(404).json({ error: 'This quotation link is not valid.' })
      const { data: result, error } = await supabase.rpc('crm_respond_to_quote', {
        p_token: token, p_accept: !!accept, p_name: String(name || ''), p_note: String(note || ''),
      })
      if (error) { const [code, message] = respondError(error); return res.status(code).json({ error: message }) }
      if (!result.already) {
        const { d } = await loadQuote(token)
        await notify(d, result, String(name || '').trim(), String(note || '').trim())
      }
      return res.status(200).json({ status: result.status, already: !!result.already })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('quote api error:', err)
    const [code, message] = respondError(err)
    return res.status(code).json({ error: message })
  }
}
