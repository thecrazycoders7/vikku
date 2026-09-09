const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

const stack = [
  { name: 'React',        logo: `${BASE}/react/react-original.svg`                                       },
  { name: 'Next.js',      logo: `${BASE}/nextjs/nextjs-original.svg`                                     },
  { name: 'TypeScript',   logo: `${BASE}/typescript/typescript-original.svg`                             },
  { name: 'Tailwind CSS', logo: `${BASE}/tailwindcss/tailwindcss-original.svg`                           },
  { name: 'Node.js',      logo: `${BASE}/nodejs/nodejs-original.svg`                                     },
  { name: 'Python',       logo: `${BASE}/python/python-original.svg`                                     },
  { name: 'PostgreSQL',   logo: `${BASE}/postgresql/postgresql-original.svg`                             },
  { name: 'MongoDB',      logo: `${BASE}/mongodb/mongodb-original.svg`                                   },
  { name: 'AWS',          logo: `${BASE}/amazonwebservices/amazonwebservices-plain-wordmark.svg`          },
  { name: 'Vercel',       logo: 'https://cdn.simpleicons.org/vercel/ffffff'                              },
  { name: 'Docker',       logo: `${BASE}/docker/docker-original.svg`                                     },
  { name: 'React Native', logo: `${BASE}/react/react-original.svg`                                       },
]

function Pill({ name, logo }) {
  return (
    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-shrink-0 hover:border-white/15 transition-all group">
      <img
        src={logo}
        alt={name}
        className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity"
      />
      <span className="text-xs text-white font-display font-medium group-hover:text-white/80 transition-colors whitespace-nowrap">
        {name}
      </span>
    </div>
  )
}

const track = [...stack, ...stack, ...stack]

export default function TechStack() {
  return (
    <section id="techstack" className="py-20 relative overflow-hidden">
      <p className="text-[10px] text-white uppercase tracking-[0.2em] text-center mb-8 px-6">
        Technologies we work with
      </p>

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to right, var(--page-bg) 20%, transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-20 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to left, var(--page-bg) 20%, transparent)' }} />

      {/* Row 1 - left */}
      <div className="mb-2" style={{ display: 'flex', gap: '10px', width: 'max-content', animation: 'techLeft 28s linear infinite' }}>
        {track.map((item, i) => <Pill key={`a-${i}`} {...item} />)}
      </div>

      {/* Row 2 - right */}
      <div style={{ display: 'flex', gap: '10px', width: 'max-content', animation: 'techRight 22s linear infinite' }}>
        {[...track].reverse().map((item, i) => <Pill key={`b-${i}`} {...item} />)}
      </div>

      <style>{`
        @keyframes techLeft  { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes techRight { 0% { transform: translateX(-33.333%); } 100% { transform: translateX(0); } }
        #techstack div[style*="animation"]:hover { animation-play-state: paused !important; }
      `}</style>
    </section>
  )
}
