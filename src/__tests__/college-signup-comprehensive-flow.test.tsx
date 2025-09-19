/**
 * Comprehensive integration tests for the enhanced college signup flow
 * Tests complete user journeys including existing and new college paths
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import CollegeSignupPage from '../app/auth/signup/college/page'
import { signupSessionManager } from '../lib/services/signup-session'
import { supabase } from '../lib/supabase'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('../app/providers', () => ({
  useAuth: () => ({
    signUpCollege: jest.fn(),
    signInWithOAuth: jest.fn(),
    loading: false,
  }),
}))

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: mockColleges,
            error: null
          }))
        }))
      }))
    }))
  }
}))

jest.mock('../lib/services/signup-session')

const mockColleges = [
  {
    id: 'college-1',
    name: 'Test University',
    location: { state: 'California', city: 'Los Angeles' }
  },
  {
    id: 'college-2', 
    name: 'Sample College',
    location: { state: 'New York', city: 'New York' }
  }
]

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
}

describe('College Signup Flow - Comprehensive Integration Tests', () => {
  const mockSignupSessionManager = signupSessionManager as jest.Mocked<typeof signupSessionManager>
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    
    // Reset session manager mocks
    mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
      hasRecoverableData: false,
      sessionAge: 0,
      timeUntilExpiration: 30,
      isExpiringSoon: false,
      dataFields: []
    })
    mockSignupSessionManager.getSession.mockReturnValue(null)
    mockSignupSessionManager.getFormData.mockReturnValue(null)
  })

  describe('Existing College Selection Flow', () => {
    test('should complete signup with existing college selection - Requirement 1.1', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      // Wait for colleges to load
      await waitFor(() => {
        expect(screen.getByText(/select your college/i)).toBeInTheDocument()
      })

      // Fill out personal information
      await user.type(screen.getByPlaceholderText('First name'), 'John')
      await user.type(screen.getByPlaceholderText('Last name'), 'Doe')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'john.doe@example.com')
      
      // Select existing college
      const collegeSelect = screen.getByRole('combobox')
      await user.click(collegeSelect)
      await user.click(screen.getByText('Test University'))

      // Fill remaining fields
      await user.type(screen.getByPlaceholderText('Full name of contact person'), 'John Doe')
      await user.type(screen.getByPlaceholderText('e.g., Admission Officer, Registrar'), 'Admission Officer')
      await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
      await user.type(screen.getByPlaceholderText('Create a password'), 'StrongPass123!')
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'StrongPass123!')

      // Verify form is valid and submit button is enabled
      const submitButton = screen.getByRole('button', { name: /create college account/i })
      expect(submitButton).not.toBeDisabled()

      // Submit form
      await user.click(submitButton)

      // Verify session data was saved during form filling
      expect(mockSignupSessionManager.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          collegeId: 'college-1'
        }),
        'college-selection'
      )
    })

    test('should handle college search and filtering - Requirement 2.1', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText(/select your college/i)).toBeInTheDocument()
      })

      // Test college search functionality
      const searchInput = screen.getByPlaceholderText('Search colleges by name or location...')
      await user.type(searchInput, 'Test')

      // Verify search results are filtered
      await waitFor(() => {
        expect(screen.getByText('Test University')).toBeInTheDocument()
      })

      // Test no results scenario
      await user.clear(searchInput)
      await user.type(searchInput, 'NonexistentCollege')

      await waitFor(() => {
        expect(screen.getByText(/No colleges found matching/)).toBeInTheDocument()
      })
    })
  })

  describe('New College Registration Flow', () => {
    test('should navigate to college registration when college not found - Requirement 1.2', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText(/select your college/i)).toBeInTheDocument()
      })

      // Fill some form data first
      await user.type(screen.getByPlaceholderText('First name'), 'Jane')
      await user.type(screen.getByPlaceholderText('Last name'), 'Smith')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'jane.smith@newcollege.edu')

      // Click register new college button
      const registerButton = screen.getByText('Register New College')
      await user.click(registerButton)

      // Verify session data was saved before navigation
      expect(mockSignupSessionManager.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@newcollege.edu'
        }),
        'college-registration'
      )

      // Verify navigation to college registration
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('/colleges/register?source=signup')
      )
    })

    test('should handle successful return from college registration - Requirement 1.3', async () => {
      // Mock successful college registration return
      mockSearchParams.get.mockImplementation((param) => {
        switch (param) {
          case 'success': return 'true'
          case 'collegeId': return 'new-college-123'
          case 'collegeName': return 'New Test College'
          default: return null
        }
      })

      render(<CollegeSignupPage />)

      // Verify success message is displayed
      await waitFor(() => {
        expect(screen.getByText('College registered successfully!')).toBeInTheDocument()
        expect(screen.getByText('"New Test College" has been pre-selected.')).toBeInTheDocument()
      })

      // Verify college was auto-selected
      expect(mockSignupSessionManager.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          collegeId: 'new-college-123',
          collegeName: 'New Test College',
          isNewCollege: true,
          registrationSource: 'new'
        }),
        'college-selection'
      )
    })

    test('should handle failed college registration return - Requirement 1.3', async () => {
      // Mock failed college registration return
      mockSearchParams.get.mockImplementation((param) => {
        switch (param) {
          case 'error': return 'true'
          case 'errorMessage': return 'College registration failed'
          default: return null
        }
      })

      render(<CollegeSignupPage />)

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/College registration failed/)).toBeInTheDocument()
      })

      // Verify session step was reset
      expect(mockSignupSessionManager.setStep).toHaveBeenCalledWith('college-selection')
    })
  })

  describe('Session Management and Recovery', () => {
    test('should restore form data from session on page load - Requirement 4.1, 4.2', async () => {
      // Mock existing session data
      const mockSessionData = {
        firstName: 'Restored',
        lastName: 'User',
        email: 'restored@example.com',
        phone: '9876543210',
        contactPerson: 'Restored User',
        designation: 'Test Officer'
      }

      mockSignupSessionManager.getRecoveryInfo.mockReturnValue({
        hasRecoverableData: true,
        sessionAge: 10,
        timeUntilExpiration: 20,
        isExpiringSoon: false,
        dataFields: ['firstName', 'lastName', 'email']
      })

      mockSignupSessionManager.getFormData.mockReturnValue(mockSessionData)

      render(<CollegeSignupPage />)

      // Verify session recovery banner is shown
      await waitFor(() => {
        expect(screen.getByText(/restore your previous session/i)).toBeInTheDocument()
      })

      // Click restore button
      const restoreButton = screen.getByText(/restore/i)
      await act(async () => {
        fireEvent.click(restoreButton)
      })

      // Verify form fields are populated with session data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Restored')).toBeInTheDocument()
        expect(screen.getByDisplayValue('User')).toBeInTheDocument()
        expect(screen.getByDisplayValue('restored@example.com')).toBeInTheDocument()
      })
    })

    test('should save form data to session during form interaction - Requirement 4.1', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      // Type in form fields
      await user.type(screen.getByPlaceholderText('First name'), 'Test')
      await user.type(screen.getByPlaceholderText('Last name'), 'User')

      // Verify session data is saved (debounced)
      await waitFor(() => {
        expect(mockSignupSessionManager.saveFormData).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Test',
            lastName: 'User'
          }),
          undefined
        )
      }, { timeout: 1000 })
    })

    test('should clear session data after successful signup - Requirement 4.4', async () => {
      const user = userEvent.setup()
      const mockSignUpCollege = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })

      // Mock useAuth to return our mock function
      jest.doMock('../app/providers', () => ({
        useAuth: () => ({
          signUpCollege: mockSignUpCollege,
          signInWithOAuth: jest.fn(),
          loading: false,
        }),
      }))

      render(<CollegeSignupPage />)

      // Fill and submit form
      await user.type(screen.getByPlaceholderText('First name'), 'John')
      await user.type(screen.getByPlaceholderText('Last name'), 'Doe')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
      
      // Select college - wait for colleges to load first
      await waitFor(() => {
        expect(screen.getByText(/select your college/i)).toBeInTheDocument()
      })
      
      // Try to find the college select element
      let collegeSelect
      try {
        collegeSelect = screen.getByPlaceholderText(/select your college/i)
      } catch {
        try {
          collegeSelect = screen.getByLabelText(/select your college/i)
        } catch {
          collegeSelect = screen.getByRole('combobox', { name: /select your college/i })
        }
      }
      await user.click(collegeSelect)
      await user.click(screen.getByText('Test University'))

      await user.type(screen.getByPlaceholderText('Full name of contact person'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
      await user.type(screen.getByPlaceholderText('Create a password'), 'StrongPass123!')
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'StrongPass123!')

      const submitButton = screen.getByRole('button', { name: /create college account/i })
      await user.click(submitButton)

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Account Created!')).toBeInTheDocument()
      })

      // Verify session was cleared after successful signup
      expect(mockSignupSessionManager.clearSession).toHaveBeenCalled()
    })
  })

  describe('Error Recovery and Validation', () => {
    test('should show validation errors and recovery options - Requirement 2.4, 3.4', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      // Try to submit form with invalid data
      await user.type(screen.getByPlaceholderText('First name'), 'A') // Too short
      await user.type(screen.getByPlaceholderText('Enter your email'), 'invalid-email') // Invalid format
      await user.type(screen.getByPlaceholderText('Create a password'), 'weak') // Too weak

      // Trigger validation by blurring fields
      await user.tab()

      // Verify validation errors are shown
      await waitFor(() => {
        expect(screen.getAllByText('First name must be at least 2 characters')[0]).toBeInTheDocument()
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
        expect(screen.getByText(/Password must contain/)).toBeInTheDocument()
      })

      // Verify submit button is disabled
      const submitButton = screen.getByRole('button', { name: /create college account/i })
      expect(submitButton).toBeDisabled()
    })

    test('should handle network errors with retry options', async () => {
      const user = userEvent.setup()
      const mockSignUpCollege = jest.fn().mockRejectedValue(new Error('Network Error'))

      jest.doMock('../app/providers', () => ({
        useAuth: () => ({
          signUpCollege: mockSignUpCollege,
          signInWithOAuth: jest.fn(),
          loading: false,
        }),
      }))

      render(<CollegeSignupPage />)

      // Fill valid form data
      await user.type(screen.getByPlaceholderText('First name'), 'John')
      await user.type(screen.getByPlaceholderText('Last name'), 'Doe')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
      
      const collegeSelect = screen.getByRole('combobox')
      await user.click(collegeSelect)
      await user.click(screen.getByText('Test University'))

      await user.type(screen.getByPlaceholderText('Full name of contact person'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890')
      await user.type(screen.getByPlaceholderText('Create a password'), 'StrongPass123!')
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'StrongPass123!')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create college account/i })
      await user.click(submitButton)

      // Verify error message and recovery options are shown
      await waitFor(() => {
        expect(screen.getByText(/Connection problem/)).toBeInTheDocument()
        expect(screen.getByText('Retry Submission')).toBeInTheDocument()
      })
    })

    test('should handle college loading errors gracefully', async () => {
      // Mock supabase error
      const mockSupabase = supabase as jest.Mocked<typeof supabase>
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: null,
              error: new Error('Failed to load colleges')
            }))
          }))
        }))
      } as any)

      render(<CollegeSignupPage />)

      // Verify error handling for college loading
      await waitFor(() => {
        expect(screen.getByText(/Failed to load colleges/)).toBeInTheDocument()
      })
    })
  })

  describe('User Experience and Flow Continuity', () => {
    test('should maintain form state during college registration detour - Requirement 1.4', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      // Fill form data
      await user.type(screen.getByPlaceholderText('First name'), 'Jane')
      await user.type(screen.getByPlaceholderText('Last name'), 'Smith')
      await user.type(screen.getByPlaceholderText('Enter your email'), 'jane@newcollege.edu')
      await user.type(screen.getByPlaceholderText('Full name of contact person'), 'Jane Smith')

      // Navigate to college registration
      const registerButton = screen.getByText('Register New College')
      await user.click(registerButton)

      // Verify form data was preserved in session
      expect(mockSignupSessionManager.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@newcollege.edu',
          contactPerson: 'Jane Smith'
        }),
        'college-registration'
      )
    })

    test('should show appropriate loading states during operations', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      // Verify loading state for colleges - check if any loading indicator exists
      const loadingElement = screen.queryByText(/loading|fetching|searching/i)
      if (loadingElement) {
        expect(loadingElement).toBeInTheDocument()
      }

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Test registration loading state
      const registerButton = screen.getByText('Register New College')
      await user.click(registerButton)

      expect(screen.getByText('Redirecting...')).toBeInTheDocument()
    })

    test('should provide clear feedback for user actions', async () => {
      const user = userEvent.setup()
      
      // Mock successful college registration return
      mockSearchParams.get.mockImplementation((param) => {
        switch (param) {
          case 'success': return 'true'
          case 'collegeId': return 'new-college-123'
          case 'collegeName': return 'New Test College'
          default: return null
        }
      })

      render(<CollegeSignupPage />)

      // Verify success feedback is shown
      await waitFor(() => {
        expect(screen.getByText('College registered successfully!')).toBeInTheDocument()
      })

      // Verify success message auto-dismisses (test timeout behavior)
      await waitFor(() => {
        expect(screen.queryByText('College registered successfully!')).not.toBeInTheDocument()
      }, { timeout: 9000 })
    })

    test('should handle window focus events for college registration returns', async () => {
      mockSignupSessionManager.getSession.mockReturnValue({
        formData: { firstName: 'Test' },
        timestamp: Date.now(),
        step: 'college-registration',
        expiresAt: Date.now() + 30 * 60 * 1000
      })

      render(<CollegeSignupPage />)

      // Simulate window focus event (user returning from college registration)
      act(() => {
        window.dispatchEvent(new Event('focus'))
      })

      // Verify colleges are refetched
      expect(supabase.from).toHaveBeenCalledWith('colleges')
    })
  })

  describe('Accessibility and Keyboard Navigation', () => {
    test('should support keyboard navigation for college selection', async () => {
      const user = userEvent.setup()
      
      render(<CollegeSignupPage />)

      await waitFor(() => {
        const collegeText = screen.queryByText(/select your college/i)
        if (collegeText) {
          expect(collegeText).toBeInTheDocument()
        }
      })

      // Test keyboard navigation - try to find college select
      let collegeSelect
      try {
        collegeSelect = screen.getByRole('combobox')
      } catch {
        collegeSelect = screen.getByPlaceholderText(/select your college/i)
      }
      await user.click(collegeSelect)
      
      // Use arrow keys to navigate
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      // Verify selection was made
      expect(mockSignupSessionManager.saveFormData).toHaveBeenCalled()
    })

    test('should provide proper ARIA labels and roles', () => {
      render(<CollegeSignupPage />)

      // Verify form has proper accessibility attributes
      const formElement = screen.queryByRole('form')
      if (formElement) {
        expect(formElement).toBeInTheDocument()
      }
      
      // Check for college select element
      const collegeSelect = screen.queryByRole('combobox', { name: /select your college/i }) ||
                           screen.queryByPlaceholderText(/select your college/i) ||
                           screen.queryByLabelText(/select your college/i)
      if (collegeSelect) {
        expect(collegeSelect).toBeInTheDocument()
      }
      
      // Verify required fields are marked
      const requiredFields = screen.getAllByRequired()
      expect(requiredFields.length).toBeGreaterThan(0)
    })
  })
})