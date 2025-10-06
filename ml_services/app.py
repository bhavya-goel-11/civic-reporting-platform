# ml_service/app.py
import os
import time
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import numpy as np
import torch

# Import your local modules (make sure PYTHONPATH includes project root or run from project root)
from feature_engineering import engineer_features_bulk
# DistilBERT inference (your existing file)
import inference as severity_inference  # expects function predict_text(text) in inference.py
# Duplicate detector (your existing file)
from duplicate_detection import DuplicateDetector

app = FastAPI(title="Civic AI Models API")

# -------------------------
# Config / model locations
# -------------------------
PRIORITY_MODEL_PATH = os.getenv("PRIORITY_MODEL_PATH", "models/priority_model.pkl")
PRIORITY_COLUMNS_PATH = os.getenv("PRIORITY_COLUMNS_PATH", "models/priority_model_columns.pkl")

# Department mapping (same as your earlier map)
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

# -------------------------
# Load priority model + columns (on startup)
# -------------------------
PRIORITY_MODEL = None
PRIORITY_COLUMNS = None

def load_priority_model():
    global PRIORITY_MODEL, PRIORITY_COLUMNS
    if not os.path.exists(PRIORITY_MODEL_PATH):
        raise FileNotFoundError(f"Priority model not found at {PRIORITY_MODEL_PATH}")
    PRIORITY_MODEL = joblib.load(PRIORITY_MODEL_PATH)
    if os.path.exists(PRIORITY_COLUMNS_PATH):
        PRIORITY_COLUMNS = joblib.load(PRIORITY_COLUMNS_PATH)
    else:
        PRIORITY_COLUMNS = None

try:
    load_priority_model()
    print("Loaded priority model.")
except Exception as e:
    print("Warning: could not load priority model:", e)
    PRIORITY_MODEL = None
    PRIORITY_COLUMNS = None

# -------------------------
# Duplicate detector state
# -------------------------
# We will attempt to load existing issues from Supabase if configured, otherwise user can POST issues or we will use an empty DB
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Optional: function to fetch issues from Supabase (if env set)
def fetch_issues_from_supabase(limit=2000):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return pd.DataFrame([], columns=["id","lat","lon","text"])
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        # adjust table/column names to your schema
        data = supabase.table("reports").select("id,lat,lon,text").limit(limit).execute()
        rows = data.data
        return pd.DataFrame(rows)
    except Exception as e:
        print("Supabase fetch error:", e)
        return pd.DataFrame([], columns=["id","lat","lon","text"])

# Initialize DuplicateDetector (lazy)
_DUPLICATE_DETECTOR = None
_DETECTOR_LOADED_AT = 0
_DETECTOR_TTL = int(os.getenv("DETECTOR_TTL_SECONDS", "60"))  # reload every 60s by default

def get_duplicate_detector(force_reload: bool = False):
    global _DUPLICATE_DETECTOR, _DETECTOR_LOADED_AT
    if _DUPLICATE_DETECTOR is None or force_reload or (time.time() - _DETECTOR_LOADED_AT) > _DETECTOR_TTL:
        df_issues = fetch_issues_from_supabase()
        # If no issues, pass empty df. DuplicateDetector should handle that.
        _DUPLICATE_DETECTOR = DuplicateDetector(df_issues)
        _DETECTOR_LOADED_AT = time.time()
    return _DUPLICATE_DETECTOR

# -------------------------
# Request / Response schemas
# -------------------------
class ReportIn(BaseModel):
    id: Optional[int] = None
    lat: float
    lon: float
    text: str
    category: Optional[str] = None
    report_count: Optional[int] = 1
    report_time: Optional[str] = None  # ISO format or string

class DuplicateOut(BaseModel):
    is_duplicate: bool
    duplicate_of: Optional[int] = None
    similarity: Optional[float] = None
    distance_m: Optional[float] = None

class SeverityOut(BaseModel):
    severity: str
    severity_probs: dict

class PriorityOut(BaseModel):
    predicted_priority: str
    priority_probs: dict

class RouteOut(BaseModel):
    predicted_priority: str
    department: str
    priority_score: int
    priority_probs: dict

# -------------------------
# Endpoints
# -------------------------
@app.get("/health")
def health():
    return {"status": "ok", "priority_model_loaded": PRIORITY_MODEL is not None}

@app.post("/detect_duplicate", response_model=DuplicateOut)
def detect_duplicate(report: ReportIn, reload_issues: Optional[bool] = False):
    """
    Checks spatial + text similarity against existing issues.
    """
    # Ensure reload_issues is a boolean
    reload_issues = reload_issues if reload_issues is not None else False
    
    det = get_duplicate_detector(force_reload=reload_issues)
    new = {"lat": report.lat, "lon": report.lon, "text": report.text}
    is_dup, dup_of = det.check_duplicate(new_report=new)
    # duplicate_detection.check_duplicate can be extended to return similarity/distance; here we'll re-run to compute those
    # Recompute details:
    df = det.df.copy()
    if df.empty:
        return {"is_duplicate": False, "duplicate_of": None, "similarity": None, "distance_m": None}

    # compute distances and similarities as done in class
    from duplicate_detection import haversine  # if exported
    df["distance_m"] = df.apply(lambda r: haversine(report.lat, report.lon, r["lat"], r["lon"]), axis=1)
    nearby = df[df["distance_m"] <= 30]
    if nearby.empty:
        return {"is_duplicate": False, "duplicate_of": None, "similarity": None, "distance_m": None}

    # compute embedding similarity
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")
    new_emb = model.encode(report.text).reshape(1, -1)
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np

    # Fix cosine_similarity type error
    new_emb_array = new_emb.cpu().numpy() if isinstance(new_emb, torch.Tensor) else np.array(new_emb)
    nearby["similarity"] = nearby["embedding"].apply(
        lambda emb: float(cosine_similarity(new_emb_array, np.array(emb).reshape(1, -1))[0, 0])
    )
    best = nearby.sort_values("similarity", ascending=False).iloc[0]
    return {
        "is_duplicate": bool(best["similarity"] >= 0.8),
        "duplicate_of": int(best["id"]) if best["similarity"] >= 0.8 else None,
        "similarity": float(best["similarity"]),
        "distance_m": float(best["distance_m"])
    }

@app.post("/predict_severity", response_model=SeverityOut)
def predict_severity(report: ReportIn):
    """
    Use your DistilBERT inference.py -> predict_text(text) that returns category & urgency probs etc.
    We'll call predict_text and return severity/urgency result.
    """
    try:
        res = severity_inference.predict_text(report.text)
        # adapt response shape - your inference returns category, urgency, probs etc.
        # We'll return severity as "urgency" label and its probs
        return {
            "severity": res.get("urgency", "unknown"),
            "severity_probs": res.get("urgency_probs", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Severity inference error: {e}")

@app.post("/predict_priority", response_model=PriorityOut)
def predict_priority(report: ReportIn):
    """
    Runs feature engineering and CatBoost model for priority prediction.
    """
    if PRIORITY_MODEL is None:
        raise HTTPException(status_code=500, detail="Priority model not loaded on server")

    # build dataframe for feature_engineering (single row)
    df = pd.DataFrame([{
        "id": report.id if report.id is not None else -1,
        "category": report.category if report.category is not None else "other",
        "report_count": int(report.report_count or 1),
        "lat": float(report.lat),
        "lon": float(report.lon),
        "report_time": report.report_time or pd.Timestamp.utcnow().isoformat()
    }])

    # If severity is desired as input, call predict_severity (we do that here to fill urgency score)
    try:
        sev = severity_inference.predict_text(report.text)
        urgency_high = sev.get("urgency_probs", {}).get("high", 0.0)
        urgency_df = pd.DataFrame([{"id": df.loc[0,"id"], "urgency_high_prob": float(urgency_high)}])
    except Exception:
        urgency_df = None

    feats = engineer_features_bulk(df, urgency_df=urgency_df)
    X = feats.drop(columns=["id", "report_time"])

    # Align columns with training columns
    if PRIORITY_COLUMNS:
        for col in PRIORITY_COLUMNS:
            if col not in X.columns:
                X[col] = 0
        # remove any extra columns that weren't in training
        X = X.reindex(columns=PRIORITY_COLUMNS, fill_value=0)
    # else: assume X columns match model

    preds = PRIORITY_MODEL.predict(X)
    probs = PRIORITY_MODEL.predict_proba(X)

    return {
        "predicted_priority": preds[0],
        "priority_probs": { "classes": list(PRIORITY_MODEL.classes_), "probs": probs[0].tolist() }
    }

@app.post("/route_report", response_model=RouteOut)
def route_report(report: ReportIn):
    """
    Calls predict_priority and maps to department and returns queue score
    """
    p = predict_priority(report)
    priority_label = p["predicted_priority"]
    probs = p["priority_probs"]
    report_category = report.category if report.category else "other"
    dept = CATEGORY_TO_DEPARTMENT.get(report_category, "General Administration")

    priority_order = {"High": 3, "Medium": 2, "Low": 1}
    score = priority_order.get(priority_label, 1)

    return {
        "predicted_priority": priority_label,
        "department": dept,
        "priority_score": score,
        "priority_probs": probs
    }
