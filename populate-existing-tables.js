#!/usr/bin/env node

/**
 * Populate Existing Database Tables
 * This script populates the existing database tables with question bank data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample questions data for existing quiz_questions table
const sampleQuestions = [
  {
    question_text: 'Solve the quadratic equation x² - 5x + 6 = 0',
    question_type: 'aptitude',
    category: 'quantitative_skills',
    subcategory: 'algebra',
    options: ['x = 2, 3', 'x = 1, 6', 'x = -2, -3', 'x = 0, 5'],
    correct_answer: 0,
    time_limit: 90,
    scoring_weight: 2.0,
    is_active: true
  },
  {
    question_text: 'In a right-angled triangle, if one angle is 30°, what is the measure of the other acute angle?',
    question_type: 'aptitude',
    category: 'spatial_visual_skills',
    subcategory: 'geometry',
    options: ['60°', '45°', '90°', '120°'],
    correct_answer: 0,
    time_limit: 60,
    scoring_weight: 1.0,
    is_active: true
  },
  {
    question_text: 'What is the law of reflection?',
    question_type: 'aptitude',
    category: 'logical_reasoning',
    subcategory: 'physics',
    options: [
      'Angle of incidence = Angle of reflection',
      'Angle of incidence = 2 × Angle of reflection',
      'Angle of reflection = 2 × Angle of incidence',
      'Both angles are always 90°'
    ],
    correct_answer: 0,
    time_limit: 60,
    scoring_weight: 1.0,
    is_active: true
  },
  {
    question_text: 'A current of 2A flows through a resistor of 5Ω. Calculate the voltage across the resistor.',
    question_type: 'aptitude',
    category: 'quantitative_skills',
    subcategory: 'physics',
    options: ['5V', '10V', '7V', '2.5V'],
    correct_answer: 1,
    time_limit: 120,
    scoring_weight: 2.0,
    is_active: true
  },
  {
    question_text: 'Which subject do you find most interesting?',
    question_type: 'riasec_interest',
    category: 'investigative',
    subcategory: 'academic_interests',
    options: ['Mathematics', 'Science', 'Literature', 'History'],
    correct_answer: 0,
    time_limit: 60,
    scoring_weight: 1.0,
    is_active: true
  },
  {
    question_text: 'What type of work environment do you prefer?',
    question_type: 'personality',
    category: 'structured_vs_flexible',
    subcategory: 'work_preferences',
    options: ['Team collaboration', 'Independent work', 'Creative projects', 'Analytical tasks'],
    correct_answer: 0,
    time_limit: 60,
    scoring_weight: 1.0,
    is_active: true
  },
  {
    question_text: 'Which activity would you enjoy most?',
    question_type: 'riasec_interest',
    category: 'artistic',
    subcategory: 'creative_interests',
    options: ['Solving puzzles', 'Writing stories', 'Conducting experiments', 'Organizing events'],
    correct_answer: 1,
    time_limit: 60,
    scoring_weight: 1.0,
    is_active: true
  },
  {
    question_text: 'What motivates you the most?',
    question_type: 'personality',
    category: 'leadership_vs_supportive',
    subcategory: 'motivation',
    options: ['Helping others', 'Achieving goals', 'Learning new things', 'Creative expression'],
    correct_answer: 0,
    time_limit: 60,
    scoring_weight: 1.0,
    is_active: true
  },
  {
    question_text: 'How do you prefer to learn new concepts?',
    question_type: 'personality',
    category: 'introvert_extrovert',
    subcategory: 'learning_style',
    options: ['Reading alone', 'Group discussions', 'Hands-on practice', 'Visual demonstrations'],
    correct_answer: 0,
    time_limit: 60,
    scoring_weight: 1.0,
    is_active: true
  },
  {
    question_text: 'What is your approach to problem-solving?',
    question_type: 'personality',
    category: 'risk_taking_vs_risk_averse',
    subcategory: 'problem_solving',
    options: ['Try multiple approaches', 'Follow proven methods', 'Seek expert advice', 'Experiment freely'],
    correct_answer: 0,
    time_limit: 60,
    scoring_weight: 1.0,
    is_active: true
  }
];

// Sample colleges data for existing colleges table
const sampleColleges = [
  {
    name: 'Delhi University',
    type: 'government',
    location: {
      state: 'Delhi',
      city: 'New Delhi',
      district: 'North Delhi',
      pincode: '110007'
    },
    address: 'University of Delhi, Delhi, 110007',
    website: 'https://du.ac.in',
    phone: '+91-11-27667011',
    email: 'info@du.ac.in',
    established_year: 1922,
    accreditation: ['NAAC A++', 'UGC'],
    facilities: {
      hostel: true,
      library: true,
      sports: true,
      labs: true
    },
    programs: {
      available: ['Arts', 'Science', 'Commerce', 'Engineering']
    },
    cut_off_data: {
      '2023': {
        'Arts': 85,
        'Science': 90,
        'Commerce': 88,
        'Engineering': 95
      }
    },
    admission_process: {
      'Arts': 'Based on Class 12 marks',
      'Science': 'Class 12 marks + Entrance exam',
      'Commerce': 'Based on Class 12 marks',
      'Engineering': 'JEE Main score'
    },
    is_verified: true,
    is_active: true
  },
  {
    name: 'Jawaharlal Nehru University',
    type: 'government',
    location: {
      state: 'Delhi',
      city: 'New Delhi',
      district: 'South Delhi',
      pincode: '110067'
    },
    address: 'JNU, New Delhi, 110067',
    website: 'https://jnu.ac.in',
    phone: '+91-11-26704000',
    email: 'info@jnu.ac.in',
    established_year: 1969,
    accreditation: ['NAAC A++', 'UGC'],
    facilities: {
      hostel: true,
      library: true,
      sports: true,
      labs: true
    },
    programs: {
      available: ['Arts', 'Science', 'Social Sciences', 'Languages']
    },
    cut_off_data: {
      '2023': {
        'Arts': 80,
        'Science': 85,
        'Social Sciences': 82,
        'Languages': 78
      }
    },
    admission_process: {
      'Arts': 'JNUEE entrance exam',
      'Science': 'JNUEE entrance exam',
      'Social Sciences': 'JNUEE entrance exam',
      'Languages': 'JNUEE entrance exam'
    },
    is_verified: true,
    is_active: true
  },
  {
    name: 'IIT Delhi',
    type: 'government',
    location: {
      state: 'Delhi',
      city: 'New Delhi',
      district: 'South Delhi',
      pincode: '110016'
    },
    address: 'Hauz Khas, New Delhi, 110016',
    website: 'https://iitd.ac.in',
    phone: '+91-11-26591735',
    email: 'info@iitd.ac.in',
    established_year: 1961,
    accreditation: ['NAAC A++', 'NBA', 'UGC'],
    facilities: {
      hostel: true,
      library: true,
      sports: true,
      labs: true,
      research_center: true
    },
    programs: {
      available: ['Engineering', 'Technology', 'Management']
    },
    cut_off_data: {
      '2023': {
        'Engineering': 98,
        'Technology': 97,
        'Management': 95
      }
    },
    admission_process: {
      'Engineering': 'JEE Advanced rank',
      'Technology': 'JEE Advanced rank',
      'Management': 'CAT score + Interview'
    },
    is_verified: true,
    is_active: true
  }
];

async function populateDatabase() {
  console.log('🚀 Populating Database with Sample Data...\n');

  try {
    // 1. Insert questions into existing quiz_questions table
    console.log('📝 Inserting sample questions...');
    const { data: questionsData, error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(sampleQuestions);

    if (questionsError) {
      console.error('❌ Error inserting questions:', questionsError.message);
    } else {
      console.log(`✅ Successfully inserted ${sampleQuestions.length} questions`);
    }

    // 2. Insert colleges into existing colleges table
    console.log('\n🏫 Inserting sample colleges...');
    const { data: collegesData, error: collegesError } = await supabase
      .from('colleges')
      .insert(sampleColleges);

    if (collegesError) {
      console.error('❌ Error inserting colleges:', collegesError.message);
    } else {
      console.log(`✅ Successfully inserted ${sampleColleges.length} colleges`);
    }

    // 3. Verify data
    console.log('\n🔍 Verifying inserted data...');
    
    const { data: questionCount } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true });
    
    const { data: collegeCount } = await supabase
      .from('colleges')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Database Summary:`);
    console.log(`   - Questions: ${questionCount?.length || 0}`);
    console.log(`   - Colleges: ${collegeCount?.length || 0}`);

    // 4. Test API endpoints
    console.log('\n🧪 Testing API endpoints...');
    await testAPIEndpoints();

    console.log('\n🎉 Database population completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the comprehensive assessment');
    console.log('   2. Generate recommendations');
    console.log('   3. View colleges and scholarships');
    console.log('   4. Test the admin dashboard');

  } catch (error) {
    console.error('❌ Population failed:', error.message);
    process.exit(1);
  }
}

async function testAPIEndpoints() {
  try {
    // Test questions endpoint
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    if (questionsError) {
      console.log('   ❌ Questions API: Error');
    } else {
      console.log(`   ✅ Questions API: ${questions?.length || 0} questions available`);
    }

    // Test colleges endpoint
    const { data: colleges, error: collegesError } = await supabase
      .from('colleges')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    if (collegesError) {
      console.log('   ❌ Colleges API: Error');
    } else {
      console.log(`   ✅ Colleges API: ${colleges?.length || 0} colleges available`);
    }

  } catch (error) {
    console.log('   ⚠️  API testing failed:', error.message);
  }
}

// Run the population
populateDatabase();
