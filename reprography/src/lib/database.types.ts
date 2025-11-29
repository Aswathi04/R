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
      orders: {
        Row: {
          id: string
          user_id: string
          user_email: string | null
          is_guest: boolean
          file_url: string
          file_name: string
          file_type: string
          file_size: number | null
          quantity: number
          color_mode: 'bw' | 'color'
          print_sides: 'single' | 'double'
          notes: string | null
          status: 'pending' | 'processing' | 'completed' | 'cancelled'
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email?: string | null
          is_guest?: boolean
          file_url: string
          file_name: string
          file_type: string
          file_size?: number | null
          quantity?: number
          color_mode?: 'bw' | 'color'
          print_sides?: 'single' | 'double'
          notes?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string | null
          is_guest?: boolean
          file_url?: string
          file_name?: string
          file_type?: string
          file_size?: number | null
          quantity?: number
          color_mode?: 'bw' | 'color'
          print_sides?: 'single' | 'double'
          notes?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          created_at?: string
        }
      }
      admin_access: {
        Row: {
          email: string
          created_at: string
        }
        Insert: {
          email: string
          created_at?: string
        }
        Update: {
          email?: string
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

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
export type OrderStatus = Order['status']

export type PushSubscription = Database['public']['Tables']['push_subscriptions']['Row']
export type PushSubscriptionInsert = Database['public']['Tables']['push_subscriptions']['Insert']
