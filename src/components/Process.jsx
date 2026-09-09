import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    number: '01',
    title: 'Discovery',
    desc: 'We start with a deep-dive into your goals, users, and requirements. This shapes everything that follows.',
    points: ['Requirements gathering', 'Competitor research', 'Tech stack selection', 'Project scoping & estimate'],
  },
  {
    number: '02',
    title: 'Design',
    desc: 'We wireframe and prototype the product - nailing the UX flow and visual identity before a single line of code is written.',
    points: ['Wireframes & user flows', 'UI design system', 'Interactive prototype', 'Client review & sign-off'],
  },
  {
    number: '03',
    title: 'Build',
    desc: 'Agile sprints with weekly demos. You stay in the loop at every stage - no black boxes, no surprises.',
    points: ['Sprint-based development', 'Weekly progress demos', 'QA & testing each sprint', 'Staging environment'],
  },
  {
    number: '04',
    title: 'Launch',
    desc: 'We deploy, monitor, and hand over - with documentation, training, and ongoing support as needed.',
    points: ['Production deployment', 'Performance monitoring', 'Handover & documentation', 'Post-launch support'],
  },
]

export default function Process() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="process" className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="section-tag">How We Work</div>
          <h2
            className="font-display font-extrabold text-white"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}
          >
            From Idea to Launch
          </h2>
          <p className="text-white text-sm mt-2 max-w-xl">
            A clear, repeatable process that keeps projects on time, on budget, and on point.
          </p>
        </div>

        <div ref={sectionRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map(({ number, title, desc, points }, idx) => (
            <div
              key={number}
              className="glass rounded-xl p-5 flex flex-col gap-4 relative group hover:border-white/15 transition-all"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0) translateY(0)' : 'translateX(-40px) translateY(0)',
                transition: 'opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)',
                transitionDelay: visible ? `${idx * 0.15}s` : '0s',
              }}
            >
              {/* Step number */}
              <span className="font-mono text-[2rem] font-bold text-white/[0.06] leading-none select-none">
                {number}
              </span>

              {/* Connector line (except last) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-2 w-4 h-px bg-white/10 z-10" />
              )}

              <div>
                <h3 className="font-display font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-white text-xs leading-relaxed">{desc}</p>
              </div>

              <ul className="space-y-1.5 mt-auto">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[10px] text-white">
                    <span className="mt-1 w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #process .grid > div {
            transform: translateY(40px) !important;
          }
        }
      `}</style>
    </section>
  )
}
