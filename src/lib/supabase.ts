import { createClient } from '@supabase/supabase-js'

// Environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Enhanced validation with better error messages
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format - more lenient for build time
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid Supabase URL format:', supabaseUrl)
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`)
}

// Create a singleton client with error handling
let client: ReturnType<typeof createClient> | null = null

export function createSupabaseClient() {
  if (!client) {
    try {
      client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          // Add better error handling for session management
          storageKey: 'sb-auth-token',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined
        }
      })
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      throw new Error(`Failed to create Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  return client
}

// Export a default instance for convenience with error handling
let supabase: ReturnType<typeof createClient>
try {
  supabase = createSupabaseClient()
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
  // Create a fallback client that will throw errors when used
  // Use a valid format to avoid URL validation issues
  supabase = createClient('https://fallback.supabase.co', 'fallback-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
export { supabase }

// Safe wrapper for getUser() that checks for session first
export async function safeGetUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { data: { user: null }, error: new Error('No active session') }
    }
    return await supabase.auth.getUser()
  } catch (error) {
    console.warn('safeGetUser failed:', error)
    return { data: { user: null }, error }
  }
}

// Types - simplified and unified
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: 'student' | 'admin' | 'college'
  is_verified?: boolean
  created_at?: string
  updated_at?: string
}

export interface College {
  id: string
  name: string
  location: any
  is_active: boolean
}

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile & {
          date_of_birth?: string
          gender?: string
          class_level?: string
          stream?: string
          location?: any
          interests?: string[]
          avatar_url?: string
        }
        Insert: Partial<UserProfile> & {
          id: string
          email: string
          first_name: string
          last_name: string
        }
        Update: Partial<UserProfile>
      }
      colleges: {
        Row: College & {
          type: string
          address: string
          website?: string
          phone?: string
          email?: string
          established_year?: number
          accreditation?: string[]
          facilities?: any
          programs?: any
          cut_off_data?: any
          admission_process?: any
          fees?: any
          images?: string[]
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      college_profiles: {
        Row: {
          id: string
          college_id: string
          contact_person: string
          designation?: string
          phone?: string
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
    }
  }
}