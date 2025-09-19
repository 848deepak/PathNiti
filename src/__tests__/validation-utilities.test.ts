/**
 * Unit tests for validation utilities used in dynamic college profiles
 * Tests form validation, file validation, and data sanitization
 */

import { validateCollegeRegistration, validateStudentApplication, validateCourseData, validateNoticeData } from '@/lib/utils/form-validation'
import { validateFileUpload, sanitizeFileName, checkFileType, checkFileSize } from '@/lib/utils/file-validation'
import { sanitizeInput, sanitizeHtml, validateEmail, validatePhone } from '@/lib/utils/input-sanitization'

describe('Form Validation Utilities', () => {
  describe('validateCollegeRegistration', () => {
    it('should validate complete college registration data', () => {
      const validData = {
        name: 'Test College',
        type: 'private' as const,
        location: {
          state: 'Delhi',
          city: 'New Delhi',
          pincode: '110001'
        },
        address: '123 Test Street, New Delhi',
        website: 'https://testcollege.edu',
        phone: '011-12345678',
        email: 'info@testcollege.edu',
        established_year: 1995,
        about: 'A comprehensive educational institution'
      }

      const result = validateCollegeRegistration(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        name: '',
        type: undefined,
        location: {
          state: '',
          city: 'New Delhi'
        },
        address: ''
      }

      const result = validateCollegeRegistration(invalidData as any)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBe('College name is required')
      expect(result.errors.type).toBe('College type is required')
      expect(result.errors['location.state']).toBe('State is required')
      expect(result.errors.address).toBe('Address is required')
    })

    it('should validate email format', () => {
      const invalidEmailData = {
        name: 'Test College',
        type: 'private' as const,
        location: { state: 'Delhi', city: 'New Delhi' },
        address: 'Test Address',
        email: 'invalid-email'
      }

      const result = validateCollegeRegistration(invalidEmailData)
      expect(result.isValid).toBe(false)
      expect(result.errors.email).toBe('Invalid email format')
    })

    it('should validate website URL format', () => {
      const invalidWebsiteData = {
        name: 'Test College',
        type: 'private' as const,
        location: { state: 'Delhi', city: 'New Delhi' },
        address: 'Test Address',
        website: 'not-a-url'
      }

      const result = validateCollegeRegistration(invalidWebsiteData)
      expect(result.isValid).toBe(false)
      expect(result.errors.website).toBe('Invalid website URL')
    })

    it('should validate established year range', () => {
      const invalidYearData = {
        name: 'Test College',
        type: 'private' as const,
        location: { state: 'Delhi', city: 'New Delhi' },
        address: 'Test Address',
        established_year: 1800 // Too old
      }

      const result = validateCollegeRegistration(invalidYearData)
      expect(result.isValid).toBe(false)
      expect(result.errors.established_year).toBe('Established year must be between 1850 and current year')
    })

    it('should validate phone number format', () => {
      const invalidPhoneData = {
        name: 'Test College',
        type: 'private' as const,
        location: { state: 'Delhi', city: 'New Delhi' },
        address: 'Test Address',
        phone: '123'
      }

      const result = validateCollegeRegistration(invalidPhoneData)
      expect(result.isValid).toBe(false)
      expect(result.errors.phone).toBe('Invalid phone number format')
    })
  })

  describe('validateStudentApplication', () => {
    it('should validate complete student application data', () => {
      const validData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        class_stream: 'Science',
        documents: {
          marksheet_10th: 'https://example.com/marksheet10.pdf',
          marksheet_12th: 'https://example.com/marksheet12.pdf'
        }
      }

      const result = validateStudentApplication(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        full_name: '',
        email: '',
        phone: '',
        class_stream: '',
        documents: {}
      }

      const result = validateStudentApplication(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.full_name).toBe('Full name is required')
      expect(result.errors.email).toBe('Email is required')
      expect(result.errors.phone).toBe('Phone number is required')
      expect(result.errors.class_stream).toBe('Class stream is required')
      expect(result.errors['documents.marksheet_10th']).toBe('10th marksheet is required')
      expect(result.errors['documents.marksheet_12th']).toBe('12th marksheet is required')
    })

    it('should validate name format', () => {
      const invalidNameData = {
        full_name: 'J',
        email: 'john@example.com',
        phone: '9876543210',
        class_stream: 'Science',
        documents: {
          marksheet_10th: 'https://example.com/marksheet10.pdf',
          marksheet_12th: 'https://example.com/marksheet12.pdf'
        }
      }

      const result = validateStudentApplication(invalidNameData)
      expect(result.isValid).toBe(false)
      expect(result.errors.full_name).toBe('Full name must be at least 2 characters long')
    })

    it('should validate phone number format', () => {
      const invalidPhoneData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '123',
        class_stream: 'Science',
        documents: {
          marksheet_10th: 'https://example.com/marksheet10.pdf',
          marksheet_12th: 'https://example.com/marksheet12.pdf'
        }
      }

      const result = validateStudentApplication(invalidPhoneData)
      expect(result.isValid).toBe(false)
      expect(result.errors.phone).toBe('Phone number must be 10 digits')
    })

    it('should validate class stream options', () => {
      const invalidStreamData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        class_stream: 'InvalidStream',
        documents: {
          marksheet_10th: 'https://example.com/marksheet10.pdf',
          marksheet_12th: 'https://example.com/marksheet12.pdf'
        }
      }

      const result = validateStudentApplication(invalidStreamData)
      expect(result.isValid).toBe(false)
      expect(result.errors.class_stream).toBe('Invalid class stream')
    })
  })

  describe('validateCourseData', () => {
    it('should validate complete course data', () => {
      const validData = {
        name: 'Computer Science Engineering',
        description: 'Comprehensive CS program',
        duration: '4 years',
        eligibility: 'Class 12 with PCM, minimum 75%',
        fees: {
          tuition: 100000,
          hostel: 50000,
          other: 25000
        },
        seats: 60
      }

      const result = validateCourseData(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should reject invalid fee amounts', () => {
      const invalidFeeData = {
        name: 'Test Course',
        duration: '4 years',
        fees: {
          tuition: -1000, // Negative fee
          hostel: 'invalid' // Non-numeric
        },
        seats: 60
      }

      const result = validateCourseData(invalidFeeData as any)
      expect(result.isValid).toBe(false)
      expect(result.errors['fees.tuition']).toBe('Tuition fee must be a positive number')
      expect(result.errors['fees.hostel']).toBe('Hostel fee must be a number')
    })

    it('should validate seat count', () => {
      const invalidSeatsData = {
        name: 'Test Course',
        duration: '4 years',
        seats: 0 // Invalid seat count
      }

      const result = validateCourseData(invalidSeatsData)
      expect(result.isValid).toBe(false)
      expect(result.errors.seats).toBe('Number of seats must be at least 1')
    })
  })

  describe('validateNoticeData', () => {
    it('should validate complete notice data', () => {
      const validData = {
        title: 'Admission Open',
        content: 'Applications are now open for the academic year 2024-25',
        type: 'admission' as const,
        expires_at: '2024-12-31T23:59:59Z'
      }

      const result = validateNoticeData(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        title: '',
        content: '',
        type: 'invalid-type'
      }

      const result = validateNoticeData(invalidData as any)
      expect(result.isValid).toBe(false)
      expect(result.errors.title).toBe('Title is required')
      expect(result.errors.content).toBe('Content is required')
      expect(result.errors.type).toBe('Invalid notice type')
    })

    it('should validate expiry date format', () => {
      const invalidDateData = {
        title: 'Test Notice',
        content: 'Test content',
        type: 'general' as const,
        expires_at: 'invalid-date'
      }

      const result = validateNoticeData(invalidDateData)
      expect(result.isValid).toBe(false)
      expect(result.errors.expires_at).toBe('Invalid expiry date format')
    })
  })
})

describe('File Validation Utilities', () => {
  describe('validateFileUpload', () => {
    it('should validate PDF files successfully', () => {
      const mockFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }) // 1MB

      const result = validateFileUpload(mockFile, {
        allowedTypes: ['application/pdf'],
        maxSize: 5 * 1024 * 1024 // 5MB
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject files with invalid types', () => {
      const mockFile = new File(['content'], 'document.txt', { type: 'text/plain' })

      const result = validateFileUpload(mockFile, {
        allowedTypes: ['application/pdf'],
        maxSize: 5 * 1024 * 1024
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File type not allowed. Allowed types: application/pdf')
    })

    it('should reject files that are too large', () => {
      const mockFile = new File(['content'], 'large.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 10 * 1024 * 1024 }) // 10MB

      const result = validateFileUpload(mockFile, {
        allowedTypes: ['application/pdf'],
        maxSize: 5 * 1024 * 1024 // 5MB limit
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File size exceeds maximum limit of 5MB')
    })

    it('should reject empty files', () => {
      const mockFile = new File([''], 'empty.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 0 })

      const result = validateFileUpload(mockFile, {
        allowedTypes: ['application/pdf'],
        maxSize: 5 * 1024 * 1024
      })

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File cannot be empty')
    })
  })

  describe('sanitizeFileName', () => {
    it('should sanitize file names', () => {
      expect(sanitizeFileName('My Document.pdf')).toBe('my-document.pdf')
      expect(sanitizeFileName('File with spaces & symbols!.pdf')).toBe('file-with-spaces-symbols.pdf')
      expect(sanitizeFileName('../../malicious.pdf')).toBe('malicious.pdf')
    })

    it('should handle special characters', () => {
      expect(sanitizeFileName('résumé.pdf')).toBe('resume.pdf')
      expect(sanitizeFileName('файл.pdf')).toBe('file.pdf')
      expect(sanitizeFileName('文档.pdf')).toBe('document.pdf')
    })

    it('should preserve file extensions', () => {
      expect(sanitizeFileName('document.PDF')).toBe('document.pdf')
      expect(sanitizeFileName('image.JPEG')).toBe('image.jpeg')
    })

    it('should handle long file names', () => {
      const longName = 'a'.repeat(200) + '.pdf'
      const sanitized = sanitizeFileName(longName)
      expect(sanitized.length).toBeLessThanOrEqual(100)
      expect(sanitized.endsWith('.pdf')).toBe(true)
    })
  })

  describe('checkFileType', () => {
    it('should check file types by MIME type', () => {
      expect(checkFileType('application/pdf', ['application/pdf'])).toBe(true)
      expect(checkFileType('image/jpeg', ['image/jpeg', 'image/png'])).toBe(true)
      expect(checkFileType('text/plain', ['application/pdf'])).toBe(false)
    })

    it('should check file types by extension', () => {
      expect(checkFileType('document.pdf', ['.pdf'])).toBe(true)
      expect(checkFileType('image.jpg', ['.jpg', '.png'])).toBe(true)
      expect(checkFileType('document.txt', ['.pdf'])).toBe(false)
    })
  })

  describe('checkFileSize', () => {
    it('should validate file sizes', () => {
      expect(checkFileSize(1024, 2048)).toBe(true) // 1KB < 2KB
      expect(checkFileSize(2048, 1024)).toBe(false) // 2KB > 1KB
      expect(checkFileSize(1024, 1024)).toBe(true) // Equal sizes allowed
    })

    it('should handle zero sizes', () => {
      expect(checkFileSize(0, 1024)).toBe(false) // Empty file
      expect(checkFileSize(1024, 0)).toBe(false) // Invalid max size
    })
  })
})

describe('Input Sanitization Utilities', () => {
  describe('sanitizeInput', () => {
    it('should sanitize basic text input', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World')
      expect(sanitizeInput('  Trimmed  ')).toBe('Trimmed')
      expect(sanitizeInput('')).toBe('')
    })

    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
      expect(sanitizeInput('SELECT * FROM users')).toBe('SELECT * FROM users')
      expect(sanitizeInput('../../etc/passwd')).toBe('../../etc/passwd')
    })

    it('should handle special characters safely', () => {
      expect(sanitizeInput('Price: $100 & tax')).toBe('Price: $100 &amp; tax')
      expect(sanitizeInput('Quote: "Hello"')).toBe('Quote: &quot;Hello&quot;')
      expect(sanitizeInput("Apostrophe: 'test'")).toBe("Apostrophe: &#x27;test&#x27;")
    })
  })

  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      expect(sanitizeHtml('<p>Hello <strong>World</strong></p>')).toBe('<p>Hello <strong>World</strong></p>')
      expect(sanitizeHtml('<em>Emphasized</em> text')).toBe('<em>Emphasized</em> text')
    })

    it('should remove dangerous HTML tags', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('')
      expect(sanitizeHtml('<iframe src="evil.com"></iframe>')).toBe('')
      expect(sanitizeHtml('<object data="malicious.swf"></object>')).toBe('')
    })

    it('should remove dangerous attributes', () => {
      expect(sanitizeHtml('<p onclick="alert()">Text</p>')).toBe('<p>Text</p>')
      expect(sanitizeHtml('<a href="javascript:alert()">Link</a>')).toBe('<a>Link</a>')
      expect(sanitizeHtml('<img src="image.jpg" onerror="alert()">')).toBe('<img src="image.jpg">')
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true)
      expect(validateEmail('user123@test-domain.org')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('user@domain')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validateEmail('user@domain.c')).toBe(false) // TLD too short
      expect(validateEmail('user@domain..com')).toBe(false) // Double dot
      expect(validateEmail('user name@domain.com')).toBe(false) // Space in local part
    })
  })

  describe('validatePhone', () => {
    it('should validate Indian phone numbers', () => {
      expect(validatePhone('9876543210')).toBe(true)
      expect(validatePhone('+919876543210')).toBe(true)
      expect(validatePhone('011-12345678')).toBe(true) // Landline
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false) // Too short
      expect(validatePhone('12345678901234')).toBe(false) // Too long
      expect(validatePhone('abcd123456')).toBe(false) // Contains letters
      expect(validatePhone('')).toBe(false) // Empty
    })

    it('should handle different formats', () => {
      expect(validatePhone('98765-43210')).toBe(true)
      expect(validatePhone('(011) 1234-5678')).toBe(true)
      expect(validatePhone('+91 98765 43210')).toBe(true)
    })
  })
})