/**
 * Unit tests for college database utilities
 */

import {
  createCollegeProfile,
  getCollegeBySlug,
  updateCollegeProfile,
  getCollegeCourses,
  createCollegeCourse,
  getCollegeNotices,
  createStudentApplication,
  getCollegeApplications,
  updateApplicationStatus
} from '../college-db-utils'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  limit: jest.fn(() => mockSupabaseClient)
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

jest.mock('../slug-generator', () => ({
  generateUniqueCollegeSlug: jest.fn(() => Promise.resolve('test-college'))
}))

describe('createCollegeProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create college profile successfully', async () => {
    const mockCollegeData = {
      name: 'Test College',
      type: 'private' as const,
      location: { state: 'Delhi', city: 'New Delhi' },
      address: 'Test Address'
    }

    mockSupabaseClient.single.mockResolvedValue({
      data: { 
        ...mockCollegeData, 
        id: 'test-id', 
        slug: 'test-college',
        college_courses: [],
        college_notices: []
      },
      error: null
    })

    const result = await createCollegeProfile(mockCollegeData)

    expect(result.error).toBeNull()
    expect(result.data).toMatchObject({
      ...mockCollegeData,
      courses: [],
      notices: [],
      events: []
    })
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('colleges')
    expect(mockSupabaseClient.insert).toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    const mockCollegeData = {
      name: 'Test College',
      type: 'private' as const,
      location: { state: 'Delhi', city: 'New Delhi' },
      address: 'Test Address'
    }

    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    const result = await createCollegeProfile(mockCollegeData)

    expect(result.error).toBe('Database error')
    expect(result.data).toBeNull()
  })
})

describe('getCollegeBySlug', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch college by slug successfully', async () => {
    const mockCollege = {
      id: 'test-id',
      name: 'Test College',
      slug: 'test-college',
      type: 'private',
      college_courses: [],
      college_notices: []
    }

    mockSupabaseClient.single.mockResolvedValue({
      data: mockCollege,
      error: null
    })

    const result = await getCollegeBySlug('test-college')

    expect(result.error).toBeNull()
    expect(result.data).toEqual({
      ...mockCollege,
      courses: [],
      notices: [],
      events: []
    })
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('slug', 'test-college')
  })

  it('should handle college not found', async () => {
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' }
    })

    const result = await getCollegeBySlug('non-existent')

    expect(result.error).toBe('College not found')
    expect(result.data).toBeNull()
  })
})

describe('createStudentApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create student application successfully', async () => {
    const mockApplicationData = {
      student_id: 'student-id',
      college_id: 'college-id',
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      class_stream: 'Science',
      documents: { marksheet_10th: 'url1', marksheet_12th: 'url2' }
    }

    mockSupabaseClient.single.mockResolvedValue({
      data: { ...mockApplicationData, id: 'app-id' },
      error: null
    })

    const result = await createStudentApplication(mockApplicationData)

    expect(result.error).toBeNull()
    expect(result.data).toMatchObject(mockApplicationData)
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('student_applications')
  })
})

describe('updateApplicationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update application status successfully', async () => {
    const mockUpdatedApplication = {
      id: 'app-id',
      status: 'approved',
      feedback: 'Application approved',
      reviewed_by: 'reviewer-id'
    }

    mockSupabaseClient.single.mockResolvedValue({
      data: mockUpdatedApplication,
      error: null
    })

    const result = await updateApplicationStatus(
      'app-id',
      'approved',
      'Application approved',
      'reviewer-id'
    )

    expect(result.error).toBeNull()
    expect(result.data).toMatchObject(mockUpdatedApplication)
    expect(mockSupabaseClient.update).toHaveBeenCalled()
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'app-id')
  })
})

describe('getCollegeCourses', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch college courses successfully', async () => {
    const mockCourses = [
      { id: 'course-1', name: 'Computer Science', college_id: 'college-id' },
      { id: 'course-2', name: 'Mathematics', college_id: 'college-id' }
    ]

    // Mock the chain of method calls
    mockSupabaseClient.order.mockResolvedValue({
      data: mockCourses,
      error: null
    })

    const result = await getCollegeCourses('college-id')

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockCourses)
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('college_courses')
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('college_id', 'college-id')
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('is_active', true)
  })

  it('should handle empty courses list', async () => {
    mockSupabaseClient.order.mockResolvedValue({
      data: null,
      error: null
    })

    const result = await getCollegeCourses('college-id')

    expect(result.error).toBeNull()
    expect(result.data).toEqual([])
  })
})