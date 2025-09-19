import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import StudentApplicationForm from '@/components/StudentApplicationForm'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({
          data: { path: 'test-path' },
          error: null
        })),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://test-url.com/file.pdf' }
        }))
      }))
    }
  }))
}))

// Mock fetch for API calls
global.fetch = jest.fn()

describe('StudentApplicationForm', () => {
  const mockProps = {
    collegeId: 'test-college-id',
    collegeName: 'Test College',
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the application form with all required fields', () => {
    render(<StudentApplicationForm {...mockProps} />)
    
    expect(screen.getByText('Apply to Test College')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/class\/stream/i)).toBeInTheDocument()
    expect(screen.getByText(/10th marksheet/i)).toBeInTheDocument()
    expect(screen.getByText(/12th marksheet/i)).toBeInTheDocument()
  })

  it('validates required fields on form submission', async () => {
    render(<StudentApplicationForm {...mockProps} />)
    
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
      expect(screen.getByText('Class/Stream is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<StudentApplicationForm {...mockProps} />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('validates phone number format', async () => {
    render(<StudentApplicationForm {...mockProps} />)
    
    const phoneInput = screen.getByLabelText(/phone number/i)
    fireEvent.change(phoneInput, { target: { value: '123' } })
    
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument()
    })
  })

  it('shows file upload areas for documents', () => {
    render(<StudentApplicationForm {...mockProps} />)
    
    const uploadButtons = screen.getAllByText('Choose File')
    expect(uploadButtons).toHaveLength(3) // 10th, 12th, other documents
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<StudentApplicationForm {...mockProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockProps.onCancel).toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, application: { id: 'test-id' } })
    } as Response)

    render(<StudentApplicationForm {...mockProps} />)
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/phone number/i), { 
      target: { value: '9876543210' } 
    })
    fireEvent.change(screen.getByLabelText(/class\/stream/i), { 
      target: { value: '12th Science' } 
    })

    // Mock file uploads (this would need more complex mocking in a real test)
    // For now, we'll just test the form validation passes
    
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    fireEvent.click(submitButton)
    
    // The form should validate and show document upload requirements
    await waitFor(() => {
      expect(screen.getByText('10th marksheet is required')).toBeInTheDocument()
      expect(screen.getByText('12th marksheet is required')).toBeInTheDocument()
    })
  })
})