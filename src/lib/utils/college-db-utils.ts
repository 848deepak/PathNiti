/**
 * Database Utility Functions for College Profile Operations
 * Provides functions for CRUD operations on college profiles and related data
 */

import { createClient } from '@/lib/supabase/client'
import { generateUniqueCollegeSlug } from './slug-generator'
import type { 
  CollegeProfileData, 
  CollegeProfileCreateData, 
  CollegeProfileUpdateData,
  Course,
  Notice
} from '@/lib/types/college-profile'
import type { 
  CollegeInsert,
  CollegeUpdate,
  StudentApplicationInsert,
  StudentApplicationUpdate,
  CollegeCourseInsert,
  CollegeNoticeInsert
} from '@/lib/supabase/types'

export interface StudentApplicationData {
  id?: string
  student_id: string
  college_id: string
  full_name: string
  email: string
  phone: string
  class_stream: string
  documents: {
    marksheet_10th?: string
    marksheet_12th?: string
    other_documents?: string[]
  }
  status?: 'pending' | 'approved' | 'rejected'
  feedback?: string
  submitted_at?: string
  reviewed_at?: string
  reviewed_by?: string
  created_at?: string
  updated_at?: string
}

export interface CollegeCourseCreateData {
  college_id: string
  name: string
  description?: string
  duration?: string
  eligibility?: string
  fees?: {
    tuition: number
    other: number
    total: number
  }
  seats?: number
  is_active?: boolean
}

export interface CollegeNoticeCreateData {
  college_id: string
  title: string
  content: string
  type?: 'general' | 'admission' | 'event' | 'urgent'
  is_active?: boolean
  published_at?: string
  expires_at?: string
}

/**
 * Create a new college profile
 */
export async function createCollegeProfile(
  profileData: CollegeProfileCreateData
): Promise<{ data: CollegeProfileData | null; error: string | null }> {
  try {
    const supabase = createClient()

    // Generate unique slug
    const slug = await generateUniqueCollegeSlug(profileData.name)

    const insertData: CollegeInsert = {
      ...profileData,
      slug,
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('colleges')
      .insert([insertData])
      .select(`
        *,
        college_courses(*),
        college_notices(*)
      `)
      .single()

    if (error) {
      console.error('Error creating college profile:', error)
      return { data: null, error: error.message }
    }

    // Transform the data to match our interface
    const transformedData: CollegeProfileData = {
      ...data,
      slug: data.slug || '',
      courses: (data as any).college_courses || [],
      notices: (data as any).college_notices || [],
      events: [] // Events will be added later when implemented
    }

    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Unexpected error creating college profile:', err)
    return { data: null, error: 'Failed to create college profile' }
  }
}

/**
 * Get college profile by slug
 */
export async function getCollegeBySlug(
  slug: string
): Promise<{ data: CollegeProfileData | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('colleges')
      .select(`
        *,
        college_courses(*),
        college_notices(*)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'College not found' }
      }
      console.error('Error fetching college by slug:', error)
      return { data: null, error: error.message }
    }

    // Transform the data to match our interface
    const transformedData: CollegeProfileData = {
      ...data,
      slug: data.slug || '',
      courses: (data as any).college_courses || [],
      notices: (data as any).college_notices || [],
      events: [] // Events will be added later when implemented
    }

    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Unexpected error fetching college by slug:', err)
    return { data: null, error: 'Failed to fetch college profile' }
  }
}

/**
 * Update college profile
 */
export async function updateCollegeProfile(
  collegeId: string,
  updates: CollegeProfileUpdateData
): Promise<{ data: CollegeProfileData | null; error: string | null }> {
  try {
    const supabase = createClient()

    // If name is being updated, regenerate slug
    if (updates.name && !updates.slug) {
      updates.slug = await generateUniqueCollegeSlug(updates.name, collegeId)
    }

    const updateData: CollegeUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('colleges')
      .update(updateData)
      .eq('id', collegeId)
      .select(`
        *,
        college_courses(*),
        college_notices(*)
      `)
      .single()

    if (error) {
      console.error('Error updating college profile:', error)
      return { data: null, error: error.message }
    }

    // Transform the data to match our interface
    const transformedData: CollegeProfileData = {
      ...data,
      slug: data.slug || '',
      courses: (data as any).college_courses || [],
      notices: (data as any).college_notices || [],
      events: [] // Events will be added later when implemented
    }

    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Unexpected error updating college profile:', err)
    return { data: null, error: 'Failed to update college profile' }
  }
}

/**
 * Get college courses
 */
export async function getCollegeCourses(
  collegeId: string
): Promise<{ data: Course[] | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('college_courses')
      .select('*')
      .eq('college_id', collegeId)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching college courses:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Unexpected error fetching college courses:', err)
    return { data: null, error: 'Failed to fetch college courses' }
  }
}

/**
 * Create college course
 */
export async function createCollegeCourse(
  courseData: CollegeCourseCreateData
): Promise<{ data: Course | null; error: string | null }> {
  try {
    const supabase = createClient()

    const insertData: CollegeCourseInsert = {
      ...courseData,
      is_active: courseData.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('college_courses')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating college course:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating college course:', err)
    return { data: null, error: 'Failed to create college course' }
  }
}

/**
 * Update college course
 */
export async function updateCollegeCourse(
  courseId: string,
  updates: Partial<CollegeCourseCreateData>
): Promise<{ data: Course | null; error: string | null }> {
  try {
    const supabase = createClient()

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('college_courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      console.error('Error updating college course:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating college course:', err)
    return { data: null, error: 'Failed to update college course' }
  }
}

/**
 * Delete college course (soft delete)
 */
export async function deleteCollegeCourse(
  courseId: string
): Promise<{ data: Course | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('college_courses')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      console.error('Error deleting college course:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error deleting college course:', err)
    return { data: null, error: 'Failed to delete college course' }
  }
}

/**
 * Get all courses for a college (including inactive ones for admin)
 */
export async function getAllCollegeCourses(
  collegeId: string,
  includeInactive: boolean = false
): Promise<{ data: Course[] | null; error: string | null }> {
  try {
    const supabase = createClient()

    let query = supabase
      .from('college_courses')
      .select('*')
      .eq('college_id', collegeId)
      .order('name')

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching all college courses:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Unexpected error fetching all college courses:', err)
    return { data: null, error: 'Failed to fetch college courses' }
  }
}

/**
 * Get college notices
 */
export async function getCollegeNotices(
  collegeId: string
): Promise<{ data: Notice[] | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('college_notices')
      .select('*')
      .eq('college_id', collegeId)
      .eq('is_active', true)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching college notices:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Unexpected error fetching college notices:', err)
    return { data: null, error: 'Failed to fetch college notices' }
  }
}

/**
 * Create college notice
 */
export async function createCollegeNotice(
  noticeData: CollegeNoticeCreateData
): Promise<{ data: Notice | null; error: string | null }> {
  try {
    const supabase = createClient()

    const insertData: CollegeNoticeInsert = {
      ...noticeData,
      type: noticeData.type || 'general',
      is_active: noticeData.is_active ?? true,
      published_at: noticeData.published_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('college_notices')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating college notice:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating college notice:', err)
    return { data: null, error: 'Failed to create college notice' }
  }
}

/**
 * Create student application
 */
export async function createStudentApplication(
  applicationData: StudentApplicationData
): Promise<{ data: StudentApplicationData | null; error: string | null }> {
  try {
    const supabase = createClient()

    const insertData: StudentApplicationInsert = {
      ...applicationData,
      status: applicationData.status || 'pending',
      submitted_at: applicationData.submitted_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('student_applications')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating student application:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating student application:', err)
    return { data: null, error: 'Failed to create student application' }
  }
}

/**
 * Get student applications for a college
 */
export async function getCollegeApplications(
  collegeId: string,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<{ data: StudentApplicationData[] | null; error: string | null }> {
  try {
    const supabase = createClient()

    let query = supabase
      .from('student_applications')
      .select('*')
      .eq('college_id', collegeId)
      .order('submitted_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching college applications:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Unexpected error fetching college applications:', err)
    return { data: null, error: 'Failed to fetch college applications' }
  }
}

/**
 * Get student applications for a student
 */
export async function getStudentApplications(
  studentId: string
): Promise<{ data: (StudentApplicationData & { college_name: string; college_slug: string })[] | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('student_applications')
      .select(`
        *,
        colleges!inner(name, slug)
      `)
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching student applications:', error)
      return { data: null, error: error.message }
    }

    // Transform the data to include college info
    const transformedData = data?.map(app => ({
      ...app,
      college_name: (app as any).colleges.name,
      college_slug: (app as any).colleges.slug || ''
    })) || []

    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Unexpected error fetching student applications:', err)
    return { data: null, error: 'Failed to fetch student applications' }
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: 'pending' | 'approved' | 'rejected',
  feedback?: string,
  reviewerId?: string
): Promise<{ data: StudentApplicationData | null; error: string | null }> {
  try {
    const supabase = createClient()

    const updates: StudentApplicationUpdate = {
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (feedback) {
      updates.feedback = feedback
    }

    if (reviewerId) {
      updates.reviewed_by = reviewerId
    }

    const { data, error } = await supabase
      .from('student_applications')
      .update(updates)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating application status:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating application status:', err)
    return { data: null, error: 'Failed to update application status' }
  }
}

/**
 * Get all colleges with basic info for listing
 */
export async function getAllColleges(): Promise<{ data: CollegeProfileData[] | null; error: string | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('colleges')
      .select(`
        *,
        college_courses(*),
        college_notices(*)
      `)
      .order('name')

    if (error) {
      console.error('Error fetching all colleges:', error)
      return { data: null, error: error.message }
    }

    // Transform the data to match our interface
    const transformedData: CollegeProfileData[] = data?.map(college => ({
      ...college,
      slug: college.slug || '',
      courses: (college as any).college_courses || [],
      notices: (college as any).college_notices || [],
      events: [] // Events will be added later when implemented
    })) || []

    return { data: transformedData, error: null }
  } catch (err) {
    console.error('Unexpected error fetching all colleges:', err)
    return { data: null, error: 'Failed to fetch colleges' }
  }
}