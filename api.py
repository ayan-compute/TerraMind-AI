from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from climate import get_climate_data, process_climate_data
from crop_analysis import summarize_climate, summarize_monthly_climate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_methods=["GET"],
    allow_headers=["*"]
)

@app.get("/health")
def health_check():
    return {"status": "TerraMind backend is running"}


@app.get("/climate")
def climate(latitude: float, longitude: float, start: str, end: str):
    data = get_climate_data(latitude, longitude, start, end)

    if data is None:
        raise HTTPException(status_code=502, detail="NASA request failed")

    df = process_climate_data(data)

    if df.empty:
        raise HTTPException(status_code=404, detail="No valid climate data")

    summary = summarize_climate(df)

    return summary

@app.get("/climate-monthly")
def climate_monthly(latitude: float, longitude: float, start: str, end: str):
    data = get_climate_data(latitude, longitude, start, end)

    if data is None:
        raise HTTPException(status_code=502, detail="NASA request failed")

    df = process_climate_data(data)

    if df.empty:
        raise HTTPException(status_code=404, detail="No valid climate data")

    monthly = summarize_monthly_climate(df)

    return {
        "monthly_temperature": {
            str(month): round(float(value), 2)
            for month, value in monthly["monthly_temperature"].items()
        },
        "monthly_rainfall": {
            str(month): round(float(value), 2)
            for month, value in monthly["monthly_rainfall"].items()
        }
    }
