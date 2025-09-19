// Client-side Supabase client (for React components, hooks, etc.)
export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { createServiceClient } from './service'

export type { Database, UserProfile, College, Scholarship, AdmissionDeadline, Notification, CollegeProfile } from './types'
