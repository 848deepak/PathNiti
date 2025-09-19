"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../providers"
import { supabase } from "@/lib/supabase"
import { DynamicHeader } from "@/components/DynamicHeader"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const { signIn, signInWithOAuth, loading } = useAuth()

  // Prevent hydration mismatch by ensuring component is mounted
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    try {
      // Build redirect URL with robust fallbacks
      let redirectTo: string
      
      if (typeof window !== 'undefined') {
        // Client-side: use current origin
        try {
          redirectTo = `${window.location.origin}/auth/callback`
        } catch (error) {
          console.warn('Failed to get window.location.origin:', error)
          redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
        }
      } else {
        // Server-side: use environment variable
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        if (!appUrl) {
          console.warn('NEXT_PUBLIC_APP_URL not set, using localhost')
          redirectTo = 'http://localhost:3000/auth/callback'
        } else {
          redirectTo = `${appUrl}/auth/callback`
        }
      }
      
      console.log('Resend confirmation redirect URL:', redirectTo)
        
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectTo
        }
      })

      if (error) throw error

      setError('')
      setShowResendConfirmation(false)
      alert('Confirmation email sent! Please check your inbox.')
    } catch (error: unknown) {
      console.error('Resend confirmation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to resend confirmation email')
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
          setShowResendConfirmation(true)
          return
        }
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and ensure your email is verified.')
          setShowResendConfirmation(true)
          return
        }
        if (error.message.includes('Invalid URL')) {
          setError('Configuration error. Please contact support.')
          console.error('URL configuration error:', error)
          return
        }
        throw error
      }

      // Check if user is authenticated
      if (data?.user) {
        // User is authenticated, redirect to home page
        router.push("/")
      } else {
        setError('Authentication failed. Please try again.')
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      if (error instanceof Error && error.message.includes('URL')) {
        setError('Configuration error. Please refresh the page and try again.')
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred')
      }
    }
  }

  const handleGoogleLogin = async () => {
    setError("")

    try {
      const { error } = await signInWithOAuth("google")

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid URL') || error.message.includes('URL')) {
          setError('Configuration error. Please try again or contact support if the issue persists.')
          console.error('OAuth URL configuration error:', error)
        } else {
          throw error
        }
      }
    } catch (error: unknown) {
      console.error('Google OAuth error:', error)
      if (error instanceof Error && error.message.includes('URL')) {
        setError('Configuration error. Please refresh the page and try again.')
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <DynamicHeader variant="auth" />
      
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue your career journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
                {showResendConfirmation && (
                  <div className="mt-3 pt-2 border-t border-red-200">
                    <p className="text-xs text-gray-600 mb-2">
                      Haven't received the confirmation email?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      Resend Confirmation Email
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={!isMounted || loading}>
                {!isMounted ? "Loading..." : (loading ? "Signing in..." : "Sign In")}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={!isMounted || loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-left">
            <h4 className="text-sm font-medium text-blue-900 mb-2">📧 Email Confirmation Required</h4>
            <p className="text-xs text-blue-700">
              For security, you must confirm your email before signing in. Check your inbox for a confirmation link after signing up.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
