/**
 * Integration test for college signup form validation improvements
 * Tests the complete form validation flow
 */

import { FormValidator } from '../lib/utils/form-validation'
import { ErrorRecoveryManager } from '../lib/utils/error-recovery'

describe('College Signup Form Integration', () => {

  test('comprehensive form validation works correctly', () => {
    // Test comprehensive form validation
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      phone: '1234567890',
      collegeId: 'college-123',
      contactPerson: 'John Doe',
      designation: 'Admin'
    }

    const validation = FormValidator.validateForm(validData)
    expect(validation.overall.isValid).toBe(true)

    // Test invalid data
    const invalidData = {
      firstName: '',
      email: 'invalid',
      password: 'weak',
      collegeId: ''
    }

    const invalidValidation = FormValidator.validateForm(invalidData)
    expect(invalidValidation.overall.isValid).toBe(false)
    expect(invalidValidation.firstName.error).toBe('First name is required')
    expect(invalidValidation.email.error).toBe('Please enter a valid email address')
    expect(invalidValidation.collegeId.error).toBe('Please select a college or register a new one')
  })

  test('error recovery provides appropriate fallback options', () => {
    // Test network error recovery
    const networkRecovery = ErrorRecoveryManager.handleSubmissionError(
      new Error('Network Error'),
      { firstName: 'John', email: 'john@example.com' }
    )
    
    expect(networkRecovery.message).toContain('Connection problem')
    expect(networkRecovery.actions.some(action => action.label === 'Retry Submission')).toBe(true)
    expect(networkRecovery.canRetry).toBe(true)

    // Test college not found error recovery
    const collegeRecovery = ErrorRecoveryManager.handleCollegeSelectionError('College not found')
    expect(collegeRecovery.some(action => action.label === 'Register New College')).toBe(true)
    expect(collegeRecovery.some(action => action.label === 'Try Different Search')).toBe(true)

    // Test validation error recovery
    const validationRecovery = ErrorRecoveryManager.handleSubmissionError(
      new Error('Validation failed'),
      { email: 'invalid@email' }
    )
    expect(validationRecovery.actions.some(action => action.label === 'Review Form')).toBe(true)
    expect(validationRecovery.actions.some(action => action.label === 'Clear Form')).toBe(true)
  })

  test('handles edge cases in validation', () => {
    // Test edge cases for name validation
    expect(FormValidator.validateFirstName("Mary-Jane O'Connor").isValid).toBe(true)
    expect(FormValidator.validateFirstName('A').isValid).toBe(false)
    expect(FormValidator.validateFirstName('John123').isValid).toBe(false)

    // Test edge cases for email validation
    expect(FormValidator.validateEmail('test@example.com').isValid).toBe(true)
    expect(FormValidator.validateEmail('test@gmai.com').warnings).toContain('Did you mean gmail.com?')
    expect(FormValidator.validateEmail('invalid-email').isValid).toBe(false)

    // Test edge cases for phone validation
    expect(FormValidator.validatePhone('1234567890').isValid).toBe(true)
    expect(FormValidator.validatePhone('(123) 456-7890').isValid).toBe(true)
    expect(FormValidator.validatePhone('123').isValid).toBe(false)
    expect(FormValidator.validatePhone('12345678901234567890').isValid).toBe(false)

    // Test password strength validation
    expect(FormValidator.validatePassword('StrongPass123!').isValid).toBe(true)
    expect(FormValidator.validatePassword('weak').isValid).toBe(false)
    expect(FormValidator.validatePassword('NoNumbers!').isValid).toBe(false)
    expect(FormValidator.validatePassword('nonumbers123!').isValid).toBe(false)
    expect(FormValidator.validatePassword('NOLOWERCASE123!').isValid).toBe(false)
    expect(FormValidator.validatePassword('NoSpecialChars123').isValid).toBe(false)
  })

  test('session recovery functionality works correctly', () => {
    // Test session recovery detection
    const recovery = ErrorRecoveryManager.handleSessionRecovery()
    expect(recovery).toHaveProperty('hasRecoverableSession')
    expect(recovery).toHaveProperty('sessionAge')
    expect(recovery).toHaveProperty('actions')

    // Test retry functionality
    expect(ErrorRecoveryManager.isRetryableError('Network Error')).toBe(true)
    expect(ErrorRecoveryManager.isRetryableError('Connection timeout')).toBe(true)
    expect(ErrorRecoveryManager.isRetryableError('Invalid email')).toBe(false)
  })
})