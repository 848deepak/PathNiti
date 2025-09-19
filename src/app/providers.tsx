"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import type { User, Session, AuthError, AuthChangeEvent } from "@supabase/supabase-js"
import { supabase, safeGetUser } from "@/lib/supabase"
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary"
import { AuthErrorProvider } from "@/contexts/AuthErrorContext"
import { parseAuthError, logAuthError } from "@/lib/auth-errors"
import { authPerformanceMonitor, logAuthPerformanceSummary } from "@/lib/auth-performance"

// Validate that supabase client is properly imported
if (!supabase) {
  console.error('Supabase client is undefined! Check import paths.')
}

// Global error suppression for React DevTools is now handled in layout.tsx

// Use the centralized performance monitoring system with error handling
const performanceMonitor = authPerformanceMonitor || {
  startTimer: (operation: string) => ({
    end: (success: boolean = true, error?: string) => {
      console.log(`[Fallback] ${operation}: ${success ? 'success' : 'error'}`)
      return 0
    }
  })
}

// Cache utilities for authentication state
const authCache = {
  set: (key: string, value: any, ttl: number = 5 * 60 * 1000) => { // 5 minutes default TTL
    if (typeof window !== 'undefined') {
      const item = {
        value,
        expiry: Date.now() + ttl
      }
      try {
        localStorage.setItem(`auth_cache_${key}`, JSON.stringify(item))
      } catch (error) {
        console.warn('Failed to cache auth data:', error)
      }
    }
  },
  
  get: (key: string) => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(`auth_cache_${key}`)
        if (!item) return null
        
        const parsed = JSON.parse(item)
        if (Date.now() > parsed.expiry) {
          localStorage.removeItem(`auth_cache_${key}`)
          return null
        }
        
        return parsed.value
      } catch (error) {
        console.warn('Failed to retrieve cached auth data:', error)
        return null
      }
    }
    return null
  },
  
  clear: (key?: string) => {
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.removeItem(`auth_cache_${key}`)
      } else {
        // Clear all auth cache
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('auth_cache_')) {
            localStorage.removeItem(k)
          }
        })
      }
    }
  }
}

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'admin' | 'college'
  is_verified: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>
  signUpStudent: (email: string, password: string, userData: {
    first_name: string
    last_name: string
    phone?: string
  }) => Promise<{ data: any; error: AuthError | null }>
  signUpCollege: (email: string, password: string, userData: {
    first_name: string
    last_name: string
    phone?: string
    college_id: string
    contact_person: string
    designation?: string
  }) => Promise<{ data: any; error: AuthError | null }>
  signUpAdmin: (email: string, password: string, userData: {
    first_name: string
    last_name: string
    phone?: string
  }) => Promise<{ data: any; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ data: any; error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  hasRole: (role: 'student' | 'admin' | 'college') => boolean
  isAdmin: () => boolean
  isStudent: () => boolean
  isCollege: () => boolean
  // New centralized redirect helpers
  requireAuth: () => void
  requireRole: (role: 'student' | 'admin' | 'college') => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Simplified error boundary using existing AuthErrorBoundary

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true) // Start with true, set to false after initial load
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  // Performance tracking refs
  const profileFetchCount = useRef(0)
  const lastProfileFetch = useRef<string | null>(null)
  
  // Profile state deduplication refs
  const profileOperationLocks = useRef<Map<string, Promise<UserProfile | null>>>(new Map())
  const profileCreationDebounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const profileOperationStates = useRef<Map<string, 'idle' | 'fetching' | 'creating' | 'error'>>(new Map())

  // Ensure component is mounted before any operations
  useEffect(() => {
    try {
      setMounted(true)
      
      // Log performance summary on unmount (development only) and cleanup
      return () => {
        try {
          if (process.env.NODE_ENV === 'development') {
            logAuthPerformanceSummary()
          }
          
          // Clean up all profile operation state and timers
          profileOperationStates.current.clear()
          profileOperationLocks.current.clear()
          profileCreationDebounceTimers.current.forEach(timer => clearTimeout(timer))
          profileCreationDebounceTimers.current.clear()
        } catch (error) {
          console.warn('Error during cleanup:', error)
        }
      }
    } catch (error) {
      console.error('Error in mount effect:', error)
      setMounted(true) // Ensure we still set mounted even if there's an error
    }
  }, [])

  // Optimized function to fetch user profile with caching, performance monitoring, and deduplication
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const timer = performanceMonitor.startTimer(`fetchUserProfile`)
    profileFetchCount.current += 1
    
    try {
      // Validate user ID
      if (!userId || typeof userId !== 'string') {
        console.warn('Invalid user ID provided to fetchUserProfile:', userId)
        timer.end()
        return null
      }
      
      // Check if there's already an ongoing operation for this user
      const existingOperation = profileOperationLocks.current.get(userId)
      if (existingOperation) {
        console.log('Reusing existing profile operation for user:', userId)
        timer.end(true)
        return await existingOperation
      }
      
      // Check current operation state
      const currentState = profileOperationStates.current.get(userId)
      if (currentState === 'fetching' || currentState === 'creating') {
        console.log('Profile operation already in progress for user:', userId, 'state:', currentState)
        timer.end()
        return profile // Return current profile if operation is in progress
      }
      
      // Check if we already fetched this profile recently to prevent redundant calls
      if (lastProfileFetch.current === userId && profile?.id === userId) {
        console.log('Skipping redundant profile fetch for user:', userId)
        timer.end()
        return profile // Return current profile if it's for the same user
      }
      
      // Check cache first
      const cachedProfile = authCache.get(`profile_${userId}`)
      if (cachedProfile) {
        console.log('Using cached profile for user:', userId)
        timer.end(true)
        lastProfileFetch.current = userId
        profileOperationStates.current.set(userId, 'idle')
        return cachedProfile as UserProfile
      }
      
      // Set operation state and create lock
      profileOperationStates.current.set(userId, 'fetching')
      
      const fetchOperation = (async (): Promise<UserProfile | null> => {
        try {
          console.log(`Fetching profile for user ID: ${userId} (fetch #${profileFetchCount.current})`)
          
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) {
            // Check if error object has meaningful content
            const hasErrorContent = error.message || error.details || error.hint || error.code
            
            if (hasErrorContent) {
              console.error('Error fetching profile:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                userId
              })
              
              // If profile doesn't exist, that's not necessarily an error
              if (error.code === 'PGRST116') {
                console.log('Profile not found for user:', userId)
                profileOperationStates.current.set(userId, 'idle')
                return null
              }
            } else {
              // Empty error object - likely means no data found
              console.log('No profile found for user (empty error object):', userId)
            }
            
            profileOperationStates.current.set(userId, 'error')
            return null
          }

          const userProfile = data as UserProfile
          console.log('Profile fetched successfully:', userProfile)
          
          // Cache the profile
          authCache.set(`profile_${userId}`, userProfile)
          lastProfileFetch.current = userId
          profileOperationStates.current.set(userId, 'idle')
          
          return userProfile
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.error('Exception fetching profile:', {
            error: errorMessage,
            userId,
            stack: error instanceof Error ? error.stack : undefined
          })
          profileOperationStates.current.set(userId, 'error')
          return null
        }
      })()
      
      // Store the operation promise
      profileOperationLocks.current.set(userId, fetchOperation)
      
      const result = await fetchOperation
      
      // Clean up the lock
      profileOperationLocks.current.delete(userId)
      
      timer.end(result !== null)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Exception in fetchUserProfile:', error)
      profileOperationStates.current.set(userId, 'error')
      profileOperationLocks.current.delete(userId)
      timer.end(false, errorMessage)
      return null
    }
  }, [profile])

  // Idempotent function to create or get user profile when authenticated with deduplication
  const createUserProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    const timer = performanceMonitor.startTimer('createUserProfile')
    
    try {
      // Check if there's already an ongoing operation for this user
      const existingOperation = profileOperationLocks.current.get(user.id)
      if (existingOperation) {
        console.log('Reusing existing profile creation operation for user:', user.id)
        timer.end(true)
        return await existingOperation
      }
      
      // Check current operation state
      const currentState = profileOperationStates.current.get(user.id)
      if (currentState === 'creating' || currentState === 'fetching') {
        console.log('Profile operation already in progress for user:', user.id, 'state:', currentState)
        timer.end()
        return profile // Return current profile if operation is in progress
      }
      
      // Set operation state and create lock
      profileOperationStates.current.set(user.id, 'creating')
      
      const createOperation = (async (): Promise<UserProfile | null> => {
        try {
          // First, check if profile already exists
          console.log('Checking if profile exists for user:', user.id)
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (existingProfile) {
            console.log('Profile already exists for user:', user.id)
            // Cache the existing profile
            authCache.set(`profile_${user.id}`, existingProfile)
            lastProfileFetch.current = user.id
            profileOperationStates.current.set(user.id, 'idle')
            return existingProfile as UserProfile
          }

          // If profile doesn't exist (PGRST116 error is expected), create new one
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Unexpected error checking profile existence:', fetchError)
            profileOperationStates.current.set(user.id, 'error')
            return null
          }

          // Get user metadata from signup
          const userData = user.user_metadata || {}
          
          // Determine role from metadata or default to student
          const role = userData.role || 'student'
          
          const profileData = {
            id: user.id,
            email: user.email!,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || null,
            role: role
          }

          console.log('Creating new profile for user:', user.id, 'with role:', role)
          console.log('Profile data:', profileData)
          
          const { data, error } = await supabase
            .from('profiles')
            .insert(profileData as any)
            .select()
            .single()

          if (error) {
            // Handle duplicate key constraint violation (PostgreSQL error code 23505)
            if (error.code === '23505') {
              console.log('Profile creation failed due to duplicate key, fetching existing profile for user:', user.id)
              
              // Fetch the existing profile that caused the constraint violation
              const { data: existingProfileAfterError, error: refetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

              if (refetchError) {
                console.error('Error fetching existing profile after duplicate key error:', refetchError)
                profileOperationStates.current.set(user.id, 'error')
                return null
              }

              if (existingProfileAfterError) {
                console.log('Successfully retrieved existing profile after duplicate key error:', (existingProfileAfterError as any).id)
                // Cache the existing profile
                authCache.set(`profile_${user.id}`, existingProfileAfterError)
                lastProfileFetch.current = user.id
                profileOperationStates.current.set(user.id, 'idle')
                return existingProfileAfterError as UserProfile
              }
            }

            console.error('Error creating profile:', error)
            console.error('Error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            })
            profileOperationStates.current.set(user.id, 'error')
            return null
          }

          const newProfile = data as UserProfile
          console.log('Profile created successfully:', newProfile)
          
          // Cache the newly created profile
          authCache.set(`profile_${user.id}`, newProfile)
          lastProfileFetch.current = user.id
          profileOperationStates.current.set(user.id, 'idle')
          
          return newProfile
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.error('Error in createUserProfile operation:', error)
          console.error('Error type:', typeof error)
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
          profileOperationStates.current.set(user.id, 'error')
          return null
        }
      })()
      
      // Store the operation promise
      profileOperationLocks.current.set(user.id, createOperation)
      
      const result = await createOperation
      
      // Clean up the lock
      profileOperationLocks.current.delete(user.id)
      
      timer.end(result !== null)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error in createUserProfile:', error)
      profileOperationStates.current.set(user.id, 'error')
      profileOperationLocks.current.delete(user.id)
      timer.end(false, errorMessage)
      return null
    }
  }, [profile])

  // Debounced profile creation to prevent multiple rapid calls
  const debouncedCreateUserProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    return new Promise((resolve) => {
      // Clear any existing timer for this user
      const existingTimer = profileCreationDebounceTimers.current.get(user.id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      
      // Set a new timer
      const timer = setTimeout(async () => {
        try {
          const result = await createUserProfile(user)
          resolve(result)
        } catch (error) {
          console.error('Error in debounced profile creation:', error)
          resolve(null)
        } finally {
          // Clean up the timer
          profileCreationDebounceTimers.current.delete(user.id)
        }
      }, 300) // 300ms debounce delay
      
      profileCreationDebounceTimers.current.set(user.id, timer)
    })
  }, [createUserProfile])

  // Helper function to clear all profile operation state for a user
  const clearProfileOperationState = useCallback((userId: string) => {
    profileOperationStates.current.delete(userId)
    profileOperationLocks.current.delete(userId)
    const timer = profileCreationDebounceTimers.current.get(userId)
    if (timer) {
      clearTimeout(timer)
      profileCreationDebounceTimers.current.delete(userId)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('[AuthProvider] Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('[AuthProvider] Initial session result:', {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          error: error?.message
        })
        
        if (error) {
          console.error('Error getting session:', error)
          // Critical session errors should be handled by error boundary
          if (error.message.includes('Network') || error.message.includes('fetch')) {
            throw error
          }
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch user profile if session exists
        if (session?.user?.id) {
          // Use safe getUser() that checks for session first
          try {
            const { data: { user: freshUser }, error: userError } = await safeGetUser()
            
            if (userError || !freshUser) {
              console.warn('Safe getUser failed, using session user:', userError && typeof userError === 'object' && userError !== null && 'message' in userError ? (userError as any).message : 'Unknown error')
              // Fall back to session user if getUser() fails
              const userProfile = await fetchUserProfile(session.user.id)
              setProfile(userProfile)
            } else {
              let userProfile = await fetchUserProfile(freshUser.id)
              
              // If profile doesn't exist, create it using debounced creation
              if (!userProfile) {
                console.log('Profile not found on initial load, creating new profile for user:', freshUser.id)
                userProfile = await debouncedCreateUserProfile(freshUser)
              }
              
              setProfile(userProfile)
            }
          } catch (error) {
            console.warn('Safe getUser threw error, using session user instead:', error)
            // Critical errors should bubble up to error boundary
            if (error instanceof Error && 
                (error.message.includes('Network') || error.message.includes('fetch'))) {
              throw error
            }
            // Fall back to using session user
            const userProfile = await fetchUserProfile(session.user.id)
            setProfile(userProfile)
          }
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth session check failed:', error)
        
        // Parse and log the error
        const parsedError = parseAuthError(error)
        logAuthError(parsedError, { context: 'initial_session_check' })
        
        // Critical initialization errors should be handled by error boundary
        if (error instanceof Error && 
            (error.message.includes('Network') || error.message.includes('fetch'))) {
          throw error
        }
        
        setUser(null)
        setSession(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          console.log('[AuthProvider] Auth state changed:', {
            event,
            hasSession: !!session,
            userId: session?.user?.id,
            userEmail: session?.user?.email
          })
          setSession(session)
          setUser(session?.user ?? null)
          
          // Fetch user profile if session exists
          if (session?.user?.id) {
            console.log('Session user found, fetching profile for:', session.user.id)
            // Use safe getUser() that checks for session first
            try {
              const { data: { user: freshUser }, error: userError } = await safeGetUser()
              
              if (userError || !freshUser) {
                console.warn('Safe getUser failed in auth change, using session user:', userError && typeof userError === 'object' && userError !== null && 'message' in userError ? (userError as any).message : 'Unknown error')
                // Fall back to session user if getUser() fails
                const userProfile = await fetchUserProfile(session.user.id)
                setProfile(userProfile)
              } else {
                let userProfile = await fetchUserProfile(freshUser.id)
                
                // If profile doesn't exist, create it (user just verified email) using debounced creation
                if (!userProfile) {
                  console.log('Profile not found, creating new profile for user:', freshUser.id)
                  userProfile = await debouncedCreateUserProfile(freshUser)
                }
                
                setProfile(userProfile)
              }
            } catch (error) {
              console.warn('Safe getUser threw error in auth change, using session user instead:', error)
              // Fall back to using session user
              try {
                const userProfile = await fetchUserProfile(session.user.id)
                setProfile(userProfile)
              } catch (profileError) {
                console.error('Failed to fetch profile for session user:', profileError)
                setProfile(null)
              }
            }
          } else {
            console.log('No session found, clearing profile')
            setProfile(null)
          }
          
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Failed to set up auth listener:', error)
      setLoading(false)
    }
  }, [mounted])

  const signIn = useCallback(async (email: string, password: string) => {
    const timer = performanceMonitor.startTimer('signIn')
    setLoading(true)
    
    try {
      // Clear any cached data for fresh login
      authCache.clear()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        
        // Parse and log the error
        const parsedError = parseAuthError(error)
        logAuthError(parsedError, { context: 'sign_in' })
        
        // Handle specific authentication errors gracefully
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('User not found')) {
          timer.end(false, error.message)
          return { data: null, error }
        }
        
        // Let error boundary handle critical errors
        throw error
      }
      
      // Check if user is authenticated and email is confirmed
      if (data.user && data.session) {
        console.log('User signed in successfully:', data.user.email)
        timer.end(true)
        return { data, error: null }
      } else {
        const authError = new Error('Authentication failed')
        throw authError
      }
    } catch (error) {
      console.error('Sign in error:', error)
      // Critical errors should be handled by error boundary
      if (error instanceof Error && 
          (error.message.includes('Network') || error.message.includes('fetch'))) {
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : String(error)
      timer.end(false, errorMessage)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }, [])

  const signUpStudent = useCallback(async (email: string, password: string, userData: {
    first_name: string
    last_name: string
    phone?: string
  }) => {
    let timer: any
    try {
      timer = performanceMonitor.startTimer('signUpStudent')
    } catch (timerError) {
      console.warn('Performance timer error:', timerError)
      timer = { end: () => {} } // Fallback timer
    }
    
    setLoading(true)
    console.log('signUpStudent called with:', { email, userData })
    
    try {
      console.log('Calling supabase.auth.signUp...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            role: 'student'
          }
        }
      })
      
      console.log('Supabase signUp response:', {
        user_id: data?.user?.id,
        user_email: data?.user?.email,
        session_exists: !!data?.session,
        error: error?.message
      })
      
      if (error) {
        console.error('Supabase signup error:', error)
        throw error
      }
      
      // Don't create profile immediately - user needs to verify email first
      // Profile will be created when user is authenticated (after email verification)
      console.log('Student signup successful. User needs to verify email before profile creation.')
      
      try {
        timer.end(true)
      } catch (timerError) {
        console.warn('Timer end error:', timerError)
      }
      return { data, error: null }
    } catch (error) {
      console.error('Student sign up error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      try {
        timer.end(false, errorMessage)
      } catch (timerError) {
        console.warn('Timer end error:', timerError)
      }
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }, [])

  const signUpCollege = useCallback(async (email: string, password: string, userData: {
    first_name: string
    last_name: string
    phone?: string
    college_id: string
    contact_person: string
    designation?: string
  }) => {
    const timer = performanceMonitor.startTimer('signUpCollege')
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            role: 'college'
          }
        }
      })
      
      if (error) throw error
      
      // Don't create profile immediately - user needs to verify email first
      // Profile will be created when user is authenticated (after email verification)
      console.log('College signup successful. User needs to verify email before profile creation.')
      
      timer.end(true)
      return { data, error: null }
    } catch (error) {
      console.error('College sign up error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      timer.end(false, errorMessage)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }, [])

  const signUpAdmin = useCallback(async (email: string, password: string, userData: {
    first_name: string
    last_name: string
    phone?: string
  }) => {
    const timer = performanceMonitor.startTimer('signUpAdmin')
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            role: 'admin'
          }
        }
      })
      
      if (error) throw error
      
      // Don't create profile immediately - user needs to verify email first
      // Profile will be created when user is authenticated (after email verification)
      console.log('Admin signup successful. User needs to verify email before profile creation.')
      
      timer.end(true)
      return { data, error: null }
    } catch (error) {
      console.error('Admin sign up error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      timer.end(false, errorMessage)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    const timer = performanceMonitor.startTimer('signOut')
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear all cached data and operation state on sign out
      authCache.clear()
      profileFetchCount.current = 0
      lastProfileFetch.current = null
      
      // Clear all profile operation state
      profileOperationStates.current.clear()
      profileOperationLocks.current.clear()
      
      // Clear all debounce timers
      profileCreationDebounceTimers.current.forEach(timer => clearTimeout(timer))
      profileCreationDebounceTimers.current.clear()
      
      setUser(null)
      setSession(null)
      setProfile(null)
      
      timer.end(true)
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      timer.end(false, errorMessage)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    const timer = performanceMonitor.startTimer(`signInWithOAuth(${provider})`)
    setLoading(true)
    
    try {
      // Clear any cached data for fresh login
      authCache.clear()
      
      // Build redirect URL with robust fallbacks
      let redirectTo: string
      
      if (typeof window !== 'undefined') {
        // Client-side: use current origin
        try {
          redirectTo = `${window.location.origin}/auth/callback`
        } catch (error) {
          console.warn('Failed to get window.location.origin:', error)
          redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
        }
      } else {
        // Server-side: use environment variable
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        if (!appUrl) {
          throw new Error('NEXT_PUBLIC_APP_URL environment variable is required for OAuth')
        }
        redirectTo = `${appUrl}/auth/callback`
      }
      
      console.log('OAuth redirect URL:', redirectTo)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo
        }
      })
      
      if (error) throw error
      
      timer.end(true)
      return { data, error: null }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      timer.end(false, errorMessage)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const timer = performanceMonitor.startTimer('resetPassword')
    
    try {
      // Ensure we're in the browser environment
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/reset-password`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
        
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      })
      
      if (error) throw error
      
      timer.end(true)
      return { error: null }
    } catch (error) {
      console.error('Password reset error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      timer.end(false, errorMessage)
      return { error: error as AuthError }
    }
  }, [])

  // Memoized role helper functions
  const hasRole = useCallback((role: 'student' | 'admin' | 'college'): boolean => {
    return profile?.role === role
  }, [profile?.role])

  const isAdmin = useCallback((): boolean => {
    return profile?.role === 'admin'
  }, [profile?.role])

  const isStudent = useCallback((): boolean => {
    return profile?.role === 'student'
  }, [profile?.role])

  const isCollege = useCallback((): boolean => {
    return profile?.role === 'college'
  }, [profile?.role])

  // Memoized centralized redirect helpers
  const requireAuth = useCallback((): void => {
    // Don't redirect if still loading
    if (loading) return
    
    // Redirect to login if no user or session
    if (!user || !session) {
      console.log('requireAuth: User not authenticated, redirecting to login')
      router.push('/auth/login')
      return
    }
    
    // Check if user has a profile (completed registration)
    if (!profile) {
      console.log('requireAuth: User authenticated but no profile, redirecting to complete profile')
      router.push('/auth/complete-profile')
      return
    }
  }, [loading, user, session, profile, router])

  const requireRole = useCallback((requiredRole: 'student' | 'admin' | 'college'): void => {
    // Don't redirect if still loading
    if (loading) return
    
    // First ensure user is authenticated
    if (!user || !session) {
      console.log('requireRole: User not authenticated, redirecting to login')
      router.push('/auth/login')
      return
    }
    
    // Check if user has a profile
    if (!profile) {
      console.log('requireRole: User authenticated but no profile, redirecting to complete profile')
      router.push('/auth/complete-profile')
      return
    }
    
    // Check if user has the required role
    if (profile.role !== requiredRole) {
      console.log(`requireRole: User role '${profile.role}' does not match required role '${requiredRole}', redirecting to dashboard`)
      // Redirect to appropriate dashboard based on user's actual role
      switch (profile.role) {
        case 'admin':
          router.push('/admin')
          break
        case 'college':
          router.push('/colleges/dashboard')
          break
        case 'student':
        default:
          router.push('/dashboard')
          break
      }
      return
    }
  }, [loading, user, session, profile, router])

  // Memoize the context value to prevent unnecessary re-renders
  const value: AuthContextType = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signIn,
    signUpStudent,
    signUpCollege,
    signUpAdmin,
    signOut,
    signInWithOAuth,
    resetPassword,
    hasRole,
    isAdmin,
    isStudent,
    isCollege,
    requireAuth,
    requireRole,
  }), [
    user,
    session,
    profile,
    loading,
    signIn,
    signUpStudent,
    signUpCollege,
    signUpAdmin,
    signOut,
    signInWithOAuth,
    resetPassword,
    hasRole,
    isAdmin,
    isStudent,
    isCollege,
    requireAuth,
    requireRole,
  ])

  // Don't render until component is mounted to prevent hydration issues
  if (!mounted) {
    return (
      <AuthErrorProvider>
        <AuthErrorBoundary>
          <AuthContext.Provider value={{
            user: null,
            session: null,
            profile: null,
            loading: true,
            signIn: async () => ({ data: null, error: null }),
            signUpStudent: async () => ({ data: null, error: null }),
            signUpCollege: async () => ({ data: null, error: null }),
            signUpAdmin: async () => ({ data: null, error: null }),
            signOut: async () => ({ error: null }),
            signInWithOAuth: async () => ({ data: null, error: null }),
            resetPassword: async () => ({ error: null }),
            hasRole: () => false,
            isAdmin: () => false,
            isStudent: () => false,
            isCollege: () => false,
            requireAuth: () => {},
            requireRole: () => {},
          }}>
            {children}
          </AuthContext.Provider>
        </AuthErrorBoundary>
      </AuthErrorProvider>
    )
  }

  // Validate the value object before passing to context
  if (!value) {
    console.error('AuthContext value is undefined!')
    throw new Error('AuthContext value is undefined')
  }

  return (
    <AuthErrorProvider>
      <AuthErrorBoundary>
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      </AuthErrorBoundary>
    </AuthErrorProvider>
  )
}
