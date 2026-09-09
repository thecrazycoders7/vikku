import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { preview } from 'vite'
import puppeteer from 'puppeteer'

const ASSET_RE = /\/assets\/[^"']+\.(?:js|css)/g

async function getRoutes() {
  const xml = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
}

async function main() {
  const routes = await getRoutes()

  const originalIndexHtml = await readFile('dist/index.html', 'utf8')
  const expectedAssets = new Set(originalIndexHtml.match(ASSET_RE) ?? [])

  const server = await preview({ preview: { port: 4173, strictPort: true } })
  const base = server.resolvedUrls.local[0]

  const browser = await puppeteer.launch({ headless: 'new' })

  try {
    for (const route of routes) {
      const page = await browser.newPage()
      try {
        await page.goto(base + route.slice(1), { waitUntil: 'networkidle0' })
        await page.waitForSelector('html[data-seo-ready="true"]', { timeout: 10000 })
        const html = await page.content()

        const missing = [...expectedAssets].filter((asset) => !html.includes(asset))
        if (missing.length) {
          throw new Error(`Prerendered ${route} is missing expected asset(s): ${missing.join(', ')}`)
        }

        const outPath = route === '/'
          ? path.join('dist', 'index.html')
          : path.join('dist', route, 'index.html')
        await mkdir(path.dirname(outPath), { recursive: true })
        await writeFile(outPath, html)
        console.log(`prerendered ${route} -> ${outPath}`)
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
    await new Promise((resolve, reject) => {
      server.httpServer.close((err) => (err ? reject(err) : resolve()))
    })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
