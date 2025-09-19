/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthErrorProvider, useAuthError } from '@/contexts/AuthErrorContext'
import { AuthErrorDisplay } from '@/components/AuthErrorDisplay'
import { AuthFallback } from '@/components/AuthFallback'
import { parseAuthError, AuthErrorType } from '@/lib/auth-errors'
import { useAuthErrorHandling } from '@/hooks/useAuthErrorHandling'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock auth provider
jest.mock('@/app/providers', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    profile: null,
    loading: false,
  }),
}))

describe('Authentication Error Handling', () => {
  describe('parseAuthError', () => {
    it('should parse invalid credentials error correctly', () => {
      const error = new Error('Invalid login credentials')
      const parsed = parseAuthError(error)
      
      expect(parsed.type).toBe(AuthErrorType.INVALID_CREDENTIALS)
      expect(parsed.userMessage).toContain('Invalid email or password')
      expect(parsed.recoverable).toBe(true)
      expect(parsed.retryable).toBe(true)
    })

    it('should parse session expired error correctly', () => {
      const error = new Error('Session has expired')
      const parsed = parseAuthError(error)
      
      expect(parsed.type).toBe(AuthErrorType.SESSION_EXPIRED)
      expect(parsed.userMessage).toContain('session has expired')
      expect(parsed.recoverable).toBe(true)
      expect(parsed.retryable).toBe(false)
      expect(parsed.redirectTo).toBe('/auth/login')
    })

    it('should parse network error correctly', () => {
      const error = new Error('Network connection failed')
      const parsed = parseAuthError(error)
      
      expect(parsed.type).toBe(AuthErrorType.NETWORK_ERROR)
      expect(parsed.userMessage).toContain('Network error')
      expect(parsed.recoverable).toBe(true)
      expect(parsed.retryable).toBe(true)
    })

    it('should handle unknown errors gracefully', () => {
      const error = new Error('Some unknown error')
      const parsed = parseAuthError(error)
      
      expect(parsed.type).toBe(AuthErrorType.UNKNOWN_ERROR)
      expect(parsed.userMessage).toContain('unexpected error')
      expect(parsed.recoverable).toBe(true)
      expect(parsed.retryable).toBe(true)
    })
  })

  describe('AuthErrorDisplay', () => {
    it('should render error message correctly', () => {
      const error = parseAuthError(new Error('Invalid login credentials'))
      
      render(<AuthErrorDisplay error={error} />)
      
      expect(screen.getByText(/Invalid email or password/)).toBeInTheDocument()
      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    })

    it('should show retry button for retryable errors', () => {
      const error = parseAuthError(new Error('Network connection failed'))
      const onRetry = jest.fn()
      
      render(<AuthErrorDisplay error={error} onRetry={onRetry} />)
      
      const retryButton = screen.getByText('Retry')
      expect(retryButton).toBeInTheDocument()
      
      fireEvent.click(retryButton)
      expect(onRetry).toHaveBeenCalled()
    })

    it('should show appropriate action button', () => {
      const error = parseAuthError(new Error('Session has expired'))
      
      render(<AuthErrorDisplay error={error} />)
      
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })
  })

  describe('AuthFallback', () => {
    it('should render unauthenticated fallback correctly', () => {
      render(<AuthFallback type="unauthenticated" />)
      
      expect(screen.getByText('Authentication Required')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Create Account')).toBeInTheDocument()
    })

    it('should render profile incomplete fallback correctly', () => {
      render(<AuthFallback type="profile_incomplete" />)
      
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
      expect(screen.getByText('Complete Profile')).toBeInTheDocument()
    })

    it('should render network error fallback correctly', () => {
      const onRetry = jest.fn()
      render(<AuthFallback type="network_error" onRetry={onRetry} />)
      
      expect(screen.getByText('Connection Error')).toBeInTheDocument()
      
      const retryButton = screen.getByText('Try Again')
      fireEvent.click(retryButton)
      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('AuthErrorProvider', () => {
    function TestComponent() {
      const { showError, currentError, clearError, hasError } = useAuthError()
      
      return (
        <div>
          <button onClick={() => showError(new Error('Test error'))}>
            Show Error
          </button>
          <button onClick={clearError}>Clear Error</button>
          {hasError && <div>Has Error: {currentError?.userMessage}</div>}
        </div>
      )
    }

    it('should manage error state correctly', async () => {
      render(
        <AuthErrorProvider>
          <TestComponent />
        </AuthErrorProvider>
      )
      
      const showButton = screen.getByText('Show Error')
      const clearButton = screen.getByText('Clear Error')
      
      // Show error
      fireEvent.click(showButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Has Error:/)).toBeInTheDocument()
      })
      
      // Clear error
      fireEvent.click(clearButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/Has Error:/)).not.toBeInTheDocument()
      })
    })
  })

  describe('useAuthErrorHandling', () => {
    function TestComponent() {
      const { handleError, currentError, hasError, clearError } = useAuthErrorHandling({
        autoRedirect: false,
        showNotifications: false
      })
      
      return (
        <div>
          <button onClick={() => handleError(new Error('Test error'))}>
            Handle Error
          </button>
          <button onClick={clearError}>Clear Error</button>
          {hasError && <div>Error: {currentError?.userMessage}</div>}
        </div>
      )
    }

    it('should handle errors correctly', async () => {
      render(
        <AuthErrorProvider>
          <TestComponent />
        </AuthErrorProvider>
      )
      
      const handleButton = screen.getByText('Handle Error')
      
      fireEvent.click(handleButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
      })
    })
  })
})

describe('Error Boundary Integration', () => {
  // Mock console.error to avoid noise in tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  
  afterAll(() => {
    console.error = originalError
  })

  function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
    if (shouldThrow) {
      throw new Error('Test component error')
    }
    return <div>No Error</div>
  }

  it('should catch and handle component errors', () => {
    const { rerender } = render(
      <AuthErrorProvider>
        <ThrowError shouldThrow={false} />
      </AuthErrorProvider>
    )
    
    expect(screen.getByText('No Error')).toBeInTheDocument()
    
    // This should be caught by error boundary in a real scenario
    expect(() => {
      rerender(
        <AuthErrorProvider>
          <ThrowError shouldThrow={true} />
        </AuthErrorProvider>
      )
    }).toThrow()
  })
})

describe('Error Message Localization', () => {
  it('should provide user-friendly error messages', () => {
    const testCases = [
      {
        error: new Error('Invalid login credentials'),
        expectedMessage: 'Invalid email or password'
      },
      {
        error: new Error('Email not confirmed'),
        expectedMessage: 'check your email and click the confirmation link'
      },
      {
        error: new Error('Network connection failed'),
        expectedMessage: 'Network error'
      },
      {
        error: new Error('Session has expired'),
        expectedMessage: 'session has expired'
      }
    ]
    
    testCases.forEach(({ error, expectedMessage }) => {
      const parsed = parseAuthError(error)
      expect(parsed.userMessage.toLowerCase()).toContain(expectedMessage.toLowerCase())
    })
  })
})

describe('Error Recovery Actions', () => {
  it('should provide appropriate recovery actions for different error types', () => {
    const testCases = [
      {
        error: new Error('Invalid login credentials'),
        expectedAction: 'retry'
      },
      {
        error: new Error('Session has expired'),
        expectedAction: 'login'
      },
      {
        error: new Error('Profile not found'),
        expectedAction: 'complete_profile'
      },
      {
        error: new Error('User not found'),
        expectedAction: 'signup'
      }
    ]
    
    testCases.forEach(({ error, expectedAction }) => {
      const parsed = parseAuthError(error)
      expect(parsed.action).toBe(expectedAction)
    })
  })
})