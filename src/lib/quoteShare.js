// Public quotation page (src/pages/QuoteView.jsx) <-> api/quote.js.
async function call(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong. Please try again.'), { status: res.status })
  return data
}
export const getSharedQuote = (token) => fetch(`/api/quote?token=${encodeURIComponent(token)}`).then(call)
export const respondToQuote = (body) => fetch('/api/quote', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
}).then(call)
export const quoteLink = (token) => `https://www.vikku.in/q/${token}`
