export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string
          description: string
          image_url: string
          status: 'pending' | 'in_progress' | 'resolved'
          location?: { lat: number; lng: number } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          image_url: string
          status?: 'pending' | 'in_progress' | 'resolved'
          location?: { lat: number; lng: number } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          image_url?: string
          status?: 'pending' | 'in_progress' | 'resolved'
          location?: { lat: number; lng: number } | null
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}