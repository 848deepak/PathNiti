// Client-side Supabase client (for React components, hooks, etc.)
export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";
export { createServiceClient } from "./service";

// Default client instance
import { createClient } from "./client";
export const supabase = createClient();

// Safe user getter
export async function safeGetUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export type {
  Database,
  UserProfile,
  College,
  Scholarship,
  AdmissionDeadline,
  Notification,
  CollegeProfile,
} from "./types";
