# Run this script to start the ML API FastAPI server
# Usage: python run_ml_api.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run("ml_api:app", host="0.0.0.0", port=8000, reload=True)
