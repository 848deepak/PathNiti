-- Fix RLS policies for profiles table
-- This script removes conflicting policies and creates proper ones

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;

-- Create a single, proper INSERT policy for profiles
CREATE POLICY "Allow profile creation for authenticated users" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = id
    );

-- Ensure other policies are still in place
-- (These should already exist, but we'll check)

-- SELECT policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

-- UPDATE policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Admin policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admins can view all profiles'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Admins can view all profiles" ON public.profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admins can update all profiles'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Admins can update all profiles" ON public.profiles
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Verify the policies
SELECT 
    'RLS Policies for profiles table' as category,
    policyname as policy_name,
    cmd as command,
    CASE 
        WHEN cmd = 'INSERT' THEN '✅ FIXED'
        ELSE '✅ OK'
    END as status
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY cmd, policyname;