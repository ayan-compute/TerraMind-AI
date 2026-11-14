import { useState, type ReactNode } from 'react'
import { Download, Info } from 'lucide-react'
import { Card, EmptyState, H2, PageHeader, SampleBadge, VerdictBadge } from '../components/ui'
import { ALL_MONTHS, MONTHS, climateStats, planRotation, screenCrop } from '../lib/analysis'
import type { Crop, Rotation, Site } from '../types'

const Section = ({ title, children }: { title: string; children: ReactNode }) => <Card><H2>{title}</H2>{children}</Card>

const LIMITS = [
  'All figures are sample data for interface preview. They are not NASA measurements.',
  'Monthly averages smooth out short heat waves, dry spells and frost that matter on a real farm.',
  'Season windows and reference ranges are placeholders until the backend supplies its screening thresholds.',
  'Screening compares season averages with ranges. It does not predict yield and ignores soil, irrigation, variety and pests.',
  'Confirm dates and crop choices with a local agronomist or extension service before acting.',
]

interface Props { site: Site; crops: Crop[]; cropId: string; rot: Rotation }

export default function Report({ site, crops, cropId, rot }: Props) {
  const [note, setNote] = useState(false)
  const s = climateStats(site, ALL_MONTHS)
  const plan = planRotation(rot.harvest, rot.planting)
  const find = (id: string) => crops.find((c) => c.id === id) ?? crops[0]
  const first = find(rot.first)
  const next = find(rot.next)
  const same = first.family === next.family
  const climate = [['Average temperature', `${s.meanTemp.toFixed(1)} °C`], ['Total rainfall', `${Math.round(s.totalRain)} mm`], ['Days analyzed', String(s.days)]]

  return (
    <>
      <PageHeader title="Farmer analysis report" subtitle="Your location, climate, crop screening and rotation timing in one place.">
        <button onClick={() => setNote(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
          <Download size={16} />Download report
        </button>
      </PageHeader>
      {note && (
        <p role="status" className="mb-4 flex items-start gap-2 rounded-xl bg-sky-500/10 p-3 text-sm text-sky-200 ring-1 ring-sky-400/30">
          <Info size={16} className="mt-0.5 shrink-0" />Report export isn’t implemented yet. This button is a placeholder for a future feature.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Selected location">
          <p className="font-display text-lg font-medium text-white">{site.name}</p>
          <div className="mt-2"><SampleBadge /></div>
        </Section>

        <Section title="Climate conditions (one sample year)">
          <dl className="grid grid-cols-3 gap-3 text-sm">
            {climate.map(([k, v]) => <div key={k}><dt className="text-slate-500">{k}</dt><dd className="mt-0.5 font-display text-lg font-semibold text-white">{v}</dd></div>)}
          </dl>
        </Section>

        <Section title="Crop suitability screening">
          <div className="space-y-4">
            {crops.map((c) => {
              const r = screenCrop(site, c)
              return (
                <div key={c.id}>
                  <p className="text-sm font-medium text-white">
                    {c.name}
                    <span className="ml-2 text-xs font-normal text-slate-500">sample season {MONTHS[c.season[0]]} to {MONTHS[c.season[1]]}{c.id === cropId ? ', selected crop' : ''}</span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <VerdictBadge v={r.temp} label={`Temperature ${r.stats.meanTemp.toFixed(1)} °C`} />
                    <VerdictBadge v={r.rain} label={`Rainfall ${Math.round(r.stats.totalRain)} mm`} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        <Section title="Rotation timing and crop family diversity">
          <p className="text-sm text-slate-300">{first.name} harvest ({rot.harvest || 'no date'}) then {next.name} planting ({rot.planting || 'no date'})</p>
          {plan.status === 'valid' && <p className="mt-2 text-sm text-slate-300"><b className="font-display text-2xl text-emerald-300">{plan.gapDays}</b> full days between seasons</p>}
          {plan.status === 'invalid' && <p role="alert" className="mt-2 text-sm text-amber-300">The planting date is on or before the harvest date. Fix it in the rotation planner.</p>}
          {plan.status === 'incomplete' && <div className="mt-3"><EmptyState title="No rotation dates yet" hint="Enter them in the rotation planner to include timing here." /></div>}
          <p className="mt-3 text-sm text-slate-300">
            {first.name} and {next.name}: {same ? `same crop family (${first.family}), so no added family diversity.` : 'different crop families, which adds family diversity.'}
          </p>
        </Section>
      </div>

      <Card className="mt-4">
        <H2>Data limitations and practical considerations</H2>
        <ul className="max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
          {LIMITS.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </Card>
    </>
  )
}
