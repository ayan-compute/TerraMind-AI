import type { ReactNode } from 'react'
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Inbox, Loader2, Sprout, Wheat, type LucideIcon } from 'lucide-react'
import { SAMPLE_NOTE } from '../data/mock'
import type { Verdict } from '../types'

export const inputCls = 'w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-400/70'
export const cropIcon = (id: string): LucideIcon => (id === 'wheat' ? Wheat : Sprout)

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`glass rounded-2xl p-5 ${className}`}>{children}</section>
)

export const H2 = ({ children }: { children: ReactNode }) => <h2 className="mb-3 text-sm font-medium text-slate-400">{children}</h2>

export const PageHeader = ({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>
    </div>
    {children}
  </div>
)

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block text-sm">
    <span className="mb-1.5 block text-slate-400">{label}</span>
    {children}
  </label>
)

export const Stat = ({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) => (
  <Card>
    <div className="flex items-center gap-2 text-sm text-slate-400"><Icon size={16} />{label}</div>
    <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </Card>
)

export const SampleBadge = () => (
  <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300 ring-1 ring-sky-400/30">{SAMPLE_NOTE}</span>
)

const TONE = {
  within: { Icon: CheckCircle2, text: 'within range', cls: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30' },
  below: { Icon: ArrowDown, text: 'below range', cls: 'bg-amber-500/15 text-amber-300 ring-amber-400/30' },
  above: { Icon: ArrowUp, text: 'above range', cls: 'bg-amber-500/15 text-amber-300 ring-amber-400/30' },
}

export const VerdictBadge = ({ v, label }: { v: Verdict; label: string }) => {
  const { Icon, text, cls } = TONE[v]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>
      <Icon size={14} />{label}: {text}
    </span>
  )
}

export const Loading = () => (
  <div role="status" className="grid place-items-center gap-3 py-24 text-slate-400">
    <Loader2 className="animate-spin text-emerald-300" />Loading sample data
  </div>
)

export const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Card className="mx-auto max-w-md text-center">
    <AlertTriangle className="mx-auto text-amber-300" />
    <p className="mt-3 font-medium text-white">Data could not be loaded</p>
    <p className="mt-1 text-sm text-slate-400">{message}</p>
    <button onClick={onRetry} className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">Try again</button>
  </Card>
)

export const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
  <div className="rounded-xl border border-dashed border-white/15 p-6 text-center">
    <Inbox className="mx-auto text-slate-500" />
    <p className="mt-2 font-medium text-slate-200">{title}</p>
    <p className="text-sm text-slate-500">{hint}</p>
  </div>
)
