import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock the necessary modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
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
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            data: [
              {
                id: '1',
                name: 'Harvard University',
                location: { city: 'Cambridge', state: 'Massachusetts' }
              },
              {
                id: '2',
                name: 'Stanford University',
                location: { city: 'Stanford', state: 'California' }
              }
            ],
            error: null
          })
        })
      })
    })
  }
}))

jest.mock('@/lib/services/signup-session', () => ({
  signupSessionManager: {
    getSession: jest.fn(),
    getFormData: jest.fn(),
    saveFormData: jest.fn(),
    clearSession: jest.fn(),
  },
}))

jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: jest.fn((value) => value)
}))

// Import the component after mocking
import CollegeSignupPage from '@/app/auth/signup/college/page'

describe('College Signup Page - Search Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the college signup page with search functionality', async () => {
    render(<CollegeSignupPage />)
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('Create College Account')).toBeInTheDocument()
    })
    
    // Check that the college selection field is present
    expect(screen.getByText('Select your college')).toBeInTheDocument()
  })

  it('opens searchable dropdown when college field is clicked', async () => {
    const user = userEvent.setup()
    render(<CollegeSignupPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Create College Account')).toBeInTheDocument()
    })
    
    // Click on the college selection dropdown
    const collegeDropdown = screen.getByText('Select your college')
    await user.click(collegeDropdown)
    
    // Check that search input appears
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search colleges by name or location...')).toBeInTheDocument()
    })
  })

  it('shows register new college option in dropdown', async () => {
    const user = userEvent.setup()
    render(<CollegeSignupPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Create College Account')).toBeInTheDocument()
    })
    
    // Click on the college selection dropdown
    const collegeDropdown = screen.getByText('Select your college')
    await user.click(collegeDropdown)
    
    // Check that register new college option appears
    await waitFor(() => {
      expect(screen.getByText('Register New College')).toBeInTheDocument()
    })
  })

  it('displays college options in the dropdown', async () => {
    const user = userEvent.setup()
    render(<CollegeSignupPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Create College Account')).toBeInTheDocument()
    })
    
    // Click on the college selection dropdown
    const collegeDropdown = screen.getByText('Select your college')
    await user.click(collegeDropdown)
    
    // Check that college options appear
    await waitFor(() => {
      expect(screen.getByText('Harvard University')).toBeInTheDocument()
      expect(screen.getByText('Stanford University')).toBeInTheDocument()
    })
  })
})