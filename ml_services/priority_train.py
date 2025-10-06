import pandas as pd
import numpy as np
from datetime import datetime
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

from feature_engineering import engineer_features_bulk, assign_priority

# === Load training data (replace with DB or CSV in production) ===
reports = pd.DataFrame([
    {"id": 1, "category": "pothole", "report_count": 12, "lat": 28.61, "lon": 77.23, "report_time": "2025-09-10 14:30:00"},
    {"id": 2, "category": "garbage", "report_count": 4, "lat": 28.62, "lon": 77.21, "report_time": "2025-09-11 08:00:00"},
    {"id": 3, "category": "streetlight", "report_count": 1, "lat": 28.63, "lon": 77.20, "report_time": "2025-09-11 21:30:00"},
])

urgency = pd.DataFrame([
    {"id": 1, "urgency_high_prob": 0.75, "urgency_medium_prob": 0.2, "urgency_low_prob": 0.05},
    {"id": 2, "urgency_high_prob": 0.10, "urgency_medium_prob": 0.6, "urgency_low_prob": 0.3},
    {"id": 3, "urgency_high_prob": 0.05, "urgency_medium_prob": 0.25, "urgency_low_prob": 0.70},
])

if __name__ == "__main__":
    print(">>> Starting training...")

    # === Feature engineering ===
    features = engineer_features_bulk(reports, urgency)
    features["priority"] = features.apply(assign_priority, axis=1)

    X = features.drop(columns=["id", "report_time", "priority"])
    y = features["priority"]

    model = CatBoostClassifier(
        iterations=50,
        learning_rate=0.1,
        depth=4,
        loss_function="MultiClass",
        verbose=10
    )

    print(">>> Training priority model...")
    model.fit(X, y)

    y_pred = model.predict(X)
    print("\n=== Training Set Report ===")
    print(classification_report(y, y_pred))

    # after model.fit(...)
    joblib.dump(model, "models/priority_model.pkl")
    joblib.dump(X.columns.tolist(), "models/priority_model_columns.pkl") # save training features

    print("\n>>> Model saved as priority_model.pkl")
