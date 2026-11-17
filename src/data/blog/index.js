import { WEEK1 } from './week1.js'
import { WEEK2 } from './week2.js'
import { WEEK3 } from './week3.js'
import { WEEK4 } from './week4.js'

// The Vikku Labs blog: practical guides for Indian business owners, written by the founder.
// Also read at build time by scripts/llms.mjs. Plain data only, so Node can import it.
export const AUTHOR = {
  name: 'Harsha Vardhan Reddy Sanikommu',
  role: 'Founder, Vikku Labs',
  url: 'https://www.linkedin.com/in/harsha-vardhan-reddy-sanikommu/',
}
export const CATEGORIES = ['Buying decisions', 'AI reality check', 'Operations and money', 'Partners and scale', 'Perspective']
export const POSTS = [...WEEK1, ...WEEK2, ...WEEK3, ...WEEK4]
export const postBySlug = (slug) => POSTS.find(p => p.slug === slug)

// Same category first, then the next posts in order, so every article links to three others.
export function relatedPosts(post, count = 3) {
  const others = POSTS.filter(p => p !== post)
  const same = others.filter(p => p.category === post.category)
  const after = others.filter(p => p.day > post.day && p.category !== post.category)
  return [...same, ...after, ...others].filter((p, i, all) => all.indexOf(p) === i).slice(0, count)
}
