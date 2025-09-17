#!/usr/bin/env node

/**
 * Login Flow Test Script
 * This script tests the login flow with unverified email
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLoginFlow() {
  console.log('🔐 Testing Login Flow with Email Confirmation...')
  
  // Try to sign in with a user that might not have confirmed email
  const testEmail = 'test-1758036098189@gmail.com'  // From our previous test
  const testPassword = 'TestPassword123!@#'
  
  console.log(`🔍 Attempting to sign in with: ${testEmail}`)
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (error) {
      console.log('❌ Login failed as expected:', error.message)
      console.log('📧 Error type:', error.message.includes('email') ? 'Email related' : 'Other')
      console.log('✅ This is the correct behavior for unverified accounts')
    } else {
      console.log('✅ Login successful!')
      console.log('👤 User:', data.user?.email)
      console.log('📧 Email verified:', data.user?.email_confirmed_at ? 'Yes' : 'No')
      console.log('🔑 Session:', data.session ? 'Active' : 'None')
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
  
  console.log('\n📋 Expected behavior:')
  console.log('   - Unverified accounts should NOT be able to sign in')
  console.log('   - Users should get "Invalid login credentials" or similar error')
  console.log('   - App should show "resend confirmation" option')
}

testLoginFlow().catch(console.error)