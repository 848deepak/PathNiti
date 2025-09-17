"use client"

import { Button } from "@/components/ui"
import { GraduationCap, MapPin, Brain, Calendar, Users, BookOpen, ArrowRight, Star, CheckCircle, Sparkles, User, LogOut, Navigation } from "lucide-react"
import Link from "next/link"
import { useAuth } from "./providers"
import { useState, useEffect } from "react"

export default function Home() {
  const { user, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white p-2 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-primary" />
                <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-blue-800 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              PathNiti
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-600 hover:text-primary transition-all duration-200 hover:scale-105">
              Features
            </Link>
            <Link href="/career-pathways" className="text-gray-600 hover:text-primary transition-all duration-200 hover:scale-105">
              Career Paths
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary transition-all duration-200 hover:scale-105">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary transition-all duration-200 hover:scale-105">
              Contact
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <Button variant="outline" className="hover:scale-105 transition-all duration-200 border-2 hover:border-primary hover:bg-primary/5" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="hover:scale-105 transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="hover:scale-105 transition-all duration-200 border-2 hover:border-primary hover:bg-primary/5" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button className="relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-primary transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl group" asChild>
                  <Link href="/auth/signup" className="flex items-center gap-2 relative z-10">
                    <span className="font-semibold">Get Started</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative overflow-hidden bg-white animate-fade-in">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-lg">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ students across India</span>
          </div>
          
          {user ? (
            <>
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Welcome back!{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-purple-600">
                  Ready to explore?
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Continue your career journey with PathNiti. Access your personalized dashboard, 
                explore colleges, track deadlines, and discover new opportunities.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Your Path. Your Future.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-purple-600">
                  Simplified.
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                One-Stop Personalized Career & Education Advisor for Indian Students. 
                Discover your potential, explore government colleges, and make informed decisions about your future.
              </p>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {user ? (
              <>
                <Button size="xl" className="relative overflow-hidden text-lg px-12 py-8 bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-primary transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-3xl animate-slide-in-left group" asChild>
                  <Link href="/dashboard" className="flex items-center gap-3 relative z-10">
                    <span className="font-bold text-lg">Go to Dashboard</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="text-lg px-12 py-8 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 animate-slide-in-right" asChild>
                  <Link href="/quiz" className="flex items-center gap-3">
                    <span className="font-bold">Take Assessment</span>
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="xl" className="relative overflow-hidden text-lg px-12 py-8 bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-primary transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-3xl animate-slide-in-left group" asChild>
                  <Link href="/auth/signup" className="flex items-center gap-3 relative z-10">
                    <span className="font-bold text-lg">Start Your Journey</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="text-lg px-12 py-8 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105 animate-slide-in-right" asChild>
                  <Link href="/features" className="flex items-center gap-3">
                    <span className="font-bold">Explore Features</span>
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Government verified data</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>AI-powered recommendations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Comprehensive Platform</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600">
                Career Journey
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From aptitude assessment to college selection, we guide you through every step with AI-powered insights and government-verified data
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/quiz" className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Aptitude Assessment</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Comprehensive quiz to identify your strengths, interests, and suitable career paths with detailed analysis
              </p>
              <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>Start Assessment</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>

            <Link href="/colleges" className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in cursor-pointer" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Government Colleges</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Discover nearby government colleges with detailed information about programs, admissions, and facilities
              </p>
              <div className="flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>Explore colleges</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>

            <Link href="/colleges?tab=nearby" className="group p-8 rounded-2xl bg-white border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in cursor-pointer" style={{animationDelay: '0.15s'}}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Navigation className="h-8 w-8 text-green-600" />
                </div>
                <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                  NEW FEATURE
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-green-900">Find Nearby Colleges</h3>
              <p className="text-green-700 leading-relaxed mb-6">
                Use Google Maps to find colleges near your location with real-time data, ratings, and interactive maps
              </p>
              <div className="flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>Find nearby colleges</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>

            <Link href="/timeline" className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in cursor-pointer" style={{animationDelay: '0.25s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Timeline Tracker</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Never miss important deadlines for admissions, scholarships, and entrance exams with smart reminders
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>Track deadlines</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>

            <Link href="/career-pathways" className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in cursor-pointer" style={{animationDelay: '0.3s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Career Pathways</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Explore detailed career paths with education requirements, skills needed, and growth opportunities
              </p>
              <div className="flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>Explore careers</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>

            <Link href="/features" className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in cursor-pointer" style={{animationDelay: '0.35s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Career Pathways</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Visualize your career journey from education to employment with detailed roadmaps and success stories
              </p>
              <div className="flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>View pathways</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>

            <Link href="/scholarships" className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in cursor-pointer" style={{animationDelay: '0.4s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Scholarships</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Find and apply for government scholarships and financial aid opportunities with eligibility matching
              </p>
              <div className="flex items-center text-orange-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>Find scholarships</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>

            <Link href="/dashboard" className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-red-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in cursor-pointer" style={{animationDelay: '0.5s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">AI Recommendations</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Get personalized recommendations based on your profile, preferences, and market trends
              </p>
              <div className="flex items-center text-red-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>Get recommendations</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Google Maps Feature Highlight */}
      <section className="py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-6">
                <Navigation className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">New Feature</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Find Colleges Near You with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  Google Maps
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover nearby government colleges using real-time Google Maps data. Get detailed information about programs, ratings, and facilities all in one place.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Location-Based Search</h3>
                    <p className="text-gray-600">Use your current location or enter any address to find colleges within your preferred radius.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Data</h3>
                    <p className="text-gray-600">Get up-to-date information including ratings, reviews, photos, and contact details from Google Places.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Navigation className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Maps</h3>
                    <p className="text-gray-600">Explore colleges on an interactive map with custom markers and detailed info windows.</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4" asChild>
                    <Link href="/colleges?tab=nearby" className="flex items-center gap-3">
                      <Navigation className="h-5 w-5" />
                      <span className="font-bold">Try Nearby Search</span>
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-200">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <h4 className="font-bold text-gray-900">Nearby Colleges Found</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Delhi University</p>
                          <p className="text-sm text-gray-600">2.1 km away • ⭐ 4.2 (1,200 reviews)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Jawaharlal Nehru University</p>
                          <p className="text-sm text-gray-600">3.5 km away • ⭐ 4.5 (890 reviews)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Indian Institute of Technology</p>
                          <p className="text-sm text-gray-600">4.2 km away • ⭐ 4.8 (2,100 reviews)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 text-center">Powered by Google Maps Places API</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-blue-600 to-purple-700 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Star className="h-4 w-4 text-yellow-300 fill-current" />
              <span className="text-sm font-medium">Join 10,000+ successful students</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Ready to Shape Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Future?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
            Join thousands of students who have already discovered their path with PathNiti. 
            Start your journey today and unlock your potential.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="relative overflow-hidden text-lg px-16 py-10 bg-white text-blue-800 hover:bg-gray-50 transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-3xl group border-2 border-white/20" asChild>
                <Link href="/dashboard" className="flex items-center gap-4 relative z-10">
                  <Sparkles className="h-7 w-7 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-bold text-xl text-blue-800">Get Started Free</span>
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-2">10,000+</div>
                <div className="text-white/80">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-2">500+</div>
                <div className="text-white/80">Government Colleges</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-2">95%</div>
                <div className="text-white/80">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">PathNiti</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Empowering students with personalized career guidance and education resources. 
                Your future starts here.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Product</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/features" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Demo</Link></li>
                <li><Link href="/quiz" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Aptitude Test</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/help" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">FAQ</Link></li>
                <li><Link href="/community" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/about" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">About</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2025 PathNiti. All rights reserved. Made with ❤️ for Indian students.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
