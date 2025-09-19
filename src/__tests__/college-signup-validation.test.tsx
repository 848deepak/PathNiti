/**
 * Tests for form validation utilities
 * Verifies validation logic and error handling
 */

import { FormValidator } from '../lib/utils/form-validation'
import { ErrorRecoveryManager } from '../lib/utils/error-recovery'

// Mock session manager for error recovery tests
jest.mock('../lib/services/signup-session', () => ({
  signupSessionManager: {
    saveFormData: jest.fn(),
    getFormData: jest.fn(),
    clearSession: jest.fn(),
    getSession: jest.fn(),
    getRecoveryInfo: jest.fn(() => ({
      hasRecoverableData: false,
      sessionAge: 0,
      timeUntilExpiration: 30,
      isExpiringSoon: false,
      dataFields: []
    }))
  }
}))

describe('Form Validation Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Field Validation', () => {
    test('validates first name correctly', () => {
      // Test empty field
      expect(FormValidator.validateFirstName('')).toEqual({
        isValid: false,
        error: 'First name is required'
      })

      // Test too short
      expect(FormValidator.validateFirstName('A')).toEqual({
        isValid: false,
        error: 'First name must be at least 2 characters'
      })

      // Test invalid characters
      expect(FormValidator.validateFirstName('John123')).toEqual({
        isValid: false,
        error: 'First name can only contain letters, spaces, hyphens, and apostrophes'
      })

      // Test valid input
      expect(FormValidator.validateFirstName('John')).toEqual({
        isValid: true
      })

      // Test valid with special characters
      expect(FormValidator.validateFirstName("Mary-Jane O'Connor")).toEqual({
        isValid: true
      })
    })

    test('validates email with typo detection', () => {
      // Test empty email
      expect(FormValidator.validateEmail('')).toEqual({
        isValid: false,
        error: 'Email is required'
      })

      // Test invalid email
      expect(FormValidator.validateEmail('invalid-email')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address'
      })

      // Test potential typo
      const typoResult = FormValidator.validateEmail('test@gmai.com')
      expect(typoResult.isValid).toBe(true)
      expect(typoResult.warnings).toContain('Did you mean gmail.com?')

      // Test valid email
      expect(FormValidator.validateEmail('test@gmail.com')).toEqual({
        isValid: true,
        warnings: []
      })
    })

    test('validates password with comprehensive requirements', () => {
      // Test empty password
      expect(FormValidator.validatePassword('')).toEqual({
        isValid: false,
        error: 'Password is required'
      })

      // Test weak password
      const weakResult = FormValidator.validatePassword('weak')
      expect(weakResult.isValid).toBe(false)
      expect(weakResult.error).toContain('Password must contain')
      expect(weakResult.error).toContain('at least 8 characters')

      // Test strong password
      expect(FormValidator.validatePassword('StrongPass123!')).toEqual({
        isValid: true
      })
    })

    test('validates password confirmation', () => {
      // Test empty confirmation
      expect(FormValidator.validateConfirmPassword('password', '')).toEqual({
        isValid: false,
        error: 'Please confirm your password'
      })

      // Test mismatched passwords
      expect(FormValidator.validateConfirmPassword('password1', 'password2')).toEqual({
        isValid: false,
        error: 'Passwords do not match'
      })

      // Test matching passwords
      expect(FormValidator.validateConfirmPassword('password', 'password')).toEqual({
        isValid: true
      })
    })

    test('validates phone number format', () => {
      // Test empty phone
      expect(FormValidator.validatePhone('')).toEqual({
        isValid: false,
        error: 'Phone number is required'
      })

      // Test too short
      expect(FormValidator.validatePhone('123')).toEqual({
        isValid: false,
        error: 'Phone number must be at least 10 digits'
      })

      // Test too long
      expect(FormValidator.validatePhone('12345678901234567890')).toEqual({
        isValid: false,
        error: 'Phone number cannot exceed 15 digits'
      })

      // Test valid phone
      expect(FormValidator.validatePhone('1234567890')).toEqual({
        isValid: true
      })

      // Test valid phone with formatting
      expect(FormValidator.validatePhone('(123) 456-7890')).toEqual({
        isValid: true
      })
    })

    test('validates college selection', () => {
      // Test empty selection
      expect(FormValidator.validateCollegeId('')).toEqual({
        isValid: false,
        error: 'Please select a college or register a new one'
      })

      // Test valid selection
      expect(FormValidator.validateCollegeId('college-123')).toEqual({
        isValid: true
      })
    })

    test('validates contact person name', () => {
      // Test empty name
      expect(FormValidator.validateContactPerson('')).toEqual({
        isValid: false,
        error: 'Contact person name is required'
      })

      // Test too short
      expect(FormValidator.validateContactPerson('A')).toEqual({
        isValid: false,
        error: 'Contact person name must be at least 2 characters'
      })

      // Test valid name
      expect(FormValidator.validateContactPerson('John Doe')).toEqual({
        isValid: true
      })
    })

    test('validates designation field', () => {
      // Test empty designation (optional)
      const result = FormValidator.validateDesignation('')
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Adding your designation helps students identify your role')

      // Test valid designation
      expect(FormValidator.validateDesignation('Admission Officer')).toEqual({
        isValid: true
      })
    })
  })

  describe('Error Recovery', () => {
    test('handles network errors with appropriate recovery actions', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }

      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('Network Error'),
        formData
      )

      expect(recovery.message).toContain('Connection problem')
      expect(recovery.actions).toHaveLength(2)
      expect(recovery.actions[0].label).toBe('Retry Submission')
      expect(recovery.actions[1].label).toBe('Check Connection')
      expect(recovery.canRetry).toBe(true)
    })

    test('handles existing email error with sign-in options', () => {
      const formData = {
        email: 'existing@example.com'
      }

      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('email already exists'),
        formData
      )

      expect(recovery.actions.some(action => action.label === 'Sign In Instead')).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Reset Password')).toBe(true)
    })

    test('handles college not found error', () => {
      const recovery = ErrorRecoveryManager.handleCollegeSelectionError(
        'College not found'
      )

      expect(recovery.some(action => action.label === 'Register New College')).toBe(true)
      expect(recovery.some(action => action.label === 'Try Different Search')).toBe(true)
    })

    test('formats error messages for better UX', () => {
      const recovery1 = ErrorRecoveryManager.handleSubmissionError(
        'Network Error',
        {}
      )
      expect(recovery1.message).toBe('Connection problem. Please check your internet and try again.')

      const recovery2 = ErrorRecoveryManager.handleSubmissionError(
        'Invalid email',
        {}
      )
      expect(recovery2.message).toBe('Please enter a valid email address.')
    })

    test('identifies retryable errors correctly', () => {
      expect(ErrorRecoveryManager.isRetryableError('Network Error')).toBe(true)
      expect(ErrorRecoveryManager.isRetryableError('Connection timeout')).toBe(true)
      expect(ErrorRecoveryManager.isRetryableError('Server error 500')).toBe(true)
      expect(ErrorRecoveryManager.isRetryableError('Invalid email')).toBe(false)
      expect(ErrorRecoveryManager.isRetryableError('User already exists')).toBe(false)
    })
  })

  describe('Form Validation State', () => {
    test('validates complete form correctly', () => {
      const validFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phone: '1234567890',
        collegeId: 'college-123',
        contactPerson: 'John Doe',
        designation: 'Admission Officer'
      }

      const validation = FormValidator.validateForm(validFormData)
      expect(validation.overall.isValid).toBe(true)
      expect(validation.firstName.isValid).toBe(true)
      expect(validation.lastName.isValid).toBe(true)
      expect(validation.email.isValid).toBe(true)
      expect(validation.password.isValid).toBe(true)
      expect(validation.confirmPassword.isValid).toBe(true)
      expect(validation.phone.isValid).toBe(true)
      expect(validation.collegeId.isValid).toBe(true)
      expect(validation.contactPerson.isValid).toBe(true)
      expect(validation.designation.isValid).toBe(true)
    })

    test('identifies form with errors', () => {
      const invalidFormData = {
        firstName: 'A', // Too short
        lastName: '',   // Empty
        email: 'invalid-email', // Invalid format
        password: 'weak', // Too weak
        confirmPassword: 'different', // Doesn't match
        phone: '123', // Too short
        collegeId: '', // Empty
        contactPerson: '', // Empty
        designation: 'A' // Too short
      }

      const validation = FormValidator.validateForm(invalidFormData)
      expect(validation.overall.isValid).toBe(false)
      expect(validation.firstName.isValid).toBe(false)
      expect(validation.lastName.isValid).toBe(false)
      expect(validation.email.isValid).toBe(false)
      expect(validation.password.isValid).toBe(false)
      expect(validation.confirmPassword.isValid).toBe(false)
      expect(validation.phone.isValid).toBe(false)
      expect(validation.collegeId.isValid).toBe(false)
      expect(validation.contactPerson.isValid).toBe(false)
      expect(validation.designation.isValid).toBe(false)
    })

    test('provides specific field errors', () => {
      const formData = {
        firstName: '',
        email: 'invalid',
        password: 'weak'
      }

      const validation = FormValidator.validateForm(formData)
      
      expect(FormValidator.getFieldError(validation, 'firstName')).toBe('First name is required')
      expect(FormValidator.getFieldError(validation, 'email')).toBe('Please enter a valid email address')
      expect(FormValidator.getFieldError(validation, 'password')).toContain('Password must contain')
      
      expect(FormValidator.isFieldValid(validation, 'firstName')).toBe(false)
      expect(FormValidator.isFieldValid(validation, 'email')).toBe(false)
      expect(FormValidator.isFieldValid(validation, 'password')).toBe(false)
    })
  })

})