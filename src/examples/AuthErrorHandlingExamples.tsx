"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthErrorHandling, useAuthFormErrorHandling, useAuthApiErrorHandling } from '@/hooks/useAuthErrorHandling'
import { AuthErrorDisplay } from '@/components/AuthErrorDisplay'
import { AuthFallback, SmartAuthFallback } from '@/components/AuthFallback'
import { withAuthErrorHandling } from '@/contexts/AuthErrorContext'
import { AuthErrorType } from '@/lib/auth-errors'

/**
 * Example component demonstrating comprehensive error handling usage
 */
function AuthErrorHandlingExamples() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Basic error handling
  const { handleError, handleAsyncError, currentError, hasError, clearError } = useAuthErrorHandling()
  
  // Form-specific error handling
  const { 
    handleFormError, 
    clearFieldError, 
    fieldErrors, 
    generalError 
  } = useAuthFormErrorHandling()
  
  // API-specific error handling
  const { handleApiCall, wrapApiFunction } = useAuthApiErrorHandling()

  // Example: Simulate different types of authentication errors
  const simulateError = (errorType: string) => {
    const errors = {
      invalid_credentials: new Error('Invalid login credentials'),
      session_expired: new Error('Session has expired'),
      network_error: new Error('Network connection failed'),
      profile_incomplete: new Error('Profile is incomplete'),
      permission_denied: new Error('Access denied - insufficient permissions'),
      server_error: new Error('Internal server error')
    }
    
    const error = errors[errorType as keyof typeof errors] || new Error('Unknown error')
    handleError(error, { context: 'error_simulation', errorType })
  }

  // Example: Form submission with error handling
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Clear previous errors
      clearError()
      
      // Simulate form validation
      if (!email) {
        handleFormError(new Error('Email is required'), 'email')
        return
      }
      
      if (!password) {
        handleFormError(new Error('Password is required'), 'password')
        return
      }
      
      // Simulate API call with error handling
      await handleAsyncError(async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simulate random error
        if (Math.random() > 0.7) {
          throw new Error('Invalid login credentials')
        }
        
        console.log('Login successful!')
      }, { context: 'login_form' })
      
    } catch (error) {
      // Error is already handled by handleAsyncError
      console.log('Login failed:', error)
    }
  }

  // Example: API call with error handling
  const handleApiCall = async () => {
    try {
      await handleApiCall(async () => {
        const response = await fetch('/api/protected-endpoint')
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }
        return response.json()
      }, '/api/protected-endpoint')
    } catch (error) {
      // Error is already handled
      console.log('API call failed:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Authentication Error Handling Examples</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive examples of error handling in authentication flows
        </p>
      </div>

      {/* Error Simulation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Error Simulation</CardTitle>
          <CardDescription>
            Test different types of authentication errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button 
              onClick={() => simulateError('invalid_credentials')} 
              variant="outline" 
              size="sm"
            >
              Invalid Credentials
            </Button>
            <Button 
              onClick={() => simulateError('session_expired')} 
              variant="outline" 
              size="sm"
            >
              Session Expired
            </Button>
            <Button 
              onClick={() => simulateError('network_error')} 
              variant="outline" 
              size="sm"
            >
              Network Error
            </Button>
            <Button 
              onClick={() => simulateError('profile_incomplete')} 
              variant="outline" 
              size="sm"
            >
              Profile Incomplete
            </Button>
            <Button 
              onClick={() => simulateError('permission_denied')} 
              variant="outline" 
              size="sm"
            >
              Permission Denied
            </Button>
            <Button 
              onClick={() => simulateError('server_error')} 
              variant="outline" 
              size="sm"
            >
              Server Error
            </Button>
          </div>
          
          {hasError && currentError && (
            <div className="mt-4">
              <AuthErrorDisplay
                error={currentError}
                onRetry={clearError}
                variant="inline"
                showDetails={true}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Error Handling Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Error Handling</CardTitle>
          <CardDescription>
            Example of form-specific error handling with field-level errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) clearFieldError('email')
                }}
                className={fieldErrors.email ? 'border-red-500' : ''}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) clearFieldError('password')
                }}
                className={fieldErrors.password ? 'border-red-500' : ''}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            
            {generalError && (
              <AuthErrorDisplay
                error={generalError}
                variant="inline"
                showDetails={false}
              />
            )}
          </form>
        </CardContent>
      </Card>

      {/* API Error Handling Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Error Handling</CardTitle>
          <CardDescription>
            Example of API call error handling with automatic retries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleApiCall} className="w-full">
            Make Protected API Call
          </Button>
        </CardContent>
      </Card>

      {/* Fallback UI Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Fallback UI Examples</CardTitle>
          <CardDescription>
            Different fallback states for authentication errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Unauthenticated State</h4>
            <div className="border rounded-lg p-4">
              <AuthFallback type="unauthenticated" className="min-h-[200px]" />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Profile Incomplete State</h4>
            <div className="border rounded-lg p-4">
              <AuthFallback type="profile_incomplete" className="min-h-[200px]" />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Network Error State</h4>
            <div className="border rounded-lg p-4">
              <AuthFallback type="network_error" className="min-h-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Fallback Example */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Fallback</CardTitle>
          <CardDescription>
            Automatically determines the appropriate fallback based on current auth state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4">
            <SmartAuthFallback />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Export the component wrapped with error handling
export default withAuthErrorHandling(AuthErrorHandlingExamples, 'auth_error_examples')

/**
 * Example of a component that uses error boundaries
 */
export function ErrorBoundaryExample() {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('Simulated component error for testing error boundary')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Boundary Test</CardTitle>
        <CardDescription>
          Test the error boundary by triggering a component error
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => setShouldError(true)}
          variant="destructive"
        >
          Trigger Error
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Example of a protected component that requires authentication
 */
export function ProtectedComponentExample() {
  const { user, profile, loading } = useAuth()
  const { handleError } = useAuthErrorHandling()

  if (loading) {
    return <AuthFallback type="loading" />
  }

  if (!user) {
    return <AuthFallback type="unauthenticated" />
  }

  if (!profile) {
    return <AuthFallback type="profile_incomplete" />
  }

  const handleProtectedAction = async () => {
    try {
      // Simulate a protected action that might fail
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            reject(new Error('Session expired'))
          } else {
            resolve('Success')
          }
        }, 1000)
      })
    } catch (error) {
      handleError(error, { context: 'protected_action' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Protected Component</CardTitle>
        <CardDescription>
          This component is only accessible to authenticated users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Welcome, {profile.first_name}!</p>
        <Button onClick={handleProtectedAction}>
          Perform Protected Action
        </Button>
      </CardContent>
    </Card>
  )
}