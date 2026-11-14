import { useState, type ChangeEvent } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarDays, CloudRain, Droplets, Thermometer } from 'lucide-react'
import { Card, Field, H2, PageHeader, Stat, inputCls } from '../components/ui'
import { MONTHS, climateStats, monthSpan } from '../lib/analysis'
import type { Crop, Site } from '../types'

const axis = { stroke: '#475569', tick: { fill: '#94a3b8', fontSize: 12 } }
const tip = { contentStyle: { background: '#0b1426', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12 }, cursor: { fill: 'rgba(255,255,255,.05)' } }
const opts = MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)

export default function Climate({ site, crops }: { site: Site; crops: Crop[] }) {
  const [range, setRange] = useState<[number, number]>([0, 11])
  const months = monthSpan(...range)
  const st = climateStats(site, months)
  const data = months.map((m) => ({ month: MONTHS[m], temp: site.tempC[m], rain: site.rainMm[m] }))
  const label = `${MONTHS[range[0]]} to ${MONTHS[range[1]]}`
  const presets: { name: string; r: [number, number] }[] = [
    { name: 'Full year', r: [0, 11] },
    ...crops.map((c) => ({ name: `${c.name} season`, r: c.season })),
  ]
  const pick = (i: 0 | 1) => (e: ChangeEvent<HTMLSelectElement>) => {
    const v = Number(e.target.value)
    setRange(i === 0 ? [v, range[1]] : [range[0], v])
  }

  return (
    <>
      <PageHeader title="Climate intelligence" subtitle={`Monthly temperature and rainfall for ${site.name}. Choose a date range to analyze a growing season.`}>
        <div className="grid grid-cols-2 gap-3 sm:w-72">
          <Field label="From month"><select className={inputCls} value={range[0]} onChange={pick(0)}>{opts}</select></Field>
          <Field label="To month"><select className={inputCls} value={range[1]} onChange={pick(1)}>{opts}</select></Field>
        </div>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((p) => {
          const on = p.r[0] === range[0] && p.r[1] === range[1]
          return (
            <button key={p.name} onClick={() => setRange(p.r)} aria-pressed={on}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${on ? 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40' : 'text-slate-400 ring-white/10 hover:bg-white/5'}`}>
              {p.name}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Thermometer} label="Mean temperature" value={`${st.meanTemp.toFixed(1)} °C`} />
        <Stat icon={CloudRain} label="Total rainfall" value={`${Math.round(st.totalRain)} mm`} />
        <Stat icon={CalendarDays} label="Days in range" value={String(st.days)} hint={label} />
        <Stat icon={Droplets} label="Wettest month" value={st.wettest} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <H2>Monthly temperature (°C)</H2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...tip} />
                <Line dataKey="temp" name="Mean temperature (°C)" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: '#34d399' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <H2>Monthly rainfall (mm)</H2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} />
                <Tooltip {...tip} />
                <Bar dataKey="rain" name="Rainfall (mm)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <H2>Growing-season climate analysis ({label})</H2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
          Across the {months.length} selected months ({st.days} days) the sample mean temperature is <b className="text-white">{st.meanTemp.toFixed(1)} °C</b> with <b className="text-white">{Math.round(st.totalRain)} mm</b> of rainfall.
          {' '}{st.warmest} is the warmest month, {st.coolest} the coolest and {st.wettest} the wettest.
        </p>
      </Card>

      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-slate-500">
        Data attribution: production climate data is planned to come from the{' '}
        <a href="https://power.larc.nasa.gov" target="_blank" rel="noreferrer" className="text-emerald-300 underline">NASA POWER</a>{' '}
        project. The values shown here are sample data for interface preview and are not NASA measurements.
      </p>
    </>
  )
}
