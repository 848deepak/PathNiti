import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Keep-alive endpoint to prevent Supabase from sleeping
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Simple query to keep the connection alive
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.log('Keep-alive query result:', error.message)
      // Don't fail the request even if there's an error
      // This is just to keep the connection alive
    }

    return NextResponse.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      message: 'Supabase connection kept alive',
      data: data ? 'Connection successful' : 'No data returned'
    })

  } catch (error) {
    console.error('Keep-alive error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to keep connection alive'
      },
      { status: 500 }
    )
  }
}

// Also handle POST requests for more robust keep-alive
export async function POST(request: NextRequest) {
  return GET(request)
}
