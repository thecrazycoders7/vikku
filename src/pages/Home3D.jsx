import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { CAL_ATTRS } from '../lib/cal'
import { toolLinks } from '../components/Navbar'
import Footer from '../components/Footer'
import usePageMeta from '../hooks/usePageMeta'
import './home3d.css'

const sections = [
  { id: 'about', label: 'About' },
]
const rooms = ['Entrance', 'Lobby', 'AI lab', 'Industries', 'Process wall', 'Client lounge', "Founder's office"]
const roomIds = ['top', 'about', 'services', 'industries', 'process', 'work', 'contact']

function BookButton({ className = '', short = 'Book a call' }) {
  return (
    <button type="button" {...CAL_ATTRS} className={`btn btn-primary ${className}`}>
      <span className="cta-long">Book an AI Discovery Call</span>
      <span className="cta-short">{short}</span>
    </button>
  )
}

// Copy to clipboard where allowed, otherwise select the text for a manual copy.
async function copyText(text, el, button, label) {
  try { await navigator.clipboard.writeText(text); button.textContent = 'Copied' }
  catch { getSelection().selectAllChildren(el); button.textContent = 'Selected' }
  setTimeout(() => { button.textContent = label }, 1800)
}

function HomeNav() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [toolsOpen, setToolsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setToolsOpen(false); setMenuOpen(false) } }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  const go = (path) => { setToolsOpen(false); setMenuOpen(false); navigate(path) }
  const auth = user ? (
    <div className="auth">
      <button type="button" className="nav-link" onClick={() => go('/dashboard')}>Dashboard</button>
      <button type="button" className="nav-link" onClick={async () => { await signOut(); setMenuOpen(false) }}>Sign out</button>
    </div>
  ) : (
    <div className="auth">
      <button type="button" className="nav-link" onClick={() => go('/login')}>Sign in</button>
      <button type="button" className="nav-link" onClick={() => go('/signup')}>Sign up</button>
    </div>
  )

  return (
    <>
    <header className="top">
      <div className="top-inner">
        <a className="logo" href="#top" onClick={() => setMenuOpen(false)}><img className="logo-mark" src="/logo.png" alt="" />Vikku</a>
        <nav className="nav" aria-label="Main">
          <div className="nav-links">
            {sections.map(({ id, label }) => <a key={id} className="nav-link" href={`#${id}`}>{label}</a>)}
            <div className="tools" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button type="button" className="nav-link" aria-expanded={toolsOpen} onClick={() => setToolsOpen(!toolsOpen)}>
                Free tools <ChevronDown size={14} />
              </button>
              {toolsOpen && (
                <div className="tools-menu">
                  <div>{toolLinks.map(({ label, path }) => <button key={path} type="button" className="menu-item" onClick={() => go(path)}>{label}</button>)}</div>
                </div>
              )}
            </div>
          </div>
          {auth}
          <BookButton className="btn-sm" />
          <button type="button" className="menu-btn" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>
      <div className="progress" id="progress" />
    </header>
      {/* Outside the header: its backdrop-filter would trap a fixed child inside the 64px bar. */}
      {menuOpen && (
        <div className="mobile-menu">
          {sections.map(({ id, label }) => <a key={id} className="menu-item" href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="menu-item" href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <p className="label">Free tools</p>
          {toolLinks.map(({ label, path }) => <button key={path} type="button" className="menu-item" onClick={() => go(path)}>{label}</button>)}
          {auth}
        </div>
      )}
    </>
  )
}

export default function Home3D() {
  usePageMeta({
    title:       'Vikku | AI Agency for AI Agents, Business Automation & AI Software',
    description: 'Vikku is an AI agency that builds AI agents, business automation and AI-powered software for companies in India and the USA. Book an AI discovery call.',
    url:         'https://vikku.in/',
  })

  const canvasRef = useRef(null)
  const loadingRef = useRef(null)
  const emailRef = useRef(null)
  const [room, setRoom] = useState(0)

  // Scroll → story progress in [0,1]; each section's centre maps to t = i / (sections - 1).
  const story = useRef({ target: 0 }).current
  useEffect(() => {
    const bar = document.getElementById('progress')
    const secs = roomIds.map(id => document.getElementById(id))
    const update = () => {
      // ponytail: re-measured every scroll since fonts and resizes shift section heights; seven rects is cheap
      const max = document.documentElement.scrollHeight - innerHeight
      const stops = secs.map(s => s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2 - innerHeight / 2)
      const n = stops.length - 1
      stops[0] = 0
      stops[n] = Math.min(stops[n], max)
      let t = 1
      for (let i = 0; i < n; i++) if (scrollY <= stops[i + 1]) { t = (i + Math.max(0, (scrollY - stops[i]) / (stops[i + 1] - stops[i] || 1))) / n; break }
      story.target = t
      bar.style.width = t * 100 + '%'
      setRoom(Math.round(t * n))
    }
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    update()
    return () => {
      removeEventListener('scroll', update)
      removeEventListener('resize', update)
    }
  }, [story])

  // The 3D scene loads in its own chunk once the page is idle, and fades in over the poster when ready.
  // Skipped during the build's headless prerender and on data-saver, 2G or low-memory devices,
  // where the poster image stays as the backdrop. (Not 3G: Chrome's estimate often says 3G on fine desktop links.)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const net = navigator.connection
    const lite = net?.saveData || /2g/.test(net?.effectiveType || '') || (navigator.deviceMemory || 8) <= 2
    if (navigator.webdriver || lite) { loadingRef.current.hidden = true; return }
    let dispose = null
    let cancelled = false
    const start = () => import('../lib/studioScene').then(({ createStudio }) =>
      createStudio({ canvas: canvasRef.current, loadingEl: loadingRef.current, story, onReady: () => setReady(true) }))
      .then(d => { if (cancelled) d(); else dispose = d })
      .catch(() => { if (loadingRef.current) loadingRef.current.hidden = true })
    const idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300)
    return () => {
      cancelled = true
      window.cancelIdleCallback ? cancelIdleCallback(idle) : clearTimeout(idle)
      dispose?.()
    }
  }, [story])

  return (
    <>
      <div className="v3d">
        <canvas id="scene" ref={canvasRef} aria-hidden="true" />
        <div className={`poster${ready ? ' gone' : ''}`} aria-hidden="true" />
        <HomeNav />

        <div className="rooms">
          <p className="loading" ref={loadingRef}>Loading the studio…</p>
          <ol aria-label="Rooms">
            {rooms.map((r, i) => <li key={r} className={i === room ? 'on' : ''}><a href={`#${roomIds[i]}`}>{r}</a></li>)}
          </ol>
        </div>

        <main>
          <section className="stop hero" id="top">
            <div className="hero-copy">
              <h1>Less busywork. <em>More business.</em></h1>
              <p>We build AI agents and automations that take repetitive work off your team's plate, so you can spend your time on what grows the business.</p>
              <div className="ctas">
                <BookButton short="Book an AI Discovery Call" />
                <a className="btn btn-ghost" href="#work">Explore our work</a>
              </div>
              <ul className="trust" aria-label="Company figures">
                <li><b>9</b>Projects delivered</li>
                <li><b>8+</b>Clients</li>
                <li><b>IN · US</b>Clients across India and the USA</li>
              </ul>
              <p className="hint">Scroll to walk in <b>↓</b></p>
            </div>
          </section>

          <section className="stop right" id="about">
            <div className="panel wide">
              <p className="eyebrow">Lobby · Why Vikku</p>
              <h2>We turn complex business problems into <em>practical AI.</em></h2>
              <p>Vikku builds AI-powered products, intelligent agents, and business automation systems that help companies work smarter, operate faster, and scale efficiently.</p>
              <ul className="cards">
                <li><strong>AI with a business purpose</strong><span>We solve real operational problems instead of adding AI for appearances.</span></li>
                <li><strong>Built around your workflows</strong><span>Designed around how you already work, and the systems you already use.</span></li>
                <li><strong>Engineering beyond the demo</strong><span>Reliability, testing, security and maintainability come first.</span></li>
                <li><strong>Human oversight where it matters</strong><span>Approvals, permissions and escalation are part of the design.</span></li>
                <li><strong>One partner, idea to deployment</strong><span>Discovery, architecture, build, integration and ongoing support.</span></li>
                <li><strong>Built for your business</strong><span>Shaped to your requirements, not one product forced on every client.</span></li>
              </ul>
              <p className="note">We work with founders building AI products, growing businesses cutting manual work, established companies integrating AI, and international teams that need an engineering partner.</p>
            </div>
          </section>

          <section className="stop" id="services">
            <div className="panel wide">
              <p className="eyebrow">AI lab · AI solutions</p>
              <h2>Seven ways we put AI <em>to work</em></h2>
              <ul className="cards">
                <li><strong>AI agents</strong><span>Agents that handle inquiries, qualify leads, answer from internal knowledge, process documents and update your CRM, within the permissions and safeguards you set.</span></li>
                <li><strong>AI business automation</strong><span>Less manual work in lead management, onboarding, data entry, reporting and follow-ups. Where plain automation is more reliable than AI, we use it.</span></li>
                <li><strong>AI-powered software</strong><span>SaaS platforms, intelligent dashboards, document intelligence, search and AI-assisted portals with AI in the core workflow.</span></li>
                <li><strong>AI voice and conversation</strong><span>Inquiry handling, scheduling, FAQs and follow-ups by voice or chat, with verification and human escalation for sensitive actions.</span></li>
                <li><strong>AI integration</strong><span>LLM APIs, retrieval (RAG), document Q&amp;A, structured data extraction and model evaluation inside the apps you already run.</span></li>
                <li><strong>Custom software</strong><span>Web apps, dashboards, CRM, HR and staffing platforms, e-commerce, portals, mobile apps, APIs and cloud deployment: the foundation that makes AI reliable.</span></li>
                <li className="full"><strong>AI product consulting</strong><span>Opportunity assessment, workflow analysis, feasibility, proof of concept, MVP planning, architecture and roadmaps. We understand your requirements before we promise anything.</span></li>
              </ul>
            </div>
          </section>

          <section className="stop right" id="industries">
            <div className="panel wide">
              <p className="eyebrow">Industries</p>
              <h2>Where AI <em>earns its place</em></h2>
              <p>Solution areas we design for. They show how we apply AI, not a list of delivered projects.</p>
              <ul className="cards">
                <li><strong>Healthcare</strong><span>Appointment coordination, patient inquiry assistants, administrative automation, documentation help.</span><em>Patient privacy and clinical safeguards are built in.</em></li>
                <li><strong>Recruitment and staffing</strong><span>Resume and document processing, candidate workflows, job matching assistance, client reporting.</span></li>
                <li><strong>Retail and e-commerce</strong><span>Support automation, product information assistants, order inquiries, catalog enrichment, reporting.</span></li>
                <li><strong>Professional services</strong><span>Lead qualification, appointment coordination, proposal assistance, document processing, follow-ups.</span></li>
                <li><strong>Sales and marketing</strong><span>Lead routing, CRM automation, inquiry qualification, content workflows, campaign reporting.</span></li>
                <li><strong>Agriculture</strong><span>Crop information assistants, farmer support workflows, agricultural data applications.</span><em>Grounded in authoritative data, with uncertainty stated clearly.</em></li>
              </ul>
            </div>
          </section>

          <section className="stop right" id="process">
            <div className="panel wide">
              <p className="eyebrow">Process wall</p>
              <h2>From idea to a system that <em>keeps improving</em></h2>
              <ol className="cards">
                <li><strong><i>01</i> Discover</strong><span>Your problem, current workflows, systems and desired outcome. AI opportunities and feasibility.</span></li>
                <li><strong><i>02</i> Design</strong><span>Architecture, user flows, integrations, model selection, data, security and permissions.</span></li>
                <li><strong><i>03</i> Build</strong><span>Development, AI integration, workflow automation, testing, evaluation and human approvals.</span></li>
                <li><strong><i>04</i> Deploy</strong><span>Production launch, monitoring, documentation, user training and handover.</span></li>
                <li className="full"><strong><i>05</i> Improve</strong><span>Quality evaluation, failure analysis, cost optimisation, workflow improvements, maintenance and new features.</span></li>
              </ol>
              <p className="note">AI isn't finished at launch. Every system we ship is evaluated and monitored in real use.</p>
              <div className="stack">
                <p><b>AI and LLMs</b>OpenAI API, running GPT-4o in production in Vikku's own products</p>
                <p><b>Automation</b>API integrations, webhooks, scheduled jobs, transactional email</p>
                <p><b>Engineering</b>React, Next.js, TypeScript, Tailwind CSS, Node.js, Python, PostgreSQL, MongoDB, AWS, Vercel, Docker, React Native</p>
              </div>
            </div>
          </section>

          <section className="stop" id="work">
            <div className="panel wide">
              <p className="eyebrow">Client lounge · Work</p>
              <h2>Work you can <em>try today</em></h2>
              <h3>AI we've shipped</h3>
              <p>Vikku's own AI products, running GPT-4o in production behind rate-limited server functions. Try any of them free.</p>
              <ul className="cards">
                <li><strong>AI Project Planner</strong><span>Describe a project in Vikku PM and the AI drafts a realistic task and milestone plan.</span><Link className="try" to="/pm">Try it</Link></li>
                <li><strong>AI Visibility Score</strong><span>Checks whether AI assistants like ChatGPT can find and read your website, then scores it and lists the fixes.</span><Link className="try" to="/tools/ai-visibility-score">Try it</Link></li>
                <li><strong>AI summaries with guardrails</strong><span>In the Project Estimator and Business Impact tools, our models do the maths and the AI explains the result. It is not allowed to change the numbers.</span><Link className="try" to="/tools/project-estimator">Try it</Link></li>
                <li><strong>AI Maintenance Calculator</strong><span>Breaks down the monthly cost of running a product: hosting, monitoring, security, fixes and support.</span><Link className="try" to="/tools/maintenance">Try it</Link></li>
              </ul>
              <h3>Client engineering</h3>
              <p>Software we built for real businesses. These were not AI projects; they show the engineering foundation behind our AI work.</p>
              <ul className="cards">
                <li><strong><a href="https://www.tapbywisein.com/" target="_blank" rel="noopener noreferrer">TapByWisein</a></strong><span>NFC networking platform</span></li>
                <li><strong><a href="https://www.unisysinfotech.com/" target="_blank" rel="noopener noreferrer">Unisys Infotech</a></strong><span>IT solutions and services</span><em>Replaced Excel and WhatsApp workflows with one central app</em></li>
                <li><strong><a href="https://www.joblysolutions.com/" target="_blank" rel="noopener noreferrer">Jobly Solutions</a></strong><span>Recruitment and staffing</span><em>Replaced Excel and WhatsApp workflows with one central app</em></li>
                <li><strong><a href="https://www.mediamanager4u.com/#/" target="_blank" rel="noopener noreferrer">Media Manager 4U</a></strong><span>Media management platform</span><em>Reported growth from 0 to 6 paying clients</em></li>
                <li><strong><a href="https://www.rolexads.in/" target="_blank" rel="noopener noreferrer">Rolex Ads</a></strong><span>Advertising and marketing</span><em>Reported a 4× increase in leads</em></li>
                <li><strong><a href="https://www.nivicollections.com/" target="_blank" rel="noopener noreferrer">Nivi Collections</a></strong><span>Fashion and collections</span></li>
              </ul>
              <div className="quotes">
                <figure>
                  <blockquote>“Our leads literally 4x'd within a few months of launching. Clients now come to us.”</blockquote>
                  <figcaption><strong>Rahamath Thullaa</strong> · Founder, Rolex Ads</figcaption>
                </figure>
                <figure>
                  <blockquote>“We went from zero to 6 paying clients within months of our website going live.”</blockquote>
                  <figcaption><strong>Mohan Manjunath Reddy</strong> · Co-founder, Media Manager 4U</figcaption>
                </figure>
                <figure>
                  <blockquote>“Vikku took our entire staffing workflow from WhatsApp groups and Excel sheets into a proper platform.”</blockquote>
                  <figcaption><strong>Jagan</strong> · Director, Jobly Solutions</figcaption>
                </figure>
                <figure>
                  <blockquote>“Now we're getting enquiries directly from our website every week, from people who found us on Google.”</blockquote>
                  <figcaption><strong>Sainath</strong> · Owner, HSO CCTV</figcaption>
                </figure>
              </div>
            </div>
          </section>

          <section className="stop contact" id="contact">
            <div className="panel wide">
              <p className="eyebrow">Founder's office · About me</p>
              <div className="founder">
                <img src="/home3d/founder-harsha.jpg" alt="Harsha Vardhan Reddy Sanikommu" width="112" height="112" loading="lazy" />
                <div>
                  <strong>Harsha Vardhan Reddy Sanikommu</strong>
                  <span>Founder, Vikku</span>
                </div>
              </div>
              <h2>Turning business challenges into <em>AI-powered solutions.</em></h2>
              <div className="bio">
                <p>I'm Harsha Vardhan Reddy Sanikommu, Founder of Vikku — an AI agency helping businesses solve real-world problems through artificial intelligence, intelligent automation, and digital innovation.</p>
                <p>I started Vikku with a simple belief: technology should do more than just work. It should solve meaningful problems, eliminate inefficiencies, and create opportunities for businesses to grow.</p>
                <p>Over the past few years, I've worked on 8+ real-world projects across India and the USA, collaborating directly with businesses to understand their challenges, develop practical solutions, and turn ideas into reality.</p>
                <p>As the founder of Vikku, I focus on identifying opportunities where AI can make a genuine difference—from automating repetitive operations and building AI-powered workflows to developing intelligent applications that help businesses work smarter.</p>
                <p>My approach combines technical expertise with business thinking. Rather than adopting technology for the sake of innovation, I believe in finding the right problems to solve and delivering solutions that create measurable value.</p>
              </div>
              <h3>What we're building at Vikku</h3>
              <ul className="cards">
                <li><strong>AI Solutions</strong><span>Applying artificial intelligence to solve real business challenges.</span></li>
                <li><strong>AI Automation</strong><span>Reducing manual work and streamlining business operations through intelligent workflows.</span></li>
                <li><strong>AI Agents</strong><span>Building AI-powered systems that help businesses handle tasks, processes, and customer interactions.</span></li>
                <li><strong>Digital Product Development</strong><span>Turning business ideas into practical, scalable digital experiences.</span></li>
                <li className="full"><strong>Business Transformation</strong><span>Helping businesses discover and implement opportunities where AI can improve efficiency and performance.</span></li>
              </ul>
              <h3>My vision</h3>
              <div className="bio">
                <p>I believe AI is changing how businesses operate, compete, and grow. My vision for Vikku is to help businesses move beyond experimenting with AI and start using it to solve meaningful problems.</p>
                <p>I'm passionate about building, experimenting, and working alongside ambitious businesses to turn complex challenges into intelligent solutions.</p>
                <p>For me, Vikku is about more than technology. It's about creating impact, building meaningful partnerships, and helping businesses unlock what's possible with AI.</p>
              </div>
              <div className="closing">
                <h3>Let's build something that <em>matters.</em></h3>
                <p>I'm always open to connecting with founders, business leaders, and innovators who want to explore how AI can transform their businesses.</p>
                <div className="ctas"><BookButton short="Book an AI Discovery Call" /></div>
              </div>
              <p className="contact-line">
                <span className="label">Email</span>
                <span className="email" ref={emailRef}>connect@vikku.in</span>
                <button className="copy" type="button" onClick={(e) => copyText('connect@vikku.in', emailRef.current, e.currentTarget, 'Copy')}>Copy</button>
              </p>
              <p className="contact-line">
                <span className="label">Instagram</span>
                <a href="https://www.instagram.com/vikku.in_ai_sdc/" target="_blank" rel="noopener noreferrer">@vikku.in_ai_sdc</a>
              </p>
            </div>
          </section>
        </main>
      </div>
      <div className="v3d-footer">
        <Footer />
      </div>
    </>
  )
}
