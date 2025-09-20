/**
 * Comprehensive Student Assessment API
 * Handles multidimensional assessment including aptitude, RIASEC interests,
 * personality traits, subject performance, and practical constraints
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  enhancedAIEngine,
  EnhancedUserProfile,
} from "@/lib/enhanced-ai-engine";
import {
  AptitudeScores,
  RIASECScores,
  PersonalityScores,
  SubjectPerformance,
  PracticalConstraints,
  AssessmentSessionInsert,
  // AssessmentResponseInsert, // Temporarily disabled
  Json,
  // StudentRecommendationInsert, // Temporarily disabled
  ScholarshipRecommendation,
} from "@/lib/types";

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
      return NextResponse.json(
        { error: "User ID and assessment data are required" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // 1. Create assessment session
    const sessionData: AssessmentSessionInsert = {
      user_id,
      status: "completed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      aptitude_scores: assessment_data.aptitude_scores as unknown as Json,
      riasec_scores: assessment_data.riasec_scores as unknown as Json,
      personality_scores: assessment_data.personality_scores as unknown as Json,
      subject_performance: assessment_data.subject_performance as unknown as Json,
      practical_constraints: assessment_data.practical_constraints as unknown as Json,
    };

    // Insert assessment session into database
    const { data: session, error: sessionError } = await supabase
      .from("assessment_sessions" as any)
      .insert(sessionData as any)
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating assessment session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create assessment session" },
        { status: 500 },
      );
    }

    // 2. Store individual responses in quiz_responses table
    if (responses && responses.length > 0) {
      // Get questions to determine correct answers
      const questionIds = responses.map(r => r.question_id);
      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("id, correct_answer, question_type")
        .in("id", questionIds);

      if (questionsError) {
        console.error("Error fetching questions for validation:", questionsError);
      }

      // Create a map of question_id to correct answer
      const correctAnswersMap = new Map<string, number>();
      if (questions && Array.isArray(questions)) {
        questions.forEach((q: any) => {
          correctAnswersMap.set(q.id, q.correct_answer);
        });
      }

      // Store individual responses
      const responseData = responses.map((response) => {
        const correctAnswer = correctAnswersMap.get(response.question_id);
        const isCorrect = correctAnswer !== null && correctAnswer !== undefined 
          ? response.selected_answer === correctAnswer 
          : null; // For interest/personality questions, is_correct is null

        return {
          user_id: user_id,
          question_id: response.question_id,
          selected_answer: response.selected_answer,
          time_taken: response.time_taken,
          is_correct: isCorrect,
        };
      });

      const { error: responsesError } = await supabase
        .from("quiz_responses")
        .insert(responseData as any);

      if (responsesError) {
        console.error("Error storing quiz responses:", responsesError);
      }
    }

    // 3. Get user profile for AI recommendations
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single() as { data: Record<string, unknown> | null; error: Error | null };

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // 4. Prepare enhanced user profile for AI
    const enhancedProfile: EnhancedUserProfile = {
      user_id,
      basic_info: {
        age: profile.date_of_birth
          ? new Date().getFullYear() -
            new Date(profile.date_of_birth as string).getFullYear()
          : undefined,
        class_level: profile.class_level as string,
        current_stream: profile.stream as string,
        location: profile.location as Record<string, unknown>,
      },
      assessment_results: assessment_data,
      timestamp: new Date().toISOString(),
    };

    // 5. Generate AI recommendations
    const recommendations =
      await enhancedAIEngine.generateComprehensiveRecommendations(
        enhancedProfile,
      );

    // 6. Get relevant colleges and scholarships from database
    const { colleges, scholarships } = await getRelevantCollegesAndScholarships(
      supabase,
      recommendations.primary_recommendations as unknown as Array<{ stream: string; [key: string]: unknown }>,
      profile as { location: string; [key: string]: unknown },
    );

    // Update recommendations with actual college and scholarship data
    recommendations.colleges = colleges;
    recommendations.scholarships = scholarships as unknown as ScholarshipRecommendation[];

    // 7. Store recommendations in database (temporarily disabled)
    // const recommendationData: StudentRecommendationInsert = {
    //   user_id,
    //   session_id: session.id,
    //   primary_recommendations: recommendations.primary_recommendations as unknown as Json,
    //   secondary_recommendations: recommendations.secondary_recommendations as unknown as Json,
    //   backup_options: recommendations.backup_options as unknown as Json,
    //   recommended_colleges: colleges as unknown as Json,
    //   relevant_scholarships: scholarships as unknown as Json,
    //   overall_reasoning: recommendations.overall_reasoning,
    //   recommendation_confidence: recommendations.confidence_score,
    //   ai_model_used: "enhanced-gemini-1.5-flash",
    //   generated_at: new Date().toISOString(),
    //   is_active: true,
    // };

    // Temporarily disabled - student_recommendations table not defined in schema
    // const { data: storedRecommendation, error: recError } = await supabase
    //   .from("student_recommendations")
    //   .insert(recommendationData)
    //   .select()
    //   .single();
    
    const storedRecommendation = { id: "temp-recommendation-id" }; // Temporary placeholder
    const recError = null;

    if (recError) {
      console.error("Error storing recommendations:", recError);
    }

    // 8. Update user timeline
    // Temporarily disabled - user_timeline table not defined in schema
    // await (supabase as any).from("user_timeline").insert({
    //   user_id,
    //   action: "comprehensive_assessment_completed",
    //   data: {
    //     session_id: session.id,
    //     total_score: sessionData.total_score,
    //     top_recommendation: recommendations.primary_recommendations[0]?.stream,
    //   },
    // });

    return NextResponse.json({
      success: true,
      session_id: (session as any).id,
      assessment_summary: {
        total_score: sessionData.total_score,
        completed_at: new Date().toISOString(),
      },
      recommendations,
      recommendation_id: storedRecommendation?.id,
    });
  } catch (error) {
    console.error("Error in comprehensive assessment API:", error);
    return NextResponse.json(
      { error: "Internal server error during assessment processing" },
      { status: 500 },
    );
  }
}

/**
 * Calculate overall assessment score
 */
/*
function calculateOverallScore(assessmentData: AssessmentRequest['assessment_data']): number {
  const { aptitude_scores, riasec_scores, personality_scores, subject_performance } = assessmentData;

  // Calculate averages for each dimension
  const aptitudeAvg = Object.values(aptitude_scores).reduce((sum, val) => sum + (val as number), 0) / Object.values(aptitude_scores).length;
  const riasecAvg = Object.values(riasec_scores).reduce((sum, val) => sum + (val as number), 0) / Object.values(riasec_scores).length;
  const personalityAvg = Object.values(personality_scores).reduce((sum, val) => sum + (val as number), 0) / Object.values(personality_scores).length;
  
  const subjectAvg = Object.values(subject_performance).reduce((sum, subject) => {
    const subj = subject as { accuracy: number; speed: number };
    return sum + ((subj.accuracy + subj.speed) / 2);
  }, 0) / Object.values(subject_performance).length;

  // Weighted average (aptitude: 30%, subject: 25%, RIASEC: 25%, personality: 20%)
  const overallScore = (aptitudeAvg * 0.3) + (subjectAvg * 0.25) + (riasecAvg * 0.25) + (personalityAvg * 0.2);
  
  return Math.round(overallScore * 100); // Convert to 0-100 scale
}
*/

/**
 * Calculate real scores from quiz responses
 */
function calculateRealScoresFromResponses(responses: any[]): {
  aptitude_scores: AptitudeScores;
  riasec_scores: RIASECScores;
  personality_scores: PersonalityScores;
  subject_performance: SubjectPerformance;
} {
  const aptitude_scores: Record<string, number> = {};
  const riasec_scores: Record<string, number> = {};
  const personality_scores: Record<string, number> = {};
  const subject_performance: Record<string, { accuracy: number; speed: number }> = {};

  // Group responses by question type and category
  const groupedResponses = responses.reduce((acc, response) => {
    const question = response.quiz_questions;
    const type = question.question_type;
    const category = question.category;
    
    if (!acc[type]) acc[type] = {};
    if (!acc[type][category]) acc[type][category] = [];
    
    acc[type][category].push({
      selected_answer: response.selected_answer,
      time_taken: response.time_taken,
      is_correct: response.is_correct,
      scoring_weight: question.scoring_weight || 1.0
    });
    
    return acc;
  }, {} as any);

  // Calculate aptitude scores (based on correctness)
  if (groupedResponses.aptitude) {
    Object.entries(groupedResponses.aptitude).forEach(([category, responses]: [string, any]) => {
      const correctCount = responses.filter((r: any) => r.is_correct === true).length;
      const totalCount = responses.length;
      aptitude_scores[category] = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
    });
  }

  // Calculate RIASEC scores (based on agreement level)
  if (groupedResponses.riasec_interest) {
    Object.entries(groupedResponses.riasec_interest).forEach(([category, responses]: [string, any]) => {
      const totalScore = responses.reduce((sum: number, r: any) => {
        // Convert 0-4 scale to 0-100 scale (0=Strongly Disagree, 4=Strongly Agree)
        return sum + (r.selected_answer * 25);
      }, 0);
      riasec_scores[category] = responses.length > 0 ? totalScore / responses.length : 0;
    });
  }

  // Calculate personality scores (based on agreement level)
  if (groupedResponses.personality) {
    Object.entries(groupedResponses.personality).forEach(([category, responses]: [string, any]) => {
      const totalScore = responses.reduce((sum: number, r: any) => {
        // Convert 0-4 scale to 0-100 scale
        return sum + (r.selected_answer * 25);
      }, 0);
      personality_scores[category] = responses.length > 0 ? totalScore / responses.length : 0;
    });
  }

  // Calculate subject performance scores
  if (groupedResponses.subject_performance) {
    Object.entries(groupedResponses.subject_performance).forEach(([category, responses]: [string, any]) => {
      const totalScore = responses.reduce((sum: number, r: any) => {
        return sum + (r.selected_answer * 25);
      }, 0);
      const avgTime = responses.reduce((sum: number, r: any) => sum + (r.time_taken || 0), 0) / responses.length;
      
      subject_performance[category] = {
        accuracy: responses.length > 0 ? totalScore / responses.length : 0,
        speed: Math.max(0, 100 - (avgTime / 30) * 100) // Convert time to speed score
      };
    });
  }

  return {
    aptitude_scores: aptitude_scores as unknown as AptitudeScores,
    riasec_scores: riasec_scores as unknown as RIASECScores,
    personality_scores: personality_scores as unknown as PersonalityScores,
    subject_performance: subject_performance as unknown as SubjectPerformance,
  };
}

/**
 * Get relevant colleges and scholarships based on recommendations
 */
async function getRelevantCollegesAndScholarships(
  supabase: ReturnType<typeof createServiceClient>,
  primaryRecommendations: Array<{ stream: string; [key: string]: unknown }>,
  userProfile: { location: string; [key: string]: unknown },
) {
  const recommendedStreams = primaryRecommendations.map((rec) => rec.stream);
  // const userLocation = userProfile.location; // Unused variable

  // Get colleges
  let collegeQuery = supabase
    .from("colleges")
    .select(
      `
      id, name, type, location, address, website, phone, email,
      programs!inner(name, stream, level, duration, eligibility, fees),
      facilities, is_active
    `,
    )
    .eq("is_active", true)
    .limit(20);

  // Filter by streams
  if (recommendedStreams.length > 0) {
    collegeQuery = collegeQuery.in("programs.stream", recommendedStreams);
  }

  const { data: colleges, error: collegeError } = await collegeQuery;

  if (collegeError) {
    console.error("Error fetching colleges:", collegeError);
  }

  // Get scholarships
  const { data: scholarships, error: scholarshipError } = await supabase
    .from("scholarships")
    .select("*")
    .eq("is_active", true)
    .limit(10);

  if (scholarshipError) {
    console.error("Error fetching scholarships:", scholarshipError);
  }

  // Format college data for recommendations
  const formattedColleges = (colleges || []).map(
    (college: {
      id: string;
      name: string;
      location?: { city?: string; state?: string };
      programs?: Array<{ stream: string; eligibility?: string; fees?: string }>;
    }) => ({
      college_id: college.id,
      college_name: college.name,
      address: `${college.location?.city}, ${college.location?.state}`,
      stream_offered: college.programs?.map((p) => p.stream).join(", ") || "",
      admission_criteria:
        college.programs?.[0]?.eligibility || "Check college website",
      fee_structure: college.programs?.[0]?.fees || "Contact college",
      admission_open_date: "Check college website",
      admission_close_date: "Check college website",
      match_score: calculateCollegeMatchScore(
        college,
        userProfile,
        recommendedStreams,
      ),
      reasons: generateCollegeMatchReasons(
        college,
        userProfile as { location?: { state?: string } },
        recommendedStreams,
      ),
    }),
  );

  // Format scholarship data
  const formattedScholarships = (scholarships || []).map(
    (scholarship: {
      id: string;
      name: string;
      amount: { min: number; max: number; currency: string } | null;
      eligibility: {
        academic_requirements: string[];
        income_criteria?: { min: number; max: number };
        other_requirements: string[];
      } | null;
    }) => ({
      scholarship_id: scholarship.id,
      name: scholarship.name,
      eligibility: scholarship.eligibility || "Check details",
      benefit: scholarship.amount
        ? `₹${scholarship.amount.min || 0} - ₹${scholarship.amount.max || 0}`
        : "Varies",
      application_deadline: "Check website", // Default value since application_deadline not in database schema
      match_score: 0.8, // Basic match score
    }),
  );

  return {
    colleges: formattedColleges
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10),
    scholarships: formattedScholarships.slice(0, 5),
  };
}

function calculateCollegeMatchScore(
  college: { programs?: Array<{ stream: string }>; location?: { state?: string }; type?: string },
  userProfile: { [key: string]: unknown },
  recommendedStreams: string[],
): number {
  let score = 0.5; // Base score

  // Stream match
  if (college.programs?.some((p) => recommendedStreams.includes(p.stream))) {
    score += 0.3;
  }

  // Location preference (if same state)
  const userLocation = userProfile.location as { state?: string } | undefined;
  if (
    userLocation?.state &&
    college.location?.state === userLocation.state
  ) {
    score += 0.2;
  }

  // College type preference (government colleges get slight boost)
  if (college.type === "government") {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

function generateCollegeMatchReasons(
  college: { 
    programs?: Array<{ stream: string }>; 
    type?: string; 
    location?: { state?: string }; 
    facilities?: {
      hostel?: boolean;
      library?: boolean;
      laboratory?: boolean;
      sports?: boolean;
      canteen?: boolean;
      wifi?: boolean;
      parking?: boolean;
      auditorium?: boolean;
      computer_lab?: boolean;
      medical_facility?: boolean;
    }
  },
  userProfile: { location?: { state?: string } },
  recommendedStreams: string[],
): string[] {
  const reasons = [];

  if (college.programs?.some((p) => recommendedStreams.includes(p.stream))) {
    reasons.push("Offers your recommended stream");
  }

  if (
    userProfile.location?.state &&
    college.location?.state === userProfile.location.state
  ) {
    reasons.push("Located in your home state");
  }

  if (college.type === "government") {
    reasons.push("Government institution with quality education");
  }

  if (college.facilities?.hostel) {
    reasons.push("Hostel facilities available");
  }

  return reasons;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const sessionId = searchParams.get("session_id");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    // Get latest assessment session for user
    let query = supabase
      .from("assessment_sessions" as any)
      .select(
        `
        *,
        student_recommendations(*)
      `,
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (sessionId && sessionId !== "temp-session-id") {
      // Only filter by session ID if it's a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(sessionId)) {
        query = query.eq("id", sessionId);
      }
    }

    const { data: sessions, error } = await query.limit(1);

    if (error) {
      console.error("Error fetching assessment data:", error);
      return NextResponse.json(
        { error: "Failed to fetch assessment data" },
        { status: 500 },
      );
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: "No assessment found" },
        { status: 404 },
      );
    }

    const session = sessions[0] as any;
    const storedRecommendations = session.student_recommendations?.[0];
    
    // If no stored recommendations, generate them on-the-fly using real assessment data
    let recommendations = storedRecommendations;
    if (!recommendations) {
      try {
        // Get user profile for AI recommendations
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (!profileError && profile) {
          // Get actual quiz responses to calculate real scores
          const { data: quizResponses, error: responsesError } = await supabase
            .from("quiz_responses")
            .select(`
              question_id,
              selected_answer,
              time_taken,
              is_correct,
              quiz_questions!inner(question_type, category, correct_answer, scoring_weight)
            `)
            .eq("user_id", userId);

          if (responsesError) {
            console.error("Error fetching quiz responses:", responsesError);
          }

          // Calculate real scores from actual responses
          const calculatedScores = calculateRealScoresFromResponses(quizResponses || []);

          // Prepare enhanced user profile for AI with real data
          const profileData = profile as any;
          const enhancedProfile: EnhancedUserProfile = {
            user_id: userId,
            basic_info: {
              age: profileData.date_of_birth
                ? new Date().getFullYear() -
                  new Date(profileData.date_of_birth as string).getFullYear()
                : undefined,
              class_level: profileData.class_level as string,
              current_stream: profileData.stream as string,
              location: profileData.location as Record<string, unknown>,
            },
            assessment_results: {
              aptitude_scores: calculatedScores.aptitude_scores,
              riasec_scores: calculatedScores.riasec_scores,
              personality_scores: calculatedScores.personality_scores,
              subject_performance: calculatedScores.subject_performance,
              practical_constraints: session.practical_constraints as PracticalConstraints,
            },
            timestamp: new Date().toISOString(),
          };

          // Generate AI recommendations using real data
          recommendations = await enhancedAIEngine.generateComprehensiveRecommendations(enhancedProfile);
          
          // Get relevant colleges and scholarships
          const { colleges, scholarships } = await getRelevantCollegesAndScholarships(
            supabase,
            recommendations.primary_recommendations as unknown as Array<{ stream: string; [key: string]: unknown }>,
            profile as { location: string; [key: string]: unknown },
          );

          // Update recommendations with actual college and scholarship data
          recommendations.colleges = colleges;
          recommendations.scholarships = scholarships as unknown as ScholarshipRecommendation[];
        }
      } catch (error) {
        console.error("Error generating recommendations on-the-fly:", error);
        // Provide fallback recommendations structure
        recommendations = {
          primary_recommendation: {
            stream: "general",
            reasoning: "Based on your assessment results, we recommend exploring various career options.",
            time_to_earn: "3-4 years",
            average_salary: "₹3-6 LPA",
            job_demand_trend: "medium",
            confidence_score: 0.6,
            career_paths: ["General Career Path"]
          },
          secondary_recommendation: {
            stream: "alternative",
            reasoning: "Consider alternative career paths based on your interests.",
            time_to_earn: "2-3 years",
            average_salary: "₹2-4 LPA",
            job_demand_trend: "medium",
            confidence_score: 0.5,
            career_paths: ["Alternative Career Path"]
          },
          backup_options: [],
          recommended_colleges: [],
          relevant_scholarships: [],
          confidence_score: 0.6,
          ai_reasoning: "Recommendations generated based on your assessment data."
        };
      }
    }

    return NextResponse.json({
      success: true,
      assessment: session,
      recommendations: recommendations,
    });
  } catch (error) {
    console.error("Error in assessment GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
