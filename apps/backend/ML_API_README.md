# ML API Integration

This backend exposes the following endpoints that proxy to the Python FastAPI ML service:

- `POST /ml/predict_severity` — `{ text }`
- `POST /ml/predict_priority` — `{ features }`
- `POST /ml/route_report` — `{ features }`
- `POST /ml/detect_duplicate` — `{ lat, lon, text, existing_reports }`

## Environment

Set the ML API URL (if not default):

```
ML_API_URL=http://localhost:8000
```

## Usage Example

```js
// In your Express route or controller
const mlApi = require('./mlApiClient');
const result = await mlApi.predictSeverity('There is a pothole on Main St.');
```

## Requirements
- The Python FastAPI ML service must be running and accessible.
- All requests are proxied from the Node backend to the ML API.
