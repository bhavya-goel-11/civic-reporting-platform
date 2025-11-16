from fastapi import FastAPI, HTTPException, Request, Security
from pydantic import BaseModel
from typing import Any, Dict
import uvicorn
from fastapi.security.api_key import APIKeyHeader
from fastapi import status

from inference import predict_text
from feature_engineering import engineer_features_bulk, assign_priority
from duplicate_detection import DuplicateDetector
import pickle
import os

app = FastAPI()

# Load CatBoost priority model and columns
PRIORITY_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'priority_model.pkl')
PRIORITY_COLUMNS_PATH = os.path.join(os.path.dirname(__file__), 'model', 'priority_model_columns.pkl')

def load_priority_model():
    with open(PRIORITY_MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(PRIORITY_COLUMNS_PATH, 'rb') as f:
        columns = pickle.load(f)
    return model, columns

priority_model, priority_columns = load_priority_model()

# Request/response schemas
class SeverityRequest(BaseModel):
    text: str

class PriorityRequest(BaseModel):
    features: Dict[str, Any]

class RouteReportRequest(BaseModel):
    features: Dict[str, Any]

class DuplicateRequest(BaseModel):
    lat: float
    lon: float
    text: str
    existing_reports: list  # List of dicts with keys: id, lat, lon, text

# Middleware for API key authentication
# For local development: if ML_API_KEY is not set, API key validation is disabled
API_KEY = os.getenv("ML_API_KEY")
REQUIRE_API_KEY = API_KEY is not None  # Only require API key if explicitly set
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

def validate_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate API key",
        )

# Apply API key validation to all endpoints (only if REQUIRE_API_KEY is True)
@app.middleware("http")
async def api_key_middleware(request: Request, call_next):
    # Exclude /docs and /openapi.json from API key validation
    if request.url.path in ["/docs", "/openapi.json", "/"]:
        return await call_next(request)

    # Skip API key validation if not required (local dev mode)
    if not REQUIRE_API_KEY:
        return await call_next(request)

    # Validate API key if required
    api_key = request.headers.get(API_KEY_NAME)
    if api_key != API_KEY:
        print(f"Invalid API key: {api_key}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key",
        )
    return await call_next(request)

@app.on_event("startup")
async def startup_event():
    if not REQUIRE_API_KEY:
        print("=" * 60)
        print("⚠️  WARNING: API key validation is DISABLED")
        print("⚠️  Set ML_API_KEY environment variable to enable security")
        print("=" * 60)
    else:
        print("✓ API key validation is enabled")

@app.get("/")
def read_root():
    return {
        "service": "Civic Reporting ML API",
        "status": "running",
        "api_key_required": REQUIRE_API_KEY
    }

@app.post("/predict_severity")
def predict_severity(req: SeverityRequest):
    try:
        result = predict_text(req.text)
        return {"severity": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_priority")
def predict_priority(req: PriorityRequest):
    try:
        import pandas as pd
        print(f"Received features: {req.features}")
        
        # Convert features dict to DataFrame
        features_df = pd.DataFrame([req.features])
        print(f"Features DataFrame shape: {features_df.shape}")
        print(f"Features DataFrame columns: {list(features_df.columns)}")
        
        features_processed = engineer_features_bulk(features_df)
        print(f"Processed features shape: {features_processed.shape}")
        print(f"Processed features columns: {list(features_processed.columns)}")
        
        # Select only the columns that the model was trained on
        features_final = features_processed.reindex(columns=priority_columns, fill_value=0)
        print(f"Final features shape: {features_final.shape}")
        
        pred = priority_model.predict(features_final)[0]
        print(f"Prediction: {pred}")
        return {"priority": pred}  # Return as string, not int
    except Exception as e:
        print(f"Error in predict_priority: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/route_report")
def route_report(req: RouteReportRequest):
    try:
        import pandas as pd
        # Convert features dict to DataFrame
        features_df = pd.DataFrame([req.features])
        features_processed = engineer_features_bulk(features_df)
        
        # Select only the columns that the model was trained on
        features_final = features_processed.reindex(columns=priority_columns, fill_value=0)
        
        priority = priority_model.predict(features_final)[0]
        
        # Use the first row of features_processed to assign department
        department = assign_priority(features_processed.iloc[0])
        
        return {"priority": priority, "department": department}  # Return priority as string
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect_duplicate")
def detect_duplicate(req: DuplicateRequest):
    try:
        import pandas as pd
        # Convert list of dicts to DataFrame
        df = pd.DataFrame(req.existing_reports)
        detector = DuplicateDetector(df)
        new_report = {"lat": req.lat, "lon": req.lon, "text": req.text}
        is_dup, dup_id = detector.check_duplicate(new_report)
        return {"is_duplicate": is_dup, "duplicate_id": dup_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("ml_api:app", host="0.0.0.0", port=8000, reload=True)
