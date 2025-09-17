# Supabase Authentication Flow Testing Guide

## Overview
This guide helps you test the fixed Supabase manual authentication flow to ensure email/password verification works correctly.

## Prerequisites
1. Run the `FINAL_CLEAN_RLS_FIX.sql` script in your Supabase SQL Editor
2. Ensure your Supabase project has the correct redirect URLs configured
3. Make sure your `.env.local` file has the correct Supabase credentials

## Testing Steps

### 1. Test Student Signup and Email Verification

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Navigate to student signup:**
   - Go to `http://localhost:3000/auth/signup/student`
   - Fill out the signup form with:
     - Email: `test-student@example.com`
     - Password: `testpassword123`
     - First Name: `Test`
     - Last Name: `Student`
     - Phone: `+1234567890`

3. **Check email verification:**
   - Check your email for the verification link
   - Click the verification link
   - You should be redirected to `/auth/callback`
   - The callback should automatically create a profile and redirect to `/`

4. **Verify profile creation:**
   - Check the browser console for logs like:
     ```
     User authenticated: [user-id] test-student@example.com
     Profile not found, attempting to create profile for user: [user-id]
     Creating profile for authenticated user: [user-id] with role: student
     Profile created successfully: [profile-data]
     ```

5. **Check database:**
   - Go to your Supabase dashboard
   - Check the `profiles` table
   - Verify a new row exists with:
     - `id` matching the user ID
     - `email` = `test-student@example.com`
     - `role` = `student`
     - `first_name` = `Test`
     - `last_name` = `Student`

### 2. Test College Signup and Email Verification

1. **Navigate to college signup:**
   - Go to `http://localhost:3000/auth/signup/college`
   - Fill out the signup form with college details

2. **Follow the same verification process as above**

3. **Verify profile creation:**
   - Check that the profile is created with `role` = `college`

### 3. Test Admin Signup and Email Verification

1. **Navigate to admin signup:**
   - Go to `http://localhost:3000/auth/signup/admin`
   - Fill out the signup form with admin details

2. **Follow the same verification process as above**

3. **Verify profile creation:**
   - Check that the profile is created with `role` = `admin`

### 4. Test Login After Verification

1. **Logout if logged in**

2. **Navigate to login:**
   - Go to `http://localhost:3000/auth/login`
   - Use the credentials from your test signup

3. **Verify login works:**
   - Should redirect to dashboard without errors
   - Profile should be loaded correctly

### 5. Test Edge Cases

1. **Test with existing user without profile:**
   - Create a user in Supabase auth.users manually
   - Try to log in
   - Should automatically create a profile

2. **Test RLS policies:**
   - Try to access another user's profile data
   - Should be blocked by RLS policies

## Expected Results

### ✅ Success Indicators:
- Email verification links work correctly
- Users are redirected to `/auth/callback` after verification
- Profiles are automatically created with correct roles
- No "unauthorized" errors in console
- Users can log in after verification
- RLS policies prevent unauthorized access

### ❌ Failure Indicators:
- Users get stuck on verification page
- "Unauthorized" errors in console
- Profiles are not created automatically
- Users cannot log in after verification
- RLS policy errors in console

## Debugging

### Check Console Logs
Look for these log messages:
- `User authenticated: [user-id] [email]`
- `Profile not found, attempting to create profile for user: [user-id]`
- `Creating profile for authenticated user: [user-id] with role: [role]`
- `Profile created successfully: [profile-data]`

### Check Network Tab
- Verify API calls to `/api/auth/create-profile` succeed
- Check for any 401/403 errors

### Check Supabase Dashboard
- Verify RLS policies are applied correctly
- Check that profiles table has the expected data
- Verify auth.users table has verified users

## Common Issues and Solutions

### Issue: "Unauthorized" errors
**Solution:** Run the `FINAL_CLEAN_RLS_FIX.sql` script to fix RLS policies

### Issue: Profile not created automatically
**Solution:** Check that the auth callback is using `getUser()` instead of just `getSession()`

### Issue: Users stuck on verification page
**Solution:** Verify redirect URLs are whitelisted in Supabase Auth settings

### Issue: Role not set correctly
**Solution:** Check that `user_metadata.role` is being copied correctly in signup forms

## API Endpoints for Testing

### Create Profile Manually
```bash
POST /api/auth/create-profile
Authorization: Bearer [user-jwt-token]
```

This endpoint will create a profile for the authenticated user if one doesn't exist.

## RLS Policy Verification

Run this query in Supabase SQL Editor to verify policies:
```sql
SELECT 
    policyname as policy_name,
    cmd as command,
    qual as condition
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;
```

Should show exactly 5 policies:
- 1 SELECT policy for own profile
- 1 INSERT policy for own profile  
- 1 UPDATE policy for own profile
- 1 SELECT policy for admins
- 1 UPDATE policy for admins
