from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from climate import get_climate_data, process_climate_data
from crop_analysis import summarize_climate, summarize_monthly_climate
from crop_analysis import (
    CROP_REQUIREMENTS,
    CROP_SEASONS,
    summarize_growing_season,
    evaluate_temperature,
    evaluate_rainfall
)
from datetime import date
from crop_analysis import assess_rotation, CROP_FAMILIES

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

@app.get("/crop-suitability")
def crop_suitability(latitude: float, longitude: float, crop: str):

    crop = crop.lower().strip()

    if crop not in CROP_REQUIREMENTS:
        raise HTTPException(status_code=400, detail="Unsupported crop")

    # Retrieve historical NASA data
    data = get_climate_data(
        latitude, longitude, "20241101", "20251231"
    )

    if data is None:
        raise HTTPException(status_code=502, detail="NASA request failed")

    df = process_climate_data(data)

    if df.empty:
        raise HTTPException(status_code=404, detail="No climate data")

    # Get the crop's growing-season climate
    season = CROP_SEASONS[crop]

    seasonal = summarize_growing_season(
        df, season["start"], season["end"]
    )

    # Annual rainfall reference uses the calendar year 2025
    annual = summarize_growing_season(
        df, "2025-01-01", "2025-12-31"
    )

    if seasonal is None or annual is None:
        raise HTTPException(
            status_code=404,
            detail="Insufficient climate data"
        )

    temperature_result = evaluate_temperature(
        crop, seasonal["average_temperature"]
    )

    rainfall_result = evaluate_rainfall(
        crop, annual["total_rainfall"]
    )

    return {
        "crop": crop,
        "season_start": season["start"],
        "season_end": season["end"],
        "seasonal_temperature": seasonal["average_temperature"],
        "seasonal_rainfall": seasonal["total_rainfall"],
        "annual_rainfall_2025": annual["total_rainfall"],
        "temperature_result": temperature_result,
        "rainfall_result": rainfall_result,
        "temperature_reference": CROP_REQUIREMENTS[crop]["temperature_optimal"],
        "annual_rainfall_reference": CROP_REQUIREMENTS[crop]["rainfall_optimal"]
    }

@app.get("/crop-rotation")
def crop_rotation(
    first_crop: str,
    next_crop: str,
    harvest_date: str,
    planting_date: str
):
    first_crop = first_crop.lower().strip()
    next_crop = next_crop.lower().strip()

    # Validate crop names
    if first_crop not in CROP_FAMILIES or next_crop not in CROP_FAMILIES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported crop"
        )

    # Validate dates
    try:
        harvest = date.fromisoformat(harvest_date)
        planting = date.fromisoformat(planting_date)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Dates must be valid YYYY-MM-DD dates"
        )

    if planting <= harvest:
        raise HTTPException(
            status_code=400,
            detail="Planting date must be after harvest date"
        )

    result = assess_rotation(
        first_crop,
        next_crop,
        harvest_date,
        planting_date
    )

    return {
        **result,
        "first_family": CROP_FAMILIES[first_crop],
        "next_family": CROP_FAMILIES[next_crop],
        "note": "Preliminary rotation screening based on dates and crop families only."
    }