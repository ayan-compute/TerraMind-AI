from climate import get_climate_data, process_climate_data
import pandas as pd

CROP_REQUIREMENTS = {
    "wheat": {
        "rainfall_optimal": (750, 900),
        "rainfall_absolute": (300, 1600),
        "temperature_optimal": (15, 23) 
    },

    "maize": {
        "rainfall_optimal": (600, 1200),
        "rainfall_absolute": (400, 1800),
        "temperature_optimal": (18, 33)
    }
}

CROP_SEASONS = {
    "maize": {
        "start": "2025-05-01",
        "end": "2025-09-30"
    },
    "wheat": {
        "start": "2024-11-15",
        "end": "2025-04-15"
    }
}

CROP_FAMILIES = {
    "wheat": "cereal",
    "maize": "cereal",
    "chickpea": "legume"
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

def evaluate_temperature(crop, average_temp):
    requirements = CROP_REQUIREMENTS[crop]

    minimum, maximum = requirements["temperature_optimal"]

    if minimum <= average_temp <= maximum:
        return "Within optimal temperature reference"
    else:
        return "Outside optimal temperature reference"

def check_crop_sequence(first_crop, second_crop,):
    first_end = pd.to_datetime(CROP_SEASONS[first_crop]["end"])

    second_start = pd.to_datetime(CROP_SEASONS[second_crop]["start"])
    gap_days = (second_start - first_end).days - 1
    if first_end < second_start:
        return gap_days
    else:
        return "Dates overlap or are out of order."

def check_crop_diversity(first_crop, second_crop):
    first_family = CROP_FAMILIES[first_crop]
    second_family = CROP_FAMILIES[second_crop]

    if first_family == second_family:
        return "Same crop family"
    else:
        return "Different crop families"
    
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

            wheat_data = get_climate_data(
                33.7, 73.1,
                "20241115", "20250415"
            )

            if wheat_data is not None:
                wheat_df = process_climate_data(wheat_data)

                if not wheat_df.empty:
                    wheat_info = analyze_crop_season(wheat_df, "wheat")
                    print("Wheat growing-season climate:", wheat_info)

                else:
                    print("No valid wheat climate data.")
            else:
                print("Failed to retrieve wheat climate data.")

            print("Wheat temperature:",
                   evaluate_temperature("wheat", wheat_info["average_temperature"]))
            print("Maize temperature:",
                  evaluate_temperature("maize", maize_analysis["average_temperature"]))

            result = check_crop_sequence("wheat", "maize")
            print("Days between wheat and maize:", result)

            print(check_crop_diversity("wheat", "maize"))
            print(check_crop_diversity("wheat", "chickpea"))