import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { CalendarDays, CloudRain, Thermometer } from 'lucide-react'
import { Card, H2, Stat, VerdictBadge } from '../components/ui'
import { ALL_MONTHS, MONTHS, climateStats, screenCrop } from '../lib/analysis'
import type { Crop, Page, Site } from '../types'

const btn = 'rounded-xl px-4 py-2.5 text-sm font-semibold'

interface Props { site: Site; sites: Site[]; crops: Crop[]; go: (p: Page) => void; pick: (cropId: string) => void }

export default function Overview({ site, sites, crops, go, pick }: Props) {
  const s = climateStats(site, ALL_MONTHS)
  const isNASA = site.id === 'islamabad-nasa' || site.id === 'custom-nasa'
  const [nasa, setNasa] = useState<{
  average_temperature: number
  total_rainfall: number
  days_analyzed: number
} | null>(null)

const [nasaError, setNasaError] = useState(false)

useEffect(() => {
  api.getClimate()
    .then(setNasa)
    .catch(() => setNasaError(true))
}, [])
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
          <Stat
  icon={Thermometer}
  label="Average temperature"
  value={`${s.meanTemp.toFixed(1)} °C`}
  hint={
    isNASA
      ? "Mean of 12 NASA POWER monthly averages"
      : "Mean of 12 sample months"
  }
/>

<Stat
  icon={CloudRain}
  label="Total precipitation"
  value={`${Math.round(s.totalRain)} mm`}
  hint={
    isNASA
      ? "Sum of NASA POWER monthly rainfall totals"
      : "Sum of 12 sample months"
  }
/>

<Stat
  icon={CalendarDays}
  label={isNASA ? "Months analyzed" : "Days analyzed"}
  value={isNASA ? "12" : String(s.days)}
  hint={isNASA ? "January–December 2025" : "One sample year"}
/>
        </div>
      </section>
<section className="glass rounded-2xl p-5">
  <H2>NASA POWER Data — Islamabad, January 1–7, 2025</H2>

  {nasa ? (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat
        icon={Thermometer}
        label="Average temperature"
        value={`${nasa.average_temperature} °C`}
      />

      <Stat
        icon={CloudRain}
        label="Total rainfall"
        value={`${nasa.total_rainfall} mm`}
      />

      <Stat
        icon={CalendarDays}
        label="Days analyzed"
        value={String(nasa.days_analyzed)}
      />
    </div>
  ) : (
    <p className="text-slate-400">
      {nasaError ? "Could not connect to FastAPI." : "Loading NASA data..."}
    </p>
  )}
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