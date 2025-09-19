"use client"

import React from 'react'
import { useAuth } from '@/app/providers'
import { AuthPageLoading } from './AuthStatusIndicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRole?: 'student' | 'admin' | 'college'
  fallback?: React.ReactNode
  loadingComponent?: React.ReactNode
  showLoginPrompt?: boolean
}

/**
 * Component-based authentication guard that conditionally renders children
 * based on authentication state and role requirements
 */
export function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  fallback,
  loadingComponent,
  showLoginPrompt = true
}: AuthGuardProps) {
  const { user, profile, loading, hasRole } = useAuth()

  // Show loading state
  if (loading) {
    return loadingComponent || <AuthPageLoading />
  }

  // Check authentication requirement
  if (requireAuth && (!user || !profile)) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showLoginPrompt) {
      return <AuthLoginPrompt />
    }

    return null
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return <AuthRoleError requiredRole={requiredRole} userRole={profile?.role} />
  }

  return <>{children}</>
}

/**
 * Login prompt component for unauthenticated users
 */
function AuthLoginPrompt() {
  const handleLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }

  const handleSignup = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signup'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Authentication Required</CardTitle>
          <CardDescription>
            You need to be logged in to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLogin} className="w-full">
            Log In
          </Button>
          <Button onClick={handleSignup} variant="outline" className="w-full">
            Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Role error component for insufficient permissions
 */
function AuthRoleError({ 
  requiredRole, 
  userRole 
}: { 
  requiredRole: string
  userRole?: string 
}) {
  const handleGoToDashboard = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 text-center">
            <p>Required role: <span className="font-medium capitalize">{requiredRole}</span></p>
            {userRole && (
              <p>Your role: <span className="font-medium capitalize">{userRole}</span></p>
            )}
          </div>
          <Button onClick={handleGoToDashboard} className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Specific guards for different roles
 */
export function AdminGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard {...props} requiredRole="admin">
      {children}
    </AuthGuard>
  )
}

export function StudentGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard {...props} requiredRole="student">
      {children}
    </AuthGuard>
  )
}

export function CollegeGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard {...props} requiredRole="college">
      {children}
    </AuthGuard>
  )
}