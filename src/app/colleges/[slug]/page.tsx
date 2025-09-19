"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Calendar, 
  Award, 
  Users, 
  BookOpen, 
  Building2,
  Star,
  ExternalLink,
  GraduationCap,
  Clock,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Info,
  FileText
} from "lucide-react"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui"
import { collegeProfileService } from "@/lib/services/college-profile-service"
import StudentApplicationForm from "@/components/StudentApplicationForm"
import { createClient } from "@/lib/supabase/client"
import type { CollegeProfileData } from "@/lib/types/college-profile"

interface CollegeProfilePageProps {
  params: { slug: string }
}

export default function CollegeProfilePage({ params }: CollegeProfilePageProps) {
  const [college, setCollege] = useState<CollegeProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchCollegeProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error: fetchError } = await collegeProfileService.getProfileBySlug(params.slug)
        
        if (fetchError) {
          setError(fetchError)
          return
        }
        
        if (!data) {
          notFound()
          return
        }
        
        setCollege(data)
      } catch (err) {
        console.error("Error fetching college profile:", err)
        setError("Failed to load college profile")
      } finally {
        setLoading(false)
      }
    }

    const fetchUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Get user profile to check role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (!profileError && profile) {
            setUserRole(profile.role)
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err)
      }
    }

    fetchCollegeProfile()
    fetchUser()
  }, [params.slug, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading college profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild>
            <Link href="/colleges">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Colleges
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!college) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/colleges" className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Colleges</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{college.name}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {college.type.charAt(0).toUpperCase() + college.type.slice(1).replace('_', ' ')}
                  </Badge>
                  {college.is_verified && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}
                  {college.established_year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Est. {college.established_year}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-white/80" />
                <span className="text-lg">{college.location.city}, {college.location.state}</span>
              </div>
              {college.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-white/80" />
                  <span className="text-lg">{college.phone}</span>
                </div>
              )}
              {college.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-white/80" />
                  <span className="text-lg">{college.email}</span>
                </div>
              )}
              {college.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-white/80" />
                  <a 
                    href={college.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg hover:text-yellow-300 transition-colors flex items-center gap-1"
                  >
                    Visit Website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {college.about && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    About {college.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{college.about}</p>
                </CardContent>
              </Card>
            )}

            {/* Courses Section */}
            {college.courses && college.courses.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Courses Offered
                  </CardTitle>
                  <CardDescription>
                    {college.courses.length} course{college.courses.length !== 1 ? 's' : ''} available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {college.courses.map((course) => (
                      <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
                        <h4 className="font-semibold text-gray-900 mb-2">{course.name}</h4>
                        {course.description && (
                          <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          {course.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{course.duration}</span>
                            </div>
                          )}
                          {course.seats && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{course.seats} seats</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notices Section */}
            {college.notices && college.notices.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Latest Notices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {college.notices
                      .filter(notice => notice.is_active)
                      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
                      .slice(0, 5)
                      .map((notice) => (
                        <div key={notice.id} className="p-4 border-l-4 border-primary bg-blue-50/50 rounded-r-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{notice.title}</h4>
                              <p className="text-gray-700 text-sm mb-2">{notice.content}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <Badge variant="outline" className="text-xs">
                                  {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                                </Badge>
                                <span>{new Date(notice.published_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <Badge variant="outline">
                    {college.type.charAt(0).toUpperCase() + college.type.slice(1).replace('_', ' ')}
                  </Badge>
                </div>
                {college.established_year && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Established</span>
                    <span className="font-medium">{college.established_year}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-right">{college.location.city}, {college.location.state}</span>
                </div>
                {college.accreditation && college.accreditation.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-2">Accreditation</span>
                    <div className="flex flex-wrap gap-1">
                      {college.accreditation.map((acc, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {acc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admission Criteria */}
            {college.admission_criteria && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Admission Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {college.admission_criteria.minimum_percentage && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Minimum %</span>
                      <span className="font-medium">{college.admission_criteria.minimum_percentage}%</span>
                    </div>
                  )}
                  {college.admission_criteria.entrance_exam_required && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Entrance Exam</span>
                      <Badge variant="outline" className="text-xs">
                        {college.admission_criteria.entrance_exam_name || 'Required'}
                      </Badge>
                    </div>
                  )}
                  {college.admission_criteria.application_deadline && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Deadline</span>
                      <span className="font-medium text-sm">
                        {new Date(college.admission_criteria.application_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Fee Structure */}
            {college.fee_structure && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    Fee Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {college.fee_structure.tuition_fee && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tuition Fee</span>
                      <span className="font-medium">₹{college.fee_structure.tuition_fee.toLocaleString()}</span>
                    </div>
                  )}
                  {college.fee_structure.hostel_fee && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hostel Fee</span>
                      <span className="font-medium">₹{college.fee_structure.hostel_fee.toLocaleString()}</span>
                    </div>
                  )}
                  {college.fee_structure.total_fee && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-gray-900 font-semibold">Total Fee</span>
                      <span className="font-bold text-primary">₹{college.fee_structure.total_fee.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{college.address}</span>
                  </div>
                </div>
                {college.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${college.phone}`} className="text-sm text-primary hover:underline">
                      {college.phone}
                    </a>
                  </div>
                )}
                {college.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${college.email}`} className="text-sm text-primary hover:underline">
                      {college.email}
                    </a>
                  </div>
                )}
                {college.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a 
                      href={college.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Apply Button */}
            <Card className="bg-gradient-to-br from-primary to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-8 w-8 mx-auto mb-3 text-white/90" />
                <h3 className="font-bold text-lg mb-2">Apply to this college</h3>
                <p className="text-white/90 text-sm mb-4">Submit your application with required documents</p>
                
                {user && userRole === 'student' ? (
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-gray-50 font-semibold"
                    onClick={() => setShowApplicationForm(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                ) : user && userRole !== 'student' ? (
                  <div className="text-center">
                    <p className="text-white/90 text-sm mb-2">Only students can apply to colleges</p>
                    <Button 
                      size="lg" 
                      className="w-full bg-white text-primary hover:bg-gray-50 font-semibold"
                      asChild
                    >
                      <Link href="/dashboard">
                        Go to Dashboard
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white/90 text-sm mb-2">Please log in to apply</p>
                    <Button 
                      size="lg" 
                      className="w-full bg-white text-primary hover:bg-gray-50 font-semibold"
                      asChild
                    >
                      <Link href="/auth/login">
                        Login to Apply
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && college && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <StudentApplicationForm
              collegeId={college.id}
              collegeName={college.name}
              onSuccess={() => {
                setShowApplicationForm(false)
                // You could show a success message here
                alert('Application submitted successfully!')
              }}
              onCancel={() => setShowApplicationForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}