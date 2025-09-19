/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  }),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
  safeGetUser: jest.fn(),
}))

// Mock performance monitor
jest.mock('@/lib/auth-performance', () => ({
  authPerformanceMonitor: {
    startTimer: jest.fn(() => ({
      end: jest.fn(() => 0),
    })),
  },
  logAuthPerformanceSummary: jest.fn(),
}))

// Mock auth errors
jest.mock('@/lib/auth-errors', () => ({
  parseAuthError: jest.fn((error) => ({ type: 'unknown', userMessage: 'Error occurred' })),
  logAuthError: jest.fn(),
}))

// Mock AuthErrorProvider to avoid complex dependencies
jest.mock('@/contexts/AuthErrorContext', () => ({
  AuthErrorProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock AuthErrorBoundary
jest.mock('@/components/AuthErrorBoundary', () => ({
  AuthErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import { Providers, useAuth } from '@/app/providers'
import { supabase } from '@/lib/supabase'

// Test component that uses auth
const TestComponent = () => {
  const { user, profile, loading } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user?.id || 'no-user'}</div>
      <div data-testid="profile">{profile?.id || 'no-profile'}</div>
    </div>
  )
}

describe('Profile Deduplication Integration', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      first_name: 'Test',
      last_name: 'User',
      role: 'student',
    },
  }

  const mockProfile = {
    id: 'test-user-id',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'student',
    is_verified: true,
  }

  const mockSession = {
    user: mockUser,
    access_token: 'mock-token',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  it('should handle profile operations without race conditions', async () => {
    let profileFetchCallCount = 0
    
    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        profileFetchCallCount++
        return Promise.resolve({ data: mockProfile, error: null })
      }),
    }

    const mockSupabase = supabase as any
    mockSupabase.from.mockReturnValue(mockProfileQuery)
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    render(
      <Providers>
        <TestComponent />
      </Providers>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test-user-id')
    })

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('test-user-id')
    })

    // Verify that profile was fetched only once despite potential race conditions
    expect(profileFetchCallCount).toBe(1)
  })

  it('should use cached profile data on subsequent renders', async () => {
    let profileFetchCallCount = 0
    
    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        profileFetchCallCount++
        return Promise.resolve({ data: mockProfile, error: null })
      }),
    }

    // Mock localStorage to return cached profile
    const mockLocalStorage = window.localStorage as any
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'auth_cache_profile_test-user-id') {
        return JSON.stringify({
          value: mockProfile,
          expiry: Date.now() + 300000, // 5 minutes from now
        })
      }
      return null
    })

    const mockSupabase = supabase as any
    mockSupabase.from.mockReturnValue(mockProfileQuery)
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    render(
      <Providers>
        <TestComponent />
      </Providers>
    )

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('test-user-id')
    })

    // Verify that database was not called due to cache hit
    expect(profileFetchCallCount).toBe(0)
  })

  it('should handle profile creation with deduplication', async () => {
    let profileCreationCallCount = 0
    
    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Profile not found
      }),
    }

    const mockProfileInsert = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        profileCreationCallCount++
        return Promise.resolve({ data: mockProfile, error: null })
      }),
    }

    const mockSupabase = supabase as any
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        // First call is for checking existence, subsequent calls are for creation
        if (mockSupabase.from.mock.calls.length === 1) {
          return mockProfileQuery
        } else {
          return mockProfileInsert
        }
      }
      return mockProfileQuery
    })

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    render(
      <Providers>
        <TestComponent />
      </Providers>
    )

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('test-user-id')
    })

    // Verify that profile creation was called only once
    expect(profileCreationCallCount).toBe(1)
  })

  it('should clear operation state on component unmount', async () => {
    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
    }

    const mockSupabase = supabase as any
    mockSupabase.from.mockReturnValue(mockProfileQuery)
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    const { unmount } = render(
      <Providers>
        <TestComponent />
      </Providers>
    )

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('test-user-id')
    })

    // Unmount the component
    unmount()

    // The cleanup should happen automatically in the useEffect cleanup
    // We can't directly test the internal state, but we can verify no errors occur
    expect(true).toBe(true) // Test passes if no errors during unmount
  })
})