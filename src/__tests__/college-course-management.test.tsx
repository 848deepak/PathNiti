/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CollegeCourseManager from '@/components/CollegeCourseManager'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

// Mock fetch
global.fetch = jest.fn()

// Mock the UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
}))

const mockCourses = [
  {
    id: '1',
    name: 'Bachelor of Computer Applications',
    description: 'A comprehensive program in computer applications',
    duration: '3 Years',
    eligibility: '12th pass with minimum 50% marks',
    fees: {
      tuition: 50000,
      other: 10000,
      total: 60000
    },
    seats: 60,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Master of Business Administration',
    description: 'Advanced business management program',
    duration: '2 Years',
    eligibility: 'Bachelor degree with minimum 50% marks',
    fees: {
      tuition: 100000,
      other: 20000,
      total: 120000
    },
    seats: 40,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

describe('CollegeCourseManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders course management interface', async () => {
    // Mock successful courses fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: mockCourses })
    })

    render(
      <CollegeCourseManager 
        collegeId="test-college-id" 
        collegeName="Test College" 
      />
    )

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument()
    })

    // Check if courses are displayed
    expect(screen.getByText('Bachelor of Computer Applications')).toBeInTheDocument()
    expect(screen.getByText('Master of Business Administration')).toBeInTheDocument()
    
    // Check course details
    expect(screen.getByText('Duration: 3 Years')).toBeInTheDocument()
    expect(screen.getByText('Seats: 60')).toBeInTheDocument()
    expect(screen.getByText('Fee: ₹60,000')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    // Mock pending fetch
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(
      <CollegeCourseManager 
        collegeId="test-college-id" 
        collegeName="Test College" 
      />
    )

    expect(screen.getByText('Loading courses...')).toBeInTheDocument()
  })

  it('shows empty state when no courses exist', async () => {
    // Mock empty courses response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: [] })
    })

    render(
      <CollegeCourseManager 
        collegeId="test-college-id" 
        collegeName="Test College" 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('No courses yet')).toBeInTheDocument()
    })

    expect(screen.getByText('Start by adding your first course offering.')).toBeInTheDocument()
    expect(screen.getByText('Add Your First Course')).toBeInTheDocument()
  })

  it('opens create course dialog when add button is clicked', async () => {
    // Mock successful courses fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: mockCourses })
    })

    render(
      <CollegeCourseManager 
        collegeId="test-college-id" 
        collegeName="Test College" 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument()
    })

    // Click add course button
    const addButton = screen.getByText('Add Course')
    fireEvent.click(addButton)

    // Check if dialog opens
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
  })

  it('handles course creation', async () => {
    // Mock successful courses fetch
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          message: 'Course created successfully',
          course: mockCourses[0]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ courses: [mockCourses[0]] })
      })

    render(
      <CollegeCourseManager 
        collegeId="test-college-id" 
        collegeName="Test College" 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('No courses yet')).toBeInTheDocument()
    })

    // Click add course button
    const addButton = screen.getByText('Add Your First Course')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })

    // Fill in course form
    const nameInput = screen.getByLabelText(/Course Name/i)
    fireEvent.change(nameInput, { target: { value: 'Test Course' } })

    // Submit form
    const submitButton = screen.getByText('Create Course')
    fireEvent.click(submitButton)

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Course created successfully!')).toBeInTheDocument()
    })

    // Verify API calls
    expect(global.fetch).toHaveBeenCalledWith('/api/colleges/admin/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Course',
        description: null,
        duration: null,
        eligibility: null,
        fees: {
          tuition: null,
          other: null,
          total: null
        },
        seats: null
      })
    })
  })

  it('handles API errors gracefully', async () => {
    // Mock failed courses fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to load courses' })
    })

    render(
      <CollegeCourseManager 
        collegeId="test-college-id" 
        collegeName="Test College" 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load courses')).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    // Mock successful courses fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ courses: [] })
    })

    render(
      <CollegeCourseManager 
        collegeId="test-college-id" 
        collegeName="Test College" 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('No courses yet')).toBeInTheDocument()
    })

    // Click add course button
    const addButton = screen.getByText('Add Your First Course')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })

    // Find the course name input and clear it
    const nameInput = screen.getByLabelText(/Course Name/i)
    fireEvent.change(nameInput, { target: { value: '' } })

    // Try to submit without course name
    const submitButton = screen.getByText('Create Course')
    fireEvent.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Course name is required')).toBeInTheDocument()
    })
  })
})