/**
 * Comprehensive Student Assessment API
 * Handles multidimensional assessment including aptitude, RIASEC interests, 
 * personality traits, subject performance, and practical constraints
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { enhancedAIEngine, EnhancedUserProfile } from '@/lib/enhanced-ai-engine';
import { 
  AptitudeScores, 
  RIASECScores, 
  PersonalityScores, 
  SubjectPerformance, 
  PracticalConstraints,
  AssessmentSessionInsert,
  AssessmentResponseInsert,
  StudentRecommendationInsert
} from '@/lib/types';

interface AssessmentRequest {
  user_id: string;
  assessment_data: {
    aptitude_scores: AptitudeScores;
    riasec_scores: RIASECScores;
    personality_scores: PersonalityScores;
    subject_performance: SubjectPerformance;
    practical_constraints: PracticalConstraints;
  };
  responses: Array<{
    question_id: string;
    selected_answer: number;
    time_taken: number;
    question_type: string;
    category: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequest = await request.json();
    const { user_id, assessment_data, responses } = body;

    if (!user_id || !assessment_data) {
      return NextResponse.json({ error: 'User ID and assessment data are required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1. Create assessment session
    const sessionData: AssessmentSessionInsert = {
      user_id,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      aptitude_scores: assessment_data.aptitude_scores,
      riasec_scores: assessment_data.riasec_scores,
      personality_scores: assessment_data.personality_scores,
      subject_performance: assessment_data.subject_performance,
      practical_constraints: assessment_data.practical_constraints,
      total_questions: responses.length,
      answered_questions: responses.length,
      time_spent: responses.reduce((total, r) => total + r.time_taken, 0),
      session_type: 'comprehensive'
    };

    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating assessment session:', sessionError);
      return NextResponse.json({ error: 'Failed to create assessment session' }, { status: 500 });
    }

    // 2. Store individual responses
    if (responses && responses.length > 0) {
      const responseData: AssessmentResponseInsert[] = responses.map(response => ({
        session_id: session.id,
        question_id: response.question_id,
        user_answer: response.selected_answer,
        time_taken: response.time_taken,
        is_correct: null // Will be calculated based on question type
      }));

      const { error: responsesError } = await supabase
        .from('assessment_responses')
        .insert(responseData);

      if (responsesError) {
        console.error('Error storing assessment responses:', responsesError);
      }
    }

    // 3. Get user profile for AI recommendations
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // 4. Prepare enhanced user profile for AI
    const enhancedProfile: EnhancedUserProfile = {
      user_id,
      basic_info: {
        age: profile.date_of_birth ? 
          new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : undefined,
        class_level: profile.class_level,
        current_stream: profile.stream,
        location: profile.location
      },
      assessment_results: assessment_data,
      timestamp: new Date().toISOString()
    };

    // 5. Generate AI recommendations
    const recommendations = await enhancedAIEngine.generateComprehensiveRecommendations(enhancedProfile);

    // 6. Get relevant colleges and scholarships from database
    const { colleges, scholarships } = await getRelevantCollegesAndScholarships(
      supabase, 
      recommendations.primary_recommendations,
      profile
    );

    // Update recommendations with actual college and scholarship data
    recommendations.colleges = colleges;
    recommendations.scholarships = scholarships;

    // 7. Store recommendations in database
    const recommendationData: StudentRecommendationInsert = {
      user_id,
      session_id: session.id,
      primary_recommendations: recommendations.primary_recommendations,
      secondary_recommendations: recommendations.secondary_recommendations,
      backup_options: recommendations.backup_options,
      recommended_colleges: colleges,
      relevant_scholarships: scholarships,
      overall_reasoning: recommendations.overall_reasoning,
      recommendation_confidence: recommendations.confidence_score,
      ai_model_used: 'enhanced-gemini-1.5-flash',
      generated_at: new Date().toISOString(),
      is_active: true
    };

    const { data: storedRecommendation, error: recError } = await supabase
      .from('student_recommendations')
      .insert(recommendationData)
      .select()
      .single();

    if (recError) {
      console.error('Error storing recommendations:', recError);
    }

    // 8. Update user timeline
    await supabase
      .from('user_timeline')
      .insert({
        user_id,
        action: 'comprehensive_assessment_completed',
        data: {
          session_id: session.id,
          total_score: sessionData.total_score,
          top_recommendation: recommendations.primary_recommendations[0]?.stream
        }
      });

    return NextResponse.json({
      success: true,
      session_id: session.id,
      assessment_summary: {
        total_score: sessionData.total_score,
        completed_at: session.completed_at
      },
      recommendations,
      recommendation_id: storedRecommendation?.id
    });

  } catch (error) {
    console.error('Error in comprehensive assessment API:', error);
    return NextResponse.json(
      { error: 'Internal server error during assessment processing' },
      { status: 500 }
    );
  }
}

/**
 * Calculate overall assessment score
 */
function calculateOverallScore(assessmentData: AssessmentRequest['assessment_data']): number {
  const { aptitude_scores, riasec_scores, personality_scores, subject_performance } = assessmentData;

  // Calculate averages for each dimension
  const aptitudeAvg = Object.values(aptitude_scores).reduce((sum, val) => sum + (val as number), 0) / Object.values(aptitude_scores).length;
  const riasecAvg = Object.values(riasec_scores).reduce((sum, val) => sum + (val as number), 0) / Object.values(riasec_scores).length;
  const personalityAvg = Object.values(personality_scores).reduce((sum, val) => sum + (val as number), 0) / Object.values(personality_scores).length;
  
  const subjectAvg = Object.values(subject_performance).reduce((sum, subject) => {
    const subj = subject as any;
    return sum + ((subj.accuracy + subj.speed) / 2);
  }, 0) / Object.values(subject_performance).length;

  // Weighted average (aptitude: 30%, subject: 25%, RIASEC: 25%, personality: 20%)
  const overallScore = (aptitudeAvg * 0.3) + (subjectAvg * 0.25) + (riasecAvg * 0.25) + (personalityAvg * 0.2);
  
  return Math.round(overallScore * 100); // Convert to 0-100 scale
}


/**
 * Get relevant colleges and scholarships based on recommendations
 */
async function getRelevantCollegesAndScholarships(
  supabase: any,
  primaryRecommendations: any[],
  userProfile: any
) {
  const recommendedStreams = primaryRecommendations.map(rec => rec.stream);
  const userLocation = userProfile.location;

  // Get colleges
  let collegeQuery = supabase
    .from('colleges')
    .select(`
      id, name, type, location, address, website, phone, email,
      programs!inner(name, stream, level, duration, eligibility, fees),
      facilities, is_active
    `)
    .eq('is_active', true)
    .limit(20);

  // Filter by streams
  if (recommendedStreams.length > 0) {
    collegeQuery = collegeQuery.in('programs.stream', recommendedStreams);
  }

  const { data: colleges, error: collegeError } = await collegeQuery;

  if (collegeError) {
    console.error('Error fetching colleges:', collegeError);
  }

  // Get scholarships
  const { data: scholarships, error: scholarshipError } = await supabase
    .from('scholarships')
    .select('*')
    .eq('is_active', true)
    .limit(10);

  if (scholarshipError) {
    console.error('Error fetching scholarships:', scholarshipError);
  }

  // Format college data for recommendations
  const formattedColleges = (colleges || []).map((college: any) => ({
    college_id: college.id,
    college_name: college.name,
    address: `${college.location?.city}, ${college.location?.state}`,
    stream_offered: college.programs?.map((p: any) => p.stream).join(', ') || '',
    admission_criteria: college.programs?.[0]?.eligibility || 'Check college website',
    fee_structure: college.programs?.[0]?.fees || 'Contact college',
    admission_open_date: 'Check college website',
    admission_close_date: 'Check college website',
    match_score: calculateCollegeMatchScore(college, userProfile, recommendedStreams),
    reasons: generateCollegeMatchReasons(college, userProfile, recommendedStreams)
  }));

  // Format scholarship data
  const formattedScholarships = (scholarships || []).map((scholarship: any) => ({
    scholarship_id: scholarship.id,
    name: scholarship.name,
    eligibility: scholarship.eligibility || 'Check details',
    benefit: scholarship.amount ? `₹${scholarship.amount.min || 0} - ₹${scholarship.amount.max || 0}` : 'Varies',
    application_deadline: scholarship.application_deadline || 'Check website',
    match_score: 0.8 // Basic match score
  }));

  return {
    colleges: formattedColleges.sort((a, b) => b.match_score - a.match_score).slice(0, 10),
    scholarships: formattedScholarships.slice(0, 5)
  };
}

function calculateCollegeMatchScore(college: any, userProfile: any, recommendedStreams: string[]): number {
  let score = 0.5; // Base score

  // Stream match
  if (college.programs?.some((p: any) => recommendedStreams.includes(p.stream))) {
    score += 0.3;
  }

  // Location preference (if same state)
  if (userProfile.location?.state && college.location?.state === userProfile.location.state) {
    score += 0.2;
  }

  // College type preference (government colleges get slight boost)
  if (college.type === 'government') {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

function generateCollegeMatchReasons(college: any, userProfile: any, recommendedStreams: string[]): string[] {
  const reasons = [];

  if (college.programs?.some((p: any) => recommendedStreams.includes(p.stream))) {
    reasons.push('Offers your recommended stream');
  }

  if (userProfile.location?.state && college.location?.state === userProfile.location.state) {
    reasons.push('Located in your home state');
  }

  if (college.type === 'government') {
    reasons.push('Government institution with quality education');
  }

  if (college.facilities?.includes('hostel')) {
    reasons.push('Hostel facilities available');
  }

  return reasons;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const sessionId = searchParams.get('session_id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }


  const supabase = createServiceClient();

  try {
    // Get latest assessment session for user
    let query = supabase
      .from('assessment_sessions')
      .select(`
        *,
        student_recommendations(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (sessionId) {
      query = query.eq('id', sessionId);
    }

    const { data: sessions, error } = await query.limit(1);

    if (error) {
      console.error('Error fetching assessment data:', error);
      return NextResponse.json({ error: 'Failed to fetch assessment data' }, { status: 500 });
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ error: 'No assessment found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      assessment: sessions[0],
      recommendations: sessions[0].student_recommendations?.[0] || null
    });

  } catch (error) {
    console.error('Error in assessment GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
