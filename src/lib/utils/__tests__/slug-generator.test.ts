/**
 * Unit tests for slug generation utilities
 */

import { 
  generateSlug, 
  validateSlug, 
  sanitizeSlugInput,
  getSlugSuggestions
} from '../slug-generator'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        })
      })
    })
  })
}))

describe('generateSlug', () => {
  it('should generate basic slug from college name', () => {
    expect(generateSlug('Delhi University')).toBe('delhi-university')
    expect(generateSlug('Indian Institute of Technology')).toBe('indian-institute-of-technology')
  })

  it('should handle special characters', () => {
    expect(generateSlug('St. Xavier\'s College')).toBe('st-xaviers-college')
    expect(generateSlug('College of Engineering & Technology')).toBe('college-of-engineering-technology')
  })

  it('should handle multiple spaces', () => {
    expect(generateSlug('Delhi    University   College')).toBe('delhi-university-college')
  })

  it('should handle empty or invalid input', () => {
    expect(generateSlug('')).toBe('college')
    expect(generateSlug('   ')).toBe('college')
    expect(generateSlug('!!!')).toBe('college')
  })

  it('should respect maxLength option', () => {
    const longName = 'Very Long College Name That Should Be Truncated'
    expect(generateSlug(longName, { maxLength: 20 })).toBe('very-long-college')
  })

  it('should handle numbers when allowed', () => {
    expect(generateSlug('IIT Delhi 2023', { allowNumbers: true })).toBe('iit-delhi-2023')
    expect(generateSlug('IIT Delhi 2023', { allowNumbers: false })).toBe('iit-delhi')
  })

  it('should use custom separator', () => {
    expect(generateSlug('Delhi University', { separator: '_' })).toBe('delhi_university')
  })
})

describe('validateSlug', () => {
  it('should validate correct slugs', () => {
    expect(validateSlug('delhi-university')).toEqual({ isValid: true, sanitized: 'delhi-university' })
    expect(validateSlug('iit-delhi')).toEqual({ isValid: true, sanitized: 'iit-delhi' })
    expect(validateSlug('college123')).toEqual({ isValid: true, sanitized: 'college123' })
  })

  it('should reject short slugs', () => {
    expect(validateSlug('a')).toEqual({ isValid: false, error: 'Slug must be at least 3 characters long' })
    expect(validateSlug('ab')).toEqual({ isValid: false, error: 'Slug must be at least 3 characters long' })
  })

  it('should reject invalid slugs', () => {
    expect(validateSlug('')).toEqual({ isValid: false, error: 'Slug cannot be empty' })
    expect(validateSlug('Delhi University')).toEqual({ isValid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' })
    expect(validateSlug('delhi_university')).toEqual({ isValid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' })
    expect(validateSlug('-delhi-university')).toEqual({ isValid: false, error: 'Slug cannot start or end with a hyphen' })
    expect(validateSlug('delhi-university-')).toEqual({ isValid: false, error: 'Slug cannot start or end with a hyphen' })
    expect(validateSlug('delhi--university')).toEqual({ isValid: false, error: 'Slug cannot contain consecutive hyphens' })
  })

  it('should reject reserved words', () => {
    expect(validateSlug('admin')).toEqual({ isValid: false, error: 'Slug cannot use reserved words' })
    expect(validateSlug('api')).toEqual({ isValid: false, error: 'Slug cannot use reserved words' })
    expect(validateSlug('dashboard')).toEqual({ isValid: false, error: 'Slug cannot use reserved words' })
    expect(validateSlug('login')).toEqual({ isValid: false, error: 'Slug cannot use reserved words' })
  })

  it('should reject slugs that are too long', () => {
    const longSlug = 'a'.repeat(101)
    expect(validateSlug(longSlug)).toEqual({ isValid: false, error: 'Slug cannot exceed 100 characters' })
  })
})

describe('sanitizeSlugInput', () => {
  it('should sanitize user input', () => {
    expect(sanitizeSlugInput('Delhi University')).toBe('delhi-university')
    expect(sanitizeSlugInput('St. Xavier\'s College!')).toBe('st-xaviers-college')
    expect(sanitizeSlugInput('College___Name')).toBe('college-name')
  })

  it('should handle empty input', () => {
    expect(sanitizeSlugInput('')).toBe('college')
    expect(sanitizeSlugInput('   ')).toBe('college')
  })

  it('should remove leading/trailing hyphens', () => {
    expect(sanitizeSlugInput('-college-name-')).toBe('college-name')
  })

  it('should truncate long input', () => {
    const longInput = 'a'.repeat(120)
    const result = sanitizeSlugInput(longInput)
    expect(result.length).toBeLessThanOrEqual(100)
  })
})

describe('getSlugSuggestions', () => {
  it('should generate multiple suggestions', async () => {
    const suggestions = await getSlugSuggestions('Delhi University', 3)
    expect(suggestions).toHaveLength(3)
    expect(suggestions[0]).toBe('delhi-university')
    expect(suggestions).toContain('delhi-university-college')
  })

  it('should respect count parameter', async () => {
    const suggestions = await getSlugSuggestions('Test College', 2)
    expect(suggestions.length).toBeLessThanOrEqual(2)
  })
})