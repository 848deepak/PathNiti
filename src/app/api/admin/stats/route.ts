import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib'

export async function GET() {
  try {
    const supabase = createServerClient()
    // Get total counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any
    const [
      { count: totalUsers },
      { count: totalColleges },
      { count: totalPrograms },
      { count: totalScholarships },
      { count: pendingVerifications },
      { count: recentActivity }
    ] = await Promise.all([
      supabaseAny.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAny.from('colleges').select('*', { count: 'exact', head: true }),
      supabaseAny.from('programs').select('*', { count: 'exact', head: true }),
      supabaseAny.from('scholarships').select('*', { count: 'exact', head: true }),
      supabaseAny.from('colleges').select('*', { count: 'exact', head: true }).eq('is_verified', false),
      supabaseAny.from('user_timeline').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ])

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: userGrowth } = await supabaseAny
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true })

    // Get college verification status
    const { data: collegeStats } = await supabaseAny
      .from('colleges')
      .select('is_verified, type')
      .eq('is_active', true)

    // Get user role distribution
    const { data: roleStats } = await supabaseAny
      .from('profiles')
      .select('role')

    // Calculate growth rate
    const currentUsers = totalUsers || 0
    const previousUsers = Math.max(0, currentUsers - (userGrowth?.length || 0))
    const growthRate = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0

    // Process college verification stats
    const verificationStats = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      verified: collegeStats?.filter((c: any) => c.is_verified).length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pending: collegeStats?.filter((c: any) => !c.is_verified).length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      byType: collegeStats?.reduce((acc: any, college: any) => {
        acc[college.type] = (acc[college.type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
    }

    // Process role distribution
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleDistribution = roleStats?.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Get recent activity
    const { data: recentActivities } = await supabaseAny
      .from('user_timeline')
      .select('action, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    const stats = {
      totalUsers: totalUsers || 0,
      totalColleges: totalColleges || 0,
      totalPrograms: totalPrograms || 0,
      totalScholarships: totalScholarships || 0,
      pendingVerifications: pendingVerifications || 0,
      recentActivity: recentActivity || 0,
      growthRate: Math.round(growthRate * 100) / 100,
      verificationStats,
      roleDistribution,
      recentActivities: recentActivities || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userGrowth: userGrowth?.map((user: any) => ({
        date: user.created_at.split('T')[0],
        count: 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })).reduce((acc: any, item: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existing = acc.find((a: any) => a.date === item.date)
        if (existing) {
          existing.count += 1
        } else {
          acc.push(item)
        }
        return acc
      }, [] as Array<{ date: string; count: number }>) || []
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
