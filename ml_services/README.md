# ML API Service

This FastAPI service exposes ML endpoints for use by your Node/Express backend or Next.js server.

## Endpoints

- `POST /predict_severity` — Uses DistilBERT to predict severity from text.
- `POST /predict_priority` — Uses CatBoost model to predict priority from features.
- `POST /route_report` — Uses priority + department mapping.
- `POST /detect_duplicate` — Checks for duplicate reports using spatial and text similarity.

## Running the Service

1. Install requirements:

    pip install -r requirements.txt

2. Start the server:

    python run_ml_api.py

The service will be available at `http://localhost:8000`.

## Example Request

```
POST /predict_severity
{
  "text": "There is a large pothole on Main St."
}
```

## Notes
- Models and feature columns are loaded from the `model/` directory.
- Existing Python modules are used directly (see `ml_api.py`).
- You can call these endpoints from your Node/Express backend or Next.js server using HTTP requests.
