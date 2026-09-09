const testimonials = [
  {
    quote: "Vikku took our entire staffing workflow from WhatsApp groups and Excel sheets into a proper platform. Our team went from spending hours on manual tracking to having everything in one place. The delivery was fast and exactly what we needed.",
    name: "Jagan",
    role: "Director",
    company: "Jobly Solutions",
  },
  {
    quote: "Before Vikku, we had zero online presence. Now we're getting enquiries directly from our website every week - people who found us on Google. The catalog they built lets customers browse all our products before they even call us.",
    name: "Sainath",
    role: "Owner",
    company: "HSO CCTV",
  },
  {
    quote: "Our leads literally 4x'd within a few months of launching. Clients now come to us - we don't have to rely on word of mouth anymore. Having a professional website completely changed how people perceive us.",
    name: "Rahamath Thullaa",
    role: "Founder",
    company: "Rolex Ads",
  },
  {
    quote: "We went from zero to 6 paying clients within months of our website going live. It works like a 24/7 salesperson - prospects visit, read about our services, and reach out already knowing what they want.",
    name: "Mohan Manjunath Reddy",
    role: "Co-founder",
    company: "Media Manager 4U",
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="section-tag">What Clients Say</div>
          <h2
            className="font-display font-extrabold text-white"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}
          >
            Results that Speak for Themselves
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex flex-col gap-4">
              <p className="text-white/80 text-sm leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-auto pt-4 border-t border-white/[0.06]">
                <p className="text-white text-xs font-semibold">{t.name}</p>
                <p className="text-white/40 text-[10px]">{t.role}, {t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
