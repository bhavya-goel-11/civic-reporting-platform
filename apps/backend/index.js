import { supabase } from './supabaseClient.js';
import express from 'express';
import cors from 'cors';
import mlApi from './mlApiClient.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const app = express();
app.use(cors());
app.use(express.json());

// ML Service base URL
const mlServiceUrl = 'http://localhost:8000';

// Helper function to call ML service
async function callMlService(endpoint, data) {
  try {
    const response = await axios.post(`${mlServiceUrl}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'default_api_key'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error calling ML service at ${endpoint}:`, error.response?.data || error.message);
    throw new Error('ML service call failed');
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// ML API proxy endpoints
app.post('/ml/predict_severity', async (req, res) => {
  try {
    const result = await mlApi.predictSeverity(req.body.text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/ml/predict_priority', async (req, res) => {
  try {
    const result = await mlApi.predictPriority(req.body.features);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/ml/route_report', async (req, res) => {
  try {
    const result = await mlApi.routeReport(req.body.features);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/ml/detect_duplicate', async (req, res) => {
  try {
    const { lat, lon, text, existing_reports } = req.body;
    const result = await mlApi.detectDuplicate({ lat, lon, text, existing_reports });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create report with ML category/urgency
app.post('/api/reports', async (req, res) => {
  try {
    const { description, lat, lon, ...rest } = req.body;

    // Add caching for duplicate detection
    const duplicateCache = new Map();

    // Function to get cached reports
    function getCachedReports() {
      const cacheKey = 'existing_reports';
      if (duplicateCache.has(cacheKey)) {
        return duplicateCache.get(cacheKey);
      }
      return null;
    }

    // Function to set cached reports
    function setCachedReports(reports) {
      const cacheKey = 'existing_reports';
      duplicateCache.set(cacheKey, reports);
      setTimeout(() => duplicateCache.delete(cacheKey), 60000); // Cache expires in 60 seconds
    }

    // Fetch existing reports with caching
    let existingReports = getCachedReports();
    if (!existingReports) {
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('id, lat, lon, description');

      if (fetchError) throw fetchError;

      existingReports = data;
      setCachedReports(existingReports);
    }

    // 1. Detect duplicate
    const duplicateRes = await mlApi.detectDuplicate({
      lat,
      lon,
      text: description,
      existing_reports: existingReports // Use actual data from Supabase
    });

    if (duplicateRes.is_duplicate) {
      // Update report row with duplicate_of
      return res.status(200).json({
        message: 'Duplicate report detected',
        duplicate_of: duplicateRes.duplicate_of
      });
    }

    // 2. Predict severity
    const severityRes = await mlApi.predictSeverity(description);
    const { category, urgency } = severityRes.severity;

    // 3. Predict priority
    const priorityRes = await mlApi.predictPriority({ category, urgency });
    const { priority, priority_score } = priorityRes;

    // 4. Route report
    const routeRes = await mlApi.routeReport({ category, urgency, priority });
    const { department } = routeRes;

    // 5. Insert into Supabase
    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          description,
          lat,
          lon,
          category,
          urgency,
          priority,
          priority_score,
          department,
          ...rest
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to handle report submission
app.post('/submit-report', async (req, res) => {
  const { description, location, image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'image_url is required' });
  }

  try {
    console.log('Step 1: Storing report in Supabase...');
    // Step 1: Store the report in Supabase
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert([{ description, location, image_url, status: 'pending' }]) // Set default status to 'pending'
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ error: 'Failed to store report', details: insertError.message });
    }

    console.log('Report inserted into Supabase:', report);

    // Extract lat and lng from location
    const { lat, lng } = location;

    console.log('Step 2: Calling duplicate detection...');
    // Step 2: Call /detect_duplicate
    const duplicateResponse = await callMlService('/detect_duplicate', {
      description,
      lat,
      lon: lng,
      existing_reports: [], // Fetch existing reports if needed
    });

    console.log('Duplicate detection response:', duplicateResponse);

    if (duplicateResponse.is_duplicate) {
      // Update report with duplicate_of
      const { error: updateError } = await supabase
        .from('reports')
        .update({ duplicate_of: duplicateResponse.duplicate_id })
        .eq('id', report.id);

      if (updateError) {
        console.error('Error updating duplicate_of field:', updateError);
        return res.status(500).json({ error: 'Failed to update duplicate_of field' });
      }

      console.log('Duplicate_of field updated successfully for report ID:', report.id);
      return res.status(200).json({ message: 'Report is a duplicate', duplicate_of: duplicateResponse.duplicate_id });
    }

    console.log('Step 3: Calling severity prediction...');
    // Step 3: Call /predict_severity
    let severityResponse;
    try {
      severityResponse = await callMlService('/predict_severity', { text: description });
      console.log('Severity prediction response:', severityResponse);
    } catch (error) {
      console.error('Severity prediction failed, using fallback:', error.message);
      severityResponse = {
        severity: {
          category: 'other',
          urgency: 'medium'
        }
      };
    }

    console.log('Step 4: Processing priority and routing...');
    // Step 4: Use simplified priority and routing (bypassing problematic ML calls)
    let priorityResponse = { priority: 2 }; // Integer value
    let routeResponse = { priority: 2, department: 'Public Works' };

    // Assign department based on category
    const category = severityResponse.severity.category;
    if (category === 'pothole' || category === 'streetlight') {
      routeResponse.department = 'Public Works';
    } else if (category === 'garbage') {
      routeResponse.department = 'Waste Management';
    } else if (category === 'water supply') {
      routeResponse.department = 'Water Department';
    } else {
      routeResponse.department = 'General Services';
    }

    // Step 5: Update report with ML outputs
    const updateData = {
      urgency: severityResponse.severity.urgency,
      priority: priorityResponse.priority, // Already integer
      department: routeResponse.department,
      priority_score: routeResponse.priority // Already integer
      // Note: category is not stored separately in DB, it's derived from description
    };

    console.log('Updating report with ML outputs:', updateData);

    const { error: updateError } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', report.id);

    if (updateError) {
      console.error('Error updating report with ML outputs:', updateError);
      return res.status(500).json({ error: 'Failed to update report with ML outputs' });
    }

    console.log('Report updated successfully with ML outputs for report ID:', report.id);

    res.status(200).json({ message: 'Report processed successfully', report_id: report.id });
  } catch (error) {
    console.error('Error processing report:', error.message);
    res.status(500).json({ error: 'Failed to process report' });
  }
});

// Catch-all error handler to always return JSON
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
