// Consolidated Database types for PathNiti platform
// Single source of truth for all Supabase type definitions

export type Database = {
    public: {
        Tables: {
            document_metadata: {
                Row: {
                    id: string
                    user_id: string
                    file_name: string
                    file_path: string
                    file_size: number
                    file_type: string
                    bucket_name: string
                    document_type: string | null
                    application_id: string | null
                    college_id: string | null
                    is_active: boolean
                    uploaded_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    file_name: string
                    file_path: string
                    file_size: number
                    file_type: string
                    bucket_name: string
                    document_type?: string | null
                    application_id?: string | null
                    college_id?: string | null
                    is_active?: boolean
                    uploaded_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    file_name?: string
                    file_path?: string
                    file_size?: number
                    file_type?: string
                    bucket_name?: string
                    document_type?: string | null
                    application_id?: string | null
                    college_id?: string | null
                    is_active?: boolean
                    uploaded_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "document_metadata_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "document_metadata_application_id_fkey"
                        columns: ["application_id"]
                        isOneToOne: false
                        referencedRelation: "student_applications"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "document_metadata_college_id_fkey"
                        columns: ["college_id"]
                        isOneToOne: false
                        referencedRelation: "colleges"
                        referencedColumns: ["id"]
                    }
                ]
            }
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
                    slug: string | null
                    about: string | null
                    admission_criteria: any | null
                    scholarships: any | null
                    entrance_tests: any | null
                    fee_structure: any | null
                    gallery: string[] | null
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
                    slug?: string | null
                    about?: string | null
                    admission_criteria?: any | null
                    scholarships?: any | null
                    entrance_tests?: any | null
                    fee_structure?: any | null
                    gallery?: string[] | null
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
                    slug?: string | null
                    about?: string | null
                    admission_criteria?: any | null
                    scholarships?: any | null
                    entrance_tests?: any | null
                    fee_structure?: any | null
                    gallery?: string[] | null
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
            student_applications: {
                Row: {
                    id: string
                    student_id: string
                    college_id: string
                    full_name: string
                    email: string
                    phone: string
                    class_stream: string
                    documents: any
                    status: 'pending' | 'approved' | 'rejected'
                    feedback: string | null
                    submitted_at: string
                    reviewed_at: string | null
                    reviewed_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    college_id: string
                    full_name: string
                    email: string
                    phone: string
                    class_stream: string
                    documents: any
                    status?: 'pending' | 'approved' | 'rejected'
                    feedback?: string | null
                    submitted_at?: string
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    college_id?: string
                    full_name?: string
                    email?: string
                    phone?: string
                    class_stream?: string
                    documents?: any
                    status?: 'pending' | 'approved' | 'rejected'
                    feedback?: string | null
                    submitted_at?: string
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            college_courses: {
                Row: {
                    id: string
                    college_id: string
                    name: string
                    description: string | null
                    duration: string | null
                    eligibility: string | null
                    fees: any | null
                    seats: number | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    college_id: string
                    name: string
                    description?: string | null
                    duration?: string | null
                    eligibility?: string | null
                    fees?: any | null
                    seats?: number | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    college_id?: string
                    name?: string
                    description?: string | null
                    duration?: string | null
                    eligibility?: string | null
                    fees?: any | null
                    seats?: number | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            college_notices: {
                Row: {
                    id: string
                    college_id: string
                    title: string
                    content: string
                    type: 'general' | 'admission' | 'event' | 'urgent'
                    is_active: boolean
                    published_at: string
                    expires_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    college_id: string
                    title: string
                    content: string
                    type?: 'general' | 'admission' | 'event' | 'urgent'
                    is_active?: boolean
                    published_at?: string
                    expires_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    college_id?: string
                    title?: string
                    content?: string
                    type?: 'general' | 'admission' | 'event' | 'urgent'
                    is_active?: boolean
                    published_at?: string
                    expires_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}

// Additional type exports for convenience
export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type College = Database['public']['Tables']['colleges']['Row']
export type Scholarship = Database['public']['Tables']['scholarships']['Row']
export type AdmissionDeadline = Database['public']['Tables']['admission_deadlines']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type CollegeProfile = Database['public']['Tables']['college_profiles']['Row']
export type StudentApplication = Database['public']['Tables']['student_applications']['Row']
export type CollegeCourse = Database['public']['Tables']['college_courses']['Row']
export type CollegeNotice = Database['public']['Tables']['college_notices']['Row']

// Insert and Update types for convenience
export type CollegeInsert = Database['public']['Tables']['colleges']['Insert']
export type CollegeUpdate = Database['public']['Tables']['colleges']['Update']
export type StudentApplicationInsert = Database['public']['Tables']['student_applications']['Insert']
export type StudentApplicationUpdate = Database['public']['Tables']['student_applications']['Update']
export type CollegeCourseInsert = Database['public']['Tables']['college_courses']['Insert']
export type CollegeCourseUpdate = Database['public']['Tables']['college_courses']['Update']
export type CollegeNoticeInsert = Database['public']['Tables']['college_notices']['Insert']
export type CollegeNoticeUpdate = Database['public']['Tables']['college_notices']['Update']