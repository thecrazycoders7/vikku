// Self-contained inline SVG illustrations for the AI Tools dashboard cards.
// No external assets - each `art` key maps to a distinct gradient + motif.
// Gradient IDs are namespaced per art so multiple SVGs can share a page.

// Gradient fills the whole band via CSS; the motif is rendered with `meet`
// (contain) so the full illustration is always visible - never cropped,
// whatever the card/banner aspect ratio.
function Frame({ from, to, children }) {
  return (
    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid meet" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    </div>
  )
}

const W = 'rgba(255,255,255,0.9)'
const W6 = 'rgba(255,255,255,0.55)'
const W3 = 'rgba(255,255,255,0.25)'

export default function ToolArt({ art }) {
  switch (art) {
    case 'visibility': // radar sweep
      return (
        <Frame id="art-vis" from="#6d28d9" to="#4f46e5">
          <g fill="none" stroke={W3} strokeWidth="1.5">
            <circle cx="160" cy="60" r="18" />
            <circle cx="160" cy="60" r="34" />
            <circle cx="160" cy="60" r="50" />
          </g>
          <line x1="110" y1="60" x2="210" y2="60" stroke={W3} strokeWidth="1" />
          <line x1="160" y1="10" x2="160" y2="110" stroke={W3} strokeWidth="1" />
          <path d="M160 60 L160 12 A48 48 0 0 1 202 40 Z" fill="rgba(255,255,255,0.18)" />
          <circle cx="188" cy="44" r="3.5" fill={W} />
          <circle cx="140" cy="82" r="3" fill={W6} />
          <circle cx="118" cy="52" r="2.5" fill={W6} />
        </Frame>
      )
    case 'roi': // rising bars + trend
      return (
        <Frame id="art-roi" from="#059669" to="#10b981">
          <g fill={W3}>
            <rect x="96" y="78" width="20" height="26" rx="3" />
            <rect x="126" y="64" width="20" height="40" rx="3" />
            <rect x="156" y="48" width="20" height="56" rx="3" />
            <rect x="186" y="30" width="20" height="74" rx="3" />
          </g>
          <polyline points="106,74 136,60 166,44 196,26" fill="none" stroke={W} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M196 26 l-10 1 l6 8 Z" fill={W} />
        </Frame>
      )
    case 'cost': // coins + receipt
      return (
        <Frame id="art-cost" from="#2563eb" to="#06b6d4">
          <g>
            <ellipse cx="120" cy="86" rx="30" ry="10" fill={W3} />
            <ellipse cx="120" cy="72" rx="30" ry="10" fill="rgba(255,255,255,0.4)" />
            <ellipse cx="120" cy="58" rx="30" ry="10" fill={W6} />
            <text x="120" y="63" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0b3b66">$</text>
          </g>
          <g fill={W3}>
            <rect x="176" y="34" width="60" height="64" rx="6" />
          </g>
          <g stroke={W6} strokeWidth="2" strokeLinecap="round">
            <line x1="186" y1="48" x2="226" y2="48" />
            <line x1="186" y1="60" x2="220" y2="60" />
            <line x1="186" y1="72" x2="226" y2="72" />
            <line x1="186" y1="84" x2="210" y2="84" />
          </g>
        </Frame>
      )
    case 'timeline': // gantt + milestones
      return (
        <Frame id="art-time" from="#ea580c" to="#f59e0b">
          <line x1="60" y1="34" x2="260" y2="34" stroke={W3} strokeWidth="1.5" />
          <g fill={W}>
            <circle cx="90" cy="34" r="4" />
            <circle cx="160" cy="34" r="4" />
            <circle cx="230" cy="34" r="4" />
          </g>
          <g rx="4">
            <rect x="70" y="52" width="90" height="12" rx="6" fill={W6} />
            <rect x="110" y="72" width="110" height="12" rx="6" fill="rgba(255,255,255,0.4)" />
            <rect x="150" y="92" width="80" height="12" rx="6" fill={W3} />
          </g>
        </Frame>
      )
    case 'stack': // stacked layers
      return (
        <Frame id="art-stack" from="#7c3aed" to="#db2777">
          <g>
            <rect x="110" y="30" width="100" height="20" rx="5" fill="rgba(255,255,255,0.5)" />
            <rect x="102" y="52" width="116" height="20" rx="5" fill={W6} />
            <rect x="94" y="74" width="132" height="20" rx="5" fill={W3} />
          </g>
          <g fill="rgba(255,255,255,0.85)">
            <circle cx="124" cy="40" r="3" />
            <circle cx="120" cy="62" r="3" />
            <circle cx="116" cy="84" r="3" />
          </g>
        </Frame>
      )
    case 'maintenance': // gear + wrench
      return (
        <Frame id="art-maint" from="#0891b2" to="#14b8a6">
          <g transform="translate(140 60)" fill={W6}>
            <circle r="26" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <rect key={a} x="-4" y="-34" width="8" height="12" rx="2" transform={`rotate(${a})`} />
            ))}
          </g>
          <circle cx="140" cy="60" r="11" fill="#0b6b74" />
          <path d="M186 40 a12 12 0 1 0 6 15 l16 16 a5 5 0 0 0 7 -7 l-16 -16 a12 12 0 0 0 -13 -8 Z" fill={W} opacity="0.9" />
        </Frame>
      )
    case 'pm': // kanban columns
      return (
        <Frame id="art-pm" from="#1e293b" to="#4338ca">
          {[70, 140, 210].map((x, i) => (
            <g key={x}>
              <rect x={x} y="22" width="46" height="76" rx="6" fill="rgba(255,255,255,0.08)" />
              <rect x={x + 6} y="30" width="34" height="12" rx="3" fill={W6} />
              <rect x={x + 6} y="46" width="34" height="12" rx="3" fill={i === 0 ? W : W3} />
              {i !== 2 && <rect x={x + 6} y="62" width="34" height="12" rx="3" fill={W3} />}
            </g>
          ))}
        </Frame>
      )
    default:
      return null
  }
}
