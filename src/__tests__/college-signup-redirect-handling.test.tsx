/**
 * Tests for college signup redirect handling and URL parameter processing
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import CollegeSignupPage from '@/app/auth/signup/college/page'
import { signupSessionManager } from '@/lib/services/signup-session'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock auth provider
jest.mock('@/app/providers', () => ({
  useAuth: () => ({
    signUpCollege: jest.fn(),
    signInWithOAuth: jest.fn(),
    loading: false,
  }),
}))

// Mock Supabase
const mockColleges = [
  { id: '1', name: 'Test College', location: { state: 'Test State', city: 'Test City' } },
  { id: 'new-college-123', name: 'New Test College', location: { state: 'New State', city: 'New City' } }
]

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: mockColleges,
            error: null
          }))
        }))
      }))
    }))
  }
}))

// Mock signup session manager
jest.mock('@/lib/services/signup-session', () => ({
  signupSessionManager: {
    getFormData: jest.fn(),
    getSession: jest.fn(),
    saveFormData: jest.fn(),
    setStep: jest.fn(),
    clearSession: jest.fn(),
  }
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
}

describe('College Signup Redirect Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(signupSessionManager.getFormData as jest.Mock).mockReturnValue(null)
    ;(signupSessionManager.getSession as jest.Mock).mockReturnValue(null)
    
    // Mock window.history.replaceState
    Object.defineProperty(window, 'history', {
      value: {
        replaceState: jest.fn(),
      },
      writable: true,
    })
  })

  describe('Successful College Registration Return', () => {
    it('should handle successful college registration return with URL parameters', async () => {
      // Mock URL parameters for successful return
      mockSearchParams.get.mockImplementation((param: string) => {
        switch (param) {
          case 'success': return 'true'
          case 'collegeId': return 'new-college-123'
          case 'collegeName': return 'New Test College'
          default: return null
        }
      })

      render(<CollegeSignupPage />)

      // Wait for component to process URL parameters
      await waitFor(() => {
        expect(screen.getByText(/College registered successfully!/)).toBeInTheDocument()
      })

      // Verify success message shows college name
      expect(screen.getByText(/College registered successfully!/)).toBeInTheDocument()
      expect(screen.getByText(/has been pre-selected/)).toBeInTheDocument()

      // Verify session manager was called to save the new college data
      expect(signupSessionManager.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          collegeId: 'new-college-123',
          collegeName: 'New Test College',
          isNewCollege: true,
          registrationSource: 'new'
        }),
        'college-selection'
      )

      // Verify URL parameters were cleared
      expect(window.history.replaceState).toHaveBeenCalledWith({}, '', window.location.pathname)
    })

    it('should auto-select the newly registered college in the form', async () => {
      mockSearchParams.get.mockImplementation((param: string) => {
        switch (param) {
          case 'success': return 'true'
          case 'collegeId': return 'new-college-123'
          case 'collegeName': return 'New Test College'
          default: return null
        }
      })

      render(<CollegeSignupPage />)

      await waitFor(() => {
        // The college should be auto-selected in the form - check the trigger button text
        const collegeSelectButton = screen.getByRole('button', { name: /Select your college/ })
        expect(collegeSelectButton).toHaveTextContent('New Test College')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle college registration errors from URL parameters', async () => {
      mockSearchParams.get.mockImplementation((param: string) => {
        switch (param) {
          case 'error': return 'true'
          case 'errorMessage': return 'Registration failed due to duplicate name'
          default: return null
        }
      })

      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText(/Registration failed due to duplicate name/)).toBeInTheDocument()
      })

      // Verify session step was reset
      expect(signupSessionManager.setStep).toHaveBeenCalledWith('college-selection')

      // Verify URL parameters were cleared
      expect(window.history.replaceState).toHaveBeenCalledWith({}, '', window.location.pathname)
    })

    it('should handle incomplete registration return', async () => {
      mockSearchParams.get.mockImplementation((param: string) => {
        switch (param) {
          case 'returned': return 'true'
          default: return null
        }
      })

      // Mock session data indicating user was in registration flow
      ;(signupSessionManager.getSession as jest.Mock).mockReturnValue({
        step: 'college-registration',
        formData: {},
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000
      })

      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText(/College registration was not completed/)).toBeInTheDocument()
      })

      // Verify session step was reset
      expect(signupSessionManager.setStep).toHaveBeenCalledWith('college-selection')
    })

    it('should use default error message when errorMessage parameter is missing', async () => {
      mockSearchParams.get.mockImplementation((param: string) => {
        switch (param) {
          case 'error': return 'true'
          default: return null
        }
      })

      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByText(/College registration failed. Please try again./)).toBeInTheDocument()
      })
    })
  })

  describe('Register New College Flow', () => {
    it('should save form data and navigate to registration when "Register New College" is clicked', async () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<CollegeSignupPage />)

      // Fill in some form data
      const firstNameInput = screen.getByLabelText(/First Name/)
      const emailInput = screen.getByLabelText(/Email/)
      
      fireEvent.change(firstNameInput, { target: { value: 'John' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

      // Open the college dropdown
      const collegeSelectButton = screen.getByRole('button', { name: /Select your college/ })
      fireEvent.click(collegeSelectButton)

      // Wait for dropdown to open and find the register new college option
      await waitFor(() => {
        const registerButton = screen.getByText(/Register New College/)
        fireEvent.click(registerButton)
      })

      // Verify form data was saved to session
      expect(signupSessionManager.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          email: 'john@example.com'
        }),
        'college-registration'
      )

      // Verify navigation to registration page
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('/colleges/register?source=signup&returnTo=')
      )
    })
  })

  describe('Session Recovery', () => {
    it('should restore form data from session on page load', async () => {
      mockSearchParams.get.mockReturnValue(null)

      // Mock existing session data
      ;(signupSessionManager.getFormData as jest.Mock).mockReturnValue({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '1234567890',
        collegeId: 'existing-college-1',
        contactPerson: 'Jane Doe',
        designation: 'Registrar'
      })

      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('Jane')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
        expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument()
        expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Registrar')).toBeInTheDocument()
      })
    })
  })

  describe('URL Parameter Cleanup', () => {
    it('should clear URL parameters after processing them', async () => {
      mockSearchParams.get.mockImplementation((param: string) => {
        switch (param) {
          case 'success': return 'true'
          case 'collegeId': return 'test-college'
          case 'collegeName': return 'Test College'
          default: return null
        }
      })

      render(<CollegeSignupPage />)

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalledWith({}, '', window.location.pathname)
      })
    })
  })
})