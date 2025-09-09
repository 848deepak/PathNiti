"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib"
import { Card, CardContent } from "@/components/ui"
import { GraduationCap } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (data.session?.user) {
          // Check if user has completed profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single()

          if (profile) {
            router.push("/dashboard")
          } else {
            router.push("/auth/complete-profile")
          }
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        router.push("/auth/login?error=callback_error")
      }
    }

    handleAuthCallback()
  }, [router])

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
