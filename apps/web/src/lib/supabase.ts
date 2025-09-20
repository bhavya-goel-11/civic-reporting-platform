import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET',
  keySet: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length || 0
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Create a typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('reports').select('count').limit(1);
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Connection test error:', err);
    return false;
  }
};

// Type aliases for convenience
type ReportRow = Database['public']['Tables']['reports']['Row'];
type ReportUpdate = Database['public']['Tables']['reports']['Update'];
type UserRow = Database['public']['Tables']['users']['Row'];

// Helper functions for common operations
export const reportsApi = {
  // Get all reports with optional filtering
  async getReports(filters?: {
    status?: string;
    category?: string;
    assignedStaffId?: string;
  }) {
    try {
      console.log('Starting getReports with filters:', filters);

      // Test basic table access first
      console.log('Testing basic table access...');
      const { data: basicTest, error: basicError } = await supabase
        .from('reports')
        .select('count');

      if (basicError) {
        console.error('Basic table access failed:', basicError);
        throw new Error(`Database access error: ${basicError?.message || 'Unknown database error'}`);
      }

      console.log('Basic table access successful, trying simple select...');
      
      // Query reports without joins (since no users table exists)
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'All Status') {
        query = query.eq('status', filters.status);
      }

      if (filters?.category && filters.category !== 'All Categories') {
        query = query.eq('category', filters.category);
      }

      if (filters?.assignedStaffId) {
        query = query.eq('assigned_staff_id', filters.assignedStaffId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Query failed:', {
          error: error,
          message: error?.message || 'No message',
          details: error?.details || 'No details',
          hint: error?.hint || 'No hint',
          code: error?.code || 'No code'
        });
        
        throw new Error(`Reports query failed: ${error?.message || 'Unknown error'}`);
      }
      
      console.log(`Query successful, returning ${data?.length || 0} reports`);
      return data || [];
      
    } catch (err) {
      console.error('Unexpected error in getReports:', err);
      throw err;
    }
  },

  // Get a single report by ID
  async getReport(id: string) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching report:', error);
      throw error;
    }

    return data;
  },

  // Update report status
  async updateReportStatus(id: string, status: 'pending' | 'in_progress' | 'resolved') {
    const { data, error } = await (supabase as any)
      .from('reports')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating report status:', error);
      throw error;
    }

    return data;
  },

  // Assign staff to report
  async assignStaff(id: string, staffId: string | null) {
    const { data, error } = await (supabase as any)
      .from('reports')
      .update({ 
        assigned_staff_id: staffId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error assigning staff to report:', error);
      throw error;
    }

    return data;
  },

  // Add internal notes
  async addInternalNotes(id: string, notes: string) {
    const { data, error } = await (supabase as any)
      .from('reports')
      .update({ 
        internal_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error adding internal notes:', error);
      throw error;
    }

    return data;
  },

  // Get reports statistics
  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('status');

      if (error) {
        console.error('Error fetching statistics:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Statistics query failed: ${error.message || 'Unknown error'}`);
      }

      // Handle case where no data is returned
      if (!data || data.length === 0) {
        console.log('No reports found in database, returning zero statistics');
        return { total: 0, pending: 0, in_progress: 0, resolved: 0 };
      }

      const stats = (data as { status: string }[]).reduce(
        (acc, report) => {
          acc.total++;
          if (report.status === 'pending') acc.pending++;
          else if (report.status === 'in_progress') acc.in_progress++;
          else if (report.status === 'resolved') acc.resolved++;
          return acc;
        },
        { total: 0, pending: 0, in_progress: 0, resolved: 0 }
      );

      return stats;
    } catch (err) {
      console.error('Unexpected error in getStatistics:', err);
      throw err;
    }
  }
};

// Auth users API (using Supabase auth instead of users table)
export const authApi = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
    
    return user;
  },

  // Get user by ID from auth
  async getAuthUser(id: string) {
    const { data, error } = await supabase.auth.admin.getUserById(id);
    
    if (error) {
      console.error('Error fetching auth user:', error);
      throw error;
    }
    
    return data.user;
  }
};