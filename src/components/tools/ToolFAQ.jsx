// SEO-friendly intro + FAQ block rendered below the tool input.
export default function ToolFAQ({ content }) {
  if (!content) return null
  return (
    <div className="mt-12 max-w-2xl">
      <h3 className="font-display font-bold text-xl text-white mb-3">{content.heading}</h3>
      <p className="text-white/60 text-sm leading-relaxed mb-8">{content.intro}</p>
      <div className="space-y-5">
        {content.faqs.map((f, i) => (
          <div key={i}>
            <p className="text-white font-medium text-sm mb-1">{f.q}</p>
            <p className="text-white/55 text-sm leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
