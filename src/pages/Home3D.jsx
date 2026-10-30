import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import usePageMeta from '../hooks/usePageMeta'
import useStudioWalk from '../hooks/useStudioWalk'
import { trackEvent } from '../utils/analytics'
import { AI_PRODUCTS, CLIENT_WORK, FOUNDER, STATS, TESTIMONIALS, WHY_VIKKU } from '../data/company'
import './home3d.css'

const rooms = ['Entrance', 'Lobby', 'AI lab', 'Industries', 'Process wall', 'Client lounge', "Founder's office"]
const roomIds = ['top', 'about', 'services', 'industries', 'process', 'work', 'contact']

// Copy to clipboard where allowed, otherwise select the text for a manual copy.
async function copyText(text, el, button, label) {
  try { await navigator.clipboard.writeText(text); button.textContent = 'Copied' }
  catch { getSelection().selectAllChildren(el); button.textContent = 'Selected' }
  setTimeout(() => { button.textContent = label }, 1800)
}

export default function Home3D() {
  usePageMeta({
    title:       'Vikku | AI Agency for AI Agents, Business Automation & AI Software',
    description: 'Vikku is an AI agency that builds AI agents, business automation and AI-powered software for companies in India and the USA. Book an AI discovery call.',
    url:         'https://www.vikku.in/',
  })

  const emailRef = useRef(null)
  // How far visitors get through the walk: one event the first time each room is reached.
  const { canvasRef, loadingRef, room, ready } = useStudioWalk(roomIds, (r) =>
    trackEvent('tour_room_reached', { event_category: 'engagement', room: rooms[r], room_index: r }))

  return (
    <>
      <div className="v3d">
        <canvas id="scene" ref={canvasRef} aria-hidden="true" />
        <div className={`poster${ready ? ' gone' : ''}`} aria-hidden="true" />
        <SiteNav />
        <WhatsAppButton />

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
                <BookButton short="Book an AI Discovery Call" location="hero" />
                <a className="btn btn-ghost" href="#work">Explore our work</a>
              </div>
              <ul className="trust" aria-label="Company figures">
                {STATS.map(([n, label]) => <li key={label}><b>{n}</b>{label}</li>)}
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
                {WHY_VIKKU.map(([title, desc]) => <li key={title}><strong>{title}</strong><span>{desc}</span></li>)}
              </ul>
              <p className="note">We work with founders building AI products, growing businesses cutting manual work, established companies integrating AI, and international teams that need an engineering partner.</p>
            </div>
          </section>

          <section className="stop" id="services">
            <div className="panel wide">
              <p className="eyebrow">AI lab · AI solutions</p>
              <h2>Seven ways we put AI <em>to work</em></h2>
              <ul className="cards">
                <li><strong>AI agents</strong><span>Agents that handle inquiries, qualify leads, answer from internal knowledge, process documents and update your CRM, within the permissions and safeguards you set.</span><Link className="try" to="/ai-agents">Learn more</Link></li>
                <li><strong>AI business automation</strong><span>Less manual work in lead management, onboarding, data entry, reporting and follow-ups. Where plain automation is more reliable than AI, we use it.</span><Link className="try" to="/ai-automation">Learn more</Link></li>
                <li><strong>AI-powered software</strong><span>SaaS platforms, intelligent dashboards, document intelligence, search and AI-assisted portals with AI in the core workflow.</span><Link className="try" to="/ai-software-development">Learn more</Link></li>
                <li><strong>AI voice and conversation</strong><span>Inquiry handling, scheduling, FAQs and follow-ups by voice or chat, with verification and human escalation for sensitive actions.</span><Link className="try" to="/ai-voice-agents">Learn more</Link></li>
                <li><strong>AI integration</strong><span>LLM APIs, retrieval (RAG), document Q&amp;A, structured data extraction and model evaluation inside the apps you already run.</span><Link className="try" to="/ai-integration">Learn more</Link></li>
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
                {AI_PRODUCTS.map(p => <li key={p.name}><strong>{p.name}</strong><span>{p.desc}</span><Link className="try" to={p.to}>Try it</Link></li>)}
              </ul>
              <h3>Client engineering</h3>
              <p>Software we built for real businesses. These were not AI projects; they show the engineering foundation behind our AI work.</p>
              <ul className="cards">
                {CLIENT_WORK.map(c => (
                  <li key={c.name}>
                    <strong><a href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a></strong>
                    <span>{c.desc}</span>
                    {c.note && <em>{c.note}</em>}
                    {c.caseStudy && <Link className="try" to={c.caseStudy}>Read the case study</Link>}
                  </li>
                ))}
              </ul>
              <p className="proof">See everything on our <Link to="/work">work page</Link>.</p>
              <div className="quotes">
                {TESTIMONIALS.map(t => (
                  <figure key={t.name}>
                    <blockquote>“{t.quote}”</blockquote>
                    <figcaption><strong>{t.name}</strong> · {t.role}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          <section className="stop contact" id="contact">
            <div className="panel wide">
              <p className="eyebrow">Founder's office · About me</p>
              <div className="founder">
                <img src={FOUNDER.photo} alt={FOUNDER.name} width="112" height="112" loading="lazy" />
                <div>
                  <strong>{FOUNDER.name}</strong>
                  <span>{FOUNDER.role}</span>
                  <a className="founder-link" href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
              </div>
              <h2>Turning business challenges into <em>AI-powered solutions.</em></h2>
              <div className="bio">
                {FOUNDER.bio.map(p => <p key={p}>{p}</p>)}
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
                {FOUNDER.vision.map(p => <p key={p}>{p}</p>)}
              </div>
              <div className="closing">
                <h3>Let's build something that <em>matters.</em></h3>
                <p>I'm always open to connecting with founders, business leaders, and innovators who want to explore how AI can transform their businesses.</p>
                <div className="ctas"><BookButton short="Book an AI Discovery Call" location="founder" /></div>
              </div>
              <p className="contact-line">
                <span className="label">Email</span>
                <span className="email" ref={emailRef}>connect@vikku.in</span>
                <button className="copy" type="button" onClick={(e) => copyText('connect@vikku.in', emailRef.current, e.currentTarget, 'Copy')}>Copy</button>
              </p>
              <p className="contact-line">
                <span className="label">Instagram</span>
                <a href="https://www.instagram.com/vikku.aiautomationagency/" target="_blank" rel="noopener noreferrer">@vikku.aiautomationagency</a>
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
