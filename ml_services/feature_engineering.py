import pandas as pd
import numpy as np
from datetime import datetime

def engineer_features_bulk(reports_df, urgency_df=None):
    df = reports_df.copy()
    df["report_time"] = pd.to_datetime(df["report_time"], utc=True)

    if urgency_df is not None:
        df = df.merge(urgency_df[["id", "urgency_high_prob"]], on="id", how="left")
        df["urgency_score"] = df["urgency_high_prob"].fillna(0.0)
        df.drop(columns=["urgency_high_prob"], inplace=True)
    else:
        df["urgency_score"] = 0.0

    df["report_count_log"] = np.log1p(df["report_count"])
    current_time = pd.Timestamp.utcnow()
    df["hours_since_report"] = (current_time - df["report_time"]).dt.total_seconds() / 3600.0
    df["day_of_week"] = df["report_time"].dt.weekday
    df["is_weekend"] = df["day_of_week"].isin([5,6]).astype(int)

    def map_time_of_day(hour):
        if 6 <= hour < 12: return "morning"
        elif 12 <= hour < 17: return "afternoon"
        elif 17 <= hour < 21: return "evening"
        else: return "night"
    df["time_of_day"] = df["report_time"].dt.hour.map(map_time_of_day)

    df = pd.get_dummies(df, columns=["category", "time_of_day"], prefix=["cat", "tod"])

    df["near_school"] = 0
    df["near_hospital"] = 0
    df["historical_issue_count_in_cell"] = 0
    df["past_dept_response_time_avg"] = 0
    df["is_peak_traffic_area"] = 0

    return df

def assign_priority(row):
    if row["urgency_score"] > 0.7 or row["report_count"] > 10:
        return "High"
    elif row["urgency_score"] < 0.3 and row["report_count"] <= 2:
        return "Low"
    else:
        return "Medium"
