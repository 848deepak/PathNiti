/**
 * Test for CollegeRegistrationForm signup flow integration
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CollegeRegistrationForm from '@/components/CollegeRegistrationForm'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockSearchParams = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}))

// Mock signup session manager
jest.mock('@/lib/services/signup-session', () => ({
  signupSessionManager: {
    setStep: jest.fn(),
    getFormData: jest.fn(),
    saveFormData: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

// Get the mocked functions
const { signupSessionManager } = require('@/lib/services/signup-session')

describe('CollegeRegistrationForm Signup Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.clear()
  })

  it('should render in minimal mode for signup flow', () => {
    render(
      <CollegeRegistrationForm 
        source="signup" 
        returnTo="/auth/signup/college"
        minimal={true}
      />
    )

    expect(screen.getByText('Quick College Registration')).toBeInTheDocument()
    expect(screen.getByText(/Quick setup for signup/)).toBeInTheDocument()
    expect(screen.getByText('Quick registration for signup flow')).toBeInTheDocument()
  })

  it('should set signup session step on mount', () => {
    render(
      <CollegeRegistrationForm 
        source="signup" 
        returnTo="/auth/signup/college"
      />
    )

    expect(signupSessionManager.setStep).toHaveBeenCalledWith('college-registration')
  })

  it('should show signup flow context in header', () => {
    render(
      <CollegeRegistrationForm 
        source="signup" 
        returnTo="/auth/signup/college"
      />
    )

    expect(screen.getByText("You'll be redirected back to complete your account after registration")).toBeInTheDocument()
  })

  it('should handle signup flow return on successful registration', async () => {
    const mockCollege = {
      id: 'college-123',
      name: 'Test College',
      slug: 'test-college'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ college: mockCollege })
    })

    signupSessionManager.getFormData.mockReturnValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    })

    // Mock window.location.href
    delete (window as any).location
    ;(window as any).location = { href: '', origin: 'http://localhost:3000' }

    render(
      <CollegeRegistrationForm 
        source="signup" 
        returnTo="/auth/signup/college"
      />
    )

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/College Name/), {
      target: { value: 'Test College' }
    })
    
    fireEvent.change(screen.getByDisplayValue('Select college type'), {
      target: { value: 'private' }
    })

    // Submit form
    fireEvent.click(screen.getByText('Register College'))

    await waitFor(() => {
      expect(signupSessionManager.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          collegeId: 'college-123',
          collegeName: 'Test College',
          isNewCollege: true,
          registrationSource: 'new'
        }),
        'account-creation'
      )
    })
  })

  it('should show enhanced error handling for signup flow', () => {
    render(
      <CollegeRegistrationForm 
        source="signup" 
        returnTo="/auth/signup/college"
      />
    )

    // Trigger an error by submitting without required fields
    fireEvent.click(screen.getByText('Next'))

    expect(screen.getByText('Please fill in all required fields before proceeding')).toBeInTheDocument()
    
    // Should show signup-specific error options
    expect(screen.getByText('You can fix the issue above and try again, or return to signup to select an existing college.')).toBeInTheDocument()
    expect(screen.getByText('Return to Signup')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should handle URL parameters correctly', () => {
    mockSearchParams.get.mockImplementation((key) => {
      const params = {
        'source': 'signup',
        'returnTo': '/auth/signup/college',
        'sessionId': 'session-123'
      }
      return params[key] || null
    })

    render(<CollegeRegistrationForm />)

    expect(signupSessionManager.setStep).toHaveBeenCalledWith('college-registration')
  })
})