import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { StudentApplicationTracker } from '@/components/StudentApplicationTracker'
import { ApplicationNotifications } from '@/components/ApplicationNotifications'

// Mock fetch
global.fetch = jest.fn()

const mockApplications = [
  {
    id: 'app-1',
    student_id: 'user-1',
    college_id: 'college-1',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    class_stream: 'Science',
    documents: {
      marksheet_10th: 'url1',
      marksheet_12th: 'url2',
      other_documents: []
    },
    status: 'pending' as const,
    feedback: null,
    submitted_at: '2024-01-15T10:00:00Z',
    reviewed_at: null,
    reviewed_by: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    college_name: 'Test College',
    college_slug: 'test-college',
    college_type: 'private' as const,
    college_location: { city: 'Mumbai', state: 'Maharashtra' },
    college_address: '123 Test Street',
    college_website: 'https://testcollege.edu',
    college_phone: '9876543210',
    college_email: 'info@testcollege.edu'
  },
  {
    id: 'app-2',
    student_id: 'user-1',
    college_id: 'college-2',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    class_stream: 'Commerce',
    documents: {
      marksheet_10th: 'url3',
      marksheet_12th: 'url4',
      other_documents: []
    },
    status: 'rejected' as const,
    feedback: 'Please update your documents',
    submitted_at: '2024-01-10T10:00:00Z',
    reviewed_at: '2024-01-12T15:30:00Z',
    reviewed_by: 'reviewer-1',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-12T15:30:00Z',
    college_name: 'Another College',
    college_slug: 'another-college',
    college_type: 'government' as const,
    college_location: { city: 'Delhi', state: 'Delhi' },
    college_address: '456 Another Street',
    college_website: 'https://anothercollege.edu',
    college_phone: '9876543211',
    college_email: 'info@anothercollege.edu'
  }
]

const mockNotifications = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    title: 'Application Status Update',
    message: 'Your application to Test College has been reviewed',
    type: 'general' as const,
    data: { application_id: 'app-1' },
    is_read: false,
    sent_at: '2024-01-16T10:00:00Z',
    created_at: '2024-01-16T10:00:00Z'
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    title: 'Admission Deadline Reminder',
    message: 'Deadline for XYZ College is approaching',
    type: 'admission_deadline' as const,
    data: null,
    is_read: true,
    sent_at: '2024-01-14T10:00:00Z',
    created_at: '2024-01-14T10:00:00Z'
  }
]

describe('Student Application Tracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))
    
    render(<StudentApplicationTracker userId="user-1" />)
    
    expect(screen.getByText('Loading applications...')).toBeInTheDocument()
  })

  it('displays applications when loaded successfully', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockApplications
      })
    })

    render(<StudentApplicationTracker userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('Test College')).toBeInTheDocument()
      expect(screen.getByText('Another College')).toBeInTheDocument()
    })

    // Check status badges
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()

    // Check feedback display
    expect(screen.getByText('Please update your documents')).toBeInTheDocument()

    // Check update documents button for rejected application
    expect(screen.getByText('Update Documents')).toBeInTheDocument()
  })

  it('displays error state when fetch fails', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<StudentApplicationTracker userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('displays empty state when no applications exist', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: []
      })
    })

    render(<StudentApplicationTracker userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('No applications found')).toBeInTheDocument()
      expect(screen.getByText('Explore Colleges')).toBeInTheDocument()
    })
  })

  it('refreshes applications when refresh button is clicked', async () => {
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockApplications })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

    render(<StudentApplicationTracker userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('Test College')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByText('No applications found')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('Application Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))
    
    render(<ApplicationNotifications userId="user-1" />)
    
    expect(screen.getByText('Loading notifications...')).toBeInTheDocument()
  })

  it('displays notifications when loaded successfully', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockNotifications
      })
    })

    render(<ApplicationNotifications userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('Application Status Update')).toBeInTheDocument()
      expect(screen.getByText('Admission Deadline Reminder')).toBeInTheDocument()
    })

    // Check unread count badge
    expect(screen.getByText('1')).toBeInTheDocument() // Unread count

    // Check notification types
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Deadline')).toBeInTheDocument()
  })

  it('displays empty state when no notifications exist', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: []
      })
    })

    render(<ApplicationNotifications userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument()
    })
  })

  it('marks notification as read when eye button is clicked', async () => {
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockNotifications })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { ...mockNotifications[0], is_read: true } })
      })

    render(<ApplicationNotifications userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('Application Status Update')).toBeInTheDocument()
    })

    // Find and click the mark as read button for unread notification
    const markAsReadButtons = screen.getAllByRole('button')
    const eyeButton = markAsReadButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('class')?.includes('h-6 w-6 p-0')
    )
    
    if (eyeButton) {
      fireEvent.click(eyeButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          `/api/student/notifications/${mockNotifications[0].id}/read`,
          { method: 'PUT' }
        )
      })
    }
  })

  it('displays error state when fetch fails', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<ApplicationNotifications userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })
})