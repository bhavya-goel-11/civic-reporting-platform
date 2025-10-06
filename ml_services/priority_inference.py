import pandas as pd
import joblib
from feature_engineering import engineer_features_bulk

# Load trained model and its training columns
model = joblib.load("priority_model.pkl")
try:
    TRAINING_COLUMNS = joblib.load("priority_model_columns.pkl")
except:
    TRAINING_COLUMNS = None  # will handle if missing


# Department mapping
CATEGORY_TO_DEPARTMENT = {
    "garbage": "Sanitation Dept",
    "drainage": "Water Works",
    "streetlight": "Electrical Dept",
    "pothole": "Roads & Maintenance",
    "water supply": "Water Works",
    "public transport": "Transport Dept",
    "parks": "Parks & Horticulture",
    "noise pollution": "Pollution Control Board",
    "stray animals": "Animal Control",
    "other": "General Administration"
}

def predict_priority(new_reports_df, urgency_df=None):
    feats = engineer_features_bulk(new_reports_df, urgency_df)
    X = feats.drop(columns=["id", "report_time"])

    # Align columns with training data
    for col in TRAINING_COLUMNS:
        if col not in X.columns:
            X[col] = 0
    X = X[TRAINING_COLUMNS]  # reorder to match training

    preds = model.predict(X)
    probs = model.predict_proba(X)

    return pd.DataFrame({
        "id": feats["id"],
        "predicted_priority": preds.flatten(),
        "priority_probs": probs.tolist()
    })

def route_reports(reports_df, urgency_df=None):
    """
    Predicts priorities and assigns reports to departments in sorted order.
    """
    preds = predict_priority(reports_df, urgency_df)
    full_df = reports_df.merge(preds, on="id")
    
    # Map categories to departments
    full_df["department"] = full_df["category"].map(CATEGORY_TO_DEPARTMENT)
    
    # Assign numeric score for sorting
    priority_order = {"High": 3, "Medium": 2, "Low": 1}
    full_df["priority_score"] = full_df["predicted_priority"].map(priority_order)
    
    # Sort within each department by priority and report count
    routed = full_df.sort_values(
        by=["department", "priority_score", "report_count"],
        ascending=[True, False, False]
    )
    
    return routed[["id", "category", "predicted_priority", "priority_score", "department"]]

# === Example Usage ===
if __name__ == "__main__":
    reports_test = pd.DataFrame([
        {"id": 101, "category": "pothole", "report_count": 15, "lat": 28.60, "lon": 77.25, "report_time": "2025-09-12 09:15:00"},
        {"id": 102, "category": "garbage", "report_count": 3, "lat": 28.62, "lon": 77.23, "report_time": "2025-09-12 07:00:00"},
    ])

    urgency_test = pd.DataFrame([
        {"id": 101, "urgency_high_prob": 0.80},
        {"id": 102, "urgency_high_prob": 0.20},
    ])

    routed = route_reports(reports_test, urgency_test)
    print("\n=== Routed Reports ===")
    print(routed)

# import pandas as pd
# import joblib
# from feature_engineering import engineer_features_bulk

# # Load trained model
# model = joblib.load("priority_model.pkl")

# # Department mapping
# CATEGORY_TO_DEPARTMENT = {
#     "garbage": "Sanitation Dept",
#     "drainage": "Water Works",
#     "streetlight": "Electrical Dept",
#     "pothole": "Roads & Maintenance",
#     "water supply": "Water Works",
#     "public transport": "Transport Dept",
#     "parks": "Parks & Horticulture",
#     "noise pollution": "Pollution Control Board",
#     "stray animals": "Animal Control",
#     "other": "General Administration"
# }

# def predict_priority(new_reports_df, urgency_df=None):
#     feats = engineer_features_bulk(new_reports_df, urgency_df)
#     preds = model.predict(feats.drop(columns=["id", "report_time"]))
#     probs = model.predict_proba(feats.drop(columns=["id", "report_time"]))
#     return pd.DataFrame({
#         "id": feats["id"],
#         "predicted_priority": preds.flatten(),
#         "priority_probs": probs.tolist()
#     })

# def route_reports(reports_df, urgency_df=None):
#     preds = predict_priority(reports_df, urgency_df)
#     full_df = reports_df.merge(preds, on="id")
#     full_df["department"] = full_df["category"].map(CATEGORY_TO_DEPARTMENT)

#     priority_order = {"High": 3, "Medium": 2, "Low": 1}
#     full_df["priority_score"] = full_df["predicted_priority"].map(priority_order)

#     routed = full_df.sort_values(
#         by=["department", "priority_score", "report_count"],
#         ascending=[True, False, False]
#     )

#     return routed[["id", "category", "predicted_priority", "priority_score", "department"]]

# if __name__ == "__main__":
#     reports_test = pd.DataFrame([
#         {"id": 101, "category": "pothole", "report_count": 15, "lat": 28.60, "lon": 77.25, "report_time": "2025-09-12 09:15:00"},
#         {"id": 102, "category": "garbage", "report_count": 3, "lat": 28.62, "lon": 77.23, "report_time": "2025-09-12 07:00:00"},
#     ])

#     urgency_test = pd.DataFrame([
#         {"id": 101, "urgency_high_prob": 0.80, "urgency_medium_prob": 0.15, "urgency_low_prob": 0.05},
#         {"id": 102, "urgency_high_prob": 0.20, "urgency_medium_prob": 0.60, "urgency_low_prob": 0.20},
#     ])

#     routed = route_reports(reports_test, urgency_test)
#     print("\n=== Routed Reports ===")
#     print(routed)
