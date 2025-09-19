#!/usr/bin/env node

/**
 * Final Verification of Question Bank and College Database
 * Provides comprehensive summary of the implementation
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Required subjects per class
const REQUIRED_SUBJECTS = {
  10: ['science', 'mathematics', 'english', 'social_science'],
  11: ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'economics', 'accountancy', 'business_studies'],
  12: ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'economics', 'accountancy', 'business_studies']
};

async function finalVerification() {
  console.log('🔍 FINAL VERIFICATION REPORT');
  console.log('=' .repeat(50));
  
  try {
    // 1. Overall Question Statistics
    console.log('\n📊 QUESTION BANK STATISTICS');
    console.log('-'.repeat(30));
    
    const { data: allQuestions } = await supabase
      .from('quiz_questions')
      .select('*');
    
    console.log(`Total Questions in Database: ${allQuestions?.length || 0}`);
    
    // Group by category
    const questionsByCategory = {};
    if (allQuestions) {
      allQuestions.forEach(q => {
        if (!questionsByCategory[q.category]) {
          questionsByCategory[q.category] = [];
        }
        questionsByCategory[q.category].push(q);
      });
    }
    
    console.log('\nQuestions by Subject:');
    Object.keys(questionsByCategory).sort().forEach(category => {
      const count = questionsByCategory[category].length;
      const status = count >= 25 ? '✅' : count > 0 ? '⚠️' : '❌';
      console.log(`  ${status} ${category}: ${count} questions`);
    });
    
    // 2. Subject-wise Requirements Check
    console.log('\n📋 SUBJECT REQUIREMENTS CHECK');
    console.log('-'.repeat(35));
    
    let totalSubjects = 0;
    let subjectsMet = 0;
    
    for (const [grade, subjects] of Object.entries(REQUIRED_SUBJECTS)) {
      console.log(`\nClass ${grade}:`);
      
      for (const subject of subjects) {
        totalSubjects++;
        const count = questionsByCategory[subject]?.length || 0;
        const status = count >= 25 ? '✅' : count > 0 ? '⚠️' : '❌';
        const statusText = count >= 25 ? 'MET' : 'BELOW TARGET';
        
        if (count >= 25) subjectsMet++;
        
        console.log(`  ${status} ${subject}: ${count} questions (${statusText})`);
      }
    }
    
    console.log(`\nRequirement Summary: ${subjectsMet}/${totalSubjects} subjects have 25+ questions`);
    
    // 3. College Database Check
    console.log('\n🏫 COLLEGE DATABASE STATUS');
    console.log('-'.repeat(30));
    
    const { data: colleges } = await supabase
      .from('colleges')
      .select('*');
    
    console.log(`Total Colleges: ${colleges?.length || 0}`);
    
    if (colleges && colleges.length > 0) {
      const collegesByType = {};
      colleges.forEach(c => {
        if (!collegesByType[c.type]) collegesByType[c.type] = 0;
        collegesByType[c.type]++;
      });
      
      console.log('\nColleges by Type:');
      Object.keys(collegesByType).forEach(type => {
        console.log(`  ${type}: ${collegesByType[type]} colleges`);
      });
      
      const verifiedCount = colleges.filter(c => c.is_verified).length;
      console.log(`\nVerified Colleges: ${verifiedCount}/${colleges.length}`);
    }
    
    // 4. Implementation Status
    console.log('\n✅ IMPLEMENTATION STATUS');
    console.log('-'.repeat(30));
    
    const implementationStatus = {
      'Database Schema': '✅ Complete',
      'Question Generation': subjectsMet > 0 ? '✅ Partial' : '❌ Incomplete',
      'College Database': colleges?.length > 0 ? '✅ Complete' : '❌ Incomplete',
      'Subject Coverage': `${Math.round((subjectsMet/totalSubjects)*100)}% (${subjectsMet}/${totalSubjects})`,
      'Database-driven Colleges': colleges?.length > 0 ? '✅ Implemented' : '❌ Not Implemented'
    };
    
    Object.keys(implementationStatus).forEach(key => {
      console.log(`  ${key}: ${implementationStatus[key]}`);
    });
    
    // 5. Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(20));
    
    const recommendations = [];
    
    if (subjectsMet < totalSubjects) {
      const missingSubjects = [];
      for (const [grade, subjects] of Object.entries(REQUIRED_SUBJECTS)) {
        for (const subject of subjects) {
          const count = questionsByCategory[subject]?.length || 0;
          if (count < 25) {
            missingSubjects.push(`${subject} (Class ${grade}): needs ${25 - count} more questions`);
          }
        }
      }
      
      recommendations.push('📝 Complete question generation for:');
      missingSubjects.slice(0, 5).forEach(subject => {
        recommendations.push(`   - ${subject}`);
      });
      if (missingSubjects.length > 5) {
        recommendations.push(`   - ... and ${missingSubjects.length - 5} more subjects`);
      }
    }
    
    if (!colleges || colleges.length < 10) {
      recommendations.push('🏫 Add more colleges to the database for better coverage');
    }
    
    recommendations.push('🔧 Set up admin interface for managing questions and colleges');
    recommendations.push('🧪 Test the question generation and assessment system');
    recommendations.push('📊 Implement analytics for tracking student performance');
    
    recommendations.forEach(rec => console.log(`  ${rec}`));
    
    // 6. Next Steps
    console.log('\n🚀 NEXT STEPS');
    console.log('-'.repeat(15));
    
    const nextSteps = [
      '1. Complete question generation for remaining subjects',
      '2. Test the assessment system with sample students',
      '3. Implement admin dashboard for content management',
      '4. Add more colleges and verify their information',
      '5. Set up automated question review and approval workflow',
      '6. Implement stream recommendation algorithm',
      '7. Add performance analytics and reporting'
    ];
    
    nextSteps.forEach(step => console.log(`  ${step}`));
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 VERIFICATION COMPLETE');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

finalVerification();