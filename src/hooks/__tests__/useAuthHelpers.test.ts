/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'

// Mock the auth context
const mockUseAuth = jest.fn()
jest.mock('@/app/providers', () => ({
  useAuth: mockUseAuth,
}))

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

describe('useAuthGuard Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return correct authentication status for authenticated user', () => {
    const mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      profile: {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        is_verified: true
      },
      loading: false,
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthGuard())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isReady).toBe(true)
    expect(result.current.hasProfile).toBe(true)
    expect(result.current.user).toEqual(mockAuthData.user)
    expect(result.current.profile).toEqual(mockAuthData.profile)
  })

  it('should return correct status for unauthenticated user', () => {
    const mockAuthData = {
      user: null,
      session: null,
      profile: null,
      loading: false,
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthGuard())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isReady).toBe(true)
    expect(result.current.hasProfile).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  it('should return not ready when loading', () => {
    const mockAuthData = {
      user: null,
      session: null,
      profile: null,
      loading: true,
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthGuard())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isReady).toBe(false)
    expect(result.current.hasProfile).toBe(false)
  })

  it('should handle authenticated user without profile', () => {
    const mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      profile: null,
      loading: false,
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthGuard())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isReady).toBe(true)
    expect(result.current.hasProfile).toBe(false)
    expect(result.current.user).toEqual(mockAuthData.user)
    expect(result.current.profile).toBeNull()
  })
})

describe('useAuthHelpers Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide role checking helpers', () => {
    const mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      profile: {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'admin',
        is_verified: true
      },
      loading: false,
      hasRole: jest.fn((role) => role === 'admin'),
      isAdmin: jest.fn(() => true),
      isStudent: jest.fn(() => false),
      isCollege: jest.fn(() => false),
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthHelpers())

    expect(result.current.hasRole('admin')).toBe(true)
    expect(result.current.hasRole('student')).toBe(false)
    expect(result.current.isAdmin()).toBe(true)
    expect(result.current.isStudent()).toBe(false)
    expect(result.current.isCollege()).toBe(false)
  })

  it('should provide authentication status helpers', () => {
    const mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      profile: {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        is_verified: true
      },
      loading: false,
      hasRole: jest.fn(),
      isAdmin: jest.fn(),
      isStudent: jest.fn(),
      isCollege: jest.fn(),
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthHelpers())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.hasCompleteProfile).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('should detect incomplete profiles', () => {
    const mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      profile: {
        id: '123',
        email: 'test@example.com',
        first_name: '', // Missing required field
        last_name: 'Doe',
        role: 'student',
        is_verified: true
      },
      loading: false,
      hasRole: jest.fn(),
      isAdmin: jest.fn(),
      isStudent: jest.fn(),
      isCollege: jest.fn(),
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthHelpers())

    expect(result.current.hasCompleteProfile).toBe(false)
  })

  it('should provide user display helpers', () => {
    const mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      profile: {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        is_verified: true
      },
      loading: false,
      hasRole: jest.fn(),
      isAdmin: jest.fn(),
      isStudent: jest.fn(),
      isCollege: jest.fn(),
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthHelpers())

    expect(result.current.getUserDisplayName()).toBe('John Doe')
    expect(result.current.getUserInitials()).toBe('JD')
  })

  it('should handle missing profile gracefully', () => {
    const mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      profile: null,
      loading: false,
      hasRole: jest.fn(() => false),
      isAdmin: jest.fn(() => false),
      isStudent: jest.fn(() => false),
      isCollege: jest.fn(() => false),
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthHelpers())

    expect(result.current.hasCompleteProfile).toBe(false)
    expect(result.current.getUserDisplayName()).toBe('test@example.com')
    expect(result.current.getUserInitials()).toBe('T')
  })

  it('should provide redirect helpers', () => {
    const mockAuthData = {
      user: null,
      session: null,
      profile: null,
      loading: false,
      requireAuth: jest.fn(),
      requireRole: jest.fn(),
      hasRole: jest.fn(),
      isAdmin: jest.fn(),
      isStudent: jest.fn(),
      isCollege: jest.fn(),
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthHelpers())

    act(() => {
      result.current.requireAuth()
    })

    expect(mockAuthData.requireAuth).toHaveBeenCalled()

    act(() => {
      result.current.requireRole('admin')
    })

    expect(mockAuthData.requireRole).toHaveBeenCalledWith('admin')
  })

  it('should provide navigation helpers', () => {
    const mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      profile: {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'admin',
        is_verified: true
      },
      loading: false,
      hasRole: jest.fn(),
      isAdmin: jest.fn(() => true),
      isStudent: jest.fn(() => false),
      isCollege: jest.fn(() => false),
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    const { result } = renderHook(() => useAuthHelpers())

    act(() => {
      result.current.navigateToRoleDashboard()
    })

    expect(mockPush).toHaveBeenCalledWith('/admin')
  })

  it('should navigate to correct dashboard based on role', () => {
    // Test student navigation
    let mockAuthData = {
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      profile: {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'student',
        is_verified: true
      },
      loading: false,
      hasRole: jest.fn(),
      isAdmin: jest.fn(() => false),
      isStudent: jest.fn(() => true),
      isCollege: jest.fn(() => false),
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    let { result } = renderHook(() => useAuthHelpers())

    act(() => {
      result.current.navigateToRoleDashboard()
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard')

    // Test college navigation
    jest.clearAllMocks()
    mockAuthData = {
      ...mockAuthData,
      profile: { ...mockAuthData.profile, role: 'college' },
      isAdmin: jest.fn(() => false),
      isStudent: jest.fn(() => false),
      isCollege: jest.fn(() => true),
    }

    mockUseAuth.mockReturnValue(mockAuthData)

    result = renderHook(() => useAuthHelpers()).result

    act(() => {
      result.current.navigateToRoleDashboard()
    })

    expect(mockPush).toHaveBeenCalledWith('/colleges/dashboard')
  })
})