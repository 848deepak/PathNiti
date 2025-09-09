import { useState, useEffect } from 'react'

export function useAuth() {
  const [user] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock auth state
    setLoading(false)
  }, [])

  return {
    user,
    loading,
    signIn: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  }
}