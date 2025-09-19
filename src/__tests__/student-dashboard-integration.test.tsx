import { render, screen, waitFor } from '@testing-library/react'
import StudentDashboardPage from '@/app/dashboard/student/page'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

// Mock the auth provider
const mockUser = {
  id: 'user-1',
  email: 'student@example.com'
}

const mockProfile = {
  id: 'user-1',
  first_name: 'John',
  last_name: 'Doe',
  role: 'student' as const
}

jest.mock('../app/providers', () => ({
  useAuth: () => ({
    user: mockUser,
    profile: mockProfile,
    loading: false,
    requireAuth: jest.fn().mockResolvedValue(undefined),
    requireRole: jest.fn().mockResolvedValue(undefined)
  })
}))

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
  }
]

const mockAnalytics = {
  quizScoreAverage: 85,
  lastAssessmentScore: 90,
  scoreChange: 5,
  collegesExplored: 12,
  collegesThisWeek: 3,
  applicationsTracked: 1,
  upcomingDeadlines: 2,
  scholarshipsFound: 5,
  totalScholarshipValue: 50000,
  recentActivity: [
    {
      action: 'quiz_completed',
      description: 'Completed Career Assessment Quiz',
      timestamp: '2024-01-15T10:00:00Z',
      timeAgo: '2 days ago'
    }
  ],
  progressMilestones: [
    {
      id: '1',
      title: 'Complete Profile',
      description: 'Fill out your complete profile information',
      completed: true,
      completedAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '2',
      title: 'Take Assessment',
      description: 'Complete your career assessment',
      completed: false,
      inProgress: true
    }
  ]
}

describe('Student Dashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default fetch responses
    ;(fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/student/analytics')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockAnalytics })
        })
      }
      if (url.includes('/api/student/applications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockApplications })
        })
      }
      if (url.includes('/api/student/notifications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockNotifications })
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  it('renders complete student dashboard with all components', async () => {
    render(<StudentDashboardPage />)

    // Check header
    expect(screen.getByText('Student Analytics Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome back, John!')).toBeInTheDocument()

    // Wait for analytics to load
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument() // Quiz score average
      expect(screen.getByText('12')).toBeInTheDocument() // Colleges explored
      expect(screen.getByText('1')).toBeInTheDocument() // Applications tracked
      expect(screen.getByText('5')).toBeInTheDocument() // Scholarships found
    })

    // Wait for application tracker to load
    await waitFor(() => {
      expect(screen.getByText('Application Tracker')).toBeInTheDocument()
      expect(screen.getByText('Test College')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument()
      expect(screen.getByText('Application Status Update')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Unread count badge
    })

    // Check progress milestones
    await waitFor(() => {
      expect(screen.getByText('Complete Profile')).toBeInTheDocument()
      expect(screen.getByText('Take Assessment')).toBeInTheDocument()
    })

    // Check quick actions
    expect(screen.getByText('Retake Assessment')).toBeInTheDocument()
    expect(screen.getByText('Check Deadlines')).toBeInTheDocument()
    expect(screen.getByText('Find More Colleges')).toBeInTheDocument()
    expect(screen.getByText('Explore Scholarships')).toBeInTheDocument()

    // Check recent activity
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('Completed Career Assessment Quiz')).toBeInTheDocument()
    })
  })

  it('handles empty application state correctly', async () => {
    // Mock empty applications
    ;(fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/student/analytics')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockAnalytics })
        })
      }
      if (url.includes('/api/student/applications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] })
        })
      }
      if (url.includes('/api/student/notifications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] })
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('No applications found')).toBeInTheDocument()
      expect(screen.getByText('No notifications yet')).toBeInTheDocument()
    })
  })

  it('displays rejected application with update documents option', async () => {
    const rejectedApplication = {
      ...mockApplications[0],
      status: 'rejected' as const,
      feedback: 'Please update your 12th grade marksheet'
    }

    ;(fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/student/analytics')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockAnalytics })
        })
      }
      if (url.includes('/api/student/applications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [rejectedApplication] })
        })
      }
      if (url.includes('/api/student/notifications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockNotifications })
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Rejected')).toBeInTheDocument()
      expect(screen.getByText('Please update your 12th grade marksheet')).toBeInTheDocument()
      expect(screen.getByText('Update Documents')).toBeInTheDocument()
    })
  })

  it('shows correct notification badges and types', async () => {
    const mixedNotifications = [
      {
        id: 'notif-1',
        user_id: 'user-1',
        title: 'Application Status Update',
        message: 'Your application has been approved',
        type: 'general' as const,
        data: null,
        is_read: false,
        sent_at: '2024-01-16T10:00:00Z',
        created_at: '2024-01-16T10:00:00Z'
      },
      {
        id: 'notif-2',
        user_id: 'user-1',
        title: 'Admission Deadline',
        message: 'Deadline approaching for XYZ College',
        type: 'admission_deadline' as const,
        data: null,
        is_read: true,
        sent_at: '2024-01-14T10:00:00Z',
        created_at: '2024-01-14T10:00:00Z'
      },
      {
        id: 'notif-3',
        user_id: 'user-1',
        title: 'Scholarship Available',
        message: 'New scholarship opportunity available',
        type: 'scholarship' as const,
        data: null,
        is_read: false,
        sent_at: '2024-01-13T10:00:00Z',
        created_at: '2024-01-13T10:00:00Z'
      }
    ]

    ;(fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/student/analytics')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockAnalytics })
        })
      }
      if (url.includes('/api/student/applications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockApplications })
        })
      }
      if (url.includes('/api/student/notifications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mixedNotifications })
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    render(<StudentDashboardPage />)

    await waitFor(() => {
      // Check unread count (2 unread notifications)
      expect(screen.getByText('2')).toBeInTheDocument()
      
      // Check notification types
      expect(screen.getByText('General')).toBeInTheDocument()
      expect(screen.getByText('Deadline')).toBeInTheDocument()
      expect(screen.getByText('Scholarship')).toBeInTheDocument()
    })
  })
})