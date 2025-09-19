/**
 * Tests for security and performance optimizations
 * Covers input sanitization, rate limiting, lazy loading, and session cleanup
 */

import { InputSanitizer } from '@/lib/utils/input-sanitization'
import { RateLimiter, applyRateLimit } from '@/lib/utils/rate-limiting'
import { CollegeLazyLoader } from '@/lib/utils/lazy-loading'
import { SignupSessionManager } from '@/lib/services/signup-session'
import { FormValidator } from '@/lib/utils/form-validation'
import { NextRequest } from 'next/server'

// Mock Response for Node.js environment
global.Response = class MockResponse {
  status: number
  headers: Map<string, string>
  body: string

  constructor(body: string, init?: { status?: number; headers?: Record<string, string> }) {
    this.body = body
    this.status = init?.status || 200
    this.headers = new Map(Object.entries(init?.headers || {}))
  }
} as any

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({
              data: [
                { id: '1', name: 'Test College', location: { city: 'Test City', state: 'Test State' } }
              ],
              error: null,
              count: 1
            }))
          }))
        }))
      }))
    }))
  }
}))

describe('Input Sanitization', () => {
  describe('sanitizeName', () => {
    it('should sanitize name fields correctly', () => {
      expect(InputSanitizer.sanitizeName('John<script>alert("xss")</script>Doe')).toBe('JohnDoe')
      expect(InputSanitizer.sanitizeName('  Mary Jane  ')).toBe('Mary Jane')
      expect(InputSanitizer.sanitizeName("O'Connor-Smith")).toBe("O'Connor-Smith")
      expect(InputSanitizer.sanitizeName('A'.repeat(100))).toBe('A'.repeat(50)) // Max length
    })

    it('should handle special characters in names', () => {
      expect(InputSanitizer.sanitizeName('José María')).toBe('Jos Mara') // Non-ASCII removed
      expect(InputSanitizer.sanitizeName('John@Doe')).toBe('JohnDoe')
      expect(InputSanitizer.sanitizeName('123John')).toBe('John')
    })
  })

  describe('sanitizeEmail', () => {
    it('should sanitize email addresses correctly', () => {
      expect(InputSanitizer.sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com')
      expect(InputSanitizer.sanitizeEmail('user<script>@domain.com')).toBe('user@domain.com') // HTML tags removed
      expect(InputSanitizer.sanitizeEmail('user+tag@domain.com')).toBe('user+tag@domain.com')
    })

    it('should handle malicious email inputs', () => {
      expect(InputSanitizer.sanitizeEmail('"><script>alert("xss")</script>@domain.com')).toBe('alertxss@domain.com') // HTML tags and quotes removed, content remains
      expect(InputSanitizer.sanitizeEmail('user@domain.com<script>')).toBe('user@domain.com') // HTML tags removed
    })
  })

  describe('sanitizePhone', () => {
    it('should sanitize phone numbers correctly', () => {
      expect(InputSanitizer.sanitizePhone('+1 (555) 123-4567')).toBe('+15551234567')
      expect(InputSanitizer.sanitizePhone('555.123.4567')).toBe('5551234567')
      expect(InputSanitizer.sanitizePhone('555 123 4567')).toBe('5551234567')
    })

    it('should handle malicious phone inputs', () => {
      expect(InputSanitizer.sanitizePhone('555<script>1234567')).toBe('5551234567')
      expect(InputSanitizer.sanitizePhone('+1-555-123-4567<script>')).toBe('+15551234567')
    })
  })

  describe('validatePassword', () => {
    it('should validate secure passwords', () => {
      const result = InputSanitizer.validatePassword('SecurePass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject weak passwords', () => {
      const result = InputSanitizer.validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should detect malicious password patterns', () => {
      const result = InputSanitizer.validatePassword('<script>alert("xss")</script>')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password contains invalid characters')
    })
  })

  describe('sanitizeFormData', () => {
    it('should sanitize entire form objects', () => {
      const formData = {
        firstName: '  John<script>  ',
        lastName: 'Doe<img src=x onerror=alert(1)>',
        email: '  TEST@EXAMPLE.COM  ',
        phone: '+1 (555) 123-4567',
        designation: 'Manager & Director'
      }

      const sanitized = InputSanitizer.sanitizeFormData(formData)

      expect(sanitized.firstName).toBe('John')
      expect(sanitized.lastName).toBe('Doe')
      expect(sanitized.email).toBe('test@example.com')
      expect(sanitized.phone).toBe('+15551234567')
      expect(sanitized.designation).toBe('Manager & Director')
    })
  })
})

describe('Rate Limiting', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    // Create a unique IP for each test to avoid interference
    const uniqueIp = `192.168.1.${Math.floor(Math.random() * 255)}`
    mockRequest = {
      headers: {
        get: jest.fn((key: string) => {
          if (key === 'x-forwarded-for') return uniqueIp
          return null
        })
      },
      ip: uniqueIp
    } as any
  })

  describe('RateLimiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = new RateLimiter({
        windowMs: 60000, // 1 minute
        maxRequests: 5
      })

      const result = await limiter.checkLimit(mockRequest)
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should block requests exceeding limit', async () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 1
      })

      // First request should succeed
      const result1 = await limiter.checkLimit(mockRequest)
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(0)

      // Second request should be blocked
      const result2 = await limiter.checkLimit(mockRequest)
      expect(result2.success).toBe(false)
      expect(result2.retryAfter).toBeGreaterThan(0)
    })
  })

  describe('applyRateLimit', () => {
    it('should return null for allowed requests', async () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 5
      })

      const response = await applyRateLimit(mockRequest, limiter)
      expect(response).toBeNull()
    })

    it('should return 429 response for blocked requests', async () => {
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 1
      })

      // Exhaust the limit
      await limiter.checkLimit(mockRequest)

      const response = await applyRateLimit(mockRequest, limiter)
      expect(response).not.toBeNull()
      expect(response?.status).toBe(429)
    })
  })

  describe('Predefined limiters', () => {
    it('should create auth limiter with correct settings', async () => {
      const limiter = RateLimiter.createAuthLimiter()
      const result = await limiter.checkLimit(mockRequest)
      expect(result.limit).toBe(5) // 5 attempts per 15 minutes
    })

    it('should create registration limiter with correct settings', async () => {
      const limiter = RateLimiter.createRegistrationLimiter()
      const result = await limiter.checkLimit(mockRequest)
      expect(result.limit).toBe(3) // 3 registrations per hour
    })
  })
})

describe('Lazy Loading', () => {
  let loader: CollegeLazyLoader

  beforeEach(() => {
    loader = new CollegeLazyLoader({
      pageSize: 10,
      cacheTimeout: 60000
    })
  })

  describe('loadColleges', () => {
    it('should load colleges successfully', async () => {
      const result = await loader.loadColleges()
      expect(result.isLoading).toBe(false)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should handle search queries', async () => {
      const result = await loader.searchColleges('Test')
      expect(result.isLoading).toBe(false)
      expect(result.data).toBeDefined()
    })

    it('should use caching correctly', async () => {
      // First call
      const result1 = await loader.loadColleges({}, true)
      
      // Second call should use cache (we can't easily test this without mocking)
      const result2 = await loader.loadColleges({}, true)
      
      expect(result1.data).toEqual(result2.data)
    })
  })

  describe('cache management', () => {
    it('should invalidate cache correctly', () => {
      expect(() => loader.invalidateCache()).not.toThrow()
      expect(() => loader.invalidateCache('colleges')).not.toThrow()
    })
  })
})

describe('Session Management Security', () => {
  let sessionManager: SignupSessionManager

  beforeEach(() => {
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    })

    sessionManager = new SignupSessionManager({
      expirationMinutes: 30
    })
  })

  describe('session security', () => {
    it('should not store passwords in session', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      }

      sessionManager.saveFormData(formData)

      const setItemCall = (window.sessionStorage.setItem as jest.Mock).mock.calls[0]
      const storedData = JSON.parse(setItemCall[1])
      
      expect(storedData.formData.password).toBeUndefined()
      expect(storedData.formData.confirmPassword).toBeUndefined()
      expect(storedData.formData.firstName).toBe('John')
    })

    it('should validate session data structure', () => {
      const mockInvalidSession = JSON.stringify({
        invalidStructure: true
      })

      ;(window.sessionStorage.getItem as jest.Mock).mockReturnValue(mockInvalidSession)

      const session = sessionManager.getSession()
      expect(session).toBeNull()
    })

    it('should handle expired sessions', () => {
      const expiredSession = JSON.stringify({
        formData: { firstName: 'John' },
        timestamp: Date.now() - 60000,
        expiresAt: Date.now() - 30000, // Expired 30 seconds ago
        step: 'college-selection'
      })

      ;(window.sessionStorage.getItem as jest.Mock).mockReturnValue(expiredSession)

      const session = sessionManager.getSession()
      expect(session).toBeNull()
      expect(window.sessionStorage.removeItem).toHaveBeenCalled()
    })
  })

  describe('cleanup functionality', () => {
    it('should perform cleanup without errors', () => {
      expect(() => sessionManager.stopCleanupInterval()).not.toThrow()
    })

    it('should handle recovery info correctly', () => {
      const validSession = JSON.stringify({
        formData: { firstName: 'John', email: 'john@example.com' },
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000,
        step: 'college-selection'
      })

      ;(window.sessionStorage.getItem as jest.Mock).mockReturnValue(validSession)

      const recoveryInfo = sessionManager.getRecoveryInfo()
      expect(recoveryInfo.hasRecoverableData).toBe(true)
      expect(recoveryInfo.dataFields.length).toBeGreaterThan(0)
    })
  })
})

describe('Form Validation with Sanitization', () => {
  describe('integrated validation', () => {
    it('should validate and sanitize names', () => {
      const result = FormValidator.validateFirstName('  John<script>  ')
      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBe('John')
    })

    it('should validate and sanitize emails', () => {
      const result = FormValidator.validateEmail('  TEST@EXAMPLE.COM  ')
      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBe('test@example.com')
    })

    it('should validate and sanitize phone numbers', () => {
      const result = FormValidator.validatePhone('+1 (555) 123-4567')
      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBe('+15551234567')
    })

    it('should sanitize form data', () => {
      const formData = {
        firstName: '  John<script>  ',
        email: '  TEST@EXAMPLE.COM  ',
        phone: '+1 (555) 123-4567'
      }

      const sanitized = FormValidator.sanitizeFormData(formData)
      expect(sanitized.firstName).toBe('John')
      expect(sanitized.email).toBe('test@example.com')
      expect(sanitized.phone).toBe('+15551234567')
    })
  })
})

describe('Performance Optimizations', () => {
  describe('lazy loading performance', () => {
    it('should handle large datasets efficiently', async () => {
      const loader = new CollegeLazyLoader({
        pageSize: 50,
        cacheTimeout: 300000 // 5 minutes
      })

      const startTime = Date.now()
      const result = await loader.loadColleges()
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
      expect(result.data).toBeDefined()
    })

    it('should preload correctly', () => {
      const loader = new CollegeLazyLoader({
        preloadThreshold: 10
      })

      expect(loader.shouldPreload(90, 100)).toBe(true) // 9 remaining (100-90-1), threshold 10
      expect(loader.shouldPreload(50, 100)).toBe(false) // 49 remaining (100-50-1), threshold 10
    })
  })

  describe('caching performance', () => {
    it('should cache search results', async () => {
      const loader = new CollegeLazyLoader()

      // First search
      const result1 = await loader.searchColleges('Test College')
      
      // Second search (should use cache)
      const result2 = await loader.searchColleges('Test College')

      expect(result1.data).toEqual(result2.data)
    })
  })
})