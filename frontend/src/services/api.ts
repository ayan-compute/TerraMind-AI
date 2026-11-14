import { crops, sites } from '../data/mock'

const SIMULATE_ERROR = false 

const respond = <T>(data: T): Promise<T> =>
  new Promise((resolve, reject) =>
    setTimeout(() => (SIMULATE_ERROR ? reject(new Error('The data service did not respond. Try again.')) : resolve(data)), 500),
  )

type MonthlyClimate = {
  monthly_temperature: Record<string, number>
  monthly_rainfall: Record<string, number>
}

export type CropSuitabilityResult = {
  crop: string
  season_start: string
  season_end: string
  seasonal_temperature: number
  seasonal_rainfall: number
  annual_rainfall_2025: number
  temperature_result: string
  rainfall_result: string
  temperature_reference: [number, number]
  annual_rainfall_reference: [number, number]
}

export const api = {
  listSites: () => respond(sites),
  listCrops: () => respond(crops),

  getClimate: async () => {
    const response = await fetch(
      'http://127.0.0.1:8000/climate?latitude=33.7&longitude=73.1&start=20250101&end=20250107'
    )

    if (!response.ok) {
      throw new Error('Failed to fetch NASA climate data')
    }

    return response.json()
  },

  getMonthlyClimate: async (
    latitude: number = 33.7,
    longitude: number = 73.1
  ): Promise<MonthlyClimate> => {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      start: '20250101',
      end: '20251231',
    })

    const response = await fetch(
      `http://127.0.0.1:8000/climate-monthly?${params}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch monthly NASA data')
    }

    return response.json()
  },

  getCropSuitability: async (
  latitude: number,
  longitude: number,
  crop: string
): Promise<CropSuitabilityResult> => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    crop: crop,
  })

  const response = await fetch(
    `http://127.0.0.1:8000/crop-suitability?${params}`
  )

  if (!response.ok) {
    throw new Error('Failed to analyze crop suitability')
  }

  return response.json()
},
}