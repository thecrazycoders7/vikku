import { ExternalLink } from 'lucide-react'

const clients = [
  {
    name: 'TapByWisein',
    domain: 'tapbywisein.com',
    url: 'https://www.tapbywisein.com/',
    desc: 'NFC Networking Platform',
    img: '/clients/tapbywisein.png',
    caseStudy: null,
  },
  {
    name: 'Unisys Infotech',
    domain: 'unisysinfotech.com',
    url: 'https://www.unisysinfotech.com/',
    desc: 'IT Solutions & Services',
    img: '/clients/unisysinfotech.png',
    caseStudy: '/work/staffing-platform',
  },
  {
    name: 'Jobly Solutions',
    domain: 'joblysolutions.com',
    url: 'https://www.joblysolutions.com/',
    desc: 'Recruitment & Staffing',
    img: '/clients/joblysolutions.png',
    caseStudy: '/work/staffing-platform',
  },
  {
    name: 'Media Manager 4U',
    domain: 'mediamanager4u.com',
    url: 'https://www.mediamanager4u.com/#/',
    desc: 'Media Management Platform',
    img: '/clients/mediamanager4u.png',
    caseStudy: '/work/media-manager',
  },
  {
    name: 'Rolex Ads',
    domain: 'rolexads.in',
    url: 'https://www.rolexads.in/',
    desc: 'Advertising & Marketing',
    img: '/clients/rolexads.png',
    caseStudy: '/work/rolex-ads',
  },
  {
    name: 'Nivi Collections',
    domain: 'nivicollections.com',
    url: 'https://www.nivicollections.com/',
    desc: 'Fashion & Collections',
    img: '/clients/nivicollections.png',
    caseStudy: null,
  },
]

function ClientCard({ name, domain, url, desc, img }) {
  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col hover:bg-white/[0.055] hover:border-white/[0.13] transition-all duration-300 group flex-shrink-0 w-56">
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${name}`}>
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="w-full aspect-[16/10] object-cover object-top border-b border-white/[0.06]"
        />
      </a>
      <div className="p-2.5 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
              alt=""
              className="w-3.5 h-3.5 flex-shrink-0 rounded-sm"
            />
            <span className="text-[10px] text-white truncate font-mono">{domain}</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            <ExternalLink size={11} className="text-white hover:text-white/40 transition-colors flex-shrink-0 ml-1" />
          </a>
        </div>
        <p className="font-display font-semibold text-sm text-white leading-tight">{name}</p>
        <p className="text-[10px] text-white/60 leading-tight">{desc}</p>
      </div>
    </div>
  )
}

export default function Clients() {
  const set1 = [...clients, ...clients, ...clients]

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

      {/* Single row, slides left */}
      <div className="marquee-track" style={{ animation: 'marquee-left 30s linear infinite' }}>
        {set1.map((client, i) => (
          <ClientCard key={`a-${client.domain}-${i}`} {...client} />
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
