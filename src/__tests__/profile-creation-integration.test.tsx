/**
 * Integration test for profile creation in AuthProvider
 * Tests the actual implementation with mocked Supabase calls
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/supabase/types'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
    signOut: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
}

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

// Mock performance monitor
jest.mock('@/lib/auth-performance', () => ({
  AuthPerformanceMonitor: jest.fn().mockImplementation(() => ({
    startTimer: jest.fn(() => ({
      end: jest.fn()
    })),
    recordMetric: jest.fn(),
    getMetrics: jest.fn(() => ({}))
  }))
}))

// Mock auth cache
jest.mock('@/lib/auth-utils', () => ({
  AuthCache: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn()
  }))
}))

// Import AuthProvider after mocks are set up
import { AuthProvider } from '@/app/providers'

describe('Profile Creation Integration', () => {
  let mockUser: User
  let mockProfile: UserProfile

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        role: 'student'
      }
    } as User

    mockProfile = {
      id: 'test-user-123',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      phone: null,
      role: 'student',
      date_of_birth: null,
      gender: null,
      class_level: null,
      stream: null,
      location: null,
      interests: null,
      avatar_url: null,
      is_verified: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  })

  it('should handle profile creation with existing profile gracefully', async () => {
    // Mock session with user
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null
    })

    // Mock existing profile found
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockProfile,
      error: null
    })
    
    const mockEq = jest.fn(() => ({ single: mockSingle }))
    const mockSelect = jest.fn(() => ({ eq: mockEq }))
    mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

    // Mock auth state change callback
    let authStateCallback: (event: string, session: any) => void
    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    const TestComponent = () => <div>Test</div>

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate auth state change
    if (authStateCallback) {
      authStateCallback('SIGNED_IN', { user: mockUser })
    }

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', mockUser.id)
      expect(mockSingle).toHaveBeenCalled()
    })
  })

  it('should handle duplicate key error during profile creation', async () => {
    // Mock session with user
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null
    })

    // Mock profile not found initially, then duplicate key error, then successful fetch
    const mockSingle = jest.fn()
      .mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      })
      .mockResolvedValueOnce({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' }
      })
      .mockResolvedValueOnce({
        data: mockProfile,
        error: null
      })
    
    const mockEq = jest.fn(() => ({ single: mockSingle }))
    const mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle }))
    const mockInsert = jest.fn(() => ({ select: mockSelect }))
    
    mockSupabaseClient.from.mockReturnValue({ 
      select: mockSelect,
      insert: mockInsert
    })

    // Mock auth state change callback
    let authStateCallback: (event: string, session: any) => void
    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    const TestComponent = () => <div>Test</div>

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate auth state change
    if (authStateCallback) {
      authStateCallback('SIGNED_IN', { user: mockUser })
    }

    await waitFor(() => {
      expect(mockSingle).toHaveBeenCalledTimes(3)
      expect(mockInsert).toHaveBeenCalled()
    }, { timeout: 3000 })
  })
})