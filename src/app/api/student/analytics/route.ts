import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch student analytics data
    const [
      assessmentData,
      collegeData,
      applicationData,
      scholarshipData,
      recentActivity
    ] = await Promise.all([
      // Get latest assessment scores
      supabase
        .from('assessment_sessions')
        .select('riasec_scores, aptitude_scores, completed_at')
        .eq('user_id', user_id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single(),

      // Get colleges explored (from user_favorites)
      supabase
        .from('user_favorites')
        .select('college_id, created_at')
        .eq('user_id', user_id)
        .eq('favorite_type', 'college'),

      // Get applications tracked (from user_favorites with programs)
      supabase
        .from('user_favorites')
        .select('program_id, created_at')
        .eq('user_id', user_id)
        .eq('favorite_type', 'program'),

      // Get scholarships found (from user_favorites)
      supabase
        .from('user_favorites')
        .select('scholarship_id, created_at')
        .eq('user_id', user_id)
        .eq('favorite_type', 'scholarship'),

      // Get recent activity (from user_timeline)
      supabase
        .from('user_timeline')
        .select('action, data, created_at')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Calculate quiz score average
    let quizScoreAverage = 0;
    let lastAssessmentScore = 0;
    let scoreChange = 0;

    if (assessmentData.data) {
      // Calculate average from aptitude_scores
      let currentScore = 0;
      
      if (assessmentData.data.aptitude_scores) {
        const scores = Object.values(assessmentData.data.aptitude_scores) as number[];
        if (scores.length > 0) {
          currentScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        }
      }
      
      quizScoreAverage = currentScore;
      lastAssessmentScore = currentScore;

      // Get previous assessment for comparison
      const { data: previousAssessment } = await supabase
        .from('assessment_sessions')
        .select('aptitude_scores')
        .eq('user_id', user_id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .range(1, 1); // Get the second most recent

      if (previousAssessment && previousAssessment.length > 0) {
        let previousScore = 0;
        
        if (previousAssessment[0].aptitude_scores) {
          const prevScores = Object.values(previousAssessment[0].aptitude_scores) as number[];
          if (prevScores.length > 0) {
            previousScore = Math.round(prevScores.reduce((sum, score) => sum + score, 0) / prevScores.length);
          }
        }
        
        scoreChange = currentScore - previousScore;
      }
    }

    // Count colleges explored
    const collegesExplored = collegeData.data?.length || 0;
    const collegesThisWeek = collegeData.data?.filter(item => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.created_at) > weekAgo;
    }).length || 0;

    // Count applications tracked
    const applicationsTracked = applicationData.data?.length || 0;
    
    // Get upcoming deadlines (mock data for now - would need admission_deadlines table)
    const upcomingDeadlines = 2; // This would be calculated from admission_deadlines table

    // Count scholarships found
    const scholarshipsFound = scholarshipData.data?.length || 0;
    
    // Calculate total scholarship value (mock data - would need actual scholarship amounts)
    const totalScholarshipValue = scholarshipsFound * 31250; // Average ₹31,250 per scholarship

    // Get recent activity
    const recentActivityList = recentActivity.data?.map(activity => ({
      action: activity.action,
      description: getActivityDescription(activity.action, activity.data),
      timestamp: activity.created_at,
      timeAgo: getTimeAgo(activity.created_at)
    })) || [];

    // Get progress milestones
    const progressMilestones = await getProgressMilestones(user_id, supabase);

    const analytics = {
      quizScoreAverage: Math.round(quizScoreAverage),
      lastAssessmentScore: Math.round(lastAssessmentScore),
      scoreChange: Math.round(scoreChange),
      collegesExplored,
      collegesThisWeek,
      applicationsTracked,
      upcomingDeadlines,
      scholarshipsFound,
      totalScholarshipValue,
      recentActivity: recentActivityList,
      progressMilestones
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching student analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

function getActivityDescription(action: string, data: any): string {
  switch (action) {
    case 'quiz_completed':
      return `Completed ${data?.quiz_type || 'assessment'} with score ${data?.score || 'N/A'}%`;
    case 'college_viewed':
      return `Viewed ${data?.college_name || 'college'}`;
    case 'college_saved':
      return `Saved ${data?.college_name || 'college'} to favorites`;
    case 'application_started':
      return `Started application for ${data?.program_name || 'program'}`;
    case 'scholarship_found':
      return `Found scholarship: ${data?.scholarship_name || 'scholarship'}`;
    default:
      return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

async function getProgressMilestones(user_id: string, supabase: any) {
  const milestones = [];

  // Check if profile is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, is_verified')
    .eq('id', user_id)
    .single();

  if (profile) {
    milestones.push({
      id: 'profile_setup',
      title: 'Profile Setup Complete',
      description: 'Account created and verified',
      completed: true,
      completedAt: profile.created_at
    });
  }

  // Check if assessment is completed
  const { data: assessment } = await supabase
    .from('assessment_sessions')
    .select('status, aptitude_scores, completed_at')
    .eq('user_id', user_id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (assessment) {
    let score = 0;
    
    // Calculate score from aptitude_scores
    if (assessment.aptitude_scores) {
      const scores = Object.values(assessment.aptitude_scores) as number[];
      if (scores.length > 0) {
        score = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      }
    }
    
    let recommendation = 'General';
    if (score >= 80) recommendation = 'Engineering';
    else if (score >= 60) recommendation = 'Commerce';
    else recommendation = 'Arts';

    milestones.push({
      id: 'assessment_completed',
      title: 'Aptitude Assessment Completed',
      description: `Scored ${score}% - ${recommendation} recommended`,
      completed: true,
      completedAt: assessment.completed_at
    });
  }

  // Check college applications
  const { data: applications } = await supabase
    .from('user_favorites')
    .select('program_id')
    .eq('user_id', user_id)
    .eq('favorite_type', 'program');

  if (applications && applications.length > 0) {
    milestones.push({
      id: 'college_applications',
      title: 'College Applications',
      description: `${applications.length} applications in progress`,
      completed: false,
      inProgress: true
    });
  }

  // Check admission results (mock - would need actual admission data)
  milestones.push({
    id: 'admission_results',
    title: 'Admission Results',
    description: 'Waiting for results',
    completed: false,
    inProgress: false
  });

  return milestones;
}
