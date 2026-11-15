import { CloudSun, FileText, LayoutDashboard, Repeat, Satellite, Wheat, type LucideIcon } from 'lucide-react'
import type { Page } from '../types'

export const NAV: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'climate', label: 'Climate intelligence', icon: CloudSun },
  { id: 'suitability', label: 'Crop suitability', icon: Wheat },
  { id: 'rotation', label: 'Rotation planner', icon: Repeat },
  { id: 'report', label: 'Farmer report', icon: FileText },
]

export function Sidebar({ page, go, open, close }: { page: Page; go: (p: Page) => void; open: boolean; close: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={close} />}
      <aside className={`glass fixed inset-y-0 left-0 z-40 flex w-64 flex-col p-4 transition-transform lg:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-2 pb-6 pt-2">
          <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"><Satellite size={20} /></div>
          <div>
            <p className="font-display font-semibold text-white">TerraMind AI</p>
            <p className="text-xs text-emerald-300/80">From Orbit to Harvest</p>
          </div>
        </div>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              aria-current={page === id ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${page === id ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
        <p className="mt-auto px-2 text-xs leading-relaxed text-slate-500">
          Built for the NASA Space Apps Challenge.
          Powered by NASA POWER historical climate data.
          Preliminary crop analysis and rotation planning.
        </p>
      </aside>
    </>
  )
}
