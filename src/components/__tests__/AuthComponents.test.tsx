/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthGuard } from '@/components/AuthGuard'
import { AuthLoading } from '@/components/AuthLoading'
import { AuthStatus } from '@/components/AuthStatus'
import { withAuth } from '@/components/withAuth'

// Mock the auth context
const mockUseAuth = jest.fn()
jest.mock('@/app/providers', () => ({
  useAuth: mockUseAuth,
}))

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: { children: React.ReactNode, onClick?: () => void, variant?: string }) => 
    <button onClick={onClick} data-testid="button" data-variant={variant}>{children}</button>,
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => 
    <div data-testid="skeleton" className={className}>Loading...</div>,
}))

// Test component for withAuth HOC
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>

describe('Authentication Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AuthGuard Component', () => {
    it('should render children when user is authenticated', () => {
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
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(mockAuthData.requireAuth).toHaveBeenCalled()
    })

    it('should show loading when auth is loading', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: true,
        requireAuth: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should not render children when user is not authenticated', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: false,
        requireAuth: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(mockAuthData.requireAuth).toHaveBeenCalled()
    })

    it('should support role-based access control', () => {
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
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(
        <AuthGuard requiredRole="admin">
          <div data-testid="admin-content">Admin Content</div>
        </AuthGuard>
      )

      expect(screen.getByTestId('admin-content')).toBeInTheDocument()
      expect(mockAuthData.requireRole).toHaveBeenCalledWith('admin')
    })

    it('should show fallback component when provided', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: false,
        requireAuth: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      const fallback = <div data-testid="fallback">Please log in</div>

      render(
        <AuthGuard fallback={fallback}>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByTestId('fallback')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })

  describe('AuthLoading Component', () => {
    it('should render loading skeleton by default', () => {
      render(<AuthLoading />)
      
      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('should render custom loading message when provided', () => {
      render(<AuthLoading message="Authenticating..." />)
      
      expect(screen.getByText('Authenticating...')).toBeInTheDocument()
    })

    it('should render custom loading component when provided', () => {
      const customLoader = <div data-testid="custom-loader">Custom Loading</div>
      
      render(<AuthLoading>{customLoader}</AuthLoading>)
      
      expect(screen.getByTestId('custom-loader')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<AuthLoading className="custom-loading" />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('custom-loading')
    })
  })

  describe('AuthStatus Component', () => {
    it('should show authenticated status for logged in user', () => {
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
        signOut: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<AuthStatus />)

      expect(screen.getByText(/john doe/i)).toBeInTheDocument()
      expect(screen.getByText(/student/i)).toBeInTheDocument()
      expect(screen.getByTestId('button')).toBeInTheDocument()
    })

    it('should show login prompt for unauthenticated user', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: false,
        signOut: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<AuthStatus />)

      expect(screen.getByText(/not authenticated/i)).toBeInTheDocument()
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })

    it('should show loading state', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: true,
        signOut: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<AuthStatus />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('should handle sign out', async () => {
      const mockSignOut = jest.fn().mockResolvedValue({ error: null })
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
        signOut: mockSignOut,
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<AuthStatus />)

      const signOutButton = screen.getByTestId('button')
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
      })
    })

    it('should show compact view when specified', () => {
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
        signOut: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(<AuthStatus compact />)

      // In compact mode, should show initials instead of full name
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  describe('withAuth HOC', () => {
    it('should render wrapped component when user is authenticated', () => {
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
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      const WrappedComponent = withAuth(TestComponent)
      render(<WrappedComponent />)

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(mockAuthData.requireAuth).toHaveBeenCalled()
    })

    it('should show loading when auth is loading', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: true,
        requireAuth: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      const WrappedComponent = withAuth(TestComponent)
      render(<WrappedComponent />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should not render component when user is not authenticated', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: false,
        requireAuth: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      const WrappedComponent = withAuth(TestComponent)
      render(<WrappedComponent />)

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(mockAuthData.requireAuth).toHaveBeenCalled()
    })

    it('should support role-based access control', () => {
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
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      const WrappedComponent = withAuth(TestComponent, { requiredRole: 'admin' })
      render(<WrappedComponent />)

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(mockAuthData.requireRole).toHaveBeenCalledWith('admin')
    })

    it('should pass through props to wrapped component', () => {
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
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      const ComponentWithProps = ({ testProp }: { testProp: string }) => (
        <div data-testid="component-with-props">{testProp}</div>
      )

      const WrappedComponent = withAuth(ComponentWithProps)
      render(<WrappedComponent testProp="test value" />)

      expect(screen.getByTestId('component-with-props')).toBeInTheDocument()
      expect(screen.getByText('test value')).toBeInTheDocument()
    })

    it('should preserve component display name', () => {
      const NamedComponent = () => <div>Named Component</div>
      NamedComponent.displayName = 'NamedComponent'

      const WrappedComponent = withAuth(NamedComponent)
      
      expect(WrappedComponent.displayName).toBe('withAuth(NamedComponent)')
    })
  })

  describe('Component Integration', () => {
    it('should work together in a complex authentication flow', () => {
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
        signOut: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(
        <div>
          <AuthStatus />
          <AuthGuard requiredRole="admin">
            <div data-testid="admin-panel">Admin Panel</div>
          </AuthGuard>
        </div>
      )

      // Should show user status
      expect(screen.getByText(/john doe/i)).toBeInTheDocument()
      expect(screen.getByText(/admin/i)).toBeInTheDocument()

      // Should show admin content
      expect(screen.getByTestId('admin-panel')).toBeInTheDocument()

      // Should have called role check
      expect(mockAuthData.requireRole).toHaveBeenCalledWith('admin')
    })

    it('should handle loading states consistently', () => {
      const mockAuthData = {
        user: null,
        session: null,
        profile: null,
        loading: true,
        requireAuth: jest.fn(),
        signOut: jest.fn(),
      }

      mockUseAuth.mockReturnValue(mockAuthData)

      render(
        <div>
          <AuthStatus />
          <AuthGuard>
            <div data-testid="protected-content">Protected Content</div>
          </AuthGuard>
          <AuthLoading />
        </div>
      )

      // All components should show loading state
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons).toHaveLength(2) // AuthStatus and AuthLoading

      // Protected content should not be visible
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })
})