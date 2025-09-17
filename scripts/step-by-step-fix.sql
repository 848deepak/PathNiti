-- =====================================================
-- STEP-BY-STEP DATABASE FIX
-- Run each section one by one to avoid errors
-- =====================================================

-- STEP 1: Check what we have
SELECT 'STEP 1: Current State' as step;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 2: Check if user_role enum exists
SELECT 'STEP 2: User Role Enum Check' as step;
SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'user_role'
GROUP BY t.typname;

-- STEP 3: Create user_role enum if it doesn't exist or is wrong
DO $$
BEGIN
    -- Drop existing enum if it has wrong values
    IF EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role'
        AND e.enumlabel NOT IN ('student', 'admin', 'college')
    ) THEN
        RAISE NOTICE 'Dropping old user_role enum...';
        DROP TYPE IF EXISTS user_role CASCADE;
    END IF;
    
    -- Create new enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        RAISE NOTICE 'Creating user_role enum...';
        CREATE TYPE user_role AS ENUM ('student', 'admin', 'college');
    END IF;
END $$;

-- STEP 4: Add role column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Adding role column to profiles...';
        ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'student';
    ELSE
        RAISE NOTICE 'Role column already exists in profiles';
    END IF;
END $$;

-- STEP 5: Create college_profiles table if it doesn't exist
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

-- STEP 6: Enable RLS on college_profiles
ALTER TABLE public.college_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 7: Create basic RLS policies for profiles (without admin checks first)
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;
    
    -- Create basic policies
    CREATE POLICY "Users can insert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    
    CREATE POLICY "Authenticated users can insert profiles" ON public.profiles
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
    RAISE NOTICE 'Basic profiles RLS policies created';
END $$;

-- STEP 8: Create RLS policies for college_profiles
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "College users can view own profile" ON public.college_profiles;
    DROP POLICY IF EXISTS "College users can update own profile" ON public.college_profiles;
    DROP POLICY IF EXISTS "College users can insert own profile" ON public.college_profiles;
    DROP POLICY IF EXISTS "Authenticated users can insert college profiles" ON public.college_profiles;
    
    -- Create new policies
    CREATE POLICY "College users can view own profile" ON public.college_profiles
        FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "College users can update own profile" ON public.college_profiles
        FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "College users can insert own profile" ON public.college_profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    
    CREATE POLICY "Authenticated users can insert college profiles" ON public.college_profiles
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
    RAISE NOTICE 'College profiles RLS policies created';
END $$;

-- STEP 9: Create essential indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_college_profiles_college_id ON public.college_profiles(college_id);

-- STEP 10: Create trigger for college_profiles
DROP TRIGGER IF EXISTS update_college_profiles_updated_at ON public.college_profiles;
CREATE TRIGGER update_college_profiles_updated_at 
    BEFORE UPDATE ON public.college_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 11: Final verification
SELECT 'STEP 11: Final Verification' as step;

SELECT 
    'VERIFICATION' as category,
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
    'VERIFICATION' as category,
    'Role Column in Profiles' as item,
    'EXISTS' as values,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public'
        )
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status

UNION ALL

SELECT 
    'VERIFICATION' as category,
    'College Profiles Table' as item,
    'EXISTS' as values,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'college_profiles' AND schemaname = 'public')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status

UNION ALL

SELECT 
    'VERIFICATION' as category,
    'Profiles RLS Policies' as item,
    COUNT(*)::text as values,
    CASE 
        WHEN COUNT(*) >= 2
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
        WHEN COUNT(*) >= 4
        THEN '✅ COMPLETE'
        ELSE '❌ INCOMPLETE'
    END as status
FROM pg_policies 
WHERE tablename = 'college_profiles' AND schemaname = 'public';



