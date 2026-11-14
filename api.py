from fastapi import FastAPI, HTTPException
from climate import get_climate_data, process_climate_data
from crop_analysis import summarize_climate

app = FastAPI()

@app.get("/health")
@app.get("/climate-test")
def climate_test():
    data = get_climate_data(33.7, 73.1, "20250101", "20250107")

    if data is None:
        raise HTTPException(status_code=502, detail="NASA request failed")

    df = process_climate_data(data)

    if df.empty:
        raise HTTPException(status_code=404, detail="No valid climate data")

    summary = summarize_climate(df)

    return summary
def health_check():
    return {"status": "TerraMind backend is running"}