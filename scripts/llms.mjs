// Writes dist/llms.txt (https://llmstxt.org): a plain summary of Vikku Labs and links to every page and
// blog post, so AI assistants can understand and cite the site. Runs after the build; the blog list
// comes from src/data/blog, so new posts are included automatically.
import { writeFile } from 'node:fs/promises'
import { POSTS, CATEGORIES } from '../src/data/blog/index.js'

const SITE = 'https://www.vikku.in'
const link = (title, path, note) => `- [${title}](${SITE}${path})${note ? `: ${note}` : ''}`
const lines = [
  '# Vikku Labs',
  '',
  '> Vikku Labs is an AI software agency in Hyderabad, India. It builds AI agents, AI voice agents, business automation and custom AI-powered software for businesses in India and the USA. Founded by Harsha Vardhan Reddy Sanikommu.',
  '',
  'Contact: connect@vikku.in, +91 93939 79892.',
  '',
  '## Company',
  link('About Vikku Labs', '/about', 'founder, approach and why clients choose us'),
  link('Our work', '/work', 'AI products in production and client projects'),
  link('Jobly Solutions case study', '/work/jobly-solutions', 'moving a US staffing company from WhatsApp and Excel to one platform'),
  '',
  '## Services',
  link('AI agents', '/ai-agents'),
  link('AI automation', '/ai-automation'),
  link('AI integration', '/ai-integration'),
  link('AI software development', '/ai-software-development'),
  link('AI voice agents and chatbots', '/ai-voice-agents'),
  '',
  '## Products',
  link('Vikku AI receptionist for hospitals', '/products/hospital-receptionist', 'answers calls in Telugu, English and Hindi; in testing'),
  link('Harsha Farms', '/products/harsha-farms', 'dairy subscription and delivery app; pre-launch'),
  link('Restaurant management system', '/products/restaurant-management-system', 'POS, kitchen display, recipes and food cost, stock and delivery for Indian restaurants; front-end demo'),
  '',
  '## Free tools',
  link('Project Estimator', '/tools/project-estimator', 'software and app cost ranges in India'),
  link('Business Impact calculator', '/tools/business-impact', 'ROI of software and automation'),
  link('Timeline Calculator', '/tools/timeline'),
  link('Tech Stack Recommender', '/tools/stack-recommender'),
  link('Maintenance Calculator', '/tools/maintenance', 'yearly software running costs'),
  link('AI Visibility Score', '/tools/ai-visibility-score', 'can ChatGPT find and read your website'),
  '',
  ...CATEGORIES.flatMap(c => [`## Blog: ${c}`, ...POSTS.filter(p => p.category === c).map(p => link(p.title, `/blog/${p.slug}`, p.summary)), '']),
]
await writeFile(new URL('../dist/llms.txt', import.meta.url), lines.join('\n'))
console.log(`llms.txt: ${POSTS.length} posts`)
