import { useEffect, useState } from 'react'
import { CloudRain, Thermometer } from 'lucide-react'
import { Card, H2, PageHeader, VerdictBadge, cropIcon } from '../components/ui'
import { api } from '../services/api'
import type { CropSuitabilityResult } from '../services/api'
import type { Crop, Site, Verdict } from '../types'

type Props = {
  site: Site
  crops: Crop[]
  cropId: string
  setCropId: (id: string) => void
  latitude: number
  longitude: number
}

const verdict = (value: number, range: [number, number]): Verdict =>
  value < range[0] ? 'below' : value > range[1] ? 'above' : 'within'

export default function LiveSuitability({
  site, crops, cropId, setCropId, latitude, longitude,
}: Props) {
  const [result, setResult] = useState<CropSuitabilityResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setResult(null)

    api.getCropSuitability(latitude, longitude, cropId)
      .then((data) => { if (active) setResult(data) })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Crop analysis failed.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [latitude, longitude, cropId, attempt])

  const currentCrop = crops.find(c => c.id === cropId)

  return (
    <>
      <PageHeader
        title="Crop suitability — NASA screening"
        subtitle={`Historical NASA POWER climate data for ${site.name}. Reference checks are preliminary, not a prediction of yields or an agricultural recommendation.`}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2" role="group" aria-label="Select crop">
        {crops.map(c => {
          const Icon = cropIcon(c.id)
          const selected = c.id === cropId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCropId(c.id)}
              aria-pressed={selected}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left ring-1 ${selected ? 'bg-emerald-500/15 ring-emerald-400/50' : 'bg-white/5 ring-white/10 hover:bg-white/10'}`}
            >
              <Icon className="text-emerald-300" />
              <span>
                <span className="block font-display font-medium text-white">{c.name}</span>
                <span className="text-xs text-slate-400">Family: {c.family}</span>
              </span>
            </button>
          )
        })}
      </div>

      {loading && (
        <Card>
          <p role="status" className="text-slate-300">
            Analyzing {currentCrop?.name ?? cropId} with NASA POWER data…
          </p>
        </Card>
      )}

      {!loading && error && (
        <Card>
          <p role="alert" className="text-amber-300">Could not load NASA crop screening: {error}</p>
          <button
            type="button"
            onClick={() => setAttempt(n => n + 1)}
            className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
          >
            Try again
          </button>
        </Card>
      )}

      {!loading && result && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-display font-semibold text-white">
                  <Thermometer size={18} className="text-emerald-300" />
                  Growing-season temperature
                </h3>
                <VerdictBadge
                  v={verdict(result.seasonal_temperature, result.temperature_reference)}
                  label="Temperature"
                />
              </div>
              <p className="mt-3 font-display text-3xl font-semibold text-white">
                {result.seasonal_temperature.toFixed(2)} <span className="text-base font-normal text-slate-400">°C</span>
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Reference: {result.temperature_reference[0]}–{result.temperature_reference[1]} °C
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Growing season: {result.season_start} to {result.season_end}
              </p>
            </Card>

            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-display font-semibold text-white">
                  <CloudRain size={18} className="text-emerald-300" />
                  Annual precipitation (2025)
                </h3>
                <VerdictBadge
                  v={verdict(result.annual_rainfall_2025, result.annual_rainfall_reference)}
                  label="Rainfall"
                />
              </div>
              <p className="mt-3 font-display text-3xl font-semibold text-white">
                {result.annual_rainfall_2025.toFixed(2)} <span className="text-base font-normal text-slate-400">mm</span>
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Annual reference: {result.annual_rainfall_reference[0]}–{result.annual_rainfall_reference[1]} mm
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Calendar-year total, not growing-season rainfall
              </p>
            </Card>
          </div>

          <Card className="mt-4">
            <H2>Historical climate measurements</H2>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Crop</dt>
                <dd className="mt-1 font-medium text-white">{currentCrop?.name ?? result.crop}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Growing-season rainfall</dt>
                <dd className="mt-1 font-medium text-white">{result.seasonal_rainfall.toFixed(2)} mm</dd>
              </div>
              <div>
                <dt className="text-slate-500">Analyzed coordinates</dt>
                <dd className="mt-1 font-medium text-white">{latitude}, {longitude}</dd>
              </div>
            </dl>
          </Card>

          <Card className="mt-4">
            <H2>How to interpret this screening</H2>
            <p className="text-sm leading-relaxed text-slate-300">
              A value outside its reference band signals a condition to investigate; it does not
              mean the crop cannot grow. Temperature is checked over the specified crop season,
              while rainfall is checked against calendar-year 2025 totals. The thresholds are
              preliminary and do not account for irrigation, soil, extreme weather, or management.
            </p>
          </Card>
        </>
      )}
    </>
  )
}
