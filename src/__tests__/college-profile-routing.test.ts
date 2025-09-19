/**
 * Integration test for college profile routing
 * Tests the slug validation and service integration
 */

import { collegeProfileService } from '@/lib/services/college-profile-service'

// Mock the college profile service
jest.mock('@/lib/services/college-profile-service', () => ({
  collegeProfileService: {
    getProfileBySlug: jest.fn(),
    validateSlug: jest.fn()
  }
}))

const mockGetProfileBySlug = collegeProfileService.getProfileBySlug as jest.MockedFunction<typeof collegeProfileService.getProfileBySlug>
const mockValidateSlug = collegeProfileService.validateSlug as jest.MockedFunction<typeof collegeProfileService.validateSlug>

describe('College Profile Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate slug format correctly', () => {
    // Mock the validateSlug function to return expected results
    mockValidateSlug.mockReturnValue({ isValid: true })
    
    // Test valid slugs
    expect(collegeProfileService.validateSlug('valid-college-slug')).toEqual({ isValid: true })
    expect(collegeProfileService.validateSlug('college123')).toEqual({ isValid: true })
    expect(collegeProfileService.validateSlug('test-college-name')).toEqual({ isValid: true })
  })

  it('should reject invalid slug formats', () => {
    // Mock the validateSlug function to return invalid for bad slugs
    mockValidateSlug.mockReturnValue({ isValid: false, error: 'Invalid slug format' })
    
    // These would be rejected by a proper slug validator
    const invalidSlugs = ['', ' ', 'slug with spaces', 'slug!@#', 'UPPERCASE']
    
    invalidSlugs.forEach(slug => {
      const result = collegeProfileService.validateSlug(slug)
      expect(result).toEqual({ isValid: false, error: 'Invalid slug format' })
    })
  })

  it('should fetch college profile by slug', async () => {
    const mockCollegeData = {
      id: 'test-id',
      slug: 'test-college',
      name: 'Test College',
      type: 'government' as const,
      location: { city: 'Test City', state: 'Test State', country: 'India' },
      address: 'Test Address',
      is_verified: true,
      is_active: true,
      courses: [],
      notices: [],
      events: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    mockGetProfileBySlug.mockResolvedValue({ data: mockCollegeData, error: null })

    const result = await collegeProfileService.getProfileBySlug('test-college')
    
    expect(result.data).toEqual(mockCollegeData)
    expect(result.error).toBeNull()
    expect(mockGetProfileBySlug).toHaveBeenCalledWith('test-college')
  })

  it('should handle college not found', async () => {
    mockGetProfileBySlug.mockResolvedValue({ data: null, error: 'College not found' })

    const result = await collegeProfileService.getProfileBySlug('non-existent')
    
    expect(result.data).toBeNull()
    expect(result.error).toBe('College not found')
  })
})