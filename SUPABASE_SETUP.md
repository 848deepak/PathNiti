# 🚀 Supabase Setup Guide for PathNiti

This guide will help you set up your Supabase database for the PathNiti application.

## 📋 Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Your project already has the database schema ready

## 🎯 Step 1: Create a New Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [app.supabase.com](https://app.supabase.com)
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - **Name**: `pathniti` (or your preferred name)
     - **Database Password**: Generate a strong password (save it!)
     - **Region**: Choose closest to your users (e.g., `Asia Pacific (Mumbai)` for India)
   - Click "Create new project"

3. **Wait for Setup**
   - Project creation takes 1-2 minutes
   - You'll see a progress indicator

## 🔧 Step 2: Get Your Project Credentials

1. **Go to Project Settings**
   - In your project dashboard, click the gear icon (⚙️) in the sidebar
   - Select "API"

2. **Copy Your Credentials**
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with `eyJ`)
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

3. **Update Your Environment Variables**
   ```bash
   # Update your .env.local file with these values
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## 🗄️ Step 3: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to SQL Editor**
   - In your project dashboard, click "SQL Editor" in the sidebar
   - Click "New Query"

2. **Run the Schema**
   - Copy the entire content from `src/lib/schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the schema

### Option B: Using the Setup Script

1. **Run the Setup Script**
   ```bash
   cd /Users/deepakpandey/Sih
   node scripts/setup-database.js
   ```

## 🔐 Step 4: Configure Authentication

### 4.1 Enable Email Authentication

1. **Go to Authentication Settings**
   - Click "Authentication" in the sidebar
   - Go to "Settings" tab

2. **Configure Email Settings**
   - **Enable email confirmations**: ✅ ON
   - **Enable email change confirmations**: ✅ ON
   - **Enable phone confirmations**: ✅ ON (optional)

3. **Configure Email Templates**
   - Go to "Email Templates" tab
   - Customize the templates for your app:
     - **Confirm signup**: Welcome to PathNiti!
     - **Reset password**: Reset your PathNiti password
     - **Magic link**: Sign in to PathNiti

### 4.2 Enable Google OAuth (Optional)

1. **Go to Authentication Providers**
   - Click "Authentication" → "Providers"
   - Find "Google" and click to configure

2. **Set up Google OAuth**
   - **Enable Google provider**: ✅ ON
   - **Client ID**: Get from [Google Cloud Console](https://console.cloud.google.com)
   - **Client Secret**: Get from Google Cloud Console
   - **Redirect URL**: `https://your-project-id.supabase.co/auth/v1/callback`

3. **Google Cloud Console Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`

## 🛡️ Step 5: Configure Row Level Security (RLS)

The schema already includes RLS policies, but let's verify they're working:

1. **Check RLS Status**
   - Go to "Table Editor" in the sidebar
   - Click on any table (e.g., `profiles`)
   - Verify "RLS" is enabled (green toggle)

2. **Test RLS Policies**
   - The schema includes policies for:
     - Users can only access their own data
     - Public read access for colleges, programs, scholarships
     - Admin access for management functions

## 📊 Step 6: Add Sample Data

### 6.1 Add Sample Colleges

```sql
-- Insert sample colleges
INSERT INTO public.colleges (name, type, location, address, website, established_year, is_verified, is_active) VALUES
('Delhi University', 'government', '{"state": "Delhi", "city": "New Delhi", "district": "Central Delhi", "pincode": "110007"}', 'North Campus, Delhi University, New Delhi', 'https://du.ac.in', 1922, true, true),
('IIT Delhi', 'government', '{"state": "Delhi", "city": "New Delhi", "district": "South Delhi", "pincode": "110016"}', 'Hauz Khas, New Delhi', 'https://home.iitd.ac.in', 1961, true, true),
('JNU', 'government', '{"state": "Delhi", "city": "New Delhi", "district": "South Delhi", "pincode": "110067"}', 'Jawaharlal Nehru University, New Delhi', 'https://jnu.ac.in', 1969, true, true);
```

### 6.2 Add Sample Scholarships

```sql
-- Insert sample scholarships
INSERT INTO public.scholarships (name, description, provider, amount, eligibility, application_deadline, is_active) VALUES
('National Scholarship Portal', 'Central government scholarship for students', 'Government of India', '{"min": 10000, "max": 50000, "currency": "INR"}', '{"class_level": ["10", "12", "undergraduate"], "income_limit": 250000}', '2024-12-31', true),
('Merit Scholarship', 'Merit-based scholarship for top performers', 'State Government', '{"min": 5000, "max": 25000, "currency": "INR"}', '{"class_level": ["12", "undergraduate"], "percentage": 85}', '2024-11-30', true);
```

### 6.3 Add Sample Quiz Questions

```sql
-- Insert sample quiz questions
INSERT INTO public.quiz_questions (question_text, question_type, category, options, correct_answer, difficulty_level) VALUES
('What is 15% of 200?', 'aptitude', 'mathematics', '["20", "30", "25", "35"]', 1, 1),
('Which subject interests you most?', 'interest', 'general', '["Mathematics", "Science", "Arts", "Commerce"]', null, 1),
('I prefer working in teams rather than alone', 'personality', 'general', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]', null, 1);
```

## 🔧 Step 7: Configure Storage (Optional)

If you plan to store user avatars or college images:

1. **Go to Storage**
   - Click "Storage" in the sidebar
   - Create a new bucket called `avatars`
   - Create another bucket called `college-images`

2. **Set Bucket Policies**
   ```sql
   -- Allow users to upload their own avatars
   CREATE POLICY "Users can upload own avatar" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Allow users to update their own avatars
   CREATE POLICY "Users can update own avatar" ON storage.objects
   FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## 🧪 Step 8: Test Your Setup

### 8.1 Test Authentication

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test user registration**
   - Go to `http://localhost:3001/auth/signup`
   - Try registering with a test email
   - Check your email for confirmation

3. **Test login**
   - Go to `http://localhost:3001/auth/login`
   - Login with your test account

### 8.2 Test Database Operations

1. **Check profile creation**
   - Complete the profile setup
   - Verify data appears in the `profiles` table

2. **Test notifications**
   - Check if notifications are working
   - Verify real-time updates

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid URL" Error**
   - Check your `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
   - Ensure it starts with `https://`

2. **Authentication Not Working**
   - Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check if email confirmations are enabled
   - Look at the Supabase logs in the dashboard

3. **Database Connection Issues**
   - Check if your project is paused (free tier limitation)
   - Verify your database password
   - Check the Supabase status page

4. **RLS Policy Errors**
   - Ensure RLS is enabled on all tables
   - Check if policies are correctly applied
   - Test with different user roles

### Getting Help

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Community Forum**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)

## 📈 Next Steps

1. **Monitor Usage**
   - Check the Supabase dashboard for usage metrics
   - Monitor database performance

2. **Set Up Backups**
   - Configure automatic backups
   - Set up point-in-time recovery

3. **Scale as Needed**
   - Upgrade to Pro plan for production
   - Configure additional regions

4. **Security**
   - Review and update RLS policies
   - Set up audit logging
   - Configure rate limiting

## 🎉 You're All Set!

Your Supabase database is now ready for the PathNiti application. You can:

- ✅ Register and authenticate users
- ✅ Store user profiles and preferences
- ✅ Manage colleges and programs data
- ✅ Send real-time notifications
- ✅ Track user activity and quiz results

Happy coding! 🚀
