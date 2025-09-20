"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { offlineAuthManager } from "../offline-auth-manager";

export function createOfflineAwareClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false, // Disable auto-refresh to prevent offline errors
      persistSession: true,
      detectSessionInUrl: true,
      // Custom storage that handles offline scenarios
      storage: {
        getItem: (key: string) => {
          try {
            if (typeof window === "undefined") return null;
            return localStorage.getItem(key);
          } catch (error) {
            console.warn("[OfflineClient] Failed to get item from storage:", error);
            return null;
          }
        },
        setItem: (key: string, value: string) => {
          try {
            if (typeof window === "undefined") return;
            localStorage.setItem(key, value);
          } catch (error) {
            console.warn("[OfflineClient] Failed to set item in storage:", error);
          }
        },
        removeItem: (key: string) => {
          try {
            if (typeof window === "undefined") return;
            localStorage.removeItem(key);
          } catch (error) {
            console.warn("[OfflineClient] Failed to remove item from storage:", error);
          }
        },
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'pathniti-offline-client',
      },
    },
  });

  // Wrap the auth methods to handle offline scenarios
  const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  const originalSignIn = supabase.auth.signInWithPassword.bind(supabase.auth);
  const originalSignUp = supabase.auth.signUp.bind(supabase.auth);
  const originalSignOut = supabase.auth.signOut.bind(supabase.auth);
  const originalRefreshSession = supabase.auth.refreshSession.bind(supabase.auth);

  // Enhanced getSession with offline support
  supabase.auth.getSession = async () => {
    try {
      const result = await originalGetSession();
      
      // Save the session to offline storage
      if (result.data.session) {
        await offlineAuthManager.saveOfflineAuthState(result.data.session.user, result.data.session);
      }
      
      return result;
    } catch (error) {
      console.warn("[OfflineClient] getSession failed, trying offline state:", error);
      
      // If network error, try to get offline state
      if (await offlineAuthManager.handleAuthError(error)) {
        const offlineState = await offlineAuthManager.getOfflineAuthState();
        if (offlineState) {
          return {
            data: {
              session: offlineState.session,
              user: offlineState.user,
            },
            error: null,
          } as any; // Type assertion to handle complex return type
        }
      }
      
      throw error;
    }
  };

  // Enhanced getUser with offline support
  supabase.auth.getUser = async () => {
    try {
      const result = await originalGetUser();
      
      // Save the user to offline storage
      if (result.data.user) {
        const session = await supabase.auth.getSession();
        await offlineAuthManager.saveOfflineAuthState(result.data.user, session.data.session);
      }
      
      return result;
    } catch (error) {
      console.warn("[OfflineClient] getUser failed, trying offline state:", error);
      
      // If network error, try to get offline state
      if (await offlineAuthManager.handleAuthError(error)) {
        const offlineState = await offlineAuthManager.getOfflineAuthState();
        if (offlineState) {
          return {
            data: {
              user: offlineState.user,
            },
            error: null,
          } as any; // Type assertion to handle complex return type
        }
      }
      
      throw error;
    }
  };

  // Enhanced signIn with offline support
  supabase.auth.signInWithPassword = async (credentials) => {
    try {
      const result = await originalSignIn(credentials);
      
      if (result.data.session && result.data.user) {
        await offlineAuthManager.saveOfflineAuthState(result.data.user, result.data.session);
      }
      
      return result;
    } catch (error) {
      console.error("[OfflineClient] signIn failed:", error);
      throw error;
    }
  };

  // Enhanced signUp with offline support
  supabase.auth.signUp = async (credentials) => {
    try {
      const result = await originalSignUp(credentials);
      
      if (result.data.session && result.data.user) {
        await offlineAuthManager.saveOfflineAuthState(result.data.user, result.data.session);
      }
      
      return result;
    } catch (error) {
      console.error("[OfflineClient] signUp failed:", error);
      throw error;
    }
  };

  // Enhanced signOut with offline support
  supabase.auth.signOut = async () => {
    try {
      const result = await originalSignOut();
      await offlineAuthManager.clearOfflineAuthState();
      return result;
    } catch (error) {
      console.warn("[OfflineClient] signOut failed, clearing offline state anyway:", error);
      await offlineAuthManager.clearOfflineAuthState();
      throw error;
    }
  };

  // Enhanced refreshSession with offline support
  supabase.auth.refreshSession = async (refreshToken) => {
    try {
      const result = await originalRefreshSession(refreshToken);
      
      if (result.data.session && result.data.user) {
        await offlineAuthManager.saveOfflineAuthState(result.data.user, result.data.session);
      }
      
      return result;
    } catch (error) {
      console.warn("[OfflineClient] refreshSession failed:", error);
      
      // If network error, queue for retry when online
      if (await offlineAuthManager.handleAuthError(error)) {
        await offlineAuthManager.queueRetryAction(async () => {
          try {
            await originalRefreshSession(refreshToken);
          } catch (retryError) {
            console.error("[OfflineClient] Retry refreshSession failed:", retryError);
          }
        });
      }
      
      throw error;
    }
  };

  // Set up auth state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("[OfflineClient] Auth state changed:", event);
    
    if (session) {
      await offlineAuthManager.saveOfflineAuthState(session.user, session);
    } else if (event === 'SIGNED_OUT') {
      await offlineAuthManager.clearOfflineAuthState();
    }
  });

  return supabase;
}
