-- RLS Policy Fix for PathNiti
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the conflicting policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON public.profiles;

-- Step 2: Create a single, proper INSERT policy
CREATE POLICY "Allow profile creation for authenticated users" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = id
    );

-- Step 3: Verify the policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;
