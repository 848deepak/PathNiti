#!/usr/bin/env node

/**
 * Supabase Email Configuration Checker
 * This script checks if email sending is properly configured
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkEmailConfig() {
  console.log('📧 Checking Supabase Email Configuration...')
  console.log('🔗 Project URL:', supabaseUrl)
  
  // Test signup to trigger email sending
  const testEmail = `test-${Date.now()}@gmail.com`
  const testPassword = 'TestPassword123!@#'
  
  console.log(`\n🧪 Testing email sending with: ${testEmail}`)
  
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
      console.error('❌ Signup failed:', error.message)
      return
    }
    
    console.log('✅ Signup API call successful!')
    console.log('👤 User created:', data.user?.id)
    console.log('📧 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
    console.log('🔑 Session created:', data.session ? 'Yes' : 'No (email confirmation required)')
    
    if (!data.session) {
      console.log('\n📬 Email should be sent for confirmation.')
      console.log('⚠️  If you don\'t receive the email, check:')
      console.log('   1. Spam/Junk folder')
      console.log('   2. Supabase email settings in dashboard')
      console.log('   3. SMTP configuration in Supabase')
      console.log('   4. Email provider restrictions')
    }
    
  } catch (error) {
    console.error('❌ Error during signup:', error.message)
  }
  
  console.log('\n🔧 Next steps to check email configuration:')
  console.log('   1. Go to your Supabase dashboard')
  console.log('   2. Navigate to Authentication → Settings')
  console.log('   3. Check "Email" section')
  console.log('   4. Verify SMTP settings or use Supabase\'s built-in email')
}

checkEmailConfig().catch(console.error)