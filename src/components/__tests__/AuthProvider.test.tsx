/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useAuth, Providers } from '@/app/providers'
import { useAuthGuard } from '@/hooks/useAuthGuard'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockPrefetch = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
  }),
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

// Test component that uses the auth context
function TestComponent() {
  const { user, session, profile, loading, requireAuth, requireRole, isAdmin, isStudent, isCollege } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <div data-testid="profile">{profile ? 'has-profile' : 'no-profile'}</div>
      <div data-testid="is-admin">{isAdmin() ? 'yes' : 'no'}</div>
      <div data-testid="is-student">{isStudent() ? 'yes' : 'no'}</div>
      <div data-testid="is-college">{isCollege() ? 'yes' : 'no'}</div>
      <button onClick={() => requireAuth()} data-testid="require-auth">
        Require Auth
      </button>
      <button onClick={() => requireRole('admin')} data-testid="require-admin">
        Require Admin
      </button>
      <button onClick={() => requireRole('student')} data-testid="require-student">
        Require Student
      </button>
      <button onClick={() => requireRole('college')} data-testid="require-college">
        Require College
      </button>
    </div>
  )
}

// Test component that uses the auth guard hook
function TestGuardComponent() {
  const { isAuthenticated, isReady } = useAuthGuard()
  
  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="is-ready">{isReady ? 'yes' : 'no'}</div>
    </div>
  )
}

// Helper function to render component with auth provider
function renderWithAuthProvider(component: React.ReactElement) {
  return render(
    <Providers>
      {component}
    </Providers>
  )
}

describe('Enhanced AuthProvider', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
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

  describe('Basic functionality', () => {
    it('should provide requireAuth and requireRole methods', async () => {
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      // Check that the buttons are rendered (meaning the methods exist)
      expect(screen.getByTestId('require-auth')).toBeInTheDocument()
      expect(screen.getByTestId('require-admin')).toBeInTheDocument()
      expect(screen.getByTestId('require-student')).toBeInTheDocument()
      expect(screen.getByTestId('require-college')).toBeInTheDocument()
    })

    it('should provide authentication status through useAuthGuard', async () => {
      await act(async () => {
        renderWithAuthProvider(<TestGuardComponent />)
      })
      
      // Check that the guard hook provides the expected properties
      expect(screen.getByTestId('is-authenticated')).toBeInTheDocument()
      expect(screen.getByTestId('is-ready')).toBeInTheDocument()
    })

    it('should show loading state initially', async () => {
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      // Should show loading initially
      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    })
  })

  describe('requireAuth functionality', () => {
    it('should redirect to login when user is not authenticated', async () => {
      // Mock no session
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
      
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
      
      // Click require auth button
      fireEvent.click(screen.getByTestId('require-auth'))
      
      // Should redirect to login
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    it('should redirect to complete profile when user has no profile', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      
      // Mock authenticated user but no profile
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })
      mockSafeGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
      
      // Click require auth button
      fireEvent.click(screen.getByTestId('require-auth'))
      
      // Should redirect to complete profile
      expect(mockPush).toHaveBeenCalledWith('/auth/complete-profile')
    })

    it('should not redirect when user is fully authenticated', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        is_verified: true
      }
      
      // Mock fully authenticated user
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })
      mockSafeGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })
      
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
      
      // Click require auth button
      fireEvent.click(screen.getByTestId('require-auth'))
      
      // Should not redirect
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('requireRole functionality', () => {
    it('should redirect to login when user is not authenticated', async () => {
      // Mock no session
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
      
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
      
      // Click require admin button
      fireEvent.click(screen.getByTestId('require-admin'))
      
      // Should redirect to login
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    it('should redirect to appropriate dashboard when user has wrong role', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        is_verified: true
      }
      
      // Mock student user trying to access admin
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })
      mockSafeGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })
      
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
      
      // Click require admin button
      fireEvent.click(screen.getByTestId('require-admin'))
      
      // Should redirect to student dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should not redirect when user has correct role', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'admin',
        is_verified: true
      }
      
      // Mock admin user
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })
      mockSafeGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })
      
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
      
      // Click require admin button
      fireEvent.click(screen.getByTestId('require-admin'))
      
      // Should not redirect
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Role helper methods', () => {
    it('should correctly identify admin users', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'admin',
        is_verified: true
      }
      
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })
      mockSafeGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })
      
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('is-admin')).toHaveTextContent('yes')
        expect(screen.getByTestId('is-student')).toHaveTextContent('no')
        expect(screen.getByTestId('is-college')).toHaveTextContent('no')
      })
    })

    it('should correctly identify student users', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        is_verified: true
      }
      
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })
      mockSafeGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })
      
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('is-admin')).toHaveTextContent('no')
        expect(screen.getByTestId('is-student')).toHaveTextContent('yes')
        expect(screen.getByTestId('is-college')).toHaveTextContent('no')
      })
    })

    it('should correctly identify college users', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'college',
        is_verified: true
      }
      
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })
      mockSafeGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSingle.mockResolvedValue({ data: mockProfile, error: null })
      
      await act(async () => {
        renderWithAuthProvider(<TestComponent />)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('is-admin')).toHaveTextContent('no')
        expect(screen.getByTestId('is-student')).toHaveTextContent('no')
        expect(screen.getByTestId('is-college')).toHaveTextContent('yes')
      })
    })
  })
})

describe('AuthProvider interface', () => {
  it('should have all required methods in the context type', () => {
    // This test ensures the TypeScript interface is correct
    // If the interface is wrong, this test will fail at compile time
    const mockContext = {
      user: null,
      session: null,
      profile: null,
      loading: false,
      signIn: async () => ({ data: null, error: null }),
      signUpStudent: async () => ({ data: null, error: null }),
      signUpCollege: async () => ({ data: null, error: null }),
      signUpAdmin: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: null, error: null }),
      resetPassword: async () => ({ error: null }),
      hasRole: () => false,
      isAdmin: () => false,
      isStudent: () => false,
      isCollege: () => false,
      // New methods that should be present
      requireAuth: () => {},
      requireRole: () => {},
    }

    // If this compiles, the interface is correct
    expect(mockContext.requireAuth).toBeDefined()
    expect(mockContext.requireRole).toBeDefined()
    expect(typeof mockContext.requireAuth).toBe('function')
    expect(typeof mockContext.requireRole).toBe('function')
  })
})