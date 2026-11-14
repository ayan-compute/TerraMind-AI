import { CalendarDays, CloudRain, Thermometer } from 'lucide-react'
import { Card, H2, Stat, VerdictBadge } from '../components/ui'
import { ALL_MONTHS, MONTHS, climateStats, screenCrop } from '../lib/analysis'
import type { Crop, Page, Site } from '../types'

const btn = 'rounded-xl px-4 py-2.5 text-sm font-semibold'

interface Props { site: Site; sites: Site[]; crops: Crop[]; go: (p: Page) => void; pick: (cropId: string) => void }

export default function Overview({ site, sites, crops, go, pick }: Props) {
  const s = climateStats(site, ALL_MONTHS)
  return (
    <div className="space-y-8">
      <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
        <svg aria-hidden viewBox="0 0 200 200" fill="none" stroke="currentColor" className="pointer-events-none absolute -right-24 -top-24 size-[26rem] text-emerald-400/25">
          <circle cx="100" cy="100" r="90" />
          <ellipse cx="100" cy="100" rx="90" ry="30" transform="rotate(-25 100 100)" />
          <ellipse cx="100" cy="100" rx="55" ry="90" />
          <circle cx="172" cy="62" r="4" fill="currentColor" />
        </svg>
        <p className="relative font-display text-sm text-emerald-300">TerraMind AI</p>
        <h1 className="relative mt-3 font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl">From Orbit to Harvest</h1>
        <p className="relative mt-4 max-w-xl text-slate-300">Understand local climate, screen crops against reference ranges and plan rotations, built around NASA satellite-derived climate data.</p>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <button onClick={() => go('climate')} className={`${btn} bg-emerald-500 text-slate-950 hover:bg-emerald-400`}>Explore climate</button>
          <button onClick={() => go('rotation')} className={`${btn} bg-white/10 text-white hover:bg-white/15`}>Plan a rotation</button>
        </div>
      </div>

      <section>
        <H2>Climate overview for {site.name}</H2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat icon={Thermometer} label="Average temperature" value={`${s.meanTemp.toFixed(1)} °C`} hint="Mean of 12 sample months" />
          <Stat icon={CloudRain} label="Total precipitation" value={`${Math.round(s.totalRain)} mm`} hint="Sum of 12 sample months" />
          <Stat icon={CalendarDays} label="Days analyzed" value={String(s.days)} hint="One sample year" />
        </div>
      </section>

      <section>
        <H2>Crop analysis summary</H2>
        <div className="grid gap-4 md:grid-cols-2">
          {crops.map((c) => {
            const r = screenCrop(site, c)
            return (
              <Card key={c.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-white">{c.name}</h3>
                  <span className="text-xs text-slate-500">Sample season {MONTHS[c.season[0]]} to {MONTHS[c.season[1]]}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Season mean {r.stats.meanTemp.toFixed(1)} °C, {Math.round(r.stats.totalRain)} mm rainfall</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <VerdictBadge v={r.temp} label="Temperature" />
                  <VerdictBadge v={r.rain} label="Rainfall" />
                </div>
                <button onClick={() => pick(c.id)} className="mt-4 text-sm font-medium text-emerald-300 hover:text-emerald-200">See {c.name.toLowerCase()} details</button>
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <H2>Recent analysis results (sample runs)</H2>
        <div className="glass divide-y divide-white/5 rounded-2xl">
          {sites.flatMap((st) =>
            crops.map((c) => {
              const r = screenCrop(st, c)
              return (
                <div key={st.id + c.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <span className="text-slate-200">{c.name} <span className="text-slate-500">at {st.name}</span></span>
                  <span className="flex flex-wrap gap-2">
                    <VerdictBadge v={r.temp} label="Temperature" />
                    <VerdictBadge v={r.rain} label="Rainfall" />
                  </span>
                </div>
              )
            }),
          )}
        </div>
      </section>
    </div>
  )
}
