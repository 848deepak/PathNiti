import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Fetch all colleges with program counts
    const { data: colleges, error: collegesError } = await supabase
      .from('colleges')
      .select(`
        *,
        programs(count)
      `)
      .order('created_at', { ascending: false })

    if (collegesError) {
      return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 })
    }

    // Transform data to include program count
    const collegesWithCounts = colleges?.map(college => ({
      ...college,
      programs_count: college.programs?.[0]?.count || 0
    }))

    return NextResponse.json({ colleges: collegesWithCounts })
  } catch (error) {
    console.error('Error in GET /api/admin/colleges:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, collegeId, data } = body

    switch (action) {
      case 'verify':
        const { error: verifyError } = await supabase
          .from('colleges')
          .update({ is_verified: true })
          .eq('id', collegeId)

        if (verifyError) {
          return NextResponse.json({ error: 'Failed to verify college' }, { status: 500 })
        }
        break

      case 'update':
        const { error: updateError } = await supabase
          .from('colleges')
          .update(data)
          .eq('id', collegeId)

        if (updateError) {
          return NextResponse.json({ error: 'Failed to update college' }, { status: 500 })
        }
        break

      case 'delete':
        const { error: deleteError } = await supabase
          .from('colleges')
          .delete()
          .eq('id', collegeId)

        if (deleteError) {
          return NextResponse.json({ error: 'Failed to delete college' }, { status: 500 })
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/admin/colleges:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
