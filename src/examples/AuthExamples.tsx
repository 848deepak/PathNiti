/**
 * Examples of how to use the enhanced authentication system
 * These are example components showing different patterns for using the centralized auth
 */

"use client"

import React from 'react'
import { useAuth } from '@/app/providers'
import { useAuthGuard, useRequireAuth, useRequireAdmin } from '@/hooks/useAuthGuard'
import { withAuth, withAdminAuth } from '@/components/withAuth'
import { AuthGate, AuthStatusIndicator, AuthPageLoading } from '@/components/AuthStatusIndicator'

// Example 1: Using requireAuth() directly in a component
export function ExamplePageWithDirectAuth() {
  const { user, profile, loading, requireAuth } = useAuth()

  // This will automatically redirect if not authenticated
  React.useEffect(() => {
    requireAuth()
  }, [requireAuth])

  if (loading) return <AuthPageLoading />

  return (
    <div>
      <h1>Protected Page</h1>
      <AuthStatusIndicator showRole showEmail />
      <p>Welcome, {profile?.first_name}!</p>
    </div>
  )
}

// Example 2: Using the useAuthGuard hook
export function ExamplePageWithAuthGuard() {
  const { user, profile, loading, isReady } = useAuthGuard({
    requireAuth: true
  })

  if (loading) return <AuthPageLoading />
  if (!isReady) return <div>Redirecting...</div>

  return (
    <div>
      <h1>Protected Page with Guard</h1>
      <p>Welcome, {profile?.first_name}!</p>
    </div>
  )
}

// Example 3: Using the convenience hooks
export function ExampleStudentPage() {
  const { user, profile, loading, isReady } = useRequireAuth()

  if (loading) return <AuthPageLoading />

  return (
    <div>
      <h1>Student Dashboard</h1>
      <AuthStatusIndicator showRole />
      <p>Welcome, {profile?.first_name}!</p>
    </div>
  )
}

// Example 4: Admin-only page using hook
export function ExampleAdminPage() {
  const { user, profile, loading, isReady } = useRequireAdmin()

  if (loading) return <AuthPageLoading />

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AuthStatusIndicator showRole showEmail />
      <p>Welcome, Admin {profile?.first_name}!</p>
    </div>
  )
}

// Example 5: Using Higher-Order Component (HOC)
const ExamplePageWithHOC = withAuth(() => {
  const { profile } = useAuth()
  
  return (
    <div>
      <h1>HOC Protected Page</h1>
      <p>Welcome, {profile?.first_name}!</p>
    </div>
  )
})

// Example 6: Admin-only page using HOC
const ExampleAdminPageWithHOC = withAdminAuth(() => {
  const { profile } = useAuth()
  
  return (
    <div>
      <h1>Admin HOC Page</h1>
      <p>Welcome, Admin {profile?.first_name}!</p>
    </div>
  )
})

// Example 7: Using AuthGate for conditional rendering
export function ExamplePageWithAuthGate() {
  return (
    <div>
      <h1>Public Page with Protected Content</h1>
      
      <p>This content is visible to everyone.</p>
      
      <AuthGate
        fallback={<p>Please log in to see protected content.</p>}
        loadingFallback={<p>Loading...</p>}
      >
        <div className="bg-blue-50 p-4 rounded">
          <h2>Protected Content</h2>
          <p>This is only visible to authenticated users.</p>
        </div>
      </AuthGate>
      
      <AuthGate
        requireRole="admin"
        fallback={<p>Admin access required.</p>}
      >
        <div className="bg-red-50 p-4 rounded mt-4">
          <h2>Admin Only Content</h2>
          <p>This is only visible to admins.</p>
        </div>
      </AuthGate>
    </div>
  )
}

// Example 8: Role-based conditional rendering
export function ExampleRoleBasedPage() {
  const { profile, loading, isAdmin, isStudent, isCollege } = useAuth()

  if (loading) return <AuthPageLoading />

  return (
    <div>
      <h1>Role-Based Dashboard</h1>
      <AuthStatusIndicator showRole showEmail />
      
      {isAdmin() && (
        <div className="bg-red-50 p-4 rounded mb-4">
          <h2>Admin Section</h2>
          <p>Admin-specific content here</p>
        </div>
      )}
      
      {isStudent() && (
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h2>Student Section</h2>
          <p>Student-specific content here</p>
        </div>
      )}
      
      {isCollege() && (
        <div className="bg-green-50 p-4 rounded mb-4">
          <h2>College Section</h2>
          <p>College-specific content here</p>
        </div>
      )}
    </div>
  )
}

// Export HOC examples
export { ExamplePageWithHOC, ExampleAdminPageWithHOC }