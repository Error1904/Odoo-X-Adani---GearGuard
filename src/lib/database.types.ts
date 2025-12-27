export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          team_id: string
          role: 'manager' | 'technician'
        }
        Insert: {
          id?: string
          full_name: string
          team_id: string
          role: 'manager' | 'technician'
        }
        Update: {
          id?: string
          full_name?: string
          team_id?: string
          role?: 'manager' | 'technician'
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          serial_number: string
          category: string
          department: string
          location: string
          purchase_date: string
          warranty_end_date: string
          assigned_to_user_id: string | null
          maintenance_team_id: string
          is_scrapped: boolean
        }
        Insert: {
          id?: string
          name: string
          serial_number: string
          category: string
          department: string
          location: string
          purchase_date: string
          warranty_end_date: string
          assigned_to_user_id?: string | null
          maintenance_team_id: string
          is_scrapped?: boolean
        }
        Update: {
          id?: string
          name?: string
          serial_number?: string
          category?: string
          department?: string
          location?: string
          purchase_date?: string
          warranty_end_date?: string
          assigned_to_user_id?: string | null
          maintenance_team_id?: string
          is_scrapped?: boolean
        }
      }
      maintenance_requests: {
        Row: {
          id: string
          subject: string
          equipment_id: string
          team_id: string
          assigned_to_id: string | null
          request_type: 'corrective' | 'preventive'
          scheduled_date: string | null
          duration_hours: number | null
          status: 'new' | 'in_progress' | 'repaired' | 'scrap'
          priority: 'low' | 'normal' | 'high'
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          subject: string
          equipment_id: string
          team_id: string
          assigned_to_id?: string | null
          request_type: 'corrective' | 'preventive'
          scheduled_date?: string | null
          duration_hours?: number | null
          status?: 'new' | 'in_progress' | 'repaired' | 'scrap'
          priority?: 'low' | 'normal' | 'high'
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          subject?: string
          equipment_id?: string
          team_id?: string
          assigned_to_id?: string | null
          request_type?: 'corrective' | 'preventive'
          scheduled_date?: string | null
          duration_hours?: number | null
          status?: 'new' | 'in_progress' | 'repaired' | 'scrap'
          priority?: 'low' | 'normal' | 'high'
          created_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
