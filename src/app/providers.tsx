"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session, AuthError, AuthChangeEvent } from "@supabase/supabase-js"
import { createSupabaseClient, supabase, safeGetUser } from "@/lib/supabase"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false) // Start with false to prevent hydration mismatch

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Validate user ID
      if (!userId || typeof userId !== 'string') {
        console.warn('Invalid user ID provided to fetchUserProfile:', userId)
        return null
      }
      
      console.log('Fetching profile for user ID:', userId)
      
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
            return null
          }
        } else {
          // Empty error object - likely means no data found
          console.log('No profile found for user (empty error object):', userId)
        }
        
        return null
      }

      console.log('Profile fetched successfully:', data)
      return data as UserProfile
    } catch (error) {
      console.error('Exception fetching profile:', {
        error: error instanceof Error ? error.message : error,
        userId,
        stack: error instanceof Error ? error.stack : undefined
      })
      return null
    }
  }

  // Function to create user profile when authenticated
  const createUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
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

      console.log('Creating profile for authenticated user:', user.id, 'with role:', role)
      console.log('Profile data:', profileData)
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return null
      }

      console.log('Profile created successfully:', data)
      return data as UserProfile
    } catch (error) {
      console.error('Error creating profile:', error)
      console.error('Error type:', typeof error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch user profile if session exists
        if (session?.user?.id) {
          // Use safe getUser() that checks for session first
          try {
            const { data: { user: freshUser }, error: userError } = await safeGetUser()
            
            if (userError || !freshUser) {
              console.warn('Safe getUser failed, using session user:', userError?.message)
              // Fall back to session user if getUser() fails
              const userProfile = await fetchUserProfile(session.user.id)
              setProfile(userProfile)
            } else {
              let userProfile = await fetchUserProfile(freshUser.id)
              
              // If profile doesn't exist, create it
              if (!userProfile) {
                console.log('Profile not found on initial load, creating new profile for user:', freshUser.id)
                userProfile = await createUserProfile(freshUser)
              }
              
              setProfile(userProfile)
            }
          } catch (error) {
            console.warn('Safe getUser threw error, using session user instead:', error)
            // Fall back to using session user
            const userProfile = await fetchUserProfile(session.user.id)
            setProfile(userProfile)
          }
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth session check failed:', error)
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
          console.log('Auth state changed:', event, session?.user?.email)
          setSession(session)
          setUser(session?.user ?? null)
          
          // Fetch user profile if session exists
          if (session?.user?.id) {
            console.log('Session user found, fetching profile for:', session.user.id)
            // Use safe getUser() that checks for session first
            try {
              const { data: { user: freshUser }, error: userError } = await safeGetUser()
              
              if (userError || !freshUser) {
                console.warn('Safe getUser failed in auth change, using session user:', userError?.message)
                // Fall back to session user if getUser() fails
                const userProfile = await fetchUserProfile(session.user.id)
                setProfile(userProfile)
              } else {
                let userProfile = await fetchUserProfile(freshUser.id)
                
                // If profile doesn't exist, create it (user just verified email)
                if (!userProfile) {
                  console.log('Profile not found, creating new profile for user:', freshUser.id)
                  userProfile = await createUserProfile(freshUser)
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
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        throw error
      }
      
      // Check if user is authenticated and email is confirmed
      if (data.user && data.session) {
        console.log('User signed in successfully:', data.user.email)
        return { data, error: null }
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signUpStudent = async (email: string, password: string, userData: {
    first_name: string
    last_name: string
    phone?: string
  }) => {
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
      
      return { data, error: null }
    } catch (error) {
      console.error('Student sign up error:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signUpCollege = async (email: string, password: string, userData: {
    first_name: string
    last_name: string
    phone?: string
    college_id: string
    contact_person: string
    designation?: string
  }) => {
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
      
      return { data, error: null }
    } catch (error) {
      console.error('College sign up error:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signUpAdmin = async (email: string, password: string, userData: {
    first_name: string
    last_name: string
    phone?: string
  }) => {
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
      
      return { data, error: null }
    } catch (error) {
      console.error('Admin sign up error:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setSession(null)
      setProfile(null)
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    setLoading(true)
    try {
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
      
      return { data, error: null }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // Ensure we're in the browser environment
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/reset-password`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
        
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      })
      
      if (error) throw error
      
      return { error: null }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: error as AuthError }
    }
  }

  // Role helper functions
  const hasRole = (role: 'student' | 'admin' | 'college'): boolean => {
    return profile?.role === role
  }

  const isAdmin = (): boolean => {
    return profile?.role === 'admin'
  }

  const isStudent = (): boolean => {
    return profile?.role === 'student'
  }

  const isCollege = (): boolean => {
    return profile?.role === 'college'
  }

  const value = {
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
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
