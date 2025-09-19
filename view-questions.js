#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function viewQuestions() {
  console.log('📚 Academic Questions in Database\n');

  try {
    // Get all academic questions
    const { data: academicQuestions, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('question_type', 'academic')
      .order('category', { ascending: true });

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (!academicQuestions || academicQuestions.length === 0) {
      console.log('❌ No academic questions found');
      return;
    }

    console.log(`✅ Found ${academicQuestions.length} academic questions:\n`);

    // Group by category
    const questionsByCategory = academicQuestions.reduce((acc, q) => {
      if (!acc[q.category]) acc[q.category] = [];
      acc[q.category].push(q);
      return acc;
    }, {});

    // Display by category
    Object.keys(questionsByCategory).forEach(category => {
      console.log(`📖 ${category.toUpperCase()} (${questionsByCategory[category].length} questions):`);
      questionsByCategory[category].forEach((q, index) => {
        console.log(`\n${index + 1}. ${q.question_text}`);
        console.log(`   Options: ${JSON.stringify(q.options)}`);
        console.log(`   Correct Answer: ${q.options[q.correct_answer]}`);
        console.log(`   Difficulty: ${q.difficulty_level}, Time: ${q.time_limit}s, Weight: ${q.scoring_weight}`);
        console.log(`   Subcategory: ${q.subcategory}`);
        console.log(`   Created: ${new Date(q.created_at).toLocaleString()}`);
      });
      console.log('\n' + '='.repeat(80) + '\n');
    });

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`Total Academic Questions: ${academicQuestions.length}`);
    Object.keys(questionsByCategory).forEach(category => {
      console.log(`- ${category}: ${questionsByCategory[category].length} questions`);
    });

  } catch (error) {
    console.error('❌ Error viewing questions:', error.message);
  }
}

viewQuestions();
