import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

// Grouped left navigation shared by the admin (AdminLayout) and Vikku PM. Styling lives in the
// `.adm` scope (index.css). Sections: [{ title, items: [{ key, label, icon | dot, to | onClick,
// active, tag }] }] — `dot` is a colour swatch (projects), `tag` a small trailing label like "Pro".
export function SideNav({ sections, collapsed = false, onNavigate }) {
  return (
    <nav className="flex flex-col gap-4">
      {sections.filter(s => s.items.length).map(({ title, items }, i) => (
        <div key={title || i}>
          {title && <p className={`px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400 ${collapsed ? 'sr-only' : ''}`}>{title}</p>}
          <ul className="flex flex-col gap-0.5">
            {items.map(({ key, label, icon: Icon, dot, to, onClick, active, tag }) => {
              const cls = `relative flex w-full items-center gap-2.5 rounded-lg h-8 text-[13px] text-left transition-colors ${collapsed ? 'justify-center px-0' : 'px-3'} ${
                active ? 'bg-orange-50 text-orange-800 font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
              const inner = (
                <>
                  {active && <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-orange-600" />}
                  {dot
                    ? <span aria-hidden="true" className="flex h-4 w-4 flex-none items-center justify-center"><span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/5" style={{ backgroundColor: dot }} /></span>
                    : Icon && <Icon size={16} strokeWidth={1.75} className={`flex-none ${active ? 'text-orange-600' : 'text-slate-400'}`} />}
                  <span className={collapsed ? 'sr-only' : 'min-w-0 flex-1 truncate'}>{label}</span>
                  {tag && !collapsed && <span className="text-[10px] font-medium text-amber-700">{tag}</span>}
                </>
              )
              const common = { title: collapsed ? label : undefined, 'aria-current': active ? 'page' : undefined, className: cls }
              return (
                <li key={key || to || label}>
                  {to
                    ? <Link to={to} onClick={onNavigate} {...common}>{inner}</Link>
                    : <button type="button" onClick={() => { onClick?.(); onNavigate?.() }} {...common}>{inner}</button>}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function readCollapsed(key) {
  try { return localStorage.getItem(key) === 'collapsed' } catch { return false }
}

// Desktop sidebar: full width on large screens, icons only on tablets or when collapsed (remembered
// per storageKey). Hidden on phones; pages give phones their own navigation. `stick` positions it
// under the page's header, e.g. 'top-16 h-[calc(100vh-4rem)]'.
export function Sidebar({ sections, storageKey, stick }) {
  const [collapsed, setCollapsed] = useState(() => readCollapsed(storageKey))
  const toggle = () => setCollapsed(c => {
    try { localStorage.setItem(storageKey, c ? 'open' : 'collapsed') } catch { /* private mode */ }
    return !c
  })
  return (
    <aside className={`hidden md:flex flex-col sticky ${stick} flex-none border-r border-slate-200 bg-white transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-16 lg:w-[232px]'}`}>
      <div className="flex-1 overflow-y-auto px-2 py-4 lg:px-3">
        <div className={collapsed ? '' : 'lg:hidden'}><SideNav sections={sections} collapsed /></div>
        {!collapsed && <div className="hidden lg:block"><SideNav sections={sections} /></div>}
      </div>
      <button type="button" onClick={toggle}
        className="hidden lg:flex items-center gap-2 border-t border-slate-200 h-11 px-5 text-[13px] text-slate-500 hover:text-slate-900"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> Collapse</>}
      </button>
    </aside>
  )
}
