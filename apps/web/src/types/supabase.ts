export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string;
          description: string;
          image_url: string;
          status: 'pending' | 'in_progress' | 'resolved';
          location?: { lat: number; lng: number } | null;
          category?: string;
          created_at: string;
          updated_at: string;
          upvotes: number;
          downvotes: number;
          user_id: string; // Foreign key to auth.users.id
          assigned_staff_id?: string | null;
          internal_notes?: string | null;
        };
        Insert: {
          id?: string;
          description: string;
          image_url: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          location?: { lat: number; lng: number } | null;
          category?: string;
          created_at?: string;
          updated_at?: string;
          upvotes?: number;
          downvotes?: number;
          user_id: string; // Required when inserting a new report
          assigned_staff_id?: string | null;
          internal_notes?: string | null;
        };
        Update: {
          id?: string;
          description?: string;
          image_url?: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          location?: { lat: number; lng: number } | null;
          category?: string;
          updated_at?: string;
          upvotes?: number;
          downvotes?: number;
          user_id?: string; // Optional when updating
          assigned_staff_id?: string | null;
          internal_notes?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'citizen' | 'staff' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'citizen' | 'staff' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'citizen' | 'staff' | 'admin';
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}