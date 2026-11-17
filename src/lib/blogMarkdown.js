// A small, safe article format for the blog (src/data/blog). Nothing here becomes raw HTML, so posts can't
// inject markup. Supports: ## and ### headings, paragraphs, - lists, 1. lists, > callouts, | tables |,
// **bold** and [links](/path). Tested by blogMarkdown.test.mjs.
export function inline(text) {
  const out = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0, m
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) })
    out.push(m[1] ? { text: m[1], bold: true } : { text: m[2], href: m[3] })
    last = re.lastIndex
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}

export function parseArticle(body) {
  const lines = body.trim().split('\n')
  const blocks = []
  let i = 0
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
  while (i < lines.length) {
    const l = lines[i].trim()
    if (!l) { i++; continue }
    if (l.startsWith('### ')) { blocks.push({ type: 'h3', text: l.slice(4) }); i++; continue }
    if (l.startsWith('## ')) { blocks.push({ type: 'h2', text: l.slice(3) }); i++; continue }
    if (l.startsWith('> ')) { blocks.push({ type: 'callout', parts: inline(l.slice(2)) }); i++; continue }
    if (l.startsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const r = cells(lines[i])
        if (!r.every(c => /^:?-+:?$/.test(c))) rows.push(r.map(inline))
        i++
      }
      blocks.push({ type: 'table', head: rows[0], rows: rows.slice(1) })
      continue
    }
    const list = l.startsWith('- ') ? 'ul' : /^\d+\. /.test(l) ? 'ol' : null
    if (list) {
      const items = []
      while (i < lines.length && (list === 'ul' ? lines[i].trim().startsWith('- ') : /^\d+\. /.test(lines[i].trim()))) {
        items.push(inline(lines[i].trim().replace(/^(- |\d+\. )/, '')))
        i++
      }
      blocks.push({ type: list, items })
      continue
    }
    const para = []
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |> |\||- |\d+\. )/.test(lines[i].trim())) para.push(lines[i].trim()), i++
    blocks.push({ type: 'p', parts: inline(para.join(' ')) })
  }
  return blocks
}

export const plainText = (body) => body.replace(/\*\*|\[|\]\([^)]*\)|^#+ |^> |^- |^\d+\. |\|/gm, ' ')
export const readMinutes = (post) => Math.max(1, Math.round([post.summary, post.body, ...post.faqs.map(f => f.q + ' ' + f.a)].join(' ').split(/\s+/).length / 200))
