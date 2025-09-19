/**
 * Integration tests for dynamic college profiles database schema
 * Tests the new tables and columns added for the dynamic college profiles feature
 */

import { createClient } from '@/lib/supabase/client'
import { 
  createCollegeProfile,
  getCollegeBySlug,
  createStudentApplication,
  createCollegeCourse,
  getCollegeCourses,
  createCollegeNotice,
  getCollegeNotices
} from '@/lib/utils/college-db-utils'

// Mock data for testing
const mockCollegeData = {
  name: 'Test Integration College',
  type: 'private' as const,
  location: {
    state: 'Delhi',
    city: 'New Delhi',
    country: 'India',
    pincode: '110001'
  },
  address: '123 Test Street, New Delhi',
  about: 'A test college for integration testing',
  admission_criteria: {
    minimum_percentage: 75,
    entrance_exam: 'JEE Main'
  },
  scholarships: {
    merit_scholarship: {
      amount: 50000,
      criteria: 'Top 10% students'
    }
  },
  entrance_tests: ['JEE Main', 'JEE Advanced'],
  gallery: ['image1.jpg', 'image2.jpg']
}

const mockStudentApplication = {
  student_id: 'test-student-id',
  college_id: '', // Will be set after college creation
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '9876543210',
  class_stream: 'Science',
  documents: {
    marksheet_10th: 'https://example.com/marksheet10.pdf',
    marksheet_12th: 'https://example.com/marksheet12.pdf',
    other_documents: ['https://example.com/certificate.pdf']
  }
}

const mockCourseData = {
  college_id: '', // Will be set after college creation
  name: 'Computer Science Engineering',
  description: 'A comprehensive course in computer science and engineering',
  duration: '4 years',
  eligibility: 'Class 12 with PCM, minimum 75%',
  fees: {
    tuition: 100000,
    other: 25000,
    total: 125000
  },
  seats: 60
}

describe('Dynamic College Profiles Integration', () => {
  let createdCollegeId: string
  let createdApplicationId: string
  let createdCourseId: string
  let createdNoticeId: string

  // Skip these tests if we're not in a test environment with proper database access
  const skipIntegrationTests = process.env.NODE_ENV !== 'test' || !process.env.NEXT_PUBLIC_SUPABASE_URL

  beforeAll(() => {
    if (skipIntegrationTests) {
      console.log('Skipping integration tests - not in test environment')
    }
  })

  afterAll(async () => {
    if (skipIntegrationTests) return

    // Clean up created test data
    const supabase = createClient()
    
    try {
      if (createdApplicationId) {
        await supabase.from('student_applications').delete().eq('id', createdApplicationId)
      }
      if (createdCourseId) {
        await supabase.from('college_courses').delete().eq('id', createdCourseId)
      }
      if (createdNoticeId) {
        await supabase.from('college_notices').delete().eq('id', createdNoticeId)
      }
      if (createdCollegeId) {
        await supabase.from('colleges').delete().eq('id', createdCollegeId)
      }
    } catch (error) {
      console.error('Error cleaning up test data:', error)
    }
  })

  it('should create college with new schema fields', async () => {
    if (skipIntegrationTests) {
      console.log('Skipping: should create college with new schema fields')
      return
    }

    const result = await createCollegeProfile(mockCollegeData)
    
    expect(result.error).toBeNull()
    expect(result.data).toBeTruthy()
    expect(result.data?.name).toBe(mockCollegeData.name)
    expect(result.data?.about).toBe(mockCollegeData.about)
    expect(result.data?.admission_criteria).toEqual(mockCollegeData.admission_criteria)
    expect(result.data?.scholarships).toEqual(mockCollegeData.scholarships)
    expect(result.data?.entrance_tests).toEqual(mockCollegeData.entrance_tests)
    expect(result.data?.gallery).toEqual(mockCollegeData.gallery)
    expect(result.data?.slug).toBeTruthy()

    createdCollegeId = result.data!.id
  })

  it('should fetch college by slug', async () => {
    if (skipIntegrationTests || !createdCollegeId) {
      console.log('Skipping: should fetch college by slug')
      return
    }

    // First get the college to find its slug
    const supabase = createClient()
    const { data: college } = await supabase
      .from('colleges')
      .select('slug')
      .eq('id', createdCollegeId)
      .single()

    expect(college?.slug).toBeTruthy()

    const result = await getCollegeBySlug(college!.slug!)
    
    expect(result.error).toBeNull()
    expect(result.data).toBeTruthy()
    expect(result.data?.id).toBe(createdCollegeId)
    expect(result.data?.name).toBe(mockCollegeData.name)
  })

  it('should create student application', async () => {
    if (skipIntegrationTests || !createdCollegeId) {
      console.log('Skipping: should create student application')
      return
    }

    const applicationData = {
      ...mockStudentApplication,
      college_id: createdCollegeId
    }

    const result = await createStudentApplication(applicationData)
    
    expect(result.error).toBeNull()
    expect(result.data).toBeTruthy()
    expect(result.data?.college_id).toBe(createdCollegeId)
    expect(result.data?.full_name).toBe(mockStudentApplication.full_name)
    expect(result.data?.status).toBe('pending')

    createdApplicationId = result.data!.id
  })

  it('should create and fetch college courses', async () => {
    if (skipIntegrationTests || !createdCollegeId) {
      console.log('Skipping: should create and fetch college courses')
      return
    }

    const courseData = {
      ...mockCourseData,
      college_id: createdCollegeId
    }

    const createResult = await createCollegeCourse(courseData)
    
    expect(createResult.error).toBeNull()
    expect(createResult.data).toBeTruthy()
    expect(createResult.data?.college_id).toBe(createdCollegeId)
    expect(createResult.data?.name).toBe(mockCourseData.name)

    createdCourseId = createResult.data!.id

    // Test fetching courses
    const fetchResult = await getCollegeCourses(createdCollegeId)
    
    expect(fetchResult.error).toBeNull()
    expect(fetchResult.data).toBeTruthy()
    expect(fetchResult.data?.length).toBeGreaterThan(0)
    expect(fetchResult.data?.[0].name).toBe(mockCourseData.name)
  })

  it('should create and fetch college notices', async () => {
    if (skipIntegrationTests || !createdCollegeId) {
      console.log('Skipping: should create and fetch college notices')
      return
    }

    const noticeData = {
      college_id: createdCollegeId,
      title: 'Admission Open',
      content: 'Applications are now open for the academic year 2024-25',
      type: 'admission' as const
    }

    const createResult = await createCollegeNotice(noticeData)
    
    expect(createResult.error).toBeNull()
    expect(createResult.data).toBeTruthy()
    expect(createResult.data?.college_id).toBe(createdCollegeId)
    expect(createResult.data?.title).toBe(noticeData.title)

    createdNoticeId = createResult.data!.id

    // Test fetching notices
    const fetchResult = await getCollegeNotices(createdCollegeId)
    
    expect(fetchResult.error).toBeNull()
    expect(fetchResult.data).toBeTruthy()
    expect(fetchResult.data?.length).toBeGreaterThan(0)
    expect(fetchResult.data?.[0].title).toBe(noticeData.title)
  })

  it('should validate database indexes exist', async () => {
    if (skipIntegrationTests) {
      console.log('Skipping: should validate database indexes exist')
      return
    }

    const supabase = createClient()
    
    // Test that we can query efficiently using the new indexes
    // This is a basic test - in a real scenario, you'd use EXPLAIN to check index usage
    
    const { error: slugError } = await supabase
      .from('colleges')
      .select('id')
      .eq('slug', 'test-slug')
      .limit(1)

    expect(slugError).toBeNull()

    const { error: applicationError } = await supabase
      .from('student_applications')
      .select('id')
      .eq('college_id', 'test-college-id')
      .eq('status', 'pending')
      .limit(1)

    expect(applicationError).toBeNull()

    const { error: courseError } = await supabase
      .from('college_courses')
      .select('id')
      .eq('college_id', 'test-college-id')
      .eq('is_active', true)
      .limit(1)

    expect(courseError).toBeNull()

    const { error: noticeError } = await supabase
      .from('college_notices')
      .select('id')
      .eq('college_id', 'test-college-id')
      .eq('is_active', true)
      .limit(1)

    expect(noticeError).toBeNull()
  })
})

describe('Slug Generation Integration', () => {
  const skipIntegrationTests = process.env.NODE_ENV !== 'test' || !process.env.NEXT_PUBLIC_SUPABASE_URL

  it('should auto-generate unique slugs for colleges', async () => {
    if (skipIntegrationTests) {
      console.log('Skipping: should auto-generate unique slugs for colleges')
      return
    }

    const college1Data = {
      name: 'Unique Test College',
      type: 'private' as const,
      location: { state: 'Delhi', city: 'New Delhi', country: 'India' },
      address: 'Test Address 1'
    }

    const college2Data = {
      name: 'Unique Test College', // Same name
      type: 'government' as const,
      location: { state: 'Mumbai', city: 'Mumbai', country: 'India' },
      address: 'Test Address 2'
    }

    const result1 = await createCollegeProfile(college1Data)
    const result2 = await createCollegeProfile(college2Data)

    expect(result1.error).toBeNull()
    expect(result2.error).toBeNull()
    expect(result1.data?.slug).toBeTruthy()
    expect(result2.data?.slug).toBeTruthy()
    expect(result1.data?.slug).not.toBe(result2.data?.slug)

    // Clean up
    const supabase = createClient()
    if (result1.data?.id) {
      await supabase.from('colleges').delete().eq('id', result1.data.id)
    }
    if (result2.data?.id) {
      await supabase.from('colleges').delete().eq('id', result2.data.id)
    }
  })
})