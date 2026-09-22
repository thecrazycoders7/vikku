// Loads Google Analytics + Microsoft Clarity — ONLY after cookie consent.
// Never on localhost, and never twice.
let loaded = false

export const CONSENT_KEY = 'vikku_cookie_consent' // 'accepted' | 'declined'

export function getConsent() {
  try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}
export function setConsent(v) {
  try { localStorage.setItem(CONSENT_KEY, v) } catch { /* ignore */ }
}

export function loadAnalytics() {
  if (loaded) return
  if (['localhost', '127.0.0.1'].includes(location.hostname)) return
  loaded = true

  // Google Analytics
  const ga = document.createElement('script')
  ga.async = true
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-VFDQ5CD808'
  document.head.appendChild(ga)
  window.gtag('js', new Date())
  window.gtag('config', 'G-VFDQ5CD808')

  // Microsoft Clarity
  ;(function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) }
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y)
  })(window, document, 'clarity', 'script', 'x0ejzzii5h')
}
