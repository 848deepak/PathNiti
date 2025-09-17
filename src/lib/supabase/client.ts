import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  )
}

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
          role: 'student' | 'admin' | 'college'
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
          role?: 'student' | 'admin' | 'college'
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
          role?: 'student' | 'admin' | 'college'
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
      college_profiles: {
        Row: {
          id: string
          college_id: string
          contact_person: string
          designation: string | null
          phone: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          college_id: string
          contact_person: string
          designation?: string | null
          phone?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          college_id?: string
          contact_person?: string
          designation?: string | null
          phone?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
