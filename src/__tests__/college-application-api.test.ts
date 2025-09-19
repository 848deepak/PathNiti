/**
 * Integration tests for College Application Management API
 * Tests the API endpoints for college administrators to manage student applications
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/colleges/admin/applications/route'
import { PUT } from '@/app/api/colleges/admin/applications/[id]/status/route'

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            then: jest.fn()
          }))
        }))
      })),
      order: jest.fn(() => ({
        range: jest.fn()
      })),
      range: jest.fn()
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    })),
    insert: jest.fn()
  }))
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase
}))

describe('College Application Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/colleges/admin/applications', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/applications')
      const response = await GET(request)
      
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when user is not a college', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
        error: null
      })

      const mockFrom = mockSupabase.from as jest.Mock
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { role: 'student' },
              error: null
            })
          }))
        }))
      })

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/applications')
      const response = await GET(request)
      
      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Forbidden - College role required')
    })

    it('should return 404 when college profile not found', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
        error: null
      })

      const mockFrom = mockSupabase.from as jest.Mock
      mockFrom
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { role: 'college' },
                error: null
              })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: null
              })
            }))
          }))
        })

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/applications')
      const response = await GET(request)
      
      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('College profile not found')
    })

    it('should return applications successfully', async () => {
      const mockApplications = [
        {
          id: '1',
          student_id: 'student-1',
          college_id: 'college-1',
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          class_stream: 'Science',
          status: 'pending',
          submitted_at: '2024-01-15T10:00:00Z',
          profiles: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com'
          }
        }
      ]

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
        error: null
      })

      const mockFrom = mockSupabase.from as jest.Mock
      mockFrom
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { role: 'college' },
                error: null
              })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: {
                  college_id: 'college-1',
                  colleges: { id: 'college-1', name: 'Test College' }
                },
                error: null
              })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn().mockResolvedValue({
                  data: mockApplications,
                  error: null
                })
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({
              count: 1,
              error: null
            })
          }))
        })

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/applications')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.applications).toHaveLength(1)
      expect(data.applications[0].full_name).toBe('John Doe')
      expect(data.pagination.total).toBe(1)
    })
  })

  describe('PUT /api/colleges/admin/applications/[id]/status', () => {
    it('should update application status successfully', async () => {
      const applicationId = 'app-1'
      const mockUpdatedApplication = {
        id: applicationId,
        status: 'approved',
        reviewed_at: '2024-01-16T10:00:00Z',
        reviewed_by: 'user-1'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
        error: null
      })

      const mockFrom = mockSupabase.from as jest.Mock
      mockFrom
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { role: 'college' },
                error: null
              })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: {
                  college_id: 'college-1',
                  colleges: { id: 'college-1', name: 'Test College' }
                },
                error: null
              })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: {
                  college_id: 'college-1',
                  student_id: 'student-1',
                  status: 'pending'
                },
                error: null
              })
            }))
          }))
        })
        .mockReturnValueOnce({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: mockUpdatedApplication,
                  error: null
                })
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/applications/app-1/status', {
        method: 'PUT',
        body: JSON.stringify({
          status: 'approved',
          feedback: 'Good application'
        })
      })

      const response = await PUT(request, { params: { id: applicationId } })
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Application status updated successfully')
      expect(data.application.status).toBe('approved')
    })

    it('should return 400 for invalid status', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
        error: null
      })

      const mockFrom = mockSupabase.from as jest.Mock
      mockFrom
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { role: 'college' },
                error: null
              })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: {
                  college_id: 'college-1',
                  colleges: { id: 'college-1', name: 'Test College' }
                },
                error: null
              })
            }))
          }))
        })

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/applications/app-1/status', {
        method: 'PUT',
        body: JSON.stringify({
          status: 'invalid_status'
        })
      })

      const response = await PUT(request, { params: { id: 'app-1' } })
      
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid status')
    })
  })
})