-- ULTIMATE RLS Policy Fix - Disable RLS for INSERT during signup
-- This completely removes the authentication requirement for profile creation

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Step 2: Create policies that allow profile creation without authentication
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow INSERT for anyone (this will work during signup)
CREATE POLICY "profiles_insert_anyone" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Step 3: Verify the policies
SELECT 
    'Ultimate RLS Policies' as status,
    policyname as policy_name,
    cmd as command,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;




