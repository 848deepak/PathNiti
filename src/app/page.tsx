import { Button } from "@/components/ui"
import { GraduationCap, MapPin, Brain, Calendar, Users, BookOpen, ArrowRight, Star, CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <GraduationCap className="h-8 w-8 text-primary" />
              <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">PathNiti</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-600 hover:text-primary transition-all duration-200 hover:scale-105">
              Features
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary transition-all duration-200 hover:scale-105">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary transition-all duration-200 hover:scale-105">
              Contact
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="hover:scale-105 transition-transform duration-200" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300 hover:scale-105 shadow-lg" asChild>
              <Link href="/auth/signup" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative overflow-hidden bg-white">
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
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300 hover:scale-105 shadow-xl" asChild>
              <Link href="/auth/signup" className="flex items-center gap-3">
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 hover:bg-gray-50 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/demo" className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Career Journey
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From aptitude assessment to college selection, we guide you through every step with AI-powered insights and government-verified data
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Aptitude Assessment</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Comprehensive quiz to identify your strengths, interests, and suitable career paths with detailed analysis
              </p>
              <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>Learn more</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
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
            </div>

            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
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
            </div>

            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
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
            </div>

            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
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
            </div>

            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-red-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
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
              <Button size="lg" className="text-lg px-12 py-6 bg-white text-primary hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl" asChild>
                <Link href="/auth/signup" className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-12 py-6 border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105" asChild>
                <Link href="/demo" className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5" />
                  Watch Demo
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
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">PathNiti</span>
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
                &copy; 2024 PathNiti. All rights reserved. Made with ❤️ for Indian students.
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
