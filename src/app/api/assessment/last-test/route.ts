import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Get the latest completed assessment session
    const { data: latestSession, error: sessionError } = await supabase
      .from("assessment_sessions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !latestSession) {
      return NextResponse.json(
        { error: "No completed assessment found" },
        { status: 404 },
      );
    }

    // Get all responses for this session with question details
    const { data: responses, error: responsesError } = await supabase
      .from("assessment_responses")
      .select(`
        *,
        quiz_questions (
          id,
          question_text,
          options,
          correct_answer,
          category,
          difficulty_level,
          explanation
        )
      `)
      .eq("session_id", (latestSession as any).id)
      .order("answered_at", { ascending: true });

    if (responsesError) {
      console.error("Error fetching responses:", responsesError);
      return NextResponse.json(
        { error: "Failed to fetch test responses" },
        { status: 500 },
      );
    }

    // Format the response
    const testData = {
      session: {
        id: (latestSession as any).id,
        completed_at: (latestSession as any).completed_at,
        aptitude_scores: (latestSession as any).aptitude_scores,
        riasec_scores: (latestSession as any).riasec_scores,
        personality_scores: (latestSession as any).personality_scores,
      },
      questions: responses.map((response: any) => ({
        question_id: response.question_id,
        question_text: response.quiz_questions?.question_text,
        options: response.quiz_questions?.options,
        correct_answer: response.quiz_questions?.correct_answer,
        user_answer: response.user_answer,
        is_correct: response.is_correct,
        time_taken: response.time_taken,
        category: response.quiz_questions?.category,
        difficulty_level: response.quiz_questions?.difficulty_level,
        explanation: response.quiz_questions?.explanation,
        answered_at: response.answered_at,
      })),
      summary: {
        total_questions: responses.length,
        correct_answers: responses.filter((r: any) => r.is_correct === true).length,
        incorrect_answers: responses.filter((r: any) => r.is_correct === false).length,
        unanswered: responses.filter((r: any) => r.is_correct === null).length,
        average_time_per_question: responses.reduce((sum: number, r: any) => sum + (r.time_taken || 0), 0) / responses.length,
      },
    };

    return NextResponse.json({
      success: true,
      data: testData,
    });
  } catch (error) {
    console.error("Error fetching last test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
