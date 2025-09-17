import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const state = searchParams.get('state')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('colleges')
      .select('*')
      .eq('is_active', true)
      .order('name')

    // Apply filters
    if (state) {
      query = query.eq('location->>state', state)
    }
    
    if (type) {
      query = query.eq('type', type)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: colleges, error, count } = await query

    if (error) {
      console.error('Error fetching colleges:', error)
      return NextResponse.json(
        { error: 'Failed to fetch colleges' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      colleges,
      total: count,
      limit,
      offset
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Check if user is authenticated and is admin
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const { name, type, location, address } = body
    
    if (!name || !type || !location || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, location, address' },
        { status: 400 }
      )
    }

    // Insert new college
    const { data: college, error } = await supabase
      .from('colleges')
      .insert({
        name,
        type,
        location,
        address,
        website: body.website || null,
        phone: body.phone || null,
        email: body.email || null,
        established_year: body.established_year || null,
        accreditation: body.accreditation || null,
        facilities: body.facilities || null,
        programs: body.programs || null,
        is_verified: false, // New colleges need verification
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating college:', error)
      return NextResponse.json(
        { error: 'Failed to create college' },
        { status: 500 }
      )
    }

    return NextResponse.json(college, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
