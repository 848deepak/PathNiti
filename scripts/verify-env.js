#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * This script checks if your Supabase environment variables are properly formatted
 */

require('dotenv').config({ path: '.env.local' })

function verifyEnvironment() {
  console.log('🔍 Verifying Environment Variables...')
  console.log('=====================================\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  let hasErrors = false

  // Check if variables exist
  console.log('📋 Checking if variables exist:')
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Present' : '❌ Missing'}`)
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Present' : '❌ Missing'}`)
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Present' : '❌ Missing'}\n`)

  if (!supabaseUrl || !supabaseAnonKey) {
    hasErrors = true
    console.log('❌ Missing required environment variables!')
    return
  }

  // Check URL format
  console.log('🔗 Checking URL format:')
  if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
    console.log('✅ URL format is correct')
    console.log(`   URL: ${supabaseUrl}`)
  } else {
    console.log('❌ URL format is incorrect')
    console.log(`   Current: ${supabaseUrl}`)
    console.log('   Expected: https://your-project-id.supabase.co')
    hasErrors = true
  }

  // Check anon key format
  console.log('\n🔑 Checking anon key format:')
  if (supabaseAnonKey.startsWith('eyJ')) {
    console.log('✅ Anon key format is correct')
    console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`)
  } else {
    console.log('❌ Anon key format is incorrect')
    console.log('   Expected: Should start with "eyJ"')
    hasErrors = true
  }

  // Check service key format (if present)
  if (supabaseServiceKey) {
    console.log('\n🔐 Checking service key format:')
    if (supabaseServiceKey.startsWith('eyJ')) {
      console.log('✅ Service key format is correct')
      console.log(`   Key: ${supabaseServiceKey.substring(0, 20)}...`)
    } else {
      console.log('❌ Service key format is incorrect')
      console.log('   Expected: Should start with "eyJ"')
      hasErrors = true
    }
  }

  console.log('\n' + '='.repeat(50))
  
  if (hasErrors) {
    console.log('❌ ERRORS FOUND! Please fix the issues above.')
    console.log('\n💡 How to fix:')
    console.log('1. Go to https://app.supabase.com')
    console.log('2. Select your project')
    console.log('3. Go to Settings → API')
    console.log('4. Copy the correct values to your .env.local file')
  } else {
    console.log('✅ All environment variables are correctly formatted!')
    console.log('🚀 Your Supabase configuration should work properly.')
  }
}

// Test URL construction
function testUrlConstruction() {
  console.log('\n🧪 Testing URL Construction...')
  console.log('===============================')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  try {
    new URL(supabaseUrl)
    console.log('✅ URL construction successful')
    
    // Test auth redirect URL
    const redirectUrl = `${window?.location?.origin || 'http://localhost:3000'}/auth/callback`
    new URL(redirectUrl)
    console.log('✅ Redirect URL construction successful')
    
  } catch (error) {
    console.log('❌ URL construction failed:', error.message)
    console.log('🔧 This is likely the cause of your "Invalid URL" error')
  }
}

verifyEnvironment()
testUrlConstruction()