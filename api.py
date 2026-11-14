from fastapi import FastAPI, HTTPException
from climate import get_climate_data, process_climate_data
from crop_analysis import summarize_climate

app = FastAPI()

@app.get("/health")
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