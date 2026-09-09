import { useState } from 'react'
import { TEMPLATES, CATEGORY_ORDER, CATEGORY_META } from '../../lib/projectTemplates'

// Categorized template picker, shared by the New Project page and the
// dashboard "Start from Template" popup. Categories collapse to an
// accordion so the list doesn't turn into a wall of scroll.
export default function TemplateGallery({ selectedKey, onPick, includeBlank = true }) {
  const selectedCategory = TEMPLATES.find((t) => t.key === selectedKey)?.category || null
  const [expandedCat, setExpandedCat] = useState(selectedCategory)

  const tplCard = (t) => (
    <button
      key={t.key}
      type="button"
      onClick={() => onPick(t.key)}
      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
        selectedKey === t.key
          ? 'border-white bg-white/10'
          : 'border-white/[0.08] hover:border-white/25 hover:bg-white/[0.04]'
      }`}
    >
      <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
        <t.Icon size={18} className={selectedKey === t.key ? 'text-white' : 'text-white/60'} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white leading-tight">{t.name}</p>
        {t.description && <p className="text-[11px] text-white/40 mt-1">{t.description}</p>}
      </div>
    </button>
  )

  const grid = 'grid grid-cols-1 sm:grid-cols-2 gap-3'

  return (
    <div className="space-y-3">
      {includeBlank && (
        <div className={`${grid} mb-3`}>
          {TEMPLATES.filter((t) => !t.category).map(tplCard)}
        </div>
      )}
      {CATEGORY_ORDER.map((cat) => {
        const group = TEMPLATES.filter((t) => t.category === cat)
        if (group.length === 0) return null
        const meta = CATEGORY_META[cat] || {}
        const isOpen = expandedCat === cat
        return (
          <div key={cat} className="rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedCat(isOpen ? null : cat)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 bg-gradient-to-r ${meta.gradient || 'from-white/10 to-white/5'}`}
            >
              <div className="min-w-0">
                <h3 className="font-display font-bold text-sm text-white">{cat}</h3>
                {meta.desc && <p className="text-[11px] text-white/80 mt-0.5 truncate">{meta.desc}</p>}
              </div>
              <span className={`text-white/70 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {isOpen && (
              <div className={`${grid} p-3 bg-white/[0.02] border border-t-0 border-white/[0.06] rounded-b-xl`}>
                {group.map(tplCard)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
