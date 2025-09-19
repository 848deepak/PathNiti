/**
 * College Profile Service
 * Comprehensive service for managing college profiles, slugs, and related operations
 * Enhanced with caching for better performance
 */

import { collegeSlugService } from '@/lib/utils/slug-generator'
import {
  createCollegeProfile,
  getCollegeBySlug,
  updateCollegeProfile,
  getAllColleges,
  getCollegeCourses,
  getAllCollegeCourses,
  createCollegeCourse,
  updateCollegeCourse,
  deleteCollegeCourse,
  getCollegeNotices,
  createCollegeNotice
} from '@/lib/utils/college-db-utils'

import {
  collegeProfileCache,
  collegeListCache,
  courseCache,
  noticeCache,
  CacheKeys,
  CacheInvalidation,
  CacheWarming
} from './cache-service'

import type {
  CollegeProfileData,
  CollegeProfileCreateData,
  CollegeProfileUpdateData,
  CollegeSlugValidationResult,
  Course,
  Notice
} from '@/lib/types/college-profile'

export interface CollegeProfileService {
  // Profile management
  createProfile(data: CollegeProfileCreateData): Promise<{ data: CollegeProfileData | null; error: string | null }>
  getProfileBySlug(slug: string): Promise<{ data: CollegeProfileData | null; error: string | null }>
  updateProfile(collegeId: string, updates: CollegeProfileUpdateData): Promise<{ data: CollegeProfileData | null; error: string | null }>
  getAllProfiles(): Promise<{ data: CollegeProfileData[] | null; error: string | null }>
  
  // Slug management
  generateSlug(collegeName: string): string
  validateSlug(slug: string): CollegeSlugValidationResult
  ensureUniqueSlug(slug: string, collegeId?: string): Promise<string>
  sanitizeSlug(input: string): string
  
  // Course management
  getCourses(collegeId: string): Promise<{ data: Course[] | null; error: string | null }>
  getAllCourses(collegeId: string, includeInactive?: boolean): Promise<{ data: Course[] | null; error: string | null }>
  createCourse(courseData: any): Promise<{ data: Course | null; error: string | null }>
  updateCourse(courseId: string, updates: any): Promise<{ data: Course | null; error: string | null }>
  deleteCourse(courseId: string): Promise<{ data: Course | null; error: string | null }>
  
  // Notice management
  getNotices(collegeId: string): Promise<{ data: Notice[] | null; error: string | null }>
  createNotice(noticeData: any): Promise<{ data: Notice | null; error: string | null }>
}

/**
 * Enhanced college profile service implementation with caching
 */
export const collegeProfileService: CollegeProfileService = {
  // Profile management with caching
  createProfile: async (data: CollegeProfileCreateData) => {
    const result = await createCollegeProfile(data)
    
    // Invalidate college list cache when new college is created
    if (result.data) {
      collegeListCache.clear()
    }
    
    return result
  },

  getProfileBySlug: async (slug: string) => {
    const cacheKey = CacheKeys.collegeProfile(slug)
    
    // Try to get from cache first
    const cachedData = collegeProfileCache.get(cacheKey)
    if (cachedData) {
      return { data: cachedData, error: null }
    }
    
    // Fetch from database
    const result = await getCollegeBySlug(slug)
    
    // Cache successful results
    if (result.data && !result.error) {
      collegeProfileCache.set(cacheKey, result.data)
    }
    
    return result
  },

  updateProfile: async (collegeId: string, updates: CollegeProfileUpdateData) => {
    const result = await updateCollegeProfile(collegeId, updates)
    
    // Invalidate related caches
    if (result.data) {
      CacheInvalidation.invalidateCollegeData(collegeId, result.data.slug)
    }
    
    return result
  },

  getAllProfiles: async () => {
    const cacheKey = CacheKeys.collegeList({})
    
    // Try to get from cache first
    const cachedData = collegeListCache.get(cacheKey)
    if (cachedData) {
      return { data: cachedData, error: null }
    }
    
    // Fetch from database
    const result = await getAllColleges()
    
    // Cache successful results
    if (result.data && !result.error) {
      collegeListCache.set(cacheKey, result.data)
    }
    
    return result
  },
  
  // Slug management
  generateSlug: collegeSlugService.generateSlug,
  validateSlug: collegeSlugService.validateSlug,
  ensureUniqueSlug: collegeSlugService.ensureUniqueSlug,
  sanitizeSlug: collegeSlugService.sanitizeSlug,
  
  // Course management with caching
  getCourses: async (collegeId: string) => {
    const cacheKey = CacheKeys.collegeCourses(collegeId)
    
    // Try to get from cache first
    const cachedData = courseCache.get(cacheKey)
    if (cachedData) {
      return { data: cachedData, error: null }
    }
    
    // Fetch from database
    const result = await getCollegeCourses(collegeId)
    
    // Cache successful results
    if (result.data && !result.error) {
      courseCache.set(cacheKey, result.data)
    }
    
    return result
  },

  getAllCourses: getAllCollegeCourses,

  createCourse: async (courseData: any) => {
    const result = await createCollegeCourse(courseData)
    
    // Invalidate course cache for this college
    if (result.data) {
      courseCache.delete(CacheKeys.collegeCourses(courseData.college_id))
    }
    
    return result
  },

  updateCourse: async (courseId: string, updates: any) => {
    const result = await updateCollegeCourse(courseId, updates)
    
    // Invalidate course cache (we need to get college_id from the result or updates)
    if (result.data && result.data.college_id) {
      courseCache.delete(CacheKeys.collegeCourses(result.data.college_id))
    }
    
    return result
  },

  deleteCourse: async (courseId: string) => {
    const result = await deleteCollegeCourse(courseId)
    
    // Invalidate course cache (we need to get college_id from the result)
    if (result.data && result.data.college_id) {
      courseCache.delete(CacheKeys.collegeCourses(result.data.college_id))
    }
    
    return result
  },
  
  // Notice management with caching
  getNotices: async (collegeId: string) => {
    const cacheKey = CacheKeys.collegeNotices(collegeId)
    
    // Try to get from cache first
    const cachedData = noticeCache.get(cacheKey)
    if (cachedData) {
      return { data: cachedData, error: null }
    }
    
    // Fetch from database
    const result = await getCollegeNotices(collegeId)
    
    // Cache successful results
    if (result.data && !result.error) {
      noticeCache.set(cacheKey, result.data)
    }
    
    return result
  },

  createNotice: async (noticeData: any) => {
    const result = await createCollegeNotice(noticeData)
    
    // Invalidate notice cache for this college
    if (result.data) {
      noticeCache.delete(CacheKeys.collegeNotices(noticeData.college_id))
    }
    
    return result
  }
}

// Export individual functions for direct use
export {
  createCollegeProfile,
  getCollegeBySlug,
  updateCollegeProfile,
  getAllColleges,
  getCollegeCourses,
  getAllCollegeCourses,
  createCollegeCourse,
  updateCollegeCourse,
  deleteCollegeCourse,
  getCollegeNotices,
  createCollegeNotice,
  collegeSlugService
}

// Export types
export type {
  CollegeProfileData,
  CollegeProfileCreateData,
  CollegeProfileUpdateData,
  CollegeSlugValidationResult,
  Course,
  Notice
}
/**
 *
 Enhanced service methods for performance optimization
 */
export const collegeProfileServiceEnhanced = {
  ...collegeProfileService,

  /**
   * Get college profile with optimized database query
   */
  getProfileOptimized: async (slug: string) => {
    const cacheKey = CacheKeys.collegeProfile(slug)
    
    // Try cache first
    const cachedData = collegeProfileCache.get(cacheKey)
    if (cachedData) {
      return { data: cachedData, error: null }
    }

    try {
      // Use client-side database function for compatibility
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .rpc('get_college_profile_optimized', { college_slug: slug })
        .single()

      if (error) {
        console.error('Error fetching optimized college profile:', error)
        return { data: null, error: error.message }
      }

      if (!data || !data.college_data) {
        return { data: null, error: 'College not found' }
      }

      // Combine all data into a single profile object
      const profileData = {
        ...data.college_data,
        courses: data.courses_data || [],
        notices: data.notices_data || [],
        stats: data.stats_data || {}
      }

      // Cache the result
      collegeProfileCache.set(cacheKey, profileData, 15 * 60 * 1000) // 15 minutes for optimized data

      return { data: profileData, error: null }

    } catch (error) {
      console.error('Error in optimized profile fetch:', error)
      // Fallback to regular method
      return collegeProfileService.getProfileBySlug(slug)
    }
  },

  /**
   * Get paginated colleges with caching
   */
  getCollegesPaginated: async (filters: {
    state?: string
    type?: string
    search?: string
    limit?: number
    offset?: number
  }) => {
    const cacheKey = CacheKeys.collegeList(filters)
    
    // Try cache first
    const cachedData = collegeListCache.get(cacheKey)
    if (cachedData) {
      return { data: cachedData, error: null }
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const limit = filters.limit || 20
      const offset = filters.offset || 0

      // Build optimized query
      let query = supabase
        .from('colleges')
        .select(`
          id,
          slug,
          name,
          type,
          location,
          address,
          website,
          phone,
          email,
          established_year,
          accreditation,
          gallery,
          created_at
        `)
        .eq('is_active', true)
        .order('name')

      // Apply filters
      if (filters.state) {
        query = query.eq('location->>state', filters.state)
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data: colleges, error, count } = await query

      if (error) {
        console.error('Error fetching paginated colleges:', error)
        return { data: null, error: error.message }
      }

      const result = {
        colleges: colleges || [],
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }

      // Cache the result (shorter TTL for paginated data)
      collegeListCache.set(cacheKey, result, 3 * 60 * 1000) // 3 minutes

      return { data: result, error: null }

    } catch (error) {
      console.error('Error in paginated colleges fetch:', error)
      return { data: null, error: 'Failed to fetch colleges' }
    }
  },

  /**
   * Warm cache for popular colleges
   */
  warmPopularColleges: async (slugs: string[]) => {
    await CacheWarming.warmPopularColleges(slugs, async (slug) => {
      const result = await collegeProfileServiceEnhanced.getProfileOptimized(slug)
      return result.data
    })
  },

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats: () => ({
    profileCache: collegeProfileCache.getStats(),
    listCache: collegeListCache.getStats(),
    courseCache: courseCache.getStats(),
    noticeCache: noticeCache.getStats()
  }),

  /**
   * Clear all caches (for admin use)
   */
  clearAllCaches: () => {
    CacheInvalidation.invalidateAllCaches()
  },

  /**
   * Preload college data for better performance
   */
  preloadCollegeData: async (slug: string) => {
    // Preload profile, courses, and notices in parallel
    const promises = [
      collegeProfileServiceEnhanced.getProfileOptimized(slug),
      // Additional preloading can be added here
    ]

    await Promise.allSettled(promises)
  }
}