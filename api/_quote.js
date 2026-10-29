// Pure helpers for api/quote.js (public quotation page). Tested by api/_quote.test.mjs.

export const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// What the client may see: no internal ids, links or CRM notes. Drafts are never shown.
export function publicQuote(d, party) {
  if (!d || !['sent', 'accepted', 'declined'].includes(d.status)) return null
  return {
    number: d.number, title: d.title, currency: d.currency, created_at: d.created_at,
    items: (d.items || []).map(i => ({ description: i.description, qty: Number(i.qty) || 0, rate: Number(i.rate) || 0 })),
    tax_percent: Number(d.tax_percent) || 0, discount: Number(d.discount) || 0, total: Number(d.total) || 0,
    valid_until: d.valid_until, status: d.status, notes: d.notes, terms: d.terms,
    responded_at: d.responded_at, response_name: d.response_name,
    party: party ? { name: party.name, company: party.company || null } : null,
  }
}

// Database refusals from crm_respond_to_quote -> HTTP status + message for the client.
export function respondError(err) {
  const m = err?.message || ''
  if (err?.code === 'P0002' || /not found/.test(m)) return [404, 'This quotation link is not valid.']
  if (/expired/.test(m)) return [409, 'This quotation has expired. Please contact us for an updated quote.']
  if (/not open/.test(m)) return [409, 'This quotation is not open for a response.']
  if (/name required/.test(m)) return [400, 'Please type your full name to accept.']
  return [500, 'Something went wrong. Please try again or email connect@vikku.in.']
}
