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
          created_at: string;
          updated_at: string;
          upvotes: number;
          downvotes: number;
          user_id: string; // Foreign key to auth.users.id
        };
        Insert: {
          id?: string;
          description: string;
          image_url: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          location?: { lat: number; lng: number } | null;
          created_at?: string;
          updated_at?: string;
          upvotes?: number;
          downvotes?: number;
          user_id: string; // Required when inserting a new report
        };
        Update: {
          id?: string;
          description?: string;
          image_url?: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          location?: { lat: number; lng: number } | null;
          updated_at?: string;
          upvotes?: number;
          downvotes?: number;
          user_id?: string; // Optional when updating
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
