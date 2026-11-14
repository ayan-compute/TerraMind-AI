# TerraMind AI dashboard (frontend only)

React + TypeScript + Tailwind CSS v4 + Recharts + Lucide. Requires Node.js 20 or newer.

    npm install
    npm run dev      # http://localhost:5173
    npm run build    # type-check and production build

Everything on screen is sample data from `src/data/mock.ts`, not NASA measurements.
Crop season windows and reference ranges are placeholders until your backend supplies its thresholds.

## Connecting the Python backend

`src/services/api.ts` is the only place pages get data from. Replace each function body with a
`fetch` to your API and keep the shapes in `src/types.ts`. Set `SIMULATE_ERROR = true` there to
preview the error state.

## Structure

- `src/pages`: Overview, Climate, Suitability, Rotation, Report
- `src/components`: Sidebar and shared UI
- `src/lib/analysis.ts`: month, screening and rotation-date helpers (move these to the backend later)
- `src/data/mock.ts`, `src/services/api.ts`, `src/hooks/useAsync.ts`

The report download button is a placeholder; export is not implemented.
