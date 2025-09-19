/**
 * End-to-End Authentication Validation Tests
 * 
 * This test suite validates the complete user journey and authentication flow
 * from login through various protected pages to ensure consistent behavior.
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthProvider } from '@/app/providers'
import Dashboard from '@/app/dashboard/page'
import Admin from '@/app/admin/page'
import Quiz from '@/app/quiz/page'
import CollegeDashboard from '@/app/colleges/dashboard/page'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}))

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signOut: jest.fn(),
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
}

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ 
      data: { subscription: { unsubscribe: jest.fn() } } 
    })),
    signOut: jest.fn(),
    signInWithPassword: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
}

// Test users for different scenarios
const testUsers = {
  student: {
    user: {
      id: 'student-123',
      email: 'student@test.com',
      user_metadata: {},
    },
    profile: {
      id: 'student-123',
      email: 'student@test.com',
      role: 'student',
      full_name: 'Test Student',
    },
  },
  admin: {
    user: {
      id: 'admin-123',
      email: 'admin@test.com',
      user_metadata: {},
    },
    profile: {
      id: 'admin-123',
      email: 'admin@test.com',
      role: 'admin',
      full_name: 'Test Admin',
    },
  },
  college: {
    user: {
      id: 'college-123',
      email: 'college@test.com',
      user_metadata: {},
    },
    profile: {
      id: 'college-123',
      email: 'college@test.com',
      role: 'college',
      full_name: 'Test College',
    },
  },
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

// Helper function to setup authenticated user
const setupAuthenticatedUser = (userType: keyof typeof testUsers) => {
  const { user, profile } = testUsers[userType]
  
  mockSupabase.auth.getUser.mockResolvedValue({ 
    data: { user }, 
    error: null 
  })
  mockSupabase.auth.getSession.mockResolvedValue({ 
    data: { session: { user } }, 
    error: null 
  })
  mockSupabase.from.mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: profile,
          error: null,
        }),
      }),
    }),
  })
}

// Helper function to setup unauthenticated user
const setupUnauthenticatedUser = () => {
  mockSupabase.auth.getUser.mockResolvedValue({ 
    data: { user: null }, 
    error: null 
  })
  mockSupabase.auth.getSession.mockResolvedValue({ 
    data: { session: null }, 
    error: null 
  })
}

describe('End-to-End Authentication Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('Complete User Journey - Student', () => {
    it('should handle complete student authentication flow', async () => {
      // Start with unauthenticated user
      setupUnauthenticatedUser()

      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Should redirect to login
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      })

      // Simulate successful login
      setupAuthenticatedUser('student')
      
      // Simulate auth state change
      let authStateCallback: ((event: string, session: any) => void) | null = null
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_IN', { user: testUsers.student.user })
        })
      }

      // Should show dashboard content
      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      // Navigate to quiz
      rerender(
        <TestWrapper>
          <Quiz />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Career Assessment Quiz')).toBeInTheDocument()
      })

      // Try to access admin page (should be denied)
      rerender(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should handle student logout flow', async () => {
      setupAuthenticatedUser('student')

      let authStateCallback: ((event: string, session: any) => void) | null = null
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      // Simulate logout
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })
      setupUnauthenticatedUser()

      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_OUT', null)
        })
      }

      // Should redirect to login
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      })
    })
  })

  describe('Complete User Journey - Admin', () => {
    it('should handle complete admin authentication flow', async () => {
      setupAuthenticatedUser('admin')

      let authStateCallback: ((event: string, session: any) => void) | null = null
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { rerender } = render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_IN', { user: testUsers.admin.user })
        })
      }

      // Should show admin dashboard
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })

      // Navigate to regular dashboard
      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })

      // Navigate to quiz
      rerender(
        <TestWrapper>
          <Quiz />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Career Assessment Quiz')).toBeInTheDocument()
      })
    })
  })

  describe('Complete User Journey - College', () => {
    it('should handle complete college authentication flow', async () => {
      setupAuthenticatedUser('college')

      let authStateCallback: ((event: string, session: any) => void) | null = null
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const { rerender } = render(
        <TestWrapper>
          <CollegeDashboard />
        </TestWrapper>
      )

      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_IN', { user: testUsers.college.user })
        })
      }

      // Should show college dashboard
      await waitFor(() => {
        expect(screen.getByText('College Dashboard')).toBeInTheDocument()
      })

      // Try to access admin page (should be denied)
      rerender(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })

      // Navigate to regular dashboard
      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('College Dashboard')).toBeInTheDocument()
      })
    })
  })

  describe('Session Management and Persistence', () => {
    it('should maintain session across page reloads', async () => {
      setupAuthenticatedUser('student')

      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      // Simulate page reload by re-rendering with fresh component
      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Should still show authenticated content without redirect
      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      expect(mockRouter.push).not.toHaveBeenCalledWith('/auth/login')
    })

    it('should handle session expiration gracefully', async () => {
      setupAuthenticatedUser('student')

      let authStateCallback: ((event: string, session: any) => void) | null = null
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      // Simulate session expiration
      setupUnauthenticatedUser()
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'Session expired' }
      })

      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_OUT', null)
        })
      }

      // Should redirect to login
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('should handle token refresh correctly', async () => {
      setupAuthenticatedUser('student')

      let authStateCallback: ((event: string, session: any) => void) | null = null
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      // Simulate token refresh
      if (authStateCallback) {
        act(() => {
          authStateCallback('TOKEN_REFRESHED', { user: testUsers.student.user })
        })
      }

      // Should maintain authenticated state
      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      expect(mockRouter.push).not.toHaveBeenCalledWith('/auth/login')
    })
  })

  describe('Error Scenarios and Recovery', () => {
    it('should handle network errors during authentication', async () => {
      // Mock network error
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'))
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Authentication Error')).toBeInTheDocument()
      })
    })

    it('should handle profile creation flow for new users', async () => {
      const mockUser = {
        id: 'new-user-123',
        email: 'newuser@test.com',
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
      
      // Mock missing profile
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

      // Should redirect to profile completion
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/complete-profile')
      })
    })

    it('should handle rapid authentication state changes', async () => {
      let authStateCallback: ((event: string, session: any) => void) | null = null
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      setupUnauthenticatedUser()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Simulate rapid state changes
      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_IN', { user: testUsers.student.user })
          authStateCallback('TOKEN_REFRESHED', { user: testUsers.student.user })
          authStateCallback('SIGNED_OUT', null)
          authStateCallback('SIGNED_IN', { user: testUsers.admin.user })
        })
      }

      // Should handle the final state correctly
      setupAuthenticatedUser('admin')
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })
    })
  })

  describe('Cross-Page Consistency', () => {
    it('should maintain consistent authentication state across all pages', async () => {
      setupAuthenticatedUser('student')

      const pages = [
        { component: Dashboard, expectedText: 'Student Dashboard' },
        { component: Quiz, expectedText: 'Career Assessment Quiz' },
      ]

      for (const { component: PageComponent, expectedText } of pages) {
        const { unmount } = render(
          <TestWrapper>
            <PageComponent />
          </TestWrapper>
        )

        await waitFor(() => {
          expect(screen.getByText(expectedText)).toBeInTheDocument()
        })

        // Should not redirect to login
        expect(mockRouter.push).not.toHaveBeenCalledWith('/auth/login')

        unmount()
        jest.clearAllMocks()
      }
    })

    it('should show consistent loading states across pages', async () => {
      // Mock slow authentication
      mockSupabase.auth.getUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ 
          data: { user: testUsers.student.user }, 
          error: null 
        }), 100))
      )

      const pages = [Dashboard, Quiz]

      for (const PageComponent of pages) {
        const { unmount } = render(
          <TestWrapper>
            <PageComponent />
          </TestWrapper>
        )

        // Should show consistent loading component
        expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
        expect(screen.getByText('Loading...')).toBeInTheDocument()

        unmount()
      }
    })
  })
})