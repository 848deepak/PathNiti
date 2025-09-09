// Database types for EduNiti platform
// Generated from Supabase schema

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
          location: Json | null
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
          location?: Json | null
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
          location?: Json | null
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
          location: Json
          address: string
          website: string | null
          phone: string | null
          email: string | null
          established_year: number | null
          accreditation: string[] | null
          facilities: Json | null
          programs: Json | null
          cut_off_data: Json | null
          admission_process: Json | null
          fees: Json | null
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
          location: Json
          address: string
          website?: string | null
          phone?: string | null
          email?: string | null
          established_year?: number | null
          accreditation?: string[] | null
          facilities?: Json | null
          programs?: Json | null
          cut_off_data?: Json | null
          admission_process?: Json | null
          fees?: Json | null
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
          location?: Json
          address?: string
          website?: string | null
          phone?: string | null
          email?: string | null
          established_year?: number | null
          accreditation?: string[] | null
          facilities?: Json | null
          programs?: Json | null
          cut_off_data?: Json | null
          admission_process?: Json | null
          fees?: Json | null
          images?: string[] | null
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          college_id: string
          name: string
          stream: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical'
          level: string
          duration: number | null
          eligibility: Json | null
          subjects: string[] | null
          career_prospects: string[] | null
          fees: Json | null
          seats: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          college_id: string
          name: string
          stream: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical'
          level: string
          duration?: number | null
          eligibility?: Json | null
          subjects?: string[] | null
          career_prospects?: string[] | null
          fees?: Json | null
          seats?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          college_id?: string
          name?: string
          stream?: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical'
          level?: string
          duration?: number | null
          eligibility?: Json | null
          subjects?: string[] | null
          career_prospects?: string[] | null
          fees?: Json | null
          seats?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          question_text: string
          question_type: string
          category: string
          options: Json
          correct_answer: number | null
          difficulty_level: number
          time_limit: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_text: string
          question_type: string
          category: string
          options: Json
          correct_answer?: number | null
          difficulty_level?: number
          time_limit?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_text?: string
          question_type?: string
          category?: string
          options?: Json
          correct_answer?: number | null
          difficulty_level?: number
          time_limit?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quiz_sessions: {
        Row: {
          id: string
          user_id: string
          status: 'not_started' | 'in_progress' | 'completed'
          started_at: string | null
          completed_at: string | null
          total_score: number
          aptitude_score: number
          interest_scores: Json | null
          recommendations: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'not_started' | 'in_progress' | 'completed'
          started_at?: string | null
          completed_at?: string | null
          total_score?: number
          aptitude_score?: number
          interest_scores?: Json | null
          recommendations?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'not_started' | 'in_progress' | 'completed'
          started_at?: string | null
          completed_at?: string | null
          total_score?: number
          aptitude_score?: number
          interest_scores?: Json | null
          recommendations?: Json | null
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
          amount: Json | null
          eligibility: Json | null
          application_deadline: string | null
          application_process: string | null
          documents_required: string[] | null
          website: string | null
          contact_info: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          provider: string
          amount?: Json | null
          eligibility?: Json | null
          application_deadline?: string | null
          application_process?: string | null
          documents_required?: string[] | null
          website?: string | null
          contact_info?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          provider?: string
          amount?: Json | null
          eligibility?: Json | null
          application_deadline?: string | null
          application_process?: string | null
          documents_required?: string[] | null
          website?: string | null
          contact_info?: Json | null
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
      career_pathways: {
        Row: {
          id: string
          title: string
          description: string | null
          stream: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical'
          education_requirements: Json | null
          skills_required: string[] | null
          job_opportunities: Json | null
          salary_range: Json | null
          growth_prospects: string | null
          related_exams: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          stream: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical'
          education_requirements?: Json | null
          skills_required?: string[] | null
          job_opportunities?: Json | null
          salary_range?: Json | null
          growth_prospects?: string | null
          related_exams?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          stream?: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical'
          education_requirements?: Json | null
          skills_required?: string[] | null
          job_opportunities?: Json | null
          salary_range?: Json | null
          growth_prospects?: string | null
          related_exams?: string[] | null
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
          data: Json | null
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
          data?: Json | null
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
          data?: Json | null
          is_read?: boolean
          sent_at?: string
          created_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          college_id: string | null
          program_id: string | null
          scholarship_id: string | null
          favorite_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college_id?: string | null
          program_id?: string | null
          scholarship_id?: string | null
          favorite_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college_id?: string | null
          program_id?: string | null
          scholarship_id?: string | null
          favorite_type?: string
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
      user_role: 'student' | 'admin' | 'counselor' | 'college_admin'
      stream_type: 'arts' | 'science' | 'commerce' | 'vocational' | 'engineering' | 'medical'
      class_level: '10' | '12' | 'undergraduate' | 'postgraduate'
      gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
      college_type: 'government' | 'government_aided' | 'private' | 'deemed'
      notification_type: 'admission_deadline' | 'scholarship' | 'exam_reminder' | 'general'
      quiz_status: 'not_started' | 'in_progress' | 'completed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type College = Database['public']['Tables']['colleges']['Row']
export type Program = Database['public']['Tables']['programs']['Row']
export type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row']
export type QuizSession = Database['public']['Tables']['quiz_sessions']['Row']
export type Scholarship = Database['public']['Tables']['scholarships']['Row']
export type AdmissionDeadline = Database['public']['Tables']['admission_deadlines']['Row']
export type CareerPathway = Database['public']['Tables']['career_pathways']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type UserFavorite = Database['public']['Tables']['user_favorites']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CollegeInsert = Database['public']['Tables']['colleges']['Insert']
export type ProgramInsert = Database['public']['Tables']['programs']['Insert']
export type QuizQuestionInsert = Database['public']['Tables']['quiz_questions']['Insert']
export type QuizSessionInsert = Database['public']['Tables']['quiz_sessions']['Insert']
export type ScholarshipInsert = Database['public']['Tables']['scholarships']['Insert']
export type AdmissionDeadlineInsert = Database['public']['Tables']['admission_deadlines']['Insert']
export type CareerPathwayInsert = Database['public']['Tables']['career_pathways']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type UserFavoriteInsert = Database['public']['Tables']['user_favorites']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CollegeUpdate = Database['public']['Tables']['colleges']['Update']
export type ProgramUpdate = Database['public']['Tables']['programs']['Update']
export type QuizQuestionUpdate = Database['public']['Tables']['quiz_questions']['Update']
export type QuizSessionUpdate = Database['public']['Tables']['quiz_sessions']['Update']
export type ScholarshipUpdate = Database['public']['Tables']['scholarships']['Update']
export type AdmissionDeadlineUpdate = Database['public']['Tables']['admission_deadlines']['Update']
export type CareerPathwayUpdate = Database['public']['Tables']['career_pathways']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']
export type UserFavoriteUpdate = Database['public']['Tables']['user_favorites']['Update']

// Enum types
export type UserRole = Database['public']['Enums']['user_role']
export type StreamType = Database['public']['Enums']['stream_type']
export type ClassLevel = Database['public']['Enums']['class_level']
export type Gender = Database['public']['Enums']['gender']
export type CollegeType = Database['public']['Enums']['college_type']
export type NotificationType = Database['public']['Enums']['notification_type']
export type QuizStatus = Database['public']['Enums']['quiz_status']
