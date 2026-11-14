import { useEffect, useState, type ReactNode } from 'react'
import { Download } from 'lucide-react'
import { Card, EmptyState, H2, PageHeader, SampleBadge, VerdictBadge } from '../components/ui'
import { ALL_MONTHS, MONTHS, climateStats, planRotation, screenCrop } from '../lib/analysis'
import { api, type CropRotationResult, type CropSuitabilityResult } from '../services/api'
import type { Crop, Rotation, Site, Verdict } from '../types'

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card><H2>{title}</H2>{children}</Card>
)

const referenceVerdict = (value: number, [minimum, maximum]: [number, number]): Verdict =>
  value < minimum ? 'below' : value > maximum ? 'above' : 'within'

type Props = {
  site: Site
  crops: Crop[]
  cropId: string
  rot: Rotation
  latitude?: number
  longitude?: number
}

export default function Report({ site, crops, cropId, rot, latitude, longitude }: Props) {
  const isNASA = site.id === 'islamabad-nasa' || site.id === 'custom-nasa'
  const s = climateStats(site, ALL_MONTHS)
  const selectedCrop = crops.find(c => c.id === cropId)
  const first = crops.find(c => c.id === rot.first)
  const next = crops.find(c => c.id === rot.next)
  const plan = planRotation(rot.harvest, rot.planting)

  const [cropResult, setCropResult] = useState<CropSuitabilityResult | null>(null)
  const [cropLoading, setCropLoading] = useState(false)
  const [cropError, setCropError] = useState('')
  const [rotationResult, setRotationResult] = useState<CropRotationResult | null>(null)
  const [rotationLoading, setRotationLoading] = useState(false)
  const [rotationError, setRotationError] = useState('')

  useEffect(() => {
    let active = true
    setCropResult(null)
    setCropError('')

    if (!isNASA) {
      setCropLoading(false)
      return () => { active = false }
    }
    if (latitude === undefined || longitude === undefined) {
      setCropLoading(false)
      setCropError('Coordinates are missing for the NASA crop analysis.')
      return () => { active = false }
    }

    setCropLoading(true)
    api.getCropSuitability(latitude, longitude, cropId)
      .then(result => { if (active) setCropResult(result) })
      .catch((err: unknown) => {
        if (active) setCropError(err instanceof Error ? err.message : 'Crop screening failed.')
      })
      .finally(() => { if (active) setCropLoading(false) })

    return () => { active = false }
  }, [isNASA, latitude, longitude, cropId])

  useEffect(() => {
    let active = true
    setRotationResult(null)
    setRotationError('')

    if (plan.status !== 'valid') {
      setRotationLoading(false)
      return () => { active = false }
    }

    setRotationLoading(true)
    api.getCropRotation(rot.first, rot.next, rot.harvest, rot.planting)
      .then(result => { if (active) setRotationResult(result) })
      .catch((err: unknown) => {
        if (active) setRotationError(err instanceof Error ? err.message : 'Rotation check failed.')
      })
      .finally(() => { if (active) setRotationLoading(false) })

    return () => { active = false }
  }, [rot.first, rot.next, rot.harvest, rot.planting, plan.status])

  const canExport = !cropLoading && !rotationLoading &&
    (!isNASA || cropResult !== null) &&
    (plan.status !== 'valid' || rotationResult !== null)

  const downloadReport = () => {
    if (!canExport) return

    const lines = [
      'TERRAMIND AI — FARMER ANALYSIS REPORT',
      `Location: ${site.name}`,
      `Source: ${isNASA ? 'NASA POWER, historical 2025 climate measurements' : 'Sample data, not NASA measurements'}`,
      latitude !== undefined && longitude !== undefined && isNASA
        ? `Coordinates: ${latitude}, ${longitude}` : '',
      '',
      'CLIMATE',
      `${isNASA ? '2025' : 'Sample year'} mean of monthly temperatures (unweighted): ${s.meanTemp.toFixed(2)} °C`,
      `${isNASA ? '2025' : 'Sample year'} total precipitation: ${s.totalRain.toFixed(2)} mm`,
      '',
      'CROP SCREENING',
      isNASA && cropResult
        ? `${selectedCrop?.name ?? cropResult.crop}: ${cropResult.seasonal_temperature} °C growing-season temperature (${cropResult.temperature_result}); ${cropResult.annual_rainfall_2025} mm annual rainfall (${cropResult.rainfall_result}). Season ${cropResult.season_start} to ${cropResult.season_end}.`
        : isNASA ? 'NASA crop screening unavailable.' : 'Sample-data crop screening only.',
      '',
      'ROTATION',
      `Sequence: ${first?.name ?? rot.first} → ${next?.name ?? rot.next}`,
      `Harvest: ${rot.harvest || 'not set'}; planting: ${rot.planting || 'not set'}`,
      rotationResult
        ? `Full days between: ${rotationResult.gap_days}; family diversity: ${rotationResult.family_diversity}.`
        : plan.status === 'invalid' ? 'Invalid rotation dates.' : 'Rotation not evaluated.',
      '',
      'LIMITATIONS',
      'Crop screening uses preliminary reference bands, not validated yield predictions.',
      'Seasonal temperature and calendar-year annual rainfall are different comparison windows.',
      'Climate measurements do not account for soil, irrigation, crop variety, pests, or extreme events.',
      'Rotation analysis checks crop families and dates only; consult local agricultural guidance.',
    ].filter(Boolean)

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'TerraMind-Analysis-Report.txt'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        title="Farmer analysis report"
        subtitle="Your selected location, climate, crop screening and rotation timing in one place."
      >
        <button
          type="button"
          onClick={downloadReport}
          disabled={!canExport}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} /> Download text report
        </button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Selected location and data source">
          <p className="font-display text-lg font-medium text-white">{site.name}</p>
          {isNASA ? (
            <p className="mt-2 text-xs text-emerald-300">NASA POWER · Historical 2025 measurements</p>
          ) : (
            <div className="mt-2"><SampleBadge /></div>
          )}
          {isNASA && latitude !== undefined && longitude !== undefined && (
            <p className="mt-2 text-sm text-slate-400">Coordinates: {latitude}, {longitude}</p>
          )}
        </Section>

        <Section title={isNASA ? 'Climate conditions (2025)' : 'Climate conditions (sample year)'}>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400">Mean of monthly temperatures</dt>
              <dd className="mt-1 font-display text-xl font-semibold text-white">{s.meanTemp.toFixed(1)} °C</dd>
            </div>
            <div>
              <dt className="text-slate-400">Annual rainfall</dt>
              <dd className="mt-1 font-display text-xl font-semibold text-white">{s.totalRain.toFixed(1)} mm</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-400">
            The temperature value is an unweighted mean of 12 monthly averages; it is not a daily-weighted annual average.
          </p>
        </Section>

        <Section title={isNASA ? `Crop screening — ${selectedCrop?.name ?? cropId}` : 'Crop screening (sample data)'}>
          {isNASA ? (
            cropLoading ? <p className="text-sm text-slate-300" role="status">Analyzing crop with NASA POWER data…</p>
              : cropError ? <p className="text-sm text-amber-300" role="alert">{cropError}</p>
                : cropResult ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-white">Growing-season mean: {cropResult.seasonal_temperature.toFixed(2)} °C</p>
                      <p className="mt-1 text-slate-400">Reference: {cropResult.temperature_reference[0]}–{cropResult.temperature_reference[1]} °C</p>
                      <div className="mt-2"><VerdictBadge v={referenceVerdict(cropResult.seasonal_temperature, cropResult.temperature_reference)} label="Temperature" /></div>
                    </div>
                    <div>
                      <p className="text-white">Annual rainfall (2025): {cropResult.annual_rainfall_2025.toFixed(2)} mm</p>
                      <p className="mt-1 text-slate-400">Reference: {cropResult.annual_rainfall_reference[0]}–{cropResult.annual_rainfall_reference[1]} mm</p>
                      <div className="mt-2"><VerdictBadge v={referenceVerdict(cropResult.annual_rainfall_2025, cropResult.annual_rainfall_reference)} label="Rainfall" /></div>
                    </div>
                    <p className="text-xs text-slate-400">Crop season: {cropResult.season_start} to {cropResult.season_end}.</p>
                  </div>
                ) : <p className="text-sm text-slate-400">No crop screening returned.</p>
          ) : (
            <div className="space-y-4">
              {crops.map(c => {
                const r = screenCrop(site, c)
                return (
                  <div key={c.id}>
                    <p className="text-sm font-medium text-white">
                      {c.name} <span className="text-xs font-normal text-slate-400">sample season {MONTHS[c.season[0]]}–{MONTHS[c.season[1]]}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <VerdictBadge v={r.temp} label="Temperature" />
                      <VerdictBadge v={r.rain} label="Rainfall" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        <Section title="Rotation timing and crop family diversity">
          <p className="text-sm text-slate-300">
            {first?.name ?? rot.first} harvest ({rot.harvest || 'no date'}) then {next?.name ?? rot.next} planting ({rot.planting || 'no date'})
          </p>
          {plan.status === 'invalid' && (
            <p role="alert" className="mt-2 text-sm text-amber-300">The planting date must be after the harvest date.</p>
          )}
          {plan.status === 'incomplete' && (
            <div className="mt-3"><EmptyState title="No rotation dates yet" hint="Enter the harvest and planting dates in the rotation planner." /></div>
          )}
          {plan.status === 'valid' && rotationLoading && (
            <p className="mt-2 text-sm text-slate-300" role="status">Checking rotation with Python…</p>
          )}
          {plan.status === 'valid' && rotationError && (
            <p className="mt-2 text-sm text-amber-300" role="alert">{rotationError}</p>
          )}
          {rotationResult && (
            <>
              <p className="mt-2 text-sm text-slate-300">
                <b className="font-display text-2xl text-emerald-300">{rotationResult.gap_days}</b> full days between seasons
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {rotationResult.family_diversity}: {rotationResult.first_family} → {rotationResult.next_family}
              </p>
              <p className="mt-2 text-xs text-slate-400">{rotationResult.note}</p>
            </>
          )}
        </Section>
      </div>

      <Card className="mt-4">
        <H2>Data limitations and practical considerations</H2>
        <ul className="max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>{isNASA ? 'Climate values are derived from historical NASA POWER data for 2025, not live weather or forecasts.' : 'This location displays demonstration data, not NASA measurements.'}</li>
          <li>Monthly means can hide heat waves, droughts, and frost events important to real farms.</li>
          <li>Crop thresholds are preliminary reference ranges, not verified yield predictions or planting recommendations.</li>
          <li>Growing-season temperature and calendar-year rainfall use different periods. Irrigation, soil, crop variety, and pests are not modeled.</li>
          <li>Rotation screening evaluates the date gap and crop-family diversity only. Confirm agricultural decisions with local extension guidance.</li>
        </ul>
      </Card>
    </>
  )
}
