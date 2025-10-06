import axios from 'axios';

async function testMlService() {
  try {
    console.log('🔍 Testing ML Service endpoints...');
    
    // Test predict_severity
    console.log('\n1. Testing /predict_severity');
    const severityResponse = await axios.post('http://localhost:8000/predict_severity', {
      text: 'Large pothole blocking traffic'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'default_api_key'
      }
    });
    console.log('✅ Severity Response:', severityResponse.data);
    
    // Create proper features for priority/routing
    const reportFeatures = {
      id: 1,
      category: severityResponse.data.severity.category,
      report_count: 1,
      lat: 28.646867411065234,
      lon: 77.13195887297618,
      report_time: new Date().toISOString()
    };
    
    // Test predict_priority
    console.log('\n2. Testing /predict_priority');
    const priorityResponse = await axios.post('http://localhost:8000/predict_priority', {
      features: reportFeatures
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'default_api_key'
      }
    });
    console.log('✅ Priority Response:', priorityResponse.data);
    
    // Test route_report
    console.log('\n3. Testing /route_report');
    const routeResponse = await axios.post('http://localhost:8000/route_report', {
      features: reportFeatures
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'default_api_key'
      }
    });
    console.log('✅ Route Response:', routeResponse.data);
    
    // Test detect_duplicate
    console.log('\n4. Testing /detect_duplicate');
    const duplicateResponse = await axios.post('http://localhost:8000/detect_duplicate', {
      description: 'Large pothole blocking traffic',
      lat: 28.646867411065234,
      lon: 77.13195887297618,
      existing_reports: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'default_api_key'
      }
    });
    console.log('✅ Duplicate Response:', duplicateResponse.data);
    
    console.log('\n🎉 All ML Service endpoints working!');
    
  } catch (error) {
    console.error('❌ ML Service Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
  }
}

testMlService();