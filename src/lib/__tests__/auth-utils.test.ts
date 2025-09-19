/**
 * Tests for authentication utilities
 */
import {
  hasRole,
  isAuthenticated,
  hasCompleteProfile,
  getUserDisplayName,
  getUserInitials,
  getDashboardUrl,
  isProtectedRoute,
  getRequiredRole,
  AuthErrorType,
  parseAuthError,
  getAuthErrorMessage,
  isValidEmail,
  isValidPassword,
  getPasswordStrength,
} from '@/lib/auth-utils'

// Mock user profile for testing
const mockProfile = {
  id: '123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  role: 'student' as const,
  is_verified: true,
}

const mockUser = {
  id: '123',
  email: 'test@example.com',
  user_metadata: {},
} as any

const mockSession = {
  access_token: 'token',
  expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  user: mockUser,
} as any

describe('Authentication Utilities', () => {
  describe('hasRole', () => {
    it('should return true for matching role', () => {
      expect(hasRole(mockProfile, 'student')).toBe(true)
    })

    it('should return false for non-matching role', () => {
      expect(hasRole(mockProfile, 'admin')).toBe(false)
    })

    it('should return false for null profile', () => {
      expect(hasRole(null, 'student')).toBe(false)
    })

    it('should return false for undefined profile', () => {
      expect(hasRole(undefined, 'student')).toBe(false)
    })

    it('should handle all role types', () => {
      const adminProfile = { ...mockProfile, role: 'admin' as const }
      const collegeProfile = { ...mockProfile, role: 'college' as const }

      expect(hasRole(adminProfile, 'admin')).toBe(true)
      expect(hasRole(collegeProfile, 'college')).toBe(true)
      expect(hasRole(adminProfile, 'student')).toBe(false)
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when user and session exist', () => {
      expect(isAuthenticated(mockUser, mockSession)).toBe(true)
    })

    it('should return false when user is null', () => {
      expect(isAuthenticated(null, mockSession)).toBe(false)
    })

    it('should return false when session is null', () => {
      expect(isAuthenticated(mockUser, null)).toBe(false)
    })

    it('should return false when both are null', () => {
      expect(isAuthenticated(null, null)).toBe(false)
    })

    it('should return false when user is undefined', () => {
      expect(isAuthenticated(undefined, mockSession)).toBe(false)
    })

    it('should return false when session is undefined', () => {
      expect(isAuthenticated(mockUser, undefined)).toBe(false)
    })
  })

  describe('hasCompleteProfile', () => {
    it('should return true for complete profile', () => {
      expect(hasCompleteProfile(mockProfile)).toBe(true)
    })

    it('should return false for null profile', () => {
      expect(hasCompleteProfile(null)).toBe(false)
    })

    it('should return false for undefined profile', () => {
      expect(hasCompleteProfile(undefined)).toBe(false)
    })

    it('should return false for profile missing first_name', () => {
      const incompleteProfile = { ...mockProfile, first_name: '' }
      expect(hasCompleteProfile(incompleteProfile)).toBe(false)
    })

    it('should return false for profile missing last_name', () => {
      const incompleteProfile = { ...mockProfile, last_name: '' }
      expect(hasCompleteProfile(incompleteProfile)).toBe(false)
    })

    it('should return false for profile missing role', () => {
      const incompleteProfile = { ...mockProfile, role: undefined as any }
      expect(hasCompleteProfile(incompleteProfile)).toBe(false)
    })

    it('should return true for profile with email (email not required for completeness)', () => {
      const profileWithoutEmail = { ...mockProfile, email: '' }
      expect(hasCompleteProfile(profileWithoutEmail)).toBe(true)
    })
  })

  describe('getUserDisplayName', () => {
    it('should return full name when both names exist', () => {
      expect(getUserDisplayName(mockProfile)).toBe('John Doe')
    })

    it('should return first name only when last name is missing', () => {
      const profile = { ...mockProfile, last_name: '' }
      expect(getUserDisplayName(profile)).toBe('John')
    })

    it('should return last name only when first name is missing', () => {
      const profile = { ...mockProfile, first_name: '' }
      expect(getUserDisplayName(profile)).toBe('Doe')
    })

    it('should return email when names are missing', () => {
      const profile = { ...mockProfile, first_name: '', last_name: '' }
      expect(getUserDisplayName(profile)).toBe('test@example.com')
    })

    it('should return "User" for null profile', () => {
      expect(getUserDisplayName(null)).toBe('User')
    })

    it('should return "User" for undefined profile', () => {
      expect(getUserDisplayName(undefined)).toBe('User')
    })

    it('should handle whitespace in names (current implementation)', () => {
      const profile = { ...mockProfile, first_name: '  John  ', last_name: '  Doe  ' }
      expect(getUserDisplayName(profile)).toBe('  John     Doe  ')
    })

    it('should return whitespace when names are only whitespace (current implementation)', () => {
      const profile = { ...mockProfile, first_name: '   ', last_name: '   ' }
      expect(getUserDisplayName(profile)).toBe('       ')
    })
  })

  describe('getUserInitials', () => {
    it('should return initials from first and last name', () => {
      expect(getUserInitials(mockProfile)).toBe('JD')
    })

    it('should return first letter of first name only', () => {
      const profile = { ...mockProfile, last_name: '' }
      expect(getUserInitials(profile)).toBe('J')
    })

    it('should return first letter of last name only', () => {
      const profile = { ...mockProfile, first_name: '' }
      expect(getUserInitials(profile)).toBe('D')
    })

    it('should return first letter of email when names are missing', () => {
      const profile = { ...mockProfile, first_name: '', last_name: '' }
      expect(getUserInitials(profile)).toBe('T')
    })

    it('should return "U" for null profile', () => {
      expect(getUserInitials(null)).toBe('U')
    })

    it('should return "U" for undefined profile', () => {
      expect(getUserInitials(undefined)).toBe('U')
    })

    it('should handle lowercase names', () => {
      const profile = { ...mockProfile, first_name: 'john', last_name: 'doe' }
      expect(getUserInitials(profile)).toBe('JD')
    })

    it('should handle names with spaces (current implementation)', () => {
      const profile = { ...mockProfile, first_name: '  John  ', last_name: '  Doe  ' }
      expect(getUserInitials(profile)).toBe('  ')
    })

    it('should handle special characters in email', () => {
      const profile = { ...mockProfile, first_name: '', last_name: '', email: '123test@example.com' }
      expect(getUserInitials(profile)).toBe('1')
    })
  })

  describe('getDashboardUrl', () => {
    it('should return admin path for admin role', () => {
      const adminProfile = { ...mockProfile, role: 'admin' as const }
      expect(getDashboardUrl(adminProfile)).toBe('/admin')
    })

    it('should return college dashboard for college role', () => {
      const collegeProfile = { ...mockProfile, role: 'college' as const }
      expect(getDashboardUrl(collegeProfile)).toBe('/colleges/dashboard')
    })

    it('should return student dashboard for student role', () => {
      expect(getDashboardUrl(mockProfile)).toBe('/dashboard')
    })

    it('should return student dashboard for null profile', () => {
      expect(getDashboardUrl(null)).toBe('/dashboard')
    })

    it('should return student dashboard for undefined profile', () => {
      expect(getDashboardUrl(undefined)).toBe('/dashboard')
    })

    it('should return student dashboard for unknown role', () => {
      const unknownProfile = { ...mockProfile, role: 'unknown' as any }
      expect(getDashboardUrl(unknownProfile)).toBe('/dashboard')
    })
  })

  describe('isProtectedRoute', () => {
    it('should return true for protected routes', () => {
      const protectedRoutes = ['/dashboard', '/admin', '/colleges/dashboard', '/quiz', '/timeline', '/scholarships']
      
      protectedRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(true)
      })
    })

    it('should return false for public routes', () => {
      const publicRoutes = ['/', '/about', '/contact', '/auth/login', '/auth/signup']
      
      publicRoutes.forEach(route => {
        expect(isProtectedRoute(route)).toBe(false)
      })
    })

    it('should handle sub-routes correctly', () => {
      expect(isProtectedRoute('/dashboard/settings')).toBe(true)
      expect(isProtectedRoute('/admin/users')).toBe(true)
      expect(isProtectedRoute('/colleges/dashboard/stats')).toBe(true)
    })
  })

  describe('getRequiredRole', () => {
    it('should return admin for admin routes', () => {
      expect(getRequiredRole('/admin')).toBe('admin')
      expect(getRequiredRole('/admin/users')).toBe('admin')
    })

    it('should return college for college routes', () => {
      expect(getRequiredRole('/colleges/dashboard')).toBe('college')
      expect(getRequiredRole('/colleges/dashboard/stats')).toBe('college')
    })

    it('should return student for student-specific routes', () => {
      expect(getRequiredRole('/quiz')).toBe('student')
      expect(getRequiredRole('/timeline')).toBe('student')
    })

    it('should return null for general routes', () => {
      expect(getRequiredRole('/dashboard')).toBe(null)
      expect(getRequiredRole('/')).toBe(null)
      expect(getRequiredRole('/about')).toBe(null)
    })
  })

  describe('parseAuthError', () => {
    it('should parse session expired errors', () => {
      const error = new Error('Session expired')
      const result = parseAuthError(error)
      expect(result.type).toBe(AuthErrorType.SESSION_EXPIRED)
      expect(result.userMessage).toContain('expired')
    })

    it('should parse permission errors', () => {
      const error = new Error('Access denied')
      const result = parseAuthError(error)
      expect(result.type).toBe(AuthErrorType.INSUFFICIENT_PERMISSIONS)
      expect(result.userMessage).toContain('permission')
    })

    it('should parse network errors', () => {
      const error = new Error('Network connection failed')
      const result = parseAuthError(error)
      expect(result.type).toBe(AuthErrorType.NETWORK_ERROR)
      expect(result.userMessage).toContain('Network')
    })

    it('should return unknown for unrecognized errors', () => {
      const error = new Error('Something went wrong')
      const result = parseAuthError(error)
      expect(result.type).toBe(AuthErrorType.UNKNOWN_ERROR)
      expect(result.userMessage).toContain('unexpected')
    })

    it('should handle null/undefined errors', () => {
      const nullResult = parseAuthError(null)
      expect(nullResult.type).toBe(AuthErrorType.UNKNOWN_ERROR)
      
      const undefinedResult = parseAuthError(undefined)
      expect(undefinedResult.type).toBe(AuthErrorType.UNKNOWN_ERROR)
    })

    it('should parse invalid credentials errors', () => {
      const error = new Error('Invalid login credentials')
      const result = parseAuthError(error)
      expect(result.type).toBe(AuthErrorType.INVALID_CREDENTIALS)
      expect(result.userMessage).toContain('Invalid email or password')
    })

    it('should parse email not confirmed errors', () => {
      const error = new Error('Email not confirmed')
      const result = parseAuthError(error)
      expect(result.type).toBe(AuthErrorType.EMAIL_NOT_CONFIRMED)
      expect(result.userMessage).toContain('confirmation link')
    })
  })

  describe('Validation helpers', () => {
    describe('isValidEmail', () => {
      it('should validate correct email formats', () => {
        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
        expect(isValidEmail('user+tag@example.org')).toBe(true)
      })

      it('should reject invalid email formats', () => {
        expect(isValidEmail('invalid-email')).toBe(false)
        expect(isValidEmail('test@')).toBe(false)
        expect(isValidEmail('@example.com')).toBe(false)
        expect(isValidEmail('test.example.com')).toBe(false)
      })
    })

    describe('isValidPassword', () => {
      it('should validate strong passwords', () => {
        expect(isValidPassword('Password123')).toBe(true)
        expect(isValidPassword('MySecure1Pass')).toBe(true)
      })

      it('should reject weak passwords', () => {
        expect(isValidPassword('password')).toBe(false) // no uppercase or number
        expect(isValidPassword('PASSWORD')).toBe(false) // no lowercase or number
        expect(isValidPassword('Password')).toBe(false) // no number
        expect(isValidPassword('Pass1')).toBe(false) // too short
      })
    })

    describe('getPasswordStrength', () => {
      it('should return weak for short passwords', () => {
        expect(getPasswordStrength('pass')).toBe('weak')
        expect(getPasswordStrength('12345')).toBe('weak')
      })

      it('should return medium for moderate passwords', () => {
        expect(getPasswordStrength('password123')).toBe('medium')
        expect(getPasswordStrength('Password')).toBe('medium')
      })

      it('should return strong for complex passwords', () => {
        expect(getPasswordStrength('Password123')).toBe('strong')
        expect(getPasswordStrength('MySecure1Pass!')).toBe('strong')
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle profiles with null values', () => {
      const profileWithNulls = {
        ...mockProfile,
        first_name: null as any,
        last_name: null as any,
      }

      expect(hasCompleteProfile(profileWithNulls)).toBe(false)
      expect(getUserDisplayName(profileWithNulls)).toBe('test@example.com')
      expect(getUserInitials(profileWithNulls)).toBe('T')
    })

    it('should handle empty string email (current implementation)', () => {
      const profileWithEmptyEmail = { ...mockProfile, email: '' }
      expect(getUserDisplayName(profileWithEmptyEmail)).toBe('John Doe')
      expect(getUserInitials(profileWithEmptyEmail)).toBe('JD')
    })

    it('should handle very long names', () => {
      const longName = 'A'.repeat(100)
      const profileWithLongNames = {
        ...mockProfile,
        first_name: longName,
        last_name: longName,
      }

      expect(getUserDisplayName(profileWithLongNames)).toBe(`${longName} ${longName}`)
      expect(getUserInitials(profileWithLongNames)).toBe('AA')
    })

    it('should handle special characters in names', () => {
      const profileWithSpecialChars = {
        ...mockProfile,
        first_name: 'José',
        last_name: "O'Connor",
      }

      expect(getUserDisplayName(profileWithSpecialChars)).toBe("José O'Connor")
      expect(getUserInitials(profileWithSpecialChars)).toBe('JO')
    })

    it('should handle password strength validation', () => {
      expect(getPasswordStrength('weak')).toBe('weak')
      expect(getPasswordStrength('Password1')).toBe('strong')
      expect(getPasswordStrength('password123')).toBe('medium')
    })
  })
})