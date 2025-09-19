"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
// import { SearchableSelect } from "@/components/ui/searchable-select"
import { FormErrorDisplay, FieldError, SessionRecoveryBanner, ValidationSummary } from "@/components/ui/form-error-display"
import { Building, Mail, Lock, Eye, EyeOff, User, ArrowLeft, Phone, Briefcase, Plus, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "../../../providers"
import { PathNitiLogo } from "@/components/PathNitiLogo"
import { createBrowserClient as createClient } from "@/lib/supabase"
import { signupSessionManager } from "@/lib/services/signup-session"
import { useDebounce } from "@/hooks/useDebounce"
import { useFormValidation } from "@/hooks/useFormValidation"
import { ErrorRecoveryManager } from "@/lib/utils/error-recovery"
import { useCollegeLazyLoader } from "@/lib/utils/lazy-loading"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface College {
  id: string
  name: string
  location: {
    state: string
    city: string
  }
}

function CollegeSignupPageContent() {
  // Initialize form validation hook
  const {
    formState,
    validationState,
    isSubmitting,
    submitError,
    sessionRecoveryAvailable,
    isFormValid,
    hasErrors,
    hasWarnings,
    updateField,
    handleFieldBlur,
    getFieldProps,
    getFormData,
    handleSubmit,
    resetForm,
    restoreFromSession,
    validateForm
  } = useFormValidation({}, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
    enableSessionRecovery: true
  })

  const [colleges, setColleges] = useState<College[]>([])
  const [filteredColleges, setFilteredColleges] = useState<College[]>([])
  const [collegeSearch, setCollegeSearch] = useState("")
  const debouncedSearch = useDebounce(collegeSearch, 300)
  const { loadColleges, searchColleges, invalidateCache } = useCollegeLazyLoader({
    pageSize: 100, // Load more colleges initially for better UX
    cacheTimeout: 10 * 60 * 1000 // 10 minutes cache
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loadingColleges, setLoadingColleges] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showNewCollegeSuccess, setShowNewCollegeSuccess] = useState(false)
  const [showSessionRecovery, setShowSessionRecovery] = useState(false)
  const [recoveryActions, setRecoveryActions] = useState<any[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUpCollege, signInWithOAuth, loading } = useAuth()

  // Check for session recovery on mount
  useEffect(() => {
    const recoveryInfo = signupSessionManager.getRecoveryInfo()
    if (recoveryInfo.hasRecoverableData) {
      setShowSessionRecovery(true)
    }
  }, [])

  useEffect(() => {
    fetchColleges()
    handleCollegeRegistrationReturn()

    // Listen for window focus to detect return from college registration
    const handleWindowFocus = () => {
      // Check if we should refresh colleges list
      const sessionData = signupSessionManager.getSession()
      if (sessionData?.step === 'college-registration') {
        // Refresh colleges list in case a new one was added
        fetchColleges()
        // Check URL parameters for success
        handleCollegeRegistrationReturn()
      }
    }

    window.addEventListener('focus', handleWindowFocus)
    return () => window.removeEventListener('focus', handleWindowFocus)
  }, [])

  useEffect(() => {
    // Use lazy loading for search
    const performSearch = async () => {
      if (debouncedSearch.trim() === "") {
        setFilteredColleges(colleges)
      } else {
        try {
          const result = await searchColleges(debouncedSearch, {}, true) // Use cache
          setFilteredColleges(result.data || [])
        } catch (error) {
          console.error('Error searching colleges:', error)
          // Fall back to client-side filtering
          const filtered = colleges.filter(college =>
            college.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            college.location.city.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            college.location.state.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
          setFilteredColleges(filtered)
        }
      }
    }

    performSearch()
  }, [colleges, debouncedSearch, searchColleges])

  // Auto-save form data to session (handled by useFormValidation hook)

  const fetchColleges = async () => {
    try {
      const result = await loadColleges({}, true) // Use cache
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setColleges(result.data || [])
      setFilteredColleges(result.data || [])
    } catch (error) {
      console.error('Error fetching colleges:', error)
      // Generate recovery actions for college loading errors
      const recovery = ErrorRecoveryManager.handleCollegeSelectionError(
        'Failed to load colleges. Please try again.'
      )
      setRecoveryActions(recovery)
    } finally {
      setLoadingColleges(false)
    }
  }

  // Handle session recovery
  const handleSessionRecovery = (restore: boolean) => {
    if (restore) {
      restoreFromSession()
    } else {
      signupSessionManager.clearSession()
    }
    setShowSessionRecovery(false)
  }

  const handleCollegeRegistrationReturn = () => {
    const collegeId = searchParams.get('collegeId')
    const collegeName = searchParams.get('collegeName')
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const errorMessage = searchParams.get('errorMessage')

    // Handle successful college registration return
    if (success === 'true' && collegeId && collegeName) {
      // Auto-select the newly registered college
      updateField('collegeId', collegeId)
      
      // Show success message with college name
      setShowNewCollegeSuccess(true)
      setTimeout(() => setShowNewCollegeSuccess(false), 8000)

      // Update session with the new college selection
      const currentFormData = signupSessionManager.getFormData() || {}
      signupSessionManager.saveFormData({
        ...currentFormData,
        collegeId: collegeId,
        collegeName: collegeName,
        isNewCollege: true,
        registrationSource: 'new'
      }, 'college-selection')

      // Invalidate cache and refresh colleges list to include the new college
      invalidateCache('colleges')
      fetchColleges()

      // Clear URL parameters
      clearUrlParameters()
    }
    
    // Handle college registration errors
    else if (error === 'true') {
      const displayError = errorMessage || 'College registration failed. Please try again.'
      
      // Generate recovery actions for college registration errors
      const recovery = ErrorRecoveryManager.handleCollegeSelectionError(displayError)
      setRecoveryActions(recovery)
      
      // Reset session step back to college selection
      signupSessionManager.setStep('college-selection')
      
      // Clear URL parameters
      clearUrlParameters()
    }
    
    // Handle case where user returned but registration was incomplete
    else if (searchParams.get('returned') === 'true') {
      // Check if there's session data indicating they were in registration flow
      const sessionData = signupSessionManager.getSession()
      if (sessionData?.step === 'college-registration') {
        // Generate recovery actions
        const recovery = ErrorRecoveryManager.handleCollegeSelectionError(
          'College registration was not completed. Please select an existing college or try registering again.'
        )
        setRecoveryActions(recovery)
        
        // Reset session step
        signupSessionManager.setStep('college-selection')
      }
      
      // Clear URL parameters
      clearUrlParameters()
    }
  }

  const clearUrlParameters = () => {
    const newUrl = window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }

  const handleRegisterNewCollege = () => {
    setIsRegistering(true)
    
    // Save current form data before navigating
    const currentFormData = getFormData()
    signupSessionManager.saveFormData(currentFormData, 'college-registration')

    // Navigate to college registration with return parameters
    const returnUrl = encodeURIComponent(window.location.href)
    const registrationUrl = `/colleges/register?source=signup&returnTo=${returnUrl}`
    
    // Navigate in the same window for better UX
    router.push(registrationUrl)
  }

  // Handle college selection change
  const handleCollegeChange = (value: string) => {
    updateField('collegeId', value)
    // Clear any college-related errors
    setRecoveryActions([])
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await handleSubmit(async (formData) => {
      const { data, error } = await signUpCollege(formData.email!, formData.password!, {
        first_name: formData.firstName!,
        last_name: formData.lastName!,
        phone: formData.phone!,
        college_id: formData.collegeId!,
        contact_person: formData.contactPerson!,
        designation: formData.designation!,
      })

      if (error) throw error

      if (data?.user) {
        setSuccess(true)
        // Redirect to college dashboard
        setTimeout(() => {
          router.push("/colleges/dashboard")
        }, 2000)
      }
    })
  }

  const handleGoogleSignup = async () => {
    try {
      const { error } = await signInWithOAuth("google")

      if (error) {
        // Handle specific error cases with recovery actions
        const recovery = ErrorRecoveryManager.handleSubmissionError(error, getFormData())
        setRecoveryActions(recovery.actions)
        
        if (error.message.includes('Invalid URL') || error.message.includes('URL')) {
          console.error('OAuth URL configuration error:', error)
        } else {
          throw error
        }
      }
    } catch (error: unknown) {
      console.error('Google OAuth error:', error)
      const recovery = ErrorRecoveryManager.handleSubmissionError(error as Error, getFormData())
      setRecoveryActions(recovery.actions)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">
              Please check your email to verify your account. You&apos;ll be redirected to your college dashboard.
            </p>
            <Button asChild>
              <Link href="/colleges/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <PathNitiLogo size="lg" showText={true} variant="horizontal" />
          </Link>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/auth/signup/role-selection">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Role Selection
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create College Account</CardTitle>
            <CardDescription>
              Join PathNiti as a college representative to manage your institution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Session Recovery Banner */}
            {showSessionRecovery && (
              <SessionRecoveryBanner
                onRestore={() => handleSessionRecovery(true)}
                onDismiss={() => handleSessionRecovery(false)}
                sessionAge={signupSessionManager.getRecoveryInfo().sessionAge}
                className="mb-4"
              />
            )}

            {/* Form-level Error Display */}
            {submitError && (
              <FormErrorDisplay
                error={submitError}
                recoveryActions={recoveryActions}
                variant="card"
                className="mb-4"
              />
            )}

            {/* Validation Summary */}
            {hasErrors && validationState && (
              <ValidationSummary
                errors={Object.entries(validationState)
                  .filter(([key, validation]) => key !== 'overall' && validation.error)
                  .map(([_, validation]) => validation.error!)}
                warnings={Object.entries(validationState)
                  .filter(([key, validation]) => key !== 'overall' && validation.warnings?.length)
                  .flatMap(([_, validation]) => validation.warnings!)}
                className="mb-4"
              />
            )}

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="First name"
                      {...getFieldProps('firstName')}
                      className={`pl-10 ${formState.firstName?.error ? 'border-red-300 focus:border-red-500' : ''}`}
                      required
                    />
                  </div>
                  <FieldError 
                    error={formState.firstName?.error} 
                    warnings={formState.firstName?.warnings}
                    fieldName="firstName" 
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      {...getFieldProps('lastName')}
                      className={`pl-10 ${formState.lastName?.error ? 'border-red-300 focus:border-red-500' : ''}`}
                      required
                    />
                  </div>
                  <FieldError 
                    error={formState.lastName?.error} 
                    warnings={formState.lastName?.warnings}
                    fieldName="lastName" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    {...getFieldProps('email')}
                    className={`pl-10 ${formState.email?.error ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                </div>
                <FieldError 
                  error={formState.email?.error} 
                  warnings={formState.email?.warnings}
                  fieldName="email" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="collegeId" className="text-sm font-medium">
                  College
                </label>
                
                {/* Enhanced College Selection with Search and Keyboard Navigation */}
                {/* Temporarily commented out to fix build issue */}
                {/*
                <SearchableSelect
                  options={filteredColleges}
                  value={formState.collegeId?.value || ''}
                  onChange={handleCollegeChange}
                  onSearch={setCollegeSearch}
                  searchQuery={collegeSearch}
                  placeholder="Select your college"
                  searchPlaceholder="Search colleges by name or location..."
                  loading={loadingColleges}
                  onRegisterNew={handleRegisterNewCollege}
                  registerNewText={isRegistering ? "Redirecting..." : "Register New College"}
                  noResultsText={
                    debouncedSearch.trim() !== "" 
                      ? `No colleges found matching "${debouncedSearch}"`
                      : "No colleges available"
                  }
                  className={`w-full ${formState.collegeId?.error ? 'border-red-300' : ''}`}
                />
                */}
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-600">College selection temporarily disabled for build fix</p>
                </div>
                <FieldError 
                  error={formState.collegeId?.error} 
                  warnings={formState.collegeId?.warnings}
                  fieldName="collegeId" 
                />

                {/* Success message for newly registered college */}
                {showNewCollegeSuccess && (
                  <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-green-800 font-medium mb-1">
                          College registered successfully!
                        </p>
                        <p className="text-xs text-green-700">
                          {searchParams.get('collegeName') && (
                            <>"{searchParams.get('collegeName')}" has been pre-selected. </>
                          )}
                          You can now complete your account creation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="contactPerson" className="text-sm font-medium">
                  Contact Person Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    type="text"
                    placeholder="Full name of contact person"
                    {...getFieldProps('contactPerson')}
                    className={`pl-10 ${formState.contactPerson?.error ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                </div>
                <FieldError 
                  error={formState.contactPerson?.error} 
                  warnings={formState.contactPerson?.warnings}
                  fieldName="contactPerson" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="designation" className="text-sm font-medium">
                  Designation
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="designation"
                    name="designation"
                    type="text"
                    placeholder="e.g., Admission Officer, Registrar"
                    {...getFieldProps('designation')}
                    className={`pl-10 ${formState.designation?.error ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                </div>
                <FieldError 
                  error={formState.designation?.error} 
                  warnings={formState.designation?.warnings}
                  fieldName="designation" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    {...getFieldProps('phone')}
                    className={`pl-10 ${formState.phone?.error ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                </div>
                <FieldError 
                  error={formState.phone?.error} 
                  warnings={formState.phone?.warnings}
                  fieldName="phone" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    {...getFieldProps('password')}
                    className={`pl-10 pr-10 ${formState.password?.error ? 'border-red-300 focus:border-red-500' : ''}`}
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
                <FieldError 
                  error={formState.password?.error} 
                  warnings={formState.password?.warnings}
                  fieldName="password" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...getFieldProps('confirmPassword')}
                    className={`pl-10 pr-10 ${formState.confirmPassword?.error ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <FieldError 
                  error={formState.confirmPassword?.error} 
                  warnings={formState.confirmPassword?.warnings}
                  fieldName="confirmPassword" 
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || loadingColleges || isRegistering || isSubmitting || !isFormValid}
              >
                {isSubmitting ? "Creating Account..." : 
                 loading ? "Creating Account..." : 
                 isRegistering ? "Redirecting to Registration..." :
                 "Create College Account"}
              </Button>

              {/* Form validation status */}
              {!isFormValid && hasErrors && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>Please fix the errors above to continue</span>
                  </p>
                </div>
              )}
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
              onClick={handleGoogleSignup}
              disabled={loading || isRegistering}
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
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CollegeSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CollegeSignupPageContent />
    </Suspense>
  )
}
