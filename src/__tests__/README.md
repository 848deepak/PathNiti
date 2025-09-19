# Centralized Authentication Tests

This directory contains comprehensive unit tests for the centralized authentication system implemented in PathNiti. The tests cover all aspects of the authentication refactoring as specified in the requirements.

## Test Coverage

### 1. Enhanced AuthProvider Tests (`src/components/__tests__/AuthProvider.test.tsx`)

Tests the core authentication provider functionality:

- **requireAuth() method**: Tests redirect behavior for unauthenticated users, users without profiles, and authenticated users
- **requireRole() method**: Tests role-based access control and appropriate redirects
- **Role helper methods**: Tests isAdmin(), isStudent(), isCollege() functionality
- **Authentication state management**: Tests loading states, session handling, and profile management
- **Context interface**: Validates that all required methods are present in the AuthContext

**Requirements covered**: 1.1, 1.2, 2.2, 2.3

### 2. Page Component Tests (`src/components/__tests__/PageComponents.test.tsx`)

Tests refactored page components using centralized authentication:

- **Dashboard Page**: Tests use of useAuth hook instead of individual authentication calls
- **Admin Page**: Tests requireRole() usage and role-based access control
- **Quiz Page**: Tests elimination of redundant authentication checks
- **Common patterns**: Tests consistent loading states and authentication enforcement

**Requirements covered**: 1.1, 1.2, 1.3, 4.1

### 3. Middleware Tests (`src/__tests__/middleware.test.ts`)

Tests enhanced middleware for server-side route protection:

- **Route protection**: Tests authentication enforcement for protected routes
- **Role-based access control**: Tests admin and college route restrictions
- **Session validation**: Tests session validation with retry logic and error handling
- **Profile validation**: Tests profile completeness checks and redirects
- **Error handling**: Tests graceful handling of authentication errors
- **Static file handling**: Tests middleware bypass for static assets

**Requirements covered**: 3.1, 3.2, 3.3

### 4. Authentication Helper Tests (`src/hooks/__tests__/useAuthHelpers.test.ts`)

Tests authentication helper hooks:

- **useAuthGuard**: Tests authentication status detection and readiness checks
- **useAuthHelpers**: Tests role checking, user display helpers, and navigation utilities
- **Edge cases**: Tests handling of incomplete profiles and missing data

**Requirements covered**: 1.1, 2.1, 4.2

### 5. Authentication Utilities Tests (`src/lib/__tests__/auth-utils.test.ts`)

Tests core authentication utility functions:

- **Role checking**: Tests hasRole() function with various scenarios
- **Authentication validation**: Tests isAuthenticated() and session validation
- **Profile validation**: Tests hasCompleteProfile() and profile completeness checks
- **User display helpers**: Tests getUserDisplayName() and getUserInitials()
- **Redirect utilities**: Tests getRedirectPath() for role-based navigation
- **Edge cases**: Tests handling of null values, special characters, and error conditions

**Requirements covered**: 1.1, 1.2, 4.2

### 6. Authentication Components Tests (`src/components/__tests__/AuthComponents.test.tsx`)

Tests authentication UI components:

- **AuthGuard**: Tests conditional rendering based on authentication status
- **AuthLoading**: Tests loading state components and customization
- **AuthStatus**: Tests user status display and sign-out functionality
- **withAuth HOC**: Tests higher-order component for page protection
- **Component integration**: Tests how components work together

**Requirements covered**: 1.1, 2.1, 4.2

## Test Configuration

### Jest Configuration (`jest.config.js`)

- Configured for Next.js with `next/jest`
- TypeScript support with path mapping
- JSdom environment for React component testing
- Coverage collection from source files
- Proper test file matching patterns

### Jest Setup (`jest.setup.js`)

- Testing Library Jest DOM matchers
- Mock implementations for browser APIs (IntersectionObserver, ResizeObserver, matchMedia)
- Local/session storage mocks
- Console error suppression for cleaner test output

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## Test Structure

Each test file follows a consistent structure:

1. **Setup**: Mock dependencies and create test utilities
2. **Test Groups**: Organized by functionality with descriptive describe blocks
3. **Test Cases**: Individual test cases with clear assertions
4. **Edge Cases**: Tests for error conditions and boundary cases
5. **Integration**: Tests for component interaction and workflow

## Mock Strategy

The tests use comprehensive mocking to isolate units under test:

- **Next.js Router**: Mocked to test navigation behavior
- **Supabase Client**: Mocked to control authentication responses
- **Auth Context**: Mocked to test component behavior with different auth states
- **UI Components**: Mocked to focus on logic rather than rendering

## Coverage Goals

The tests aim for comprehensive coverage of:

- **Functionality**: All authentication methods and helpers
- **Edge Cases**: Error conditions, null values, and boundary cases
- **Integration**: Component interaction and workflow testing
- **Requirements**: All specified requirements from the design document

## Maintenance

When adding new authentication features:

1. Add corresponding test cases to the appropriate test file
2. Update mocks if new dependencies are introduced
3. Ensure test coverage remains comprehensive
4. Update this README if new test files are added

## Performance Considerations

The tests are designed to:

- Run quickly with minimal setup overhead
- Use mocks to avoid external dependencies
- Focus on logic rather than rendering performance
- Provide clear feedback on test failures

This comprehensive test suite ensures that the centralized authentication system works correctly and maintains consistency across all components and pages in the application.