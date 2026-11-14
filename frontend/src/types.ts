export type Page = 'overview' | 'climate' | 'suitability' | 'rotation' | 'report'
export type Verdict = 'within' | 'below' | 'above'

/** Monthly climate values for one location (index 0 = January). */
export interface Site { id: string; name: string; tempC: number[]; rainMm: number[] }

/** season = [first month, last month], 0-based, may wrap past December. */
export interface Crop {
  id: string
  name: string
  family: string
  season: [number, number]
  tempRange: [number, number]
  rainRange: [number, number]
}

export interface Rotation { first: string; next: string; harvest: string; planting: string }
