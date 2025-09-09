"use client"

import { useState, useEffect } from "react"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui"
// import { supabase } from "@/lib" // Removed unused import
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Search,
  ArrowLeft,
  ExternalLink,
  Clock,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

interface Scholarship {
  id: string
  name: string
  description: string
  provider: string
  amount: {
    min: number
    max: number
    currency: string
  }
  eligibility: {
    class_level: string[]
    stream: string[]
    income_limit?: number
    other_criteria: string[]
  }
  application_deadline: string
  application_process: string
  documents_required: string[]
  website?: string
  contact_info?: Record<string, unknown>
}

export default function ScholarshipsPage() {
  // const { user } = useAuth() // Removed unused variable
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassLevel, setSelectedClassLevel] = useState("")
  const [selectedStream, setSelectedStream] = useState("")

  const filterScholarships = () => {
    let filtered = scholarships

    if (searchTerm) {
      filtered = filtered.filter(scholarship =>
        scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedClassLevel) {
      filtered = filtered.filter(scholarship =>
        scholarship.eligibility.class_level.includes(selectedClassLevel)
      )
    }

    if (selectedStream) {
      filtered = filtered.filter(scholarship =>
        scholarship.eligibility.stream.includes(selectedStream)
      )
    }

    setFilteredScholarships(filtered)
  }

  useEffect(() => {
    fetchScholarships()
  }, [])

  useEffect(() => {
    filterScholarships()
  }, [scholarships, searchTerm, selectedClassLevel, selectedStream, filterScholarships])

  const fetchScholarships = async () => {
    try {
      // For demo purposes, we'll use sample data
      // In production, this would fetch from the database
      const sampleScholarships: Scholarship[] = [
        {
          id: "1",
          name: "National Scholarship Portal (NSP)",
          description: "Central government scholarship for students from economically weaker sections",
          provider: "Government of India",
          amount: {
            min: 10000,
            max: 50000,
            currency: "INR"
          },
          eligibility: {
            class_level: ["10", "12", "undergraduate", "postgraduate"],
            stream: ["arts", "science", "commerce", "engineering", "medical"],
            income_limit: 250000,
            other_criteria: ["Family income below 2.5 LPA", "Minimum 50% marks"]
          },
          application_deadline: "2024-12-31",
          application_process: "Apply online through NSP portal with required documents",
          documents_required: ["Income certificate", "Marksheet", "Bank account details", "Aadhaar card"],
          website: "https://scholarships.gov.in"
        },
        {
          id: "2",
          name: "Merit Cum Means Scholarship",
          description: "Scholarship for meritorious students from minority communities",
          provider: "Ministry of Minority Affairs",
          amount: {
            min: 5000,
            max: 25000,
            currency: "INR"
          },
          eligibility: {
            class_level: ["undergraduate", "postgraduate"],
            stream: ["arts", "science", "commerce", "engineering", "medical"],
            income_limit: 2000000,
            other_criteria: ["Belong to minority community", "Minimum 50% marks", "Not availing any other scholarship"]
          },
          application_deadline: "2024-11-30",
          application_process: "Apply through NSP portal with community certificate",
          documents_required: ["Community certificate", "Income certificate", "Marksheet", "Bank account details"],
          website: "https://scholarships.gov.in"
        },
        {
          id: "3",
          name: "Post Matric Scholarship for SC/ST",
          description: "Scholarship for Scheduled Caste and Scheduled Tribe students",
          provider: "Ministry of Social Justice and Empowerment",
          amount: {
            min: 15000,
            max: 75000,
            currency: "INR"
          },
          eligibility: {
            class_level: ["10", "12", "undergraduate", "postgraduate"],
            stream: ["arts", "science", "commerce", "engineering", "medical"],
            other_criteria: ["Belong to SC/ST community", "Minimum 50% marks"]
          },
          application_deadline: "2024-10-31",
          application_process: "Apply through state scholarship portal",
          documents_required: ["Caste certificate", "Income certificate", "Marksheet", "Bank account details"],
          website: "https://scholarships.gov.in"
        },
        {
          id: "4",
          name: "Central Sector Scheme of Scholarship",
          description: "Scholarship for students who have passed Class 12 with high marks",
          provider: "Ministry of Education",
          amount: {
            min: 10000,
            max: 20000,
            currency: "INR"
          },
          eligibility: {
            class_level: ["undergraduate"],
            stream: ["arts", "science", "commerce", "engineering", "medical"],
            other_criteria: ["Minimum 80% marks in Class 12", "Family income below 8 LPA"]
          },
          application_deadline: "2024-09-30",
          application_process: "Apply online through NSP portal",
          documents_required: ["Class 12 marksheet", "Income certificate", "Bank account details"],
          website: "https://scholarships.gov.in"
        },
        {
          id: "5",
          name: "Prime Minister's Scholarship Scheme",
          description: "Scholarship for children of armed forces personnel",
          provider: "Ministry of Defence",
          amount: {
            min: 25000,
            max: 30000,
            currency: "INR"
          },
          eligibility: {
            class_level: ["undergraduate", "postgraduate"],
            stream: ["engineering", "medical", "arts", "science", "commerce"],
            other_criteria: ["Child of armed forces personnel", "Minimum 60% marks"]
          },
          application_deadline: "2024-08-31",
          application_process: "Apply through Kendriya Sainik Board",
          documents_required: ["Parent's service certificate", "Marksheet", "Bank account details"],
          website: "https://ksb.gov.in"
        }
      ]

      setScholarships(sampleScholarships)
    } catch (error) {
      console.error("Error fetching scholarships:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: { min: number; max: number; currency: string }) => {
    return `₹${amount.min.toLocaleString()} - ₹${amount.max.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isDeadlinePassed = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    return deadlineDate < today
  }

  const classLevels = ["10", "12", "undergraduate", "postgraduate"]
  const streams = ["arts", "science", "commerce", "engineering", "medical", "vocational"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading scholarships...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
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
            Scholarships & Financial Aid
          </h1>
          <p className="text-gray-600">
            Discover government scholarships and financial aid opportunities to support your education.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search scholarships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <select
                value={selectedClassLevel}
                onChange={(e) => setSelectedClassLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Class Levels</option>
                {classLevels.map(level => (
                  <option key={level} value={level}>
                    {level === "10" ? "Class 10" : 
                     level === "12" ? "Class 12" : 
                     level.charAt(0).toUpperCase() + level.slice(1)}
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
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredScholarships.length} of {scholarships.length} scholarships
          </p>
        </div>

        {/* Scholarships Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{scholarship.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {scholarship.provider}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    {isDeadlinePassed(scholarship.application_deadline) ? (
                      <div className="flex items-center text-red-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs">Expired</span>
                      </div>
                    ) : isDeadlineNear(scholarship.application_deadline) ? (
                      <div className="flex items-center text-orange-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs">Ending Soon</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {scholarship.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-600">
                      {formatAmount(scholarship.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Deadline: {formatDate(scholarship.application_deadline)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Eligible for:</p>
                  <div className="flex flex-wrap gap-1">
                    {scholarship.eligibility.class_level.slice(0, 3).map((level, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {level === "10" ? "Class 10" : 
                         level === "12" ? "Class 12" : 
                         level.charAt(0).toUpperCase() + level.slice(1)}
                      </span>
                    ))}
                    {scholarship.eligibility.class_level.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{scholarship.eligibility.class_level.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {scholarship.eligibility.income_limit && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Income Limit:</span> ₹{scholarship.eligibility.income_limit.toLocaleString()}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  {scholarship.website && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={scholarship.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Apply
                      </a>
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/scholarships/${scholarship.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
