import { useEffect } from 'react'

// vikku.in redirects to www.vikku.in, so canonical and og:url always use the www host.
const toCanonical = (url) => url?.replace(/^https?:\/\/vikku\.in/, 'https://www.vikku.in')

export default function usePageMeta({ title, description, url }) {
  useEffect(() => {
    document.title = title
    const href = toCanonical(url)

    const setMeta = (selector, content) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const [attr, val] = selector.match(/\[(.+?)="(.+?)"\]/).slice(1)
        el.setAttribute(attr, val)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('meta[name="description"]',         description)
    setMeta('meta[property="og:title"]',        title)
    setMeta('meta[property="og:description"]',  description)
    setMeta('meta[property="og:url"]',          href)
    setMeta('meta[name="twitter:title"]',       title)
    setMeta('meta[name="twitter:description"]', description)

    // Each page is its own canonical; without this it inherited the homepage's from index.html.
    let canon = document.head.querySelector('link[rel="canonical"]')
    const prevCanon = canon?.getAttribute('href') ?? null
    if (href) {
      if (!canon) { canon = document.createElement('link'); canon.setAttribute('rel', 'canonical'); document.head.appendChild(canon) }
      canon.setAttribute('href', href)
    }

    document.documentElement.setAttribute('data-seo-ready', 'true')

    return () => {
      document.title = 'Vikku Labs | AI Agency for AI Agents, Business Automation & AI Software'
      if (canon && prevCanon != null) canon.setAttribute('href', prevCanon)
    }
  }, [title, description, url])
}
