import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Archive the current session
    const { error: archiveError } = await supabase
      .from('conversation_sessions')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', session_id);

    if (archiveError) {
      console.error('Error archiving session:', archiveError);
      return NextResponse.json(
        { error: 'Failed to reset chat session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chat session reset successfully',
    });
  } catch (error) {
    console.error('Error in chat session reset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
