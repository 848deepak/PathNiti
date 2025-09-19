/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Providers, useAuth } from '@/app/providers'
import { supabase } from '@/lib/supabase'

// Mock Supabase
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

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/test-path',
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
  parseAuthError: jest.fn((error) => error),
  logAuthError: jest.fn(),
}))

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

describe('Profile State Deduplication', () => {
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

  it('should prevent multiple simultaneous profile fetch operations', async () => {
    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    let resolveProfileFetch: (value: any) => void
    const profileFetchPromise = new Promise((resolve) => {
      resolveProfileFetch = resolve
    })

    // Mock the profile fetch to be slow
    mockProfileQuery.single.mockImplementation(() => profileFetchPromise)

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

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test-user-id')
    })

    // Verify that profile fetch was called only once despite potential race conditions
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockProfileQuery.single).toHaveBeenCalledTimes(1)

    // Resolve the profile fetch
    act(() => {
      resolveProfileFetch({ data: mockProfile, error: null })
    })

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('test-user-id')
    })
  })

  it('should prevent multiple simultaneous profile creation operations', async () => {
    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    const mockProfileInsert = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    let resolveProfileCreation: (value: any) => void
    const profileCreationPromise = new Promise((resolve) => {
      resolveProfileCreation = resolve
    })

    // Mock profile doesn't exist initially
    mockProfileQuery.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' }, // Profile not found
    })

    // Mock profile creation to be slow
    mockProfileInsert.single.mockImplementation(() => profileCreationPromise)

    const mockSupabase = supabase as any
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        // First call is for checking existence, second is for creation
        if (mockSupabase.from.mock.calls.length <= 1) {
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

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test-user-id')
    })

    // Verify that profile creation was called only once
    expect(mockProfileInsert.single).toHaveBeenCalledTimes(1)

    // Resolve the profile creation
    act(() => {
      resolveProfileCreation({ data: mockProfile, error: null })
    })

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('test-user-id')
    })
  })

  it('should use cached profile data to avoid redundant database calls', async () => {
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

    render(
      <Providers>
        <TestComponent />
      </Providers>
    )

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('test-user-id')
    })

    // Verify that database was not called due to cache hit
    expect(mockProfileQuery.single).not.toHaveBeenCalled()
  })

  it('should debounce profile creation calls', async () => {
    jest.useFakeTimers()

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
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
    }

    const mockSupabase = supabase as any
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') {
        // Alternate between query and insert mocks
        if (mockSupabase.from.mock.calls.length % 2 === 1) {
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

    // Fast forward through debounce delay
    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('test-user-id')
    })

    // Verify that profile creation was debounced and called only once
    expect(mockProfileInsert.single).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('should clear operation state on sign out', async () => {
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
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })

    const TestComponentWithSignOut = () => {
      const { user, profile, signOut } = useAuth()
      
      return (
        <div>
          <div data-testid="user">{user?.id || 'no-user'}</div>
          <div data-testid="profile">{profile?.id || 'no-profile'}</div>
          <button onClick={() => signOut()} data-testid="sign-out">
            Sign Out
          </button>
        </div>
      )
    }

    render(
      <Providers>
        <TestComponentWithSignOut />
      </Providers>
    )

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('test-user-id')
    })

    // Sign out
    act(() => {
      screen.getByTestId('sign-out').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile')
    })

    // Verify localStorage was cleared
    expect(window.localStorage.clear).toHaveBeenCalled()
  })
})