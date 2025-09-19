/**
 * Test suite for dynamic college listing page implementation
 * Verifies that the colleges page uses dynamic database data and real-time updates
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import CollegesPage from '@/app/colleges/page'
import type { CollegeProfileData } from '@/lib/types/college-profile'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

// Mock Supabase client for real-time subscriptions
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({
          unsubscribe: jest.fn()
        }))
      }))
    }))
  }))
}))

// Mock the college profile service
jest.mock('@/lib/services/college-profile-service', () => ({
  collegeProfileService: {
    getAllProfiles: jest.fn()
  }
}))

// Mock NearbyColleges component
jest.mock('@/components/NearbyColleges', () => {
  return function MockNearbyColleges() {
    return <div data-testid="nearby-colleges">Nearby Colleges Component</div>
  }
})

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

const mockCollegeData: CollegeProfileData[] = [
  {
    id: '1',
    slug: 'test-university',
    name: 'Test University',
    type: 'government',
    location: {
      city: 'Test City',
      state: 'Test State',
      country: 'India'
    },
    address: 'Test Address',
    website: 'https://test.edu',
    phone: '+91-1234567890',
    email: 'info@test.edu',
    established_year: 2000,
    accreditation: ['NAAC A++', 'UGC'],
    about: 'Test university description',
    is_verified: true,
    is_active: true,
    courses: [
      {
        id: 'course1',
        name: 'Computer Science',
        description: 'CS course',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }
    ],
    notices: [],
    events: [],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
]

describe('Dynamic College Listing Page', () => {
  const { collegeProfileService } = require('@/lib/services/college-profile-service')
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch colleges using collegeProfileService', async () => {
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegesPage />)

    await waitFor(() => {
      expect(collegeProfileService.getAllProfiles).toHaveBeenCalledTimes(1)
    })
  })

  it('should display colleges from database', async () => {
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegesPage />)

    await waitFor(() => {
      expect(screen.getByText('Test University')).toBeInTheDocument()
      expect(screen.getByText('Test City, Test State')).toBeInTheDocument()
    })
  })

  it('should create slug-based links to college profiles', async () => {
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegesPage />)

    await waitFor(() => {
      const viewDetailsLink = screen.getByRole('link', { name: /view details/i })
      expect(viewDetailsLink).toHaveAttribute('href', '/colleges/test-university')
    })
  })

  it('should handle error states properly', async () => {
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: null, error: 'Database connection failed' })

    render(<CollegesPage />)

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Colleges')).toBeInTheDocument()
      expect(screen.getByText('Database connection failed')).toBeInTheDocument()
    })
  })

  it('should show refresh button and allow manual refresh', async () => {
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegesPage />)

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(collegeProfileService.getAllProfiles).toHaveBeenCalledTimes(2)
    })
  })

  it('should display "Live from database" indicator', async () => {
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegesPage />)

    await waitFor(() => {
      expect(screen.getByText('Live from database')).toBeInTheDocument()
    })
  })

  it('should have search functionality', async () => {
    const multipleColleges = [
      ...mockCollegeData,
      {
        ...mockCollegeData[0],
        id: '2',
        slug: 'another-university',
        name: 'Another University',
        location: {
          city: 'Another City',
          state: 'Another State',
          country: 'India'
        }
      }
    ]
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: multipleColleges, error: null })

    render(<CollegesPage />)

    await waitFor(() => {
      expect(screen.getByText('Test University')).toBeInTheDocument()
      expect(screen.getByText('Another University')).toBeInTheDocument()
    })

    // Verify search input exists and can be used
    const searchInput = screen.getByPlaceholderText(/search colleges/i)
    expect(searchInput).toBeInTheDocument()
    
    fireEvent.change(searchInput, { target: { value: 'Test' } })
    expect(searchInput).toHaveValue('Test')
  })

  it('should display college courses from database', async () => {
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegesPage />)

    await waitFor(() => {
      expect(screen.getByText('Computer Science')).toBeInTheDocument()
    })
  })

  it('should handle empty college list gracefully', async () => {
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: [], error: null })

    render(<CollegesPage />)

    await waitFor(() => {
      expect(screen.getByText('No colleges available')).toBeInTheDocument()
      expect(screen.getByText('There are currently no colleges in the database. Check back later or contact support.')).toBeInTheDocument()
    })
  })

  it('should not contain any mock data fallbacks', async () => {
    collegeProfileService.getAllProfiles.mockResolvedValue({ data: [], error: null })

    render(<CollegesPage />)

    await waitFor(() => {
      // Ensure no hardcoded college names from mock data appear
      expect(screen.queryByText('Delhi University')).not.toBeInTheDocument()
      expect(screen.queryByText('Jawaharlal Nehru University')).not.toBeInTheDocument()
      expect(screen.queryByText('University of Mumbai')).not.toBeInTheDocument()
    })
  })
})