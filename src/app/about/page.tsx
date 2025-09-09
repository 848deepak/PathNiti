"use client"

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { 
  GraduationCap, 
  ArrowLeft,
  Users,
  Target,
  Heart,
  Award,
  Globe,
  Lightbulb
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const team = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Founder & CEO",
      description: "Former IIT professor with 15+ years in education technology",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Priya Sharma",
      role: "CTO",
      description: "Tech lead with expertise in AI and machine learning",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Amit Patel",
      role: "Head of Product",
      description: "Product strategist focused on student experience",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Sneha Reddy",
      role: "Head of Operations",
      description: "Operations expert with deep knowledge of Indian education system",
      image: "/api/placeholder/150/150"
    }
  ]

  const values = [
    {
      icon: Target,
      title: "Student-Centric",
      description: "Every decision we make is focused on empowering students to make informed choices about their future."
    },
    {
      icon: Heart,
      title: "Accessibility",
      description: "We believe quality education guidance should be accessible to every student, regardless of their background."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from our technology to our user experience."
    },
    {
      icon: Globe,
      title: "Innovation",
      description: "We leverage cutting-edge technology to solve real-world problems in education and career guidance."
    }
  ]

  const milestones = [
    {
      year: "2024",
      title: "EduNiti Founded",
      description: "Started with a vision to democratize career guidance for Indian students"
    },
    {
      year: "2024",
      title: "First 1000 Students",
      description: "Reached our first milestone of helping 1000 students discover their career paths"
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Launched our AI-powered recommendation engine for personalized guidance"
    },
    {
      year: "2024",
      title: "Government Partnership",
      description: "Partnered with state governments to expand access to quality education guidance"
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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">EduNiti</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re on a mission to empower every Indian student with personalized career guidance, 
            helping them make informed decisions about their education and future.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-lg">
                To democratize access to quality career guidance and education resources, 
                ensuring every student in India has the tools and information they need 
                to make informed decisions about their future.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-lg">
                To become India&apos;s most trusted platform for career guidance, 
                helping millions of students discover their potential and 
                achieve their educational and professional goals.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Our Story
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-600 mb-6">
              EduNiti was born from a simple observation: millions of Indian students struggle 
              to make informed decisions about their education and career paths. With limited 
              access to quality guidance and overwhelming amounts of information, students often 
              make choices that don&apos;t align with their true potential.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our founders, having experienced these challenges firsthand, set out to create 
              a comprehensive platform that would democratize access to career guidance. 
              We believe that every student deserves personalized, data-driven insights 
              to help them discover their strengths and make informed decisions.
            </p>
            <p className="text-lg text-gray-600">
              Today, EduNiti serves thousands of students across India, helping them navigate 
              their educational journey with confidence and clarity.               We&apos;re proud to be part 
              of their success stories and committed to expanding our impact.
            </p>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Our Journey
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-lg">
                      {milestone.year}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact */}
        <div className="bg-gradient-to-r from-primary to-green-600 rounded-lg p-8 text-white mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Our Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-90">Students Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Colleges Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-lg opacity-90">States Covered</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Mission
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Be part of the movement to democratize career guidance in India
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get Started
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
