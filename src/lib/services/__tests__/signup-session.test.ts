/**
 * Unit tests for SignupSessionManager
 */

import { SignupSessionManager } from '../signup-session'
import { CollegeSignupFormData, SignupStep } from '../../types/signup-session'

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

describe('SignupSessionManager', () => {
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

  describe('saveFormData', () => {
    it('should save form data to session storage', () => {
      sessionManager.saveFormData(mockFormData)

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'college_signup_session',
        expect.stringContaining('"firstName":"John"')
      )
    })

    it('should merge with existing session data', () => {
      const existingSession = {
        formData: { firstName: 'Jane', email: 'jane@example.com' },
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(existingSession))

      sessionManager.saveFormData({ lastName: 'Smith' })

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'college_signup_session',
        expect.stringContaining('"firstName":"Jane"')
      )
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'college_signup_session',
        expect.stringContaining('"lastName":"Smith"')
      )
    })

    it('should not store password in session', () => {
      const dataWithPassword = {
        ...mockFormData,
        password: 'secretPassword',
        confirmPassword: 'secretPassword'
      }

      sessionManager.saveFormData(dataWithPassword)

      const savedData = mockSessionStorage.setItem.mock.calls[0][1]
      expect(savedData).not.toContain('secretPassword')
      expect(savedData).not.toContain('password')
    })

    it('should set expiration time', () => {
      const beforeTime = Date.now()
      sessionManager.saveFormData(mockFormData)
      const afterTime = Date.now()

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      expect(savedData.expiresAt).toBeGreaterThan(beforeTime + 29 * 60 * 1000)
      expect(savedData.expiresAt).toBeLessThan(afterTime + 31 * 60 * 1000)
    })

    it('should handle storage errors gracefully', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full')
      })

      expect(() => sessionManager.saveFormData(mockFormData)).not.toThrow()
      expect(console.error).toHaveBeenCalledWith(
        'Failed to save form data to session:',
        expect.any(Error)
      )
    })
  })

  describe('getFormData', () => {
    it('should retrieve form data from session storage', () => {
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

    it('should return null if no session exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null)

      const result = sessionManager.getFormData()
      expect(result).toBeNull()
    })

    it('should return null and clear session if expired', () => {
      const expiredSession = {
        formData: mockFormData,
        timestamp: Date.now() - 60 * 60 * 1000, // 1 hour ago
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() - 30 * 60 * 1000 // Expired 30 minutes ago
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredSession))

      const result = sessionManager.getFormData()
      expect(result).toBeNull()
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('college_signup_session')
    })

    it('should handle corrupted session data', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid json')

      const result = sessionManager.getFormData()
      expect(result).toBeNull()
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('college_signup_session')
      expect(console.error).toHaveBeenCalledWith(
        'Failed to retrieve session data:',
        expect.any(Error)
      )
    })
  })

  describe('clearSession', () => {
    it('should remove session data from storage', () => {
      sessionManager.clearSession()
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('college_signup_session')
    })

    it('should handle storage errors gracefully', () => {
      mockSessionStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => sessionManager.clearSession()).not.toThrow()
      expect(console.error).toHaveBeenCalledWith(
        'Failed to clear session data:',
        expect.any(Error)
      )
    })
  })

  describe('setStep and getStep', () => {
    it('should set and get current step', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      sessionManager.setStep('college-registration')

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'college_signup_session',
        expect.stringContaining('"step":"college-registration"')
      )
    })

    it('should return null if no session exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null)

      const result = sessionManager.getStep()
      expect(result).toBeNull()
    })
  })

  describe('hasValidSession', () => {
    it('should return true for valid session', () => {
      const validSession = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(validSession))

      expect(sessionManager.hasValidSession()).toBe(true)
    })

    it('should return false for expired session', () => {
      const expiredSession = {
        formData: mockFormData,
        timestamp: Date.now() - 60 * 60 * 1000,
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() - 30 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredSession))

      expect(sessionManager.hasValidSession()).toBe(false)
    })

    it('should return false if no session exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null)

      expect(sessionManager.hasValidSession()).toBe(false)
    })
  })

  describe('getTimeUntilExpiration', () => {
    it('should return correct time until expiration', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes from now
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      const timeRemaining = sessionManager.getTimeUntilExpiration()
      expect(timeRemaining).toBeGreaterThanOrEqual(14)
      expect(timeRemaining).toBeLessThanOrEqual(15)
    })

    it('should return 0 if no session exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null)

      expect(sessionManager.getTimeUntilExpiration()).toBe(0)
    })
  })

  describe('extendSession', () => {
    it('should extend session expiration time', () => {
      const sessionData = {
        formData: mockFormData,
        timestamp: Date.now(),
        step: 'college-selection' as SignupStep,
        expiresAt: Date.now() + 15 * 60 * 1000
      }

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(sessionData))

      const beforeExtension = Date.now()
      sessionManager.extendSession(45) // Extend by 45 minutes
      const afterExtension = Date.now()

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      expect(savedData.expiresAt).toBeGreaterThan(beforeExtension + 44 * 60 * 1000)
      expect(savedData.expiresAt).toBeLessThan(afterExtension + 46 * 60 * 1000)
    })
  })

  describe('custom configuration', () => {
    it('should use custom storage key and expiration', () => {
      const customManager = new SignupSessionManager({
        storageKey: 'custom_session',
        expirationMinutes: 60
      })

      customManager.saveFormData(mockFormData)

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'custom_session',
        expect.any(String)
      )

      const savedData = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1])
      const expectedExpiration = Date.now() + 60 * 60 * 1000
      expect(savedData.expiresAt).toBeGreaterThan(expectedExpiration - 1000)
      expect(savedData.expiresAt).toBeLessThan(expectedExpiration + 1000)
    })
  })

  describe('server-side rendering compatibility', () => {
    it('should handle undefined window gracefully', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      expect(() => sessionManager.saveFormData(mockFormData)).not.toThrow()
      expect(() => sessionManager.getFormData()).not.toThrow()
      expect(() => sessionManager.clearSession()).not.toThrow()

      global.window = originalWindow
    })
  })
})