# Design Document

## Overview

The Dynamic College Profiles system extends the existing PathNiti platform to provide colleges with comprehensive profile management capabilities and students with detailed college information through unique URLs. The system integrates with the existing Supabase database schema and authentication system while adding new functionality for college registration, profile management, student applications, and dynamic content updates.

## Architecture

### System Components

The system follows a Next.js App Router architecture with the following key components:

1. **Frontend Components**
   - College profile pages with dynamic routing
   - College registration and management dashboards
   - Student application forms and dashboards
   - Enhanced college listing with dynamic cards

2. **Backend API Routes**
   - College registration and profile management endpoints
   - Student application submission and management
   - Dynamic content serving for college profiles
   - File upload handling for documents

3. **Database Extensions**
   - New tables for student applications and college content
   - Enhanced college data structure for profile information
   - Document storage references and metadata

4. **Authentication & Authorization**
   - Role-based access control for college administrators
   - Student application tracking and status management
   - Secure document upload and access controls

### Technology Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Authentication**: Supabase Auth with RLS policies
- **File Storage**: Supabase Storage for document uploads
- **UI Components**: Existing UI component library (shadcn/ui)

## Components and Interfaces

### 1. College Profile System

#### College Slug Generation
```typescript
interface CollegeSlugService {
  generateSlug(collegeName: string): string
  ensureUniqueSlug(slug: string, collegeId?: string): Promise<string>
  validateSlug(slug: string): boolean
}
```

#### Dynamic Profile Page Component
```typescript
interface CollegeProfilePageProps {
  params: { slug: string }
}

interface CollegeProfileData {
  id: string
  slug: string
  name: string
  type: college_type
  location: LocationData
  address: string
  website?: string
  phone?: string
  email?: string
  established_year?: number
  accreditation?: string[]
  about?: string
  admission_criteria?: AdmissionCriteria
  scholarships?: ScholarshipInfo[]
  entrance_tests?: EntranceTestInfo[]
  fee_structure?: FeeStructure
  gallery?: string[]
  courses: Course[]
  notices: Notice[]
  events: Event[]
}
```

### 2. Student Application System

#### Application Form Component
```typescript
interface StudentApplicationForm {
  collegeId: string
  onSubmit: (data: ApplicationData) => Promise<void>
  onFileUpload: (file: File, type: DocumentType) => Promise<string>
}

interface ApplicationData {
  full_name: string
  email: string
  phone: string
  class_stream: string
  documents: {
    marksheet_10th: string // file URL
    marksheet_12th: string // file URL
    other_documents: string[] // file URLs
  }
}
```

#### Application Status Dashboard
```typescript
interface StudentDashboard {
  applications: StudentApplication[]
  notifications: ApplicationNotification[]
  onUpdateDocuments: (applicationId: string, documents: DocumentUpdate[]) => Promise<void>
}

interface StudentApplication {
  id: string
  college_name: string
  college_slug: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  last_updated: string
  documents: ApplicationDocument[]
  feedback?: string
}
```

### 3. College Management Dashboard

#### College Admin Interface
```typescript
interface CollegeAdminDashboard {
  college: CollegeProfileData
  applications: StudentApplication[]
  onUpdateCollege: (data: Partial<CollegeProfileData>) => Promise<void>
  onManageApplication: (applicationId: string, action: ApplicationAction) => Promise<void>
  onAddCourse: (course: CourseData) => Promise<void>
  onUpdateCourse: (courseId: string, data: Partial<CourseData>) => Promise<void>
  onDeleteCourse: (courseId: string) => Promise<void>
  onAddNotice: (notice: NoticeData) => Promise<void>
}

interface ApplicationAction {
  type: 'approve' | 'reject'
  feedback?: string
}
```

## Data Models

### Enhanced College Schema

```sql
-- Add new columns to existing colleges table
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS admission_criteria JSONB;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS scholarships JSONB;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS entrance_tests JSONB;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS gallery TEXT[];

-- Create unique index for slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_colleges_slug ON public.colleges(slug);
```

### Student Applications Table

```sql
CREATE TABLE public.student_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    class_stream TEXT NOT NULL,
    documents JSONB NOT NULL, -- {marksheet_10th: url, marksheet_12th: url, other_documents: [urls]}
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### College Courses Table

```sql
CREATE TABLE public.college_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    eligibility TEXT,
    fees JSONB,
    seats INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### College Notices Table

```sql
CREATE TABLE public.college_notices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'admission', 'event', 'urgent')),
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### College Profile Management

#### GET /api/colleges/[slug]
- Fetch college profile data by slug
- Public endpoint for profile page rendering
- Returns complete college information including courses and notices

#### POST /api/colleges/register
- Register new college with profile information
- Creates college record and generates unique slug
- Requires authentication and college role

#### PUT /api/colleges/[slug]/profile
- Update college profile information
- Restricted to college administrators
- Updates college data and maintains slug consistency

### Student Application Management

#### POST /api/colleges/[slug]/apply
- Submit student application to specific college
- Handles file uploads for documents
- Creates application record and sends notifications

#### GET /api/students/applications
- Fetch student's application history
- Returns applications with status and college information
- Restricted to authenticated students

#### PUT /api/students/applications/[id]/documents
- Update application documents
- Allows document replacement for rejected applications
- Resets application status to pending

### College Administration

#### GET /api/colleges/admin/applications
- Fetch applications for college administrator
- Returns pending and processed applications
- Restricted to college administrators

#### PUT /api/colleges/admin/applications/[id]/status
- Update application status (approve/reject)
- Sends notification to student
- Records reviewer information

#### POST /api/colleges/admin/courses
- Add new course to college profile
- Updates college course offerings
- Restricted to college administrators

## Error Handling

### Application-Level Error Handling

1. **Slug Conflicts**: Automatic resolution with numbered suffixes
2. **File Upload Failures**: Retry mechanism with user feedback
3. **Database Constraints**: Graceful error messages for users
4. **Authentication Errors**: Proper redirect to login/signup flows

### API Error Responses

```typescript
interface APIError {
  error: string
  code: string
  details?: any
}

// Standard error codes
const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_SLUG: 'DUPLICATE_SLUG',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR'
} as const
```

## Testing Strategy

### Unit Testing

1. **Slug Generation Logic**
   - Test unique slug generation
   - Test slug validation rules
   - Test conflict resolution

2. **Form Validation**
   - Test application form validation
   - Test file upload validation
   - Test college profile validation

3. **Data Transformations**
   - Test college data serialization
   - Test application status updates
   - Test notification generation

### Integration Testing

1. **API Endpoint Testing**
   - Test college registration flow
   - Test student application submission
   - Test application status management

2. **Database Operations**
   - Test college profile CRUD operations
   - Test application lifecycle management
   - Test file storage integration

3. **Authentication & Authorization**
   - Test role-based access controls
   - Test RLS policy enforcement
   - Test session management

### End-to-End Testing

1. **College Registration Flow**
   - Complete college signup and profile creation
   - Verify dynamic profile page generation
   - Test profile information updates

2. **Student Application Flow**
   - Submit application with document uploads
   - Verify application status tracking
   - Test document update functionality

3. **College Administration Flow**
   - Review and process student applications
   - Manage college courses and notices
   - Verify real-time profile updates

## Performance Considerations

### Database Optimization

1. **Indexing Strategy**
   - Index on college slug for fast profile lookups
   - Index on application status for dashboard queries
   - Composite indexes for filtered searches

2. **Query Optimization**
   - Use select specific columns to reduce payload
   - Implement pagination for large datasets
   - Cache frequently accessed college profiles

### File Storage Optimization

1. **Document Upload**
   - Implement file size limits and validation
   - Use progressive upload with progress indicators
   - Optimize file storage paths for quick access

2. **Image Handling**
   - Implement image compression for gallery uploads
   - Use responsive image loading for profile pages
   - Cache images with appropriate headers

### Frontend Performance

1. **Dynamic Routing**
   - Implement ISR (Incremental Static Regeneration) for college profiles
   - Use dynamic imports for heavy components
   - Optimize bundle size with code splitting

2. **Real-time Updates**
   - Use Supabase real-time subscriptions for application status
   - Implement optimistic updates for better UX
   - Cache college data with appropriate invalidation

## Security Considerations

### Data Protection

1. **Document Security**
   - Implement secure file upload with virus scanning
   - Use signed URLs for document access
   - Encrypt sensitive documents at rest

2. **Access Control**
   - Enforce RLS policies for all data access
   - Validate user permissions on every request
   - Implement rate limiting for API endpoints

### Input Validation

1. **Form Security**
   - Sanitize all user inputs
   - Validate file types and sizes
   - Implement CSRF protection

2. **SQL Injection Prevention**
   - Use parameterized queries exclusively
   - Validate all database inputs
   - Implement proper error handling without data leakage