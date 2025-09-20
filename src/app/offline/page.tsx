"use client";

import { Button } from "@/components/ui";
import {
  WifiOff,
  RefreshCw,
  Home,
  Brain,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="h-10 w-10 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re Offline
          </h1>

          <p className="text-gray-600 mb-6">
            It looks like you&apos;re not connected to the internet. Don&apos;t
            worry, you can still access some features of PathNiti.
          </p>

          {/* Available Offline Features */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              Available Offline:
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center justify-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Quiz (if previously loaded)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>College Directory (cached)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Timeline (cached)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
          </div>

          {/* Tips */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Tips for Offline Use:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• Some features work offline</li>
              <li>• Data will sync when online</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            PathNiti - Your Path. Your Future. Simplified.
          </p>
        </div>
      </div>
    </div>
  );
}
