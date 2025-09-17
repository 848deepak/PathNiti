-- =====================================================
-- COMPLETE DATABASE FIX FOR PATHNITI
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- 1. FIX USER_ROLE ENUM (Remove old values, add new ones)
-- First, update any existing data
UPDATE public.profiles 
SET role = 'student' 
WHERE role = 'counselor' OR role = 'college_admin';

-- Drop and recreate the enum with correct values
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('student', 'admin', 'college');

-- Recreate the profiles table with correct enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role 
USING role::text::user_role;

-- 2. CREATE MISSING COLLEGE_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.college_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    contact_person TEXT NOT NULL,
    designation TEXT,
    phone TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE RLS ON COLLEGE_PROFILES
ALTER TABLE public.college_profiles ENABLE ROW LEVEL SECURITY;

-- 4. CREATE MISSING RLS POLICIES FOR PROFILES
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add admin policies for profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. CREATE RLS POLICIES FOR COLLEGE_PROFILES
CREATE POLICY "College users can view own profile" ON public.college_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "College users can update own profile" ON public.college_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "College users can insert own profile" ON public.college_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert college profiles" ON public.college_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all college profiles" ON public.college_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all college profiles" ON public.college_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. CREATE MISSING INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST((location->>'coordinates'));
CREATE INDEX IF NOT EXISTS idx_colleges_location ON public.colleges USING GIST((location->>'coordinates'));
CREATE INDEX IF NOT EXISTS idx_colleges_type ON public.colleges(type);
CREATE INDEX IF NOT EXISTS idx_programs_college_id ON public.programs(college_id);
CREATE INDEX IF NOT EXISTS idx_programs_stream ON public.programs(stream);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user_id ON public.quiz_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admission_deadlines_date ON public.admission_deadlines(deadline_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_college_profiles_college_id ON public.college_profiles(college_id);

-- 7. CREATE TRIGGER FOR COLLEGE_PROFILES
CREATE TRIGGER update_college_profiles_updated_at 
    BEFORE UPDATE ON public.college_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. VERIFY THE FIX
SELECT 
    'VERIFICATION' as category,
    'User Role Enum' as item,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as values,
    CASE 
        WHEN array_agg(e.enumlabel ORDER BY e.enumsortorder) = ARRAY['student', 'admin', 'college']
        THEN '✅ FIXED'
        ELSE '❌ STILL BROKEN'
    END as status
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'user_role'
GROUP BY t.typname

UNION ALL

SELECT 
    'VERIFICATION' as category,
    'College Profiles Table' as item,
    'Table exists' as values,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'college_profiles' AND schemaname = 'public')
        THEN '✅ CREATED'
        ELSE '❌ MISSING'
    END as status

UNION ALL

SELECT 
    'VERIFICATION' as category,
    'Profiles RLS Policies' as item,
    COUNT(*)::text as values,
    CASE 
        WHEN COUNT(*) >= 5
        THEN '✅ COMPLETE'
        ELSE '❌ INCOMPLETE'
    END as status
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'

UNION ALL

SELECT 
    'VERIFICATION' as category,
    'College Profiles RLS Policies' as item,
    COUNT(*)::text as values,
    CASE 
        WHEN COUNT(*) >= 5
        THEN '✅ COMPLETE'
        ELSE '❌ INCOMPLETE'
    END as status
FROM pg_policies 
WHERE tablename = 'college_profiles' AND schemaname = 'public';




