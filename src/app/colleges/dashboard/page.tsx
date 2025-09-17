"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui"
import { useAuth } from "../../providers"
import { 
  Building, 
  Users, 
  BookOpen, 
  Calendar,
  Settings,
  Plus,
  Edit,
  Eye,
  Search,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface CollegeData {
  id: string
  name: string
  type: string
  location: {
    state: string
    city: string
  }
  is_verified: boolean
  programs_count: number
  contact_person: string
  designation: string
  phone: string
}

interface Program {
  id: string
  name: string
  stream: string
  level: string
  duration: number
  seats: number
  is_active: boolean
}

export default function CollegeDashboardPage() {
  const { user, profile, isCollege } = useAuth()
  const router = useRouter()
  const [collegeData, setCollegeData] = useState<CollegeData | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Check if user is college using the new role system
    if (!isCollege()) {
      router.push("/dashboard")
      return
    }

    fetchCollegeData()
  }, [user, profile, isCollege, router])

  const fetchCollegeData = async () => {
    try {
      if (!user) return

      // Fetch college profile data
      const { data: collegeProfile, error: profileError } = await supabase
        .from('college_profiles')
        .select(`
          *,
          colleges (
            id,
            name,
            type,
            location,
            is_verified
          )
        `)
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching college profile:', profileError)
        return
      }

      if (collegeProfile) {
        setCollegeData({
          id: collegeProfile.colleges.id,
          name: collegeProfile.colleges.name,
          type: collegeProfile.colleges.type,
          location: collegeProfile.colleges.location,
          is_verified: collegeProfile.colleges.is_verified,
          programs_count: 0, // Will be fetched separately
          contact_person: collegeProfile.contact_person,
          designation: collegeProfile.designation || '',
          phone: collegeProfile.phone || ''
        })
      }

      // Fetch programs for this college
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .eq('college_id', collegeProfile?.colleges.id)
        .eq('is_active', true)

      if (programsError) {
        console.error('Error fetching programs:', programsError)
      } else {
        setPrograms(programsData || [])
        if (collegeData) {
          setCollegeData(prev => prev ? { ...prev, programs_count: programsData?.length || 0 } : null)
        }
      }
    } catch (error) {
      console.error("Error fetching college data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.stream.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading college dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !isCollege()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">College Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Building className="h-4 w-4 mr-2" />
                Back to Main Dashboard
              </Link>
            </Button>
            <Button variant="outline" onClick={() => router.push("/auth/login")}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {collegeData?.name || 'College Dashboard'}
          </h1>
          <p className="text-gray-600">
            Manage your college information and programs.
          </p>
          {collegeData && (
            <div className="mt-4 flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                collegeData.is_verified 
                  ? "bg-green-100 text-green-800" 
                  : "bg-orange-100 text-orange-800"
              }`}>
                {collegeData.is_verified ? (
                  <><CheckCircle className="h-4 w-4 inline mr-1" />Verified</>
                ) : (
                  <><Clock className="h-4 w-4 inline mr-1" />Pending Verification</>
                )}
              </span>
              <span className="text-sm text-gray-600">
                {collegeData.location.city}, {collegeData.location.state}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "programs", label: "Programs", icon: BookOpen },
                { id: "admissions", label: "Admissions", icon: Calendar },
                { id: "settings", label: "Settings", icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Programs</p>
                      <p className="text-2xl font-bold text-gray-900">{collegeData?.programs_count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Profile Views</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* College Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>College Information</CardTitle>
                  <CardDescription>
                    Basic information about your institution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">College Name</label>
                      <p className="mt-1 text-sm text-gray-900">{collegeData?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{collegeData?.type?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="mt-1 text-sm text-gray-900">{collegeData?.location.city}, {collegeData?.location.state}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                      <p className="mt-1 text-sm text-gray-900">{collegeData?.contact_person}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Designation</label>
                      <p className="mt-1 text-sm text-gray-900">{collegeData?.designation || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks for managing your college
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Program
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit College Information
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Admission Deadlines
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      College Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === "programs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((program) => (
                  <Card key={program.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              program.is_active 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {program.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">
                            {program.stream} • {program.level} • {program.duration} years
                          </p>
                          <p className="text-sm text-gray-500">
                            {program.seats} seats available
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? 'No programs match your search criteria.' : 'You haven\'t added any programs yet.'}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Program
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Admissions Tab */}
        {activeTab === "admissions" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admission Management</CardTitle>
                <CardDescription>
                  Manage admission deadlines and processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Admission Management</h3>
                  <p className="text-gray-600 mb-4">
                    Set up admission deadlines and manage the application process.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Set Up Admissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>College Settings</CardTitle>
                <CardDescription>
                  Manage your college profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <Input defaultValue={collegeData?.contact_person || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation
                    </label>
                    <Input defaultValue={collegeData?.designation || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input defaultValue={collegeData?.phone || ''} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
