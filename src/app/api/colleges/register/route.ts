import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createCollegeProfile } from '@/lib/utils/college-db-utils'
import type { CollegeProfileCreateData } from '@/lib/types/college-profile'
import { RateLimiter, applyRateLimit } from '@/lib/utils/rate-limiting'
import { InputSanitizer } from '@/lib/utils/input-sanitization'
import { APIValidator, ValidationSchemas } from '@/lib/utils/api-validation'
import { APIErrorHandler, createAPIMiddleware } from '@/lib/utils/api-error-handling'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

// Create rate limiter for college registration
const registrationLimiter = RateLimiter.createRegistrationLimiter()

async function handleCollegeRegistration(request: NextRequest, context?: any) {
  const errorContext = context?.errorContext

  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(request, registrationLimiter)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const supabase = createServerClient()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return APIErrorHandler.createAuthErrorResponse(
      'Please log in to register a college',
      errorContext
    )
  }

  // Check if user has college role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, id, first_name, last_name')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    return APIErrorHandler.createNotFoundErrorResponse('User profile', errorContext)
  }

  if (profile.role !== 'college') {
    return APIErrorHandler.createAuthorizationErrorResponse(
      'College role required to register a college',
      errorContext
    )
  }

  // Validate request body
  const validation = await APIValidator.validateRequestBody(
    request,
    ValidationSchemas.collegeRegistration
  )

  if (!validation.isValid) {
    return APIErrorHandler.createValidationErrorResponse(validation.errors, errorContext)
  }

  const sanitizedData = validation.sanitizedData

  // Check if user already has a college registered
  const { data: existingCollege, error: checkError } = await supabase
    .from('colleges')
    .select('id, name')
    .eq('email', session.user.email)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    const parsedError = APIErrorHandler.parseSupabaseError(checkError)
    return APIErrorHandler.createErrorResponse(parsedError.message, parsedError.statusCode, errorContext)
  }

  if (existingCollege) {
    return APIErrorHandler.createConflictErrorResponse(
      `A college named "${existingCollege.name}" is already registered with this email`,
      errorContext
    )
  }

  // Prepare college data with sanitized inputs
  const collegeData: CollegeProfileCreateData = {
    name: sanitizedData.name,
    type: sanitizedData.type,
    location: sanitizedData.location,
    address: sanitizedData.address,
    website: sanitizedData.website || null,
    phone: sanitizedData.phone || null,
    email: sanitizedData.email || session.user.email,
    established_year: sanitizedData.established_year || null,
    accreditation: sanitizedData.accreditation || null,
    about: sanitizedData.about || null,
    admission_criteria: sanitizedData.admission_criteria || null,
    scholarships: sanitizedData.scholarships || null,
    entrance_tests: sanitizedData.entrance_tests || null,
    fee_structure: sanitizedData.fee_structure || null,
    gallery: sanitizedData.gallery || null
  }

  // Create college profile
  const { data: college, error: createError } = await createCollegeProfile(collegeData)

  if (createError) {
    const parsedError = APIErrorHandler.parseSupabaseError(createError)
    return APIErrorHandler.createErrorResponse(parsedError.message, parsedError.statusCode, errorContext)
  }

  if (!college) {
    return APIErrorHandler.createServerErrorResponse(
      new Error('Failed to create college profile - no data returned'),
      errorContext
    )
  }

  // Return success response with college data
  return NextResponse.json({
    success: true,
    message: 'College registered successfully',
    data: {
      id: college.id,
      name: college.name,
      slug: college.slug,
      type: college.type,
      location: college.location,
      address: college.address,
      website: college.website,
      phone: college.phone,
      email: college.email,
      established_year: college.established_year,
      is_verified: college.is_verified,
      profile_url: `/colleges/${college.slug}`
    }
  }, { status: 201 })
}

// Export the wrapped handler
export const POST = createAPIMiddleware('/api/colleges/register')(handleCollegeRegistration)