-- FINAL RLS Policy Fix - Allow Profile Creation During Signup
-- This fixes the 401 Unauthorized and RLS policy violation

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Step 2: Create policies that allow profile creation during signup
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow INSERT for authenticated users (this is the key fix)
CREATE POLICY "profiles_insert_authenticated" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Step 3: Verify the policies
SELECT 
    'Final RLS Policies' as status,
    policyname as policy_name,
    cmd as command,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;



