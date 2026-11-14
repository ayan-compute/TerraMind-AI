from climate import get_climate_data, process_climate_data

CROP_REQUIREMENTS = {
    "wheat": {
        "rainfall_optimal": (750, 900),
        "rainfall_absolute": (300, 1600)
    },

    "maize": {
        "rainfall_optimal": (600, 1200),
        "rainfall_absolute": (400, 1800)
    }
}

CROP_SEASONS = {
    "maize": {
        "start": "2025-05-01",
        "end": "2025-09-30"
    }
}
def summarize_climate(df):
     avg_temp = df["Temperature"].mean()
     total_rainfall = df["Rainfall"].sum()
     no_of_observations = len(df)
     return {
    "average_temperature": round(float(avg_temp), 2),
    "total_rainfall": round(float(total_rainfall), 2),
    "days_analyzed": no_of_observations
    }

def summarize_monthly_climate(df):
    monthly_temp = df.groupby("Month")["Temperature"].mean()
    monthly_rainfall = df.groupby("Month")["Rainfall"].sum()

    return {
        "monthly_temperature": monthly_temp,
        "monthly_rainfall": monthly_rainfall
    }

def evaluate_rainfall(crop, annual_rainfall):
    requirements = CROP_REQUIREMENTS[crop]

    minimum, maximum = requirements["rainfall_optimal"]

    if minimum <= annual_rainfall <= maximum:
        return "Within optimal annual reference"
    else:
        return "Outside optimal annual reference"

def summarize_growing_season(df, start_date, end_date):
    seasonal_df = df[
        (df["Date"] >= start_date) &
        (df["Date"] <= end_date)
    ]
    if seasonal_df.empty:
        return None
    
    wd = {
        "average_temperature": round(float(seasonal_df["Temperature"].mean()), 2),
        "total_rainfall": round(float(seasonal_df["Rainfall"].sum()), 2),
        "days_analyzed": len(seasonal_df)
    }
    return wd

def analyze_crop_season(df, crop):
    season = CROP_SEASONS[crop]
    start_date = season["start"]
    end_date = season["end"]
    result = summarize_growing_season(df, start_date, end_date)
    return result

# Testing
if __name__ == "__main__":
    data = get_climate_data(
        33.7, 73.1,
        "20250101", "20251231"
    )

    if data is not None:
        df = process_climate_data(data)

        if not df.empty:
            summary = summarize_climate(df)
            print(summary)

            monthly_summary = summarize_monthly_climate(df)

            print("Monthly Average Temperature:")
            print(monthly_summary["monthly_temperature"])

            print("Monthly Total Rainfall:")
            print(monthly_summary["monthly_rainfall"])

            for crop in ["wheat", "maize"]:
                result = evaluate_rainfall(
                    crop,
                    summary["total_rainfall"]
                )
                
                print(f"{crop.capitalize()} rainfall assessment: {result}")

            season = summarize_growing_season(
                df,
                "2025-06-01",
                "2025-09-30"
                )
            print(season)
            
            maize_analysis = analyze_crop_season(df, "maize")
            
            print(maize_analysis)
        
        else:
            print("No valid climate data available.")
    else:
        print("Could not retrieve climate data.")