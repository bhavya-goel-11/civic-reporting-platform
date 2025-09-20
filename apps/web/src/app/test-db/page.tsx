// removed 'use client' to ensure correct client/server boundaries
'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DatabaseTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: string[] = [];
    
    try {
      // Test 1: Environment variables
      results.push('✅ Environment Check:');
      results.push(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'}`);
      results.push(`   Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}`);
      
      // Test 2: Basic connection
      results.push('\n🔌 Connection Test:');
      try {
        const { data, error } = await supabase.from('reports').select('count');
        if (error) {
          results.push(`   ❌ Connection failed: ${error.message}`);
        } else {
          results.push('   ✅ Connection successful');
        }
      } catch (err) {
        results.push(`   ❌ Connection error: ${err}`);
      }
      
      // Test 3: Reports table
      results.push('\n📋 Reports Table Test:');
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('id, description, status, category, location, created_at')
          .limit(1);
        
        if (error) {
          results.push(`   ❌ Reports table error: ${error.message}`);
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            results.push('   💡 Solution: Create the reports table using the DATABASE_SETUP.md guide');
          }
        } else {
          results.push(`   ✅ Reports table accessible`);
          results.push(`   📊 Sample data: ${data?.length || 0} records found`);
        }
      } catch (err) {
        results.push(`   ❌ Reports table error: ${err}`);
      }
      
      // Test 4: Auth users test (instead of users table)
      results.push('\n👥 Auth Users Test:');
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error && error.message !== 'Auth session missing!') {
          results.push(`   ❌ Auth error: ${error.message}`);
        } else {
          results.push(`   ✅ Auth system accessible`);
          results.push(`   📊 Current user: ${user ? 'Logged in' : 'Anonymous'}`);
        }
      } catch (err) {
        results.push(`   ❌ Auth system error: ${err}`);
      }
      
      // Test 5: Simple reports query (no joins needed)
      results.push('\n🔗 Reports Query Test:');
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .limit(5);
        
        if (error) {
          results.push(`   ❌ Reports query failed: ${error.message}`);
        } else {
          results.push('   ✅ Reports query successful');
          results.push(`   📊 Found ${data?.length || 0} reports`);
          if (data && data.length > 0) {
            results.push(`   📝 Sample columns: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      } catch (err) {
        results.push(`   ❌ Reports query error: ${err}`);
      }
      
    } catch (err) {
      results.push(`\n❌ Unexpected error: ${err}`);
    }
    
    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <p className="text-gray-600 mb-6">
        This tool tests your Supabase database connection and table setup.
      </p>
      
      <button
        onClick={runTests}
        disabled={testing}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-6"
      >
        {testing ? 'Running Tests...' : 'Run Database Tests'}
      </button>
      
      {testResults.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Test Results:</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {testResults.join('\n')}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800">Next Steps:</h3>
        <ul className="mt-2 text-yellow-700 space-y-1">
          <li>• If tables don't exist, follow the DATABASE_SETUP.md guide</li>
          <li>• If connection fails, check your .env.local file</li>
          <li>• If you see permission errors, check your Supabase RLS policies</li>
        </ul>
      </div>
    </div>
  );
}