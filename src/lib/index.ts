// Database package exports
export * from './types'

// Supabase client exports
export { createClient as createBrowserClient } from './supabase/client'
export { createClient as createServerClient } from './supabase/server'
export type { Database } from './supabase/client'

// Legacy exports for backward compatibility
export { createClient as supabase } from './supabase/client'
export { createClient as createClientSupabaseClient } from './supabase/client'
export { createClient as createServerSupabaseClient } from './supabase/server'
