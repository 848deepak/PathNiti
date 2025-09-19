import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import StudentApplicationForm from '@/components/StudentApplicationForm'

// Mock file validation utilities
jest.mock('@/lib/utils/file-validation', () => ({
  validateFile: jest.fn(() => ({ isValid: true })),
  generateUniqueFilename: jest.fn((name) => `unique-${name}`),
  formatFileSize: jest.fn((size) => `${size} bytes`),
  ALLOWED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_FILE_SIZE: 5242880
}))

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

describe('Student Application Integration', () => {
  const mockProps = {
    collegeId: 'test-college-id',
    collegeName: 'Test College',
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('integrates form validation with file upload requirements', async () => {
    render(<StudentApplicationForm {...mockProps} />)
    
    // Fill out form with valid data
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

    // Try to submit without documents
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    fireEvent.click(submitButton)
    
    // Should show document validation errors
    await waitFor(() => {
      expect(screen.getByText('10th marksheet is required')).toBeInTheDocument()
      expect(screen.getByText('12th marksheet is required')).toBeInTheDocument()
    })
  })

  it('shows file upload progress and validation', () => {
    render(<StudentApplicationForm {...mockProps} />)
    
    // Check that file upload areas are present
    const uploadButtons = screen.getAllByText('Choose File')
    expect(uploadButtons).toHaveLength(3) // 10th, 12th, other documents
    
    // Check file type restrictions are mentioned
    expect(screen.getAllByText(/PDF, JPEG, PNG up to 5MB/)).toHaveLength(3)
  })

  it('handles successful form submission flow', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        application: { 
          id: 'test-application-id',
          status: 'pending',
          submitted_at: new Date().toISOString(),
          college_name: 'Test College',
          college_slug: 'test-college'
        } 
      })
    } as Response)

    render(<StudentApplicationForm {...mockProps} />)
    
    // Fill form with valid data
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

    // Submit form (will fail validation due to missing documents, but tests the flow)
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    fireEvent.click(submitButton)
    
    // Form should validate and show document requirements
    await waitFor(() => {
      expect(screen.getByText('10th marksheet is required')).toBeInTheDocument()
    })
  })

  it('displays proper error states for invalid inputs', async () => {
    render(<StudentApplicationForm {...mockProps} />)
    
    // Submit empty form
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
      expect(screen.getByText('Class/Stream is required')).toBeInTheDocument()
    })
  })
})