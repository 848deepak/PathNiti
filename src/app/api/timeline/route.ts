import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const stream = searchParams.get('stream')
    const classLevel = searchParams.get('classLevel')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any
    let query = supabaseAny
      .from('admission_deadlines')
      .select(`
        *,
        colleges (
          id,
          name,
          location
        )
      `)
      .eq('is_active', true)

    // Apply filters
    if (type) {
      query = query.eq('deadline_type', type)
    }
    if (stream) {
      query = query.eq('stream', stream)
    }
    if (classLevel) {
      query = query.eq('class_level', classLevel)
    }

    // Sort by deadline date
    query = query.order('deadline_date', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching timeline items:', error)
      return NextResponse.json({ error: 'Failed to fetch timeline items' }, { status: 500 })
    }

    return NextResponse.json({ timelineItems: data })
  } catch (error) {
    console.error('Timeline API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { title, description, deadline_date, deadline_type, college_id, program_id, stream, class_level } = body

    // Validate required fields
    if (!title || !deadline_date || !deadline_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('admission_deadlines')
      .insert({
        title,
        description,
        deadline_date,
        deadline_type,
        college_id,
        program_id,
        stream,
        class_level,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating timeline item:', error)
      return NextResponse.json({ error: 'Failed to create timeline item' }, { status: 500 })
    }

    return NextResponse.json({ timelineItem: data }, { status: 201 })
  } catch (error) {
    console.error('Timeline POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Timeline item ID is required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('admission_deadlines')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating timeline item:', error)
      return NextResponse.json({ error: 'Failed to update timeline item' }, { status: 500 })
    }

    return NextResponse.json({ timelineItem: data })
  } catch (error) {
    console.error('Timeline PUT API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Timeline item ID is required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('admission_deadlines')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting timeline item:', error)
      return NextResponse.json({ error: 'Failed to delete timeline item' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Timeline item deleted successfully' })
  } catch (error) {
    console.error('Timeline DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
