/**
 * Unit tests for session management functionality
 * Tests session persistence, recovery, and expiration handling
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { SignupSessionManager } from '../lib/services/signup-session'
import { CollegeSignupFormData, SignupStep } from '../lib/types/signup-session'

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

describe('Session Management Unit Tests', () => {
  let sessionManager: SignupSessionManager
  const mockFormData: Partial<CollegeSignupFormData> = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    collegeId: 'college-123',
    contactPerson: 'John Doe',
    designation: 'Admissions Officer'
  }

  beforeEach(() => {
    sessionManager = new SignupSessionManager()
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Session Data Persistence - Requirement 1.1', () => {
    test('should save form data with proper structure', () => {
      sessionManager.saveFormData(mockFormData, 'college-selection')

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'college_signup_session',
        expect.stringContaining('"firstName":"John"')
      )

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      expect(savedData).toHaveProperty('formData')
      expect(savedData).toHaveProperty('timestamp')
      expect(savedData).toHaveProperty('step')
      expect(savedData).toHaveProperty('expiresAt')
      expect(savedData.step).toBe('college-selection')
    })

    test('should merge with existing session data', () => {
      const existingSession = {
        formData: { firstName: 'Jane', email: 'jane@example.com' },
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(existingSession))

      sessionManager.saveFormData({ lastName: 'Smith', phone: '9876543210' })

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      expect(savedData.formData.firstName).toBe('Jane')
      expect(savedData.formData.lastName).toBe('Smith')
      expect(savedData.formData.email).toBe('jane@example.com')
      expect(savedData.formData.phone).toBe('9876543210')
    })

    test('should sanitize sensitive data before storage', () => {
      const dataWithPassword = {
        ...mockFormData,
        password: 'secretPassword123!',
        confirmPassword: 'secretPassword123!'
      }

      sessionManager.saveFormData(dataWithPassword)

      const savedData = mockSessionStorage.setItem.mock.calls[0][1]
      expect(savedData).not.toContain('secretPassword123!')
      expect(savedData).not.toContain('password')
      expect(savedData).not.toContain('confirmPassword')
    })

    test('should set appropriate expiration time', () => {
      const beforeTime = Date.now()
      sessionManager.saveFormData(mockFormData)
      const afterTime = Date.now()

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      expect(savedData.expiresAt).toBeGreaterThan(beforeTime + 29 * 60 * 1000)
      expect(savedData.expiresAt).toBeLessThan(afterTime + 31 * 60 * 1000)
    })
  })

  describe('Session Recovery - Requirement 1.2', () => {
    test('should retrieve valid session data', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      const result = sessionManager.getFormData()
      expect(result).toEqual(mockFormData)
    })

    test('should return null for expired sessions', () => {
      const expiredSession = {
        formData: mockFormData,
        timestamp: Date.now() - 60 * 60 * 1000,
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() - 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredSession))

      const result = sessionManager.getFormData()
      expect(result).toBeNull()
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('college_signup_session')
    })

    test('should handle corrupted session data gracefully', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid json data')

      const result = sessionManager.getFormData()
      expect(result).toBeNull()
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('college_signup_session')
      expect(console.error).toHaveBeenCalledWith(
        'Failed to retrieve session data:',
        expect.any(Error)
      )
    })

    test('should provide comprehensive recovery information', () => {
      const sessionData = {
        formData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          collegeId: 'college-123'
        },
        timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 20 * 60 * 1000 // 20 minutes from now
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      const recoveryInfo = sessionManager.getRecoveryInfo()
      
      expect(recoveryInfo.hasRecoverableData).toBe(true)
      expect(recoveryInfo.sessionAge).toBe(10)
      expect(recoveryInfo.timeUntilExpiration).toBe(20)
      expect(recoveryInfo.isExpiringSoon).toBe(false)
      expect(recoveryInfo.dataFields).toEqual(['firstName', 'lastName', 'email', 'collegeId'])
    })
  })

  describe('Session Expiration Handling - Requirement 1.3', () => {
    test('should detect sessions expiring soon', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 3 * 60 * 1000 // 3 minutes from now
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      expect(sessionManager.isSessionExpiringSoon(5)).toBe(true)
      expect(sessionManager.isSessionExpiringSoon(2)).toBe(false)
    })

    test('should extend session expiration', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 15 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      const beforeExtension = Date.now()
      sessionManager.extendSession(45)
      const afterExtension = Date.now()

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      expect(savedData.expiresAt).toBeGreaterThan(beforeExtension + 44 * 60 * 1000)
      expect(savedData.expiresAt).toBeLessThan(afterExtension + 46 * 60 * 1000)
    })

    test('should calculate time until expiration correctly', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 25 * 60 * 1000 // 25 minutes from now
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      const timeRemaining = sessionManager.getTimeUntilExpiration()
      expect(timeRemaining).toBeGreaterThanOrEqual(24)
      expect(timeRemaining).toBeLessThanOrEqual(25)
    })
  })

  describe('Step Management - Requirement 1.4', () => {
    test('should track signup flow steps', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      sessionManager.setStep('college-registration')

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      expect(savedData.step).toBe('college-registration')
      expect(savedData.timestamp).toBeGreaterThan(sessionData.timestamp)
    })

    test('should retrieve current step', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-registration' as SignupStep,
        expiresAt: Date.now() + 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      const currentStep = sessionManager.getStep()
      expect(currentStep).toBe('college-registration')
    })

    test('should return null step for non-existent session', () => {
      mockSessionStorage.getItem.mockReturnValue(null)

      const currentStep = sessionManager.getStep()
      expect(currentStep).toBeNull()
    })
  })

  describe('Session Backup and Restore - Requirement 1.4', () => {
    test('should create session backup', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      const backup = sessionManager.createBackup()
      expect(backup).toBeTruthy()

      const backupData = JSON.parse(backup!)
      expect(backupData.formData).toEqual(mockFormData)
      expect(backupData.step).toBe('college-selection')
      expect(backupData).toHaveProperty('backupTimestamp')
    })

    test('should restore session from backup', () => {
      const backupData = {
        formData: mockFormData,
        timestamp: Date.now() - 10 * 60 * 1000,
        step: 'college-selection',
        expiresAt: Date.now() + 20 * 60 * 1000,
        backupTimestamp: Date.now()
      }

      const success = sessionManager.restoreFromBackup(JSON.stringify(backupData))
      expect(success).toBe(true)

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      expect(savedData.formData).toEqual(mockFormData)
      expect(savedData.step).toBe('college-selection')
    })

    test('should handle invalid backup data', () => {
      const success = sessionManager.restoreFromBackup('invalid backup data')
      expect(success).toBe(false)
      expect(console.error).toHaveBeenCalledWith(
        'Failed to restore from backup:',
        expect.any(Error)
      )
    })
  })

  describe('Custom Configuration', () => {
    test('should use custom storage key and expiration', () => {
      const customManager = new SignupSessionManager({
        storageKey: 'custom_session_key',
        expirationMinutes: 60
      })

      customManager.saveFormData(mockFormData)

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'custom_session_key',
        expect.any(String)
      )

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      const expectedExpiration = Date.now() + 60 * 60 * 1000
      expect(savedData.expiresAt).toBeGreaterThan(expectedExpiration - 1000)
      expect(savedData.expiresAt).toBeLessThan(expectedExpiration + 1000)
    })
  })

  describe('Error Handling', () => {
    test('should handle storage quota exceeded errors', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      expect(() => sessionManager.saveFormData(mockFormData)).not.toThrow()
      expect(console.error).toHaveBeenCalledWith(
        'Failed to save form data to session:',
        expect.any(Error)
      )
    })

    test('should handle storage access errors gracefully', () => {
      mockSessionStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage access denied')
      })

      expect(() => sessionManager.clearSession()).not.toThrow()
      expect(console.error).toHaveBeenCalledWith(
        'Failed to clear session data:',
        expect.any(Error)
      )
    })

    test('should work in server-side rendering environment', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      expect(() => sessionManager.saveFormData(mockFormData)).not.toThrow()
      expect(() => sessionManager.getFormData()).not.toThrow()
      expect(() => sessionManager.clearSession()).not.toThrow()

      const result = sessionManager.getFormData()
      expect(result).toBeNull()

      global.window = originalWindow
    })
  })

  describe('Session Validation', () => {
    test('should validate session existence and validity', () => {
      // Test with valid session
      const validSession = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(validSession))
      expect(sessionManager.hasValidSession()).toBe(true)

      // Test with expired session
      const expiredSession = {
        ...validSession,
        expiresAt: Date.now() - 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredSession))
      expect(sessionManager.hasValidSession()).toBe(false)

      // Test with no session
      mockSessionStorage.getItem.mockReturnValue(null)
      expect(sessionManager.hasValidSession()).toBe(false)
    })
  })
})