/**
 * Integration tests for college registration redirect handling
 */

import { render, screen, waitFor } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import CollegeRegisterPage from '@/app/colleges/register/page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useSearchParams: jest.fn(),
  redirect: jest.fn(),
}))

// Mock Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user', email: 'test@example.com' } } }
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { role: 'college', first_name: 'Test', last_name: 'User' }
          }))
        }))
      }))
    }))
  }))
}))

// Mock CollegeRegistrationForm
jest.mock('@/components/CollegeRegistrationForm', () => {
  return function MockCollegeRegistrationForm({ source, returnTo }: any) {
    return (
      <div data-testid="college-registration-form">
        <div data-testid="source">{source}</div>
        <div data-testid="return-to">{returnTo}</div>
      </div>
    )
  }
})

const mockSearchParams = {
  source: null as string | null,
  returnTo: null as string | null,
}

describe('College Registration Page Redirect Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => mockSearchParams[key as keyof typeof mockSearchParams]
    })
  })

  it('should pass signup source and returnTo parameters to the form', async () => {
    mockSearchParams.source = 'signup'
    mockSearchParams.returnTo = 'http://localhost:3000/auth/signup/college'

    const searchParams = {
      source: 'signup',
      returnTo: 'http://localhost:3000/auth/signup/college'
    }

    render(await CollegeRegisterPage({ searchParams }))

    await waitFor(() => {
      expect(screen.getByTestId('college-registration-form')).toBeInTheDocument()
      expect(screen.getByTestId('source')).toHaveTextContent('signup')
      expect(screen.getByTestId('return-to')).toHaveTextContent('http://localhost:3000/auth/signup/college')
    })
  })

  it('should show signup-specific messaging when source is signup', async () => {
    mockSearchParams.source = 'signup'
    mockSearchParams.returnTo = 'http://localhost:3000/auth/signup/college'

    const searchParams = {
      source: 'signup',
      returnTo: 'http://localhost:3000/auth/signup/college'
    }

    render(await CollegeRegisterPage({ searchParams }))

    await waitFor(() => {
      expect(screen.getByText(/Register your college to continue with account creation/)).toBeInTheDocument()
      expect(screen.getByText(/After registering your college, you'll be automatically redirected back/)).toBeInTheDocument()
      expect(screen.getByText(/← Return to signup/)).toBeInTheDocument()
    })
  })

  it('should show default messaging when source is not signup', async () => {
    mockSearchParams.source = null
    mockSearchParams.returnTo = null

    const searchParams = {}

    render(await CollegeRegisterPage({ searchParams }))

    await waitFor(() => {
      expect(screen.getByText(/Create a dynamic profile page for your college/)).toBeInTheDocument()
      expect(screen.getByText(/Already registered\?/)).toBeInTheDocument()
    })
  })

  it('should pass direct source when no source parameter is provided', async () => {
    mockSearchParams.source = null
    mockSearchParams.returnTo = null

    const searchParams = {}

    render(await CollegeRegisterPage({ searchParams }))

    await waitFor(() => {
      expect(screen.getByTestId('college-registration-form')).toBeInTheDocument()
      expect(screen.getByTestId('source')).toHaveTextContent('direct')
      expect(screen.getByTestId('return-to')).toHaveTextContent('')
    })
  })
})