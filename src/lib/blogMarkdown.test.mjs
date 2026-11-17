import assert from 'node:assert/strict'
import { inline, parseArticle, readMinutes } from './blogMarkdown.js'
import { POSTS, postBySlug, relatedPosts } from '../data/blog/index.js'

assert.deepEqual(inline('Use **one** [tool](/tools/timeline) now'), [
  { text: 'Use ' }, { text: 'one', bold: true }, { text: ' ' }, { text: 'tool', href: '/tools/timeline' }, { text: ' now' },
])
const b = parseArticle(`## Head
First line
continues here.

- a
- b

1. one
2. two

> Note **this**

| A | B |
| --- | --- |
| 1 | 2 |
### Sub`)
assert.deepEqual(b.map(x => x.type), ['h2', 'p', 'ul', 'ol', 'callout', 'table', 'h3'])
assert.equal(b[1].parts[0].text, 'First line continues here.')
assert.equal(b[5].rows.length, 1)
assert.ok(!JSON.stringify(parseArticle('<script>alert(1)</script>')).includes('"html"'), 'no raw HTML path')

assert.equal(POSTS.length, 30)
const slugs = new Set(POSTS.map(p => p.slug))
assert.equal(slugs.size, 30, 'slugs are unique')
for (const p of POSTS) {
  assert.match(p.slug, /^[a-z0-9-]+$/, p.slug)
  for (const k of ['title', 'description', 'summary', 'body', 'category']) assert.ok(p[k], `${p.slug} ${k}`)
  assert.ok(p.description.length <= 165, `${p.slug} description ${p.description.length} chars`)
  assert.ok(p.takeaways.length >= 3 && p.faqs.length >= 3, `${p.slug} takeaways/faqs`)
  assert.ok(readMinutes(p) >= 2, `${p.slug} is too short`)
  for (const blk of parseArticle(p.body)) for (const part of (blk.parts || blk.items?.flat() || [])) {
    if (part.href) assert.ok(part.href.startsWith('/'), `${p.slug} links off-site: ${part.href}`)
  }
}
assert.equal(postBySlug(POSTS[0].slug), POSTS[0])
assert.equal(relatedPosts(POSTS[0]).length, 3)
assert.ok(!relatedPosts(POSTS[0]).includes(POSTS[0]))
console.log('blog: all checks passed')
