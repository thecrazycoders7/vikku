import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SiteNav, { BookButton, WhatsAppButton } from '../components/SiteNav'
import useStudioWalk from '../hooks/useStudioWalk'
import { getMyToolResults } from '../lib/toolResultsService'
import './home3d.css'

// The AI Tools dashboard sits over a photoreal founder's desk (src/lib/deskScene.js): each of the seven
// sections frames one object on the desk, so the tools unfold step by step as you scroll.
const rooms = ['Welcome', 'Vikku PM', 'Check', 'Decide', 'Plan', 'Run', 'Your usage']
const loadDesk = () => import('../lib/deskScene').then(m => m.createDesk)
const roomIds = ['top', 'about', 'services', 'industries', 'process', 'work', 'contact']

// Tools grouped by where the visitor is in their project journey, so a first-time user can find
// "their" tool by the question they came with. Each group gets its own room.
const toolGroups = [
  {
    id: 'services', step: '00', room: 'The laptop', title: 'Check what', em: 'you already have',
    question: 'Will AI recommend your business today?',
    tools: [{
      title: 'AI Visibility Score', img: '/tools/visibility.png', path: '/dashboard/ai-visibility-score',
      description: "Paste your URL and see how likely AI is to recommend your business, and what's blocking you.",
      useWhen: 'You already have a website and want to know if AI assistants can find and recommend it',
      gives: 'A visibility score, a prioritised list of blockers, and concrete fixes',
    }],
  },
  {
    id: 'industries', step: '01', room: 'Calculator & coins', title: 'Decide', em: '& budget', right: true,
    question: 'Is this project worth it, and what will it cost?',
    tools: [
      {
        title: 'Business Impact Calculator', img: '/tools/roi.png', path: '/dashboard/business-impact',
        description: 'Build a 3-year financial model: TCO, ROI, NPV, payback and value drivers.',
        useWhen: "You're deciding whether an investment is worth it",
        gives: 'A business case with risk adjustment and a live sensitivity simulator',
      },
      {
        title: 'AI Project Estimator', img: '/tools/cost.png', path: '/dashboard/project-estimator',
        description: 'Answer a guided questionnaire and get hours, timeline and an investment range.',
        useWhen: 'You have an idea but no budget number to plan around',
        gives: 'A structured estimate with MVP, Business and Enterprise options',
      },
    ],
  },
  {
    id: 'process', step: '02', room: 'Calendar & stack', title: 'Plan', em: 'the build', right: true,
    question: 'How long will it take, and what should it be built with?',
    tools: [
      {
        title: 'Project Timeline Calculator', img: '/tools/timeline.png', path: '/dashboard/timeline',
        description: 'Get a realistic timeline with a phase breakdown and dated milestones.',
        useWhen: 'You need a delivery date you can commit to',
        gives: 'A phase-by-phase schedule, milestones, and what drives the timeline',
      },
      {
        title: 'Tech Stack Recommender', img: '/tools/techstack.png', path: '/dashboard/stack-recommender',
        description: 'Answer a few questions and get an opinionated stack for your project.',
        useWhen: "You don't know which technologies to build on",
        gives: 'A recommended stack per layer with reasoning and alternatives',
      },
    ],
  },
  {
    id: 'work', step: '03', room: 'The toolbox', title: 'Run', em: '& maintain',
    question: 'What does it cost to keep it alive after launch?',
    tools: [{
      title: 'Maintenance Calculator', img: '/tools/maintenance.png', path: '/dashboard/maintenance',
      description: 'Estimate the ongoing monthly cost to run and support your product.',
      useWhen: 'You want to budget beyond launch day',
      gives: 'A monthly cost breakdown with Basic, Standard and Premium tiers',
    }],
  },
]

export default function Dashboard() {
  const { user, loading, displayName } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, toolsUsed: 0 })
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('vikku_onboarded'))
  const { canvasRef, loadingRef, room, ready } = useStudioWalk(roomIds, undefined, loadDesk)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    getMyToolResults(user.id).then((rows) => {
      setStats({ total: rows.length, toolsUsed: new Set(rows.map((r) => r.tool)).size })
    })
  }, [user])

  const firstName = displayName ? displayName.split(' ')[0] : ''

  // The page renders straight away (the walk needs its sections in place); signed-out visitors are sent to /login.
  return (
    <div className="v3d">
      <canvas id="scene" ref={canvasRef} aria-hidden="true" />
      <div className={`poster desk${ready ? ' gone' : ''}`} aria-hidden="true" />
      <SiteNav />
      <WhatsAppButton />

      <div className="rooms">
        <p className="loading" ref={loadingRef}>Setting up the desk…</p>
        <ol aria-label="Rooms">
          {rooms.map((r, i) => <li key={r} className={i === room ? 'on' : ''}><a href={`#${roomIds[i]}`}>{r}</a></li>)}
        </ol>
      </div>

      <main>
        <section className="stop hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Your AI tools</p>
            <h1>Welcome{firstName ? `, ${firstName}` : ''}. <em>Let's plan it.</em></h1>
            <p>Six free tools, laid out across the desk in the order you'll need them: check what you have, decide and budget, plan the build, then keep it running.</p>
            {showWelcome && (
              <ul className="steps">
                <li><b>1</b>Describe your project in a few plain sentences</li>
                <li><b>2</b>AI works out costs, timelines or the stack in seconds</li>
                <li><b>3</b>Save the result or share it with a link</li>
              </ul>
            )}
            <div className="ctas">
              <Link className="btn btn-primary" to="/dashboard/project-estimator">Not sure? Start with the Estimator</Link>
              <Link className="btn btn-ghost" to="/dashboard/saved">My saved results</Link>
              {showWelcome && (
                <button type="button" className="btn btn-ghost" onClick={() => { setShowWelcome(false); localStorage.setItem('vikku_onboarded', '1') }}>Got it</button>
              )}
            </div>
            <p className="hint">Scroll across the desk <b>↓</b></p>
          </div>
        </section>

        <section className="stop right" id="about">
          <div className="panel wide">
            <p className="eyebrow">The planner · Vikku PM</p>
            <h2>Run client projects <em>end to end</em></h2>
            <p>Plan with AI, track work on a board, and share live progress with clients. Free to start, no credit card.</p>
            <ul className="cards">
              <li><strong>Kanban boards</strong><span>Drag-and-drop task board with custom stages.</span></li>
              <li><strong>AI project planning</strong><span>Describe it, and AI builds the tasks and milestones.</span></li>
              <li><strong>Client share links</strong><span>A read-only progress link, no login needed.</span></li>
              <li><strong>Milestones and timeline</strong><span>Deadlines with a visual timeline view.</span></li>
              <li><strong>Time tracking</strong><span>Timers, billable hours and reports.</span></li>
              <li><strong>100+ templates</strong><span>Start from a proven project template.</span></li>
            </ul>
            <div className="ctas pad"><Link className="btn btn-primary" to="/pm">Open Vikku PM</Link></div>
          </div>
        </section>

        {toolGroups.map((g) => (
          <section key={g.id} className={`stop${g.right ? ' right' : ''}`} id={g.id}>
            <div className="panel wide">
              <p className="eyebrow">{g.step} · {g.room}</p>
              <h2>{g.title} <em>{g.em}</em></h2>
              <p className="question">“{g.question}”</p>
              <ul className="tool-cards">
                {g.tools.map((t) => (
                  <li key={t.title}>
                    <img src={t.img} alt="" loading="lazy" width="400" height="300" />
                    <div>
                      <strong>{t.title}</strong>
                      <span>{t.description}</span>
                      <small><b>Best when:</b> {t.useWhen}</small>
                      <small><b>You get:</b> {t.gives}</small>
                      <Link className="btn btn-primary btn-sm" to={t.path}>Open tool</Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section className="stop contact" id="contact">
          <div className="panel wide">
            <p className="eyebrow">By the window · Your usage</p>
            <h2>Your progress <em>so far</em></h2>
            <div className="stats three">
              <div className="stat"><b>{stats.toolsUsed}</b><span>Tools used</span></div>
              <div className="stat"><b>{stats.total}</b><span>Estimates generated</span></div>
              <div className="stat"><b>Free</b><span>Plan</span></div>
            </div>
            <div className="closing">
              <h3>Ready to <em>build it?</em></h3>
              <p>Bring your estimate to a 30-minute call and we'll turn it into a plan you can act on.</p>
              <div className="ctas">
                <BookButton short="Book an AI Discovery Call" location="dashboard" />
                <Link className="btn btn-ghost" to="/dashboard/saved">My saved results</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
