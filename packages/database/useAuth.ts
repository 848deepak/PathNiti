"use client"

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

interface User {
  id: string
  email: string
  user_metadata?: {
    role?: string
    first_name?: string
    last_name?: string
  }
}

interface AuthState {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For development, create a mock user if no real user is found
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user as User)
        } else {
          // Create a mock user for development
          const mockUser: User = {
            id: 'demo-user-id',
            email: 'demo@eduniti.in',
            user_metadata: {
              role: 'student',
              first_name: 'Demo',
              last_name: 'User'
            }
          }
          setUser(mockUser)
        }
      } catch (error) {
        console.warn('Auth initialization failed, using mock user:', error)
        // Fallback to mock user
        const mockUser: User = {
          id: 'demo-user-id',
          email: 'demo@eduniti.in',
          user_metadata: {
            role: 'student',
            first_name: 'Demo',
            last_name: 'User'
          }
        }
        setUser(mockUser)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user as User)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if sign out fails, clear the user state
      setUser(null)
    }
  }

  return {
    user,
    loading,
    signOut
  }
}
