import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import KanbanHero from './KanbanHero'
import { useTheme } from '../contexts/ThemeContext'

export default function Hero() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const scrollToServices = () =>
    document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToContact = () =>
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden py-16 lg:py-0"
    >
      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      {/* Layout grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 lg:gap-6 items-center">
        {/* Left: Content */}
        <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
        {/* Badge */}
        <div className="section-tag">
          Software &amp; Tech Agency
        </div>

        {/* Headline */}
        <h1
          className="font-display font-extrabold leading-[1.08] tracking-tight text-white mb-4"
          style={{
            fontSize: 'clamp(1.4rem, 4vw, 3.4rem)',
            textShadow: theme === 'light'
              ? '1px 1px 2px rgba(15, 23, 42, 0.08)'
              : '4px 4px 12px rgba(0, 0, 0, 0.5), 8px 8px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ whiteSpace: 'nowrap' }}>
            {['We', 'Build', 'Digital', 'Products'].map((word, i) => (
              <span key={word} className="inline-block mr-[0.22em]"
                style={{ animation: `heroWordIn 0.7s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${i * 0.12}s` }}>
                {word}
              </span>
            ))}
          </div>
          <div>
            {['That', 'Matter'].map((word, i) => (
              <span key={word} className="inline-block mr-[0.22em]"
                style={{ animation: `heroWordIn 0.7s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${(i + 4) * 0.12}s` }}>
                {word}
              </span>
            ))}
          </div>
        </h1>
        <style>{`
          @keyframes heroWordIn {
            from { opacity: 0; transform: translateY(28px) skewY(4deg); filter: blur(4px); }
            to   { opacity: 1; transform: translateY(0)   skewY(0deg); filter: blur(0);  }
          }
        `}</style>

        {/* Sub */}
        <p className="text-white/70 text-base max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed text-balance">
          We partner with ambitious founders to build products that solve real user problems and move businesses forward.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center lg:justify-start gap-2 mb-8">
          <button
            onClick={scrollToContact}
            className="relative inline-flex items-center gap-2 rounded-full font-semibold text-black text-xs transition-all duration-300 px-6 py-3 bg-white hover:bg-white/90 active:scale-95"
          >
            Start a Project <ArrowRight size={14} />
          </button>
          <button onClick={scrollToServices} className="inline-flex items-center gap-2 rounded-full font-semibold text-xs transition-all duration-300 px-6 py-3 border border-white/20 text-white/80 hover:bg-white/5 hover:text-white active:scale-95">
            View Services <ChevronDown size={14} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto lg:mx-0 w-full">
          {[
            { value: '8', label: 'Completed' },
            { value: '4 USA', label: '4 India' },
            { value: '2+', label: 'Ongoing' },
          ].map(({ value, label }) => (
            <div key={label} className="glass rounded-lg px-3 py-4">
              <div className="font-display font-bold text-xl text-white mb-0.5">{value}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
        </div>

        {/* Right: Kanban preview */}
        <div className="flex flex-col justify-center items-center gap-3">
          <KanbanHero />
          <button
            onClick={() => navigate('/pm')}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Try our free PM Tool <span className="underline">here →</span>
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white hover:text-white/50 transition-colors"
      >
        <ChevronDown size={20} />
      </button>
    </section>
  )
}
