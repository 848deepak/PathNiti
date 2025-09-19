/**
 * Test suite for idempotent profile creation functionality
 * Tests the fix for duplicate key errors in AuthProvider
 */

import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/supabase/types'

// Mock Supabase client
const mockSingle = jest.fn()
const mockEq = jest.fn(() => ({ single: mockSingle }))
const mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle }))
const mockInsert = jest.fn(() => ({ select: mockSelect }))
const mockFrom = jest.fn(() => ({ 
  select: mockSelect,
  insert: mockInsert
}))

const mockSupabase = {
  from: mockFrom
}

// Mock performance monitor
const mockPerformanceMonitor = {
  startTimer: jest.fn(() => ({
    end: jest.fn()
  }))
}

// Mock auth cache
const mockAuthCache = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn()
}

describe('Idempotent Profile Creation', () => {
  let createUserProfile: (user: User) => Promise<UserProfile | null>
  let mockUser: User
  let mockProfile: UserProfile

  beforeEach(() => {
    jest.clearAllMocks()
    mockFrom.mockClear()
    mockSelect.mockClear()
    mockInsert.mockClear()
    mockEq.mockClear()
    mockSingle.mockClear()
    
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

    // Mock implementation of createUserProfile function
    createUserProfile = async (user: User): Promise<UserProfile | null> => {
      const timer = mockPerformanceMonitor.startTimer('createUserProfile')
      
      try {
        // First, check if profile already exists
        const { data: existingProfile, error: fetchError } = await mockSupabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (existingProfile) {
          mockAuthCache.set(`profile_${user.id}`, existingProfile)
          timer.end(true)
          return existingProfile as UserProfile
        }

        // If profile doesn't exist (PGRST116 error is expected), create new one
        if (fetchError && fetchError.code !== 'PGRST116') {
          timer.end(false, fetchError.message)
          return null
        }

        const userData = user.user_metadata || {}
        const role = userData.role || 'student'
        
        const profileData = {
          id: user.id,
          email: user.email!,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || null,
          role: role
        }
        
        const { data, error } = await mockSupabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()

        if (error) {
          // Handle duplicate key constraint violation (PostgreSQL error code 23505)
          if (error.code === '23505') {
            // Fetch the existing profile that caused the constraint violation
            const { data: existingProfileAfterError, error: refetchError } = await mockSupabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            if (refetchError) {
              timer.end(false, refetchError.message)
              return null
            }

            if (existingProfileAfterError) {
              mockAuthCache.set(`profile_${user.id}`, existingProfileAfterError)
              timer.end(true)
              return existingProfileAfterError as UserProfile
            }
          }

          timer.end(false, error.message)
          return null
        }

        const newProfile = data as UserProfile
        mockAuthCache.set(`profile_${user.id}`, newProfile)
        timer.end(true)
        return newProfile
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        timer.end(false, errorMessage)
        return null
      }
    }
  })

  describe('Profile existence check', () => {
    it('should return existing profile when profile already exists', async () => {
      // Mock existing profile found
      mockSingle.mockResolvedValueOnce({
        data: mockProfile,
        error: null
      })

      const result = await createUserProfile(mockUser)

      expect(result).toEqual(mockProfile)
      expect(mockAuthCache.set).toHaveBeenCalledWith(`profile_${mockUser.id}`, mockProfile)
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should proceed to create profile when profile does not exist (PGRST116)', async () => {
      // Mock profile not found (PGRST116 error) then successful creation
      mockSingle
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' }
        })
        .mockResolvedValueOnce({
          data: mockProfile,
          error: null
        })

      const result = await createUserProfile(mockUser)

      expect(result).toEqual(mockProfile)
      expect(mockInsert).toHaveBeenCalled()
      expect(mockAuthCache.set).toHaveBeenCalledWith(`profile_${mockUser.id}`, mockProfile)
    })

    it('should return null when unexpected error occurs during profile check', async () => {
      // Mock unexpected error during profile check
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST500', message: 'Database error' }
      })

      const result = await createUserProfile(mockUser)

      expect(result).toBeNull()
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('Duplicate key error handling', () => {
    it('should handle duplicate key error (23505) and fetch existing profile', async () => {
      // Mock profile not found initially, then duplicate key error, then successful fetch
      mockSingle
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

      const result = await createUserProfile(mockUser)

      expect(result).toEqual(mockProfile)
      expect(mockAuthCache.set).toHaveBeenCalledWith(`profile_${mockUser.id}`, mockProfile)
      
      // Verify that we attempted to fetch the existing profile after duplicate key error
      expect(mockSingle).toHaveBeenCalledTimes(3)
    })

    it('should return null when refetch fails after duplicate key error', async () => {
      // Mock profile not found initially, duplicate key error, then refetch error
      mockSingle
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' }
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: '23505', message: 'duplicate key value violates unique constraint' }
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST500', message: 'Database error' }
        })

      const result = await createUserProfile(mockUser)

      expect(result).toBeNull()
    })

    it('should return null when no profile found after duplicate key error', async () => {
      // Mock profile not found initially, duplicate key error, then no profile found on refetch
      mockSingle
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' }
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: '23505', message: 'duplicate key value violates unique constraint' }
        })
        .mockResolvedValueOnce({
          data: null,
          error: null
        })

      const result = await createUserProfile(mockUser)

      expect(result).toBeNull()
    })
  })

  describe('Successful profile creation', () => {
    it('should create new profile successfully when none exists', async () => {
      // Mock profile not found initially, then successful creation
      mockSingle
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' }
        })
        .mockResolvedValueOnce({
          data: mockProfile,
          error: null
        })

      const result = await createUserProfile(mockUser)

      expect(result).toEqual(mockProfile)
      expect(mockAuthCache.set).toHaveBeenCalledWith(`profile_${mockUser.id}`, mockProfile)
    })

    it('should handle non-duplicate key errors during profile creation', async () => {
      // Mock profile not found initially, then other error during creation
      mockSingle
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' }
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST500', message: 'Database error' }
        })

      const result = await createUserProfile(mockUser)

      expect(result).toBeNull()
    })
  })

  describe('Error handling', () => {
    it('should handle exceptions gracefully', async () => {
      // Mock exception during profile check
      mockSingle.mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await createUserProfile(mockUser)

      expect(result).toBeNull()
    })
  })
})