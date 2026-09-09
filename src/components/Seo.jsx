import { useEffect } from 'react'

const SITE = 'https://www.vikku.in'
const DEFAULT_OG = `${SITE}/og-image.png`

function setMeta(attr, key, content) {
  if (!content) return null
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  const created = !el
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  const prev = el.getAttribute('content')
  el.setAttribute('content', content)
  return { el, created, prev }
}

/**
 * Per-route SEO for the SPA: sets a unique <title>, meta description, canonical,
 * Open Graph / Twitter tags, and optional JSON-LD structured data - then restores
 * the previous values on unmount so routes don't bleed into each other.
 */
export default function Seo({ title, description, canonical, image = DEFAULT_OG, jsonLd }) {
  useEffect(() => {
    const prevTitle = document.title
    if (title) document.title = title

    const url = canonical ? (canonical.startsWith('http') ? canonical : `${SITE}${canonical}`) : null
    const touched = [
      setMeta('name', 'description', description),
      setMeta('property', 'og:title', title),
      setMeta('property', 'og:description', description),
      setMeta('property', 'og:url', url),
      setMeta('property', 'og:image', image),
      setMeta('name', 'twitter:title', title),
      setMeta('name', 'twitter:description', description),
      setMeta('name', 'twitter:image', image),
    ].filter(Boolean)

    // Canonical link
    let canonEl = document.head.querySelector('link[rel="canonical"]')
    const prevCanon = canonEl?.getAttribute('href') ?? null
    if (url) {
      if (!canonEl) { canonEl = document.createElement('link'); canonEl.setAttribute('rel', 'canonical'); document.head.appendChild(canonEl) }
      canonEl.setAttribute('href', url)
    }

    // JSON-LD structured data
    let ldEl = null
    if (jsonLd) {
      ldEl = document.createElement('script')
      ldEl.type = 'application/ld+json'
      ldEl.setAttribute('data-seo', 'route')
      ldEl.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(ldEl)
    }

    document.documentElement.setAttribute('data-seo-ready', 'true')

    return () => {
      document.title = prevTitle
      touched.forEach(({ el, created, prev }) => {
        if (created) el.remove()
        else if (prev != null) el.setAttribute('content', prev)
      })
      if (canonEl && prevCanon != null) canonEl.setAttribute('href', prevCanon)
      if (ldEl) ldEl.remove()
    }
  }, [title, description, canonical, image, jsonLd])

  return null
}
