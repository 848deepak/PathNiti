import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('college_id');

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is college admin for this college
    const { data: profile } = await supabase
      .from('college_profiles')
      .select('college_id')
      .eq('id', user.id)
      .single();

    if (!profile || (collegeId && profile.college_id !== collegeId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch notices for the college
    const { data: notices, error } = await supabase
      .from('college_notices')
      .select('*')
      .eq('college_id', profile.college_id)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching notices:', error);
      return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
    }

    return NextResponse.json({ notices });
  } catch (error) {
    console.error('Error in GET /api/colleges/admin/notices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is college admin
    const { data: profile } = await supabase
      .from('college_profiles')
      .select('college_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate required fields
    const { title, content, type = 'general', expires_at } = body;
    if (!title || !content) {
      return NextResponse.json({ 
        error: 'Title and content are required' 
      }, { status: 400 });
    }

    // Validate notice type
    const validTypes = ['general', 'admission', 'event', 'urgent'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid notice type' 
      }, { status: 400 });
    }

    // Create notice
    const noticeData = {
      college_id: profile.college_id,
      title: title.trim(),
      content: content.trim(),
      type,
      expires_at: expires_at || null,
      is_active: true,
      published_at: new Date().toISOString()
    };

    const { data: notice, error } = await supabase
      .from('college_notices')
      .insert(noticeData)
      .select()
      .single();

    if (error) {
      console.error('Error creating notice:', error);
      return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 });
    }

    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/colleges/admin/notices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}