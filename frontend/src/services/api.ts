import { crops, sites } from '../data/mock'

// API service layer. Today it returns local sample data; nothing here contacts NASA or any server.
// To connect the Python backend, replace each body with a fetch() call and keep the return types.
const SIMULATE_ERROR = false // set to true to preview the error state

const respond = <T>(data: T): Promise<T> =>
  new Promise((resolve, reject) =>
    setTimeout(() => (SIMULATE_ERROR ? reject(new Error('The data service did not respond. Try again.')) : resolve(data)), 500),
  )

type MonthlyClimate = {
  monthly_temperature: Record<string, number>
  monthly_rainfall: Record<string, number>
}

export const api = {
  listSites: () => respond(sites),
  listCrops: () => respond(crops),

  getClimate: async () => {
    const response = await fetch(
      'http://127.0.0.1:8000/climate?latitude=33.7&longitude=73.1&start=20250101&end=20250107'
    )

    if (!response.ok) {
      throw new Error("Failed to fetch NASA climate data")
    }

    return response.json()
  },

  getMonthlyClimate: async (): Promise<MonthlyClimate> => {
  const response = await fetch(
    'http://127.0.0.1:8000/climate-monthly?latitude=33.7&longitude=73.1&start=20250101&end=20251231'
  )

  if (!response.ok) {
    throw new Error('Failed to fetch monthly NASA data')
  }

  return response.json()
},

}