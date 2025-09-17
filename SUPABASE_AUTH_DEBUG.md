# Supabase Manual Authentication Code - Debugging Reference

## 1. Sign-up Flow with Email/Password

### Student Sign-up
```typescript
const signUpStudent = async (email: string, password: string, userData: {
  first_name: string
  last_name: string
  phone?: string
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...userData,
        role: 'student'
      }
    }
  })
  // Profile created after email verification
}
```

### College Sign-up
```typescript
const signUpCollege = async (email: string, password: string, userData: {
  first_name: string
  last_name: string
  phone?: string
  college_id: string
  contact_person: string
  designation?: string
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...userData,
        role: 'college'
      }
    }
  })
}
```

### Admin Sign-up
```typescript
const signUpAdmin = async (email: string, password: string, userData: {
  first_name: string
  last_name: string
  phone?: string
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...userData,
        role: 'admin'
      }
    }
  })
}
```

## 2. Verification Link Callback Handler

```typescript
// src/app/auth/callback/page.tsx
const handleAuthCallback = async () => {
  const { data, error } = await supabase.auth.getSession()
  
  if (data.session?.user) {
    // Check if user has completed profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single()

    if (profile) {
      router.push("/")
    } else {
      router.push("/auth/complete-profile")
    }
  } else {
    router.push("/auth/login")
  }
}
```

## 3. Sign-in Function with Email/Password

```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return { data, error: null }
}
```

## 4. User Metadata Storage and Profile Creation

### Metadata stored in Supabase Auth
```typescript
// During signup, metadata is stored in user.user_metadata
options: {
  data: {
    first_name: formData.firstName,
    last_name: formData.lastName,
    role: 'student' // or 'college' or 'admin'
  }
}
```

### Profile creation after email verification
```typescript
const createUserProfile = async (user: User): Promise<UserProfile | null> => {
  const userData = user.user_metadata
  const role = userData.role || 'student'
  
  const profileData = {
    id: user.id,
    email: user.email!,
    first_name: userData.first_name || '',
    last_name: userData.last_name || '',
    phone: userData.phone || null,
    role: role
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single()

  return data as UserProfile
}
```

### Auth state change listener
```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    let userProfile = await fetchUserProfile(session.user.id)
    
    // If profile doesn't exist, create it (user just verified email)
    if (!userProfile) {
      userProfile = await createUserProfile(session.user)
    }
    
    setProfile(userProfile)
  }
})
```

## 5. Supabase Client Initialization

```typescript
// src/lib/supabase-new.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

## 6. Role Assignment Logic

### During Registration
- Student: `role: 'student'` in metadata
- College: `role: 'college'` in metadata  
- Admin: `role: 'admin'` in metadata

### Profile Creation
```typescript
// Role determined from user_metadata during profile creation
const role = userData.role || 'student'
```

## 7. Middleware and RLS Policies

### Middleware (allows client-side auth)
```typescript
// Protected routes handled client-side to prevent redirect loops
if (isProtectedRoute || isAdminRoute || isCollegeRoute) {
  return response // Let client-side handle authentication
}
```

### RLS Policies
```sql
-- Allow INSERT for authenticated users
CREATE POLICY "profiles_insert_authenticated" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can view/update own profile
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
```

## 8. Complete Profile Page

```typescript
// src/app/auth/complete-profile/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email!,
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender,
      class_level: formData.classLevel,
      stream: formData.stream,
      location: {
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
      },
      interests: formData.interests,
    })

  if (error) throw error
  router.push("/")
}
```

## 9. Database Schema

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender gender,
    class_level class_level,
    stream stream_type,
    location JSONB, -- {state, city, pincode, coordinates}
    interests TEXT[],
    avatar_url TEXT,
    role user_role DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 10. Authentication Flow Summary

1. **Sign-up**: User fills form → `supabase.auth.signUp()` with metadata → Email verification sent
2. **Email Verification**: User clicks link → Redirected to `/auth/callback` → Session established
3. **Profile Creation**: Auth state change triggers → Check if profile exists → Create if missing
4. **Complete Profile**: User redirected to `/auth/complete-profile` → Fill additional details → Profile updated
5. **Sign-in**: User enters credentials → `supabase.auth.signInWithPassword()` → Session established

## 11. Key Files

- `src/app/providers.tsx` - Main authentication logic
- `src/app/auth/callback/page.tsx` - Email verification callback
- `src/app/auth/complete-profile/page.tsx` - Profile completion
- `src/lib/supabase-new.ts` - Supabase client configuration
- `src/middleware.ts` - Route protection
- `src/lib/schema.sql` - Database schema



