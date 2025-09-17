#!/usr/bin/env node

/**
 * Supabase Authentication Test Script
 * This script tests the current authentication flow
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'present' : 'missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'present' : 'missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('🔧 Testing Supabase Authentication...')
  console.log('📍 Supabase URL:', supabaseUrl)
  
  // Test basic connection
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('❌ Error getting session:', error.message)
    } else {
      console.log('✅ Supabase connection successful')
      console.log('📊 Current session:', data.session ? 'Active' : 'None')
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return
  }

  // Test auth configuration
  console.log('\\n🔐 Testing auth configuration...')
  
  // Try to sign up with a test email to see the flow
  const testEmail = 'test-' + Date.now() + '@gmail.com'  // Use gmail.com for testing
  const testPassword = 'TestPassword123!@#'  // Strong password with all required characters
  
  console.log('📧 Testing signup with:', testEmail)
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          role: 'student'
        }
      }
    })
    
    if (error) {
      console.error('❌ Signup error:', error.message)
    } else {
      console.log('✅ Signup successful!')
      console.log('👤 User ID:', data.user?.id)
      console.log('📧 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
      console.log('🔑 Session:', data.session ? 'Created' : 'Not created (email confirmation required)')
      
      if (!data.session) {
        console.log('\\n📬 Email confirmation is required. Check your Supabase auth settings:')
        console.log('   1. Go to your Supabase dashboard')
        console.log('   2. Navigate to Authentication → Settings')
        console.log('   3. Check if "Confirm email" is enabled')
        console.log('   4. If enabled, users must click the email link before they can sign in')
      }
    }
  } catch (error) {
    console.error('❌ Signup test failed:', error.message)
  }
  
  console.log('\\n✅ Authentication test completed')
}

testAuth().catch(console.error)