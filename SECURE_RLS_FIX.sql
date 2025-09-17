-- SECURE RLS Policy Fix - Back to secure policies
-- Since we're no longer creating profiles during signup, we can use secure policies

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_anyone" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Step 2: Create secure policies
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Step 3: Verify the policies
SELECT 
    'Secure RLS Policies' as status,
    policyname as policy_name,
    cmd as command,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;



