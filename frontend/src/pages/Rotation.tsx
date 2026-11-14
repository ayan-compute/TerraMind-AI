import type { ChangeEvent } from 'react'
import { AlertTriangle, CheckCircle2, type LucideIcon } from 'lucide-react'
import { Card, EmptyState, Field, PageHeader, cropIcon, inputCls } from '../components/ui'
import { planRotation } from '../lib/analysis'
import type { Crop, Rotation } from '../types'

const Milestone = ({ icon: Icon, title, date }: { icon: LucideIcon; title: string; date: string }) => (
  <div className="rounded-xl bg-white/5 p-4 sm:w-44">
    <Icon size={18} className="text-emerald-300" />
    <p className="mt-2 text-sm font-medium text-white">{title}</p>
    <p className="text-xs text-slate-400">{date || 'Date not set'}</p>
  </div>
)

const dash = <span className="hidden h-px flex-1 border-t border-dashed border-emerald-400/40 sm:block" />

export default function RotationPlanner({ crops, rot, setRot }: { crops: Crop[]; rot: Rotation; setRot: (r: Rotation) => void }) {
  const set = (k: keyof Rotation) => (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setRot({ ...rot, [k]: e.target.value })
  const find = (id: string) => crops.find((c) => c.id === id) ?? crops[0]
  const first = find(rot.first)
  const next = find(rot.next)
  const plan = planRotation(rot.harvest, rot.planting)
  const same = first.family === next.family
  const options = crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)

  return (
    <>
      <PageHeader title="Crop rotation planner" subtitle="Choose two crops and their dates to see the gap between seasons and whether the rotation adds crop family diversity." />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Field label="First crop"><select className={inputCls} value={rot.first} onChange={set('first')}>{options}</select></Field>
            <Field label="First crop harvest date"><input type="date" className={inputCls} value={rot.harvest} onChange={set('harvest')} /></Field>
            <Field label="Next crop"><select className={inputCls} value={rot.next} onChange={set('next')}>{options}</select></Field>
            <Field label="Next crop planting date"><input type="date" className={inputCls} value={rot.planting} onChange={set('planting')} /></Field>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Milestone icon={cropIcon(first.id)} title={`${first.name} harvest`} date={rot.harvest} />
              {dash}
              {plan.status === 'valid' ? (
                <div className="text-center">
                  <p className="font-display text-4xl font-semibold text-emerald-300">{plan.gapDays}</p>
                  <p className="text-xs text-slate-400">full {plan.gapDays === 1 ? 'day' : 'days'} between</p>
                </div>
              ) : (
                <div className="px-6 text-center text-slate-500">?</div>
              )}
              {dash}
              <Milestone icon={cropIcon(next.id)} title={`${next.name} planting`} date={rot.planting} />
            </div>
            <div className="mt-5">
              {plan.status === 'valid' && (
                <p className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 size={16} />Dates are valid. The harvest day and the planting day are not counted in the gap.</p>
              )}
              {plan.status === 'invalid' && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200 ring-1 ring-amber-400/30">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  The planting date is on or before the harvest date. Choose a planting date after {rot.harvest}.
                </p>
              )}
              {plan.status === 'incomplete' && <EmptyState title="Enter both dates" hint="Add the harvest date and the next planting date to see the gap between seasons." />}
            </div>
          </Card>

          <Card>
            <h3 className="font-display font-semibold text-white">Crop family diversity</h3>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="rounded-lg bg-white/5 px-2.5 py-1">{first.name}: {first.family}</span>
              <span aria-hidden>→</span>
              <span className="rounded-lg bg-white/5 px-2.5 py-1">{next.name}: {next.family}</span>
            </div>
            <p className={`mt-3 text-sm font-medium ${same ? 'text-amber-300' : 'text-emerald-300'}`}>
              {same ? 'Same crop family. This rotation does not add crop family diversity.' : 'Different crop families. This rotation adds crop family diversity.'}
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
