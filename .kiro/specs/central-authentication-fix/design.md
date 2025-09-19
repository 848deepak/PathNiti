# Design Document

## Overview

This design addresses the centralization of authentication logic in the PathNiti Next.js application. The current implementation has a robust AuthProvider but individual pages are bypassing it with redundant authentication checks. The solution involves refactoring pages to use the central authentication system, enhancing middleware for server-side protection, and eliminating duplicate authentication logic.

## Architecture

### Current State Analysis

**Strengths:**
- Comprehensive AuthProvider in `src/app/providers.tsx` with full authentication lifecycle management
- Proper session management with `onAuthStateChange` listeners
- Role-based access control helpers (isAdmin, isStudent, isCollege)
- Supabase integration with proper error handling

**Issues:**
- Pages like dashboard, admin, and quiz perform individual `supabase.auth.getUser()` calls
- Redundant profile fetching logic in multiple components
- Middleware exists but doesn't enforce authentication server-side
- Race conditions between page-level auth checks and central provider

### Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  Middleware (Enhanced)                                      │
│  - Route protection                                         │
│  - Role-based redirects                                     │
│  - Session validation                                       │
├─────────────────────────────────────────────────────────────┤
│  Root Layout                                                │
│  └── AuthProvider (Central State Management)               │
│      ├── Session Management                                │
│      ├── Profile Management                                │
│      ├── Role-based Helpers                               │
│      └── Authentication Methods                            │
├─────────────────────────────────────────────────────────────┤
│  Pages (Simplified)                                        │
│  ├── Dashboard (uses useAuth only)                        │
│  ├── Admin (uses useAuth only)                            │
│  ├── Quiz (uses useAuth only)                             │
│  └── Other pages (uses useAuth only)                      │
├─────────────────────────────────────────────────────────────┤
│  Supabase Client                                           │
│  └── Single source of truth for auth state                │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Enhanced AuthProvider

The existing AuthProvider is already well-designed but needs to be the single source of truth:

```typescript
interface AuthContextType {
  // Existing properties (keep as-is)
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  
  // Authentication methods (keep as-is)
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  // ... other auth methods
  
  // Role helpers (keep as-is)
  hasRole: (role: string) => boolean
  isAdmin: () => boolean
  isStudent: () => boolean
  isCollege: () => boolean
  
  // New: Centralized redirect helpers
  requireAuth: () => void
  requireRole: (role: string) => void
}
```

### Page Component Pattern

All pages should follow this simplified pattern:

```typescript
export default function PageComponent() {
  const { user, profile, loading, requireAuth } = useAuth()
  
  // Single auth check using central provider
  useEffect(() => {
    requireAuth()
  }, [requireAuth])
  
  // Simple loading state from central provider
  if (loading) return <LoadingComponent />
  
  // Use user and profile from context
  return <PageContent user={user} profile={profile} />
}
```

### Enhanced Middleware

The middleware should be enhanced to handle authentication at the request level:

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Enhanced route protection logic
  if (isProtectedRoute(pathname)) {
    return enforceAuthentication(request)
  }
  
  if (isRoleSpecificRoute(pathname)) {
    return enforceRoleAccess(request)
  }
  
  return NextResponse.next()
}
```

## Data Models

### Authentication State Flow

```
Initial Load → Check Session → Update Context → Notify Components
     ↓              ↓              ↓              ↓
  Loading=true → Session Found → User/Profile → Loading=false
     ↓              ↓              ↓              ↓
  Show Loading → Fetch Profile → Update State → Render Page
```

### Profile Management

The AuthProvider already handles profile creation and fetching correctly. Pages should not duplicate this logic.

## Error Handling

### Centralized Error Handling

All authentication errors should be handled in the AuthProvider:

1. **Session Errors**: Handle expired sessions, invalid tokens
2. **Profile Errors**: Handle missing profiles, creation failures
3. **Network Errors**: Handle connection issues, timeouts
4. **Permission Errors**: Handle role-based access denials

### Error Recovery

- Automatic session refresh on token expiration
- Graceful fallback to login page on authentication failures
- User-friendly error messages for network issues

## Testing Strategy

### Unit Tests

1. **AuthProvider Tests**:
   - Session management lifecycle
   - Profile creation and fetching
   - Role-based access control
   - Error handling scenarios

2. **Page Component Tests**:
   - Proper use of useAuth hook
   - Loading state handling
   - Redirect behavior for unauthenticated users

3. **Middleware Tests**:
   - Route protection logic
   - Role-based redirects
   - Public route access

### Integration Tests

1. **Authentication Flow Tests**:
   - Login → Dashboard navigation
   - Session persistence across page reloads
   - Logout → Redirect to login

2. **Role-based Access Tests**:
   - Admin access to admin pages
   - Student access restrictions
   - College dashboard access

### Performance Tests

1. **Authentication Performance**:
   - Initial load time with auth check
   - Page navigation speed
   - Memory usage of auth context

2. **Network Efficiency**:
   - Elimination of redundant API calls
   - Session refresh frequency
   - Profile fetch optimization

## Implementation Approach

### Phase 1: Page Refactoring
- Remove individual authentication logic from pages
- Replace with useAuth hook usage
- Eliminate redundant profile fetching

### Phase 2: Middleware Enhancement
- Implement server-side route protection
- Add role-based access control
- Improve redirect logic

### Phase 3: Performance Optimization
- Optimize context re-renders
- Implement proper loading states
- Add error boundaries

### Phase 4: Testing and Validation
- Comprehensive test coverage
- Performance benchmarking
- User experience validation

## Security Considerations

1. **Session Security**: Maintain existing secure session handling
2. **Role Validation**: Ensure role checks are performed server-side when possible
3. **Token Management**: Keep existing token refresh and validation logic
4. **CSRF Protection**: Maintain existing CSRF protections in Supabase integration

## Migration Strategy

1. **Backward Compatibility**: Ensure existing functionality continues to work during migration
2. **Gradual Rollout**: Refactor pages one by one to minimize risk
3. **Rollback Plan**: Keep original implementations available for quick rollback if needed
4. **Monitoring**: Add logging to track authentication performance and errors