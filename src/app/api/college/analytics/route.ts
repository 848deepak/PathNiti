import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const college_id = searchParams.get('college_id');

    if (!college_id) {
      return NextResponse.json(
        { error: 'College ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch college analytics data
    const [
      collegeInfo,
      programsData,
      applicationsData,
      studentInterests
    ] = await Promise.all([
      // Get college information
      supabase
        .from('colleges')
        .select('name, type, location, website, established_year')
        .eq('id', college_id)
        .single(),

      // Get programs offered by this college
      supabase
        .from('programs')
        .select('id, name, stream, duration, fees')
        .eq('college_id', college_id),

      // Get applications/favorites for this college
      supabase
        .from('user_favorites')
        .select('user_id, program_id, created_at')
        .eq('college_id', college_id)
        .eq('favorite_type', 'college'),

      // Get student interests in programs
      supabase
        .from('user_favorites')
        .select('program_id, created_at')
        .eq('college_id', college_id)
        .eq('favorite_type', 'program')
    ]);

    // Calculate program statistics
    const totalPrograms = programsData.data?.length || 0;
    const engineeringPrograms = programsData.data?.filter(p => p.stream === 'engineering').length || 0;
    const commercePrograms = programsData.data?.filter(p => p.stream === 'commerce').length || 0;
    const artsPrograms = programsData.data?.filter(p => p.stream === 'arts').length || 0;

    // Calculate application statistics
    const totalApplications = applicationsData.data?.length || 0;
    const applicationsThisWeek = applicationsData.data?.filter(app => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(app.created_at) > weekAgo;
    }).length || 0;

    // Calculate program interest statistics
    const programInterests = studentInterests.data?.length || 0;
    const popularPrograms = programsData.data?.map(program => {
      const interestCount = studentInterests.data?.filter(interest => 
        interest.program_id === program.id
      ).length || 0;
      return {
        name: program.name,
        stream: program.stream,
        interestCount,
        fees: program.fees
      };
    }).sort((a, b) => b.interestCount - a.interestCount).slice(0, 5) || [];

    // Get recent applications
    const recentApplications = applicationsData.data?.slice(0, 10).map(app => ({
      action: 'application_received',
      description: `New application received`,
      timestamp: app.created_at,
      timeAgo: getTimeAgo(app.created_at)
    })) || [];

    const analytics = {
      collegeInfo: collegeInfo.data,
      totalPrograms,
      engineeringPrograms,
      commercePrograms,
      artsPrograms,
      totalApplications,
      applicationsThisWeek,
      programInterests,
      popularPrograms,
      recentApplications
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching college analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
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