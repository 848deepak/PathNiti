/**
 * Test file for enhanced college signup form functionality
 * Tests the new college registration option and session management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import CollegeSignupPage from '@/app/auth/signup/college/page'
import { signupSessionManager } from '@/lib/services/signup-session'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@/app/providers', () => ({
  useAuth: () => ({
    signUpCollege: jest.fn(),
    signInWithOAuth: jest.fn(),
    loading: false,
  }),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              {
                id: '1',
                name: 'Test College',
                location: { city: 'Test City', state: 'Test State' }
              }
            ],
            error: null
          }))
        }))
      }))
    }))
  }
}))

jest.mock('@/lib/services/signup-session')

jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: jest.fn((value) => value)
}))

const mockRouter = {
  push: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
}

describe('Enhanced College Signup Form', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(signupSessionManager.getFormData as jest.Mock).mockReturnValue(null)
    ;(signupSessionManager.getSession as jest.Mock).mockReturnValue(null)
  })

  it('renders college search input when dropdown is opened', async () => {
    const user = userEvent.setup()
    render(<CollegeSignupPage />)
    
    // Click on the college dropdown to open it
    await waitFor(() => {
      const collegeDropdown = screen.getByText('Select your college')
      expect(collegeDropdown).toBeInTheDocument()
    })
    
    const collegeDropdown = screen.getByText('Select your college')
    await user.click(collegeDropdown)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search colleges by name or location...')).toBeInTheDocument()
    })
  })

  it('renders "Register New College" option in dropdown', async () => {
    const user = userEvent.setup()
    render(<CollegeSignupPage />)
    
    // Click on the college dropdown to open it
    const collegeDropdown = screen.getByText('Select your college')
    await user.click(collegeDropdown)
    
    await waitFor(() => {
      expect(screen.getByText('Register New College')).toBeInTheDocument()
    })
  })

  it('filters colleges based on search input', async () => {
    const user = userEvent.setup()
    render(<CollegeSignupPage />)
    
    // Click on the college dropdown to open it
    const collegeDropdown = screen.getByText('Select your college')
    await user.click(collegeDropdown)
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search colleges by name or location...')
      expect(searchInput).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search colleges by name or location...')
    await user.type(searchInput, 'Test')
    
    await waitFor(() => {
      // Should show filtered results
      expect(screen.getByText('Test College')).toBeInTheDocument()
    })
  })

  it('shows "No colleges found" message when search yields no results', async () => {
    const user = userEvent.setup()
    render(<CollegeSignupPage />)
    
    // Click on the college dropdown to open it
    const collegeDropdown = screen.getByText('Select your college')
    await user.click(collegeDropdown)
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search colleges by name or location...')
      expect(searchInput).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('Search colleges by name or location...')
    await user.type(searchInput, 'NonExistent')
    
    await waitFor(() => {
      expect(screen.getByText('No colleges found matching "NonExistent"')).toBeInTheDocument()
    })
  })

  it('handles "Register New College" button click', async () => {
    const user = userEvent.setup()
    // Mock window.open
    const mockOpen = jest.fn()
    Object.defineProperty(window, 'open', {
      writable: true,
      value: mockOpen,
    })

    render(<CollegeSignupPage />)
    
    // Click on the college dropdown to open it
    const collegeDropdown = screen.getByText('Select your college')
    await user.click(collegeDropdown)
    
    await waitFor(() => {
      const registerButton = screen.getByText('Register New College')
      expect(registerButton).toBeInTheDocument()
    })
    
    const registerButton = screen.getByText('Register New College')
    await user.click(registerButton)
    
    await waitFor(() => {
      expect(signupSessionManager.saveFormData).toHaveBeenCalled()
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('/colleges/register?source=signup'),
        '_blank'
      )
    })
  })

  it('loads session data on component mount', async () => {
    const mockSessionData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      collegeId: '',
      contactPerson: 'John Doe',
      designation: 'Admin',
    }

    ;(signupSessionManager.getFormData as jest.Mock).mockReturnValue(mockSessionData)

    render(<CollegeSignupPage />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    })
  })

  it('handles college registration return with success', async () => {
    mockSearchParams.get.mockImplementation((param: string) => {
      switch (param) {
        case 'success': return 'true'
        case 'collegeId': return 'new-college-id'
        case 'collegeName': return 'New College'
        default: return null
      }
    })

    render(<CollegeSignupPage />)
    
    await waitFor(() => {
      expect(screen.getByText('College registered successfully! Your college has been pre-selected.')).toBeInTheDocument()
    })
  })

  it('saves form data to session on input changes', async () => {
    const user = userEvent.setup()
    render(<CollegeSignupPage />)
    
    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('First name')
      expect(firstNameInput).toBeInTheDocument()
    })
    
    const firstNameInput = screen.getByPlaceholderText('First name')
    await user.type(firstNameInput, 'John')
    
    // Wait for the useEffect to trigger
    await waitFor(() => {
      expect(signupSessionManager.saveFormData).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'John' }),
        'college-selection'
      )
    }, { timeout: 1000 })
  })

  it('shows loading states correctly', async () => {
    const user = userEvent.setup()
    render(<CollegeSignupPage />)
    
    // Click on the college dropdown to open it
    const collegeDropdown = screen.getByText('Select your college')
    await user.click(collegeDropdown)
    
    await waitFor(() => {
      const registerButton = screen.getByText('Register New College')
      expect(registerButton).toBeInTheDocument()
    })
    
    const registerButton = screen.getByText('Register New College')
    await user.click(registerButton)
    
    // The loading state should appear briefly - check for either text
    await waitFor(() => {
      const redirectingText = screen.queryByText('Redirecting...') || screen.queryByText('Redirecting to Registration...')
      expect(redirectingText).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('has session management integration', () => {
    // Test that session manager is properly imported and available
    expect(signupSessionManager).toBeDefined()
    expect(signupSessionManager.saveFormData).toBeDefined()
    expect(signupSessionManager.getFormData).toBeDefined()
    expect(signupSessionManager.clearSession).toBeDefined()
  })
})