'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { PathNitiLogo } from '@/components/PathNitiLogo';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  User, 
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface DynamicHeaderProps {
  showNavigation?: boolean;
  showUserActions?: boolean;
  className?: string;
}

export function DynamicHeader({ 
  showNavigation = true,
  showUserActions = true,
  className = ''
}: DynamicHeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Single unified header that adapts to context
  return (
    <header className={`bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'shadow-lg bg-white/98' : ''
    } ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="hover:opacity-80 transition-all duration-300 hover:scale-105">
              <PathNitiLogo size="md" showText={true} variant="horizontal" />
            </Link>
            
            {showNavigation && (
              <nav className="hidden md:flex items-center space-x-1">
                <Link href="/" className="px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-100/60 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium relative group">
                  <Home className="w-4 h-4" />
                  Home
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <Link href="/comprehensive-assessment" className="px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-100/60 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium relative group">
                  <BookOpen className="w-4 h-4" />
                  Assessment
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <Link href="/colleges" className="px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-100/60 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium relative group">
                  <GraduationCap className="w-4 h-4" />
                  Colleges
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <Link href="/scholarships" className="px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-100/60 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium relative group">
                  <MapPin className="w-4 h-4" />
                  Scholarships
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <Link href="/chat" className="px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-100/60 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium relative group">
                  <MessageCircle className="w-4 h-4" />
                  AI Chat
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
                </Link>
              </nav>
            )}
          </div>

          {/* Right side actions */}
          {showUserActions && (
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
              </Button>

              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>

                  {/* User Dropdown */}
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-2 hover:bg-gray-100/60"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden sm:inline text-sm font-medium text-gray-700">
                        {profile?.full_name || 'User'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>

                    {/* Dropdown Menu */}
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        
                        <Link 
                          href="/dashboard/student" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        
                        <Link 
                          href="/settings" 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        
                        <hr className="my-2" />
                        
                        <button 
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login" className="flex items-center gap-2 font-medium">
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200" asChild>
                    <Link href="/auth/signup" className="flex items-center gap-2 font-medium">
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && showNavigation && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md animate-slide-in-from-top">
            <nav className="px-4 py-4 space-y-1">
              <Link 
                href="/" 
                className="block px-4 py-3 text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              <Link 
                href="/comprehensive-assessment" 
                className="block px-4 py-3 text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                Assessment
              </Link>
              <Link 
                href="/colleges" 
                className="block px-4 py-3 text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <GraduationCap className="w-5 h-5" />
                Colleges
              </Link>
              <Link 
                href="/scholarships" 
                className="block px-4 py-3 text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MapPin className="w-5 h-5" />
                Scholarships
              </Link>
              <Link 
                href="/chat" 
                className="block px-4 py-3 text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle className="w-5 h-5" />
                AI Chat
              </Link>
              
              {/* Mobile user actions */}
              {user ? (
                <div className="pt-4 mt-4 border-t border-gray-200/50 space-y-1">
                  <Link 
                    href="/dashboard/student" 
                    className="block px-4 py-3 text-gray-600 hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-gray-200/50 space-y-2">
                  <Link 
                    href="/auth/login" 
                    className="block px-4 py-3 text-center text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// Simple alias for easier usage
export function Header(props: DynamicHeaderProps) {
  return <DynamicHeader {...props} />;
}

export default DynamicHeader;
