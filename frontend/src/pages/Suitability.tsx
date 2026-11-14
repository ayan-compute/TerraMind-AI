import { CloudRain, Thermometer } from 'lucide-react'
import { Card, H2, PageHeader, VerdictBadge, cropIcon } from '../components/ui'
import { MONTHS, screenCrop } from '../lib/analysis'
import type { Crop, Site } from '../types'

const MEANING = {
  within: 'falls inside the reference range used for this screening.',
  below: 'is lower than the reference range, so this check is flagged.',
  above: 'is higher than the reference range, so this check is flagged.',
}

function RangeBar({ value, range, unit }: { value: number; range: [number, number]; unit: string }) {
  const [lo, hi] = range
  const pad = (hi - lo) * 0.6
  const min = unit === 'mm' ? Math.max(0, lo - pad) : lo - pad
  const max = hi + pad
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100))
  const ok = value >= lo && value <= hi
  return (
    <div className="mt-5" role="img" aria-label={`${value.toFixed(1)} ${unit}; reference range ${lo} to ${hi} ${unit}`}>
      <div className="relative h-3 rounded-full bg-white/10">
        <div className="absolute inset-y-0 rounded-full bg-emerald-400/30 ring-1 ring-emerald-400/60" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
        <div className={`absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-900 ${ok ? 'bg-emerald-300' : 'bg-amber-400'}`} style={{ left: `${pct(value)}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{Math.round(min)}</span>
        <span className="text-emerald-300/80">Reference {lo} to {hi} {unit}</span>
        <span>{Math.round(max)}</span>
      </div>
    </div>
  )
}

interface Props { site: Site; crops: Crop[]; cropId: string; setCropId: (id: string) => void }

export default function Suitability({ site, crops, cropId, setCropId }: Props) {
  const crop = crops.find((c) => c.id === cropId) ?? crops[0]
  const r = screenCrop(site, crop)
  const window = `${MONTHS[crop.season[0]]} to ${MONTHS[crop.season[1]]}`
  const checks = [
    { icon: Thermometer, title: 'Temperature', label: 'Growing-season mean temperature', value: r.stats.meanTemp, unit: '°C', range: crop.tempRange, v: r.temp },
    { icon: CloudRain, title: 'Rainfall', label: 'Growing-season total rainfall', value: r.stats.totalRain, unit: 'mm', range: crop.rainRange, v: r.rain },
  ]
  const facts = [
    ['Season window (sample)', window], ['Days', r.stats.days], ['Mean temperature', `${r.stats.meanTemp.toFixed(1)} °C`],
    ['Total rainfall', `${Math.round(r.stats.totalRain)} mm`], ['Warmest month', r.stats.warmest], ['Wettest month', r.stats.wettest],
  ]

  return (
    <>
      <PageHeader title="Crop suitability" subtitle={`Screening ${site.name} against reference ranges. Each result says whether a value is inside or outside a range. It is not a yield forecast.`} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2" role="group" aria-label="Select crop">
        {crops.map((c) => {
          const Icon = cropIcon(c.id)
          const on = c.id === crop.id
          return (
            <button key={c.id} onClick={() => setCropId(c.id)} aria-pressed={on}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left ring-1 ${on ? 'bg-emerald-500/15 ring-emerald-400/50' : 'bg-white/5 ring-white/10 hover:bg-white/10'}`}>
              <Icon className="text-emerald-300" />
              <span>
                <span className="block font-display font-medium text-white">{c.name}</span>
                <span className="text-xs text-slate-400">Family: {c.family}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {checks.map((k) => (
          <Card key={k.title}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-display font-semibold text-white"><k.icon size={18} className="text-emerald-300" />{k.title}</h3>
              <VerdictBadge v={k.v} label={k.title} />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-white">
              {k.value.toFixed(k.unit === 'mm' ? 0 : 1)} <span className="text-base font-normal text-slate-400">{k.unit}</span>
            </p>
            <RangeBar value={k.value} range={k.range} unit={k.unit} />
            <p className="mt-4 text-sm leading-relaxed text-slate-300">{k.label} {MEANING[k.v]}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <H2>Growing-season climate statistics for {crop.name.toLowerCase()}</H2>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
          {facts.map(([k, v]) => (
            <div key={k}><dt className="text-slate-500">{k}</dt><dd className="mt-0.5 font-medium text-white">{v}</dd></div>
          ))}
        </dl>
      </Card>

      <Card className="mt-4">
        <H2>What these results mean</H2>
        <ul className="max-w-3xl space-y-2 text-sm leading-relaxed text-slate-300">
          <li><b className="text-emerald-300">Within range:</b> the season average or total sits inside the reference band.</li>
          <li><b className="text-amber-300">Below or above range:</b> the value sits outside the band. Treat it as a flag to look closer, not a verdict.</li>
          <li>Season windows and reference ranges are placeholders until your Python backend supplies its screening thresholds. No suitability percentages are calculated.</li>
        </ul>
      </Card>
    </>
  )
}
