"use client";

import { useAuth } from "@/app/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthDebug() {
  const { user, session, profile, loading } = useAuth();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-white/95 backdrop-blur-sm border-2 border-blue-200 shadow-lg z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-blue-800">Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="font-medium">Loading:</span>
          <span className={loading ? "text-orange-600" : "text-green-600"}>
            {loading ? "Yes" : "No"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">User:</span>
          <span className={user ? "text-green-600" : "text-red-600"}>
            {user ? "✓" : "✗"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Session:</span>
          <span className={session ? "text-green-600" : "text-red-600"}>
            {session ? "✓" : "✗"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Profile:</span>
          <span className={profile ? "text-green-600" : "text-red-600"}>
            {profile ? "✓" : "✗"}
          </span>
        </div>
        {user && (
          <div className="flex justify-between">
            <span className="font-medium">Email:</span>
            <span className="text-gray-600 truncate max-w-32">
              {user.email}
            </span>
          </div>
        )}
        {profile && (
          <div className="flex justify-between">
            <span className="font-medium">Role:</span>
            <span className="text-blue-600 font-medium">
              {profile.role}
            </span>
          </div>
        )}
        {session && (
          <div className="flex justify-between">
            <span className="font-medium">Expires:</span>
            <span className="text-gray-600">
              {new Date(session.expires_at! * 1000).toLocaleTimeString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}