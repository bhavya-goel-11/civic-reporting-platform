// Test script to verify complete integration
import axios from 'axios';

async function testCompleteIntegration() {
  console.log('🚀 Testing Complete Integration Pipeline');
  console.log('=====================================');
  
  try {
    // Test data
    const reportData = {
      description: "Large pothole blocking traffic on Main Street",
      location: {
        lat: 28.646867411065234,
        lng: 77.13195887297618
      },
      image_url: "https://example.com/pothole.jpg"
    };

    console.log('📝 Submitting report:', JSON.stringify(reportData, null, 2));
    
    // Make request to submit-report endpoint
    const response = await axios.post('http://localhost:5000/submit-report', reportData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Report submitted successfully!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    console.log('🔍 Status:', response.status);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error during integration test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Request made but no response received');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error('Full error:', error);
    throw error;
  }
}

// Run the test
testCompleteIntegration()
  .then(() => {
    console.log('\n🎉 Integration test completed successfully!');
    process.exit(0);
  })
  .catch(() => {
    console.log('\n💥 Integration test failed!');
    process.exit(1);
  });