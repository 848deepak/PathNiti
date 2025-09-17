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

    // Check if user is college
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'college') {
      return NextResponse.json({ error: 'Forbidden - College access required' }, { status: 403 })
    }

    // Get college profile and data
    const { data: collegeProfile, error: collegeProfileError } = await supabase
      .from('college_profiles')
      .select(`
        *,
        colleges (
          id,
          name,
          type,
          location,
          address,
          website,
          phone,
          email,
          established_year,
          accreditation,
          facilities,
          programs,
          cut_off_data,
          admission_process,
          fees,
          images,
          is_verified,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('id', user.id)
      .single()

    if (collegeProfileError) {
      return NextResponse.json({ error: 'Failed to fetch college data' }, { status: 500 })
    }

    return NextResponse.json({ college: collegeProfile })
  } catch (error) {
    console.error('Error in GET /api/colleges/manage:', error)
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

    // Check if user is college
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'college') {
      return NextResponse.json({ error: 'Forbidden - College access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, data } = body

    // Get college ID from college profile
    const { data: collegeProfile, error: collegeProfileError } = await supabase
      .from('college_profiles')
      .select('college_id')
      .eq('id', user.id)
      .single()

    if (collegeProfileError || !collegeProfile) {
      return NextResponse.json({ error: 'College profile not found' }, { status: 404 })
    }

    switch (action) {
      case 'update_college':
        const { error: updateCollegeError } = await supabase
          .from('colleges')
          .update(data)
          .eq('id', collegeProfile.college_id)

        if (updateCollegeError) {
          return NextResponse.json({ error: 'Failed to update college' }, { status: 500 })
        }
        break

      case 'update_profile':
        const { error: updateProfileError } = await supabase
          .from('college_profiles')
          .update(data)
          .eq('id', user.id)

        if (updateProfileError) {
          return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
        }
        break

      case 'add_program':
        const { error: addProgramError } = await supabase
          .from('programs')
          .insert({
            ...data,
            college_id: collegeProfile.college_id
          })

        if (addProgramError) {
          return NextResponse.json({ error: 'Failed to add program' }, { status: 500 })
        }
        break

      case 'update_program':
        const { error: updateProgramError } = await supabase
          .from('programs')
          .update(data)
          .eq('id', data.id)
          .eq('college_id', collegeProfile.college_id) // Ensure college owns this program

        if (updateProgramError) {
          return NextResponse.json({ error: 'Failed to update program' }, { status: 500 })
        }
        break

      case 'delete_program':
        const { error: deleteProgramError } = await supabase
          .from('programs')
          .delete()
          .eq('id', data.id)
          .eq('college_id', collegeProfile.college_id) // Ensure college owns this program

        if (deleteProgramError) {
          return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 })
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/colleges/manage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



