"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { useAuth } from "@/lib"
import { 
  GraduationCap, 
  Brain, 
  MapPin, 
  Calendar, 
  BookOpen, 
  LogOut,
  User,
  Settings
} from "lucide-react"
import Link from "next/link"
import NotificationSystem from "@/components/NotificationSystem"

export default function DashboardPage() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Bypass authentication for demo purposes
    const fetchProfile = async () => {
      try {
        // Mock profile data for demo
        const mockProfile = {
          id: "demo-user-123",
          first_name: "Demo",
          last_name: "User",
          email: "demo@pathniti.com",
          role: "student",
          location: {
            city: "New Delhi",
            state: "Delhi"
          }
        }
        setProfile(mockProfile)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Bypass user check for demo

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">PathNiti</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(profile as any)?.first_name} {(profile as any)?.last_name}
              </span>
            </div>
            <NotificationSystem userId="demo-user-123" />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(profile as any)?.role === "admin" && (
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200" asChild>
                <Link href="/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="hover:scale-105 transition-transform duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary/10 via-blue-50 to-purple-50 rounded-3xl p-8 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  Welcome back, {(profile as any)?.first_name}! 👋
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Ready to continue your career journey? Let&apos;s explore what&apos;s next for you.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Profile Complete</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Ready to explore</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Quiz Status</p>
                  <p className="text-2xl font-bold text-gray-900">Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Colleges Available</p>
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scholarships</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/quiz" className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-6 w-6 text-primary mr-2" />
                  Aptitude Assessment
                </CardTitle>
                <CardDescription>
                  Discover your strengths and interests with our comprehensive quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <span>Start Assessment</span>
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/colleges" className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-6 w-6 text-green-600 mr-2" />
                  Find Colleges
                </CardTitle>
                <CardDescription>
                  Explore government colleges near you with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" asChild>
                  <span>Browse Colleges</span>
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/timeline" className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                  Timeline Tracker
                </CardTitle>
                <CardDescription>
                  Never miss important deadlines for admissions and scholarships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" asChild>
                  <span>View Timeline</span>
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions on PathNiti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Profile completed</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Account created</p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Recommendations</CardTitle>
              <CardDescription>Based on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Complete your aptitude assessment</p>
                  <p className="text-xs text-blue-700">Get personalized career recommendations</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <p className="text-sm font-medium text-green-900">Explore colleges in {(profile as any)?.location?.city}</p>
                  <p className="text-xs text-green-700">Find government colleges near you</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
