import { useState } from 'react'
import { MapPin, Menu } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { ErrorState, Loading, SampleBadge, inputCls } from './components/ui'
import { useAsync } from './hooks/useAsync'
import Climate from './pages/Climate'
import Overview from './pages/Overview'
import Report from './pages/Report'
import RotationPlanner from './pages/Rotation'
import Suitability from './pages/Suitability'
import { api } from './services/api'
import type { Crop, Page, Rotation, Site } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('overview')
  const [menu, setMenu] = useState(false)
  const [siteId, setSiteId] = useState('islamabad-nasa')
  const [cropId, setCropId] = useState('wheat')
  const [rot, setRot] = useState<Rotation>({ first: 'wheat', next: 'maize', harvest: '2027-04-25', planting: '2027-05-10' })
  const { data, error, loading, retry } = useAsync(() => Promise.all([api.listSites(), api.listCrops()]))
  const [sites, crops] = data ?? ([[], []] as [Site[], Crop[]])

  const { data: monthly, error: nasaError } = useAsync(
    () => api.getMonthlyClimate()
  )

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1))

  const completeYear = monthly && months.every(
    m =>
      Number.isFinite(monthly.monthly_temperature[m]) &&
      Number.isFinite(monthly.monthly_rainfall[m])
  )

  const nasaSite: Site | null = completeYear && monthly
    ? {
        id: 'islamabad-nasa',
        name: 'Islamabad — NASA POWER (2025)',
        tempC: months.map(m => monthly.monthly_temperature[m]),
        rainMm: months.map(m => monthly.monthly_rainfall[m])
      }
    : null

  const availableSites = nasaSite ? [nasaSite, ...sites] : sites

  const site = availableSites.find(s => s.id === siteId) ?? availableSites[0]
  const go = (p: Page) => { setPage(p); setMenu(false); window.scrollTo({ top: 0 }) }

  return (
    <div className="min-h-screen">
      <Sidebar page={page} go={go} open={menu} close={() => setMenu(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-white/5 bg-[#070d1a]/70 px-4 py-3 backdrop-blur-md lg:px-8">
          <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setMenu(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <span className="font-display font-semibold text-white lg:hidden">TerraMind AI</span>
          {data && (
            <>
              <MapPin size={16} className="text-emerald-300" aria-hidden />
              <div className="w-64 max-w-full">
                <select aria-label="Location" className={inputCls} value={site.id} onChange={(e) => setSiteId(e.target.value)}>
                  {availableSites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}
          {site?.id === 'islamabad-nasa' ? (
  <span className="text-xs text-emerald-300">
    NASA POWER · Historical 2025 data
  </span>
) : (
  <SampleBadge />
)}

{nasaError && (
  <span className="text-xs text-amber-300">
    NASA connection failed — sample locations available
  </span>
)}
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          {loading && <Loading />}
          {error && <ErrorState message={error.message} onRetry={retry} />}
          {data && (
            <div key={page} className="rise">
              {page === 'overview' && <Overview site={site} sites={sites} crops={crops} go={go} pick={(id) => { setCropId(id); go('suitability') }} />}
              {page === 'climate' && <Climate site={site} crops={crops} />}
              {page === 'suitability' && <Suitability site={site} crops={crops} cropId={cropId} setCropId={setCropId} />}
              {page === 'rotation' && <RotationPlanner crops={crops} rot={rot} setRot={setRot} />}
              {page === 'report' && <Report site={site} crops={crops} cropId={cropId} rot={rot} />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
