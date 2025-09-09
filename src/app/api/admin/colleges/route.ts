import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, CollegeInsert } from '@/lib'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const verified = searchParams.get('verified')

    const supabase = createServerClient()
    let query = supabase
      .from('colleges')
      .select(`
        *,
        programs (id, name, stream, level)
      `)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,location->>city.ilike.%${search}%,location->>state.ilike.%${search}%`)
    }

    // Apply verification filter
    if (verified !== null) {
      query = query.eq('is_verified', verified === 'true')
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching colleges:', error)
      return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 })
    }

    return NextResponse.json({
      colleges: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Admin colleges API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<CollegeInsert>
    const {
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
      images
    } = body

    // Validate required fields
    if (!name || !type || !location || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('colleges')
      .insert({
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
        is_verified: false,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating college:', error)
      return NextResponse.json({ error: 'Failed to create college' }, { status: 500 })
    }

    return NextResponse.json({ college: data }, { status: 201 })
  } catch (error) {
    console.error('Admin colleges POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'College ID is required' }, { status: 400 })
    }

    const supabase = createServerClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('colleges')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating college:', error)
      return NextResponse.json({ error: 'Failed to update college' }, { status: 500 })
    }

    return NextResponse.json({ college: data })
  } catch (error) {
    console.error('Admin colleges PUT API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'College ID is required' }, { status: 400 })
    }

    const supabase = createServerClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('colleges')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting college:', error)
      return NextResponse.json({ error: 'Failed to delete college' }, { status: 500 })
    }

    return NextResponse.json({ message: 'College deleted successfully' })
  } catch (error) {
    console.error('Admin colleges DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
