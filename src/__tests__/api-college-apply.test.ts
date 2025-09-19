import { NextRequest } from 'next/server'
import { POST } from '@/app/api/colleges/[slug]/apply/route'
import { jest } from '@jest/globals'

// Mock Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        })),
        in: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }))
}))

// Mock college profile service
jest.mock('@/lib/services/college-profile-service', () => ({
  collegeProfileService: {
    getProfileBySlug: jest.fn()
  }
}))

describe('/api/colleges/[slug]/apply', () => {
  const mockRequest = (body: any) => {
    return {
      json: () => Promise.resolve(body)
    } as NextRequest
  }

  const mockParams = { params: { slug: 'test-college' } }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    const { createClient } = require('@/lib/supabase/server')
    const mockSupabase = createClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated')
    })

    const request = mockRequest({
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      class_stream: '12th Science',
      documents: {
        marksheet_10th: 'url1',
        marksheet_12th: 'url2',
        other_documents: []
      }
    })

    const response = await POST(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Authentication required')
  })

  it('returns 404 when college is not found', async () => {
    const { createClient } = require('@/lib/supabase/server')
    const { collegeProfileService } = require('@/lib/services/college-profile-service')
    
    const mockSupabase = createClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    })

    collegeProfileService.getProfileBySlug.mockResolvedValue({
      data: null,
      error: 'College not found'
    })

    const request = mockRequest({
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      class_stream: '12th Science',
      documents: {
        marksheet_10th: 'url1',
        marksheet_12th: 'url2',
        other_documents: []
      }
    })

    const response = await POST(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('College not found')
  })

  it('returns 400 when required fields are missing', async () => {
    const { createClient } = require('@/lib/supabase/server')
    const { collegeProfileService } = require('@/lib/services/college-profile-service')
    
    const mockSupabase = createClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    })

    collegeProfileService.getProfileBySlug.mockResolvedValue({
      data: { id: 'college-id', name: 'Test College', slug: 'test-college' },
      error: null
    })

    const request = mockRequest({
      full_name: '',
      email: 'john@example.com',
      phone: '9876543210',
      class_stream: '12th Science',
      documents: {
        marksheet_10th: 'url1',
        marksheet_12th: 'url2',
        other_documents: []
      }
    })

    const response = await POST(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Missing required fields')
  })

  it('returns 400 when documents are missing', async () => {
    const { createClient } = require('@/lib/supabase/server')
    const { collegeProfileService } = require('@/lib/services/college-profile-service')
    
    const mockSupabase = createClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    })

    collegeProfileService.getProfileBySlug.mockResolvedValue({
      data: { id: 'college-id', name: 'Test College', slug: 'test-college' },
      error: null
    })

    const request = mockRequest({
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      class_stream: '12th Science',
      documents: {
        marksheet_10th: '',
        marksheet_12th: 'url2',
        other_documents: []
      }
    })

    const response = await POST(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Both 10th and 12th marksheets are required')
  })

  it('returns 400 for invalid email format', async () => {
    const { createClient } = require('@/lib/supabase/server')
    const { collegeProfileService } = require('@/lib/services/college-profile-service')
    
    const mockSupabase = createClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    })

    collegeProfileService.getProfileBySlug.mockResolvedValue({
      data: { id: 'college-id', name: 'Test College', slug: 'test-college' },
      error: null
    })

    const request = mockRequest({
      full_name: 'John Doe',
      email: 'invalid-email',
      phone: '9876543210',
      class_stream: '12th Science',
      documents: {
        marksheet_10th: 'url1',
        marksheet_12th: 'url2',
        other_documents: []
      }
    })

    const response = await POST(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email format')
  })

  it('returns 400 for invalid phone format', async () => {
    const { createClient } = require('@/lib/supabase/server')
    const { collegeProfileService } = require('@/lib/services/college-profile-service')
    
    const mockSupabase = createClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    })

    collegeProfileService.getProfileBySlug.mockResolvedValue({
      data: { id: 'college-id', name: 'Test College', slug: 'test-college' },
      error: null
    })

    const request = mockRequest({
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '123',
      class_stream: '12th Science',
      documents: {
        marksheet_10th: 'url1',
        marksheet_12th: 'url2',
        other_documents: []
      }
    })

    const response = await POST(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid phone number format')
  })

  it('successfully creates application with valid data', async () => {
    const { createClient } = require('@/lib/supabase/server')
    const { collegeProfileService } = require('@/lib/services/college-profile-service')
    
    const mockSupabase = createClient()
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null
    })

    collegeProfileService.getProfileBySlug.mockResolvedValue({
      data: { id: 'college-id', name: 'Test College', slug: 'test-college' },
      error: null
    })

    // Mock no existing application
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            in: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: null,
                error: { code: 'PGRST116' } // No rows returned
              }))
            }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'application-id',
              status: 'pending',
              submitted_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      }))
    })

    const request = mockRequest({
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      class_stream: '12th Science',
      documents: {
        marksheet_10th: 'url1',
        marksheet_12th: 'url2',
        other_documents: []
      }
    })

    const response = await POST(request, mockParams)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.application).toBeDefined()
    expect(data.application.status).toBe('pending')
  })
})