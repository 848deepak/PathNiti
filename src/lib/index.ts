// Database package exports
export * from "./types";

// Supabase client exports
export {
  createBrowserClient,
  createServerClient,
  createServiceClient,
} from "./supabase/index";
export type {
  Database,
  UserProfile,
  College,
  Scholarship,
  AdmissionDeadline,
  Notification,
  CollegeProfile,
} from "./supabase/index";

// Legacy exports for backward compatibility (deprecated - use named exports above)
export { createBrowserClient as supabase } from "./supabase/index";
