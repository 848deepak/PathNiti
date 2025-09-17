"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui"
import { GraduationCap } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Use getUser() to force fetch fresh user data after email verification
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error("Auth callback error:", userError)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (user) {
          console.log("User authenticated:", user.id, user.email)
          
          // Check if user has completed profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected for new users
            console.error("Error checking profile:", profileError)
            router.push("/auth/login?error=profile_check_error")
            return
          }

          if (profile) {
            console.log("Profile found, redirecting to dashboard")
            router.push("/")
          } else {
            // Profile doesn't exist, try to create it automatically
            console.log("Profile not found, attempting to create profile for user:", user.id)
            
            try {
              // Get user metadata from signup
              const userData = user.user_metadata || {}
              
              // Determine role from metadata or default to student
              const role = userData.role || 'student'
              
              const profileData = {
                id: user.id,
                email: user.email!,
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                phone: userData.phone || null,
                role: role
              }

              console.log('Creating profile for authenticated user:', user.id, 'with role:', role)
              
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert(profileData)
                .select()
                .single()

              if (createError) {
                console.error('Error creating profile:', createError)
                // Still redirect to complete-profile page so user can manually complete
                router.push("/auth/complete-profile")
                return
              }

              console.log('Profile created successfully:', newProfile)
              router.push("/")
            } catch (createError) {
              console.error('Error in profile creation:', createError)
              // Still redirect to complete-profile page so user can manually complete
              router.push("/auth/complete-profile")
            }
          }
        } else {
          console.log("No user found, redirecting to login")
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        router.push("/auth/login?error=callback_error")
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing you in...</h2>
          <p className="text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
