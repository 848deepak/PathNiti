/**
 * Performance Validation Tests
 * 
 * This test suite validates performance improvements and elimination of redundant calls
 * in the centralized authentication system.
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthProvider } from '@/app/providers'
import Dashboard from '@/app/dashboard/page'
import Admin from '@/app/admin/page'
import Quiz from '@/app/quiz/page'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}))

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
}

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ 
      data: { subscription: { unsubscribe: jest.fn() } } 
    })),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
}

// Performance monitoring utilities
class PerformanceMonitor {
  private callCounts: Map<string, number> = new Map()
  private renderTimes: number[] = []

  trackCall(method: string) {
    const current = this.callCounts.get(method) || 0
    this.callCounts.set(method, current + 1)
  }

  getCallCount(method: string): number {
    return this.callCounts.get(method) || 0
  }

  trackRenderTime(time: number) {
    this.renderTimes.push(time)
  }

  getAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0
    return this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length
  }

  reset() {
    this.callCounts.clear()
    this.renderTimes = []
  }
}

const performanceMonitor = new PerformanceMonitor()

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('Performance Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    performanceMonitor.reset()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)

    // Track method calls
    const originalGetUser = mockSupabase.auth.getUser
    const originalGetSession = mockSupabase.auth.getSession
    const originalFrom = mockSupabase.from

    mockSupabase.auth.getUser = jest.fn((...args) => {
      performanceMonitor.trackCall('getUser')
      return originalGetUser(...args)
    })

    mockSupabase.auth.getSession = jest.fn((...args) => {
      performanceMonitor.trackCall('getSession')
      return originalGetSession(...args)
    })

    mockSupabase.from = jest.fn((...args) => {
      performanceMonitor.trackCall('profileFetch')
      return originalFrom(...args)
    })
  })

  describe('Elimination of Redundant API Calls', () => {
    it('should make only one authentication call per session', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'student',
        full_name: 'Test User',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      // Should make minimal API calls
      expect(performanceMonitor.getCallCount('getUser')).toBeLessThanOrEqual(1)
      expect(performanceMonitor.getCallCount('profileFetch')).toBeLessThanOrEqual(1)
    })

    it('should not refetch data when navigating between pages', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'student',
        full_name: 'Test User',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      const initialUserCalls = performanceMonitor.getCallCount('getUser')
      const initialProfileCalls = performanceMonitor.getCallCount('profileFetch')

      // Navigate to different page
      rerender(
        <TestWrapper>
          <Quiz />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Career Assessment Quiz')).toBeInTheDocument()
      })

      // Should not make additional calls
      expect(performanceMonitor.getCallCount('getUser')).toBe(initialUserCalls)
      expect(performanceMonitor.getCallCount('profileFetch')).toBe(initialProfileCalls)
    })

    it('should share authentication state across multiple components', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'admin',
        full_name: 'Test Admin',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      // Render multiple components that use authentication
      render(
        <TestWrapper>
          <div>
            <Dashboard />
            <Admin />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })

      // Should make only one set of API calls for all components
      expect(performanceMonitor.getCallCount('getUser')).toBeLessThanOrEqual(1)
      expect(performanceMonitor.getCallCount('profileFetch')).toBeLessThanOrEqual(1)
    })
  })

  describe('Render Performance', () => {
    it('should have fast initial render times', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })

      const startTime = performance.now()

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      performanceMonitor.trackRenderTime(renderTime)

      // Initial render should be fast (under 100ms)
      expect(renderTime).toBeLessThan(100)
    })

    it('should have consistent render performance across pages', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'student',
        full_name: 'Test User',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      const pages = [Dashboard, Quiz]
      const renderTimes: number[] = []

      for (const PageComponent of pages) {
        const startTime = performance.now()
        
        const { unmount } = render(
          <TestWrapper>
            <PageComponent />
          </TestWrapper>
        )

        await waitFor(() => {
          expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
        })

        const endTime = performance.now()
        renderTimes.push(endTime - startTime)
        
        unmount()
      }

      // Render times should be consistent (variance < 50ms)
      const maxTime = Math.max(...renderTimes)
      const minTime = Math.min(...renderTimes)
      expect(maxTime - minTime).toBeLessThan(50)
    })
  })

  describe('Memory Usage Optimization', () => {
    it('should not create memory leaks with multiple renders', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })

      // Track subscription cleanup
      const unsubscribeMock = jest.fn()
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } }
      })

      const { unmount } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Unmount component
      unmount()

      // Should clean up subscriptions
      expect(unsubscribeMock).toHaveBeenCalled()
    })

    it('should efficiently handle rapid state changes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      let authStateCallback: ((event: string, session: any) => void) | null = null

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      // Simulate rapid auth state changes
      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_IN', { user: mockUser })
          authStateCallback('TOKEN_REFRESHED', { user: mockUser })
          authStateCallback('SIGNED_OUT', null)
          authStateCallback('SIGNED_IN', { user: mockUser })
        })
      }

      // Should handle rapid changes without excessive re-renders
      await waitFor(() => {
        expect(performanceMonitor.getCallCount('getUser')).toBeLessThanOrEqual(2)
      })
    })
  })

  describe('Caching Effectiveness', () => {
    it('should cache authentication state effectively', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      const mockProfile = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'student',
        full_name: 'Test User',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      })

      const initialCalls = performanceMonitor.getCallCount('getUser')

      // Multiple re-renders should use cached data
      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper>
            <Dashboard />
          </TestWrapper>
        )
      }

      // Should not make additional API calls
      expect(performanceMonitor.getCallCount('getUser')).toBe(initialCalls)
    })

    it('should invalidate cache appropriately on auth state changes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        user_metadata: {},
      }

      let authStateCallback: ((event: string, session: any) => void) | null = null

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })
      mockSupabase.auth.getSession.mockResolvedValue({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(performanceMonitor.getCallCount('getUser')).toBeGreaterThan(0)
      })

      const initialCalls = performanceMonitor.getCallCount('getUser')

      // Simulate sign out
      if (authStateCallback) {
        act(() => {
          authStateCallback('SIGNED_OUT', null)
        })
      }

      // Should handle auth state change appropriately
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      })
    })
  })
})