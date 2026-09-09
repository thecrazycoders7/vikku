import { Linkedin, Mail, Instagram, Phone } from 'lucide-react'

export default function FounderCard({ founder, compact = false }) {
  return (
    <div
      className="glass rounded-xl p-6 md:p-8 mt-3 flex flex-col sm:flex-row gap-6 items-stretch"
      data-reveal
      style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s ease 0.3s' }}
    >
      {/* Photo */}
      <div className="relative w-full sm:w-44 h-56 sm:h-auto sm:self-stretch rounded-2xl overflow-hidden flex-shrink-0 bg-black">
        <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-4xl text-white/80">
          {founder.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </span>
        <img
          src={founder.photo}
          alt={founder.name}
          className="relative w-full h-full rounded-2xl object-cover object-top"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>

      {/* Bio */}
      <div className="w-full sm:flex-1">
        <h3 className="font-display font-semibold text-white text-base mb-1">{founder.name}</h3>
        {founder.role && (
          <p className="text-white/50 text-xs mb-3">{founder.role}</p>
        )}
        <p className="text-white/90 text-sm leading-relaxed mb-4 whitespace-pre-line">{founder.bio}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {founder.focus.map((f) => (
            <span key={f} className="glass rounded-md px-2.5 py-1 text-[10px] text-white/80 tracking-wide">
              {f}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-[11px] text-white hover:border-white/20 transition-colors"
          >
            <Linkedin size={12} /> LinkedIn
          </a>
          {founder.instagram && (
            <a
              href={founder.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-[11px] text-white hover:border-white/20 transition-colors"
            >
              <Instagram size={12} /> Instagram
            </a>
          )}
          {founder.phone && (
            <a
              href={`tel:${founder.phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-[11px] text-white hover:border-white/20 transition-colors"
            >
              <Phone size={12} /> {founder.phone}
            </a>
          )}
          <a
            href={`mailto:${founder.email}`}
            className="inline-flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-[11px] text-white hover:border-white/20 transition-colors"
          >
            <Mail size={12} /> {founder.email}
          </a>
        </div>
      </div>
    </div>
  )
}
