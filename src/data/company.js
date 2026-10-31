// Company facts shared by the homepage, /about and /work, so they can't drift apart.
// Keep claims honest: everything here must be true and checkable.

export const STATS = [
  ['9', 'Projects delivered'],
  ['8+', 'Clients'],
  ['IN · US', 'Clients across India and the USA'],
]

export const WHY_VIKKU = [
  ['AI with a business purpose', 'We solve real operational problems instead of adding AI for appearances.'],
  ['Built around your workflows', 'Designed around how you already work, and the systems you already use.'],
  ['Engineering beyond the demo', 'Reliability, testing, security and maintainability come first.'],
  ['Human oversight where it matters', 'Approvals, permissions and escalation are part of the design.'],
  ['One partner, idea to deployment', 'Discovery, architecture, build, integration and ongoing support.'],
  ['Built for your business', 'Shaped to your requirements, not one product forced on every client.'],
]

export const AI_PRODUCTS = [
  { name: 'AI Project Planner', desc: 'Describe a project in Vikku PM and the AI drafts a realistic task and milestone plan.', to: '/pm' },
  { name: 'AI Visibility Score', desc: 'Checks whether AI assistants like ChatGPT can find and read your website, then scores it and lists the fixes.', to: '/tools/ai-visibility-score' },
  { name: 'AI summaries with guardrails', desc: 'In the Project Estimator and Business Impact tools, our models do the maths and the AI explains the result. It is not allowed to change the numbers.', to: '/tools/project-estimator' },
  { name: 'AI Maintenance Calculator', desc: 'Breaks down the monthly cost of running a product: hosting, monitoring, security, fixes and support.', to: '/tools/maintenance' },
]

export const CLIENT_WORK = [
  { name: 'TapByWisein', url: 'https://www.tapbywisein.com/', desc: 'NFC networking platform' },
  { name: 'Unisys Infotech', url: 'https://www.unisysinfotech.com/', desc: 'IT solutions and services', note: 'Replaced Excel and WhatsApp workflows with one central app' },
  { name: 'Jobly Solutions', url: 'https://www.joblysolutions.com/', desc: 'Recruitment and staffing', note: 'Replaced Excel and WhatsApp workflows with one central app', caseStudy: '/work/jobly-solutions' },
  { name: 'Media Manager 4U', url: 'https://www.mediamanager4u.com/#/', desc: 'Media management platform', note: 'Reported growth from 0 to 6 paying clients' },
  { name: 'Rolex Ads', url: 'https://www.rolexads.in/', desc: 'Advertising and marketing', note: 'Reported a 4× increase in leads' },
  { name: 'Nivi Collections', url: 'https://www.nivicollections.com/', desc: 'Fashion and collections' },
]

export const TESTIMONIALS = [
  { quote: "Our leads literally 4x'd within a few months of launching. Clients now come to us.", name: 'Rahamath Thullaa', role: 'Founder, Rolex Ads' },
  { quote: 'We went from zero to 6 paying clients within months of our website going live.', name: 'Mohan Manjunath Reddy', role: 'Co-founder, Media Manager 4U' },
  { quote: 'Vikku took our entire staffing workflow from WhatsApp groups and Excel sheets into a proper platform.', name: 'Jagan', role: 'Director, Jobly Solutions' },
  { quote: "Now we're getting enquiries directly from our website every week, from people who found us on Google.", name: 'Sainath', role: 'Owner, HSO CCTV' },
]

export const FOUNDER = {
  name: 'Harsha Vardhan Reddy Sanikommu',
  role: 'Founder, Vikku Labs',
  photo: '/home3d/founder-harsha.jpg',
  linkedin: 'https://www.linkedin.com/in/harsha-vardhan-reddy-sanikommu/',
  bio: [
    "I'm Harsha Vardhan Reddy Sanikommu, Founder of Vikku Labs — an AI agency helping businesses solve real-world problems through artificial intelligence, intelligent automation, and digital innovation.",
    'I started Vikku Labs with a simple belief: technology should do more than just work. It should solve meaningful problems, eliminate inefficiencies, and create opportunities for businesses to grow.',
    "Over the past few years, I've worked on 9 real-world projects across India and the USA, collaborating directly with businesses to understand their challenges, develop practical solutions, and turn ideas into reality.",
    'As the founder of Vikku Labs, I focus on identifying opportunities where AI can make a genuine difference—from automating repetitive operations and building AI-powered workflows to developing intelligent applications that help businesses work smarter.',
    'My approach combines technical expertise with business thinking. Rather than adopting technology for the sake of innovation, I believe in finding the right problems to solve and delivering solutions that create measurable value.',
  ],
  vision: [
    'I believe AI is changing how businesses operate, compete, and grow. My vision for Vikku Labs is to help businesses move beyond experimenting with AI and start using it to solve meaningful problems.',
    "I'm passionate about building, experimenting, and working alongside ambitious businesses to turn complex challenges into intelligent solutions.",
    "For me, Vikku Labs is about more than technology. It's about creating impact, building meaningful partnerships, and helping businesses unlock what's possible with AI.",
  ],
}
