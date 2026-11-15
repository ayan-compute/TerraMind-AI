# TerraMind AI — From Orbit to Harvest

**NASA Space Apps Challenge 2026** · **Field Shift: Adapting Farms with NASA Data**

TerraMind AI is an interactive, **rule-based agricultural climate decision-support prototype**. It retrieves historical climate measurements from NASA POWER for selected geographic coordinates, visualizes local temperature and rainfall, compares basic crop climate requirements with historical observations, checks simple crop-rotation timing and family diversity, and exports a text report.

**Project:** https://github.com/ayan-compute/TerraMind-AI  
**NASA data:** https://power.larc.nasa.gov/

> **Scope:** This is a hackathon prototype, not a trained machine-learning model, weather forecast, validated yield predictor, or substitute for advice from a local agronomist.

## Features

- **Coordinate-based climate exploration:** enter latitude and longitude; query NASA POWER's daily data.
- **Climate dashboard:** historical 2025 monthly mean air temperature and monthly total corrected precipitation.
- **Crop screening:** wheat and maize evaluated against preliminary temperature and rainfall reference ranges.
- **Crop rotation planner:** compare harvest and planting dates and inspect crop-family diversity.
- **Farmer analysis report:** download a `.txt` file with climate values, crop screening results, rotation analysis, data sources and limitations.
- **Sample locations:** explicitly labeled example datasets in parts of the UI for demonstration; sample figures are **not** NASA measurements.

## Technology

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend API | Python, FastAPI, Uvicorn |
| Data processing | Pandas, Requests |
| Climate source | NASA POWER API — `T2M` and `PRECTOTCORR` daily parameters |

## Requirements

- Python 3.10 or later, with `pip`
- Node.js and npm (Node 20+ recommended)
- Internet access for NASA POWER API requests

## Run locally

**1. Clone the repository and set up the Python backend** (run from the repository root):

```bash
git clone https://github.com/ayan-compute/TerraMind-AI.git
cd TerraMind-AI
python -m venv .venv
python -m pip install -r requirements.txt
python -m uvicorn api:app --reload
```

If you create a virtual environment, activate it before installing dependencies. On Windows PowerShell, that is typically `.venv\Scripts\Activate.ps1` (subject to local execution-policy settings). On macOS/Linux, use `source .venv/bin/activate`.

The backend is served at **http://127.0.0.1:8000**. Verify the API at **http://127.0.0.1:8000/docs** or **http://127.0.0.1:8000/health**.

**2. Start the React frontend** in a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

On Windows PowerShell, if `npm` is blocked by script execution policy, use `npm.cmd install` and `npm.cmd run dev` instead.

Open **http://localhost:5173**. Keep the backend and frontend terminals running at the same time.

**3. Production build test**:

```bash
cd frontend
npm run build
```

## Quick demonstration

1. Select Islamabad or enter **24.8607, 67.0011** and click **Analyze Location** for Karachi.
2. Open **Climate** to view monthly 2025 observations.
3. Open **Crop Suitability** and choose wheat or maize to inspect the preliminary climate comparisons.
4. Open **Crop Rotation**, choose a crop sequence and set harvest/planting dates. For example, wheat harvest on **2027-04-25** and maize planting on **2027-05-10** yields **14 full days between**.
5. Open **Farmer Analysis Report** and download the `.txt` report.

**Observed example, 2025 NASA POWER data:** Islamabad (33.7, 73.1): annual precipitation approximately **1,534.54 mm**, unweighted mean of monthly temperature means **22.64°C**. Karachi (24.8607, 67.0011): approximately **365.84 mm** and **26.32°C**, respectively. Values describe historical observations, not forecasts.

## API endpoints

| Route | Purpose |
|---|---|
| `GET /health` | Backend availability check |
| `GET /climate` | Historical climate summary for coordinates and dates |
| `GET /climate-monthly` | Monthly mean temperature and rainfall totals |
| `GET /crop-suitability` | Preliminary wheat/maize screening at coordinates |
| `GET /crop-rotation` | Simple crop-family and date-gap screening |

Swagger/OpenAPI documentation: **http://127.0.0.1:8000/docs**.

## How the analysis works

The Python backend requests daily `T2M` (temperature at 2 metres) and `PRECTOTCORR` (corrected precipitation) from the **NASA POWER** API, cleans missing values, and aggregates the data with Pandas. The crop screening compares historical growing-season mean temperature and **2025 calendar-year precipitation** against fixed preliminary crop reference bands. The rotation calculation checks whether planting is after harvest, the number of full intervening days, and whether crops share a family. Results are exposed through FastAPI and displayed by React.

## Important limitations

- This application is **not** a trained AI/ML crop-prediction model; current decision rules are simple and explainable.
- Historical measurements, primarily from **2025**, are **not** a current weather forecast or a forecast for 2027 planting dates.
- The crop screening currently uses **fixed 2024–2025 crop seasons** and preliminary thresholds. These are not globally validated crop recommendations.
- Growing-season temperature and calendar-year rainfall use **different time windows**; the app labels them accordingly.
- The rotation feature only checks crop families and calendar gaps; it does **not** optimize for disease, nutrient demand, soil health, or yield.
- The prototype does **not yet integrate site-specific soil data, irrigation, crop variety, farm budgets, or farmer priorities**. These are key future requirements for the full Field Shift challenge.
- Some interface examples are synthetic sample data, separately labeled as such.
- NASA POWER API availability and network access affect live data retrieval.

## Roadmap

1. Incorporate soil properties, irrigation constraints and farmer-selected priorities.
2. Validate crop requirement ranges against local agronomic references.
3. Add multi-year climate summaries and uncertainty diagnostics.
4. Expand crop coverage and test proposed rotations with agricultural experts.

## Data attribution and acknowledgements

- **NASA POWER Project** (Prediction Of Worldwide Energy Resources), NASA Langley Research Center: https://power.larc.nasa.gov/
- **NASA Space Apps Challenge 2026** — Field Shift: Adapting Farms with NASA Data: https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/
- Third-party packages include FastAPI, Requests, Pandas, React, Vite, Tailwind CSS and Recharts (see `requirements.txt` and `frontend/package.json`).
- **AI assistance disclosure:** ChatGPT and Claude were used as development and writing aids in prototyping. The project repository and commit history document implementation and tests. This project is independently developed and is **not endorsed by NASA**.
