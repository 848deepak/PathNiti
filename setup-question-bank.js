#!/usr/bin/env node

/**
 * Question Bank Database Setup Script
 * This script initializes the database with questions, colleges, and curriculum data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample questions data
const sampleQuestions = [
  // Grade 10 Mathematics
  {
    question_id: 'q_math_10_001',
    grade: 10,
    subject: 'mathematics',
    topic: 'Quadratic Equations',
    question_type: 'mcq_single',
    difficulty: 'easy',
    text: 'Solve the quadratic equation x² - 5x + 6 = 0',
    options: ['x = 2, 3', 'x = 1, 6', 'x = -2, -3', 'x = 0, 5'],
    correct_answer: 'x = 2, 3',
    explanation: 'Factorizing: (x-2)(x-3) = 0, so x = 2 or x = 3',
    time_seconds: 90,
    marks: 2,
    tags: ['quadratic_equations', 'algebra'],
    competency_codes: ['MATH_10_QUADRATIC'],
    version: 1,
    pending_review: false,
    generated_by: 'setup-script',
    generated_at: new Date().toISOString(),
    is_active: true
  },
  {
    question_id: 'q_math_10_002',
    grade: 10,
    subject: 'mathematics',
    topic: 'Triangles',
    question_type: 'mcq_single',
    difficulty: 'medium',
    text: 'In a right-angled triangle, if one angle is 30°, what is the measure of the other acute angle?',
    options: ['60°', '45°', '90°', '120°'],
    correct_answer: '60°',
    explanation: 'In a right triangle, sum of acute angles is 90°. So 90° - 30° = 60°',
    time_seconds: 60,
    marks: 1,
    tags: ['triangles', 'geometry'],
    competency_codes: ['MATH_10_TRIANGLES'],
    version: 1,
    pending_review: false,
    generated_by: 'setup-script',
    generated_at: new Date().toISOString(),
    is_active: true
  },
  {
    question_id: 'q_math_10_003',
    grade: 10,
    subject: 'mathematics',
    topic: 'Real Numbers',
    question_type: 'short',
    difficulty: 'easy',
    text: 'Prove that √2 is an irrational number',
    options: null,
    correct_answer: 'Proof by contradiction: Assume √2 is rational, then √2 = p/q where p,q are integers with no common factors. Squaring both sides: 2 = p²/q², so 2q² = p². This means p² is even, so p is even. Let p = 2k, then 2q² = (2k)² = 4k², so q² = 2k². This means q² is even, so q is even. But if both p and q are even, they have a common factor of 2, contradicting our assumption. Therefore, √2 is irrational.',
    explanation: 'This is a classic proof by contradiction showing that √2 cannot be expressed as a ratio of two integers.',
    time_seconds: 180,
    marks: 4,
    tags: ['real_numbers', 'proof'],
    competency_codes: ['MATH_10_REAL_NUMBERS'],
    version: 1,
    pending_review: false,
    generated_by: 'setup-script',
    generated_at: new Date().toISOString(),
    is_active: true
  },

  // Grade 10 Science
  {
    question_id: 'q_sci_10_001',
    grade: 10,
    subject: 'science',
    topic: 'Light - Reflection and Refraction',
    question_type: 'mcq_single',
    difficulty: 'easy',
    text: 'What is the law of reflection?',
    options: [
      'Angle of incidence = Angle of reflection',
      'Angle of incidence = 2 × Angle of reflection',
      'Angle of reflection = 2 × Angle of incidence',
      'Both angles are always 90°'
    ],
    correct_answer: 'Angle of incidence = Angle of reflection',
    explanation: 'The law of reflection states that the angle of incidence is equal to the angle of reflection',
    time_seconds: 60,
    marks: 1,
    tags: ['light', 'reflection', 'physics'],
    competency_codes: ['SCI_10_LIGHT'],
    version: 1,
    pending_review: false,
    generated_by: 'setup-script',
    generated_at: new Date().toISOString(),
    is_active: true
  },
  {
    question_id: 'q_sci_10_002',
    grade: 10,
    subject: 'science',
    topic: 'Electricity',
    question_type: 'numerical',
    difficulty: 'medium',
    text: 'A current of 2A flows through a resistor of 5Ω. Calculate the voltage across the resistor.',
    options: null,
    correct_answer: '10V',
    explanation: 'Using Ohm\'s law: V = I × R = 2A × 5Ω = 10V',
    time_seconds: 120,
    marks: 3,
    tags: ['electricity', 'ohms_law', 'physics'],
    competency_codes: ['SCI_10_ELECTRICITY'],
    version: 1,
    pending_review: false,
    generated_by: 'setup-script',
    generated_at: new Date().toISOString(),
    is_active: true
  },

  // Grade 10 English
  {
    question_id: 'q_eng_10_001',
    grade: 10,
    subject: 'english',
    topic: 'Reading Comprehension',
    question_type: 'mcq_single',
    difficulty: 'medium',
    text: 'Read the passage: "The ancient library contained thousands of scrolls and manuscripts, each carefully preserved in climate-controlled chambers." What is the main idea?',
    options: [
      'The library was very old',
      'The library had many books',
      'The library preserved ancient documents carefully',
      'The library had climate control'
    ],
    correct_answer: 'The library preserved ancient documents carefully',
    explanation: 'The passage emphasizes the careful preservation of ancient documents in the library',
    time_seconds: 90,
    marks: 2,
    tags: ['reading_comprehension', 'literature'],
    competency_codes: ['ENG_10_READING'],
    version: 1,
    pending_review: false,
    generated_by: 'setup-script',
    generated_at: new Date().toISOString(),
    is_active: true
  },

  // Grade 10 Social Science
  {
    question_id: 'q_ss_10_001',
    grade: 10,
    subject: 'social_science',
    topic: 'Nationalism in India',
    question_type: 'short',
    difficulty: 'medium',
    text: 'Explain the role of Mahatma Gandhi in the Indian independence movement.',
    options: null,
    correct_answer: 'Mahatma Gandhi played a crucial role in the Indian independence movement through non-violent civil disobedience, leading movements like the Salt March, Quit India Movement, and promoting the concept of Swaraj (self-rule).',
    explanation: 'Gandhi\'s philosophy of non-violence and civil disobedience was instrumental in mobilizing the masses and putting pressure on the British government.',
    time_seconds: 150,
    marks: 4,
    tags: ['nationalism', 'independence', 'history'],
    competency_codes: ['SS_10_NATIONALISM'],
    version: 1,
    pending_review: false,
    generated_by: 'setup-script',
    generated_at: new Date().toISOString(),
    is_active: true
  }
];

// Sample colleges data
const sampleColleges = [
  {
    college_id: 'college-001',
    name: 'Delhi University',
    address: 'University of Delhi, Delhi, 110007',
    pin_code: '110007',
    streams_offered: ['arts', 'science', 'commerce', 'engineering'],
    admission_criteria: 'Based on Class 12 marks and entrance exam',
    fee_structure: {
      tuition_fee: 50000,
      hostel_fee: 30000,
      other_fees: 10000,
      currency: 'INR'
    },
    admission_open_date: '2024-03-01',
    admission_close_date: '2024-06-30',
    contact_info: {
      phone: '+91-11-27667011',
      email: 'info@du.ac.in',
      website: 'https://du.ac.in'
    },
    verified: true,
    last_verified_at: new Date().toISOString()
  },
  {
    college_id: 'college-002',
    name: 'Jawaharlal Nehru University',
    address: 'JNU, New Delhi, 110067',
    pin_code: '110067',
    streams_offered: ['arts', 'science', 'social_sciences', 'languages'],
    admission_criteria: 'JNUEE entrance exam',
    fee_structure: {
      tuition_fee: 30000,
      hostel_fee: 20000,
      other_fees: 5000,
      currency: 'INR'
    },
    admission_open_date: '2024-02-01',
    admission_close_date: '2024-05-31',
    contact_info: {
      phone: '+91-11-26704000',
      email: 'info@jnu.ac.in',
      website: 'https://jnu.ac.in'
    },
    verified: true,
    last_verified_at: new Date().toISOString()
  },
  {
    college_id: 'college-003',
    name: 'IIT Delhi',
    address: 'Hauz Khas, New Delhi, 110016',
    pin_code: '110016',
    streams_offered: ['engineering'],
    admission_criteria: 'JEE Advanced rank',
    fee_structure: {
      tuition_fee: 200000,
      hostel_fee: 50000,
      other_fees: 25000,
      currency: 'INR'
    },
    admission_open_date: '2024-01-01',
    admission_close_date: '2024-04-30',
    contact_info: {
      phone: '+91-11-26591735',
      email: 'info@iitd.ac.in',
      website: 'https://iitd.ac.in'
    },
    verified: true,
    last_verified_at: new Date().toISOString()
  }
];

// Curriculum topics data
const curriculumTopics = [
  { grade: 10, subject: 'mathematics', topic: 'Real Numbers', subtopics: ['Rational Numbers', 'Irrational Numbers'], learning_objectives: ['Understand real number system'], competency_codes: ['MATH_10_REAL_NUMBERS'] },
  { grade: 10, subject: 'mathematics', topic: 'Polynomials', subtopics: ['Linear Polynomials', 'Quadratic Polynomials'], learning_objectives: ['Factorize polynomials'], competency_codes: ['MATH_10_POLYNOMIALS'] },
  { grade: 10, subject: 'mathematics', topic: 'Quadratic Equations', subtopics: ['Solving by factorization', 'Using quadratic formula'], learning_objectives: ['Solve quadratic equations'], competency_codes: ['MATH_10_QUADRATIC'] },
  { grade: 10, subject: 'science', topic: 'Light - Reflection and Refraction', subtopics: ['Laws of reflection', 'Refraction'], learning_objectives: ['Understand light behavior'], competency_codes: ['SCI_10_LIGHT'] },
  { grade: 10, subject: 'science', topic: 'Electricity', subtopics: ['Current', 'Voltage', 'Resistance'], learning_objectives: ['Understand electrical concepts'], competency_codes: ['SCI_10_ELECTRICITY'] },
  { grade: 10, subject: 'english', topic: 'Reading Comprehension', subtopics: ['Main idea', 'Supporting details'], learning_objectives: ['Analyze text'], competency_codes: ['ENG_10_READING'] },
  { grade: 10, subject: 'social_science', topic: 'Nationalism in India', subtopics: ['Independence movement', 'Key leaders'], learning_objectives: ['Understand historical events'], competency_codes: ['SS_10_NATIONALISM'] }
];

async function setupDatabase() {
  console.log('🚀 Starting Question Bank Database Setup...\n');

  try {
    // 1. Insert questions
    console.log('📝 Inserting sample questions...');
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .insert(sampleQuestions);

    if (questionsError) {
      console.error('❌ Error inserting questions:', questionsError.message);
    } else {
      console.log(`✅ Successfully inserted ${sampleQuestions.length} questions`);
    }

    // 2. Insert colleges
    console.log('\n🏫 Inserting sample colleges...');
    const { data: collegesData, error: collegesError } = await supabase
      .from('colleges_enhanced')
      .insert(sampleColleges);

    if (collegesError) {
      console.error('❌ Error inserting colleges:', collegesError.message);
    } else {
      console.log(`✅ Successfully inserted ${sampleColleges.length} colleges`);
    }

    // 3. Insert curriculum topics
    console.log('\n📚 Inserting curriculum topics...');
    const { data: topicsData, error: topicsError } = await supabase
      .from('curriculum_topics')
      .insert(curriculumTopics);

    if (topicsError) {
      console.error('❌ Error inserting curriculum topics:', topicsError.message);
    } else {
      console.log(`✅ Successfully inserted ${curriculumTopics.length} curriculum topics`);
    }

    // 4. Verify data
    console.log('\n🔍 Verifying inserted data...');
    
    const { data: questionCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
    
    const { data: collegeCount } = await supabase
      .from('colleges_enhanced')
      .select('*', { count: 'exact', head: true });
    
    const { data: topicCount } = await supabase
      .from('curriculum_topics')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Database Summary:`);
    console.log(`   - Questions: ${questionCount?.length || 0}`);
    console.log(`   - Colleges: ${collegeCount?.length || 0}`);
    console.log(`   - Curriculum Topics: ${topicCount?.length || 0}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the API endpoints');
    console.log('   2. Generate more questions using the API');
    console.log('   3. Create tests for students');
    console.log('   4. Set up admin approval workflow');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
