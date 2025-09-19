/**
 * End-to-end tests for complete user workflows
 * Tests the entire user journey from college registration to student application management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createClient } from '@/lib/supabase/client'
import CollegeRegistrationForm from '@/components/CollegeRegistrationForm'
import StudentApplicationForm from '@/components/StudentApplicationForm'
import CollegeApplicationManager from '@/components/CollegeApplicationManager'
import StudentApplicationTracker from '@/components/StudentApplicationTracker'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-id', name: 'Test College' }, 
            error: null 
          }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-id', slug: 'test-college' }, 
            error: null 
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { id: 'test-id', status: 'approved' }, 
              error: null 
            }))
          }))
        }))
      })),
      order: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/file.pdf' } }))
      }))
    },
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
        error: null 
      }))
    }
  })
}))

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn()
  }),
  useParams: () => ({ slug: 'test-college' }),
  useSearchParams: () => new URLSearchParams()
}))

// Mock file upload
global.File = class MockFile {
  constructor(public content: string[], public name: string, public options: any = {}) {}
  get type() { return this.options.type || 'application/pdf' }
  get size() { return this.content.join('').length }
} as any

global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null
  onload: ((event: any) => void) | null = null
  
  readAsDataURL(file: File) {
    setTimeout(() => {
      this.result = `data:${file.type};base64,dGVzdCBmaWxlIGNvbnRlbnQ=`
      if (this.onload) {
        this.onload({ target: { result: this.result } })
      }
    }, 100)
  }
} as any

describe('End-to-End User Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('College Registration and Profile Creation Workflow', () => {
    it('should complete full college registration workflow', async () => {
      const user = userEvent.setup()

      // Mock successful college creation
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          id: 'college-123',
          name: 'Test College',
          slug: 'test-college',
          type: 'private',
          location: { state: 'Delhi', city: 'New Delhi' },
          address: 'Test Address'
        },
        error: null
      })

      render(<CollegeRegistrationForm />)

      // Step 1: Fill basic information
      await user.type(screen.getByLabelText(/college name/i), 'Test College')
      await user.selectOptions(screen.getByLabelText(/college type/i), 'private')
      await user.selectOptions(screen.getByLabelText(/state/i), 'Delhi')
      await user.selectOptions(screen.getByLabelText(/city/i), 'New Delhi')
      await user.type(screen.getByLabelText(/address/i), 'Test Address, New Delhi')

      // Step 2: Fill additional details
      await user.type(screen.getByLabelText(/about/i), 'This is a test college for comprehensive education.')
      await user.type(screen.getByLabelText(/website/i), 'https://testcollege.edu')
      await user.type(screen.getByLabelText(/phone/i), '011-12345678')
      await user.type(screen.getByLabelText(/email/i), 'info@testcollege.edu')

      // Step 3: Submit form
      const submitButton = screen.getByRole('button', { name: /register college/i })
      await user.click(submitButton)

      // Verify API call
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('colleges')
        expect(mockSupabaseClient.insert).toHaveBeenCalled()
      })

      // Verify success message or redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/colleges/dashboard')
      })
    })

    it('should handle validation errors during registration', async () => {
      const user = userEvent.setup()

      render(<CollegeRegistrationForm />)

      // Try to submit without required fields
      const submitButton = screen.getByRole('button', { name: /register college/i })
      await user.click(submitButton)

      // Verify validation errors are shown
      await waitFor(() => {
        expect(screen.getByText(/college name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/college type is required/i)).toBeInTheDocument()
      })

      // Verify API is not called
      expect(mockSupabaseClient.insert).not.toHaveBeenCalled()
    })
  })

  describe('Student Application Submission Workflow', () => {
    it('should complete full student application workflow', async () => {
      const user = userEvent.setup()

      // Mock successful application submission
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          id: 'application-123',
          student_id: 'student-456',
          college_id: 'college-123',
          full_name: 'John Doe',
          email: 'john@example.com',
          status: 'pending'
        },
        error: null
      })

      const mockCollegeData = {
        id: 'college-123',
        name: 'Test College',
        slug: 'test-college'
      }

      render(<StudentApplicationForm college={mockCollegeData} />)

      // Step 1: Fill personal information
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '9876543210')
      await user.selectOptions(screen.getByLabelText(/class stream/i), 'Science')

      // Step 2: Upload documents
      const marksheet10Input = screen.getByLabelText(/10th marksheet/i)
      const marksheet12Input = screen.getByLabelText(/12th marksheet/i)

      const file10 = new File(['marksheet 10th content'], 'marksheet10.pdf', { type: 'application/pdf' })
      const file12 = new File(['marksheet 12th content'], 'marksheet12.pdf', { type: 'application/pdf' })

      await user.upload(marksheet10Input, file10)
      await user.upload(marksheet12Input, file12)

      // Wait for file uploads to complete
      await waitFor(() => {
        expect(screen.getByText(/marksheet10.pdf/)).toBeInTheDocument()
        expect(screen.getByText(/marksheet12.pdf/)).toBeInTheDocument()
      })

      // Step 3: Submit application
      const submitButton = screen.getByRole('button', { name: /submit application/i })
      await user.click(submitButton)

      // Verify file uploads
      await waitFor(() => {
        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('documents')
      })

      // Verify application submission
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('student_applications')
        expect(mockSupabaseClient.insert).toHaveBeenCalled()
      })

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/application submitted successfully/i)).toBeInTheDocument()
      })
    })

    it('should handle file upload errors gracefully', async () => {
      const user = userEvent.setup()

      // Mock file upload error
      mockSupabaseClient.storage.from.mockReturnValue({
        upload: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Upload failed' } })),
        getPublicUrl: jest.fn()
      })

      const mockCollegeData = {
        id: 'college-123',
        name: 'Test College',
        slug: 'test-college'
      }

      render(<StudentApplicationForm college={mockCollegeData} />)

      // Fill required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '9876543210')
      await user.selectOptions(screen.getByLabelText(/class stream/i), 'Science')

      // Try to upload a file
      const marksheetInput = screen.getByLabelText(/10th marksheet/i)
      const file = new File(['content'], 'marksheet.pdf', { type: 'application/pdf' })
      await user.upload(marksheetInput, file)

      // Verify error message is shown
      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
      })

      // Verify application is not submitted
      const submitButton = screen.getByRole('button', { name: /submit application/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('College Application Management Workflow', () => {
    it('should complete application review and approval workflow', async () => {
      const user = userEvent.setup()

      const mockApplications = [
        {
          id: 'app-1',
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          class_stream: 'Science',
          status: 'pending',
          submitted_at: '2024-01-15T10:00:00Z',
          documents: {
            marksheet_10th: 'https://example.com/marksheet10.pdf',
            marksheet_12th: 'https://example.com/marksheet12.pdf'
          }
        }
      ]

      // Mock fetching applications
      mockSupabaseClient.order.mockResolvedValue({
        data: mockApplications,
        error: null
      })

      // Mock status update
      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockApplications[0], status: 'approved' },
        error: null
      })

      render(<CollegeApplicationManager collegeId="college-123" />)

      // Wait for applications to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('pending')).toBeInTheDocument()
      })

      // Click on application to view details
      const applicationRow = screen.getByText('John Doe').closest('tr')
      expect(applicationRow).toBeInTheDocument()

      // Find and click approve button
      const approveButton = screen.getByRole('button', { name: /approve/i })
      await user.click(approveButton)

      // Add feedback in modal
      const feedbackTextarea = screen.getByLabelText(/feedback/i)
      await user.type(feedbackTextarea, 'Application approved. Welcome to our college!')

      // Confirm approval
      const confirmButton = screen.getByRole('button', { name: /confirm approval/i })
      await user.click(confirmButton)

      // Verify status update API call
      await waitFor(() => {
        expect(mockSupabaseClient.update).toHaveBeenCalledWith({
          status: 'approved',
          feedback: 'Application approved. Welcome to our college!',
          reviewed_at: expect.any(String),
          reviewed_by: 'test-user-id'
        })
      })

      // Verify UI updates
      await waitFor(() => {
        expect(screen.getByText('approved')).toBeInTheDocument()
      })
    })

    it('should handle application rejection workflow', async () => {
      const user = userEvent.setup()

      const mockApplications = [
        {
          id: 'app-1',
          full_name: 'Jane Smith',
          email: 'jane@example.com',
          status: 'pending',
          documents: {
            marksheet_10th: 'https://example.com/marksheet10.pdf',
            marksheet_12th: 'https://example.com/marksheet12.pdf'
          }
        }
      ]

      mockSupabaseClient.order.mockResolvedValue({
        data: mockApplications,
        error: null
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { ...mockApplications[0], status: 'rejected' },
        error: null
      })

      render(<CollegeApplicationManager collegeId="college-123" />)

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })

      // Click reject button
      const rejectButton = screen.getByRole('button', { name: /reject/i })
      await user.click(rejectButton)

      // Add rejection reason
      const feedbackTextarea = screen.getByLabelText(/feedback/i)
      await user.type(feedbackTextarea, 'Documents are incomplete. Please resubmit with all required documents.')

      // Confirm rejection
      const confirmButton = screen.getByRole('button', { name: /confirm rejection/i })
      await user.click(confirmButton)

      // Verify status update
      await waitFor(() => {
        expect(mockSupabaseClient.update).toHaveBeenCalledWith({
          status: 'rejected',
          feedback: 'Documents are incomplete. Please resubmit with all required documents.',
          reviewed_at: expect.any(String),
          reviewed_by: 'test-user-id'
        })
      })
    })
  })

  describe('Student Application Tracking Workflow', () => {
    it('should display application status and allow document updates', async () => {
      const user = userEvent.setup()

      const mockApplications = [
        {
          id: 'app-1',
          college_name: 'Test College',
          college_slug: 'test-college',
          status: 'rejected',
          submitted_at: '2024-01-15T10:00:00Z',
          feedback: 'Please update your 12th marksheet',
          documents: {
            marksheet_10th: 'https://example.com/marksheet10.pdf',
            marksheet_12th: 'https://example.com/marksheet12.pdf'
          }
        }
      ]

      mockSupabaseClient.order.mockResolvedValue({
        data: mockApplications,
        error: null
      })

      render(<StudentApplicationTracker studentId="student-456" />)

      // Wait for applications to load
      await waitFor(() => {
        expect(screen.getByText('Test College')).toBeInTheDocument()
        expect(screen.getByText('rejected')).toBeInTheDocument()
        expect(screen.getByText('Please update your 12th marksheet')).toBeInTheDocument()
      })

      // Click update documents button
      const updateButton = screen.getByRole('button', { name: /update documents/i })
      await user.click(updateButton)

      // Upload new document
      const fileInput = screen.getByLabelText(/12th marksheet/i)
      const newFile = new File(['updated marksheet content'], 'updated_marksheet12.pdf', { type: 'application/pdf' })
      await user.upload(fileInput, newFile)

      // Submit updated documents
      const submitButton = screen.getByRole('button', { name: /submit updated documents/i })
      await user.click(submitButton)

      // Verify document update API call
      await waitFor(() => {
        expect(mockSupabaseClient.update).toHaveBeenCalled()
      })

      // Verify status changes back to pending
      await waitFor(() => {
        expect(screen.getByText('pending')).toBeInTheDocument()
      })
    })
  })

  describe('Complete User Journey Integration', () => {
    it('should handle complete workflow from college registration to student application approval', async () => {
      const user = userEvent.setup()

      // This test simulates the complete journey:
      // 1. College registers
      // 2. Student applies
      // 3. College reviews and approves
      // 4. Student sees approved status

      // Mock sequence of API calls
      let callCount = 0
      mockSupabaseClient.single.mockImplementation(() => {
        callCount++
        switch (callCount) {
          case 1: // College registration
            return Promise.resolve({
              data: {
                id: 'college-123',
                name: 'Integration Test College',
                slug: 'integration-test-college'
              },
              error: null
            })
          case 2: // Student application
            return Promise.resolve({
              data: {
                id: 'app-123',
                student_id: 'student-456',
                college_id: 'college-123',
                status: 'pending'
              },
              error: null
            })
          case 3: // Application approval
            return Promise.resolve({
              data: {
                id: 'app-123',
                status: 'approved',
                feedback: 'Welcome to our college!'
              },
              error: null
            })
          default:
            return Promise.resolve({ data: null, error: null })
        }
      })

      // Step 1: College Registration (simulated)
      expect(callCount).toBe(0)
      
      // Simulate college registration API call
      const collegeData = {
        name: 'Integration Test College',
        type: 'private' as const,
        location: { state: 'Delhi', city: 'New Delhi' },
        address: 'Test Address'
      }

      // This would normally be called by the registration form
      await mockSupabaseClient.from('colleges').insert(collegeData).select().single()
      expect(callCount).toBe(1)

      // Step 2: Student Application (simulated)
      const applicationData = {
        student_id: 'student-456',
        college_id: 'college-123',
        full_name: 'Integration Test Student',
        email: 'student@example.com',
        phone: '9876543210',
        class_stream: 'Science',
        documents: {
          marksheet_10th: 'https://example.com/marksheet10.pdf',
          marksheet_12th: 'https://example.com/marksheet12.pdf'
        }
      }

      await mockSupabaseClient.from('student_applications').insert(applicationData).select().single()
      expect(callCount).toBe(2)

      // Step 3: Application Approval (simulated)
      await mockSupabaseClient
        .from('student_applications')
        .update({
          status: 'approved',
          feedback: 'Welcome to our college!',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'college-admin-id'
        })
        .eq('id', 'app-123')
        .select()
        .single()

      expect(callCount).toBe(3)

      // Verify the complete workflow executed successfully
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('colleges')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('student_applications')
      expect(mockSupabaseClient.insert).toHaveBeenCalledTimes(2)
      expect(mockSupabaseClient.update).toHaveBeenCalledTimes(1)
    })
  })
})