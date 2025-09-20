/**
 * Debug script to check assessment data and create sample data if needed
 */

import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAssessmentData() {
  console.log('🔍 Debugging Assessment Data...');
  
  try {
    // Check if assessment_sessions table exists and has data
    const { data: sessions, error: sessionsError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .limit(5);
    
    if (sessionsError) {
      console.error('❌ Error fetching assessment sessions:', sessionsError);
      return;
    }
    
    console.log(`📊 Found ${sessions?.length || 0} assessment sessions`);
    
    if (sessions && sessions.length > 0) {
      console.log('✅ Sample session data:');
      console.log(JSON.stringify(sessions[0], null, 2));
    } else {
      console.log('⚠️ No assessment sessions found');
      
      // Check if we have any users to create a test session for
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        return;
      }
      
      if (users && users.length > 0) {
        console.log('👤 Found users, creating sample assessment session...');
        
        const sampleSession = {
          user_id: users[0].id,
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          aptitude_scores: {
            logical_reasoning: 0.8,
            quantitative_skills: 0.7,
            language_verbal_skills: 0.6,
            spatial_visual_skills: 0.5,
            memory_attention: 0.7
          },
          riasec_scores: {
            realistic: 0.6,
            investigative: 0.8,
            artistic: 0.4,
            social: 0.5,
            enterprising: 0.7,
            conventional: 0.6
          },
          personality_scores: {
            introvert_extrovert: 0.5,
            risk_taking_vs_risk_averse: 0.4,
            structured_vs_flexible: 0.3,
            leadership_vs_supportive: 0.6
          },
          subject_performance: {
            science_aptitude: { accuracy: 0.8, speed: 0.7 },
            math_aptitude: { accuracy: 0.7, speed: 0.6 },
            logical_reasoning: { accuracy: 0.8, speed: 0.8 },
            general_knowledge: { accuracy: 0.6, speed: 0.5 }
          },
          practical_constraints: {
            location: 'Delhi',
            financial_background: 'middle',
            parental_expectation: 'any'
          },
          total_score: 75,
          total_questions: 30,
          answered_questions: 30,
          time_spent: 1800,
          session_type: 'comprehensive'
        };
        
        const { data: newSession, error: insertError } = await supabase
          .from('assessment_sessions')
          .insert(sampleSession)
          .select()
          .single();
        
        if (insertError) {
          console.error('❌ Error creating sample session:', insertError);
        } else {
          console.log('✅ Created sample assessment session:', newSession.id);
        }
      } else {
        console.log('⚠️ No users found to create test data');
      }
    }
    
    // Check assessment_responses table
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('*')
      .limit(5);
    
    if (responsesError) {
      console.error('❌ Error fetching assessment responses:', responsesError);
    } else {
      console.log(`📝 Found ${responses?.length || 0} assessment responses`);
    }
    
    // Check quiz_questions table
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .limit(5);
    
    if (questionsError) {
      console.error('❌ Error fetching quiz questions:', questionsError);
    } else {
      console.log(`❓ Found ${questions?.length || 0} quiz questions`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug function
debugAssessmentData().then(() => {
  console.log('🏁 Debug completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
