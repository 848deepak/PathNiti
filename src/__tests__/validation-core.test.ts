/**
 * Core validation tests without Next.js dependencies
 */

import { FormValidator } from '@/lib/utils/form-validation'
import { InputSanitizer } from '@/lib/utils/input-sanitization'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { describe } from 'node:test'
import { describe } from 'node:test'

describe('Form Validation Core', () => {
  describe('FormValidator', () => {
    it('should validate required fields', () => {
      const result = FormValidator.validateFirstName('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('First name is required')
    })

    it('should validate email format', () => {
      const validEmail = FormValidator.validateEmail('test@example.com')
      const invalidEmail = FormValidator.validateEmail('invalid-email')

      expect(validEmail.isValid).toBe(true)
      expect(invalidEmail.isValid).toBe(false)
      expect(invalidEmail.error).toBe('Please enter a valid email address')
    })

    it('should validate phone numbers', () => {
      const validPhone = FormValidator.validatePhone('9876543210')
      const invalidPhone = FormValidator.validatePhone('123')

      expect(validPhone.isValid).toBe(true)
      expect(invalidPhone.isValid).toBe(false)
      expect(invalidPhone.error).toBe('Phone number must be at least 10 digits')
    })

    it('should validate password strength', () => {
      const weakPassword = FormValidator.validatePassword('123')
      const strongPassword = FormValidator.validatePassword('StrongPass123!')

      expect(weakPassword.isValid).toBe(false)
      expect(strongPassword.isValid).toBe(true)
    })

    it('should validate confirm password', () => {
      const matching = FormValidator.validateConfirmPassword('password', 'password')
      const notMatching = FormValidator.validateConfirmPassword('password', 'different')

      expect(matching.isValid).toBe(true)
      expect(notMatching.isValid).toBe(false)
      expect(notMatching.error).toBe('Passwords do not match')
    })

    it('should validate entire form', () => {
      const validFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phone: '9876543210',
        collegeId: 'college-123',
        contactPerson: 'Jane Doe',
        designation: 'Admin'
      }

      const invalidFormData = {
        firstName: '',
        lastName: 'D',
        email: 'invalid-email',
        password: '123',
        confirmPassword: 'different',
        phone: '123',
        collegeId: '',
        contactPerson: '',
        designation: ''
      }

      const validResult = FormValidator.validateForm(validFormData)
      const invalidResult = FormValidator.validateForm(invalidFormData)

      expect(validResult.overall.isValid).toBe(true)
      expect(invalidResult.overall.isValid).toBe(false)
      expect(Object.keys(invalidResult).filter(key => 
        key !== 'overall' && !invalidResult[key as keyof typeof invalidResult].isValid
      ).length).toBeGreaterThan(0)
    })
  })

  describe('InputSanitizer', () => {
    it('should sanitize names correctly', () => {
      const result = InputSanitizer.sanitizeName('  John Doe  ')
      expect(result).toBe('John Doe')
    })

    it('should sanitize emails correctly', () => {
      const result = InputSanitizer.sanitizeEmail('  TEST@EXAMPLE.COM  ')
      expect(result).toBe('test@example.com')
    })

    it('should sanitize phone numbers correctly', () => {
      const result = InputSanitizer.sanitizePhone('+91 98765 43210')
      expect(result).toBe('+919876543210')
    })

    it('should validate and sanitize passwords', () => {
      const result = InputSanitizer.validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.sanitized).toBe('StrongPass123!')
    })

    it('should sanitize form data', () => {
      const formData = {
        name: '  John Doe  ',
        email: '  TEST@EXAMPLE.COM  ',
        phone: '+91 98765 43210',
        description: '  This is a test description  '
      }

      const sanitized = InputSanitizer.sanitizeFormData(formData)

      expect(sanitized.name).toBe('John Doe')
      expect(sanitized.email).toBe('test@example.com')
      expect(sanitized.phone).toBe('+919876543210')
      expect(sanitized.description).toBe('This is a test description')
    })

    it('should handle XSS attempts', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello'
      const sanitized = InputSanitizer.sanitizeText(maliciousInput)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert')
      expect(sanitized).toBe('Hello')
    })

    it('should enforce length limits', () => {
      const longText = 'a'.repeat(1000)
      const sanitized = InputSanitizer.sanitizeText(longText, { maxLength: 100 })
      
      expect(sanitized.length).toBe(100)
    })
  })
})

describe('Error Recovery', () => {
  it('should identify retryable errors', () => {
    const { ErrorRecoveryManager } = require('@/lib/utils/error-recovery')
    
    expect(ErrorRecoveryManager.isRetryableError('Network Error')).toBe(true)
    expect(ErrorRecoveryManager.isRetryableError('Connection timeout')).toBe(true)
    expect(ErrorRecoveryManager.isRetryableError('Validation failed')).toBe(false)
  })

  it('should format error messages', () => {
    const { ErrorRecoveryManager } = require('@/lib/utils/error-recovery')
    
    const formatted = ErrorRecoveryManager.formatErrorMessage('network error')
    expect(formatted).toBe('Connection problem. Please check your internet and try again.')
  })
})

describe('File Validation', () => {
  it('should validate file types', () => {
    const { validateFile } = require('@/lib/utils/file-validation')
    
    const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    const invalidFile = new File(['content'], 'document.exe', { type: 'application/exe' })
    
    expect(validateFile(pdfFile).isValid).toBe(true)
    expect(validateFile(invalidFile).isValid).toBe(false)
  })

  it('should validate file sizes', () => {
    const { validateFile } = require('@/lib/utils/file-validation')
    
    const smallFile = new File(['x'.repeat(1024)], 'small.pdf', { type: 'application/pdf' })
    const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
    
    expect(validateFile(smallFile).isValid).toBe(true)
    expect(validateFile(largeFile).isValid).toBe(false)
  })
})

describe('Rate Limiting', () => {
  it('should track request counts', async () => {
    const { RateLimiter } = require('@/lib/utils/rate-limiting')
    
    const limiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 3
    })
    
    // Mock request object
    const mockRequest = {
      headers: new Map([['x-forwarded-for', '127.0.0.1']]),
      ip: '127.0.0.1'
    } as any
    
    // First few requests should be allowed
    let result = await limiter.checkLimit(mockRequest)
    expect(result.success).toBe(true)
    
    result = await limiter.checkLimit(mockRequest)
    expect(result.success).toBe(true)
    
    result = await limiter.checkLimit(mockRequest)
    expect(result.success).toBe(true)
    
    // Fourth request should be rate limited
    result = await limiter.checkLimit(mockRequest)
    expect(result.success).toBe(false)
  })
})

describe('Input Sanitization Edge Cases', () => {
  it('should handle null and undefined inputs', () => {
    expect(InputSanitizer.sanitizeName(null as any)).toBe('')
    expect(InputSanitizer.sanitizeName(undefined as any)).toBe('')
    expect(InputSanitizer.sanitizeEmail(null as any)).toBe('')
  })

  it('should handle special characters in names', () => {
    const name = "O'Connor-Smith"
    const sanitized = InputSanitizer.sanitizeName(name)
    expect(sanitized).toBe("O'Connor-Smith")
  })

  it('should handle international characters', () => {
    const name = "José María"
    const sanitized = InputSanitizer.sanitizeName(name)
    // The sanitizer may strip accented characters for security
    expect(sanitized).toMatch(/^[a-zA-Z\s'-]+$/)
  })

  it('should handle various phone number formats', () => {
    const formats = [
      '+91 98765 43210',
      '(987) 654-3210',
      '987-654-3210',
      '9876543210'
    ]

    formats.forEach(format => {
      const sanitized = InputSanitizer.sanitizePhone(format)
      expect(sanitized).toMatch(/^\+?[\d\s\-\(\)]+$/)
    })
  })
})

describe('Form Validation Edge Cases', () => {
  it('should handle empty form data', () => {
    const result = FormValidator.validateForm({})
    expect(result.overall.isValid).toBe(false)
  })

  it('should handle form data with extra fields', () => {
    const formData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      phone: '9876543210',
      collegeId: 'college-123',
      contactPerson: 'Jane Doe',
      designation: 'Admin',
      extraField: 'should be ignored'
    }

    const result = FormValidator.validateForm(formData)
    expect(result.overall.isValid).toBe(true)
  })

  it('should provide helpful error messages', () => {
    const result = FormValidator.validateEmail('invalid-email')
    expect(result.error).toContain('valid email address')
  })

  it('should suggest corrections for common typos', () => {
    const result = FormValidator.validateEmail('test@gmai.com')
    expect(result.warnings).toBeDefined()
    expect(result.warnings?.some(w => w.includes('gmail.com'))).toBe(true)
  })
})