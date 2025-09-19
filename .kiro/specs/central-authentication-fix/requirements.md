# Requirements Document

## Introduction

The PathNiti application currently has a comprehensive authentication provider but individual pages are performing redundant authentication checks and profile fetching instead of relying on the centralized system. This creates unnecessary complexity, potential race conditions, and inconsistent user experience. The goal is to eliminate duplicate authentication logic and ensure all pages use the central authentication system.

## Requirements

### Requirement 1

**User Story:** As a developer, I want all pages to use the central authentication provider instead of performing individual authentication checks, so that the codebase is maintainable and consistent.

#### Acceptance Criteria

1. WHEN a page loads THEN it SHALL use the useAuth hook from the central provider instead of calling supabase.auth.getUser() directly
2. WHEN a page needs user information THEN it SHALL access user, session, and profile from the useAuth context instead of fetching them individually
3. WHEN a page needs to check authentication status THEN it SHALL use the loading state from useAuth instead of implementing its own loading logic

### Requirement 2

**User Story:** As a user, I want consistent authentication behavior across all pages, so that I have a seamless experience when navigating the application.

#### Acceptance Criteria

1. WHEN I navigate between pages THEN the authentication state SHALL be consistent across all pages
2. WHEN I am not authenticated THEN I SHALL be redirected to login consistently from all protected pages
3. WHEN my session expires THEN I SHALL be handled consistently across all pages without duplicate redirects

### Requirement 3

**User Story:** As a developer, I want the middleware to properly enforce authentication for protected routes, so that authentication is handled at the request level rather than in individual components.

#### Acceptance Criteria

1. WHEN a user accesses a protected route without authentication THEN the middleware SHALL redirect them to login
2. WHEN a user accesses an admin route without admin privileges THEN the middleware SHALL redirect them appropriately
3. WHEN a user accesses a public route THEN the middleware SHALL allow access without authentication checks

### Requirement 4

**User Story:** As a developer, I want to eliminate redundant profile fetching logic from individual pages, so that profile data is managed centrally and consistently.

#### Acceptance Criteria

1. WHEN a page needs profile information THEN it SHALL use the profile from useAuth context instead of fetching it directly
2. WHEN profile data is updated THEN it SHALL be updated in the central provider and reflected across all pages
3. WHEN profile creation is needed THEN it SHALL be handled by the central provider instead of individual pages

### Requirement 5

**User Story:** As a user, I want faster page loads and better performance, so that I can navigate the application efficiently.

#### Acceptance Criteria

1. WHEN I navigate between pages THEN there SHALL be no redundant API calls for authentication or profile data
2. WHEN I load a page THEN it SHALL use cached authentication state instead of re-fetching from the server
3. WHEN authentication state changes THEN it SHALL be propagated efficiently to all components using the context