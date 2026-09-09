import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'How much does it cost to build a website or web app?',
    a: 'It depends on the scope. A marketing website typically starts at ₹50k – ₹2L, while a custom web application (like a CRM or HR platform) ranges from ₹2L – ₹20L+. We provide a detailed estimate after a free discovery call.',
  },
  {
    q: 'How long does a project typically take?',
    a: 'A standard website takes 3–6 weeks. A full custom web application takes 2–4 months depending on complexity. We agree on a timeline upfront and stick to it with weekly milestones.',
  },
  {
    q: 'What technologies do you use?',
    a: 'Our primary stack is React / Next.js on the frontend, Node.js or Python on the backend, and AWS / Vercel for deployment. We also work with React Native for mobile, and PostgreSQL / MongoDB for databases.',
  },
  {
    q: 'Do you work with clients outside India?',
    a: 'Yes - we work with clients across India, the US, UK, and the Middle East. All communication happens over Slack, Notion, and video calls, so timezone is rarely a barrier.',
  },
  {
    q: 'Will I own the code after the project?',
    a: 'Absolutely. You get full ownership of all source code, design files, and assets. We hand everything over in a private GitHub repository at the end of the project.',
  },
  {
    q: 'Do you provide ongoing support after launch?',
    a: 'Yes. We offer monthly retainer plans for bug fixes, feature additions, and performance monitoring. Most clients stay on a lightweight retainer after launch.',
  },
  {
    q: 'Can you redesign or improve my existing website?',
    a: 'Definitely. We handle full redesigns, partial revamps, and performance improvements for existing sites and apps. Share your current project and we will assess it.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="py-20 px-6 relative">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <div className="section-tag">FAQ</div>
          <h2
            className="font-display font-extrabold text-white"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}
          >
            Common Questions
          </h2>
        </div>

        <div className="space-y-1.5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`glass rounded-xl overflow-hidden transition-all ${open === i ? 'border-white/10' : ''}`}
            >
              <button
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left group"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-display font-semibold text-xs text-white group-hover:text-white transition-colors leading-snug">
                  {faq.q}
                </span>
                <span className="flex-shrink-0 w-5 h-5 glass rounded-lg flex items-center justify-center">
                  {open === i
                    ? <Minus size={10} className="text-white" />
                    : <Plus  size={10} className="text-white" />
                  }
                </span>
              </button>

              <div
                style={{
                  maxHeight: open === i ? '300px' : '0',
                  opacity: open === i ? 1 : 0,
                  transition: 'max-height 0.35s ease, opacity 0.25s ease',
                  overflow: 'hidden',
                }}
              >
                <p className="px-5 pb-5 text-xs text-white leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
