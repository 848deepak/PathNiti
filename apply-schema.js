#!/usr/bin/env node

/**
 * Apply Question Bank Schema to Database
 * This script applies the new database schema for the question bank system
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Schema SQL
const schemaSQL = `
-- Create custom types for question system
DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('mcq_single', 'mcq_multi', 'short', 'long', 'numerical', 'diagram');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE test_status AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subject_type AS ENUM ('mathematics', 'science', 'english', 'social_science', 'aptitude', 'personality', 'interest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enhanced questions table for curriculum-aligned questions
CREATE TABLE IF NOT EXISTS public.questions (
    question_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    grade INTEGER NOT NULL CHECK (grade IN (10, 11, 12)),
    subject subject_type NOT NULL,
    topic TEXT NOT NULL,
    question_type question_type NOT NULL,
    difficulty difficulty_level NOT NULL,
    text TEXT NOT NULL,
    options JSONB, -- For MCQ questions: ["option1", "option2", ...]
    correct_answer JSONB NOT NULL, -- Answer(s) in structured format
    explanation TEXT NOT NULL,
    time_seconds INTEGER NOT NULL DEFAULT 120,
    marks INTEGER NOT NULL DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    competency_codes TEXT[], -- Learning objectives/competencies
    version INTEGER DEFAULT 1,
    pending_review BOOLEAN DEFAULT TRUE,
    generated_by TEXT DEFAULT 'kiro-auto',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT FALSE, -- Only active after approval
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tests table for generated tests
CREATE TABLE IF NOT EXISTS public.tests (
    test_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    grade INTEGER NOT NULL,
    test_type TEXT NOT NULL DEFAULT 'stream_assessment', -- 'stream_assessment', 'subject_test', 'practice'
    questions JSONB NOT NULL, -- Ordered list of question_ids
    total_marks INTEGER NOT NULL,
    time_limit_seconds INTEGER NOT NULL,
    status test_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    metrics JSONB, -- {accuracy_percent, avg_response_time, speed_score, weighted_score}
    created_by TEXT DEFAULT 'system'
);

-- Student responses table for detailed tracking
CREATE TABLE IF NOT EXISTS public.student_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    test_id UUID REFERENCES public.tests(test_id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(question_id) ON DELETE CASCADE,
    answer JSONB NOT NULL,
    is_correct BOOLEAN,
    response_time_seconds INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced colleges table with verification system
CREATE TABLE IF NOT EXISTS public.colleges_enhanced (
    college_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    pin_code TEXT,
    streams_offered JSONB NOT NULL, -- Array of streams offered
    admission_criteria TEXT,
    fee_structure JSONB, -- Structured fee information
    admission_open_date DATE,
    admission_close_date DATE,
    contact_info JSONB, -- {phone, email, website}
    verified BOOLEAN DEFAULT FALSE,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question approval workflow
CREATE TABLE IF NOT EXISTS public.question_approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(question_id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    feedback TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- College verification workflow
CREATE TABLE IF NOT EXISTS public.college_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES public.colleges_enhanced(college_id) ON DELETE CASCADE,
    verifier_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected', 'needs_info')),
    feedback TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curriculum topics mapping
CREATE TABLE IF NOT EXISTS public.curriculum_topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    grade INTEGER NOT NULL,
    subject subject_type NOT NULL,
    topic TEXT NOT NULL,
    subtopics TEXT[],
    learning_objectives TEXT[],
    competency_codes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

async function applySchema() {
  console.log('🔧 Applying Question Bank Schema to Database...\n');

  try {
    // Execute the schema SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });

    if (error) {
      console.error('❌ Error applying schema:', error.message);
      
      // Try alternative approach - create tables one by one
      console.log('🔄 Trying alternative approach...');
      await createTablesIndividually();
    } else {
      console.log('✅ Schema applied successfully!');
    }

    // Verify tables were created
    await verifyTables();

  } catch (error) {
    console.error('❌ Schema application failed:', error.message);
    console.log('🔄 Trying alternative approach...');
    await createTablesIndividually();
  }
}

async function createTablesIndividually() {
  console.log('📝 Creating tables individually...');

  const tables = [
    {
      name: 'questions',
      sql: `
        CREATE TABLE IF NOT EXISTS public.questions (
          question_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          grade INTEGER NOT NULL,
          subject TEXT NOT NULL,
          topic TEXT NOT NULL,
          question_type TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          text TEXT NOT NULL,
          options JSONB,
          correct_answer JSONB NOT NULL,
          explanation TEXT NOT NULL,
          time_seconds INTEGER NOT NULL DEFAULT 120,
          marks INTEGER NOT NULL DEFAULT 1,
          tags TEXT[] DEFAULT '{}',
          competency_codes TEXT[],
          version INTEGER DEFAULT 1,
          pending_review BOOLEAN DEFAULT TRUE,
          generated_by TEXT DEFAULT 'kiro-auto',
          generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          approved_by UUID,
          approved_at TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'tests',
      sql: `
        CREATE TABLE IF NOT EXISTS public.tests (
          test_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          student_id UUID,
          grade INTEGER NOT NULL,
          test_type TEXT NOT NULL DEFAULT 'stream_assessment',
          questions JSONB NOT NULL,
          total_marks INTEGER NOT NULL,
          time_limit_seconds INTEGER NOT NULL,
          status TEXT DEFAULT 'draft',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          metrics JSONB,
          created_by TEXT DEFAULT 'system'
        );
      `
    },
    {
      name: 'student_responses',
      sql: `
        CREATE TABLE IF NOT EXISTS public.student_responses (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          test_id UUID,
          student_id UUID,
          question_id UUID,
          answer JSONB NOT NULL,
          is_correct BOOLEAN,
          response_time_seconds INTEGER NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'colleges_enhanced',
      sql: `
        CREATE TABLE IF NOT EXISTS public.colleges_enhanced (
          college_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          pin_code TEXT,
          streams_offered JSONB NOT NULL,
          admission_criteria TEXT,
          fee_structure JSONB,
          admission_open_date DATE,
          admission_close_date DATE,
          contact_info JSONB,
          verified BOOLEAN DEFAULT FALSE,
          last_verified_at TIMESTAMP WITH TIME ZONE,
          verified_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'curriculum_topics',
      sql: `
        CREATE TABLE IF NOT EXISTS public.curriculum_topics (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          grade INTEGER NOT NULL,
          subject TEXT NOT NULL,
          topic TEXT NOT NULL,
          subtopics TEXT[],
          learning_objectives TEXT[],
          competency_codes TEXT[],
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`   Creating table: ${table.name}`);
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
      
      if (error) {
        console.log(`   ⚠️  Table ${table.name} might already exist or error: ${error.message}`);
      } else {
        console.log(`   ✅ Table ${table.name} created successfully`);
      }
    } catch (error) {
      console.log(`   ⚠️  Table ${table.name} creation failed: ${error.message}`);
    }
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying tables...');
  
  const tables = ['questions', 'tests', 'student_responses', 'colleges_enhanced', 'curriculum_topics'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ Table ${table}: Ready`);
      }
    } catch (error) {
      console.log(`   ❌ Table ${table}: ${error.message}`);
    }
  }
}

// Run the schema application
applySchema();
