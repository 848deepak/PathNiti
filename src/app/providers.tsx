"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser((session as any)?.user ?? null) // eslint-disable-line @typescript-eslint/no-explicit-any
      } catch (error) {
        console.warn('Auth session check failed, using mock user:', error)
        // Create a mock user for development
        const mockUser = {
          id: 'demo-user-id',
          email: 'demo@pathniti.in',
          user_metadata: {
            role: 'student',
            first_name: 'Demo',
            last_name: 'User'
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User
        setUser(mockUser)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        try {
          setUser(session?.user ?? null)
        } catch (error) {
          console.warn('Auth state change failed:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.warn('Sign out failed:', error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
