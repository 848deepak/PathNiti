"use client"

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { 
  Brain, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users, 
  GraduationCap,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  Sparkles,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: "Aptitude Assessment",
      description: "Comprehensive quiz to identify your strengths, interests, and suitable career paths",
      benefits: [
        "AI-powered analysis",
        "Detailed personality insights",
        "Career compatibility scoring",
        "Personalized recommendations"
      ]
    },
    {
      icon: MapPin,
      title: "Government Colleges Directory",
      description: "Discover nearby government colleges with detailed information about programs and admissions",
      benefits: [
        "Location-based search",
        "Real-time admission data",
        "Cut-off marks tracking",
        "Facility information"
      ]
    },
    {
      icon: Calendar,
      title: "Timeline Tracker",
      description: "Never miss important deadlines for admissions, scholarships, and entrance exams",
      benefits: [
        "Smart notifications",
        "Deadline reminders",
        "Progress tracking",
        "Calendar integration"
      ]
    },
    {
      icon: Users,
      title: "Career Pathways",
      description: "Visualize your career journey from education to employment with detailed roadmaps",
      benefits: [
        "Interactive flowcharts",
        "Job market insights",
        "Salary expectations",
        "Growth opportunities"
      ]
    },
    {
      icon: BookOpen,
      title: "Scholarships",
      description: "Find and apply for government scholarships and financial aid opportunities",
      benefits: [
        "Eligibility matching",
        "Application tracking",
        "Deadline alerts",
        "Document requirements"
      ]
    },
    {
      icon: GraduationCap,
      title: "AI Recommendations",
      description: "Get personalized recommendations based on your profile and preferences",
      benefits: [
        "Machine learning algorithms",
        "Continuous improvement",
        "Multi-factor analysis",
        "Success prediction"
      ]
    }
  ]

  const additionalFeatures = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy controls"
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "Access PathNiti on the go with our native mobile application"
    },
    {
      icon: Globe,
      title: "Offline Support",
      description: "Works even in areas with limited internet connectivity"
    },
    {
      icon: TrendingUp,
      title: "Real-time Updates",
      description: "Get instant notifications about new opportunities and deadlines"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Link href="/" className="text-gray-600 hover:text-primary transition-all duration-200 hover:scale-105">
              Home
            </Link>
            <Link href="/features" className="text-primary font-semibold transition-all duration-200 hover:scale-105">
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
            <Button variant="outline" className="hover:scale-105 transition-all duration-200 border-2 hover:border-primary hover:bg-primary/5" asChild>
              <Link href="/dashboard">Demo Login</Link>
            </Button>
            <Button className="relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-primary transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl group" asChild>
              <Link href="/dashboard" className="flex items-center gap-2 relative z-10">
                <span className="font-semibold">Get Started</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600"> Career Journey</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to make informed decisions about your education and career path, 
            all in one comprehensive platform.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose PathNiti?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="relative rounded-lg mb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-300 via-green-500 to-green-700" />
          <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-white/70 to-transparent" />
          <div className="relative p-8 z-10 text-white">
            <h2 className="text-3xl font-bold text-center mb-8 drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
              Trusted by Students Across India
            </h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2 drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">10,000+</div>
                <div className="text-lg opacity-90">Active Students</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2 drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">500+</div>
                <div className="text-lg opacity-90">Government Colleges</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2 drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">95%</div>
                <div className="text-lg opacity-90">Success Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2 drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">24/7</div>
                <div className="text-lg opacity-90">Support Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            What Students Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Class 12 Student, Delhi",
                content: "PathNiti helped me discover my passion for computer science. The aptitude test was incredibly accurate!",
                rating: 5
              },
              {
                name: "Rahul Kumar",
                role: "Engineering Student, Mumbai",
                content: "The college directory saved me so much time. I found the perfect government college near my home.",
                rating: 5
              },
              {
                name: "Anita Singh",
                role: "Scholarship Recipient, Bangalore",
                content: "I wouldn't have known about the scholarship opportunities without PathNiti. It changed my life!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who have already discovered their path with PathNiti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>
      </div>

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
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/quiz" className="hover:text-primary transition-colors">Aptitude Assessment</Link></li>
                <li><Link href="/colleges" className="hover:text-primary transition-colors">College Directory</Link></li>
                <li><Link href="/timeline" className="hover:text-primary transition-colors">Timeline Tracker</Link></li>
                <li><Link href="/scholarships" className="hover:text-primary transition-colors">Scholarships</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/demo" className="hover:text-primary transition-colors">Demo</Link></li>
                <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
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
