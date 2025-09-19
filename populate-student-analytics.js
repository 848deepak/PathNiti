/**
 * Populate Student Analytics Data
 * This script creates sample data for testing the student dashboard
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateStudentAnalytics() {
  try {
    console.log('🚀 Populating student analytics data...');

    // Get the first student user
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('role', 'student')
      .limit(1);

    if (studentsError) {
      throw new Error(`Failed to fetch students: ${studentsError.message}`);
    }

    if (!students || students.length === 0) {
      console.log('❌ No student users found. Please create a student account first.');
      return;
    }

    const student = students[0];
    console.log(`📚 Found student: ${student.first_name} ${student.last_name} (${student.email})`);

    // 1. Create assessment session with scores
    console.log('📊 Creating assessment session...');
    const { data: assessmentSession, error: assessmentError } = await supabase
      .from('assessment_sessions')
      .insert({
        user_id: student.id,
        status: 'completed',
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        aptitude_scores: {
          logical_reasoning: 85,
          quantitative_skills: 78,
          language_verbal_skills: 92,
          spatial_visual_skills: 80,
          memory_attention: 88
        },
        riasec_scores: {
          realistic: 70,
          investigative: 85,
          artistic: 60,
          social: 75,
          enterprising: 65,
          conventional: 80
        },
        personality_scores: {
          introvert_extrovert: 0.6,
          risk_taking_vs_risk_averse: 0.4,
          structured_vs_flexible: 0.7,
          leadership_vs_supportive: 0.5
        },
        total_score: 85,
        total_questions: 50,
        answered_questions: 50,
        time_spent: 1800, // 30 minutes
        session_type: 'comprehensive'
      })
      .select()
      .single();

    if (assessmentError) {
      console.warn('⚠️  Assessment session creation failed:', assessmentError.message);
    } else {
      console.log('✅ Assessment session created');
    }

    // 2. Create user favorites (colleges, programs, scholarships)
    console.log('🏫 Creating college favorites...');
    const { data: colleges, error: collegesError } = await supabase
      .from('colleges')
      .select('id')
      .limit(5);

    if (!collegesError && colleges && colleges.length > 0) {
      const collegeFavorites = colleges.map((college, index) => ({
        user_id: student.id,
        college_id: college.id,
        favorite_type: 'college',
        created_at: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString() // Different days
      }));

      const { error: favoritesError } = await supabase
        .from('user_favorites')
        .insert(collegeFavorites);

      if (favoritesError) {
        console.warn('⚠️  College favorites creation failed:', favoritesError.message);
      } else {
        console.log('✅ College favorites created');
      }
    }

    // 3. Create program favorites (applications)
    console.log('📋 Creating program favorites...');
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('id')
      .limit(3);

    if (!programsError && programs && programs.length > 0) {
      const programFavorites = programs.map((program, index) => ({
        user_id: student.id,
        program_id: program.id,
        favorite_type: 'program',
        created_at: new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString() // Different weeks
      }));

      const { error: programFavoritesError } = await supabase
        .from('user_favorites')
        .insert(programFavorites);

      if (programFavoritesError) {
        console.warn('⚠️  Program favorites creation failed:', programFavoritesError.message);
      } else {
        console.log('✅ Program favorites created');
      }
    }

    // 4. Create scholarship favorites
    console.log('💰 Creating scholarship favorites...');
    const { data: scholarships, error: scholarshipsError } = await supabase
      .from('scholarships')
      .select('id')
      .limit(4);

    if (!scholarshipsError && scholarships && scholarships.length > 0) {
      const scholarshipFavorites = scholarships.map((scholarship, index) => ({
        user_id: student.id,
        scholarship_id: scholarship.id,
        favorite_type: 'scholarship',
        created_at: new Date(Date.now() - (index + 1) * 3 * 24 * 60 * 60 * 1000).toISOString() // Different days
      }));

      const { error: scholarshipFavoritesError } = await supabase
        .from('user_favorites')
        .insert(scholarshipFavorites);

      if (scholarshipFavoritesError) {
        console.warn('⚠️  Scholarship favorites creation failed:', scholarshipFavoritesError.message);
      } else {
        console.log('✅ Scholarship favorites created');
      }
    }

    // 5. Create user timeline activities
    console.log('📝 Creating user timeline activities...');
    const activities = [
      {
        user_id: student.id,
        action: 'quiz_completed',
        data: {
          quiz_type: 'aptitude_assessment',
          score: 85,
          session_id: assessmentSession?.id
        },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        user_id: student.id,
        action: 'college_saved',
        data: {
          college_name: 'IIT Delhi',
          college_id: colleges?.[0]?.id
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        user_id: student.id,
        action: 'college_saved',
        data: {
          college_name: 'NIT Srinagar',
          college_id: colleges?.[1]?.id
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        user_id: student.id,
        action: 'application_started',
        data: {
          program_name: 'Computer Science Engineering',
          program_id: programs?.[0]?.id
        },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        user_id: student.id,
        action: 'scholarship_found',
        data: {
          scholarship_name: 'Merit Scholarship',
          scholarship_id: scholarships?.[0]?.id
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      }
    ];

    const { error: timelineError } = await supabase
      .from('user_timeline')
      .insert(activities);

    if (timelineError) {
      console.warn('⚠️  Timeline activities creation failed:', timelineError.message);
    } else {
      console.log('✅ Timeline activities created');
    }

    console.log('🎉 Student analytics data populated successfully!');
    console.log('\n📊 Summary:');
    console.log(`  • Student: ${student.first_name} ${student.last_name}`);
    console.log(`  • Assessment Score: 85%`);
    console.log(`  • Colleges Explored: ${colleges?.length || 0}`);
    console.log(`  • Applications Tracked: ${programs?.length || 0}`);
    console.log(`  • Scholarships Found: ${scholarships?.length || 0}`);
    console.log(`  • Recent Activities: ${activities.length}`);
    console.log('\n🚀 The dashboard should now show real data!');

  } catch (error) {
    console.error('❌ Error populating student analytics:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populateStudentAnalytics().catch(console.error);
}

module.exports = { populateStudentAnalytics };
