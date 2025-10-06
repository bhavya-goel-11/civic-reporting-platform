// Utility to call the Python ML API from Node.js backend
import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

async function predictSeverity(text) {
  const res = await axios.post(`${ML_API_URL}/predict_severity`, { text });
  return res.data;
}

async function predictPriority(features) {
  const res = await axios.post(`${ML_API_URL}/predict_priority`, { features });
  return res.data;
}

async function routeReport(features) {
  const res = await axios.post(`${ML_API_URL}/route_report`, { features });
  return res.data;
}

async function detectDuplicate({ lat, lon, text, existing_reports }) {
  const res = await axios.post(`${ML_API_URL}/detect_duplicate`, {
    lat, lon, text, existing_reports
  });
  return res.data;
}

export default {
  predictSeverity,
  predictPriority,
  routeReport,
  detectDuplicate,
};
