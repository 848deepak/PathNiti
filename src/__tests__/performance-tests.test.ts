/**
 * Performance tests for database queries and file uploads
 * Tests the performance characteristics of the dynamic college profiles system
 */

import { createClient } from '@/lib/supabase/client'
import { 
  createCollegeProfile,
  getCollegeBySlug,
  getCollegeCourses,
  getCollegeApplications,
  createStudentApplication
} from '@/lib/utils/college-db-utils'

// Performance test configuration
const PERFORMANCE_THRESHOLDS = {
  COLLEGE_CREATION: 2000, // 2 seconds
  COLLEGE_FETCH_BY_SLUG: 500, // 500ms
  COURSE_FETCH: 300, // 300ms
  APPLICATION_FETCH: 1000, // 1 second
  BULK_OPERATIONS: 5000, // 5 seconds
  FILE_UPLOAD: 10000 // 10 seconds for file operations
}

// Mock data generators
const generateMockCollege = (index: number) => ({
  name: `Performance Test College ${index}`,
  type: 'private' as const,
  location: {
    state: 'Delhi',
    city: 'New Delhi',
    pincode: '110001'
  },
  address: `${index} Performance Test Street, New Delhi`,
  about: `This is a performance test college number ${index} with detailed information about the institution.`,
  admission_criteria: {
    minimum_percentage: 75 + (index % 25),
    entrance_exam: 'JEE Main'
  },
  scholarships: {
    merit_scholarship: {
      amount: 50000 + (index * 1000),
      criteria: `Top ${10 + (index % 10)}% students`
    }
  },
  entrance_tests: ['JEE Main', 'JEE Advanced'],
  gallery: Array.from({ length: 5 }, (_, i) => `image${index}_${i}.jpg`)
})

const generateMockApplication = (collegeId: string, index: number) => ({
  student_id: `student-${index}`,
  college_id: collegeId,
  full_name: `Student ${index}`,
  email: `student${index}@example.com`,
  phone: `987654${String(index).padStart(4, '0')}`,
  class_stream: index % 2 === 0 ? 'Science' : 'Commerce',
  documents: {
    marksheet_10th: `https://example.com/marksheet10_${index}.pdf`,
    marksheet_12th: `https://example.com/marksheet12_${index}.pdf`,
    other_documents: [`https://example.com/certificate_${index}.pdf`]
  }
})

const generateMockCourse = (collegeId: string, index: number) => ({
  college_id: collegeId,
  name: `Course ${index}`,
  description: `Detailed description for course ${index} with comprehensive curriculum information.`,
  duration: `${3 + (index % 2)} years`,
  eligibility: `Class 12 with minimum ${70 + (index % 20)}%`,
  fees: {
    tuition: 100000 + (index * 5000),
    hostel: 50000 + (index * 1000),
    other: 25000 + (index * 500)
  },
  seats: 60 + (index * 2)
})

describe('Performance Tests', () => {
  const skipPerformanceTests = process.env.NODE_ENV !== 'test' || !process.env.NEXT_PUBLIC_SUPABASE_URL
  let createdCollegeIds: string[] = []
  let createdApplicationIds: string[] = []
  let createdCourseIds: string[] = []

  beforeAll(() => {
    if (skipPerformanceTests) {
      console.log('Skipping performance tests - not in test environment')
    }
  })

  afterAll(async () => {
    if (skipPerformanceTests) return

    // Clean up all created test data
    const supabase = createClient()
    
    try {
      if (createdApplicationIds.length > 0) {
        await supabase.from('student_applications').delete().in('id', createdApplicationIds)
      }
      if (createdCourseIds.length > 0) {
        await supabase.from('college_courses').delete().in('id', createdCourseIds)
      }
      if (createdCollegeIds.length > 0) {
        await supabase.from('colleges').delete().in('id', createdCollegeIds)
      }
    } catch (error) {
      console.error('Error cleaning up performance test data:', error)
    }
  })

  describe('Database Query Performance', () => {
    it('should create college profile within performance threshold', async () => {
      if (skipPerformanceTests) return

      const startTime = Date.now()
      const result = await createCollegeProfile(generateMockCollege(1))
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(result.error).toBeNull()
      expect(result.data).toBeTruthy()
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.COLLEGE_CREATION)

      if (result.data?.id) {
        createdCollegeIds.push(result.data.id)
      }

      console.log(`College creation took ${duration}ms (threshold: ${PERFORMANCE_THRESHOLDS.COLLEGE_CREATION}ms)`)
    })

    it('should fetch college by slug within performance threshold', async () => {
      if (skipPerformanceTests || createdCollegeIds.length === 0) return

      // Get the slug of the created college
      const supabase = createClient()
      const { data: college } = await supabase
        .from('colleges')
        .select('slug')
        .eq('id', createdCollegeIds[0])
        .single()

      expect(college?.slug).toBeTruthy()

      const startTime = Date.now()
      const result = await getCollegeBySlug(college!.slug!)
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(result.error).toBeNull()
      expect(result.data).toBeTruthy()
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.COLLEGE_FETCH_BY_SLUG)

      console.log(`College fetch by slug took ${duration}ms (threshold: ${PERFORMANCE_THRESHOLDS.COLLEGE_FETCH_BY_SLUG}ms)`)
    })

    it('should handle bulk college creation efficiently', async () => {
      if (skipPerformanceTests) return

      const startTime = Date.now()
      const promises = Array.from({ length: 5 }, (_, i) => 
        createCollegeProfile(generateMockCollege(i + 10))
      )
      
      const results = await Promise.all(promises)
      const endTime = Date.now()
      const duration = endTime - startTime

      results.forEach(result => {
        expect(result.error).toBeNull()
        if (result.data?.id) {
          createdCollegeIds.push(result.data.id)
        }
      })

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BULK_OPERATIONS)
      console.log(`Bulk college creation (5 colleges) took ${duration}ms (threshold: ${PERFORMANCE_THRESHOLDS.BULK_OPERATIONS}ms)`)
    })

    it('should fetch college courses efficiently', async () => {
      if (skipPerformanceTests || createdCollegeIds.length === 0) return

      // Create some courses first
      const coursePromises = Array.from({ length: 10 }, (_, i) =>
        createCollegeCourse(generateMockCourse(createdCollegeIds[0], i))
      )
      
      const courseResults = await Promise.all(coursePromises)
      courseResults.forEach(result => {
        if (result.data?.id) {
          createdCourseIds.push(result.data.id)
        }
      })

      const startTime = Date.now()
      const result = await getCollegeCourses(createdCollegeIds[0])
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(result.error).toBeNull()
      expect(result.data).toBeTruthy()
      expect(result.data?.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.COURSE_FETCH)

      console.log(`Course fetch took ${duration}ms (threshold: ${PERFORMANCE_THRESHOLDS.COURSE_FETCH}ms)`)
    })

    it('should handle large number of applications efficiently', async () => {
      if (skipPerformanceTests || createdCollegeIds.length === 0) return

      // Create multiple applications
      const applicationPromises = Array.from({ length: 20 }, (_, i) =>
        createStudentApplication(generateMockApplication(createdCollegeIds[0], i))
      )
      
      const applicationResults = await Promise.all(applicationPromises)
      applicationResults.forEach(result => {
        if (result.data?.id) {
          createdApplicationIds.push(result.data.id)
        }
      })

      const startTime = Date.now()
      const result = await getCollegeApplications(createdCollegeIds[0])
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(result.error).toBeNull()
      expect(result.data).toBeTruthy()
      expect(result.data?.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.APPLICATION_FETCH)

      console.log(`Application fetch took ${duration}ms (threshold: ${PERFORMANCE_THRESHOLDS.APPLICATION_FETCH}ms)`)
    })
  })

  describe('Database Index Performance', () => {
    it('should efficiently query colleges by slug using index', async () => {
      if (skipPerformanceTests) return

      const supabase = createClient()
      
      // Test multiple slug queries to ensure index is being used
      const startTime = Date.now()
      
      const promises = Array.from({ length: 10 }, (_, i) =>
        supabase
          .from('colleges')
          .select('id, name, slug')
          .eq('slug', `test-slug-${i}`)
          .maybeSingle()
      )
      
      await Promise.all(promises)
      const endTime = Date.now()
      const duration = endTime - startTime

      // Multiple slug queries should be fast due to index
      expect(duration).toBeLessThan(1000) // 1 second for 10 queries
      console.log(`10 slug queries took ${duration}ms`)
    })

    it('should efficiently filter applications by status using index', async () => {
      if (skipPerformanceTests) return

      const supabase = createClient()
      
      const startTime = Date.now()
      
      const promises = ['pending', 'approved', 'rejected'].map(status =>
        supabase
          .from('student_applications')
          .select('id, status')
          .eq('status', status)
          .limit(100)
      )
      
      await Promise.all(promises)
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(500) // 500ms for status filtering
      console.log(`Status filtering queries took ${duration}ms`)
    })
  })

  describe('File Upload Performance', () => {
    it('should simulate file upload performance', async () => {
      if (skipPerformanceTests) return

      // Simulate file upload by creating a blob and measuring processing time
      const mockFile = new Blob(['x'.repeat(1024 * 1024)], { type: 'application/pdf' }) // 1MB file
      
      const startTime = Date.now()
      
      // Simulate file processing operations
      const arrayBuffer = await mockFile.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Simulate validation and processing
      const isValidSize = uint8Array.length <= 10 * 1024 * 1024 // 10MB limit
      const isValidType = mockFile.type === 'application/pdf'
      
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(isValidSize).toBe(true)
      expect(isValidType).toBe(true)
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FILE_UPLOAD)

      console.log(`File processing simulation took ${duration}ms (threshold: ${PERFORMANCE_THRESHOLDS.FILE_UPLOAD}ms)`)
    })

    it('should handle multiple file uploads efficiently', async () => {
      if (skipPerformanceTests) return

      const startTime = Date.now()
      
      // Simulate multiple file uploads
      const filePromises = Array.from({ length: 5 }, (_, i) => {
        const mockFile = new Blob([`file content ${i}`.repeat(1000)], { type: 'application/pdf' })
        return mockFile.arrayBuffer()
      })
      
      await Promise.all(filePromises)
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FILE_UPLOAD)
      console.log(`Multiple file processing took ${duration}ms (threshold: ${PERFORMANCE_THRESHOLDS.FILE_UPLOAD}ms)`)
    })
  })

  describe('Memory Usage Performance', () => {
    it('should handle large datasets without memory issues', async () => {
      if (skipPerformanceTests) return

      const initialMemory = process.memoryUsage()
      
      // Create large dataset in memory
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        data: 'x'.repeat(1000), // 1KB per item = 1MB total
        metadata: {
          index: i,
          timestamp: new Date().toISOString(),
          tags: Array.from({ length: 10 }, (_, j) => `tag-${j}`)
        }
      }))

      // Process the dataset
      const processedData = largeDataset.map(item => ({
        ...item,
        processed: true,
        hash: item.id.split('').reverse().join('')
      }))

      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

      expect(processedData.length).toBe(1000)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Less than 50MB increase

      console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`)
    })
  })
})

// Helper function to create college course (if not already available)
async function createCollegeCourse(courseData: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('college_courses')
    .insert(courseData)
    .select()
    .single()

  return { data, error }
}