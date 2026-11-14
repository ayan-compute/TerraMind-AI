import type { Crop, Site, Verdict } from '../types'

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const ALL_MONTHS = Array.from({ length: 12 }, (_, i) => i)
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)

/** Month indices from start to end inclusive, wrapping past December (e.g. Nov to Apr). */
export function monthSpan(start: number, end: number): number[] {
  const out = [start]
  while (out[out.length - 1] !== end) out.push((out[out.length - 1] + 1) % 12)
  return out
}

export function climateStats(site: Site, months: number[]) {
  const t = months.map((m) => site.tempC[m])
  const r = months.map((m) => site.rainMm[m])
  return {
    meanTemp: sum(t) / t.length,
    totalRain: sum(r),
    days: sum(months.map((m) => DAYS[m])),
    warmest: MONTHS[months[t.indexOf(Math.max(...t))]],
    coolest: MONTHS[months[t.indexOf(Math.min(...t))]],
    wettest: MONTHS[months[r.indexOf(Math.max(...r))]],
  }
}

const check = (v: number, [lo, hi]: [number, number]): Verdict => (v < lo ? 'below' : v > hi ? 'above' : 'within')

/** Compares a crop's growing-season mean temperature and total rainfall with its reference ranges. */
export function screenCrop(site: Site, crop: Crop) {
  const months = monthSpan(...crop.season)
  const stats = climateStats(site, months)
  return { months, stats, temp: check(stats.meanTemp, crop.tempRange), rain: check(stats.totalRain, crop.rainRange) }
}

const utc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Full days strictly between harvest and planting (both dates excluded). Planting must be after harvest. */
export function planRotation(harvest: string, planting: string) {
  if (!harvest || !planting) return { status: 'incomplete' as const }
  const diff = Math.round((utc(planting) - utc(harvest)) / 86400000)
  return diff <= 0 ? { status: 'invalid' as const } : { status: 'valid' as const, gapDays: diff - 1 }
}
