/**
 * Tests for Dynamic College Profile Page
 * Validates the college profile page functionality and error handling
 */

import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import CollegeProfilePage from '@/app/colleges/[slug]/page'
import { collegeProfileService } from '@/lib/services/college-profile-service'
import type { CollegeProfileData } from '@/lib/types/college-profile'

// Mock the college profile service
const mockGetProfileBySlug = jest.fn()
const mockValidateSlug = jest.fn()

jest.mock('@/lib/services/college-profile-service', () => ({
  collegeProfileService: {
    getProfileBySlug: mockGetProfileBySlug,
    validateSlug: mockValidateSlug
  }
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  })
}))

const mockCollegeData: CollegeProfileData = {
  id: 'test-college-id',
  slug: 'test-college',
  name: 'Test College',
  type: 'government',
  location: {
    city: 'Test City',
    state: 'Test State',
    country: 'India'
  },
  address: '123 Test Street, Test City, Test State',
  website: 'https://testcollege.edu',
  phone: '+91-123-456-7890',
  email: 'info@testcollege.edu',
  established_year: 1950,
  accreditation: ['NAAC A++', 'UGC'],
  about: 'This is a test college for testing purposes.',
  admission_criteria: {
    minimum_percentage: 75,
    entrance_exam_required: true,
    entrance_exam_name: 'Test Entrance Exam',
    application_deadline: '2024-06-30',
    eligibility_criteria: ['12th pass', 'Minimum 75%'],
    selection_process: ['Written Test', 'Interview']
  },
  scholarships: [
    {
      name: 'Merit Scholarship',
      description: 'For top performers',
      eligibility: ['Top 10%', 'Family income < 5 lakhs'],
      amount: '50,000'
    }
  ],
  entrance_tests: [
    {
      name: 'Test Entrance Exam',
      description: 'College entrance examination',
      exam_date: '2024-05-15',
      registration_deadline: '2024-04-30'
    }
  ],
  fee_structure: {
    tuition_fee: 50000,
    hostel_fee: 25000,
    other_fees: 10000,
    total_fee: 85000,
    fee_breakdown: [
      { category: 'Tuition', amount: 50000 },
      { category: 'Hostel', amount: 25000 },
      { category: 'Other', amount: 10000 }
    ]
  },
  gallery: ['image1.jpg', 'image2.jpg'],
  facilities: null,
  programs: null,
  cut_off_data: null,
  admission_process: null,
  fees: null,
  images: null,
  is_verified: true,
  is_active: true,
  courses: [
    {
      id: 'course-1',
      name: 'Computer Science',
      description: 'Bachelor of Computer Science',
      duration: '4 years',
      eligibility: '12th with PCM',
      fees: {
        tuition: 50000,
        other: 10000,
        total: 60000
      },
      seats: 60,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  notices: [
    {
      id: 'notice-1',
      title: 'Admission Open',
      content: 'Admissions are now open for the academic year 2024-25',
      type: 'admission',
      is_active: true,
      published_at: '2024-01-01T00:00:00Z',
      expires_at: '2024-06-30T23:59:59Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  events: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

describe('CollegeProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render college profile page with valid data', async () => {
    mockGetProfileBySlug.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegeProfilePage params={{ slug: 'test-college' }} />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading college profile...')).not.toBeInTheDocument()
    })

    // Check if college name is displayed
    expect(screen.getByText('Test College')).toBeInTheDocument()
    
    // Check if location is displayed
    expect(screen.getByText(/Test City, Test State/)).toBeInTheDocument()
    
    // Check if contact information is displayed
    expect(screen.getByText('+91-123-456-7890')).toBeInTheDocument()
    expect(screen.getByText('info@testcollege.edu')).toBeInTheDocument()
    
    // Check if about section is displayed
    expect(screen.getByText('This is a test college for testing purposes.')).toBeInTheDocument()
    
    // Check if courses are displayed
    expect(screen.getByText('Computer Science')).toBeInTheDocument()
    expect(screen.getByText('Bachelor of Computer Science')).toBeInTheDocument()
    
    // Check if notices are displayed
    expect(screen.getByText('Admission Open')).toBeInTheDocument()
    expect(screen.getByText('Admissions are now open for the academic year 2024-25')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    mockGetProfileBySlug.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<CollegeProfilePage params={{ slug: 'test-college' }} />)

    expect(screen.getByText('Loading college profile...')).toBeInTheDocument()
  })

  it('should show error state when college fetch fails', async () => {
    mockGetProfileBySlug.mockResolvedValue({ data: null, error: 'Failed to fetch college' })

    render(<CollegeProfilePage params={{ slug: 'test-college' }} />)

    await waitFor(() => {
      expect(screen.getByText('Error Loading Profile')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch college')).toBeInTheDocument()
    })
  })

  it('should call notFound when college is not found', async () => {
    const mockNotFound = require('next/navigation').notFound as jest.MockedFunction<any>
    
    mockGetProfileBySlug.mockResolvedValue({ data: null, error: null })

    render(<CollegeProfilePage params={{ slug: 'non-existent-college' }} />)

    await waitFor(() => {
      expect(mockNotFound).toHaveBeenCalled()
    })
  })

  it('should display fee structure when available', async () => {
    mockGetProfileBySlug.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegeProfilePage params={{ slug: 'test-college' }} />)

    await waitFor(() => {
      expect(screen.getByText('Fee Structure')).toBeInTheDocument()
      expect(screen.getByText('₹50,000')).toBeInTheDocument() // Tuition fee
      expect(screen.getByText('₹25,000')).toBeInTheDocument() // Hostel fee
      expect(screen.getByText('₹85,000')).toBeInTheDocument() // Total fee
    })
  })

  it('should display admission criteria when available', async () => {
    mockGetProfileBySlug.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegeProfilePage params={{ slug: 'test-college' }} />)

    await waitFor(() => {
      expect(screen.getByText('Admission Criteria')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument() // Minimum percentage
      expect(screen.getByText('Test Entrance Exam')).toBeInTheDocument()
    })
  })

  it('should display quick information correctly', async () => {
    mockGetProfileBySlug.mockResolvedValue({ data: mockCollegeData, error: null })

    render(<CollegeProfilePage params={{ slug: 'test-college' }} />)

    await waitFor(() => {
      expect(screen.getByText('Quick Information')).toBeInTheDocument()
      expect(screen.getByText('Government')).toBeInTheDocument() // College type
      expect(screen.getByText('1950')).toBeInTheDocument() // Established year
      expect(screen.getByText('NAAC A++')).toBeInTheDocument() // Accreditation
    })
  })
})