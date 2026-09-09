import { useEffect } from 'react'

export default function usePageMeta({ title, description, url }) {
  useEffect(() => {
    document.title = title

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
    setMeta('meta[property="og:url"]',          url)
    setMeta('meta[name="twitter:title"]',       title)
    setMeta('meta[name="twitter:description"]', description)

    document.documentElement.setAttribute('data-seo-ready', 'true')

    return () => {
      document.title = 'Vikku - Software & Tech Agency | Web Apps, Platforms & Digital Products'
    }
  }, [title, description, url])
}
