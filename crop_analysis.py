from climate import get_climate_data, process_climate_data

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
        else:
            print("No valid climate data available.")
    monthly_summary = summarize_monthly_climate(df)

    print("Monthly Average Temperature:")
    print(monthly_summary["monthly_temperature"])

    print("Monthly Total Rainfall:")
    print(monthly_summary["monthly_rainfall"])