import { createClient } from '@supabase/supabase-js'

// Environment variables - these should be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  })
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
  throw new Error('Invalid Supabase URL format. URL should be like: https://your-project.supabase.co')
}

// Validate anon key format
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('Invalid Supabase anon key format')
  throw new Error('Invalid Supabase anon key format. Key should start with "eyJ"')
}

// Client-side Supabase client
let supabase: any = null

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
} catch (error) {
  console.error('Failed to create Supabase client:', error)
  throw new Error(`Failed to initialize Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`)
}

export { supabase }

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          first_name: string
          last_name: string
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          class_level: '10' | '12' | 'undergraduate' | 'postgraduate' | null
          stream: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical' | null
          location: any | null
          interests: string[] | null
          avatar_url: string | null
          role: 'student' | 'admin' | 'counselor' | 'college_admin'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          first_name: string
          last_name: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          class_level?: '10' | '12' | 'undergraduate' | 'postgraduate' | null
          stream?: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical' | null
          location?: any | null
          interests?: string[] | null
          avatar_url?: string | null
          role?: 'student' | 'admin' | 'counselor' | 'college_admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          class_level?: '10' | '12' | 'undergraduate' | 'postgraduate' | null
          stream?: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical' | null
          location?: any | null
          interests?: string[] | null
          avatar_url?: string | null
          role?: 'student' | 'admin' | 'counselor' | 'college_admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      colleges: {
        Row: {
          id: string
          name: string
          type: 'government' | 'government_aided' | 'private' | 'deemed'
          location: any
          address: string
          website: string | null
          phone: string | null
          email: string | null
          established_year: number | null
          accreditation: string[] | null
          facilities: any | null
          programs: any | null
          cut_off_data: any | null
          admission_process: any | null
          fees: any | null
          images: string[] | null
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'government' | 'government_aided' | 'private' | 'deemed'
          location: any
          address: string
          website?: string | null
          phone?: string | null
          email?: string | null
          established_year?: number | null
          accreditation?: string[] | null
          facilities?: any | null
          programs?: any | null
          cut_off_data?: any | null
          admission_process?: any | null
          fees?: any | null
          images?: string[] | null
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'government' | 'government_aided' | 'private' | 'deemed'
          location?: any
          address?: string
          website?: string | null
          phone?: string | null
          email?: string | null
          established_year?: number | null
          accreditation?: string[] | null
          facilities?: any | null
          programs?: any | null
          cut_off_data?: any | null
          admission_process?: any | null
          fees?: any | null
          images?: string[] | null
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      scholarships: {
        Row: {
          id: string
          name: string
          description: string | null
          provider: string
          amount: any | null
          eligibility: any | null
          application_deadline: string | null
          application_process: string | null
          documents_required: string[] | null
          website: string | null
          contact_info: any | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          provider: string
          amount?: any | null
          eligibility?: any | null
          application_deadline?: string | null
          application_process?: string | null
          documents_required?: string[] | null
          website?: string | null
          contact_info?: any | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          provider?: string
          amount?: any | null
          eligibility?: any | null
          application_deadline?: string | null
          application_process?: string | null
          documents_required?: string[] | null
          website?: string | null
          contact_info?: any | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admission_deadlines: {
        Row: {
          id: string
          title: string
          description: string | null
          college_id: string | null
          program_id: string | null
          deadline_date: string
          deadline_type: string
          stream: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical' | null
          class_level: '10' | '12' | 'undergraduate' | 'postgraduate' | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          college_id?: string | null
          program_id?: string | null
          deadline_date: string
          deadline_type: string
          stream?: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical' | null
          class_level?: '10' | '12' | 'undergraduate' | 'postgraduate' | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          college_id?: string | null
          program_id?: string | null
          deadline_date?: string
          deadline_type?: string
          stream?: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical' | null
          class_level?: '10' | '12' | 'undergraduate' | 'postgraduate' | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'admission_deadline' | 'scholarship' | 'exam_reminder' | 'general'
          data: any | null
          is_read: boolean
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'admission_deadline' | 'scholarship' | 'exam_reminder' | 'general'
          data?: any | null
          is_read?: boolean
          sent_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'admission_deadline' | 'scholarship' | 'exam_reminder' | 'general'
          data?: any | null
          is_read?: boolean
          sent_at?: string
          created_at?: string
        }
      }
    }
  }
}
