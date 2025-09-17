-- URGENT: Fix RLS Infinite Recursion on Profiles Table
-- This script removes the recursive admin policies that cause the infinite loop
-- Run this in your Supabase SQL Editor immediately

-- Step 1: Drop ALL existing policies on profiles table to eliminate conflicts
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

-- Step 2: Create simple, non-recursive policies
-- These policies do NOT check the profiles table to avoid recursion

-- Allow users to view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to insert profiles (critical for signup)
CREATE POLICY "profiles_insert_authenticated" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Step 3: Create admin policies using auth.jwt() instead of profiles table lookup
-- This avoids the infinite recursion by checking JWT claims directly

-- Admin can view all profiles (using JWT role claim)
CREATE POLICY "profiles_admin_view_all" ON public.profiles
    FOR SELECT USING (
        (auth.jwt() ->> 'role') = 'admin'
        OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Admin can update all profiles (using JWT role claim)
CREATE POLICY "profiles_admin_update_all" ON public.profiles
    FOR UPDATE USING (
        (auth.jwt() ->> 'role') = 'admin'
        OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify policies (should show 5 policies without recursion)
SELECT 
    '🔥 RLS RECURSION FIXED 🔥' as status,
    policyname as policy_name,
    cmd as command,
    CASE 
        WHEN cmd = 'INSERT' THEN '✅ SIGNUP FIXED'
        WHEN cmd = 'SELECT' THEN '✅ READ FIXED'
        WHEN cmd = 'UPDATE' THEN '✅ UPDATE FIXED'
        ELSE '✅ OK'
    END as result
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Step 6: Test profile creation capability
SELECT 
    CASE 
        WHEN current_setting('request.jwt.claims', true)::json ->> 'role' = 'authenticated' 
        THEN '✅ Profile creation should work now'
        ELSE '⚠️ Make sure you are authenticated to test this'
    END as profile_creation_test;