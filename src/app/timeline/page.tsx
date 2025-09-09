"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, CardContent, Input } from "@/components/ui"
// import { supabase } from "@/lib" // Removed unused import
import { useAuth } from "@/lib"
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  Bell, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  BookOpen,
  MapPin,
  Filter
} from "lucide-react"
import Link from "next/link"

interface TimelineItem {
  id: string
  title: string
  description: string
  deadline_date: string
  deadline_type: string
  college_id?: string
  program_id?: string
  stream?: string
  class_level?: string
  is_active: boolean
  created_at: string
  college?: {
    name: string
    location: {
      city: string
      state: string
    }
  }
}

export default function TimelinePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [filteredItems, setFilteredItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedStream, setSelectedStream] = useState("")
  const [selectedClassLevel, setSelectedClassLevel] = useState("")
  // const [showAddModal, setShowAddModal] = useState(false) // Removed unused variables

  const filterItems = () => {
    let filtered = timelineItems

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.college?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType) {
      filtered = filtered.filter(item => item.deadline_type === selectedType)
    }

    if (selectedStream) {
      filtered = filtered.filter(item => item.stream === selectedStream)
    }

    if (selectedClassLevel) {
      filtered = filtered.filter(item => item.class_level === selectedClassLevel)
    }

    // Sort by deadline date
    filtered.sort((a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime())

    setFilteredItems(filtered)
  }

  useEffect(() => {
    // if (!user) {
    //   router.push("/auth/login")
    //   return
    // }

    fetchTimelineItems()
  }, [router])

  useEffect(() => {
    filterItems()
  }, [timelineItems, searchTerm, selectedType, selectedStream, selectedClassLevel, filterItems])

  const fetchTimelineItems = async () => {
    try {
      // For demo purposes, we'll use sample data
      // In production, this would fetch from the database
      const sampleItems: TimelineItem[] = [
        {
          id: "1",
          title: "Delhi University Application Deadline",
          description: "Last date to submit application for undergraduate programs",
          deadline_date: "2024-03-31",
          deadline_type: "application",
          stream: "arts",
          class_level: "12",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          college: {
            name: "Delhi University",
            location: { city: "New Delhi", state: "Delhi" }
          }
        },
        {
          id: "2",
          title: "JEE Main 2024 Exam",
          description: "Joint Entrance Examination for engineering programs",
          deadline_date: "2024-04-15",
          deadline_type: "exam",
          stream: "engineering",
          class_level: "12",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "3",
          title: "NEET 2024 Application",
          description: "National Eligibility cum Entrance Test application deadline",
          deadline_date: "2024-02-28",
          deadline_type: "application",
          stream: "medical",
          class_level: "12",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "4",
          title: "National Scholarship Portal Application",
          description: "Apply for government scholarships for undergraduate students",
          deadline_date: "2024-12-31",
          deadline_type: "scholarship",
          class_level: "undergraduate",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "5",
          title: "IIT Delhi Counseling",
          description: "Online counseling for IIT Delhi admissions",
          deadline_date: "2024-06-15",
          deadline_type: "counseling",
          stream: "engineering",
          class_level: "12",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          college: {
            name: "IIT Delhi",
            location: { city: "New Delhi", state: "Delhi" }
          }
        },
        {
          id: "6",
          title: "Merit Cum Means Scholarship",
          description: "Scholarship for minority community students",
          deadline_date: "2024-11-30",
          deadline_type: "scholarship",
          class_level: "undergraduate",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z"
        }
      ]

      setTimelineItems(sampleItems)
    } catch (error) {
      console.error("Error fetching timeline items:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDeadlineStatus = (deadlineDate: string) => {
    const today = new Date()
    const deadline = new Date(deadlineDate)
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: "expired", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle }
    } else if (diffDays <= 7) {
      return { status: "urgent", color: "text-orange-600", bgColor: "bg-orange-50", icon: AlertCircle }
    } else if (diffDays <= 30) {
      return { status: "upcoming", color: "text-yellow-600", bgColor: "bg-yellow-50", icon: Clock }
    } else {
      return { status: "normal", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle }
    }
  }

  const getDeadlineTypeIcon = (type: string) => {
    switch (type) {
      case "application":
        return <BookOpen className="h-4 w-4" />
      case "exam":
        return <GraduationCap className="h-4 w-4" />
      case "counseling":
        return <Calendar className="h-4 w-4" />
      case "scholarship":
        return <Bell className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getDeadlineTypeColor = (type: string) => {
    switch (type) {
      case "application":
        return "bg-blue-100 text-blue-800"
      case "exam":
        return "bg-purple-100 text-purple-800"
      case "counseling":
        return "bg-green-100 text-green-800"
      case "scholarship":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilDeadline = (deadlineDate: string) => {
    const today = new Date()
    const deadline = new Date(deadlineDate)
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const deadlineTypes = ["application", "exam", "counseling", "scholarship"]
  const streams = ["arts", "science", "commerce", "engineering", "medical"]
  const classLevels = ["10", "12", "undergraduate", "postgraduate"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">EduNiti</span>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Timeline Tracker
          </h1>
          <p className="text-gray-600">
            Never miss important deadlines for admissions, exams, and scholarships.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search deadlines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                {deadlineTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Streams</option>
                {streams.map(stream => (
                  <option key={stream} value={stream}>
                    {stream.charAt(0).toUpperCase() + stream.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={selectedClassLevel}
                onChange={(e) => setSelectedClassLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Levels</option>
                {classLevels.map(level => (
                  <option key={level} value={level}>
                    {level === "10" ? "Class 10" : 
                     level === "12" ? "Class 12" : 
                     level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-6">
          {filteredItems.map((item) => {
            const status = getDeadlineStatus(item.deadline_date)
            const daysUntil = getDaysUntilDeadline(item.deadline_date)
            const StatusIcon = status.icon

            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${status.bgColor}`}>
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeadlineTypeColor(item.deadline_type)}`}>
                              {getDeadlineTypeIcon(item.deadline_type)}
                              <span className="ml-1">{item.deadline_type.charAt(0).toUpperCase() + item.deadline_type.slice(1)}</span>
                            </span>
                            {item.stream && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {item.stream.charAt(0).toUpperCase() + item.stream.slice(1)}
                              </span>
                            )}
                            {item.class_level && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {item.class_level === "10" ? "Class 10" : 
                                 item.class_level === "12" ? "Class 12" : 
                                 item.class_level.charAt(0).toUpperCase() + item.class_level.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{item.description}</p>

                      {item.college && (
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{item.college.name}, {item.college.location.city}, {item.college.location.state}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-gray-600">Deadline: {formatDate(item.deadline_date)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            <span className={`font-medium ${
                              daysUntil < 0 ? "text-red-600" :
                              daysUntil <= 7 ? "text-orange-600" :
                              daysUntil <= 30 ? "text-yellow-600" :
                              "text-green-600"
                            }`}>
                              {daysUntil < 0 ? `Expired ${Math.abs(daysUntil)} days ago` :
                               daysUntil === 0 ? "Due today" :
                               daysUntil === 1 ? "Due tomorrow" :
                               `${daysUntil} days left`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Bell className="h-4 w-4 mr-1" />
                            Set Reminder
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deadlines found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredItems.filter(item => getDaysUntilDeadline(item.deadline_date) < 0).length}
              </p>
              <p className="text-sm text-gray-600">Expired</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredItems.filter(item => {
                  const days = getDaysUntilDeadline(item.deadline_date)
                  return days >= 0 && days <= 7
                }).length}
              </p>
              <p className="text-sm text-gray-600">Urgent (≤7 days)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredItems.filter(item => {
                  const days = getDaysUntilDeadline(item.deadline_date)
                  return days > 7 && days <= 30
                }).length}
              </p>
              <p className="text-sm text-gray-600">Upcoming (≤30 days)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredItems.filter(item => getDaysUntilDeadline(item.deadline_date) > 30).length}
              </p>
              <p className="text-sm text-gray-600">Future (&gt;30 days)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
