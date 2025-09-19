"use client"

import { useAuth } from "@/app/providers"

export default function AuthDebug() {
  const { user, session, profile, loading } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="mb-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">🐛 Auth Debug (Dev Only)</h3>
      <div className="text-xs space-y-1">
        <div>
          <strong>Loading:</strong> {loading ? 'true' : 'false'}
        </div>
        <div>
          <strong>User:</strong> {user ? `${user.id} (${user.email})` : 'null'}
        </div>
        <div>
          <strong>Session:</strong> {session ? `Expires: ${new Date(session.expires_at! * 1000).toLocaleString()}` : 'null'}
        </div>
        <div>
          <strong>Profile:</strong> {profile ? `${profile.first_name} ${profile.last_name} (${profile.role})` : 'null'}
        </div>
        <div>
          <strong>Cookies:</strong> {typeof window !== 'undefined' ? document.cookie.split(';').filter(c => c.includes('supabase')).length : 'N/A'} auth cookies
        </div>
      </div>
    </div>
  )
}