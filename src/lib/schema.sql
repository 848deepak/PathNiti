-- EduNiti Database Schema
-- This file contains the complete database schema for the EduNiti platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'admin', 'counselor', 'college_admin');
CREATE TYPE stream_type AS ENUM ('arts', 'science', 'commerce', 'vocational', 'engineering', 'medical');
CREATE TYPE class_level AS ENUM ('10', '12', 'undergraduate', 'postgraduate');
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE college_type AS ENUM ('government', 'government_aided', 'private', 'deemed');
CREATE TYPE notification_type AS ENUM ('admission_deadline', 'scholarship', 'exam_reminder', 'general');
CREATE TYPE quiz_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender gender,
    class_level class_level,
    stream stream_type,
    location JSONB, -- {state, city, pincode, coordinates}
    interests TEXT[],
    avatar_url TEXT,
    role user_role DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aptitude quiz questions
CREATE TABLE public.quiz_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- 'aptitude', 'interest', 'personality'
    category TEXT NOT NULL, -- 'mathematics', 'science', 'arts', 'commerce', etc.
    options JSONB NOT NULL, -- Array of answer options
    correct_answer INTEGER, -- Index of correct answer (for aptitude questions)
    difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
    time_limit INTEGER DEFAULT 60, -- seconds
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student quiz responses
CREATE TABLE public.quiz_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    selected_answer INTEGER NOT NULL,
    time_taken INTEGER, -- seconds
    is_correct BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz sessions
CREATE TABLE public.quiz_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status quiz_status DEFAULT 'not_started',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_score INTEGER DEFAULT 0,
    aptitude_score INTEGER DEFAULT 0,
    interest_scores JSONB, -- {category: score}
    recommendations JSONB, -- AI-generated recommendations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Government colleges
CREATE TABLE public.colleges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type college_type NOT NULL,
    location JSONB NOT NULL, -- {state, city, district, pincode, coordinates}
    address TEXT NOT NULL,
    website TEXT,
    phone TEXT,
    email TEXT,
    established_year INTEGER,
    accreditation TEXT[], -- NAAC, NBA, etc.
    facilities JSONB, -- {hostel, library, sports, labs, etc.}
    programs JSONB, -- Array of programs offered
    cut_off_data JSONB, -- Historical cut-off data
    admission_process JSONB, -- Admission requirements and process
    fees JSONB, -- Fee structure
    images TEXT[], -- College images
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs/Courses offered by colleges
CREATE TABLE public.programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stream stream_type NOT NULL,
    level TEXT NOT NULL, -- 'undergraduate', 'postgraduate', 'diploma', 'certificate'
    duration INTEGER, -- years
    eligibility JSONB, -- Eligibility criteria
    subjects TEXT[], -- Subjects covered
    career_prospects TEXT[],
    fees JSONB, -- Fee structure
    seats INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career pathways
CREATE TABLE public.career_pathways (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    stream stream_type NOT NULL,
    education_requirements JSONB, -- Required education path
    skills_required TEXT[],
    job_opportunities JSONB, -- Available job roles
    salary_range JSONB, -- {min, max, currency}
    growth_prospects TEXT,
    related_exams TEXT[], -- Competitive exams
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scholarships
CREATE TABLE public.scholarships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    provider TEXT NOT NULL, -- Government, NGO, Private
    amount JSONB, -- {min, max, currency}
    eligibility JSONB, -- Eligibility criteria
    application_deadline DATE,
    application_process TEXT,
    documents_required TEXT[],
    website TEXT,
    contact_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admission deadlines and important dates
CREATE TABLE public.admission_deadlines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    deadline_date DATE NOT NULL,
    deadline_type TEXT NOT NULL, -- 'application', 'exam', 'result', 'counseling'
    stream stream_type,
    class_level class_level,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites and bookmarks
CREATE TABLE public.user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    scholarship_id UUID REFERENCES public.scholarships(id) ON DELETE CASCADE,
    favorite_type TEXT NOT NULL, -- 'college', 'program', 'scholarship'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    data JSONB, -- Additional data
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User timeline/activity
CREATE TABLE public.user_timeline (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'quiz_completed', 'college_viewed', 'application_started', etc.
    data JSONB, -- Additional data about the action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- College plugin data
CREATE TABLE public.college_plugin_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    plugin_key TEXT UNIQUE NOT NULL, -- Unique key for plugin access
    data JSONB NOT NULL, -- Data to be exposed via plugin
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_location ON public.profiles USING GIST((location->>'coordinates'));
CREATE INDEX idx_colleges_location ON public.colleges USING GIST((location->>'coordinates'));
CREATE INDEX idx_colleges_type ON public.colleges(type);
CREATE INDEX idx_programs_college_id ON public.programs(college_id);
CREATE INDEX idx_programs_stream ON public.programs(stream);
CREATE INDEX idx_quiz_responses_user_id ON public.quiz_responses(user_id);
CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX idx_admission_deadlines_date ON public.admission_deadlines(deadline_date);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_timeline ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for quiz data
CREATE POLICY "Users can view own quiz responses" ON public.quiz_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz responses" ON public.quiz_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz sessions" ON public.quiz_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz sessions" ON public.quiz_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz sessions" ON public.quiz_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user favorites
CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user timeline
CREATE POLICY "Users can view own timeline" ON public.user_timeline
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline" ON public.user_timeline
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for colleges, programs, scholarships, etc.
CREATE POLICY "Anyone can view colleges" ON public.colleges
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view programs" ON public.programs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view scholarships" ON public.scholarships
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view admission deadlines" ON public.admission_deadlines
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view career pathways" ON public.career_pathways
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions
    FOR SELECT USING (is_active = true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON public.colleges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_sessions_updated_at BEFORE UPDATE ON public.quiz_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON public.scholarships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admission_deadlines_updated_at BEFORE UPDATE ON public.admission_deadlines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_pathways_updated_at BEFORE UPDATE ON public.career_pathways
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_college_plugin_data_updated_at BEFORE UPDATE ON public.college_plugin_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
