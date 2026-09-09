import { ExternalLink, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const clients = [
  {
    name: 'Unisys Infotech',
    domain: 'unisysinfotech.com',
    url: 'https://www.unisysinfotech.com/',
    desc: 'IT Solutions & Services',
    caseStudy: '/work/staffing-platform',
  },
  {
    name: 'Jobly Solutions',
    domain: 'joblysolutions.com',
    url: 'https://www.joblysolutions.com/',
    desc: 'Recruitment & Staffing',
    caseStudy: '/work/staffing-platform',
  },
  {
    name: 'HSO CCTV',
    domain: 'hsocctv.com',
    url: 'https://www.hsocctv.com/',
    desc: 'Security & Surveillance',
    caseStudy: '/work/hso-cctv',
  },
  {
    name: 'Media Manager 4U',
    domain: 'mediamanager4u.com',
    url: 'https://www.mediamanager4u.com/#/',
    desc: 'Media Management Platform',
    caseStudy: '/work/media-manager',
  },
  {
    name: 'Rolex Ads',
    domain: 'rolexads.in',
    url: 'https://www.rolexads.in/',
    desc: 'Advertising & Marketing',
    caseStudy: '/work/rolex-ads',
  },
]

function ClientCard({ name, domain, url, desc, caseStudy }) {
  const navigate = useNavigate()
  return (
    <div className="glass rounded-xl p-1.5 flex flex-col gap-1 hover:bg-white/[0.055] active:bg-white/[0.08] hover:border-white/[0.13] transition-all duration-300 group flex-shrink-0 w-36">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-4 h-4 rounded-md glass flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
              alt={name}
              className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span className="text-[9px] text-white truncate font-mono">{domain}</span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
          <ExternalLink size={9} className="text-white hover:text-white/40 transition-colors flex-shrink-0 ml-1" />
        </a>
      </div>
      <p className="font-display font-semibold text-xs text-white group-hover:text-white transition-colors leading-tight">
        {name}
      </p>
    </div>
  )
}

export default function Clients() {
  const set1 = [...clients, ...clients, ...clients]
  const set2 = [...clients, ...clients, ...clients]

  return (
    <section id="clients" className="py-10 relative overflow-hidden">
      <p className="text-[9px] text-white uppercase tracking-[0.2em] text-center mb-4 px-6">
        Trusted by growing companies
      </p>

      {/* Fade edges */}
      <div
        className="absolute inset-y-0 left-0 w-24 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to right, var(--page-bg) 20%, transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to left, var(--page-bg) 20%, transparent)' }}
      />

      {/* Row 1   slides left */}
      <div className="marquee-track mb-1.5" style={{ animation: 'marquee-left 30s linear infinite' }}>
        {set1.map((client, i) => (
          <ClientCard key={`a-${client.domain}-${i}`} {...client} />
        ))}
      </div>

      {/* Row 2   slides right */}
      <div className="marquee-track" style={{ animation: 'marquee-right 24s linear infinite' }}>
        {set2.map((client, i) => (
          <ClientCard key={`b-${client.domain}-${i}`} {...client} />
        ))}
      </div>

      <style>{`
        .marquee-track {
          display: flex;
          gap: 6px;
          width: max-content;
        }
        .marquee-track:hover {
          animation-play-state: paused !important;
        }
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
