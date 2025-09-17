"use client"

import { useState, useEffect, useCallback } from "react"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui"
import NearbyColleges from "@/components/NearbyColleges"
// import { supabase } from "@/lib" // Removed unused import
import { 
  GraduationCap, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Search,
  ArrowLeft,
  Heart,
  ExternalLink,
  Navigation
} from "lucide-react"
import Link from "next/link"

interface College {
  id: string
  name: string
  type: string
  location: {
    state: string
    city: string
    district: string
    pincode: string
  }
  address: string
  website?: string
  phone?: string
  email?: string
  established_year?: number
  accreditation?: string[]
  facilities?: Record<string, unknown>
  programs?: Record<string, unknown>
  is_verified: boolean
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [filteredColleges, setFilteredColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [activeTab, setActiveTab] = useState<'directory' | 'nearby'>('directory')

  // Check URL params for tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get('tab')
      if (tab === 'nearby') {
        setActiveTab('nearby')
      }
    }
  }, [])

  const fetchColleges = async () => {
    try {
      // TODO: Implement real database fetch
      // For now, using sample data until database is populated
      const sampleColleges: College[] = [
        {
          id: "1",
          name: "Delhi University",
          type: "government",
          location: {
            state: "Delhi",
            city: "New Delhi",
            district: "North Delhi",
            pincode: "110007"
          },
          address: "University of Delhi, Delhi, 110007",
          website: "https://du.ac.in",
          phone: "+91-11-27667011",
          email: "info@du.ac.in",
          established_year: 1922,
          accreditation: ["NAAC A++", "UGC"],
          facilities: {
            hostel: true,
            library: true,
            sports: true,
            labs: true
          },
          programs: { available: ["Arts", "Science", "Commerce", "Engineering"] },
          is_verified: true
        },
        {
          id: "2",
          name: "Jawaharlal Nehru University",
          type: "government",
          location: {
            state: "Delhi",
            city: "New Delhi",
            district: "South Delhi",
            pincode: "110067"
          },
          address: "JNU, New Delhi, 110067",
          website: "https://jnu.ac.in",
          phone: "+91-11-26704000",
          email: "info@jnu.ac.in",
          established_year: 1969,
          accreditation: ["NAAC A++", "UGC"],
          facilities: {
            hostel: true,
            library: true,
            sports: true,
            labs: true
          },
          programs: { available: ["Arts", "Science", "Social Sciences", "Languages"] },
          is_verified: true
        },
        {
          id: "3",
          name: "University of Mumbai",
          type: "government",
          location: {
            state: "Maharashtra",
            city: "Mumbai",
            district: "Mumbai",
            pincode: "400001"
          },
          address: "University of Mumbai, Mumbai, 400001",
          website: "https://mu.ac.in",
          phone: "+91-22-26526000",
          email: "info@mu.ac.in",
          established_year: 1857,
          accreditation: ["NAAC A++", "UGC"],
          facilities: {
            hostel: true,
            library: true,
            sports: true,
            labs: true
          },
          programs: { available: ["Arts", "Science", "Commerce", "Engineering", "Medicine"] },
          is_verified: true
        },
        {
          id: "4",
          name: "University of Calcutta",
          type: "government",
          location: {
            state: "West Bengal",
            city: "Kolkata",
            district: "Kolkata",
            pincode: "700073"
          },
          address: "University of Calcutta, Kolkata, 700073",
          website: "https://caluniv.ac.in",
          phone: "+91-33-22410071",
          email: "info@caluniv.ac.in",
          established_year: 1857,
          accreditation: ["NAAC A++", "UGC"],
          facilities: {
            hostel: true,
            library: true,
            sports: true,
            labs: true
          },
          programs: { available: ["Arts", "Science", "Commerce", "Engineering"] },
          is_verified: true
        },
        {
          id: "5",
          name: "Anna University",
          type: "government",
          location: {
            state: "Tamil Nadu",
            city: "Chennai",
            district: "Chennai",
            pincode: "600025"
          },
          address: "Anna University, Chennai, 600025",
          website: "https://annauniv.edu",
          phone: "+91-44-22350000",
          email: "info@annauniv.edu",
          established_year: 1978,
          accreditation: ["NAAC A++", "UGC", "NBA"],
          facilities: {
            hostel: true,
            library: true,
            sports: true,
            labs: true
          },
          programs: { available: ["Engineering", "Technology", "Architecture"] },
          is_verified: true
        }
      ]

      setColleges(sampleColleges)
    } catch (error) {
      console.error("Error fetching colleges:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterColleges = useCallback(() => {
    let filtered = colleges

    if (searchTerm) {
      filtered = filtered.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedState) {
      filtered = filtered.filter(college => college.location.state === selectedState)
    }

    if (selectedType) {
      filtered = filtered.filter(college => college.type === selectedType)
    }

    setFilteredColleges(filtered)
  }, [colleges, searchTerm, selectedState, selectedType])

  useEffect(() => {
    fetchColleges()
  }, [])

  useEffect(() => {
    filterColleges()
  }, [filterColleges])

  const states = Array.from(new Set(colleges.map(college => college.location.state)))
  const types = Array.from(new Set(colleges.map(college => college.type)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading colleges...</p>
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
            <span className="text-2xl font-bold text-primary">PathNiti</span>
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
            Government Colleges Directory
          </h1>
          <p className="text-gray-600">
            Discover government colleges across India with detailed information about programs, facilities, and admissions.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('directory')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'directory'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <GraduationCap className="h-4 w-4 inline mr-2" />
                College Directory
              </button>
              <button
                onClick={() => setActiveTab('nearby')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'nearby'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Navigation className="h-4 w-4 inline mr-2" />
                Find Nearby Colleges
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'directory' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search colleges, cities, or states..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All States</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Types</option>
                    {types.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'nearby' && (
          <NearbyColleges />
        )}

        {/* Directory Results */}
        {activeTab === 'directory' && (
          <>
            {/* Results */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredColleges.length} of {colleges.length} colleges
              </p>
            </div>

            {/* Colleges Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColleges.map((college) => (
                <Card key={college.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{college.name}</CardTitle>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {college.location.city}, {college.location.state}
                        </CardDescription>
                      </div>
                      {college.is_verified && (
                        <div className="flex items-center text-green-600">
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Established:</span>
                        <span className="ml-2">{college.established_year}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Type:</span>
                        <span className="ml-2 capitalize">{college.type.replace('_', ' ')}</span>
                      </div>

                      {college.accreditation && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">Accreditation:</span>
                          <span className="ml-2">{college.accreditation.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {college.programs && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Programs:</p>
                        <div className="flex flex-wrap gap-1">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(college.programs as any)?.available?.slice(0, 3).map((program: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {program}
                            </span>
                          ))}
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(college.programs as any)?.available?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              +{(college.programs as any)?.available?.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-2">
                        {college.website && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={college.website} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {college.phone && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`tel:${college.phone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/colleges/${college.id}`}>
                        View Details
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredColleges.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No colleges found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
