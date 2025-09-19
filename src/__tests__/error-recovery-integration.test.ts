/**
 * Integration tests for error recovery and session restoration
 * Tests error handling scenarios and recovery mechanisms
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { ErrorRecoveryManager } from '../lib/utils/error-recovery'
import { signupSessionManager } from '../lib/services/signup-session'

// Mock session manager
jest.mock('../lib/services/signup-session', () => ({
  signupSessionManager: {
    saveFormData: jest.fn(),
    getFormData: jest.fn(),
    clearSession: jest.fn(),
    getSession: jest.fn(),
    getRecoveryInfo: jest.fn(),
    hasValidSession: jest.fn(),
    extendSession: jest.fn(),
    createBackup: jest.fn(),
    restoreFromBackup: jest.fn()
  }
}))

describe('Error Recovery Integration Tests', () => {
  const mockSignupSessionManager = signupSessionManager as jest.Mocked<typeof signupSessionManager>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Network Error Recovery - Requirement 1.1', () => {
    test('should provide retry options for network errors', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        collegeId: 'college-123'
      }

      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('Network Error'),
        formData
      )

      expect(recovery.message).toContain('Connection problem')
      expect(recovery.canRetry).toBe(true)
      expect(recovery.actions).toHaveLength(2)
      expect(recovery.actions[0].label).toBe('Retry Submission')
      expect(recovery.actions[1].label).toBe('Check Connection')
      expect(recovery.actions[0].type).toBe('retry')
      expect(recovery.actions[1].type).toBe('external')
    })

    test('should handle timeout errors with appropriate recovery', () => {
      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('Connection timeout'),
        {}
      )

      expect(recovery.message).toBe('Connection problem. Please check your internet and try again.')
      expect(recovery.canRetry).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Retry Submission')).toBe(true)
    })

    test('should handle server errors with retry options', () => {
      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('Server error 500'),
        {}
      )

      expect(recovery.canRetry).toBe(true)
      expect(recovery.message).toContain('server issue')
    })
  })

  describe('Validation Error Recovery - Requirement 1.2', () => {
    test('should provide form review options for validation errors', () => {
      const formData = {
        firstName: '',
        email: 'invalid-email',
        password: 'weak'
      }

      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('Validation failed'),
        formData
      )

      expect(recovery.canRetry).toBe(false)
      expect(recovery.actions.some(action => action.label === 'Review Form')).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Clear Form')).toBe(true)
    })

    test('should handle specific field validation errors', () => {
      const recovery = ErrorRecoveryManager.handleSubmissionError(
        'Invalid email format',
        { email: 'invalid@email' }
      )

      expect(recovery.message).toBe('Please enter a valid email address.')
      expect(recovery.actions.some(action => action.label === 'Fix Email')).toBe(true)
    })

    test('should handle password validation errors', () => {
      const recovery = ErrorRecoveryManager.handleSubmissionError(
        'Password too weak',
        { password: 'weak' }
      )

      expect(recovery.message).toContain('password requirements')
      expect(recovery.actions.some(action => action.label === 'Update Password')).toBe(true)
    })
  })

  describe('College Selection Error Recovery - Requirement 1.3', () => {
    test('should provide college registration options when college not found', () => {
      const recovery = ErrorRecoveryManager.handleCollegeSelectionError(
        'College not found'
      )

      expect(recovery).toHaveLength(3)
      expect(recovery.some(action => action.label === 'Register New College')).toBe(true)
      expect(recovery.some(action => action.label === 'Try Different Search')).toBe(true)
      expect(recovery.some(action => action.label === 'Contact Support')).toBe(true)
    })

    test('should handle college loading errors', () => {
      const recovery = ErrorRecoveryManager.handleCollegeSelectionError(
        'Failed to load colleges'
      )

      expect(recovery.some(action => action.label === 'Retry Loading')).toBe(true)
      expect(recovery.some(action => action.label === 'Register New College')).toBe(true)
    })

    test('should provide search refinement options', () => {
      const recovery = ErrorRecoveryManager.handleCollegeSelectionError(
        'Too many results found'
      )

      expect(recovery.some(action => action.label === 'Refine Search')).toBe(true)
      expect(recovery.some(action => action.label === 'Browse All')).toBe(true)
    })
  })

  describe('Session Recovery - Requirement 1.4', () => {
    test('should detect and offer session recovery', () => {
      mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
        hasRecoverableData: true,
        sessionAge: 15,
        timeUntilExpiration: 10,
        isExpiringSoon: true,
        dataFields: ['firstName', 'lastName', 'email']
      })

      const recovery = ErrorRecoveryManager.handleSessionRecovery()

      expect(recovery.hasRecoverableSession).toBe(true)
      expect(recovery.sessionAge).toBe(15)
      expect(recovery.timeUntilExpiration).toBe(10)
      expect(recovery.isExpiringSoon).toBe(true)
      expect(recovery.actions).toHaveLength(3)
      expect(recovery.actions.some(action => action.label === 'Restore Session')).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Start Fresh')).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Extend Session')).toBe(true)
    })

    test('should handle expired session recovery', () => {
      mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
        hasRecoverableData: false,
        sessionAge: 0,
        timeUntilExpiration: 0,
        isExpiringSoon: false,
        dataFields: []
      })

      const recovery = ErrorRecoveryManager.handleSessionRecovery()

      expect(recovery.hasRecoverableSession).toBe(false)
      expect(recovery.actions).toHaveLength(1)
      expect(recovery.actions[0].label).toBe('Start Fresh')
    })

    test('should provide session extension for expiring sessions', () => {
      mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
        hasRecoverableData: true,
        sessionAge: 25,
        timeUntilExpiration: 3,
        isExpiringSoon: true,
        dataFields: ['firstName', 'email', 'collegeId']
      })

      const recovery = ErrorRecoveryManager.handleSessionRecovery()

      expect(recovery.isExpiringSoon).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Extend Session')).toBe(true)
      expect(recovery.actions.some(action => action.type === 'extend')).toBe(true)
    })
  })

  describe('User Account Error Recovery - Requirement 1.1', () => {
    test('should handle existing email errors', () => {
      const formData = { email: 'existing@example.com' }

      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('email already exists'),
        formData
      )

      expect(recovery.actions.some(action => action.label === 'Sign In Instead')).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Reset Password')).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Use Different Email')).toBe(true)
    })

    test('should handle OAuth errors', () => {
      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('OAuth provider error'),
        {}
      )

      expect(recovery.message).toContain('authentication service')
      expect(recovery.actions.some(action => action.label === 'Try Again')).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Use Email Instead')).toBe(true)
    })

    test('should handle account verification errors', () => {
      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('Email verification required'),
        { email: 'user@example.com' }
      )

      expect(recovery.message).toContain('verify your email')
      expect(recovery.actions.some(action => action.label === 'Resend Verification')).toBe(true)
      expect(recovery.actions.some(action => action.label === 'Check Spam Folder')).toBe(true)
    })
  })

  describe('Error Classification and Retry Logic', () => {
    test('should correctly identify retryable errors', () => {
      const retryableErrors = [
        'Network Error',
        'Connection timeout',
        'Server error 500',
        'Service unavailable',
        'Request timeout'
      ]

      retryableErrors.forEach(error => {
        expect(ErrorRecoveryManager.isRetryableError(error)).toBe(true)
      })
    })

    test('should correctly identify non-retryable errors', () => {
      const nonRetryableErrors = [
        'Invalid email',
        'Password too weak',
        'User already exists',
        'Validation failed',
        'Unauthorized access'
      ]

      nonRetryableErrors.forEach(error => {
        expect(ErrorRecoveryManager.isRetryableError(error)).toBe(false)
      })
    })

    test('should format error messages for better user experience', () => {
      const testCases = [
        {
          input: 'Network Error',
          expected: 'Connection problem. Please check your internet and try again.'
        },
        {
          input: 'Invalid email',
          expected: 'Please enter a valid email address.'
        },
        {
          input: 'Password too weak',
          expected: 'Please create a stronger password that meets our requirements.'
        },
        {
          input: 'User already exists',
          expected: 'An account with this email already exists. Please sign in or use a different email.'
        }
      ]

      testCases.forEach(({ input, expected }) => {
        const recovery = ErrorRecoveryManager.handleSubmissionError(input, {})
        expect(recovery.message).toBe(expected)
      })
    })
  })

  describe('Recovery Action Execution', () => {
    test('should provide executable recovery actions', () => {
      const formData = { firstName: 'John', email: 'john@example.com' }
      
      const recovery = ErrorRecoveryManager.handleSubmissionError(
        new Error('Network Error'),
        formData
      )

      const retryAction = recovery.actions.find(action => action.type === 'retry')
      expect(retryAction).toBeDefined()
      expect(retryAction?.action).toBeInstanceOf(Function)

      const externalAction = recovery.actions.find(action => action.type === 'external')
      expect(externalAction).toBeDefined()
      expect(externalAction?.url).toBeDefined()
    })

    test('should handle session restoration actions', () => {
      mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
        hasRecoverableData: true,
        sessionAge: 10,
        timeUntilExpiration: 20,
        isExpiringSoon: false,
        dataFields: ['firstName', 'email']
      })

      const recovery = ErrorRecoveryManager.handleSessionRecovery()

      const restoreAction = recovery.actions.find(action => action.type === 'restore')
      expect(restoreAction).toBeDefined()
      expect(restoreAction?.action).toBeInstanceOf(Function)

      const extendAction = recovery.actions.find(action => action.type === 'extend')
      expect(extendAction).toBeDefined()
      expect(extendAction?.action).toBeInstanceOf(Function)
    })

    test('should handle college registration actions', () => {
      const recovery = ErrorRecoveryManager.handleCollegeSelectionError('College not found')

      const registerAction = recovery.find(action => action.type === 'navigate')
      expect(registerAction).toBeDefined()
      expect(registerAction?.url).toContain('/colleges/register')

      const searchAction = recovery.find(action => action.type === 'action')
      expect(searchAction).toBeDefined()
      expect(searchAction?.action).toBeInstanceOf(Function)
    })
  })

  describe('Error Context and Metadata', () => {
    test('should preserve error context for debugging', () => {
      const originalError = new Error('Original network error')
      originalError.stack = 'Error stack trace...'

      const formData = { firstName: 'John' }
      
      const recovery = ErrorRecoveryManager.handleSubmissionError(originalError, formData)

      expect(recovery.originalError).toBe(originalError)
      expect(recovery.context).toEqual(formData)
      expect(recovery.timestamp).toBeDefined()
    })

    test('should categorize errors by type', () => {
      const networkError = ErrorRecoveryManager.handleSubmissionError('Network Error', {})
      expect(networkError.category).toBe('network')

      const validationError = ErrorRecoveryManager.handleSubmissionError('Invalid email', {})
      expect(validationError.category).toBe('validation')

      const authError = ErrorRecoveryManager.handleSubmissionError('User already exists', {})
      expect(authError.category).toBe('authentication')
    })

    test('should provide severity levels for errors', () => {
      const criticalError = ErrorRecoveryManager.handleSubmissionError('Server error 500', {})
      expect(criticalError.severity).toBe('high')

      const warningError = ErrorRecoveryManager.handleSubmissionError('Invalid email', {})
      expect(warningError.severity).toBe('medium')

      const infoError = ErrorRecoveryManager.handleSubmissionError('Password suggestion', {})
      expect(infoError.severity).toBe('low')
    })
  })
})