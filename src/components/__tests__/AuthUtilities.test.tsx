/**
 * Tests for authentication utilities and helpers
 * These tests verify that the new authentication components work correctly
 */

import React from 'react'
import { hasRole, isAuthenticated, hasCompleteProfile, getUserDisplayName, getUserInitials } from '@/lib/auth-utils'

// Mock user profile for testing
const mockProfile = {
    id: '123',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'student' as const,
    is_verified: true
}

const mockUser = {
    id: '123',
    email: 'test@example.com'
} as any

const mockSession = {
    access_token: 'token',
    expires_at: Date.now() + 3600000
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
    })

    describe('hasCompleteProfile', () => {
        it('should return true for complete profile', () => {
            expect(hasCompleteProfile(mockProfile)).toBe(true)
        })

        it('should return false for null profile', () => {
            expect(hasCompleteProfile(null)).toBe(false)
        })

        it('should return false for incomplete profile', () => {
            const incompleteProfile = { ...mockProfile, first_name: '' }
            expect(hasCompleteProfile(incompleteProfile)).toBe(false)
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

        it('should return email when names are missing', () => {
            const profile = { ...mockProfile, first_name: '', last_name: '' }
            expect(getUserDisplayName(profile)).toBe('test@example.com')
        })

        it('should return "User" for null profile', () => {
            expect(getUserDisplayName(null)).toBe('User')
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

        it('should return first letter of email when names are missing', () => {
            const profile = { ...mockProfile, first_name: '', last_name: '' }
            expect(getUserInitials(profile)).toBe('T')
        })

        it('should return "U" for null profile', () => {
            expect(getUserInitials(null)).toBe('U')
        })
    })
})

// Component tests would require proper test setup with React Testing Library
// For now, we'll just verify the components can be imported
describe('Authentication Components', () => {
    it('should be able to import all authentication components', () => {
        // These imports should not throw errors
        const AuthGuard = require('@/components/AuthGuard').AuthGuard
        const AuthLoading = require('@/components/AuthLoading').AuthLoading
        const AuthStatus = require('@/components/AuthStatus').AuthStatus
        const withAuth = require('@/components/withAuth').withAuth
        const AuthErrorBoundary = require('@/components/AuthErrorBoundary').AuthErrorBoundary

        expect(AuthGuard).toBeDefined()
        expect(AuthLoading).toBeDefined()
        expect(AuthStatus).toBeDefined()
        expect(withAuth).toBeDefined()
        expect(AuthErrorBoundary).toBeDefined()
    })
})