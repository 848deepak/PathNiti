-- =====================================================
-- REPAIR EXISTING DATABASE - SAFE FOR MULTIPLE RUNS
-- This script checks what exists and only fixes what's broken
-- =====================================================

-- 1. CHECK CURRENT STATE FIRST
SELECT 'CURRENT STATE CHECK' as section, 'Starting repair process...' as message;

-- 2. SAFELY FIX USER_ROLE ENUM (only if needed)
DO $$
BEGIN
    -- Check if user_role enum exists and has correct values
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role'
        AND e.enumlabel IN ('student', 'admin', 'college')
        GROUP BY t.typname
        HAVING COUNT(DISTINCT e.enumlabel) = 3
    ) THEN
        RAISE NOTICE 'Fixing user_role enum...';
        
        -- Update existing data first
        UPDATE public.profiles 
        SET role = 'student' 
        WHERE role = 'counselor' OR role = 'college_admin';
        
        -- Create temporary column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role_temp') THEN
            ALTER TABLE public.profiles ADD COLUMN role_temp TEXT;
        END IF;
        
        -- Copy data to temp column
        UPDATE public.profiles 
        SET role_temp = CASE 
            WHEN role = 'student' THEN 'student'
            WHEN role = 'admin' THEN 'admin'
            WHEN role = 'counselor' THEN 'student'
            WHEN role = 'college_admin' THEN 'student'
            ELSE 'student'
        END;
        
        -- Drop old enum and recreate
        DROP TYPE IF EXISTS user_role CASCADE;
        CREATE TYPE user_role AS ENUM ('student', 'admin', 'college');
        
        -- Add role column back
        ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'student';
        
        -- Copy data back
        UPDATE public.profiles SET role = role_temp::user_role;
        
        -- Clean up
        ALTER TABLE public.profiles DROP COLUMN role_temp;
        
        RAISE NOTICE 'user_role enum fixed successfully';
    ELSE
        RAISE NOTICE 'user_role enum is already correct';
    END IF;
END $$;

-- 3. CREATE COLLEGE_PROFILES TABLE (only if missing)
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

-- 4. ENABLE RLS ON COLLEGE_PROFILES (safe to run multiple times)
ALTER TABLE public.college_profiles ENABLE ROW LEVEL SECURITY;

-- 5. CREATE MISSING RLS POLICIES (only if they don't exist)
-- Profiles policies
DO $$
BEGIN
    -- Drop and recreate profiles policies
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
    
    -- Create new policies
    CREATE POLICY "Users can insert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    
    CREATE POLICY "Authenticated users can insert profiles" ON public.profiles
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
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
    
    RAISE NOTICE 'Profiles RLS policies created/updated';
END $$;

-- College profiles policies
DO $$
BEGIN
    -- Drop and recreate college profiles policies
    DROP POLICY IF EXISTS "College users can view own profile" ON public.college_profiles;
    DROP POLICY IF EXISTS "College users can update own profile" ON public.college_profiles;
    DROP POLICY IF EXISTS "College users can insert own profile" ON public.college_profiles;
    DROP POLICY IF EXISTS "Authenticated users can insert college profiles" ON public.college_profiles;
    DROP POLICY IF EXISTS "Admins can view all college profiles" ON public.college_profiles;
    DROP POLICY IF EXISTS "Admins can update all college profiles" ON public.college_profiles;
    
    -- Create new policies
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
    
    RAISE NOTICE 'College profiles RLS policies created/updated';
END $$;

-- 6. CREATE MISSING INDEXES (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON public.colleges(type);
CREATE INDEX IF NOT EXISTS idx_programs_college_id ON public.programs(college_id);
CREATE INDEX IF NOT EXISTS idx_programs_stream ON public.programs(stream);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user_id ON public.quiz_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admission_deadlines_date ON public.admission_deadlines(deadline_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_college_profiles_college_id ON public.college_profiles(college_id);

-- 7. CREATE TRIGGER FOR COLLEGE_PROFILES (safe to run multiple times)
DROP TRIGGER IF EXISTS update_college_profiles_updated_at ON public.college_profiles;
CREATE TRIGGER update_college_profiles_updated_at 
    BEFORE UPDATE ON public.college_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. FINAL VERIFICATION
SELECT 
    'FINAL VERIFICATION' as category,
    'User Role Enum' as item,
    COALESCE(array_agg(e.enumlabel ORDER BY e.enumsortorder)::text, 'MISSING') as values,
    CASE 
        WHEN array_agg(e.enumlabel ORDER BY e.enumsortorder) = ARRAY['student', 'admin', 'college']
        THEN '✅ CORRECT'
        ELSE '❌ NEEDS FIX'
    END as status
FROM pg_type t
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'user_role'
GROUP BY t.typname

UNION ALL

SELECT 
    'FINAL VERIFICATION' as category,
    'College Profiles Table' as item,
    'EXISTS' as values,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'college_profiles' AND schemaname = 'public')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status

UNION ALL

SELECT 
    'FINAL VERIFICATION' as category,
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
    'FINAL VERIFICATION' as category,
    'College Profiles RLS Policies' as item,
    COUNT(*)::text as values,
    CASE 
        WHEN COUNT(*) >= 5
        THEN '✅ COMPLETE'
        ELSE '❌ INCOMPLETE'
    END as status
FROM pg_policies 
WHERE tablename = 'college_profiles' AND schemaname = 'public'

UNION ALL

SELECT 
    'FINAL VERIFICATION' as category,
    'Ready for Testing' as item,
    'All checks passed' as values,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'college_profiles')
        AND EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role')
        AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') >= 5
        AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'college_profiles') >= 5
        THEN '✅ READY'
        ELSE '❌ NOT READY'
    END as status;




