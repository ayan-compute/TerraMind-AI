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
        print("API request failed.")
        return None
    
def process_climate_data(data):
    temperatures = data["properties"]["parameter"]["T2M"]
    rainfall = data["properties"]["parameter"]["PRECTOTCORR"]
    df = pd.DataFrame({
        "Date": list(temperatures.keys()),
        "Temperature": list(temperatures.values())
    })

    df["Rainfall"] = df["Date"].map(rainfall)

    df = df[
    (df["Temperature"] != -999) &
    (df["Rainfall"] != -999) 
    ]

    df = df.dropna()
    return df
# Testing section

if __name__ == "__main__":
    data = get_climate_data(
        33.7, 73.1,
        "20250101", "20250107"
    )

    if data is not None:
        print(data["properties"]["parameter"].keys())

        df = process_climate_data(data)
        print(df)