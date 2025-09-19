#!/usr/bin/env node

/**
 * Populate Academic Questions Database
 * This script populates the database with curriculum-aligned academic questions
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Academic questions data
const academicQuestions = {
  mathematics: {
    10: [
      {
        question_text: "Solve the quadratic equation x² - 5x + 6 = 0",
        question_type: "academic",
        category: "mathematics",
        subcategory: "quadratic_equations",
        options: ["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = 0, 5"],
        correct_answer: 0,
        difficulty_level: 2,
        time_limit: 90,
        scoring_weight: 2.0,
        is_active: true
      },
      {
        question_text: "In a right-angled triangle, if one angle is 30°, what is the measure of the other acute angle?",
        question_type: "academic",
        category: "mathematics",
        subcategory: "triangles",
        options: ["60°", "45°", "90°", "120°"],
        correct_answer: 0,
        difficulty_level: 1,
        time_limit: 60,
        scoring_weight: 1.0,
        is_active: true
      },
      {
        question_text: "Find the value of √144 + √81",
        question_type: "academic",
        category: "mathematics",
        subcategory: "arithmetic",
        options: ["21", "15", "25", "17"],
        correct_answer: 0,
        difficulty_level: 1,
        time_limit: 45,
        scoring_weight: 1.0,
        is_active: true
      },
      {
        question_text: "If the area of a circle is 154 cm², what is its radius? (π = 22/7)",
        question_type: "academic",
        category: "mathematics",
        subcategory: "circles",
        options: ["7 cm", "8 cm", "9 cm", "10 cm"],
        correct_answer: 0,
        difficulty_level: 2,
        time_limit: 90,
        scoring_weight: 2.0,
        is_active: true
      },
      {
        question_text: "What is the HCF of 24 and 36?",
        question_type: "academic",
        category: "mathematics",
        subcategory: "number_system",
        options: ["6", "12", "8", "4"],
        correct_answer: 1,
        difficulty_level: 1,
        time_limit: 60,
        scoring_weight: 1.0,
        is_active: true
      }
    ],
    11: [
      {
        question_text: "Find the derivative of x³ + 2x² - 5x + 1",
        question_type: "academic",
        category: "mathematics",
        subcategory: "calculus",
        options: ["3x² + 4x - 5", "3x² + 2x - 5", "x² + 4x - 5", "3x² + 4x + 5"],
        correct_answer: 0,
        difficulty_level: 2,
        time_limit: 120,
        scoring_weight: 2.0,
        is_active: true
      },
      {
        question_text: "What is the value of sin(30°) + cos(60°)?",
        question_type: "academic",
        category: "mathematics",
        subcategory: "trigonometry",
        options: ["1", "0.5", "1.5", "0"],
        correct_answer: 0,
        difficulty_level: 1,
        time_limit: 60,
        scoring_weight: 1.0,
        is_active: true
      }
    ],
    12: [
      {
        question_text: "Find the integral of ∫(2x + 3)dx",
        question_type: "academic",
        category: "mathematics",
        subcategory: "integration",
        options: ["x² + 3x + C", "2x² + 3x + C", "x² + 3", "2x + 3"],
        correct_answer: 0,
        difficulty_level: 2,
        time_limit: 90,
        scoring_weight: 2.0,
        is_active: true
      }
    ]
  },
  science: {
    10: [
      {
        question_text: "What is the law of reflection?",
        question_type: "academic",
        category: "science",
        subcategory: "light",
        options: [
          "Angle of incidence = Angle of reflection",
          "Angle of incidence = 2 × Angle of reflection",
          "Angle of reflection = 2 × Angle of incidence",
          "Both angles are always 90°"
        ],
        correct_answer: 0,
        difficulty_level: 1,
        time_limit: 60,
        scoring_weight: 1.0,
        is_active: true
      },
      {
        question_text: "A current of 2A flows through a resistor of 5Ω. Calculate the voltage across the resistor.",
        question_type: "academic",
        category: "science",
        subcategory: "electricity",
        options: ["5V", "10V", "7V", "2.5V"],
        correct_answer: 1,
        difficulty_level: 2,
        time_limit: 90,
        scoring_weight: 2.0,
        is_active: true
      },
      {
        question_text: "What is the chemical formula of water?",
        question_type: "academic",
        category: "science",
        subcategory: "chemistry",
        options: ["H2O", "H2O2", "HO", "H3O"],
        correct_answer: 0,
        difficulty_level: 1,
        time_limit: 30,
        scoring_weight: 1.0,
        is_active: true
      },
      {
        question_text: "Which organelle is known as the powerhouse of the cell?",
        question_type: "academic",
        category: "science",
        subcategory: "biology",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
        correct_answer: 1,
        difficulty_level: 1,
        time_limit: 45,
        scoring_weight: 1.0,
        is_active: true
      }
    ]
  },
  english: {
    10: [
      {
        question_text: "Choose the correct form: 'The book _____ on the table.'",
        question_type: "academic",
        category: "english",
        subcategory: "grammar",
        options: ["is lying", "are lying", "is lie", "are lie"],
        correct_answer: 0,
        difficulty_level: 1,
        time_limit: 45,
        scoring_weight: 1.0,
        is_active: true
      },
      {
        question_text: "What is the synonym of 'abundant'?",
        question_type: "academic",
        category: "english",
        subcategory: "vocabulary",
        options: ["scarce", "plentiful", "rare", "limited"],
        correct_answer: 1,
        difficulty_level: 1,
        time_limit: 45,
        scoring_weight: 1.0,
        is_active: true
      },
      {
        question_text: "Identify the figure of speech: 'The stars danced playfully in the moonlit sky.'",
        question_type: "academic",
        category: "english",
        subcategory: "literature",
        options: ["Metaphor", "Simile", "Personification", "Alliteration"],
        correct_answer: 2,
        difficulty_level: 2,
        time_limit: 60,
        scoring_weight: 1.5,
        is_active: true
      }
    ]
  },
  social_science: {
    10: [
      {
        question_text: "Who was the first Prime Minister of India?",
        question_type: "academic",
        category: "social_science",
        subcategory: "history",
        options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "Dr. Rajendra Prasad"],
        correct_answer: 1,
        difficulty_level: 1,
        time_limit: 45,
        scoring_weight: 1.0,
        is_active: true
      },
      {
        question_text: "What is the capital of Australia?",
        question_type: "academic",
        category: "social_science",
        subcategory: "geography",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correct_answer: 2,
        difficulty_level: 1,
        time_limit: 45,
        scoring_weight: 1.0,
        is_active: true
      },
      {
        question_text: "Which article of the Indian Constitution deals with Fundamental Rights?",
        question_type: "academic",
        category: "social_science",
        subcategory: "civics",
        options: ["Article 12-35", "Article 36-51", "Article 52-78", "Article 79-122"],
        correct_answer: 0,
        difficulty_level: 2,
        time_limit: 60,
        scoring_weight: 1.5,
        is_active: true
      }
    ]
  }
};

async function populateAcademicQuestions() {
  console.log('🚀 Populating Academic Questions Database...\n');

  try {
    let totalInserted = 0;
    const subjects = Object.keys(academicQuestions);
    const grades = [10, 11, 12];

    for (const subject of subjects) {
      console.log(`📚 Processing ${subject} questions...`);
      
      for (const grade of grades) {
        const questions = academicQuestions[subject][grade];
        if (questions && questions.length > 0) {
          console.log(`   Grade ${grade}: ${questions.length} questions`);
          
          // Check if questions already exist
          const { data: existingQuestions } = await supabase
            .from('quiz_questions')
            .select('id')
            .eq('category', subject)
            .eq('question_type', 'academic')
            .limit(1);

          if (existingQuestions && existingQuestions.length > 0) {
            console.log(`   ⚠️  Questions for ${subject} grade ${grade} already exist, skipping...`);
            continue;
          }

          // Insert questions
          const { data: insertedQuestions, error } = await supabase
            .from('quiz_questions')
            .insert(questions)
            .select();

          if (error) {
            console.error(`   ❌ Error inserting ${subject} grade ${grade} questions:`, error.message);
          } else {
            console.log(`   ✅ Inserted ${insertedQuestions?.length || 0} questions for ${subject} grade ${grade}`);
            totalInserted += insertedQuestions?.length || 0;
          }
        }
      }
    }

    // Verify the data
    console.log('\n🔍 Verifying inserted data...');
    
    const { data: academicCount } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_type', 'academic');
    
    const { data: aptitudeCount } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true })
      .eq('question_type', 'aptitude');

    console.log(`📊 Database Summary:`);
    console.log(`   - Academic Questions: ${academicCount?.length || 0}`);
    console.log(`   - Aptitude Questions: ${aptitudeCount?.length || 0}`);
    console.log(`   - Total Questions: ${(academicCount?.length || 0) + (aptitudeCount?.length || 0)}`);

    // Test API endpoints
    console.log('\n🧪 Testing API endpoints...');
    await testAPIEndpoints();

    console.log('\n🎉 Academic questions population completed successfully!');
    console.log(`📈 Total questions inserted: ${totalInserted}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Test the academic test generation');
    console.log('   2. Create comprehensive assessments');
    console.log('   3. Generate stream recommendations');
    console.log('   4. Test the complete workflow');

  } catch (error) {
    console.error('❌ Population failed:', error.message);
    process.exit(1);
  }
}

async function testAPIEndpoints() {
  try {
    // Test academic questions endpoint
    const { data: academicQuestions, error: academicError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('question_type', 'academic')
      .limit(5);

    if (academicError) {
      console.log('   ❌ Academic Questions API: Error');
    } else {
      console.log(`   ✅ Academic Questions API: ${academicQuestions?.length || 0} questions available`);
    }

    // Test by subject
    const subjects = ['mathematics', 'science', 'english', 'social_science'];
    for (const subject of subjects) {
      const { data: subjectQuestions } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', subject)
        .eq('question_type', 'academic')
        .limit(1);

      console.log(`   ✅ ${subject.charAt(0).toUpperCase() + subject.slice(1)}: ${subjectQuestions?.length || 0} questions`);
    }

  } catch (error) {
    console.log('   ⚠️  API testing failed:', error.message);
  }
}

// Run the population
populateAcademicQuestions();
