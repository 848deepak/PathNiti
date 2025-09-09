"use client"

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { 
  Brain, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users, 
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Smartphone,
  Globe
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
      description: "Access EduNiti on the go with our native mobile application"
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
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">EduNiti</span>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600"> Career Journey</span>
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
            Why Choose EduNiti?
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
        <div className="bg-gradient-to-r from-primary to-green-600 rounded-lg p-8 text-white mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Trusted by Students Across India
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-90">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Government Colleges</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-lg opacity-90">Support Available</div>
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
                content: "EduNiti helped me discover my passion for computer science. The aptitude test was incredibly accurate!",
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
                content: "I wouldn't have known about the scholarship opportunities without EduNiti. It changed my life!",
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
            Join thousands of students who have already discovered their path with EduNiti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">
                Watch Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
