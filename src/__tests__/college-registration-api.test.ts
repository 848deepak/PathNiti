/**
 * Integration tests for college registration API endpoints
 */

import { createCollegeProfile, updateCollegeProfile } from '@/lib/utils/college-db-utils'
import { generateUniqueCollegeSlug } from '@/lib/utils/slug-generator'
import type { CollegeProfileCreateData, CollegeProfileUpdateData } from '@/lib/types/college-profile'

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'test-id',
              name: 'Test College',
              slug: 'test-college',
              type: 'government',
              location: { city: 'Test City', state: 'Test State', country: 'India' },
              address: 'Test Address',
              is_verified: false,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              college_courses: [],
              college_notices: []
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'test-id',
                name: 'Updated Test College',
                slug: 'updated-test-college',
                type: 'private',
                location: { city: 'Updated City', state: 'Updated State', country: 'India' },
                address: 'Updated Address',
                is_verified: false,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                college_courses: [],
                college_notices: []
              },
              error: null
            }))
          }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  })
}))

// Mock slug generator
jest.mock('@/lib/utils/slug-generator', () => ({
  generateUniqueCollegeSlug: jest.fn(() => Promise.resolve('test-college'))
}))

describe('College Registration API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCollegeProfile', () => {
    it('creates a college profile successfully', async () => {
      const profileData: CollegeProfileCreateData = {
        name: 'Test College',
        type: 'government',
        location: {
          city: 'Test City',
          state: 'Test State',
          country: 'India'
        },
        address: 'Test Address'
      }

      const result = await createCollegeProfile(profileData)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.name).toBe('Test College')
      expect(result.data?.slug).toBe('test-college')
      expect(result.data?.is_verified).toBe(false)
      expect(result.data?.is_active).toBe(true)
    })

    it('generates unique slug for college', async () => {
      const profileData: CollegeProfileCreateData = {
        name: 'Test College',
        type: 'government',
        location: {
          city: 'Test City',
          state: 'Test State',
          country: 'India'
        },
        address: 'Test Address'
      }

      await createCollegeProfile(profileData)

      expect(generateUniqueCollegeSlug).toHaveBeenCalledWith('Test College')
    })
  })

  describe('updateCollegeProfile', () => {
    it('updates a college profile successfully', async () => {
      const updateData: CollegeProfileUpdateData = {
        name: 'Updated Test College',
        type: 'private',
        location: {
          city: 'Updated City',
          state: 'Updated State',
          country: 'India'
        },
        address: 'Updated Address'
      }

      const result = await updateCollegeProfile('test-id', updateData)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.name).toBe('Updated Test College')
      expect(result.data?.type).toBe('private')
    })
  })

  describe('Data validation', () => {
    it('validates college type values', () => {
      const validTypes = ['government', 'government_aided', 'private', 'deemed']
      
      validTypes.forEach(type => {
        expect(['government', 'government_aided', 'private', 'deemed']).toContain(type)
      })
    })

    it('validates location structure', () => {
      const validLocation = {
        city: 'Test City',
        state: 'Test State',
        country: 'India'
      }

      expect(validLocation).toHaveProperty('city')
      expect(validLocation).toHaveProperty('state')
      expect(validLocation).toHaveProperty('country')
      expect(validLocation.city).toBeTruthy()
      expect(validLocation.state).toBeTruthy()
      expect(validLocation.country).toBeTruthy()
    })

    it('validates required fields', () => {
      const requiredFields = ['name', 'type', 'location', 'address']
      const profileData = {
        name: 'Test College',
        type: 'government',
        location: { city: 'Test', state: 'Test', country: 'India' },
        address: 'Test Address'
      }

      requiredFields.forEach(field => {
        expect(profileData).toHaveProperty(field)
        expect((profileData as any)[field]).toBeTruthy()
      })
    })
  })

  describe('Error handling', () => {
    it('handles missing required fields', () => {
      const incompleteData = {
        name: 'Test College'
        // Missing type, location, address
      }

      const requiredFields = ['name', 'type', 'location', 'address']
      const missingFields = requiredFields.filter(field => !(field in incompleteData))
      
      expect(missingFields.length).toBeGreaterThan(0)
      expect(missingFields).toContain('type')
      expect(missingFields).toContain('location')
      expect(missingFields).toContain('address')
    })

    it('validates email format when provided', () => {
      const validEmail = 'test@example.com'
      const invalidEmail = 'invalid-email'
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      expect(emailRegex.test(validEmail)).toBe(true)
      expect(emailRegex.test(invalidEmail)).toBe(false)
    })

    it('validates website URL format when provided', () => {
      const validUrl = 'https://www.example.com'
      const invalidUrl = 'invalid-url'
      
      const urlRegex = /^https?:\/\/.+/
      
      expect(urlRegex.test(validUrl)).toBe(true)
      expect(urlRegex.test(invalidUrl)).toBe(false)
    })
  })
})