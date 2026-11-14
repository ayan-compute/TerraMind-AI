import { crops, sites } from '../data/mock'

// API service layer. Today it returns local sample data; nothing here contacts NASA or any server.
// To connect the Python backend, replace each body with a fetch() call and keep the return types.
const SIMULATE_ERROR = false // set to true to preview the error state

const respond = <T>(data: T): Promise<T> =>
  new Promise((resolve, reject) =>
    setTimeout(() => (SIMULATE_ERROR ? reject(new Error('The data service did not respond. Try again.')) : resolve(data)), 500),
  )

export const api = {
  listSites: () => respond(sites),
  listCrops: () => respond(crops),
}
