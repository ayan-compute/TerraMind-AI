import type { Crop, Site } from '../types'

// SAMPLE DATA ONLY: illustrative values, NOT NASA measurements.
// Season windows and reference ranges are placeholders; replace them with the
// thresholds used by your Python backend (see src/services/api.ts).
export const SAMPLE_NOTE = 'Sample data, not NASA measurements'

export const sites: Site[] = [
  { id: 'plains', name: 'Temperate Plains (sample)',
    tempC: [6, 9, 13, 18, 23, 27, 29, 28, 24, 18, 12, 7], rainMm: [45, 40, 50, 55, 60, 65, 70, 68, 55, 45, 45, 48] },
  { id: 'plateau', name: 'Semi-arid Plateau (sample)',
    tempC: [8, 11, 16, 22, 28, 36, 35, 33, 28, 21, 14, 9], rainMm: [20, 25, 30, 18, 12, 25, 95, 90, 40, 8, 7, 12] },
  { id: 'lowlands', name: 'Humid Lowlands (sample)',
    tempC: [18, 19, 22, 25, 28, 29, 29, 29, 28, 26, 22, 19], rainMm: [60, 55, 80, 120, 180, 250, 300, 290, 220, 110, 60, 55] },
]

export const crops: Crop[] = [
  { id: 'wheat', name: 'Wheat', family: 'Poaceae (grasses)', season: [10, 3], tempRange: [10, 24], rainRange: [250, 750] },
  { id: 'maize', name: 'Maize', family: 'Poaceae (grasses)', season: [3, 8], tempRange: [18, 30], rainRange: [400, 900] },
]
