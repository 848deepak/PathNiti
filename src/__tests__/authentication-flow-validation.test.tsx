/**
 * Authentication Flow Validation Tests
 * 
 * This test suite validates the complete authentication flow and user experience
 * across all refactored pages to ensure consistent behavior and performance.
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { Providers } from '@/app/providers'
import Dashboard from '@/app/dashboard/page'
import Admin from '@/app/admin/page'
import Quiz from '@/app/quiz/page'
import CollegeDashboard from '@/app/colleges/dashboard/page'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}))

// Mock Supabase
const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockSignInWithPassword = jest.fn()
const mockSignOut = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockFrom = jest.fn()
const mockSafeGetUser = jest.fn()

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
    from: mockFrom,
  },
  safeGetUser: mockSafeGetUser,
  createSupabaseClient: jest.fn(),
}))

// Mock auth error utilities
jest.mock('@/lib/auth-errors', () => ({
  parseAuthError: jest.fn((error) => ({ message: error.message, type: 'unknown' })),
  logAuthError: jest.fn(),
}))

// Mock auth performance utilities
jest.mock('@/lib/auth-performance', () => ({
  authPerformanceMonitor: {
    startTimer: jest.fn(() => ({
      end: jest.fn(),
    })),
  },
  logAuthPerformanceSummary: jest.fn(),
}))

// Mock error boundary and context
jest.mock('@/components/AuthErrorBoundary', () => ({
  AuthErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/contexts/AuthErrorContext', () => ({
  AuthErrorProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Providers>{children}</Providers>
)

describe('Authentication Flow Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    
    // Setup default mock implementations
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
    mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle
        })
      })
    })
    mockSafeGetUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  describe('Complete Authentication Flow', () => {
    it('should handle unauthenticated user flow correctly', async () => {
      // Mock unauthenticated state
      mockSafeGetUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })
      mockGetSession.mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Should show loading initially
      expect(screen.getByTestId('auth-loading')).toBeInTheDocument()

      // Should redirect to login after auth check
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('should handle authenticated student user flow correctly', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'student@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'user-123',
        email: 'student@test.com',
        role: 'student',
        full_name: 'Test Student',
      }

      // Mock authenticated state
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Should show loading initially
      expect(screen.getByTestId('auth-loading')).toBeInTheDocument()

      // Should render dashboard content after auth
      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      // Should not redirect
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should handle authenticated admin user flow correctly', async () => {
      const mockUser = {
        id: 'admin-123',
        email: 'admin@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        full_name: 'Test Admin',
      }

      // Mock authenticated admin state
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      // Should show loading initially
      expect(screen.getByTestId('auth-loading')).toBeInTheDocument()

      // Should render admin content after auth
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })

      // Should not redirect
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('Consistent Behavior Across Pages', () => {
    const testPages = [
      { component: Dashboard, name: 'Dashboard', expectedText: 'Student Dashboard' },
      { component: Quiz, name: 'Quiz', expectedText: 'Career Assessment Quiz' },
    ]

    testPages.forEach(({ component: Component, name, expectedText }) => {
      it(`should show consistent loading behavior on ${name} page`, async () => {
        // Mock loading state
        mockSupabase.auth.getUser.mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ 
            data: { user: null }, 
            error: null 
          }), 100))
        )

        render(
          <TestWrapper>
            <Component />
          </TestWrapper>
        )

        // Should show consistent loading component
        expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })

      it(`should show consistent authentication error handling on ${name} page`, async () => {
        // Mock authentication error
        mockSupabase.auth.getUser.mockResolvedValue({ 
          data: { user: null }, 
          error: { message: 'Authentication failed' }
        })

        render(
          <TestWrapper>
            <Component />
          </TestWrapper>
        )

        await waitFor(() => {
          expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
        })
      })
    })
  })

  describe('Role-based Access Control', () => {
    it('should allow admin access to admin page', async () => {
      const mockUser = {
        id: 'admin-123',
        email: 'admin@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        full_name: 'Test Admin',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })
    })

    it('should deny student access to admin page', async () => {
      const mockUser = {
        id: 'student-123',
        email: 'student@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'student-123',
        email: 'student@test.com',
        role: 'student',
        full_name: 'Test Student',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should allow college access to college dashboard', async () => {
      const mockUser = {
        id: 'college-123',
        email: 'college@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'college-123',
        email: 'college@test.com',
        role: 'college',
        full_name: 'Test College',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(
        <TestWrapper>
          <CollegeDashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('College Dashboard')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Validation', () => {
    it('should not make redundant authentication calls', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })

      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Wait for initial auth calls
      await waitFor(() => {
        expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1)
      })

      // Re-render the same component
      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Should not make additional auth calls due to context caching
      await waitFor(() => {
        expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1)
      })
    })

    it('should share authentication state across multiple components', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'student',
        full_name: 'Test User',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(
        <TestWrapper>
          <div>
            <Dashboard />
            <Quiz />
          </div>
        </TestWrapper>
      )

      // Should only make one set of auth calls for both components
      await waitFor(() => {
        expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle rapid navigation without duplicate calls', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Simulate rapid navigation
      rerender(
        <TestWrapper>
          <Quiz />
        </TestWrapper>
      )

      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Should not make excessive auth calls
      await waitFor(() => {
        expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Authentication Error')).toBeInTheDocument()
      })
    })

    it('should handle session expiration correctly', async () => {
      // Mock expired session
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'Session expired' }
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('should handle profile creation errors', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      
      // Mock profile fetch error
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile not found' },
            }),
          }),
        }),
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/complete-profile')
      })
    })
  })
})