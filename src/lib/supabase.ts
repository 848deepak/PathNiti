// Modern Supabase client - consolidated from legacy implementations
// This file provides a clean interface for the most common Supabase operations

import { createClient } from "./supabase/client";
import type { Database, UserProfile } from "./supabase/types";

// Create a singleton client instance with error handling
let supabase: ReturnType<typeof createClient>;
try {
  supabase = createClient();
} catch (error) {
  console.error("Failed to create Supabase client:", error);
  throw error;
}

// Safe wrapper for getUser() that checks for session first
export async function safeGetUser() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return { data: { user: null }, error: new Error("No active session") };
    }
    return await supabase.auth.getUser();
  } catch (error) {
    console.warn("safeGetUser failed:", error);
    return { data: { user: null }, error };
  }
}

// Export the client and types
export { supabase };
export type { Database, UserProfile };

// Re-export the client creation function for browser usage
export { createClient as createSupabaseClient } from "./supabase/client";

// Note: createServerClient and createServiceClient should be imported directly
// from their respective files to avoid "next/headers" issues in client components
