import requests
import pandas as pd

URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

def get_climate_data(latitude, longitude, start, end):

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start": start,
        "end": end,
        "parameters": "T2M,PRECTOTCORR",
        "community": "AG",
        "format": "JSON"
    }

    try:
        response = requests.get(URL, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException:
        print(f"API request failed.")
        return None
    
data = get_climate_data(
    33.7,
    73.1,
    "20250101",
    "20250107"
)

if data is not None:
    print(data["properties"]["parameter"].keys())