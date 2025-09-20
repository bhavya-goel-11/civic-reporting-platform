// Quick Database Test Script
// Run this with: node test-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Supabase Connection...\n');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 Environment Check:');
console.log(`   URL: ${supabaseUrl ? '✅ SET' : '❌ MISSING'}`);
console.log(`   Key: ${supabaseKey ? '✅ SET' : '❌ MISSING'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing environment variables!');
  console.log('Make sure .env.local exists and contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url_here');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here');
  process.exit(1);
}

// Test connection
console.log('\n🔌 Testing Connection...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('reports').select('count');
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n💡 The "reports" table does not exist.');
        console.log('Please follow the DATABASE_SETUP.md guide to create the required tables.');
      }
      
      return false;
    }
    
    console.log('✅ Connection successful!');
    
    // Test reports table
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .limit(5);
    
    if (reportsError) {
      console.log('❌ Reports query failed:', reportsError.message);
    } else {
      console.log(`✅ Reports table accessible - found ${reports?.length || 0} records`);
    }
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Users query failed:', usersError.message);
    } else {
      console.log(`✅ Users table accessible - found ${users?.length || 0} records`);
    }
    
    return true;
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Database connection test completed successfully!');
    console.log('Your admin portal should now work properly.');
  } else {
    console.log('\n🔧 Please fix the issues above and try again.');
  }
});