/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock the Supabase middleware client
const mockGetSession = jest.fn()
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

jest.mock('@/lib/supabase/middleware', () => ({
  createClient: jest.fn(() => ({
    supabase: {
      auth: {
        getSession: mockGetSession,
      },
      from: mockFrom,
    },
    response: NextResponse.next(),
  })),
}))

// Mock NextResponse
const mockRedirect = jest.fn()
const mockNext = jest.fn()

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: mockRedirect,
    next: mockNext,
  },
}))

// Helper function to create a mock request
function createMockRequest(pathname: string, searchParams: Record<string, string> = {}) {
  const url = new URL(`http://localhost:3000${pathname}`)
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return {
    nextUrl: {
      pathname,
      search: url.search,
    },
    url: url.toString(),
  } as NextRequest
}

// Helper function to create mock session
function createMockSession(userId: string = '123', role: string = 'student') {
  return {
    user: {
      id: userId,
      email: 'test@example.com',
    },
    access_token: 'mock-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  }
}

// Helper function to create mock profile
function createMockProfile(role: string = 'student') {
  return {
    id: '123',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role,
    is_verified: true,
  }
}

describe('Enhanced Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          single: mockSingle,
        }),
      }),
    })
    
    mockNext.mockReturnValue(NextResponse.next())
    mockRedirect.mockImplementation((url) => ({ redirect: url }))
  })

  describe('Route Protection', () => {
    it('should allow access to public routes without authentication', async () => {
      const publicRoutes = ['/', '/about', '/contact', '/features', '/colleges']
      
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
      
      for (const route of publicRoutes) {
        const request = createMockRequest(route)
        await middleware(request)
        
        // Should not redirect for public routes
        expect(mockRedirect).not.toHaveBeenCalled()
      }
    })

    it('should redirect unauthenticated users from protected routes to login', async () => {
      const protectedRoutes = ['/dashboard', '/profile', '/quiz', '/timeline', '/scholarships']
      
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
      
      for (const route of protectedRoutes) {
        jest.clearAllMocks()
        const request = createMockRequest(route)
        await middleware(request)
        
        // Should redirect to login with return URL
        expect(mockRedirect).toHaveBeenCalledWith(
          expect.objectContaining({
            href: expect.stringContaining('/auth/login'),
          })
        )
      }
    })

    it('should allow authenticated users to access protected routes', async () => {
      const session = createMockSession()
      const profile = createMockProfile('student')
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: profile, error: null })
      
      const request = createMockRequest('/dashboard')
      await middleware(request)
      
      // Should not redirect
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('Role-based Access Control', () => {
    it('should allow admin users to access admin routes', async () => {
      const session = createMockSession('123', 'admin')
      const profile = createMockProfile('admin')
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: profile, error: null })
      
      const request = createMockRequest('/admin')
      await middleware(request)
      
      // Should not redirect
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect non-admin users from admin routes', async () => {
      const session = createMockSession('123', 'student')
      const profile = createMockProfile('student')
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: profile, error: null })
      
      const request = createMockRequest('/admin')
      await middleware(request)
      
      // Should redirect to dashboard with unauthorized error
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/dashboard'),
        })
      )
    })

    it('should allow college users to access college routes', async () => {
      const session = createMockSession('123', 'college')
      const profile = createMockProfile('college')
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: profile, error: null })
      
      const request = createMockRequest('/colleges/dashboard')
      await middleware(request)
      
      // Should not redirect
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect non-college users from college routes', async () => {
      const session = createMockSession('123', 'student')
      const profile = createMockProfile('student')
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: profile, error: null })
      
      const request = createMockRequest('/colleges/dashboard')
      await middleware(request)
      
      // Should redirect to dashboard with unauthorized error
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/dashboard'),
        })
      )
    })
  })

  describe('Session Validation', () => {
    it('should handle session validation errors gracefully', async () => {
      mockGetSession.mockResolvedValue({ 
        data: { session: null }, 
        error: { message: 'Session invalid' } 
      })
      
      const request = createMockRequest('/dashboard')
      await middleware(request)
      
      // Should redirect to login for protected routes
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/auth/login'),
        })
      )
    })

    it('should retry session validation on failure', async () => {
      // First call fails, second succeeds
      mockGetSession
        .mockResolvedValueOnce({ data: { session: null }, error: { message: 'Network error' } })
        .mockResolvedValueOnce({ 
          data: { session: createMockSession() }, 
          error: null 
        })
      
      mockSingle.mockResolvedValue({ data: createMockProfile(), error: null })
      
      const request = createMockRequest('/dashboard')
      await middleware(request)
      
      // Should have retried and succeeded
      expect(mockGetSession).toHaveBeenCalledTimes(2)
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should handle expired sessions', async () => {
      const expiredSession = {
        ...createMockSession(),
        expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      }
      
      mockGetSession.mockResolvedValue({ data: { session: expiredSession }, error: null })
      
      const request = createMockRequest('/dashboard')
      await middleware(request)
      
      // Should redirect to login for expired session
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/auth/login'),
        })
      )
    })
  })

  describe('Profile Validation', () => {
    it('should redirect to complete profile when profile is missing', async () => {
      const session = createMockSession()
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      
      const request = createMockRequest('/admin')
      await middleware(request)
      
      // Should redirect to complete profile
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/auth/complete-profile'),
        })
      )
    })

    it('should redirect to complete profile when profile is incomplete', async () => {
      const session = createMockSession()
      const incompleteProfile = {
        ...createMockProfile(),
        first_name: '', // Missing required field
      }
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: incompleteProfile, error: null })
      
      const request = createMockRequest('/admin')
      await middleware(request)
      
      // Should redirect to complete profile
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/auth/complete-profile'),
        })
      )
    })

    it('should handle profile fetch errors', async () => {
      const session = createMockSession()
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Database error' } })
      
      const request = createMockRequest('/admin')
      await middleware(request)
      
      // Should redirect to login on profile error
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/auth/login'),
        })
      )
    })
  })

  describe('Auth-only Routes', () => {
    it('should redirect authenticated users away from login page', async () => {
      const session = createMockSession()
      const profile = createMockProfile()
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: profile, error: null })
      
      const request = createMockRequest('/auth/login')
      await middleware(request)
      
      // Should redirect to dashboard
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/dashboard'),
        })
      )
    })

    it('should allow unauthenticated users to access login page', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
      
      const request = createMockRequest('/auth/login')
      await middleware(request)
      
      // Should not redirect
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('Static File Handling', () => {
    it('should skip middleware for static files', async () => {
      const staticPaths = [
        '/_next/static/chunk.js',
        '/favicon.ico',
        '/icons/icon-192x192.svg',
        '/sw.js',
        '/manifest.json',
      ]
      
      for (const path of staticPaths) {
        const request = createMockRequest(path)
        await middleware(request)
        
        // Should not call getSession for static files
        expect(mockGetSession).not.toHaveBeenCalled()
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      mockGetSession.mockRejectedValue(new Error('Unexpected error'))
      
      const request = createMockRequest('/dashboard')
      await middleware(request)
      
      // Should redirect to login for protected routes on unexpected errors
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/auth/login'),
        })
      )
    })

    it('should allow public routes to proceed on unexpected errors', async () => {
      mockGetSession.mockRejectedValue(new Error('Unexpected error'))
      
      const request = createMockRequest('/')
      await middleware(request)
      
      // Should not redirect for public routes
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('Redirect URL Preservation', () => {
    it('should preserve return URL when redirecting to login', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
      
      const request = createMockRequest('/dashboard', { param: 'value' })
      await middleware(request)
      
      // Should include return URL in redirect
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringMatching(/returnUrl=%2Fdashboard/),
        })
      )
    })

    it('should preserve return URL when redirecting to complete profile', async () => {
      const session = createMockSession()
      
      mockGetSession.mockResolvedValue({ data: { session }, error: null })
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      
      const request = createMockRequest('/admin')
      await middleware(request)
      
      // Should include return URL in redirect
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringMatching(/returnUrl=%2Fadmin/),
        })
      )
    })
  })
})