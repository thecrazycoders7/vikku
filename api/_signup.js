// Bot checks for website sign-ups (footer newsletter, free-tool "email me the result"). Used by
// api/subscribe.js and api/send-tool-result.js; tested by api/_signup.test.mjs.
// Every sign-up becomes a CRM lead, so junk is stopped here rather than cleaned up later.

// Sources the site actually sends; anything else is stored as 'footer'.
export const SOURCES = ['footer', 'roi_calculator', 'cost_estimator', 'timeline_calculator', 'tech_recommender', 'ai_visibility_score', 'project_estimator', 'business_impact', 'maintenance']

// Throwaway inbox providers. ponytail: a short list of the common ones; extend if junk still gets through.
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com', '10minutemail.com', '10minutemail.net',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmailo.com', 'throwawaymail.com', 'yopmail.com', 'yopmail.net',
  'getnada.com', 'nada.email', 'dispostable.com', 'trashmail.com', 'trashmail.de', 'maildrop.cc', 'mailnesia.com',
  'fakeinbox.com', 'emailondeck.com', 'mohmal.com', 'mintemail.com', 'spamgourmet.com', 'tempinbox.com', 'mailcatch.com',
  'moakt.com', 'tmail.ws', 'tmpmail.org', 'tmpmail.net', 'burnermail.io', 'inboxkitten.com', 'mailpoof.com', 'mytemp.email',
])

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[a-z]{2,24}$/i
const MIN_FILL_MS = 1500 // people take longer than this to type an email and click

// -> { ok: true, email } | { ok: false, silent: true } (bot: pretend it worked) | { ok: false, error } (tell the person)
export function checkSignup({ email, website, elapsedMs }) {
  if (website) return { ok: false, silent: true }                                    // hidden trap field was filled
  if (elapsedMs != null && Number(elapsedMs) >= 0 && Number(elapsedMs) < MIN_FILL_MS) return { ok: false, silent: true }
  const clean = String(email || '').trim().toLowerCase()
  if (clean.length > 254 || !EMAIL_RE.test(clean)) return { ok: false, error: 'Please enter a valid email address.' }
  const domain = clean.split('@')[1]
  if (DISPOSABLE.has(domain) || [...DISPOSABLE].some(d => domain.endsWith('.' + d))) {
    return { ok: false, error: 'Please use your regular email address, not a temporary one.' }
  }
  return { ok: true, email: clean }
}
