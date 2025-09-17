"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from "@/components/ui"
import { 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  MapPin, 
  Search,
  ArrowRight,
  BookOpen,
  Users,
  DollarSign,
  Clock,
  Star
} from "lucide-react"
import Link from "next/link"

interface CareerPathway {
  id: string
  title: string
  description: string
  stream: string
  education_requirements: string[]
  skills_required: string[]
  job_opportunities: string[]
  salary_range: {
    min: number
    max: number
    currency: string
  }
  growth_prospects: string
  related_exams: string[]
  duration: string
  difficulty: string
}

interface PathwayNode {
  id: string
  type: 'education' | 'exam' | 'job' | 'skill'
  title: string
  description: string
  level: number
  prerequisites: string[]
  outcomes: string[]
}

export default function CareerPathwaysPage() {
  const [pathways, setPathways] = useState<CareerPathway[]>([])
  const [selectedPathway, setSelectedPathway] = useState<CareerPathway | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStream, setSelectedStream] = useState("")
  const [loading, setLoading] = useState(true)

  const streams = ['science', 'arts', 'commerce', 'engineering', 'medical', 'vocational']

  useEffect(() => {
    fetchCareerPathways()
  }, [])

  const fetchCareerPathways = async () => {
    try {
      // Sample career pathways data
      const samplePathways: CareerPathway[] = [
        {
          id: '1',
          title: 'Software Engineer',
          description: 'Design, develop, and maintain software applications and systems',
          stream: 'engineering',
          education_requirements: ['B.Tech Computer Science', 'M.Tech (Optional)', 'Certifications'],
          skills_required: ['Programming', 'Problem Solving', 'Mathematics', 'Communication'],
          job_opportunities: ['Software Developer', 'System Analyst', 'Tech Lead', 'CTO'],
          salary_range: { min: 500000, max: 2000000, currency: 'INR' },
          growth_prospects: 'High',
          related_exams: ['JEE Main', 'JEE Advanced', 'GATE'],
          duration: '4-6 years',
          difficulty: 'Medium'
        },
        {
          id: '2',
          title: 'Doctor',
          description: 'Diagnose and treat medical conditions, provide healthcare services',
          stream: 'medical',
          education_requirements: ['MBBS', 'MD/MS (Specialization)', 'Residency'],
          skills_required: ['Biology', 'Chemistry', 'Empathy', 'Communication', 'Problem Solving'],
          job_opportunities: ['General Practitioner', 'Specialist', 'Surgeon', 'Medical Researcher'],
          salary_range: { min: 800000, max: 3000000, currency: 'INR' },
          growth_prospects: 'High',
          related_exams: ['NEET', 'AIIMS', 'JIPMER'],
          duration: '7-10 years',
          difficulty: 'High'
        },
        {
          id: '3',
          title: 'Teacher',
          description: 'Educate students and help them develop knowledge and skills',
          stream: 'arts',
          education_requirements: ['B.Ed', 'M.A. in Subject', 'Teaching Certification'],
          skills_required: ['Communication', 'Patience', 'Subject Knowledge', 'Leadership'],
          job_opportunities: ['School Teacher', 'College Professor', 'Educational Consultant', 'Curriculum Developer'],
          salary_range: { min: 300000, max: 800000, currency: 'INR' },
          growth_prospects: 'Medium',
          related_exams: ['CTET', 'TET', 'NET'],
          duration: '3-5 years',
          difficulty: 'Medium'
        },
        {
          id: '4',
          title: 'Chartered Accountant',
          description: 'Provide financial advice, audit accounts, and ensure compliance',
          stream: 'commerce',
          education_requirements: ['B.Com', 'CA Foundation', 'CA Intermediate', 'CA Final'],
          skills_required: ['Mathematics', 'Analytical Skills', 'Attention to Detail', 'Ethics'],
          job_opportunities: ['CA in Practice', 'Financial Analyst', 'Auditor', 'Tax Consultant'],
          salary_range: { min: 600000, max: 1500000, currency: 'INR' },
          growth_prospects: 'High',
          related_exams: ['CA Foundation', 'CA Intermediate', 'CA Final'],
          duration: '4-5 years',
          difficulty: 'High'
        },
        {
          id: '5',
          title: 'Data Scientist',
          description: 'Analyze complex data to help organizations make informed decisions',
          stream: 'science',
          education_requirements: ['B.Sc/M.Sc Statistics/Mathematics', 'M.Tech Data Science', 'Certifications'],
          skills_required: ['Statistics', 'Programming', 'Machine Learning', 'Business Acumen'],
          job_opportunities: ['Data Analyst', 'Data Scientist', 'ML Engineer', 'Data Architect'],
          salary_range: { min: 700000, max: 2500000, currency: 'INR' },
          growth_prospects: 'Very High',
          related_exams: ['JEE Main', 'GATE', 'GRE'],
          duration: '4-6 years',
          difficulty: 'High'
        },
        {
          id: '6',
          title: 'Journalist',
          description: 'Research, write, and report news stories for various media outlets',
          stream: 'arts',
          education_requirements: ['B.A. Journalism', 'M.A. Mass Communication', 'Internships'],
          skills_required: ['Writing', 'Communication', 'Research', 'Critical Thinking'],
          job_opportunities: ['Reporter', 'Editor', 'News Anchor', 'Content Writer'],
          salary_range: { min: 250000, max: 800000, currency: 'INR' },
          growth_prospects: 'Medium',
          related_exams: ['CUET', 'University Entrance Exams'],
          duration: '3-4 years',
          difficulty: 'Medium'
        }
      ]

      setPathways(samplePathways)
    } catch (error) {
      console.error('Error fetching career pathways:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPathways = pathways.filter(pathway => {
    const matchesSearch = pathway.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pathway.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStream = !selectedStream || pathway.stream === selectedStream
    return matchesSearch && matchesStream
  })

  const getStreamColor = (stream: string) => {
    const colors = {
      science: 'bg-blue-100 text-blue-800',
      arts: 'bg-purple-100 text-purple-800',
      commerce: 'bg-green-100 text-green-800',
      engineering: 'bg-orange-100 text-orange-800',
      medical: 'bg-red-100 text-red-800',
      vocational: 'bg-gray-100 text-gray-800'
    }
    return colors[stream as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-red-100 text-red-800'
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getGrowthColor = (growth: string) => {
    const colors = {
      'Very High': 'bg-green-100 text-green-800',
      'High': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800'
    }
    return colors[growth as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading career pathways...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Career Pathways
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore detailed career paths, education requirements, and growth opportunities 
              to make informed decisions about your future.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search career pathways..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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

        {/* Career Pathways Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPathways.map((pathway) => (
            <Card 
              key={pathway.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPathway(pathway)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{pathway.title}</CardTitle>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStreamColor(pathway.stream)}`}>
                    {pathway.stream}
                  </span>
                </div>
                <CardDescription className="text-sm">
                  {pathway.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{pathway.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>₹{pathway.salary_range.min/100000}L-{pathway.salary_range.max/100000}L</span>
                  </div>
                </div>

                {/* Difficulty and Growth */}
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(pathway.difficulty)}`}>
                    {pathway.difficulty} Difficulty
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(pathway.growth_prospects)}`}>
                    {pathway.growth_prospects} Growth
                  </span>
                </div>

                {/* Skills Preview */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Key Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {pathway.skills_required.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {pathway.skills_required.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{pathway.skills_required.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPathways.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No career pathways found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Pathway Detail Modal */}
      {selectedPathway && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedPathway.title}
                  </h2>
                  <p className="text-gray-600">{selectedPathway.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPathway(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Education Path */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Education Path</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPathway.education_requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Required */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Skills Required</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedPathway.skills_required.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Job Opportunities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Job Opportunities</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedPathway.job_opportunities.map((job, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{job}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Key Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">{selectedPathway.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Difficulty:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedPathway.difficulty)}`}>
                        {selectedPathway.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth Prospects:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(selectedPathway.growth_prospects)}`}>
                        {selectedPathway.growth_prospects}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Salary Range:</span>
                      <span className="text-sm font-medium">
                        ₹{selectedPathway.salary_range.min/100000}L - ₹{selectedPathway.salary_range.max/100000}L
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Related Exams */}
              {selectedPathway.related_exams.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Related Entrance Exams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedPathway.related_exams.map((exam, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {exam}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Button asChild>
                  <Link href="/quiz">Take Aptitude Test</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/colleges">Find Colleges</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/scholarships">View Scholarships</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

