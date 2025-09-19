/**
 * User experience tests for flow continuity and usability
 * Tests complete user journeys and interaction patterns
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import CollegeSignupPage from '../app/auth/signup/college/page'
import { signupSessionManager } from '../lib/services/signup-session'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('../app/providers')
jest.mock('../lib/supabase')
jest.mock('../lib/services/signup-session')

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
}

const mockAuth = {
  signUpCollege: jest.fn(),
  signInWithOAuth: jest.fn(),
  loading: false,
}

const mockColleges = [
  {
    id: 'college-1',
    name: 'University of California',
    location: { state: 'California', city: 'Los Angeles' }
  },
  {
    id: 'college-2',
    name: 'New York University',
    location: { state: 'New York', city: 'New York' }
  },
  {
    id: 'college-3',
    name: 'Harvard University',
    location: { state: 'Massachusetts', city: 'Cambridge' }
  }
]

describe('User Experience Flow Tests', () => {
  const mockSignupSessionManager = signupSessionManager as jest.Mocked<typeof signupSessionManager>

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    
    require('../app/providers').useAuth.mockReturnValue(mockAuth)
    
    require('../lib/supabase').supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: mockColleges,
            error: null
          }))
        }))
      }))
    })

    mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
      hasRecoverableData: false,
      sessionAge: 0,
      timeUntilExpiration: 30,
      isExpiringSoon: false,
      dataFields: []
    })
  })

  describe('Progressive Form Completion - Requirement 1.1', () => {
    test('should guide user through form completion with real-time feedback', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Create College Account')).toBeInTheDocument()
      })

      // Test progressive validation feedback
      const firstNameInput = screen.getByPlaceholderText('First name')
      
      // Start typing - should show no error initially
      await user.type(firstNameInput, 'J')
      expect(screen.queryByText(/First name must be at least 2 characters/)).not.toBeInTheDocument()

      // Complete field - should validate successfully
      await user.type(firstNameInput, 'ohn')
      await user.tab() // Trigger blur validation

      await waitFor(() => {
        expect(screen.queryByText(/First name must be at least 2 characters/)).not.toBeInTheDocument()
      })

      // Test email validation with typo detection
      const emailInput = screen.getByPlaceholderText('Enter your email')
      await user.type(emailInput, 'john@gmai.com')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/Did you mean gmail.com/)).toBeInTheDocument()
      })
    })

    test('should show form completion progress', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText('Create College Account')).toBeInTheDocument()
      })

      // Initially submit button should be disabled
      const submitButton = screen.getByRole('button', { name: /create college account/i })
      expect(submitButton).toBeDisabled()

      // Fill required fields progressively
      await user.type(screen.getByPlaceholderText('First name'), 'John')
      await user.type(screen.getByPlaceholderText('Last name'), 'Doe')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
      
      // Select college
      const collegeSelect = screen.getByRole('combobox')
      await user.click(collegeSelect)
      await user.click(screen.getByText('University of California'))

      await user.type(screen.getByPlaceholderText('Full name of contact person'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
      await user.type(screen.getByPlaceholderText('Create a password'), 'StrongPass123!')
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'StrongPass123!')

      // Submit button should now be enabled
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('College Search and Selection UX - Requirement 1.2', () => {
    test('should provide intuitive college search experience', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText('Select your college')).toBeInTheDocument()
      })

      // Test search functionality
      const searchInput = screen.getByPlaceholderText('Search colleges by name or location...')
      
      // Search by name
      await user.type(searchInput, 'Harvard')
      await waitFor(() => {
        expect(screen.getByText('Harvard University')).toBeInTheDocument()
        expect(screen.queryByText('University of California')).not.toBeInTheDocument()
      })

      // Clear search and search by location
      await user.clear(searchInput)
      await user.type(searchInput, 'California')
      await waitFor(() => {
        expect(screen.getByText('University of California')).toBeInTheDocument()
        expect(screen.queryByText('Harvard University')).not.toBeInTheDocument()
      })

      // Test no results scenario
      await user.clear(searchInput)
      await user.type(searchInput, 'NonexistentCollege')
      await waitFor(() => {
        expect(screen.getByText(/No colleges found matching "NonexistentCollege"/)).toBeInTheDocument()
      })
    })

    test('should handle keyboard navigation in college selection', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText('Select your college')).toBeInTheDocument()
      })

      const collegeSelect = screen.getByRole('combobox')
      
      // Open dropdown with keyboard
      await user.click(collegeSelect)
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      // Verify selection was made
      expect(mockSignupSessionManager.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          collegeId: expect.any(String)
        }),
        'college-selection'
      )
    })

    test('should provide clear call-to-action for new college registration', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText('Register New College')).toBeInTheDocument()
      })

      // Test register new college button
      const registerButton = screen.getByText('Register New College')
      expect(registerButton).toBeVisible()
      
      await user.click(registerButton)

      // Verify navigation occurs
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('/colleges/register?source=signup')
      )
    })
  })

  describe('Session Continuity and Recovery UX - Requirement 1.3', () => {
    test('should provide clear session recovery options', async () => {
      const user = userEvent.setup()
      
      // Mock recoverable session
      mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
        hasRecoverableData: true,
        sessionAge: 15,
        timeUntilExpiration: 10,
        isExpiringSoon: true,
        dataFields: ['firstName', 'lastName', 'email']
      })

      render(<CollegeSignupPage />)

      // Verify session recovery banner is shown
      await waitFor(() => {
        expect(screen.getByText(/restore your previous session/i)).toBeInTheDocument()
      })

      // Test restore action
      const restoreButton = screen.getByText(/restore/i)
      await user.click(restoreButton)

      // Verify session recovery was triggered
      expect(mockSignupSessionManager.getFormData).toHaveBeenCalled()

      // Test dismiss action
      mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
        hasRecoverableData: true,
        sessionAge: 15,
        timeUntilExpiration: 10,
        isExpiringSoon: true,
        dataFields: ['firstName', 'lastName', 'email']
      })

      render(<CollegeSignupPage />)

      const dismissButton = screen.getByText(/start fresh/i)
      await user.click(dismissButton)

      expect(mockSignupSessionManager.clearSession).toHaveBeenCalled()
    })

    test('should handle session expiration gracefully', async () => {
      // Mock expiring session
      mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
        hasRecoverableData: true,
        sessionAge: 25,
        timeUntilExpiration: 2,
        isExpiringSoon: true,
        dataFields: ['firstName', 'email']
      })

      render(<CollegeSignupPage />)

      // Verify expiration warning is shown
      await waitFor(() => {
        expect(screen.getByText(/session will expire soon/i)).toBeInTheDocument()
      })

      // Verify extend session option is available
      expect(screen.getByText(/extend session/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling and Recovery UX - Requirement 1.4', () => {
    test('should provide clear error messages and recovery options', async () => {
      const user = userEvent.setup()
      
      // Mock submission error
      mockAuth.signUpCollege.mockRejectedValue(new Error('Network Error'))

      render(<CollegeSignupPage />)

      // Fill and submit form
      await user.type(screen.getByPlaceholderText('First name'), 'John')
      await user.type(screen.getByPlaceholderText('Last name'), 'Doe')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
      
      const collegeSelect = screen.getByRole('combobox')
      await user.click(collegeSelect)
      await user.click(screen.getByText('University of California'))

      await user.type(screen.getByPlaceholderText('Full name of contact person'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
      await user.type(screen.getByPlaceholderText('Create a password'), 'StrongPass123!')
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'StrongPass123!')

      const submitButton = screen.getByRole('button', { name: /create college account/i })
      await user.click(submitButton)

      // Verify error message and recovery options are shown
      await waitFor(() => {
        expect(screen.getByText(/Connection problem/)).toBeInTheDocument()
        expect(screen.getByText('Retry Submission')).toBeInTheDocument()
      })
    })

    test('should handle validation errors with helpful guidance', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      // Enter invalid data
      await user.type(screen.getByPlaceholderText('First name'), 'A')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'invalid-email')
      await user.type(screen.getByPlaceholderText('Create a password'), 'weak')
      
      // Trigger validation
      await user.tab()

      // Verify helpful error messages
      await waitFor(() => {
        expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument()
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
        expect(screen.getByText(/Password must contain/)).toBeInTheDocument()
      })

      // Verify submit button remains disabled
      const submitButton = screen.getByRole('button', { name: /create college account/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Loading States and Feedback', () => {
    test('should show appropriate loading states', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      // Verify initial loading state for colleges
      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Test form submission loading state
      mockAuth.signUpCollege.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

      // Fill form and submit
      await user.type(screen.getByPlaceholderText('First name'), 'John')
      await user.type(screen.getByPlaceholderText('Last name'), 'Doe')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
      
      const collegeSelect = screen.getByRole('combobox')
      await user.click(collegeSelect)
      await user.click(screen.getByText('University of California'))

      await user.type(screen.getByPlaceholderText('Full name of contact person'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
      await user.type(screen.getByPlaceholderText('Create a password'), 'StrongPass123!')
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'StrongPass123!')

      const submitButton = screen.getByRole('button', { name: /create college account/i })
      await user.click(submitButton)

      // Verify loading state during submission
      expect(screen.getByText('Creating Account...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    test('should show success feedback after completion', async () => {
      const user = userEvent.setup()
      
      // Mock successful signup
      mockAuth.signUpCollege.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })

      render(<CollegeSignupPage />)

      // Fill and submit form
      await user.type(screen.getByPlaceholderText('First name'), 'John')
      await user.type(screen.getByPlaceholderText('Last name'), 'Doe')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
      
      const collegeSelect = screen.getByRole('combobox')
      await user.click(collegeSelect)
      await user.click(screen.getByText('University of California'))

      await user.type(screen.getByPlaceholderText('Full name of contact person'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
      await user.type(screen.getByPlaceholderText('Create a password'), 'StrongPass123!')
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'StrongPass123!')

      const submitButton = screen.getByRole('button', { name: /create college account/i })
      await user.click(submitButton)

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText('Account Created!')).toBeInTheDocument()
        expect(screen.getByText(/check your email to verify/)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility and Keyboard Navigation', () => {
    test('should support full keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText('Create College Account')).toBeInTheDocument()
      })

      // Test tab navigation through form fields
      await user.tab() // First name
      expect(screen.getByPlaceholderText('First name')).toHaveFocus()

      await user.tab() // Last name
      expect(screen.getByPlaceholderText('Last name')).toHaveFocus()

      await user.tab() // Email
      expect(screen.getByPlaceholderText('Enter your email')).toHaveFocus()

      // Test keyboard interaction with college selection
      await user.tab() // College selection
      const collegeSelect = screen.getByRole('combobox')
      expect(collegeSelect).toHaveFocus()

      // Open dropdown with Enter
      await user.keyboard('{Enter}')
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      // Verify selection was made
      expect(mockSignupSessionManager.saveFormData).toHaveBeenCalled()
    })

    test('should provide proper ARIA labels and descriptions', () => {
      render(<CollegeSignupPage />)

      // Verify form has proper accessibility attributes
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()

      // Verify required fields are properly marked
      const requiredFields = screen.getAllByRequired()
      expect(requiredFields.length).toBeGreaterThan(0)

      // Verify college selection has proper ARIA attributes
      const collegeSelect = screen.getByRole('combobox')
      expect(collegeSelect).toHaveAttribute('aria-label')
    })

    test('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      // Enter invalid data and trigger validation
      const emailInput = screen.getByPlaceholderText('Enter your email')
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      // Verify error message has proper ARIA attributes
      await waitFor(() => {
        const errorMessage = screen.getByText('Please enter a valid email address')
        expect(errorMessage).toHaveAttribute('role', 'alert')
      })
    })
  })

  describe('Mobile and Responsive Experience', () => {
    test('should handle touch interactions appropriately', async () => {
      const user = userEvent.setup()
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText('Create College Account')).toBeInTheDocument()
      })

      // Test touch interaction with college selection
      const collegeSelect = screen.getByRole('combobox')
      fireEvent.touchStart(collegeSelect)
      fireEvent.touchEnd(collegeSelect)

      // Verify dropdown opens
      await waitFor(() => {
        expect(screen.getByText('University of California')).toBeInTheDocument()
      })
    })

    test('should maintain usability on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })

      render(<CollegeSignupPage />)

      // Verify form is still usable
      expect(screen.getByText('Create College Account')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('First name')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })
})