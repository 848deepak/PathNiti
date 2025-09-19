#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log('🔍 Checking Database Contents...\n');

  try {
    // Check all questions
    console.log('📚 All Questions in Database:');
    const { data: allQuestions, error: allError } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all questions:', allError.message);
    } else {
      console.log(`Total questions: ${allQuestions?.length || 0}`);
      if (allQuestions && allQuestions.length > 0) {
        allQuestions.forEach((q, index) => {
          console.log(`${index + 1}. [${q.question_type}] ${q.category} - ${q.question_text.substring(0, 50)}...`);
        });
      }
    }

    console.log('\n📊 Questions by Type:');
    
    // Check by question type
    const { data: academicQuestions, error: academicError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('question_type', 'academic');

    if (academicError) {
      console.error('❌ Error fetching academic questions:', academicError.message);
    } else {
      console.log(`Academic questions: ${academicQuestions?.length || 0}`);
    }

    const { data: aptitudeQuestions, error: aptitudeError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('question_type', 'aptitude');

    if (aptitudeError) {
      console.error('❌ Error fetching aptitude questions:', aptitudeError.message);
    } else {
      console.log(`Aptitude questions: ${aptitudeQuestions?.length || 0}`);
    }

    console.log('\n📋 Questions by Category:');
    
    // Check by category
    const categories = ['mathematics', 'science', 'english', 'social_science'];
    for (const category of categories) {
      const { data: categoryQuestions, error: categoryError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', category);

      if (categoryError) {
        console.error(`❌ Error fetching ${category} questions:`, categoryError.message);
      } else {
        console.log(`${category}: ${categoryQuestions?.length || 0} questions`);
        if (categoryQuestions && categoryQuestions.length > 0) {
          categoryQuestions.forEach((q, index) => {
            console.log(`  ${index + 1}. [${q.question_type}] ${q.question_text.substring(0, 60)}...`);
          });
        }
      }
    }

    console.log('\n🔍 Recent Questions (Last 10):');
    const { data: recentQuestions, error: recentError } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('❌ Error fetching recent questions:', recentError.message);
    } else {
      if (recentQuestions && recentQuestions.length > 0) {
        recentQuestions.forEach((q, index) => {
          console.log(`${index + 1}. [${q.question_type}] ${q.category} - ${q.question_text.substring(0, 50)}...`);
          console.log(`   Created: ${q.created_at}`);
        });
      } else {
        console.log('No recent questions found');
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();
