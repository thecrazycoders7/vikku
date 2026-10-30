// Build guard. Only real pages are served: vercel.json sends app routes to the SPA shell, the
// sitemap's pages are prerendered, and everything else gets a true 404 (public/404.html). A new
// <Route> that's in neither list would 404 in production, so fail the build instead.
import { readFileSync } from 'node:fs'

const app = readFileSync('src/App.jsx', 'utf8')
const routes = [...app.matchAll(/<Route path="([^"]+)"/g)].map(m => m[1]).filter(p => p !== '*')
const sitemap = new Set([...readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>https:\/\/www\.vikku\.in(.*?)<\/loc>/g)].map(m => m[1] || '/'))
const rewrites = JSON.parse(readFileSync('vercel.json', 'utf8')).rewrites
  .map(r => new RegExp('^' + r.source.replace(/:\w+/g, '[^/]+') + '$'))

const sample = (route) => route.replace(/:\w+/g, 'x')
const missing = routes.filter(r => !sitemap.has(r) && !rewrites.some(re => re.test(sample(r))))
if (missing.length) {
  console.error(`These routes would 404 in production. Add them to vercel.json rewrites or the sitemap:\n  ${missing.join('\n  ')}`)
  process.exit(1)
}
console.log(`routes ok: ${routes.length} covered`)
