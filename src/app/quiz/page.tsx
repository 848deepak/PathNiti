"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui"
import { supabase, useAuth } from "@/lib"
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
  const { user } = useAuth()
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    fetchQuestions()
  }, [user, router])

  const handleNextQuestion = () => {
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
  }

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
      // For demo purposes, we'll use sample questions
      // In production, this would fetch from the database
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

  const completeQuiz = async () => {
    try {
      if (!user) return

      // Save quiz session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: sessionError } = await (supabase as any)
        .from("quiz_sessions")
        .insert({
          user_id: user.id,
          status: "completed",
          completed_at: new Date().toISOString(),
          total_score: Object.keys(answers).length,
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Save individual responses
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        user_id: user.id,
        question_id: questionId,
        selected_answer: answer,
        time_taken: 60 - timeLeft,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: responsesError } = await (supabase as any)
        .from("quiz_responses")
        .insert(responses)

      if (responsesError) throw responsesError

      setQuizCompleted(true)
    } catch (error) {
      console.error("Error completing quiz:", error)
    }
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

  if (!user) {
    return null
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for completing the aptitude assessment. Your results are being analyzed.
            </p>
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/results">View Results</Link>
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
            <span className="text-2xl font-bold text-primary">EduNiti</span>
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
