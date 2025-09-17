# ⚡ Quick Supabase Setup for PathNiti

This is a quick setup guide to get your PathNiti application running with Supabase in under 10 minutes.

## 🚀 Quick Start (5 Steps)

### Step 1: Create Supabase Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `pathniti`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 1-2 minutes for setup

### Step 2: Get Your Credentials
1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Set Up Environment Variables
```bash
# Run the environment setup script
node scripts/setup-env.js
```
Follow the prompts to enter your Supabase credentials.

### Step 4: Set Up Database Schema
```bash
# Run the database setup script
node scripts/setup-database.js
```
This will:
- Create all database tables
- Set up Row Level Security (RLS)
- Add sample data (colleges, scholarships, events)
- Create an admin user

### Step 5: Start Your App
```bash
npm run dev
```
Visit `http://localhost:3000` and you're ready to go! 🎉

## 🔐 Admin Access

After running the setup script, you can login as admin:
- **Email**: `admin@pathniti.in`
- **Password**: `admin123!`

## 📊 What's Included

The setup script creates:

### Sample Data
- **3 Colleges**: Delhi University, JNU, University of Mumbai
- **2 Scholarships**: National Merit Scholarship, Post Matric Scholarship
- **3 Timeline Events**: JEE Main, NEET, CUET registration dates
- **Admin User**: For managing the application

### Database Tables
- ✅ **profiles**: User profiles and preferences
- ✅ **colleges**: College information and details
- ✅ **scholarships**: Available scholarships
- ✅ **admission_deadlines**: Important dates and deadlines
- ✅ **notifications**: Real-time notifications
- ✅ **quiz_questions**: Aptitude and interest questions
- ✅ **user_favorites**: User bookmarks and favorites

### Security Features
- ✅ **Row Level Security (RLS)**: Users can only access their own data
- ✅ **Authentication**: Email/password and OAuth support
- ✅ **Authorization**: Role-based access control

## 🛠️ Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PathNiti
NODE_ENV=development
```

### 2. Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste the entire content from `src/lib/schema.sql`
3. Click **Run** to execute

### 3. Authentication Setup
1. Go to **Authentication** → **Settings**
2. Enable **Email confirmations**
3. Configure email templates (optional)

## 🧪 Testing Your Setup

### Test Authentication
1. Go to `http://localhost:3000/auth/signup`
2. Register with a test email
3. Check your email for confirmation
4. Complete profile setup

### Test Admin Panel
1. Login with admin credentials
2. Go to `http://localhost:3000/admin`
3. Verify you can see admin features

### Test Real-time Features
1. Create a notification in the database
2. Check if it appears in the app
3. Verify real-time updates work

## 🚨 Troubleshooting

### Common Issues

**"Invalid URL" Error**
- Check your `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- Ensure it starts with `https://`

**Authentication Not Working**
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check if email confirmations are enabled in Supabase

**Database Connection Issues**
- Check if your project is paused (free tier limitation)
- Verify your database password
- Check Supabase status page

**Setup Script Fails**
- Ensure you have the correct environment variables
- Check if your Supabase project is fully set up
- Verify your service role key has admin permissions

### Getting Help
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)

## 🎯 Next Steps

1. **Customize Your App**
   - Update branding and colors
   - Add your own colleges and scholarships
   - Customize email templates

2. **Add More Features**
   - Set up Google OAuth
   - Configure file storage for avatars
   - Add more quiz questions

3. **Deploy to Production**
   - Set up production environment variables
   - Configure custom domain
   - Set up monitoring and backups

## 🎉 You're All Set!

Your PathNiti application is now ready with:
- ✅ Real authentication system
- ✅ Complete database schema
- ✅ Sample data for testing
- ✅ Admin panel access
- ✅ Real-time notifications
- ✅ Secure data access

Happy coding! 🚀
