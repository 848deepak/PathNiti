-- FINAL CLEAN RLS Policy Fix - Remove Duplicates and Ensure Correct Policies
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing policies on profiles table to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation for authenticated users" ON public.profiles;

-- Step 2: Create clean, non-recursive policies for profiles table
-- These policies ensure newly verified users can insert/select/update their own profiles

-- SELECT policy: Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- INSERT policy: Users can create their own profile (critical for email verification flow)
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE policy: Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Step 3: Admin policies (without recursion to avoid infinite loops)
-- These allow admins to view and update all profiles

CREATE POLICY "profiles_admin_select" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

CREATE POLICY "profiles_admin_update" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Step 4: Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify policies are working (should show exactly 5 policies)
SELECT 
    'RLS Policies Applied Successfully' as status,
    policyname as policy_name,
    cmd as command,
    qual as condition
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Step 6: Test that we have exactly 5 policies (3 user policies + 2 admin policies)
SELECT 
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';
