# Supabase Email Configuration Fix Guide

## 🚨 Not Receiving Confirmation Emails? Here's How to Fix It

### Step 1: Check Your Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project: `wkmbtgrnsdtrhjkuspqh`

2. **Navigate to Authentication Settings**
   - Click "Authentication" in the left sidebar
   - Go to "Settings" tab
   - Scroll down to "Email" section

### Step 2: Verify Email Configuration

**Option A: Using Supabase's Built-in Email (Recommended for Development)**

1. In the Email section, check if you see:
   - ✅ "Enable email confirmations" - Should be ON
   - ✅ "Enable email change confirmations" - Should be ON
   - ✅ "Secure email change" - Should be ON

2. **Check SMTP Settings**:
   - If you see "SMTP Settings" section
   - Make sure it's either:
     - **DISABLED** (to use Supabase's built-in email service)
     - OR **PROPERLY CONFIGURED** with valid SMTP credentials

**Option B: If Using Custom SMTP (Advanced)**

If you have SMTP configured, verify:
- SMTP Host is correct
- SMTP Port is correct (usually 587 or 465)
- Username and Password are valid
- Authentication method is correct

### Step 3: Check Email Templates

1. Go to "Email Templates" tab in Authentication settings
2. Verify "Confirm signup" template exists and is enabled
3. Check the redirect URL in the template:
   - Should be: `{{ .SiteURL }}/auth/callback`
   - Or specifically: `http://localhost:3000/auth/callback`

### Step 4: Common Issues and Solutions

#### Issue 1: Using Supabase Free Tier
- **Problem**: Free tier has limited email sending
- **Solution**: Emails might be delayed or rate-limited
- **Fix**: Wait a few minutes, check spam folder

#### Issue 2: Email Provider Blocking
- **Problem**: Gmail/Outlook may block emails from new domains
- **Solution**: Check spam/junk folder
- **Fix**: Try with a different email provider (Yahoo, Outlook, etc.)

#### Issue 3: SMTP Not Configured Properly
- **Problem**: Custom SMTP settings are wrong
- **Solution**: Disable SMTP to use Supabase's built-in service
- **Fix**: In Dashboard → Authentication → Settings → Email, turn off SMTP

#### Issue 4: Rate Limiting
- **Problem**: Too many signup attempts
- **Solution**: Wait 15-30 minutes before trying again
- **Fix**: Use a different email address

### Step 5: Test Email Configuration

1. **Disable SMTP (if enabled)**:
   - Go to Authentication → Settings → Email
   - Turn OFF any custom SMTP configuration
   - Save changes

2. **Test with a fresh email**:
   - Use a completely new email address
   - Try a different email provider (Gmail, Yahoo, Outlook)
   - Check spam folder immediately after signup

3. **Check Supabase Logs**:
   - Go to your project dashboard
   - Click on "Logs" in the sidebar
   - Look for any email-related errors

### Step 6: Alternative Solution - Disable Email Confirmation (Development Only)

⚠️ **For development/testing only - NOT recommended for production**

If you need to test without email confirmation:

1. Go to Authentication → Settings
2. Turn OFF "Confirm email"
3. Save changes
4. Users can now sign in immediately without email verification

**Remember to re-enable this for production!**

### Step 7: Verify Redirect URLs

1. Go to Authentication → Settings → "Redirect URLs"
2. Add these URLs if not present:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

### Step 8: Manual Email Resend

If you have users who signed up but didn't get emails:

1. You can resend confirmation emails via the Supabase dashboard
2. Go to Authentication → Users
3. Find the user and click "Send confirmation email"

### Common Email Providers and Issues

- **Gmail**: Check spam folder, may take 5-10 minutes
- **Outlook/Hotmail**: Check junk folder, often delayed
- **Yahoo**: Usually works well, check spam
- **Corporate emails**: Often blocked, use personal email for testing

### Quick Test Commands

Run this in your project to test email sending:
```bash
cd /Users/deepakpandey/Sih
node scripts/check-email-config.js
```

### Need More Help?

If emails still don't work:
1. Check your Supabase project logs for errors
2. Try disabling email confirmation temporarily for testing
3. Contact Supabase support if using a paid plan
4. Use the resend functionality in your app