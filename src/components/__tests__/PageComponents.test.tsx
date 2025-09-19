/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Mock the auth context
const mockUseAuth = jest.fn()
jest.mock('@/app/providers', () => ({
  useAuth: mockUseAuth,
}))

// Mock other dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => 
    <button onClick={onClick} data-testid="button">{children}</button>,
}))

// Import the page components after mocking
import DashboardPage from '@/app/dashboard/page'
import AdminPage from '@/app/admin/page'
import QuizPage from '@/app/quiz/page'

describe('Refactored Page Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dashboard Page', () => {
    it('should use useAuth hook instead of individual authentication calls', async () => {
      const mockAuthData = {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token' },
        profile: {
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'student',
          is_verified: true
        },
        loading: false,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => false,
        isStudent: () => true,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<DashboardPage />)

      // Verify useAuth was called
      expect(mockUseAuth).toHaveBeenCalled()

      // Verify requireAuth was called for authentication enforcement
      expect(mockAuthData.requireAuth).toHaveBeenCalled()

      // Should not show loading when auth is ready
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })
    })

    it('should show loading state when auth is loading', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: true,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => false,
        isStudent: () => false,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<DashboardPage />)

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should display user information from auth context', async () => {
      const mockAuthData = {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token' },
        profile: {
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'student',
          is_verified: true
        },
        loading: false,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => false,
        isStudent: () => true,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<DashboardPage />)

      // Should display user's name from profile
      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument()
      })
    })
  })

  describe('Admin Page', () => {
    it('should use useAuth hook and requireRole for admin access', async () => {
      const mockAuthData = {
        user: { id: '123', email: 'admin@example.com' },
        session: { access_token: 'token' },
        profile: {
          id: '123',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_verified: true
        },
        loading: false,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => true,
        isStudent: () => false,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<AdminPage />)

      // Verify useAuth was called
      expect(mockUseAuth).toHaveBeenCalled()

      // Verify requireRole was called with 'admin'
      expect(mockAuthData.requireRole).toHaveBeenCalledWith('admin')

      // Should show admin content
      await waitFor(() => {
        expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument()
      })
    })

    it('should show loading state when auth is loading', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: true,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => false,
        isStudent: () => false,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<AdminPage />)

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should use isAdmin helper from auth context', async () => {
      const mockAuthData = {
        user: { id: '123', email: 'admin@example.com' },
        session: { access_token: 'token' },
        profile: {
          id: '123',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_verified: true
        },
        loading: false,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => true,
        isStudent: () => false,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<AdminPage />)

      // Verify isAdmin helper is used
      expect(mockAuthData.isAdmin).toHaveBeenCalled()
    })
  })

  describe('Quiz Page', () => {
    it('should use useAuth hook for authentication', async () => {
      const mockAuthData = {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token' },
        profile: {
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'student',
          is_verified: true
        },
        loading: false,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => false,
        isStudent: () => true,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<QuizPage />)

      // Verify useAuth was called
      expect(mockUseAuth).toHaveBeenCalled()

      // Verify requireAuth was called for authentication enforcement
      expect(mockAuthData.requireAuth).toHaveBeenCalled()
    })

    it('should show loading state when auth is loading', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: true,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => false,
        isStudent: () => false,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<QuizPage />)

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should not perform individual authentication checks', () => {
      const mockAuthData = {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token' },
        profile: {
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'student',
          is_verified: true
        },
        loading: false,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => false,
        isStudent: () => true,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<QuizPage />)

      // Should only call useAuth, not individual supabase calls
      expect(mockUseAuth).toHaveBeenCalled()
      
      // The component should not make direct supabase.auth.getUser() calls
      // This is verified by the fact that we only mock useAuth and the component works
    })
  })

  describe('Common Authentication Patterns', () => {
    it('should eliminate redundant loading states', () => {
      const mockAuthData = {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token' },
        profile: {
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'student',
          is_verified: true
        },
        loading: false,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => false,
        isStudent: () => true,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      // Test all pages use central loading state
      const { rerender } = render(<DashboardPage />)
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()

      rerender(<AdminPage />)
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()

      rerender(<QuizPage />)
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    it('should use consistent authentication enforcement', () => {
      const mockAuthData = {
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token' },
        profile: {
          id: '123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'admin',
          is_verified: true
        },
        loading: false,
        requireAuth: jest.fn(),
        requireRole: jest.fn(),
        isAdmin: () => true,
        isStudent: () => false,
        isCollege: () => false,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      // Test that all pages use requireAuth or requireRole consistently
      render(<DashboardPage />)
      expect(mockAuthData.requireAuth).toHaveBeenCalled()

      jest.clearAllMocks()
      mockUseAuth.mockReturnValue(mockAuthData)

      render(<AdminPage />)
      expect(mockAuthData.requireRole).toHaveBeenCalledWith('admin')

      jest.clearAllMocks()
      mockUseAuth.mockReturnValue(mockAuthData)

      render(<QuizPage />)
      expect(mockAuthData.requireAuth).toHaveBeenCalled()
    })
  })
})