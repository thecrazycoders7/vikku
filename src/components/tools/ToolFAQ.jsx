import { Link } from 'react-router-dom'

// SEO-friendly intro + FAQ block rendered below the tool input. `about` (TOOL_ABOUT in
// lib/toolContent) adds who it's for, what you get, how it works and related links.
export default function ToolFAQ({ content, about }) {
  if (!content) return null
  return (
    <div className="mt-12 max-w-2xl">
      <h2 className="font-display font-bold text-xl text-white mb-3">{content.heading}</h2>
      <p className="text-white/60 text-sm leading-relaxed mb-8">{content.intro}</p>
      {about && (
        <div className="space-y-6 mb-8">
          <section>
            <h3 className="text-white font-semibold text-sm mb-1">Who it's for</h3>
            <p className="text-white/55 text-sm leading-relaxed">{about.who}</p>
          </section>
          <section>
            <h3 className="text-white font-semibold text-sm mb-1">What you get</h3>
            <ul className="list-disc pl-5 space-y-1 text-white/55 text-sm leading-relaxed">
              {about.gets.map(g => <li key={g}>{g}</li>)}
            </ul>
          </section>
          <section>
            <h3 className="text-white font-semibold text-sm mb-1">How it works</h3>
            <ol className="list-decimal pl-5 space-y-1 text-white/55 text-sm leading-relaxed">
              {about.steps.map(s => <li key={s}>{s}</li>)}
            </ol>
          </section>
        </div>
      )}
      <h3 className="text-white font-semibold text-sm mb-4">Frequently asked questions</h3>
      <div className="space-y-5">
        {content.faqs.map((f, i) => (
          <div key={i}>
            <p className="text-white font-medium text-sm mb-1">{f.q}</p>
            <p className="text-white/55 text-sm leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
      {about?.related?.length > 0 && (
        <nav aria-label="Related tools and services" className="mt-8 pt-5 border-t border-white/[0.06]">
          <p className="text-white font-semibold text-sm mb-2">Related</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
            {about.related.map(([label, href]) => (
              <li key={href}><Link to={href} className="text-[var(--brand-primary)] underline underline-offset-2">{label}</Link></li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
