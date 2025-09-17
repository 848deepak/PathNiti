"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui"
import { useAuth } from "../providers"
import { supabase } from "@/lib/supabase"
import { Brain, ArrowLeft, ArrowRight, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

interface QuizQuestion {
  id: string
  question_text: string
  question_type: string
  category: string
  options: string[]
  correct_answer?: number
  time_limit: number
}

export default function QuizPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const completeQuiz = useCallback(async () => {
    try {
      if (!user) {
        console.error("User not authenticated")
        return
      }

      // Calculate scores
      const aptitudeScores: Record<string, number> = {}
      const interestScores: Record<string, number> = {}
      const personalityScores: Record<string, number> = {}
      
      let totalAptitudeScore = 0
      let aptitudeQuestions = 0

      // Process each answer
      for (const [questionId, selectedAnswer] of Object.entries(answers)) {
        const question = questions.find(q => q.id === questionId)
        if (!question) continue

        if (question.question_type === 'aptitude' && question.correct_answer !== undefined) {
          // Check if answer is correct
          const isCorrect = selectedAnswer === question.correct_answer
          aptitudeScores[question.category] = (aptitudeScores[question.category] || 0) + (isCorrect ? 1 : 0)
          totalAptitudeScore += isCorrect ? 1 : 0
          aptitudeQuestions++
        } else if (question.question_type === 'interest') {
          // Interest questions use 1-5 scale (Strongly Disagree to Strongly Agree)
          const score = selectedAnswer + 1 // Convert 0-4 to 1-5
          interestScores[question.category] = (interestScores[question.category] || 0) + score
        } else if (question.question_type === 'personality') {
          // Personality questions also use 1-5 scale
          const score = selectedAnswer + 1
          personalityScores[question.category] = (personalityScores[question.category] || 0) + score
        }
      }

      // Calculate average scores
      const avgAptitudeScore = aptitudeQuestions > 0 ? totalAptitudeScore / aptitudeQuestions : 0
      
      // Create quiz session record
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          total_score: Math.round(avgAptitudeScore * 100),
          aptitude_score: Math.round(avgAptitudeScore * 100),
          interest_scores: interestScores,
          recommendations: {
            aptitude: aptitudeScores,
            interest: interestScores,
            personality: personalityScores,
            overall_score: Math.round(avgAptitudeScore * 100)
          }
        })
        .select()
        .single()

      if (sessionError) {
        console.error("Error saving quiz session:", sessionError)
      }

      // Save individual responses
      const responses = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        user_id: user.id,
        question_id: questionId,
        selected_answer: selectedAnswer,
        time_taken: 60 // Default time - in real implementation, track actual time
      }))

      const { error: responsesError } = await supabase
        .from('quiz_responses')
        .insert(responses)

      if (responsesError) {
        console.error("Error saving quiz responses:", responsesError)
      }

      console.log("Quiz completed successfully!")
      console.log("Scores:", { aptitudeScores, interestScores, personalityScores })
      setQuizCompleted(true)
    } catch (error) {
      console.error("Error completing quiz:", error)
    }
  }, [answers, questions, user])

  const handleNextQuestion = useCallback(() => {
    if (selectedAnswer !== null) {
      const currentQuestion = questions[currentQuestionIndex]
      setAnswers({
        ...answers,
        [currentQuestion.id]: selectedAnswer,
      })
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setTimeLeft(questions[currentQuestionIndex + 1]?.time_limit || 60)
    } else {
      completeQuiz()
    }
  }, [selectedAnswer, questions, currentQuestionIndex, answers, completeQuiz])

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleNextQuestion()
    }
  }, [timeLeft, quizStarted, handleNextQuestion])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching questions:', error)
        // Fallback to sample questions if database fails
        const sampleQuestions: QuizQuestion[] = [
        {
          id: "1",
          question_text: "Which subject do you find most interesting?",
          question_type: "interest",
          category: "general",
          options: ["Mathematics", "Science", "Literature", "History"],
          time_limit: 60,
        },
        {
          id: "2",
          question_text: "What type of work environment do you prefer?",
          question_type: "personality",
          category: "work_style",
          options: ["Team collaboration", "Independent work", "Creative projects", "Analytical tasks"],
          time_limit: 60,
        },
        {
          id: "3",
          question_text: "Which activity would you enjoy most?",
          question_type: "interest",
          category: "activities",
          options: ["Solving puzzles", "Writing stories", "Conducting experiments", "Organizing events"],
          time_limit: 60,
        },
        {
          id: "4",
          question_text: "What motivates you the most?",
          question_type: "personality",
          category: "motivation",
          options: ["Helping others", "Achieving goals", "Learning new things", "Creative expression"],
          time_limit: 60,
        },
        {
          id: "5",
          question_text: "Which career path appeals to you?",
          question_type: "career",
          category: "career_interest",
          options: ["Engineering", "Medicine", "Arts & Design", "Business"],
          time_limit: 60,
        },
      ]

        setQuestions(sampleQuestions)
      } else {
        setQuestions(data || [])
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setTimeLeft(questions[0]?.time_limit || 60)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz questions...</p>
        </div>
      </div>
    )
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Quiz Completed!</CardTitle>
            <CardDescription>
              Your assessment results and personalized recommendations are ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Results Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Aptitude Score</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((Object.values(answers).filter((_, i) => questions[i]?.question_type === 'aptitude').length / questions.filter(q => q.question_type === 'aptitude').length) * 100)}%
                </p>
                <p className="text-sm text-blue-700">Based on knowledge questions</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Interest Areas</h3>
                <p className="text-lg font-bold text-purple-600">
                  {Object.keys(answers).filter((_, i) => questions[i]?.question_type === 'interest').length}
                </p>
                <p className="text-sm text-purple-700">Interest categories assessed</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Personality Traits</h3>
                <p className="text-lg font-bold text-green-600">
                  {Object.keys(answers).filter((_, i) => questions[i]?.question_type === 'personality').length}
                </p>
                <p className="text-sm text-green-700">Personality dimensions analyzed</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Your Personalized Recommendations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Suggested Streams</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Science (High match based on your interests)</li>
                    <li>• Engineering (Strong analytical skills)</li>
                    <li>• Commerce (Good for business-minded individuals)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Career Paths</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Software Engineer</li>
                    <li>• Data Scientist</li>
                    <li>• Business Analyst</li>
                    <li>• Research Scientist</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/dashboard">View Detailed Results</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/colleges">Explore Colleges</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/scholarships">Find Scholarships</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
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
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary mr-3" />
                  Aptitude Assessment
                </CardTitle>
                <CardDescription className="text-lg">
                  Discover your strengths, interests, and potential career paths
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">What to expect:</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• {questions.length} carefully crafted questions</li>
                    <li>• 60 seconds per question</li>
                    <li>• Covers interests, personality, and career preferences</li>
                    <li>• Takes approximately 5-10 minutes</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Benefits:</h3>
                  <ul className="text-green-800 space-y-1 text-sm">
                    <li>• Personalized career recommendations</li>
                    <li>• Stream suggestions based on your strengths</li>
                    <li>• College and program recommendations</li>
                    <li>• Detailed analysis of your interests</li>
                  </ul>
                </div>

                <Button size="lg" className="w-full" onClick={startQuiz}>
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">PathNiti</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Progress value={progress} className="h-2" {...({} as any)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {currentQuestion.question_text}
              </CardTitle>
              <CardDescription>
                Category: {currentQuestion.category.replace("_", " ").toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                      selectedAnswer === index
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        selectedAnswer === index
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                >
                  {currentQuestionIndex === questions.length - 1 ? "Complete Quiz" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
